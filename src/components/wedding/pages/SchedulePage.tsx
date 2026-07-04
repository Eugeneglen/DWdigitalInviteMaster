'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const CEREMONY_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAsLNSEjy771owdkkDbKTl1nE5oEzBQFVHob_HKiQb9eJb1X7I79-CxGjCPeKwCSHhwswJRqSrt3ox_aktMQUGlyzg6Eoo5R0aH6CYxxKj5f3uZCWdaDfZEIqmxwZd5DgdvCUWZfIdnNvixcYvcspOOFnGM2ThX9BPZz-ftetacA-b6CkxEEp9BdSatnTG55-e8tZz1jlG1euZgtw17iI67tcMGtR2azzCg8GvNH-xQPfUJlAXxGC3jU9Q7dbVZPK-xnHwtTl5eRNknueI';
const CELEBRATION_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC01POr_eFI2RUG86kAb7dHs-q12Kj6HzxEoXpnzTnJ9n_VB9_BJL6Iy8vtGixOWTn1jVNZKDjXNQkHSy9Gsa8KI5IomZe3968VCNWHhXNZ44gbgs5LCBp4_Axjbj72RJwN0BWAIEmrqH8lgR-_j2_9Ci79wI4t583OCS4YuDca-s2xldrzBhBM-KeS4GFVFDSQdzWRY-4chmwkFfFgO3g-S4VS_jae416SCd-357i_ix3m68zwnHtpBSxyXFSjZISZ_Z66Jlxj6Npv_Lo';

const BANNER_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA-OyKfcsxXAmZDArHbDXl1cVCgGUG5liFPzyHdVvMG6_4jN9pNTrN9GCrkdnegli9UPJUSPs39KJRsRP7AiLem4xYS-q1ZYq1T3DAIqyvn3wAvbdkoMVkufft0SpQw4gDTPSnIml6k62lRYobUrNu70UGIILiMZQ0fAydTXXwVZ1oswQZ-mjPT8H9mDDqfhxsMSI5zla8GKz_ILXbmdRjtRUk682dPEDBD6I81DzEx7dITgjb6vxQoee5599jkYf_vCYP7npydvxqx';

