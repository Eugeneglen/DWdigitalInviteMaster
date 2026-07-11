'use client';

import { useStore } from '@/lib/store';

const NAV_ITEMS = [
  { label: 'Home', page: 'home' },
  { label: 'Schedule', page: 'schedule' },
  { label: 'RSVP', page: 'rsvp' },
  { label: 'Getting There', page: 'getting-there' },
  { label: 'Story', page: 'story' },
  { label: 'Wishes', page: 'wishes' },
  { label: 'Q&A', page: 'qa' },
  { label: 'Moments', page: 'moments' },
];

export default function Navbar() {
  const { currentPage, setPage, setDrawerOpen } = useStore();

  return (
    <header className="fixed top-0 w-full z-50 bg-paper-cream/80 backdrop-blur-md border-b border-champagne-silk/30">
      <div className="flex justify-between items-center px-4 md:px-6 py-3 w-full max-w-[1440px] mx-auto">
        {/* Logo */}
        <div className="flex-shrink-0 cursor-pointer" onClick={() => setPage('home')}>
          <img
            alt="Dreamweavers Logo"
            className="h-4 md:h-5 w-auto object-contain"
            src="/dreamweavers-logo.png"
          />
        </div>

        {/* Center-aligned desktop navigation */}
        <nav className="hidden lg:flex justify-center items-center gap-6 px-4 ml-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={`font-medium text-[11px] tracking-[0.2em] uppercase pb-1 border-b-2 h-[26px] flex items-center transition-colors duration-300 ${
                  isActive
                    ? 'text-cinematic-gold border-cinematic-gold'
                    : 'text-charcoal-ink/40 hover:text-cinematic-gold border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <div className="lg:hidden ml-auto">
          <button
            className="text-charcoal-ink p-2"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}