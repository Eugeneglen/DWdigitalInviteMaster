'use client';

import { useNavigationStore, type Section } from '@/store/useNavigationStore';
import { useSiteSettings, type NavTab } from '@/hooks/useSiteSettings';

export default function BottomNav() {
  const { currentSection, setSection, openDrawer } = useNavigationStore();
  const { navTabs } = useSiteSettings();

  // Show first 4 tabs + More button (same pattern as before)
  const visibleTabs = navTabs.slice(0, 4);
  const hasMore = navTabs.length > 4;

  return (
    <nav
      className="fixed bottom-0 left-0 w-full flex justify-around items-center py-4 px-2 md:hidden bg-paper-cream border-t border-champagne-silk/20 z-50 rounded-t-full shadow-[0_-4px_20px_rgba(26,26,26,0.04)] pb-8 pt-4"
      role="navigation"
      aria-label="Page navigation"
    >
      {visibleTabs.map((item: NavTab) => {
        const isActive = currentSection === item.section;
        return (
          <button
            key={item.id}
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
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
            >
              {getSectionIcon(item.section)}
            </span>
            <span className="font-label-sm text-[10px] uppercase tracking-wider font-semibold mt-1">
              {item.label}
            </span>
          </button>
        );
      })}

      {hasMore && (
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

// Map section to Material Symbol icon name
function getSectionIcon(section: Section): string {
  const icons: Record<Section, string> = {
    home: 'home',
    schedule: 'calendar_today',
    rsvp: 'favorite',
    'getting-there': 'location_on',
    story: 'auto_stories',
    wishes: 'edit_note',
    qa: 'help',
    moments: 'photo_library',
  };
  return icons[section] || 'article';
}