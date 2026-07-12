'use client';
import { useState, useEffect } from 'react';

export default function PageClientView() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>App Loaded</h1>
      <p>If you see this, the component is working.</p>
    </div>
  );
}