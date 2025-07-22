import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';


const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!
const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['polling', 'websocket'],   // skip polling to simplify CORS
});

socket.on('connect_error', err => {
  console.error('Socket connection error', err)
})
socket.on('reconnect_failed', () => {
  console.error('Socket reconnect failed')
})


export default function RoomPage() {
  const router = useRouter();
  const { code } = router.query;
  const isReady = router.isReady;
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);

    useEffect(() => {
        
    if (!router.isReady || !code) return;

    socket.on('room-users', (users: string[]) => {
        console.log('👥 Updated users in room:', users);
        setUsers(users);
    });

    return () => {
        socket.off('room-users');
    };
    }, [router.isReady, code]);


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
          <button onClick={handleJoin} className="">Join</button>
        </>
      ) : (
        <>
          <h3 className="">Users in Room:</h3>
          <ul className="">
            {users.map((user, idx) => (
              <li key={idx}>{user}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
