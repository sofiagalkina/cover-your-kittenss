import { useState } from 'react';
import { useRouter } from 'next/router';
import Particle from "../components/Particle";

export default function Home() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    if (code.trim()) {
      router.push(`/room/${code}`);
    }
  };

  return (
    
    <div className="">
      <Particle/>
     <div>
      <h1 className="">Welcome to Cover Your Kittens!</h1>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className=""
      />
      <button onClick={handleJoin} className="">Join Room</button>
      </div>
    </div>
  );
}