'use client';

import { useNavigationStore } from '@/store/useNavigationStore';

const BOTTOM_NAV_ITEMS = [
  { label: 'Home', section: 'home' as const, icon: 'home' },
  { label: 'RSVP', section: 'rsvp' as const, icon: 'favorite' },
  { label: 'Story', section: 'story' as const, icon: 'auto_stories' },
  { label: 'Moments', section: 'moments' as const, icon: 'photo_library' },
];

export default function BottomNav() {
  const { currentSection, setSection, openDrawer } = useNavigationStore();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 md:hidden bg-paper-cream/95 backdrop-blur-md rounded-t-[24px] border-t border-cinematic-gold/10 shadow-[0_-4px_20px_rgba(26,26,26,0.04)] z-50 pb-8 pt-4">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = currentSection === item.section;
        return (
          <button
            key={item.section}
            onClick={() => setSection(item.section)}
            className={`flex flex-col items-center justify-center active:scale-90 transition-all ${
              isActive
                ? 'text-cinematic-gold'
                : 'text-charcoal-ink/40 hover:text-cinematic-gold transition-colors'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                  : {}
              }
            >
              {item.icon}
            </span>
            <span
              className="text-[9px] tracking-[0.1em] uppercase font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* More button triggers mobile drawer */}
      <button
        onClick={openDrawer}
        className="flex flex-col items-center justify-center text-charcoal-ink/40 hover:text-cinematic-gold transition-colors active:scale-90"
      >
        <span className="material-symbols-outlined mb-1">more_horiz</span>
        <span
          className="text-[9px] tracking-[0.1em] uppercase font-semibold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          More
        </span>
      </button>
    </nav>
  );
}