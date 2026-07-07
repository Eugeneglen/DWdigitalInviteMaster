'use client';

import { useMemo } from 'react';

const styles = `
  .gd-particle {
    background: radial-gradient(circle, rgb(212,175,55) 0%, rgb(245,230,173) 60%, transparent 100%);
    animation: gdRise var(--gd-dur,18s) linear var(--gd-delay,0s) infinite,
               gdSway var(--gd-dur,18s) ease-in-out var(--gd-delay,0s) infinite;
  }
  @keyframes gdRise {
    0%   { opacity: var(--gd-op-start,0); transform: translateY(0); }
    8%   { opacity: 1; }
    85%  { opacity: 1; }
    100% { opacity: 0; transform: translateY(-105vh); }
  }
  @keyframes gdSway {
    0%   { margin-left: 0; }
    25%  { margin-left: var(--gd-sway,12px); }
    50%  { margin-left: calc(var(--gd-sway,12px) * -0.5); }
    75%  { margin-left: var(--gd-sway,12px); }
    100% { margin-left: 0; }
  }

`;

/**
 * Ambient gold dust particles.
 * Purely decorative, pointer-events-none, sits behind all interactive elements.
 */
export default function GoldDust() {
  const particles = useMemo(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      left: `${(i * 5.5 + 2) % 100}%`,
      size: 2 + (i % 4),
      duration: 16 + (i % 8) * 2,
      delay: (i * 1.7) % 12,
      sway: 8 + (i % 3) * 6,
      opacity: 0.3 + (i % 3) * 0.2,
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {particles.map((p, i) => (
        <div
          key={i}
          className="gd-particle"
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--gd-dur': `${p.duration}s`,
            '--gd-delay': `${p.delay}s`,
            '--gd-sway': `${p.sway}px`,
            '--gd-op-start': '0',
            opacity: p.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}