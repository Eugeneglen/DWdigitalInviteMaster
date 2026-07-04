'use client';

import SectionBanner from '../SectionBanner';

const CEREMONY_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAsLNSEjy771owdkkDbKTl1nE5oEzBQFVHob_HKiQb9eJb1X7I79-CxGjCPeKwCSHhwswJRqSrt3ox_aktMQUGlyzg6Eoo5R0aH6CYxxKj5f3uZCWdaDfZEIqmxwZd5DgdvCUWZfIdnNvixcYvcspOOFnGM2ThX9BPZz-ftetacA-b6CkxEEp9BdSatnTG55-e8tZz1jlG1euZgtw17iI67tcMGtR2azzCg8GvNH-xQPfUJlAXxGC3jU9Q7dbVZPK-xnHwtTl5eRNknueI';
const CELEBRATION_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC01POr_eFI2RUG86kAb7dHs-q12Kj6HzxEoXpnzTnJ9n_VB9_BJL6Iy8vtGixOWTn1jVNZKDjXNQkHSy9Gsa8KI5IomZe3968VCNWHhXNZ44gbgs5LCBp4_Axjbj72RJwN0BWAIEmrqH8lgR-_j2_9Ci79wI4t583OCS4YuDca-s2xldrzBhBM-KeS4GFVFDSQdzWRY-4chmwkFfFgO3g-S4VS_jae416SCd-357i_ix3m68zwnHtpBSxyXFSjZISZ_Z66Jlxj6Npv_Lo';

const TIMELINE_ITEMS = [
  {
    time: '4:00 PM',
    title: 'The Ceremony',
    description: 'Join us as we exchange our vows and start our new chapter together.',
    tag: 'Formal Attire',
  },
  {
    time: '5:30 PM',
    title: 'Cocktail Hour',
    description: 'Enjoy signature drinks and light hors d\'oeuvres in the garden courtyard.',
  },
  {
    time: '7:00 PM',
    title: 'Dinner & Dancing',
    description: 'A seated dinner followed by a night of celebration, music, and joy on the dance floor.',
  },
];

export default function SchedulePage() {
  return (
    <>
      <SectionBanner title="The Schedule" />

      <main className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px]">
        {/* Intro Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="aspect-[4/5] overflow-hidden rounded-lg">
            <img alt="The Ceremony" className="w-full h-full object-cover" src={CEREMONY_IMG} />
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-lg">
            <img alt="The Celebration" className="w-full h-full object-cover" src={CELEBRATION_IMG} />
          </div>
        </div>

        <section className="mb-24 text-center">
          <p className="text-charcoal-ink/70 max-w-2xl mx-auto italic" style={{ fontSize: '18px', lineHeight: '32px' }}>
            Saturday, June 22, 2024
          </p>
        </section>

        {/* Timeline */}
        <section className="max-w-4xl mx-auto">
          <div className="mb-24">
            <div className="sticky top-24 md:top-40 bg-paper-cream/90 backdrop-blur-sm z-30 py-4 mb-12 border-b border-champagne-silk/30 flex items-baseline gap-4">
              <h2 className="text-[32px] md:text-[48px] text-charcoal-ink" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, lineHeight: '56px' }}>
                The Celebration
              </h2>
              <span className="text-charcoal-ink/60 italic tracking-wider uppercase" style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500 }}>
                June 22, 2024
              </span>
            </div>

            <div className="relative border-l-2 border-champagne-silk/30 ml-4 md:ml-8 pl-8 md:pl-16 flex flex-col gap-16">
              {TIMELINE_ITEMS.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Gold dot marker */}
                  <div
                    className="absolute -left-[37px] md:-left-[69px] top-2 w-4 h-4 rounded-full outline outline-4 outline-paper-cream"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6AD 50%, #B8860B 100%)',
                      boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
                    }}
                  />
                  <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                    <div className="md:w-1/4 shrink-0">
                      <span className="text-charcoal-ink font-semibold tracking-tighter" style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500 }}>
                        {item.time}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-charcoal-ink mb-3"
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '32px', lineHeight: '40px' }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-charcoal-ink/70 mb-4 leading-relaxed" style={{ fontSize: '16px', lineHeight: '24px' }}>
                        {item.description}
                      </p>
                      {item.tag && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-champagne-silk/30 text-charcoal-ink uppercase tracking-widest font-bold" style={{ fontSize: '10px', fontWeight: 600 }}>
                            {item.tag}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <span
            className="group relative overflow-hidden bg-surface-container-low border border-champagne-silk/20 p-8 flex flex-col items-center justify-center text-center h-48 transition-colors duration-500 shadow-[0_-4px_20px_rgba(26,26,26,0.04)] opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
          >
            <span className="material-symbols-outlined text-3xl mb-4 text-charcoal-ink">calendar_add_on</span>
            <span className="uppercase tracking-[0.15em] text-charcoal-ink" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}>
              Add to Calendar
            </span>
          </span>
          <span
            className="group relative overflow-hidden bg-surface-container-low border border-champagne-silk/20 p-8 flex flex-col items-center justify-center text-center h-48 hover:border-cinematic-gold transition-colors duration-500 shadow-[0_-4px_20px_rgba(26,26,26,0.04)] opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
          >
            <span className="material-symbols-outlined text-3xl mb-4 text-charcoal-ink">hotel</span>
            <span className="uppercase tracking-[0.15em] text-charcoal-ink" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}>
              Where to Stay
            </span>
          </span>
          <span
            className="group relative overflow-hidden bg-surface-container-low border border-champagne-silk/20 p-8 flex flex-col items-center justify-center text-center h-48 hover:border-cinematic-gold transition-colors duration-500 shadow-[0_-4px_20px_rgba(26,26,26,0.04)] opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
          >
            <span className="material-symbols-outlined text-3xl mb-4 text-charcoal-ink">map</span>
            <span className="uppercase tracking-[0.15em] text-charcoal-ink" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}>
              Directions
            </span>
          </span>
        </section>
      </main>
    </>
  );
}