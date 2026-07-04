'use client';

import { useStore } from '@/lib/store';

export default function Footer() {
  const { setPage } = useStore();
  return (
    <footer className="w-full py-20 bg-paper-cream border-t border-champagne-silk/10 pb-32 md:pb-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-canvas-margin flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <a
            className="text-charcoal-ink/60 hover:text-cinematic-gold underline-offset-4 hover:underline transition-colors"
            href="mailto:concierge@dreamweavers.events"
            style={{ fontSize: '16px', lineHeight: '24px' }}
          >
            Contact Concierge
          </a>
          <button
            onClick={() => setPage('admin-dashboard')}
            className="text-charcoal-ink/30 hover:text-cinematic-gold underline-offset-4 hover:underline transition-colors cursor-pointer"
            style={{ fontSize: '16px', lineHeight: '24px' }}
          >
            Admin Portal
          </button>
          <span
            className="text-charcoal-ink/60 underline-offset-4 transition-colors opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
            style={{ fontSize: '16px', lineHeight: '24px' }}
          >
            Privacy Policy
          </span>
          <span
            className="text-charcoal-ink/60 underline-offset-4 transition-colors opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
            style={{ fontSize: '16px', lineHeight: '24px' }}
          >
            Technical Support
          </span>
        </div>
        <p className="text-charcoal-ink/40 uppercase tracking-wider font-semibold" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}>
          © 2024 DREAMWEAVERS DIGITAL HEIRLOOMS
        </p>
      </div>
    </footer>
  );
}