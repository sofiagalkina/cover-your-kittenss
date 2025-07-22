import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function GamePage() {
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    console.log(`🎮 Entered game room with code: ${code}`);
    // You can now load game state, setup socket listeners, etc.
  }, [router.isReady, code]);

  return (
    <div className="text-center p-4">
      <h1 className="text-2xl font-bold">Game Room: {code}</h1>
      <p>Game content will go here...</p>
    </div>
  );
}