export default function SchedulePage() {
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const stayPanelRef = useRef<HTMLDivElement>(null);
  const mapPanelRef = useRef<HTMLDivElement>(null);

  const openDrawer = useCallback((id: string) => {
    setDrawerId(id);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeDrawer = useCallback((id: string) => {
    const panelRef = id === 'stay-drawer' ? stayPanelRef : mapPanelRef;
    if (panelRef.current) {
      panelRef.current.classList.add('translate-y-full');
    }
    setTimeout(() => {
      setDrawerId(null);
      document.body.style.overflow = '';
    }, 500);
  }, []);

  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (drawerId) {
      const panelRef = drawerId === 'stay-drawer' ? stayPanelRef : mapPanelRef;
      requestAnimationFrame(() => {
        if (panelRef.current) {
          panelRef.current.classList.remove('translate-y-full');
        }
      });
    }
  }, [drawerId]);

  return (
    <>
      {/* Banner — matching original schedule.html */}
      <div
        className="w-full h-[360px] md:h-[420px] bg-cover bg-center mt-[54px] md:mt-[64px] relative z-40 border-b border-champagne-silk/20 flex items-center justify-center"
        style={{ backgroundImage: `url('${BANNER_BG}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-paper-cream/30 via-paper-cream/10 to-paper-cream/60" />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-display-hero text-[44px] md:text-[72px] leading-[1.05] text-charcoal-ink tracking-tight font-bold drop-shadow-sm">The Schedule</h1>
        </div>
      </div>

      <main className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px]">
        {/* Intro Images — original: stagger-1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 stagger-1">
          <div className="aspect-[4/5] overflow-hidden rounded-lg">
            <img alt="The Ceremony" className="w-full h-full object-cover" src={CEREMONY_IMG} />
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-lg">
            <img alt="The Celebration" className="w-full h-full object-cover" src={CELEBRATION_IMG} />
          </div>
        </div>

        {/* Date line — original: stagger-1, font-body-lg = 18px/32px/400 */}
        <section className="mb-24 text-center stagger-1">
          <p className="text-body-lg leading-body-lg text-charcoal-ink/70 max-w-2xl mx-auto italic">Saturday, June 22, 2024</p>
        </section>

        {/* Timeline — original: stagger-3 on wrapper */}
        <section className="max-w-4xl mx-auto">
          <div className="mb-24 stagger-3">
            {/* Sticky heading — original: font-display-hero text-headline-md(32px/40px/500) md:text-headline-lg(48px/56px/600) */}
            <div className="sticky top-24 md:top-40 bg-paper-cream/90 backdrop-blur-sm z-30 py-4 mb-12 border-b border-champagne-silk/30 flex items-baseline gap-4">
              <h2 className="font-display-hero text-headline-md leading-headline-md font-medium md:text-headline-lg md:leading-headline-lg md:font-semibold text-charcoal-ink">The Celebration</h2>
              {/* Original: font-utility-mono = 14px/20px/500 */}
              <span className="font-utility-mono text-utility-mono leading-utility-mono font-medium text-charcoal-ink/60 italic tracking-wider uppercase">June 22, 2024</span>
            </div>

            <div className="relative border-l-2 border-champagne-silk/30 ml-4 md:ml-8 pl-8 md:pl-16 flex flex-col gap-16">
              {/* Ceremony */}
              <div className="relative group">
                <div className="absolute -left-[37px] md:-left-[69px] top-2 w-4 h-4 rounded-full gold-leaf-dot outline outline-4 outline-paper-cream" />
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <div className="md:w-1/4 shrink-0">
                    <span className="font-utility-mono text-utility-mono leading-utility-mono text-charcoal-ink font-semibold tracking-tighter">4:00 PM</span>
                  </div>
                  <div className="flex-1">
                    {/* Original: text-headline-md-mobile is NOT defined in schedule config → no-op on mobile. md:text-headline-md = 32px/40px/500 */}
                    <h3 className="font-display-hero text-headline-md-mobile md:text-headline-lg-mobile md:leading-headline-lg-mobile md:font-semibold text-charcoal-ink mb-3">The Ceremony</h3>
                    <p className="text-body-md leading-body-md text-charcoal-ink/70 mb-4 leading-relaxed">Join us as we exchange our vows and start our new chapter together.</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {/* Original: font-label-sm text-[10px] tracking-widest font-bold */}
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-champagne-silk/30 text-charcoal-ink text-[10px] tracking-widest uppercase font-bold">Formal Attire</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cocktail Hour */}
              <div className="relative group">
                <div className="absolute -left-[37px] md:-left-[69px] top-2 w-4 h-4 rounded-full gold-leaf-dot outline outline-4 outline-paper-cream" />
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <div className="md:w-1/4 shrink-0">
                    <span className="font-utility-mono text-utility-mono leading-utility-mono text-charcoal-ink font-semibold tracking-tighter">5:30 PM</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display-hero text-headline-md-mobile md:text-headline-lg-mobile md:leading-headline-lg-mobile md:font-semibold text-charcoal-ink mb-3">Cocktail Hour</h3>
                    <p className="text-body-md leading-body-md text-charcoal-ink/70 mb-4 leading-relaxed">Enjoy signature drinks and light hors d&apos;oeuvres in the garden courtyard.</p>
                  </div>
                </div>
              </div>

              {/* Dinner & Dancing */}
              <div className="relative group">
                <div className="absolute -left-[37px] md:-left-[69px] top-2 w-4 h-4 rounded-full gold-leaf-dot outline outline-4 outline-paper-cream" />
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <div className="md:w-1/4 shrink-0">
                    <span className="font-utility-mono text-utility-mono leading-utility-mono text-charcoal-ink font-semibold tracking-tighter">7:00 PM</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display-hero text-headline-md-mobile md:text-headline-lg-mobile md:leading-headline-lg-mobile md:font-semibold text-charcoal-ink mb-3">Dinner &amp; Dancing</h3>
                    <p className="text-body-md leading-body-md text-charcoal-ink/70 mb-4 leading-relaxed">A seated dinner followed by a night of celebration, music, and joy on the dance floor.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Cards — original: stagger-4 */}
        {/* Original card label: <span class="font-label-sm uppercase tracking-[0.15em] text-charcoal-ink"> */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 stagger-4">
          <span
            className="group relative overflow-hidden bg-surface-container-low border border-champagne-silk/20 p-8 flex flex-col items-center justify-center text-center h-48 transition-colors duration-500 shadow-[0_-4px_20px_rgba(26,26,26,0.04)] opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
          >
            <span className="material-symbols-outlined text-3xl mb-4 text-charcoal-ink group-hover:text-cinematic-gold transition-colors">calendar_add_on</span>
            <span className="text-label-sm leading-label-sm font-semibold uppercase tracking-[0.15em] text-charcoal-ink">Add to Calendar</span>
          </span>
          <button
            type="button"
            onClick={() => openDrawer('stay-drawer')}
            className="group relative overflow-hidden bg-surface-container-low border border-champagne-silk/20 p-8 flex flex-col items-center justify-center text-center h-48 hover:border-cinematic-gold transition-colors duration-500 shadow-[0_-4px_20px_rgba(26,26,26,0.04)]"
          >
            <span className="material-symbols-outlined text-3xl mb-4 text-charcoal-ink group-hover:text-cinematic-gold transition-colors">hotel</span>
            <span className="text-label-sm leading-label-sm font-semibold uppercase tracking-[0.15em] text-charcoal-ink">Where to Stay</span>
          </button>
          <button
            type="button"
            onClick={() => openDrawer('map-drawer')}
            className="group relative overflow-hidden bg-surface-container-low border border-champagne-silk/20 p-8 flex flex-col items-center justify-center text-center h-48 hover:border-cinematic-gold transition-colors duration-500 shadow-[0_-4px_20px_rgba(26,26,26,0.04)]"
          >
            <span className="material-symbols-outlined text-3xl mb-4 text-charcoal-ink group-hover:text-cinematic-gold transition-colors">map</span>
            <span className="text-label-sm leading-label-sm font-semibold uppercase tracking-[0.15em] text-charcoal-ink">Directions</span>
          </button>
        </section>
      </main>

      {/* ===== STAY DRAWER ===== */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col justify-end ${drawerId === 'stay-drawer' ? '' : 'pointer-events-none'}`}
      >
        <div
          className={`absolute inset-0 drawer-overlay transition-opacity duration-300 ${drawerId === 'stay-drawer' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => closeDrawer('stay-drawer')}
        />
        <div
          ref={stayPanelRef}
          className="bg-paper-cream w-full max-h-[751px] rounded-t-3xl shadow-2xl transform translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-auto flex flex-col border-t border-champagne-silk/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-champagne-silk/20 shrink-0">
            {/* Original: font-display-hero text-headline-md-mobile = 32px/40px */}
            <h3 className="font-display-hero text-headline-lg-mobile leading-headline-lg-mobile font-semibold text-charcoal-ink">Accommodations</h3>
            <button className="text-charcoal-ink hover:text-cinematic-gold transition-colors" onClick={() => closeDrawer('stay-drawer')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="overflow-y-auto p-6 md:p-8 flex-1">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-48 aspect-video md:aspect-square bg-surface-container-highest shrink-0 relative overflow-hidden">
                  <div className="absolute inset-2 border border-champagne-silk z-10 pointer-events-none" />
                </div>
                <div>
                  <h4 className="font-display-hero text-headline-lg-mobile leading-headline-lg-mobile font-semibold text-charcoal-ink mb-2">The Grand Hotel</h4>
                  <p className="text-body-md leading-body-md text-charcoal-ink/70 mb-4 leading-relaxed">Our primary room block is secured here. A luxury boutique hotel just 10 minutes from the venue.</p>
                  {/* Original: <span class="inline-block border border-cinematic-gold text-charcoal-ink px-6 py-2 font-label-sm uppercase tracking-widest ...">Book Room</span> */}
                  <span className="inline-block border border-cinematic-gold text-charcoal-ink px-6 py-2 text-label-sm leading-label-sm font-semibold uppercase tracking-widest transition-colors opacity-40 cursor-not-allowed" aria-disabled="true" title="Coming soon">Book Room</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAP DRAWER ===== */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col justify-end ${drawerId === 'map-drawer' ? '' : 'pointer-events-none'}`}
      >
        <div
          className={`absolute inset-0 drawer-overlay transition-opacity duration-300 ${drawerId === 'map-drawer' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => closeDrawer('map-drawer')}
        />
        <div
          ref={mapPanelRef}
          className="bg-paper-cream w-full h-[751px] rounded-t-3xl shadow-2xl transform translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-auto flex flex-col border-t border-champagne-silk/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-champagne-silk/20 shrink-0">
            <h3 className="font-display-hero text-headline-lg-mobile leading-headline-lg-mobile font-semibold text-charcoal-ink">Directions &amp; Map</h3>
            <button className="text-charcoal-ink hover:text-cinematic-gold transition-colors" onClick={() => closeDrawer('map-drawer')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 relative bg-surface-container-lowest">
            <div className="absolute inset-0 flex items-center justify-center flex-col text-charcoal-ink/40">
              <span className="material-symbols-outlined text-4xl mb-2">map</span>
              {/* Original: <span class="font-utility-mono uppercase tracking-[0.2em] text-xs"> */}
              <span className="font-utility-mono text-utility-mono leading-utility-mono font-medium uppercase tracking-[0.2em] text-xs">Map View rendering</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}