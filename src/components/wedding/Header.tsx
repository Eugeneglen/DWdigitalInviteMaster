'use client';

import { useNavigationStore, type Section } from '@/store/useNavigationStore';

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

interface HeaderProps {
  /** CSS top value to push the fixed header below an overlay bar (e.g. "44px") */
  topOffset?: string;
}

export default function Header({ topOffset }: HeaderProps) {
  const { currentSection, setSection, openDrawer } = useNavigationStore();

  return (
    <header
      className="fixed w-full z-50 bg-paper-cream/80 backdrop-blur-md border-b border-champagne-silk/30"
      style={topOffset ? { top: topOffset } : undefined}
    >
      <div className="flex justify-between items-center px-4 md:px-6 py-3 w-full max-w-[1440px] mx-auto">
        {/* Logo */}
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => setSection('home')}
        >
          <img
            alt="Dreamweavers Logo"
            className="h-4 md:h-5 w-auto object-contain"
            src="/dreamweavers-logo.png"
          />
        </div>

        {/* Desktop navigation (lg+) */}
        <nav className="hidden lg:flex justify-center items-center gap-6 px-4 ml-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = currentSection === item.section;
            return (
              <button
                key={item.section}
                onClick={() => setSection(item.section)}
                className={`font-medium text-[11px] tracking-[0.2em] uppercase border-b-2 h-[26px] flex items-center transition-colors duration-300 ${
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

        {/* Mobile hamburger button */}
        <div className="lg:hidden ml-auto">
          <button
            className="text-charcoal-ink p-2"
            onClick={openDrawer}
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}