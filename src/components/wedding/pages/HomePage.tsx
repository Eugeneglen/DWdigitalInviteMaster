'use client';

import { useState, useEffect } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBeAe38AA5-0h4B5MmgQCqv54oQXyPMGznDKaw2sJI_FnTbB_yXXWOpirFlFycj_2VI02IVLouUTt86Y1J7Ls-bRsMOHPAcfSqruVoh87sfhw3vi2Z6t1C7ogCLtkvF6QbJkwuV0av8pXTrUeAAi6ymnZpvyOr8qVjTNNorAOmqRrW_fohX_xlkscmBh39K4Wtvs6TH0Nvb_X3LQQRD9W_sySN_iWbWw9O0au8u1jO-hSekE9pSGNo5zsTz3o9PWy5xbzc6lq3knkIy';

const TEA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6SiJt49KQCmMAhF-X_tmX1Y1NKhTieT6ApO53PD9gYuvLO0e78WTxzg8BV7Wnhe6oJ6sG4SwJ4U-nH2m33dv7I89IhLgrHDkabts7ws-QwPlv-ycUzhyuBN0c04ka2inAyysumlM1w-sR8stBZ51HJOGZkQO6cAtfrn9RXWZRFlHJlUp8Jqzi-nBu3xGs57xm7L2Le06Put3xBDMAe39zkMMsdcuUkbeyw5c4Q6VxvXkSmMbcpLM-HJK1iMgYVLkn2kzqUPEALYpH';

const WEDDING_DATE = new Date('2025-10-24T16:00:00').getTime();

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const diff = Math.max(0, WEDDING_DATE - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

const BANNER_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA-OyKfcsxXAmZDArHbDXl1cVCgGUG5liFPzyHdVvMG6_4jN9pNTrN9GCrkdnegli9UPJUSPs39KJRsRP7AiLem4xYS-q1ZYq1T3DAIqyvn3wAvbdkoMVkufft0SpQw4gDTPSnIml6k62lRYobUrNu70UGIILiMZQ0fAydTXXwVZ1oswQZ-mjPT8H9mDDqfhxsMSI5zla8GKz_ILXbmdRjtRUk682dPEDBD6I81DzEx7dITgjb6vxQoee5599jkYf_vCYP7npydvxqx';

export default function HomePage() {
  const countdown = useCountdown();
  const { setSection } = useNavigationStore();
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Top Banner - "Eleanor & James" */}
      <div
        className="w-full h-[360px] md:h-[420px] bg-cover bg-center mt-[54px] md:mt-[64px] relative z-40 border-b border-champagne-silk/20 flex items-center justify-center"
        style={{ backgroundImage: `url('${BANNER_BG}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-paper-cream/30 via-paper-cream/10 to-paper-cream/60" />
        <div className="relative z-10 text-center px-6">
          <h1
            className="text-[44px] md:text-[72px] leading-[1.05] text-charcoal-ink tracking-tight font-bold drop-shadow-sm"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Eleanor &amp; James
          </h1>
        </div>
      </div>

      <main className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px]">
        {/* Hero Section */}
        <section className="relative h-[795px] md:h-screen w-full flex flex-col justify-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 inner-frame m-4 md:m-8">
          <img
            alt="Hero Wedding Portrait"
            className="w-full h-full object-cover object-center rounded-lg shadow-[0_-4px_20px_rgba(26,26,26,0.04)]"
            src={HERO_IMG}
          />
          <div className="absolute inset-0 hero-gradient rounded-lg" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full px-8 md:px-24 pb-20 md:pb-32 flex flex-col items-center text-center">
          {/* Date Badge */}
          <div className="animate-fade-in delay-100 mb-8 inline-flex items-center justify-center border border-champagne-silk px-6 py-2 rounded-full bg-paper-cream/10 backdrop-blur-sm">
            <span className="text-paper-cream tracking-[0.2em] uppercase font-semibold" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}>
              October 24, 2025
            </span>
          </div>

          {/* Couple Names */}
          <h2
            className="animate-slide-up delay-200 text-[48px] leading-[1.1] md:text-[84px] text-paper-cream mb-6 tracking-tight drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '100px' }}
          >
            Eleanor<br className="md:hidden" />
            <span className="italic font-light mx-4 text-cinematic-gold">&amp;</span>
            <br className="md:hidden" />
            James
          </h2>

          <p className="animate-slide-up delay-300 text-paper-cream/90 max-w-md mx-auto mb-12 italic" style={{ fontSize: '16px', lineHeight: '24px' }}>
            Join us in celebrating our journey. A weekend of joy, laughter, and lifelong memories in the heart of the countryside.
          </p>

          {/* Countdown */}
          <div className="animate-slide-up delay-400 grid grid-cols-4 gap-4 md:gap-8 w-full max-w-xl mx-auto border-t border-b border-champagne-silk/30 py-6 backdrop-blur-sm bg-charcoal-ink/20">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.mins, label: 'Mins' },
              { value: countdown.secs, label: 'Secs' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span
                  className="text-[32px] md:text-[48px] text-paper-cream"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, lineHeight: '56px' }}
                >
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-cinematic-gold tracking-widest uppercase mt-2 font-semibold" style={{ fontSize: '10px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in delay-400 flex flex-col items-center opacity-70">
          <span className="text-[10px] text-paper-cream tracking-widest mb-2 uppercase font-semibold" style={{ fontSize: '10px', letterSpacing: '0.1em', fontWeight: 600 }}>
            Discover
          </span>
          <span className="material-symbols-outlined text-paper-cream animate-bounce">arrow_downward</span>
        </div>
      </section>

      {/* Tea Ceremony Section */}
      <section className="py-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto bg-paper-cream">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="relative w-full aspect-[2/3] md:aspect-auto md:h-[800px] overflow-hidden rounded-lg shadow-xl mb-8 group">
            <img
              alt="The Tea Ceremony"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={TEA_IMG}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-ink/40 to-transparent pointer-events-none" />
          </div>
          <div className="text-center">
            <span className="text-cinematic-gold block mb-2 uppercase tracking-[0.2em] font-semibold" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}>
              The Tradition
            </span>
            <h3 className="text-[32px] md:text-[48px] text-charcoal-ink" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, lineHeight: '56px' }}>
              The Tea Ceremony
            </h3>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto bg-paper-cream">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <span className="text-cinematic-gold block font-semibold" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.2em', fontWeight: 600 }}>
            The Prelude
          </span>
          <h3 className="text-[32px] md:text-[48px] text-charcoal-ink" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, lineHeight: '56px' }}>
            Our Story Begins Here
          </h3>
          <p className="text-charcoal-ink/80 leading-relaxed" style={{ fontSize: '16px', lineHeight: '24px' }}>
            Every great romance is a narrative woven over time. Ours began with a serendipitous meeting and has evolved into a tapestry of shared adventures, quiet moments, and a profound commitment to one another.
          </p>
        </div>
      </section>
    </main>

      {/* Floating Action Button */}
      <div
        className={`fixed bottom-24 right-6 md:bottom-12 md:right-12 z-[55] transition-transform duration-300 ${
          showFab ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <button
          onClick={() => setSection('rsvp')}
          className="bg-charcoal-ink text-paper-cream w-16 h-16 rounded-full shadow-[0_8px_30px_rgba(26,26,26,0.12)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-cinematic-gold/30"
        >
          <span className="material-symbols-outlined">edit_calendar</span>
        </button>
      </div>
    </>
  );
}