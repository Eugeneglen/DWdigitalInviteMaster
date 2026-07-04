'use client';

import HeroBanner from '../HeroBanner';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBZxkwieg-SjxgRYOZxJlQ1v05okmlTqzvosp-ANHaaCSQStncGv3ORTlPiE-uSYP7mQcE_wcB5Povhsm25x-eThbTLAYPt1XD-14RTSL9R5a1etGsU54CUWIwAK_4ckHoB-gD85mc-uqQwOckXVYmn0J7u0r6WkNQ2eFKKTBWBJ8yU_nirHHy8GC7vKRVnGPL6P_TymHuuKnjM3ERN9Zvho_5v7pICElncd6F8dHF-lVKppvz4kKyQe9je7CIDwOSBlcyxaGU6yY-D';

const CHAPTER1_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQPSczTWgJLZS_vzNbN6wuPsTVw72YpOY0ldIaXb2nEM0DjbAoH__IyOfEvlXkIvif3k6TiVwdgbsAPvCUuustCXJ5ogM8o9Mf8qfnHNM052duEcCK8KPbJVfqn8sOuo9cpUPx6XWqHpBxvEfinvKzqiiI7zy3XkVYQ7w0ElfPw1kVlE-oTiwbdti2a6Q3pUBuogYx0KyKtviULD2olRj3ZTd29I37Yi80hUtQtS9LWTuKEtFJvAKUdLp2wmjdEM8om4Ku67LEDI4t';

const PROPOSAL_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzzvAxvGICtmDJ5Ase_8SKR0gvAAqXe_96pLSdSUEjYyVgenag3qekxDbjpLG_SXknWJEoOXPP_XcdU4WMSloZvzj9Pn-dxdG0BBlp0lglCSzzoxLL3-2CaKrawuVRqBglPiiimHDNTlMHai2pnrr404Xg8EgQq8tdW5qRhs-bx2k6N52M80DDUW27KtR0Nc4-WkNjwCsNX8XuiyHBZTqdhpBqml323YRMNj-0offH-_Sn3jp1yxw-EAZs939pzoyGzEfpRwsteoXv';

const TIDBITS = [
  {
    q: 'Who said "I love you" first?',
    a: 'It was mutual, during a particularly chaotic road trip where we got hopelessly lost but completely enjoyed the detour.',
  },
  {
    q: 'Favorite shared hobby?',
    a: 'Collecting vintage records and spending Sunday mornings listening to them while attempting to perfect our French press technique.',
  },
];

