import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

const socket = io('https://cover-your-kittenss-production.up.railway.app', {
  transports: ['websocket'], // ⬅️ force websocket only
  withCredentials: true,
  autoConnect: false,
});
export default function RoomPage() {
  const router = useRouter();
  const { code } = router.query;
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!code) return;

    socket.connect();

    socket.on('connect', () => {
      console.log('✅ Connected to socket:', socket.id);
    });

    socket.on('room-users', (users: string[]) => {
      console.log('👥 Updated users in room:', users);
      setUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [code]);

  const handleJoin = () => {
    if (username.trim()) {
      console.log('📤 Emitting join-room', { code, username });
      socket.emit('join-room', { code, username });
      setJoined(true);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Room: {code}</h2>

      {!joined ? (
        <>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={handleJoin} className="bg-green-500 text-white px-4 py-2">Join</button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold mt-6">Users in Room:</h3>
          <ul className="mt-2">
            {users.map((user, idx) => (
              <li key={idx}>{user}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
