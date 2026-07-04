'use client';

import { useStore } from '@/lib/store';

const BOTTOM_NAV_ITEMS = [
  { label: 'Home', page: 'home', icon: 'home' },
  { label: 'RSVP', page: 'rsvp', icon: 'favorite' },
  { label: 'Story', page: 'story', icon: 'auto_stories' },
  { label: 'Moments', page: 'moments', icon: 'photo_library' },
];

export default function BottomNav() {
  const { currentPage, setPage, setDrawerOpen } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 md:hidden bg-paper-cream border-t border-champagne-silk/20 z-50 rounded-t-full shadow-[0_-4px_20px_rgba(26,26,26,0.04)] pb-8 pt-4">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.page;
        return (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            className={`flex flex-col items-center justify-center active:scale-90 transition-all ${
              isActive
                ? 'text-cinematic-gold'
                : 'text-charcoal-ink/50 hover:text-cinematic-gold'
            }`}
          >
            <span
              className={`material-symbols-outlined mb-1 ${
                isActive ? 'material-symbols-filled' : ''
              }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {item.label}
            </span>
          </button>
        );
      })}
      <button
        onClick={() => setDrawerOpen(true)}
        className="flex flex-col items-center justify-center text-charcoal-ink/50 hover:text-cinematic-gold transition-colors active:scale-90"
      >
        <span className="material-symbols-outlined mb-1">more_horiz</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
          More
        </span>
      </button>
    </nav>
  );
}