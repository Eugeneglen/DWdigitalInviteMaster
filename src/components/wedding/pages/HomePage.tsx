'use client';

import { useState, useEffect } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { usePublicWedding } from '@/hooks/usePublicWedding';
import { useLiveWeddingData } from '@/hooks/useLiveWeddingData';

const FALLBACK_HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBeAe38AA5-0h4B5MmgQCqv54oQXyPMGznDKaw2sJI_FnTbB_yXXWOpirFlFycj_2VI02IVLouUTt86Y1J7Ls-bRsMOHPAcfSqruVoh87sfhw3vi2Z6t1C7ogCLtkvF6QbJkwuV0av8pXTrUeAAi6ymnZpvyOr8qVjTNNorAOmqRrW_fohX_xlkscmBh39K4Wtvs6TH0Nvb_X3LQQRD9W_sySN_iWbWw9O0au8u1jO-hSekE9pSGNo5zsTz3o9PWy5xbzc6lq3knkIy';

const FALLBACK_BANNER_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA-OyKfcsxXAmZDArHbDXl1cVCgGUG5liFPzyHdVvMG6_4jN9pNTrN9GCrkdnegli9UPJUSPs39KJRsRP7AiLem4xYS-q1ZYq1T3DAIqyvn3wAvbdkoMVkufft0SpQw4gDTPSnIml6k62lRYobUrNu70UGIILiMZQ0fAydTXXwVZ1oswQZ-mjPT8H9mDDqfhxsMSI5zla8GKz_ILXbmdRjtRUk682dPEDBD6I81DzEx7dITgjb6vxQoee5599jkYf_vCYP7npydvxqx';

const FALLBACK_TEA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6SiJt49KQCmMAhF-X_tmX1Y1NKhTieT6ApO53PD9gYuvLO0e78WTxzg8BV7Wnhe6oJ6sG4SwJ4U-nH2m33dv7I89IhLgrHDkabts7ws-QwPlv-ycUzhyuBN0c04ka2inAyysumlM1w-sR8stBZ51HJOGZkQO6cAtfrn9RXWZRFlHJlUp8Jqzi-nBu3xGs57xm7L2Le06Put3xBDMAe39zkMMsdcuUkbeyw5c4Q6VxvXkSmMbcpLM-HJK1iMgYVLkn2kzqUPEALYpH';

const FALLBACK_WEDDING_DATE = new Date('2027-12-25T16:00:00').getTime();
const FALLBACK_COUPLE_NAME = 'Eleanor & James';
const FALLBACK_DATE_TEXT = 'December 25, 2027';
const FALLBACK_HERO_DESCRIPTION = 'Together with their families, request the pleasure of your company';

function useCountdown(targetTimestamp: number) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTimestamp - now);
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
  }, [targetTimestamp]);

  return timeLeft;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return FALLBACK_DATE_TEXT;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return FALLBACK_DATE_TEXT;
    return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return FALLBACK_DATE_TEXT;
  }
}

function parseWeddingTimestamp(dateStr: string | null | undefined): number {
  if (!dateStr) return FALLBACK_WEDDING_DATE;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return FALLBACK_WEDDING_DATE;
    return d.getTime();
  } catch {
    return FALLBACK_WEDDING_DATE;
  }
}

