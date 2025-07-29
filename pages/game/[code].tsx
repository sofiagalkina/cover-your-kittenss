import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { socket } from '../../lib/socket';

export default function GamePage() {
  const router = useRouter();
  const { code } = router.query;
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!router.isReady || !code) return;

    console.log(`🎮 Entered game room with code: ${code}`);

    if (!socket.connected) {
      socket.connect();
    }

    const handleRoomUsers = (users: string[]) => {
      console.log('📦 Received users in game:', users);
      setUsers(users);
    };

    socket.on('room-users', handleRoomUsers);

    // Optionally, request the latest users from the server
    socket.emit('get-room-users', { code });

    return () => {
      socket.off('room-users', handleRoomUsers);
    };
  }, [router.isReady, code]);

  return (
    <div className="text-center p-4">
      <h1 className="text-2xl font-bold">Game Room: {code}</h1>

      <h2 className="mt-4 text-lg">Players:</h2>
      <ul className="mt-2">
        {users.map((username, idx) => (
          <li key={idx} className="text-base">{username}</li>
        ))}
      </ul>
    </div>
  );
}
