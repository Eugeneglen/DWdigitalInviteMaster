'use client';

import { useMemo } from 'react';

const DUST_COUNT = 33;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function GoldDustParticles() {
  const particles = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: DUST_COUNT }, () => {
      const size = rand() * 3 + 1.5;
      const duration = rand() * 12 + 12;
      const delay = -(rand() * duration);
      const sway = rand() * 14 + 4;
      return {
        left: `${rand() * 100}%`,
        bottom: '-4px',
        width: `${size}px`,
        height: `${size}px`,
        opacity: rand() * 0.12 + 0.03,
        style: {
          '--dust-duration': `${duration}s`,
          '--dust-delay': `${delay}s`,
          '--dust-sway': `${sway}px`,
          '--dust-opacity-start': '0',
        } as React.CSSProperties,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full gold-dust-particle"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.width,
            height: p.height,
            opacity: p.opacity,
            ...p.style,
          }}
        />
      ))}
    </div>
  );
}