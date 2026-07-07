'use client';

import { useMemo } from 'react';

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
      {particles.map((p, i) => (
        <div
          key={i}
          className="gold-dust-particle"
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--dust-duration': `${p.duration}s`,
            '--dust-delay': `${p.delay}s`,
            '--dust-sway': `${p.sway}px`,
            '--dust-opacity-start': '0',
            opacity: p.opacity,
          } as React.CSSProperties}
        />
      ))}
      {bokehOrbs.map((b, i) => (
        <div
          key={`bokeh-${i}`}
          className="bokeh-orb"
          style={{
            position: 'absolute',
            bottom: `${10 + i * 15}%`,
            left: b.left,
            width: `${b.size}px`,
            height: `${b.size}px`,
            '--bokeh-drift-dur': `${b.driftDur}s`,
            '--bokeh-breath-dur': `${b.breathDur}s`,
            '--bokeh-delay': `${b.delay}s`,
            '--bokeh-drift-x': `${b.driftX}px`,
            '--bokeh-drift-y': `${b.driftY}px`,
            '--bokeh-opacity-peak': '1',
            opacity: b.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}