import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    if (code.trim()) {
      router.push(`/room/${code}`);
    }
  };

  return (
    <div className="p-8 text-center text-white ">
      <h1 className="text-4xl font-bold mb-6 ">Welcome to Cover Your Kittens!</h1>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border p-2 mr-2"
      />
      <button onClick={handleJoin} className="bg-blue-500 text-white px-4 py-2">Join Room</button>
    </div>
  );
}