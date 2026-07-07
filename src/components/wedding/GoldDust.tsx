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
  .gd-orb {
    background: radial-gradient(circle at 40% 40%, rgba(212,175,55,0.5) 0%, rgba(245,230,173,0.2) 40%, transparent 70%);
    filter: blur(30px);
    animation: gdDrift var(--gd-drift-dur,25s) ease-in-out var(--gd-delay,0s) infinite alternate,
               gdBreathe var(--gd-breath-dur,7s) ease-in-out var(--gd-delay,0s) infinite;
  }
  @keyframes gdDrift {
    0%   { transform: translate(0); }
    100% { transform: translate(var(--gd-drift-x,20px), var(--gd-drift-y,10px)); }
  }
  @keyframes gdBreathe {
    0%, 100% { opacity: inherit; transform: scale(1); }
    50%      { opacity: calc(var(--gd-peak,1) * 1.4); transform: scale(1.15); }
  }
`;

/**
 * Ambient gold dust particles + bokeh orbs.
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

  const bokehOrbs = useMemo(() =>
    Array.from({ length: 5 }).map((_, i) => ({
      left: `${15 + i * 18}%`,
      size: 80 + i * 30,
      driftDur: 22 + i * 5,
      breathDur: 6 + i * 2,
      delay: i * 4,
      driftX: 15 + i * 8,
      driftY: 8 + i * 5,
      opacity: 0.08 + i * 0.03,
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
      {bokehOrbs.map((b, i) => (
        <div
          key={`bokeh-${i}`}
          className="gd-orb"
          style={{
            position: 'absolute',
            bottom: `${10 + i * 15}%`,
            left: b.left,
            width: `${b.size}px`,
            height: `${b.size}px`,
            '--gd-drift-dur': `${b.driftDur}s`,
            '--gd-breath-dur': `${b.breathDur}s`,
            '--gd-delay': `${b.delay}s`,
            '--gd-drift-x': `${b.driftX}px`,
            '--gd-drift-y': `${b.driftY}px`,
            '--gd-peak': '1',
            opacity: b.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}