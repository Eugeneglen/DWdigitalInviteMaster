"use client";

import { useState, useEffect } from "react";
import { CalendarPlus } from "lucide-react";

export default function FAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      className={`fixed bottom-24 right-6 md:bottom-12 md:right-12 z-[55] w-16 h-16 rounded-full bg-charcoal-ink text-paper-cream flex items-center justify-center shadow-[0_8px_30px_rgba(26,26,26,0.12)] border border-cinematic-gold/30 transition-all duration-300 hover:scale-105 active:scale-95 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      }`}
      aria-label="Add to calendar"
    >
      <CalendarPlus className="w-6 h-6" />
    </button>
  );
}