"use client";

import { useEffect, useState } from "react";

export default function CursorEffects() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (isTouchDevice) return;

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="hidden md:block fixed pointer-events-none z-[100] w-40 h-40 rounded-full transition-opacity duration-500"
      style={{
        left: pos.x - 80,
        top: pos.y - 80,
        background:
          "radial-gradient(circle, rgba(197,160,89,0.06) 0%, transparent 70%)",
      }}
    />
  );
}