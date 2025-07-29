import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;
const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['polling', 'websocket'],
});

socket.on('connect_error', err => {
  console.error('Socket connection error', err);
});
socket.on('reconnect_failed', () => {
  console.error('Socket reconnect failed');
});

export default function RoomPage() {
  const router = useRouter();
  const { code } = router.query;
  const isReady = router.isReady;
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);

  // Listen for room updates
  useEffect(() => {
    if (!router.isReady || !code) return;

    const handleRoomUsers = (users: string[]) => {
      console.log('👥 Updated users in room:', users);
      setUsers(users);
      console.log(`how many users in the room : ${users.length}`)
    };

    socket.on('room-users', handleRoomUsers);

    return () => {
      socket.off('room-users', handleRoomUsers);
    };
  }, [router.isReady, code]);

  // everything with the button:
  useEffect(() => {
    if (!joined || !code) return;

    const handleGameStarted = () => {
      console.log(`🚀 Game started! Redirecting all players...`);
      router.push(`/game/${code}`);
    };

    socket.on('game-started', handleGameStarted);

    return () => {
      socket.off('game-started', handleGameStarted);
    };
  }, [joined, code]);

  const handleJoin = () => {
    if (!isReady || !code || !username.trim()) return;

    socket.connect();

    socket.once('connect', () => {
      console.log('✅ Connected, now joining room...');
      socket.emit('join-room', { code, username: username.trim() });
      setJoined(true);
    });
  };

  return (
    <div className="">
      <h2 className="">Room: {code}</h2>

      {!joined ? (
        <>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className=""
          />
          <button onClick={handleJoin} className="">
            Join
          </button>
        </>
      ) : (
        <>
          <h2>Welcome to room {code}!</h2>
          <h3 className="">Players in this room:</h3>
          <ul className="">
            {users.map((user, idx) => (
              <li key={idx}>{user}</li>
            ))}
          </ul>
          <button
            onClick={() => {
              if(users.length < 2){
                alert("at least 2 players are required to start the game");
                return;
              }
              if(users.length > 6){
                alert("can't start game with more than 6 players");
                return;
              }
              console.log('emitting start game for room', code)
              socket.emit('start-game', { code });
            }}
            disabled={users.length < 2 || users.length > 6}
          >
            Start Game
          </button>
        </>
      )}
    </div>
  );
}
