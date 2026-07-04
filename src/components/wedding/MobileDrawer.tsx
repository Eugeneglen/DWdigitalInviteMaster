'use client';

import { useStore } from '@/lib/store';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'Home', page: 'home' },
  { label: 'Schedule', page: 'schedule' },
  { label: 'RSVP', page: 'rsvp' },
  { label: 'Getting There', page: 'getting-there' },
  { label: 'Story', page: 'story' },
  { label: 'Wishes', page: 'wishes' },
  { label: 'Q & A', page: 'qa' },
  { label: 'Moments', page: 'moments' },
];

export default function MobileDrawer() {
  const { drawerOpen, setDrawerOpen, currentPage, setPage } = useStore();

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

  if (!drawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-charcoal-ink/20 backdrop-blur-sm transition-opacity duration-300"
      onClick={() => setDrawerOpen(false)}
    >
      <nav
        className={`h-full w-80 bg-paper-cream shadow-2xl flex flex-col p-8 gap-4 transition-transform duration-500 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8 border-b border-champagne-silk/30 pb-4">
          <img alt="Dreamweavers" className="h-3" src="/dreamweavers-logo.png" />
          <button className="text-charcoal-ink" onClick={() => setDrawerOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <ul className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <li key={item.page}>
                <button
                  onClick={() => setPage(item.page)}
                  className={`flex items-center gap-4 hover:pl-2 transition-all duration-300 ${
                    isActive
                      ? 'text-cinematic-gold font-bold'
                      : 'text-charcoal-ink/60'
                  }`}
                >
                  <span className="text-xs uppercase tracking-widest font-bold">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}