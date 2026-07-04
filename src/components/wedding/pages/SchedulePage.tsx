'use client';

import { useCallback } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';

const CEREMONY_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAsLNSEjy771owdkkDbKTl1nE5oEzBQFVHob_HKiQb9eJb1X7I79-CxGjCPeKwCSHhwswJRqSrt3ox_aktMQUGlyzg6Eoo5R0aH6CYxxKj5f3uZCWdaDfZEIqmxwZd5DgdvCUWZfIdnNvixcYvcspOOFnGM2ThX9BPZz-ftetacA-b6CkxEEp9BdSatnTG55-e8tZz1jlG1euZgtw17iI67tcMGtR2azzCg8GvNH-xQPfUJlAXxGC3jU9Q7dbVZPK-xnHwtTl5eRNknueI';
const CELEBRATION_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC01POr_eFI2RUG86kAb7dHs-q12Kj6HzxEoXpnzTnJ9n_VB9_BJL6Iy8vtGixOWTn1jVNZKDjXNQkHSy9Gsa8KI5IomZe3968VCNWHhXNZ44gbgs5LCBp4_Axjbj72RJwN0BWAIEmrqH8lgR-_j2_9Ci79wI4t583OCS4YuDca-s2xldrzBhBM-KeS4GFVFDSQdzWRY-4chmwkFfFgO3g-S4VS_jae416SCd-357i_ix3m68zwnHtpBSxyXFSjZISZ_Z66Jlxj6Npv_Lo';

const BANNER_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA-OyKfcsxXAmZDArHbDXl1cVCgGUG5liFPzyHdVvMG6_4jN9pNTrN9GCrkdnegli9UPJUSPs39KJRsRP7AiLem4xYS-q1ZYq1T3DAIqyvn3wAvbdkoMVkufft0SpQw4gDTPSnIml6k62lRYobUrNu70UGIILiMZQ0fAydTXXwVZ1oswQZ-mjPT8H9mDDqfhxsMSI5zla8GKz_ILXbmdRjtRUk682dPEDBD6I81DzEx7dITgjb6vxQoee5599jkYf_vCYP7npydvxqx';

export default function SchedulePage() {
  const { setSection } = useNavigationStore();

  const handleAddToCalendar = useCallback(() => {
    const weddingDate = new Date('2024-06-22T16:00:00');
    const endDate = new Date('2024-06-22T23:00:00');

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatICSDate = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Eleanor & James Wedding//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(weddingDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      'SUMMARY:Eleanor & James Wedding',
      'DESCRIPTION:Join us for our wedding celebration! Ceremony at 4:00 PM, followed by cocktail hour, dinner, and dancing.',
      'LOCATION:The Grand Estate',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eleanor-james-wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

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

            <div className="relative border-l border-champagne-silk/40 ml-4 md:ml-8 pl-8 md:pl-16 flex flex-col gap-16">
              {/* Ceremony */}
              <div className="relative group">
                <div className="absolute -left-[calc(2px+7px)] md:-left-[calc(2px+7px)] top-2.5 w-[6px] h-[6px] rounded-full bg-cinematic-gold" />
                <div className="flex flex-col gap-2">
                  <span className="inline-block self-start px-2.5 py-1 rounded bg-champagne-silk/40 text-[11px] font-medium uppercase tracking-widest text-charcoal-ink/70 mb-1">4:00 PM</span>
                  <h3 className="font-display-hero text-headline-md-mobile md:text-headline-lg-mobile md:leading-headline-lg-mobile md:font-semibold text-charcoal-ink">The Ceremony</h3>
                  <p className="text-body-md leading-body-md text-charcoal-ink/70 leading-relaxed">Join us as we exchange our vows and start our new chapter together.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-champagne-silk/30 text-charcoal-ink text-[10px] tracking-widest uppercase font-bold">Formal Attire</span>
                  </div>
                </div>
              </div>

              {/* Cocktail Hour */}
              <div className="relative group">
                <div className="absolute -left-[calc(2px+7px)] md:-left-[calc(2px+7px)] top-2.5 w-[6px] h-[6px] rounded-full bg-cinematic-gold" />
                <div className="flex flex-col gap-2">
                  <span className="inline-block self-start px-2.5 py-1 rounded bg-champagne-silk/40 text-[11px] font-medium uppercase tracking-widest text-charcoal-ink/70 mb-1">5:30 PM</span>
                  <h3 className="font-display-hero text-headline-md-mobile md:text-headline-lg-mobile md:leading-headline-lg-mobile md:font-semibold text-charcoal-ink">Cocktail Hour</h3>
                  <p className="text-body-md leading-body-md text-charcoal-ink/70 leading-relaxed">Enjoy signature drinks and light hors d&apos;oeuvres in the garden courtyard.</p>
                </div>
              </div>

              {/* Dinner & Dancing */}
              <div className="relative group">
                <div className="absolute -left-[calc(2px+7px)] md:-left-[calc(2px+7px)] top-2.5 w-[6px] h-[6px] rounded-full bg-cinematic-gold" />
                <div className="flex flex-col gap-2">
                  <span className="inline-block self-start px-2.5 py-1 rounded bg-champagne-silk/40 text-[11px] font-medium uppercase tracking-widest text-charcoal-ink/70 mb-1">7:00 PM</span>
                  <h3 className="font-display-hero text-headline-md-mobile md:text-headline-lg-mobile md:leading-headline-lg-mobile md:font-semibold text-charcoal-ink">Dinner &amp; Dancing</h3>
                  <p className="text-body-md leading-body-md text-charcoal-ink/70 leading-relaxed">A seated dinner followed by a night of celebration, music, and joy on the dance floor.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons — flat bordered style matching reference design */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 stagger-4">
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="w-full sm:w-auto border border-charcoal-ink/15 bg-white rounded px-8 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold transition-colors duration-300"
          >
            Add to Calendar
          </button>
          <button
            type="button"
            onClick={() => setSection('getting-there')}
            className="w-full sm:w-auto border border-charcoal-ink/15 bg-white rounded px-8 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold transition-colors duration-300"
          >
            Directions
          </button>
        </section>
      </main>
    </>
  );
}