'use client';

import { useStore } from '@/lib/store';
import { useState } from 'react';

const adminPages = [
  { key: 'admin-dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'admin-guests', label: 'Guests', icon: 'group' },
  { key: 'admin-media', label: 'Media', icon: 'photo_library' },
  { key: 'admin-settings', label: 'Settings', icon: 'settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, setPage, drawerOpen, setDrawerOpen } = useStore();

  return (
    <div className="min-h-screen bg-paper-cream text-charcoal-ink">
      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[70] md:hidden transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 flex flex-col border-r border-cinematic-gold/20 z-[80] bg-paper-cream transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-8 mb-8">
          <img
            alt="Dreamweavers Logo"
            className="h-3 w-auto opacity-90"
            src="/dreamweavers-logo.png"
          />
        </div>

        {/* Mobile Close Button */}
        <div className="flex items-center justify-end px-8 mb-8 md:hidden">
          <button
            className="material-symbols-outlined text-charcoal-ink"
            onClick={() => setDrawerOpen(false)}
          >
            close
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {adminPages.map((page) => {
            const isActive = currentPage === page.key;
            return (
              <button
                key={page.key}
                onClick={() => setPage(page.key)}
                className={`flex items-center gap-4 p-4 rounded-lg w-full text-left transition-colors ${
                  isActive
                    ? 'text-cinematic-gold border border-cinematic-gold/20 bg-white/50'
                    : 'hover:bg-white/40'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: '"FILL" 1, "wght" 300, "GRAD" 0, "opsz" 24' } : undefined}
                >
                  {page.icon}
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
                  {page.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-8 border-t border-cinematic-gold/10">
          <button
            onClick={() => setPage('home')}
            className="text-[10px] uppercase tracking-[0.25em] text-cinematic-gold hover:text-charcoal-ink transition-colors mb-4 block cursor-pointer"
          >
            ← Back to Site
          </button>
          <div className="flex flex-col gap-2 mb-4">
            <span
              className="text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/60 opacity-40 cursor-not-allowed"
              aria-disabled="true"
              title="Coming soon"
            >
              Support
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/60 opacity-40 cursor-not-allowed"
              aria-disabled="true"
              title="Coming soon"
            >
              Privacy
            </span>
          </div>
          <p className="text-[8px] leading-relaxed uppercase tracking-[0.25em] text-charcoal-ink/40">
            2024 DREAMWEAVERS &bull; EDITORIAL UTILITY
          </p>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-paper-cream/80 backdrop-blur-md border-b border-cinematic-gold/20 flex justify-between items-center px-4 md:px-12 py-4">
        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            className="material-symbols-outlined text-charcoal-ink"
            onClick={() => setDrawerOpen(true)}
          >
            menu
          </button>
          <img
            alt="Dreamweavers Logo"
            className="h-2 w-auto opacity-90"
            src="/dreamweavers-logo.png"
          />
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-semibold text-charcoal-ink tracking-wider uppercase">
                Admin Profile
              </span>
              <span className="text-[9px] text-charcoal-ink/50 uppercase tracking-[0.25em]">
                Master Editor
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border border-cinematic-gold/30 overflow-hidden bg-white shadow-sm">
              <img
                alt="Admin"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYOLHlQLO3ePWXKS_j-PuQhexURKycIoqoaVuHss98mipov4urICFrjndb5KpVa90qz7Pd-_q9LqZjkVjckxkg3oa6SjfoIW9pbZ0aTOCEQbc8XN8T-jZiKvEl9aJWVHGeR3Y1ehw6gMCW3baqLni1xU4Vj8Zg8hmyMTYDbXq3b64RMjkQY755EfJ3uWQLLyJL7g4zSySDlfwryr4cT_JRz5k2GDLevYNE28Nf6Hm1JXviyN8q4TvO8bpW7LgJRSiHCPyekuNHTXJQ"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-16 px-4 md:px-12 md:ml-64">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper-cream border-t border-cinematic-gold/20 flex justify-around items-center px-4 py-3 pb-8">
        {adminPages.map((page) => {
          const isActive = currentPage === page.key;
          return (
            <button
              key={page.key}
              onClick={() => setPage(page.key)}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? 'text-cinematic-gold' : 'text-charcoal-ink/40'
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={isActive ? { fontVariationSettings: '"FILL" 1, "wght" 300, "GRAD" 0, "opsz" 24' } : undefined}
              >
                {page.icon}
              </span>
              <span className="text-[8px] uppercase tracking-widest">
                {page.label === 'Dashboard' ? 'Dash' : page.label === 'Settings' ? 'Set' : page.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}