'use client';

import { useMemo } from 'react';

interface BokehOrb {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  driftDuration: number;
  breathDuration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

export default function HeroBokeh() {
  const orbs = useMemo<BokehOrb[]>(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 49297;
      return x - Math.floor(x);
    };

    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${10 + seededRandom(i * 7 + 1) * 80}%`,
      top: `${10 + seededRandom(i * 3 + 2) * 80}%`,
      size: 50 + seededRandom(i * 5 + 3) * 100,
      opacity: 0.025 + seededRandom(i * 11 + 4) * 0.055,
      driftDuration: 20 + seededRandom(i * 13 + 5) * 15,
      breathDuration: 6 + seededRandom(i * 17 + 6) * 6,
      delay: seededRandom(i * 19 + 7) * -10,
      driftX: -30 + seededRandom(i * 23 + 8) * 60,
      driftY: -20 + seededRandom(i * 29 + 9) * 40,
    }));
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {orbs.map((orb) => (
        <span
          key={orb.id}
          className="absolute rounded-full bokeh-orb"
          style={{
            left: orb.left,
            top: orb.top,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            opacity: orb.opacity,
            '--bokeh-drift-dur': `${orb.driftDuration}s`,
            '--bokeh-breath-dur': `${orb.breathDuration}s`,
            '--bokeh-delay': `${orb.delay}s`,
            '--bokeh-drift-x': `${orb.driftX}px`,
            '--bokeh-drift-y': `${orb.driftY}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}