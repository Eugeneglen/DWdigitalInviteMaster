'use client';

import { useNavigationStore } from '@/store/useNavigationStore';
import { useEffect } from 'react';

export default function MobileDrawer() {
  const { drawerOpen, closeDrawer, currentSection, setSection, availableTabs } =
    useNavigationStore();
  const tabs = availableTabs.length > 0 ? availableTabs : undefined;

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
        id="mobile-drawer"
        className={`h-full w-80 shadow-2xl flex flex-col p-8 gap-4 transition-transform duration-500 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'var(--wedding-bg, #FCF9F2)' }}
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
          {(tabs ?? []).map((item) => {
            const isActive = currentSection === item.section;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setSection(item.section)}
                  className={`text-xs uppercase tracking-widest flex items-center hover:pl-2 transition-all duration-300 ${
                    isActive
                      ? 'text-cinematic-gold font-bold'
                      : 'text-charcoal-ink/60'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
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