export default function StoryPage() {
  return (
    <>
      <HeroBanner title="Our Story" />

      <main className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px]">
        {/* Hero Section */}
        <section className="max-w-[900px] mx-auto mb-20 flex flex-col items-center justify-center text-center">
          <p className="text-charcoal-ink max-w-2xl mx-auto opacity-80 mb-12 italic" style={{ fontSize: '18px', lineHeight: '32px' }}>
            A narrative woven through time, capturing the moments that led us here.
          </p>
          <div className="w-full max-w-4xl aspect-[16/9] inner-frame bg-surface-container-high overflow-hidden shadow-[0_20px_40px_rgba(26,26,26,0.08)]">
            <img alt="Our Story Hero" className="w-full h-full object-cover object-center" src={HERO_IMG} />
          </div>
        </section>

        {/* Timeline */}
        <section className="py-section-gap relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-champagne-silk/50 -translate-x-1/2" />
          <div className="flex flex-col gap-section-gap">
            {/* Milestone 1 */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full relative">
              <div
                className="absolute left-4 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cinematic-gold z-10"
                style={{ boxShadow: '0 0 10px rgba(212,175,55,0.5)' }}
              />
              <div className="w-full pl-12 md:pl-0 md:w-5/12 text-left md:text-right pr-0 md:pr-12 mb-8 md:mb-0">
                <span
                  className="text-cinematic-gold block mb-2 uppercase tracking-[0.2em]"
                  style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
                >
                  October 2018
                </span>
                <h3 className="text-charcoal-ink mb-4 italic" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '32px', lineHeight: '40px' }}>
                  The First Chapter
                </h3>
                <p className="text-charcoal-ink/80 italic leading-relaxed" style={{ fontSize: '16px', lineHeight: '24px' }}>
                  It began over accidentally swapped coffee orders at a local cafe. A simple mistake that sparked a conversation lasting hours, marking the quiet inception of a lifelong journey.
                </p>
              </div>
              <div className="w-full pl-12 md:pl-0 md:w-5/12 flex justify-start">
                <div className="w-full aspect-square inner-frame bg-surface-container overflow-hidden max-w-[400px]">
                  <img alt="The First Chapter" className="w-full h-full object-cover" src={CHAPTER1_IMG} />
                </div>
              </div>
            </div>

            {/* Milestone 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center justify-between w-full relative">
              <div
                className="absolute left-4 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cinematic-gold z-10"
                style={{ boxShadow: '0 0 10px rgba(212,175,55,0.5)' }}
              />
              <div className="w-full pl-12 md:pl-0 md:w-5/12 text-left pl-0 md:pl-12 mb-8 md:mb-0">
                <span
                  className="text-cinematic-gold block mb-2 uppercase tracking-[0.2em]"
                  style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
                >
                  December 2021
                </span>
                <h3 className="text-charcoal-ink mb-4 italic" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '32px', lineHeight: '40px' }}>
                  The Proposal
                </h3>
                <p className="text-charcoal-ink/80 italic leading-relaxed" style={{ fontSize: '16px', lineHeight: '24px' }}>
                  Underneath a canopy of winter stars in the mountains, a question was asked and answered. A moment frozen in time, framed by crisp air and profound certainty.
                </p>
              </div>
              <div className="w-full pl-12 md:pl-0 md:w-5/12 flex justify-end">
                <div className="w-full aspect-[3/4] inner-frame bg-surface-container overflow-hidden max-w-[350px]">
                  <img alt="The Proposal" className="w-full h-full object-cover" src={PROPOSAL_IMG} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tidbits */}
        <section className="py-section-gap">
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[48px] text-charcoal-ink mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, lineHeight: '56px' }}>
              Tidbits
            </h2>
            <p className="text-charcoal-ink/70 italic" style={{ fontSize: '16px', lineHeight: '24px' }}>
              A few things you might not know.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TIDBITS.map((item, i) => (
              <div
                key={i}
                className="p-8 border border-champagne-silk/30 bg-white/50 backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(26,26,26,0.04)] transition-all duration-300"
              >
                <h4 className="text-[22px] text-charcoal-ink mb-3 font-semibold" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '32px', lineHeight: '40px' }}>
                  {item.q}
                </h4>
                <p className="text-charcoal-ink/80 italic" style={{ fontSize: '16px', lineHeight: '24px' }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Honeymoon Widget */}
        <section className="py-section-gap">
          <div className="max-w-3xl mx-auto bg-surface-container-low border border-champagne-silk/20 p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-champagne-silk/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 text-center">
              <span className="material-symbols-outlined text-cinematic-gold text-[40px] mb-4">flight_takeoff</span>
              <h2 className="text-[32px] md:text-[48px] text-charcoal-ink mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, lineHeight: '56px' }}>
                Where Next?
              </h2>
              <p className="text-charcoal-ink/80 mb-10 italic" style={{ fontSize: '16px', lineHeight: '24px' }}>
                We are planning our first adventure as a married couple. Cast a vote or share a hidden gem you think we should explore.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
                <button className="px-8 py-4 border border-champagne-silk rounded-full text-charcoal-ink hover:bg-cinematic-gold hover:text-white hover:border-cinematic-gold transition-colors duration-300 uppercase tracking-widest text-[11px]" style={{ fontWeight: 600 }}>
                  Amalfi Coast
                </button>
                <button className="px-8 py-4 border border-champagne-silk rounded-full text-charcoal-ink hover:bg-cinematic-gold hover:text-white hover:border-cinematic-gold transition-colors duration-300 uppercase tracking-widest text-[11px]" style={{ fontWeight: 600 }}>
                  Kyoto
                </button>
              </div>
              <div className="w-full max-w-md mx-auto">
                <input
                  className="w-full bg-transparent border-0 border-b border-charcoal-ink/30 px-0 py-3 text-center text-charcoal-ink placeholder-charcoal-ink/40 focus:ring-0 focus:border-cinematic-gold transition-colors mb-6 italic"
                  placeholder="Or suggest a destination..."
                  type="text"
                  style={{ fontSize: '16px', lineHeight: '24px' }}
                />
                <button className="w-full bg-charcoal-ink text-paper-cream py-5 hover:opacity-90 transition-opacity tracking-[0.25em] text-[12px] font-semibold uppercase">
                  Submit Recommendation
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}