export default function HomePage() {
  const { data } = usePublicWedding();

  const bannerUrl = data?.wedding.bannerUrl || FALLBACK_BANNER_BG;
  const heroImgUrl = data?.wedding.heroImageUrl || FALLBACK_HERO_IMG;
  const coupleName = data?.wedding.coupleName || FALLBACK_COUPLE_NAME;
  const dateText = formatDate(data?.wedding.weddingDate);
  const weddingTimestamp = parseWeddingTimestamp(data?.wedding.weddingDate);
  const heroDescription = data
    ? (data.content['hero']?.['description'] || FALLBACK_HERO_DESCRIPTION)
    : FALLBACK_HERO_DESCRIPTION;

  const countdown = useCountdown(weddingTimestamp);
  const { setSection } = useNavigationStore();
  const [showFab, setShowFab] = useState(false);

  // Live wedding data
  const weddingId = data?.wedding.id ?? null;
  const { isConnected, rsvpFlash, liveRsvpIncrement } = useLiveWeddingData({ weddingId });
  const baseRsvpCount = data?.rsvpCount ?? 0;
  const displayRsvpCount = baseRsvpCount + liveRsvpIncrement;

  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ===== TOP BANNER ===== */}
      <div
        className="w-full h-[360px] md:h-[420px] bg-cover bg-center mt-[54px] md:mt-[64px] relative z-40 border-b border-champagne-silk/20 flex items-center justify-center"
        style={{ backgroundImage: `url('${bannerUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-paper-cream/30 via-paper-cream/10 to-paper-cream/60" />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-display-hero text-[44px] md:text-[72px] leading-[1.05] text-charcoal-ink tracking-tight font-bold drop-shadow-sm">
            {coupleName.replace(/&/g, '&amp;')}
          </h1>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px]">
        {/* ===== HERO SECTION ===== */}
        <section className="relative h-[795px] md:h-screen w-full flex flex-col justify-end overflow-hidden">
          {/* Background Image — full bleed, no crop */}
          <div className="absolute inset-0 z-0">
            <img
              alt="Hero Wedding Portrait"
              className="w-full h-full object-cover object-center"
              src={heroImgUrl}
            />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 w-full px-8 md:px-24 pb-20 md:pb-32 flex flex-col items-center text-center">
            {/* Master Date Badge */}
            <div className="animate-fade-in delay-100 mb-8 inline-flex items-center justify-center border border-champagne-silk px-6 py-2 rounded-full bg-paper-cream/10 backdrop-blur-sm">
              <span className="font-label-sm text-label-sm leading-label-sm text-paper-cream tracking-[0.2em] uppercase font-semibold">
                {dateText}
              </span>
            </div>

            {/* Description */}
            <p className="animate-slide-up delay-300 font-body-md text-body-md leading-body-md text-paper-cream/80 max-w-md mx-auto mb-12 italic">
              {heroDescription}
            </p>

            {/* Countdown Component */}
            <div className="animate-slide-up delay-400 grid grid-cols-4 gap-3 md:gap-4 w-full max-w-md mx-auto">
              {[
                { value: countdown.days, label: 'DAYS' },
                { value: countdown.hours, label: 'HOURS' },
                { value: countdown.mins, label: 'MINS' },
                { value: countdown.secs, label: 'SECS' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center justify-center rounded-lg border border-champagne-silk bg-paper-cream/10 backdrop-blur-sm py-4 md:py-5">
                  <span className="font-display-hero text-3xl md:text-4xl font-bold text-paper-cream leading-none">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="font-label-sm text-[9px] md:text-[10px] text-paper-cream/80 tracking-widest uppercase mt-2 font-semibold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live RSVP Counter */}
          {isConnected && displayRsvpCount > 0 && (
            <div
              className={`mt-6 animate-fade-in flex items-center justify-center gap-2 transition-all duration-500 ${
                rsvpFlash ? 'scale-105' : 'scale-100'
              }`}
            >
              <span className="text-base">🎉</span>
              <span className="font-label-sm text-label-sm text-paper-cream/90 tracking-wide">
                <span className="font-bold text-paper-cream">{displayRsvpCount}</span>{' '}
                {displayRsvpCount === 1 ? 'guest has' : 'guests have'} RSVP&apos;d
              </span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            </div>
          )}

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in delay-400 flex flex-col items-center opacity-70">
            <span className="font-label-sm text-[10px] text-paper-cream tracking-widest mb-2 uppercase font-semibold">Scroll</span>
            <span className="material-symbols-outlined text-paper-cream animate-bounce">arrow_downward</span>
          </div>
        </section>

        {/* ===== TEA CEREMONY SECTION ===== */}
        <section className="py-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto bg-paper-cream">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="relative w-full aspect-[2/3] md:aspect-auto md:h-[800px] overflow-hidden rounded-lg shadow-xl mb-8 group">
              <img
                alt="The Tea Ceremony"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={FALLBACK_TEA_IMG}
              />
            </div>
            <div className="text-center">
              <span className="font-label-sm text-label-sm leading-label-sm text-cinematic-gold tracking-[0.2em] uppercase block mb-2 font-semibold">The Tradition</span>
              <h3 className="font-display-hero text-headline-lg-mobile leading-headline-lg-mobile md:text-headline-lg md:leading-headline-lg font-semibold text-charcoal-ink">The Tea Ceremony</h3>
            </div>
          </div>
        </section>

        {/* ===== NARRATIVE SECTION ===== */}
        <section className="py-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto bg-paper-cream">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <span className="font-label-sm text-label-sm leading-label-sm text-cinematic-gold tracking-[0.2em] uppercase block font-semibold">The Prelude</span>
            <h3 className="font-display-hero text-headline-lg-mobile leading-headline-lg-mobile md:text-headline-lg md:leading-headline-lg font-semibold text-charcoal-ink">Our Story Begins Here</h3>
            <p className="font-body-md text-body-md text-charcoal-ink/80 leading-relaxed">
              Every great romance is a narrative woven over time. Ours began with a serendipitous meeting and has evolved into a tapestry of shared adventures, quiet moments, and a profound commitment to one another.
            </p>
          </div>
        </section>
      </main>

      {/* ===== GOLD DUST PARTICLES ===== */}
      <style>{`
        .gold-dust-particle {
          background: radial-gradient(circle, rgb(212,175,55) 0%, rgb(245,230,173) 60%, transparent 100%);
          animation: dustRise var(--dust-duration,18s) linear var(--dust-delay,0s) infinite, dustSway var(--dust-duration,18s) ease-in-out var(--dust-delay,0s) infinite;
        }
        @keyframes dustRise {
          0% { opacity: var(--dust-opacity-start,0); transform: translateY(0); }
          8% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-105vh); }
        }
        @keyframes dustSway {
          0% { margin-left: 0; }
          25% { margin-left: var(--dust-sway,12px); }
          50% { margin-left: calc(var(--dust-sway,12px) * -0.5); }
          75% { margin-left: var(--dust-sway,12px); }
          100% { margin-left: 0; }
        }
        .bokeh-orb {
          background: radial-gradient(circle at 40% 40%, rgba(212,175,55,0.5) 0%, rgba(245,230,173,0.2) 40%, transparent 70%);
          filter: blur(30px);
          animation: bokehDrift var(--bokeh-drift-dur,25s) ease-in-out var(--bokeh-delay,0s) infinite alternate, bokehBreathe var(--bokeh-breath-dur,7s) ease-in-out var(--bokeh-delay,0s) infinite;
        }
        @keyframes bokehDrift {
          0% { transform: translate(0); }
          100% { transform: translate(var(--bokeh-drift-x,20px), var(--bokeh-drift-y,10px)); }
        }
        @keyframes bokehBreathe {
          0%,100% { opacity: inherit; transform: scale(1); }
          50% { opacity: calc(var(--bokeh-opacity-peak,1) * 1.4); transform: scale(1.15); }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => {
          const left = `${(i * 5.5 + 2) % 100}%`;
          const size = 2 + (i % 4);
          const duration = 16 + (i % 8) * 2;
          const delay = (i * 1.7) % 12;
          const sway = 8 + (i % 3) * 6;
          const opacity = 0.3 + (i % 3) * 0.2;
          return (
            <div
              key={i}
              className="gold-dust-particle"
              style={{
                position: 'absolute',
                bottom: '-10px',
                left,
                width: `${size}px`,
                height: `${size}px`,
                '--dust-duration': `${duration}s`,
                '--dust-delay': `${delay}s`,
                '--dust-sway': `${sway}px`,
                '--dust-opacity-start': '0',
                opacity,
              } as React.CSSProperties}
            />
          );
        })}
        {Array.from({ length: 5 }).map((_, i) => {
          const left = `${15 + i * 18}%`;
          const size = 80 + i * 30;
          const driftDur = 22 + i * 5;
          const breathDur = 6 + i * 2;
          const delay = i * 4;
          const driftX = 15 + i * 8;
          const driftY = 8 + i * 5;
          return (
            <div
              key={`bokeh-${i}`}
              className="bokeh-orb"
              style={{
                position: 'absolute',
                bottom: `${10 + i * 15}%`,
                left,
                width: `${size}px`,
                height: `${size}px`,
                '--bokeh-drift-dur': `${driftDur}s`,
                '--bokeh-breath-dur': `${breathDur}s`,
                '--bokeh-delay': `${delay}s`,
                '--bokeh-drift-x': `${driftX}px`,
                '--bokeh-drift-y': `${driftY}px`,
                '--bokeh-opacity-peak': '1',
                opacity: 0.08 + i * 0.03,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* ===== FLOATING ACTION BUTTON ===== */}
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