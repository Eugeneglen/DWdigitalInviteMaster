'use client';

import { useNavigationStore, type Section } from '@/store/useNavigationStore';
import { useEffect } from 'react';

const NAV_ITEMS: { label: string; section: Section }[] = [
  { label: 'Home', section: 'home' },
  { label: 'Schedule', section: 'schedule' },
  { label: 'RSVP', section: 'rsvp' },
  { label: 'Getting There', section: 'getting-there' },
  { label: 'Story', section: 'story' },
  { label: 'Wishes', section: 'wishes' },
  { label: 'Q&A', section: 'qa' },
  { label: 'Moments', section: 'moments' },
];

export default function MobileDrawer() {
  const { drawerOpen, closeDrawer, currentSection, setSection } =
    useNavigationStore();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-charcoal-ink/20 backdrop-blur-sm transition-opacity duration-300 ${
        drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={closeDrawer}
      aria-hidden={!drawerOpen}
    >
      <nav
        className={`h-full w-80 bg-paper-cream shadow-2xl flex flex-col p-8 gap-4 transition-transform duration-500 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top: Logo + Close */}
        <div className="flex justify-between items-center mb-8 border-b border-champagne-silk/30 pb-4">
          <img
            alt="Dreamweavers"
            className="h-3 w-auto object-contain"
            src="/dreamweavers-logo.png"
          />
          <button
            className="text-charcoal-ink"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Link list */}
        <ul className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = currentSection === item.section;
            return (
              <li key={item.section}>
                <button
                  onClick={() => setSection(item.section)}
                  className={`text-xs uppercase tracking-widest flex items-center hover:pl-2 transition-all duration-300 ${
                    isActive
                      ? 'text-cinematic-gold font-bold'
                      : 'text-charcoal-ink/60'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}