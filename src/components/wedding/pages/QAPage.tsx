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
        <section className="animate-orchestral delay-400 max-w-[1000px] mx-auto bg-white border border-cinematic-gold/20 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-[0_4px_40px_rgba(26,26,26,0.02)]">
          <div className="z-10 flex-1 text-center md:text-left">
            <h2
              className="text-charcoal-ink mb-4"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '32px', lineHeight: '40px' }}
            >
              Still seeking clarity?
            </h2>
            <p className="text-charcoal-ink/70 mb-8 max-w-md mx-auto md:mx-0" style={{ fontSize: '16px', lineHeight: '24px' }}>
              For highly specific inquiries or logistical support not covered above, our dedicated concierge is available via direct message.
            </p>
            <button className="group inline-flex items-center gap-4 bg-charcoal-ink text-paper-cream rounded px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] hover:opacity-90 transition-opacity duration-300">
              <span className="material-symbols-outlined text-[20px]">forum</span>
              Message the Couple
            </button>
          </div>
          <div className="z-10 hidden md:flex items-center justify-center w-56 h-56 rounded-full border border-cinematic-gold/20 flex-shrink-0 relative">
            <div className="absolute inset-4 border border-cinematic-gold/10 rounded-full animate-[spin_40s_linear_infinite]" />
            <span className="material-symbols-outlined text-[72px] text-cinematic-gold/60">mark_email_unread</span>
          </div>
        </section>
      </main>
    </>
  );
}