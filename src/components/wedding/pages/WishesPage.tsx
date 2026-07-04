'use client';

import { useState } from 'react';
import HeroBanner from '../HeroBanner';

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
      <HeroBanner title="Wishes & Blessings" />

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
          <div className="bg-white border border-champagne-silk/20 p-12 md:p-24 max-w-4xl mx-auto shadow-sm">
            <div className="text-center mb-20">
              <span className="text-cinematic-gold uppercase tracking-[0.5em] mb-6 block" style={{ fontSize: '12px', lineHeight: '16px', letterSpacing: '0.1em', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                Archive
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal-ink mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Contribute to the Heirloom
              </h2>
              <p className="text-charcoal-ink/60 italic">Share a wish, a memory, or a blessing for our journey together.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="relative group">
                  <input
                    className="peer w-full bg-transparent border-0 border-b border-charcoal-ink/10 py-4 focus:ring-0 focus:border-cinematic-gold transition-colors placeholder-transparent"
                    placeholder=" "
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <label className="absolute left-0 top-4 text-xs font-semibold text-cinematic-gold transition-all peer-focus:-top-4 peer-[:not(:placeholder-shown)]:-top-4 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Full Name
                  </label>
                </div>
                <div className="relative group">
                  <input
                    className="peer w-full bg-transparent border-0 border-b border-charcoal-ink/10 py-4 focus:ring-0 focus:border-cinematic-gold transition-colors placeholder-transparent"
                    placeholder=" "
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <label className="absolute left-0 top-4 text-xs font-semibold text-cinematic-gold transition-all peer-focus:-top-4 peer-[:not(:placeholder-shown)]:-top-4 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Relationship
                  </label>
                </div>
              </div>

              <div className="relative group">
                <textarea
                  className="peer w-full bg-transparent border-0 border-b border-charcoal-ink/10 py-4 focus:ring-0 focus:border-cinematic-gold transition-colors placeholder-transparent resize-none"
                  placeholder=" "
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <label className="absolute left-0 top-4 text-xs font-semibold text-cinematic-gold transition-all peer-focus:-top-4 peer-[:not(:placeholder-shown)]:-top-4 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Your Message
                </label>
              </div>

              <div className="group">
                <div className="border border-dashed border-champagne-silk/60 p-16 text-center hover:bg-paper-cream/50 transition-all cursor-pointer relative">
                  <span className="material-symbols-outlined text-cinematic-gold mb-4 text-4xl">upload_file</span>
                  <p className="text-xs font-semibold text-charcoal-ink/60 uppercase tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Upload a moment or portrait
                  </p>
                  <p className="text-[10px] mt-3 text-charcoal-ink/30 uppercase tracking-widest">JPG, PNG UP TO 10MB</p>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  className={`text-paper-cream px-16 py-6 group/btn flex items-center gap-4 uppercase transition-all duration-700 ${
                    submitting
                      ? 'opacity-50 pointer-events-none'
                      : submitted
                      ? ''
                      : 'hover:bg-cinematic-gold'
                  }`}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    fontFamily: "'Inter', sans-serif",
                    backgroundColor: submitted ? '#10B981' : '#1A1A1A',
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : submitted ? (
                    <>
                      <span className="material-symbols-outlined">check_circle</span> WOVEN
                    </>
                  ) : (
                    <>
                      Weave into Archive
                      <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-2">arrow_right_alt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}