'use client';

import { useState } from 'react';
import SectionBanner from '../SectionBanner';

const WISHES = [
  {
    type: 'image',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQpPVCF_wPzxdxviXS1bA23h7owYEOhf8AdYzMj_9jEhL197yuR1FrPrxvhn8i0gQx_ymdPaeHz3E8o7hG3AHyFVtie3Ui4Q7e3Y7tWj8eWMC9uLbZaroGba27vEWYBtLypksUMnUEVnsJvTPDmX7a3aCGjrA47IJolG5FRrKbLKsgAciiRlNYqm7pd6PrtyvEWphw6Ckas_Jp6jkE_Fef5mfQjdt3OlTJfsQOfoWCnSC-IJteEQ0KFrwWITuhjo5_5VS7RL34j_kO',
    role: 'Maid of Honor',
    quote: '"To a love that feels like home and looks like poetry."',
    author: 'Elena Vance',
  },
  {
    type: 'text-card',
    quote: '"Watching you both grow together has been the highlight of our decade. May your journey ahead be as vibrant as the silk of your traditions and as strong as the ink of your vows."',
    author: 'The Harrison Family',
  },
  {
    type: 'dark-card',
    quote: 'The art of a good marriage is in the small details. The morning coffee, the shared silence, and the unwavering support.',
    author: 'Grandmother Rose',
  },
  {
    type: 'image',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIo9FSsp1H3KemSnsHFN9Kmplyilf5vqvEHyiSIYJ6mNQ_hui1SEYOFDn6v2uALIWIavlJXtaHgWhZv0splzeYjWkFMFD027D3ka96IvNt1dOhulLE26YW7l7o9lC4K28JT_IuNibN880fHxpwDCqPBdksFEn_7hwZwxDaI41SyFIRhOMnwfqk3VJ8L7NhuZz-4mfhWoPzjmF2azXU5Oze4LXPJZLNG4V8fSg6PF-rPn_nLB0vXqpaf1CjMyalpUE0LOvcDn7-PIjA',
    role: 'Brother & Confidant',
    quote: '"May your quiet moments be as beautiful as your loudest celebrations."',
    author: 'Marcus Thorne',
  },
  {
    type: 'minimal',
    quote: 'Distance could never diminish the joy we feel today. Sending all our blessings from across the ocean. We are there with you in spirit.',
    author: 'SOPHIE & LIAM · COUSINS',
  },
];

