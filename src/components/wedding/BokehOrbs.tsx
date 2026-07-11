'use client';

import { useMemo } from 'react';

const ORB_COUNT = 10;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function BokehOrbs() {
  const orbs = useMemo(() => {
    const rand = seededRandom(137);
    return Array.from({ length: ORB_COUNT }, () => {
      const size = rand() * 80 + 20;
      const driftDur = rand() * 18 + 15;
      const breathDur = rand() * 6 + 4;
      const delay = -(rand() * 15);
      return {
        left: `${rand() * 100}%`,
        top: `${rand() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: rand() * 0.08 + 0.02,
        style: {
          '--bokeh-drift-dur': `${driftDur}s`,
          '--bokeh-breath-dur': `${breathDur}s`,
          '--bokeh-delay': `${delay}s`,
          '--bokeh-drift-x': `${(rand() - 0.5) * 40}px`,
          '--bokeh-drift-y': `${(rand() - 0.5) * 30}px`,
          '--bokeh-opacity-peak': `${rand() * 0.5 + 0.8}`,
        } as React.CSSProperties,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <span
          key={i}
          className="absolute rounded-full bokeh-orb"
          style={{
            left: o.left,
            top: o.top,
            width: o.width,
            height: o.height,
            opacity: o.opacity,
            ...o.style,
          }}
        />
      ))}
    </div>
  );
}