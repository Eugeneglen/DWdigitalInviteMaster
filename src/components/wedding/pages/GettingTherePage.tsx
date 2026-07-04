'use client';

import { useState } from 'react';
import SectionBanner from '../SectionBanner';

export default function GettingTherePage() {
  const [tab, setTab] = useState<'car' | 'transit'>('transit');

  return (
    <>
      <SectionBanner title="Getting There" subtitle="The Singapore EDITION, Orchard" />

      <main className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px] flex flex-col gap-8">
        {/* Address */}
        <section className="flex flex-col gap-6 max-w-md mx-auto w-full">
          <div className="space-y-4 text-center pb-2 pt-1">
            <h3
              className="text-xs uppercase tracking-[0.2em] text-cinematic-gold font-bold"
              style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
            >
              ADDRESS
            </h3>
            <div>
              <p className="text-xl text-charcoal-ink font-semibold" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '32px', lineHeight: '40px' }}>
                The Singapore EDITION
              </p>
              <p className="text-charcoal-ink/70 italic mt-1" style={{ fontSize: '16px', lineHeight: '24px' }}>
                38 Cuscaden Road, Singapore 249731
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 border-b border-champagne-silk/30">
            <button
              className={`flex-1 pb-4 font-medium transition-colors duration-300 ${
                tab === 'car'
                  ? 'text-charcoal-ink border-b-2 border-charcoal-ink font-bold'
                  : 'text-charcoal-ink/40'
              }`}
              style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: tab === 'car' ? 600 : 500, textTransform: 'uppercase' }}
              onClick={() => setTab('car')}
            >
              BY CAR
            </button>
            <button
              className={`flex-1 pb-4 font-medium transition-colors duration-300 ${
                tab === 'transit'
                  ? 'text-charcoal-ink border-b-2 border-charcoal-ink font-bold'
                  : 'text-charcoal-ink/40'
              }`}
              style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: tab === 'transit' ? 600 : 500, textTransform: 'uppercase' }}
              onClick={() => setTab('transit')}
            >
              PUBLIC TRANSIT
            </button>
          </div>
        </section>

        {/* Tab Content: By Car */}
        {tab === 'car' && (
          <section className="max-w-md mx-auto w-full">
            <div className="col-span-2 space-y-8 py-4">
              <div className="space-y-4">
                <h3
                  className="text-xs uppercase tracking-[0.2em] text-cinematic-gold font-bold"
                  style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
                >
                  PARKING
                </h3>
                <div className="space-y-2">
                  <p className="text-charcoal-ink/80 leading-relaxed" style={{ fontSize: '16px', lineHeight: '24px' }}>
                    Valet parking is available at the hotel entrance. Alternatively, guests may utilise the hotel&apos;s basement car park, subject to availability.
                  </p>
                  <p className="text-sm text-charcoal-ink/60 leading-relaxed">
                    Kindly inform the concierge that you are attending the Dreamweavers event.
                  </p>
                </div>
              </div>
              <div className="border-t border-champagne-silk/30 pt-8 space-y-4">
                <h3
                  className="text-xs uppercase tracking-[0.2em] text-cinematic-gold font-bold"
                  style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
                >
                  FROM THE AIRPORT
                </h3>
                <p className="text-charcoal-ink/80 leading-relaxed" style={{ fontSize: '16px', lineHeight: '24px' }}>
                  Via CTE / Orchard Road, the journey from Singapore Changi Airport is approximately 25–30 minutes, subject to traffic conditions.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Tab Content: Public Transit */}
        {tab === 'transit' && (
          <section className="max-w-md mx-auto w-full">
            <div className="col-span-2 space-y-8 py-4">
              <div className="space-y-4">
                <h3
                  className="text-xs uppercase tracking-[0.2em] text-cinematic-gold font-bold"
                  style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
                >
                  MRT
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xl text-charcoal-ink font-semibold" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '20px' }}>
                      Orchard Boulevard MRT Station{' '}
                      <span className="text-charcoal-ink/50 not-italic" style={{ fontSize: '16px' }}>(TE13)</span>
                    </p>
                    <p className="text-charcoal-ink/70 italic mt-1" style={{ fontSize: '16px', lineHeight: '24px' }}>
                      Approximately 4–5 minutes&apos; walk to the venue.
                    </p>
                  </div>
                  <div>
                    <p className="text-xl text-charcoal-ink font-semibold" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '20px' }}>
                      Orchard MRT Station{' '}
                      <span className="text-charcoal-ink/50 not-italic" style={{ fontSize: '16px' }}>(NS22/TE14)</span>
                    </p>
                    <p className="text-charcoal-ink/70 italic mt-1" style={{ fontSize: '16px', lineHeight: '24px' }}>
                      Approximately 8–10 minutes&apos; walk to the venue.
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-champagne-silk/30 pt-8 space-y-4">
                <h3
                  className="text-xs uppercase tracking-[0.2em] text-cinematic-gold font-bold"
                  style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
                >
                  BUS
                </h3>
                <div className="space-y-2">
                  <p className="text-charcoal-ink/80 leading-relaxed" style={{ fontSize: '16px', lineHeight: '24px' }}>
                    Guests may alight at{' '}
                    <span className="font-semibold text-charcoal-ink">Bef Tomlinson Rd (09121)</span> or{' '}
                    <span className="font-semibold text-charcoal-ink">Opp Four Seasons Hotel (09111)</span>, both of which are about a 2-minute walk from the venue.
                  </p>
                  <p className="text-sm text-charcoal-ink/60 leading-relaxed">
                    Available bus services:{' '}
                    <span className="italic">7, 36, 36A, 36B, 77, 105, 106, 111, 123, 132, 174, and 174e</span>.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}