export default function WishesPage() {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, relationship, message }),
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setRelationship('');
        setMessage('');
      }, 3000);
    }, 1500);
  };

  return (
    <>
      <SectionBanner title="Wishes & Blessings" />

      <main className="pb-section-gap px-4 md:px-canvas-margin max-w-[1440px] mx-auto min-h-screen pt-[20px] md:pt-[40px]">
        {/* Intro */}
        <section className="max-w-[1440px] mx-auto px-8 md:px-canvas-margin mb-24 text-center">
          <span className="text-cinematic-gold uppercase mb-4 block tracking-[0.4em]" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
            The Living Heirloom
          </span>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-charcoal-ink/70 leading-relaxed italic">
            A curated sanctuary of wisdom and love from those we cherish most.
          </p>
        </section>

        {/* Masonry Wish Cards */}
        <section className="max-w-[1440px] mx-auto px-8 md:px-canvas-margin mb-32">
          <div className="masonry-grid">
            {WISHES.map((wish, i) => (
              <div key={i} className="wish-card">
                {wish.type === 'image' && (
                  <>
                    <div className="inner-frame mb-8 overflow-hidden group">
                      <img
                        alt={wish.author}
                        className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105"
                        src={wish.img}
                      />
                    </div>
                    <div className="px-2">
                      <span
                        className="text-cinematic-gold mb-3 block uppercase"
                        style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                      >
                        {wish.role}
                      </span>
                      <h3 className="text-3xl italic mb-4 leading-tight">{wish.quote}</h3>
                      <p className="text-charcoal-ink/50">— {wish.author}</p>
                    </div>
                  </>
                )}

                {wish.type === 'text-card' && (
                  <div className="bg-white p-12 border border-champagne-silk/20 shadow-sm">
                    <div className="flex justify-center mb-10">
                      <span className="material-symbols-outlined text-cinematic-gold text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </div>
                    <p className="text-xl text-center leading-relaxed text-charcoal-ink/80 italic mb-10">
                      {wish.quote}
                    </p>
                    <div className="text-center">
                      <div className="h-px w-16 bg-cinematic-gold/30 mx-auto mb-6" />
                      <p
                        className="uppercase tracking-[0.2em] text-charcoal-ink"
                        style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                      >
                        {wish.author}
                      </p>
                    </div>
                  </div>
                )}

                {wish.type === 'dark-card' && (
                  <div className="bg-charcoal-ink text-paper-cream p-12">
                    <span className="text-7xl text-cinematic-gold/40 block mb-6" style={{ fontFamily: 'serif' }}>
                      &ldquo;
                    </span>
                    <p className="text-3xl leading-tight mb-12 italic">
                      {wish.quote}
                    </p>
                    <div className="pt-6 border-t border-paper-cream/10">
                      <p
                        className="tracking-[0.3em] uppercase"
                        style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                      >
                        {wish.author}
                      </p>
                    </div>
                  </div>
                )}

                {wish.type === 'minimal' && (
                  <div className="p-10 border-l-4 border-cinematic-gold bg-white/40">
                    <p className="text-2xl italic leading-relaxed mb-8">
                      {wish.quote}
                    </p>
                    <p
                      className="text-cinematic-gold tracking-widest"
                      style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                    >
                      {wish.author}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contribution Form */}
        <section className="max-w-[1440px] mx-auto px-8 md:px-canvas-margin mb-32">
          <div className="max-w-2xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-12">
              <p
                className="text-cinematic-gold uppercase tracking-[0.2em] mb-3"
                style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600 }}
              >
                YOUR TURN
              </p>
              <h2
                className="text-charcoal-ink italic"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '32px', lineHeight: '40px' }}
              >
                Contribute to the Heirloom
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-charcoal-ink/15 rounded px-4 py-3 text-[14px] text-charcoal-ink placeholder:text-charcoal-ink/40 focus:outline-none focus:border-cinematic-gold/50 transition-colors bg-white"
              />

              {/* Relationship */}
              <input
                type="text"
                placeholder="Relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full border border-charcoal-ink/15 rounded px-4 py-3 text-[14px] text-charcoal-ink placeholder:text-charcoal-ink/40 focus:outline-none focus:border-cinematic-gold/50 transition-colors bg-white"
              />

              {/* Your Message */}
              <textarea
                placeholder="Your Message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-charcoal-ink/15 rounded px-4 py-3 text-[14px] text-charcoal-ink placeholder:text-charcoal-ink/40 focus:outline-none focus:border-cinematic-gold/50 transition-colors resize-none bg-white"
              />

              {/* Upload area */}
              <div className="border-2 border-dashed border-charcoal-ink/15 rounded bg-paper-cream/40 py-8 text-center cursor-pointer hover:bg-paper-cream/70 transition-colors">
                <span className="material-symbols-outlined text-charcoal-ink/30 text-[32px] mb-2 block">cloud_upload</span>
                <p className="text-[14px] text-charcoal-ink/40">
                  Attach a photo or memento
                </p>
                <p className="text-[12px] text-charcoal-ink/25 mt-1">
                  JPG, PNG up to 10MB
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full rounded py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-all duration-300 ${
                  submitting
                    ? 'bg-charcoal-ink/60 text-paper-cream/60 cursor-default'
                    : submitted
                    ? 'bg-charcoal-ink/60 text-paper-cream/60 cursor-default'
                    : 'bg-charcoal-ink text-paper-cream hover:opacity-90 cursor-pointer'
                }`}
              >
                {submitting ? 'Submitting...' : submitted ? 'Woven' : 'Weave into Archive'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}