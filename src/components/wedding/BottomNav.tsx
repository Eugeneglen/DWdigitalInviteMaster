'use client';

import { useNavigationStore, type Section } from '@/store/useNavigationStore';

interface NavItem {
  label: string;
  section: Section;
  icon: string;
  active?: boolean;
}

const PAGE_NAV_CONFIG: Record<Section, { items: NavItem[]; showMore: boolean }> = {
  home: {
    items: [
      { label: 'Home', section: 'home', icon: 'home', active: true },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite' },
      { label: 'Story', section: 'story', icon: 'auto_stories' },
      { label: 'Moments', section: 'moments', icon: 'photo_library' },
    ],
    showMore: true,
  },
  schedule: {
    items: [
      { label: 'Home', section: 'home', icon: 'home' },
      { label: 'Schedule', section: 'schedule', icon: 'calendar_today', active: true },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite' },
    ],
    showMore: true,
  },
  rsvp: {
    items: [
      { label: 'Home', section: 'home', icon: 'home' },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite', active: true },
      { label: 'Story', section: 'story', icon: 'auto_stories' },
      { label: 'Moments', section: 'moments', icon: 'photo_library' },
    ],
    showMore: true,
  },
  'getting-there': {
    items: [
      { label: 'Home', section: 'home', icon: 'home' },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite' },
      { label: 'Story', section: 'story', icon: 'auto_stories' },
      { label: 'Moments', section: 'moments', icon: 'photo_library' },
    ],
    showMore: true,
  },
  story: {
    items: [
      { label: 'Home', section: 'home', icon: 'home' },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite' },
      { label: 'Story', section: 'story', icon: 'auto_stories', active: true },
      { label: 'Moments', section: 'moments', icon: 'photo_library' },
    ],
    showMore: true,
  },
  wishes: {
    items: [
      { label: 'Home', section: 'home', icon: 'home' },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite' },
      { label: 'Story', section: 'story', icon: 'auto_stories' },
      { label: 'Moments', section: 'moments', icon: 'photo_library' },
    ],
    showMore: true,
  },
  qa: {
    items: [
      { label: 'Home', section: 'home', icon: 'home' },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite' },
      { label: 'Story', section: 'story', icon: 'auto_stories' },
      { label: 'Q&A', section: 'qa', icon: 'help', active: true },
    ],
    showMore: false,
  },
  moments: {
    items: [
      { label: 'Home', section: 'home', icon: 'home' },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite' },
      { label: 'Story', section: 'story', icon: 'auto_stories' },
      { label: 'Moments', section: 'moments', icon: 'photo_library', active: true },
    ],
    showMore: true,
  },
  video: {
    items: [
      { label: 'Home', section: 'home', icon: 'home' },
      { label: 'RSVP', section: 'rsvp', icon: 'favorite' },
      { label: 'Story', section: 'story', icon: 'auto_stories' },
      { label: 'Video', section: 'video', icon: 'videocam', active: true },
    ],
    showMore: true,
  },
};

export default function BottomNav() {
  const { currentSection, setSection, openDrawer } = useNavigationStore();
  const config = PAGE_NAV_CONFIG[currentSection];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full flex justify-around items-center py-4 px-2 md:hidden bg-paper-cream border-t border-champagne-silk/20 z-50 rounded-t-full shadow-[0_-4px_20px_rgba(26,26,26,0.04)] pb-8 pt-4"
      role="navigation"
      aria-label="Page navigation"
    >
      {config.items.map((item) => {
        const isActive = item.active ?? false;
        return (
          <button
            key={`${currentSection}-${item.section}`}
            onClick={() => setSection(item.section)}
            aria-label={`Navigate to ${item.label}`}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center active:scale-90 transition-transform ${
              isActive
                ? 'text-cinematic-gold'
                : 'text-charcoal-ink/50 hover:text-cinematic-gold transition-colors'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              aria-hidden="true"
              data-weight={isActive ? 'fill' : undefined}
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label-sm text-[10px] uppercase tracking-wider font-semibold mt-1">
              {item.label}
            </span>
          </button>
        );
      })}

      {config.showMore && (
        <button
          onClick={openDrawer}
          aria-label="Open more navigation options"
          className="flex flex-col items-center justify-center text-charcoal-ink/50 hover:text-cinematic-gold transition-colors active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined mb-1" aria-hidden="true">more_horiz</span>
          <span className="font-label-sm text-[10px] uppercase tracking-wider font-semibold mt-1">More</span>
        </button>
      )}
    </nav>
  );
}