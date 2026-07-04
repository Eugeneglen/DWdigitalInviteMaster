'use client';

import { useState } from 'react';
import SectionBanner from '../SectionBanner';

const FAQS = [
  {
    question: 'What is the dress code for the evening reception?',
    answer: 'The evening calls for Black Tie Optional. We encourage our guests to embrace the elegance of the venue. For gentlemen, a dark suit or tuxedo is appropriate. For ladies, floor-length gowns or sophisticated cocktail attire is preferred.',
  },
  {
    question: 'Is transportation provided to the venue?',
    answer: 'Yes. For guests staying at our recommended hotels, dedicated luxury shuttles will depart from the main lobbies at exactly 4:15 PM on Saturday. Return transport will run every thirty minutes from 11:00 PM onwards.',
  },
  {
    question: 'Are children invited to the celebration?',
    answer: "While we adore the little ones in our lives, our wedding weekend will be an adult-only affair (18+), allowing everyone to relax and fully immerse themselves in the evening's festivities.",
  },
  {
    question: 'How should I inform you of dietary requirements?',
    answer: 'Our culinary team is prepared to accommodate all medical and ethical dietary restrictions. You will be prompted to detail any specific allergies or preferences when completing the formal RSVP process.',
  },
];

export default function QAPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <>
      <SectionBanner title="Frequently Asked" />

      <main className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px]">
        {/* Intro */}
        <section className="animate-orchestral max-w-[900px] mx-auto mb-20 text-center">
          <p
            className="text-charcoal-ink/70 max-w-2xl mx-auto leading-relaxed italic"
            style={{ fontSize: '18px', lineHeight: '32px' }}
          >
            Everything you need to know for our celebration.
          </p>
        </section>

        {/* Accordion */}
        <section className="max-w-[800px] mx-auto mb-section-gap">
          <div className="border-t border-cinematic-gold/30">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <article key={idx} className={`animate-orchestral delay-${(idx + 1) * 100} border-b border-cinematic-gold/30 group`}>
                  <button
                    className="w-full py-10 flex justify-between items-center text-left focus:outline-none"
                    onClick={() => toggle(idx)}
                  >
                    <h3
                      className="text-charcoal-ink group-hover:text-cinematic-gold transition-colors duration-300 pr-8"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, fontSize: '22px' }}
                    >
                      {faq.question}
                    </h3>
                    <span
                      className={`text-cinematic-gold flex-shrink-0 transition-transform duration-400 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined">expand_more</span>
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden px-2 transition-all duration-500 ease-in-out ${
                      isOpen ? 'max-h-[500px] opacity-100 pb-10' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p
                      className="text-charcoal-ink/80 leading-relaxed"
                      style={{ fontSize: '18px', lineHeight: '32px' }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="animate-orchestral delay-400 max-w-2xl mx-auto bg-paper-cream/40 py-16 px-8 text-center">
          <p
            className="text-cinematic-gold uppercase tracking-[0.2em] mb-3"
            style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
          >
            NEED MORE HELP?
          </p>
          <h2
            className="text-charcoal-ink italic mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '32px', lineHeight: '40px' }}
          >
            Still Seeking Clarity?
          </h2>
          <p className="text-charcoal-ink/60 mb-10 max-w-md mx-auto" style={{ fontSize: '16px', lineHeight: '24px' }}>
            Our concierge is standing by to assist with any questions about the event, travel, accommodations, or special arrangements.
          </p>
          <button className="bg-charcoal-ink text-paper-cream rounded px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] hover:opacity-90 transition-opacity duration-300 inline-flex items-center gap-2.5">
            <span className="material-symbols-outlined text-paper-cream" style={{ fontSize: '18px' }}>mail</span>
            Message the Couple
          </button>
        </section>
      </main>
    </>
  );
}