'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import SectionBanner from '../SectionBanner';

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

const DESTINATIONS_INIT = [
  { name: 'Amalfi Coast', votes: 0 },
  { name: 'Kyoto', votes: 0 },
];

export default function StoryPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [destinations, setDestinations] = useState(DESTINATIONS_INIT);
  const [votes, setVotes] = useState<Record<number, boolean>>({});
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleVote = useCallback((index: number) => {
    setVotes((prev) => {
      if (prev[index]) return prev; // already voted
      setDestinations((d) => {
        const updated = [...d];
        updated[index] = { ...updated[index], votes: updated[index].votes + 1 };
        return updated;
      });
      return { ...prev, [index]: true };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!suggestion.trim() || submitted) return;
    // In production, send to API
    setSubmitted(true);
  }, [suggestion, submitted]);

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    const els = container.querySelectorAll('.reveal');
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SectionBanner title="Our Story" />

      <main ref={mainRef} className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px]">
        {/* Hero Section */}
        <section className="reveal max-w-[900px] mx-auto mb-20 flex flex-col items-center justify-center text-center">
          <p className="text-charcoal-ink max-w-2xl mx-auto opacity-80 mb-12 italic" style={{ fontSize: '18px', lineHeight: '32px' }}>
            A narrative woven through time, capturing the moments that led us here.
          </p>
          <div className="w-full max-w-4xl aspect-[16/9] inner-frame bg-surface-container-high overflow-hidden shadow-[0_20px_40px_rgba(26,26,26,0.08)]">
            <img alt="Our Story Hero" className="w-full h-full object-cover object-center" src={HERO_IMG} />
          </div>
        </section>

        {/* Timeline */}
        <section className="reveal py-section-gap relative">
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
        <section className="reveal py-section-gap">
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
                <h4 className="font-headline-md text-[22px] text-charcoal-ink mb-3 font-semibold">
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
        <section className="reveal py-section-gap">
          <div className="max-w-2xl mx-auto text-center">
            <p
              className="text-cinematic-gold uppercase tracking-[0.2em] mb-3"
              style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
            >
              AFTER THE &lsquo;I DO&rsquo;
            </p>
            <h2
              className="text-charcoal-ink mb-3 italic"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '40px', lineHeight: '48px' }}
            >
              Where Next?
            </h2>
            <p
              className="text-charcoal-ink/60 mb-10 italic"
              style={{ fontSize: '16px', lineHeight: '24px' }}
            >
              Help us choose our honeymoon destination. Cast your vote!
            </p>

            {/* Destination cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {destinations.map((dest, i) => (
                <button
                  key={dest.name}
                  type="button"
                  className={`bg-white border rounded-lg py-6 px-4 text-center transition-colors duration-200 cursor-pointer ${
                    votes[i]
                      ? 'border-cinematic-gold bg-cinematic-gold/5'
                      : 'border-charcoal-ink/10 hover:border-cinematic-gold/40'
                  }`}
                  onClick={() => handleVote(i)}
                >
                  <p
                    className="text-charcoal-ink font-semibold"
                    style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', lineHeight: '24px' }}
                  >
                    {dest.name}
                  </p>
                  <p
                    className="text-charcoal-ink/50 mt-1"
                    style={{ fontSize: '14px', lineHeight: '20px' }}
                  >
                    {dest.votes} {dest.votes === 1 ? 'vote' : 'votes'}
                  </p>
                </button>
              ))}
            </div>

            {/* Suggest input + submit */}
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Suggest a destination..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="flex-1 bg-white border border-charcoal-ink/10 rounded-lg px-4 py-2.5 text-[14px] text-charcoal-ink placeholder:text-charcoal-ink/40 focus:outline-none focus:border-cinematic-gold/50 transition-colors"
              />
              <button
                type="button"
                className={`shrink-0 rounded-lg px-6 py-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-opacity duration-300 ${
                  submitted ? 'bg-charcoal-ink/60 text-paper-cream/60 cursor-default' : 'bg-charcoal-ink text-paper-cream hover:opacity-90 cursor-pointer'
                }`}
                onClick={handleSubmit}
              >
                {submitted ? 'Submitted' : 'Submit'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}