'use client';

import { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

interface Guest {
  name: string;
  dietary: string[];
}

const DIETARY_OPTIONS = ['Halal', 'Vegetarian', 'No Seafood'];

export default function RSVPPage() {
  return (
    <Suspense>
      <RSVPPageInner />
    </Suspense>
  );
}

function RSVPPageInner() {
  const searchParams = useSearchParams();

  // Parse URL params for auto-fill
  const autoFill = useMemo(() => {
    const paramFirst = searchParams.get('first');
    const paramLast = searchParams.get('last');
    const paramName = searchParams.get('name');
    const paramParty = searchParams.get('party');

    let first = '';
    let last = '';
    let party = 1;

    if (paramFirst && paramLast) {
      first = paramFirst;
      last = paramLast;
    } else if (paramName) {
      const parts = paramName.trim().split(/\s+/);
      first = parts[0] || '';
      last = parts.slice(1).join(' ') || '';
    }

    if (paramParty) {
      const n = parseInt(paramParty, 10);
      if (!isNaN(n) && n >= 1 && n <= 10) party = n;
    }

    return { first, last, party };
  }, [searchParams]);

  const [step, setStep] = useState(1);
  const [partySize, setPartySize] = useState(autoFill.party);
  const [guests, setGuests] = useState<Guest[]>([{ name: '', dietary: [] }]);
  const [done, setDone] = useState(false);
  const [firstName, setFirstName] = useState(autoFill.first);
  const [lastName, setLastName] = useState(autoFill.last);

  const submitStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    const fullName = firstName.trim() + ' ' + lastName.trim();
    const updated = [...guests];
    if (updated.length === 0) {
      updated.push({ name: fullName, dietary: [] });
    } else {
      updated[0] = { ...updated[0], name: fullName };
    }
    setGuests(updated);
    setStep(2);
  };

  const submitStep2 = () => {
    let updated = [...guests];
    while (updated.length < partySize) {
      updated.push({ name: 'Guest ' + (updated.length + 1), dietary: [] });
    }
    updated = updated.slice(0, partySize);
    setGuests(updated);
    setStep(3);
  };

  const changeParty = (delta: number) => {
    setPartySize((p) => Math.max(1, Math.min(10, p + delta)));
  };

  const updateGuestName = (i: number, val: string) => {
    setGuests((g) => {
      const updated = [...g];
      updated[i] = { ...updated[i], name: val };
      return updated;
    });
  };

  const toggleDietary = (guestIdx: number, option: string) => {
    setGuests((g) => {
      const updated = [...g];
      const current = updated[guestIdx].dietary;
      updated[guestIdx] = {
        ...updated[guestIdx],
        dietary: current.includes(option)
          ? current.filter((d) => d !== option)
          : [...current, option],
      };
      return updated;
    });
  };

  const addGuest = () => {
    setGuests((g) => [...g, { name: '', dietary: [] }]);
    setPartySize((p) => p + 1);
  };

  const handleFinalContinue = () => {
    const validGuests = guests.filter((g) => g.name.trim());
    if (validGuests.length === 0) return;
    // POST to API
    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests: validGuests }),
    }).catch(() => {});
    setDone(true);
  };

  if (done) {
    return (
      <main className="flex-1 w-full max-w-xl mx-auto px-6 pt-32 pb-20 flex flex-col">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-cinematic-gold text-[64px]">favorite</span>
          <h2 className="italic text-[36px] mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>Thank you</h2>
          <p className="text-[14px] text-charcoal-ink/70 mt-3 italic">
            Your RSVP has been received.<br />We can&apos;t wait to celebrate with you.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-6 pt-32 pb-20 flex flex-col">
      {/* Event header */}
      <div className="text-center mb-10">
        <h1 className="font-serif italic text-[40px] md:text-[52px] leading-tight text-charcoal-ink">Eleanor &amp; James</h1>
        <p className="mt-4 text-[15px] text-charcoal-ink/80">The Singapore EDITION, 38 Cuscaden Road</p>
        <p className="text-[15px] text-charcoal-ink/80">Singapore 249731</p>
      </div>

      {/* Progress dots — 3 steps now */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`step-dot ${n <= step ? 'active' : ''}`} />
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <section className="staggered-fade-in" style={{ animationDelay: '0s', opacity: 1 }}>
          <div className="text-center mb-8">
            <p className="font-semibold text-[15px] tracking-wide">Enter your name to RSVP</p>
            <p className="text-[13px] text-charcoal-ink/60 italic mt-2">
              You can respond for more guests in the following steps.
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/60 font-semibold">
                  First Name
                </label>
                <input
                  className="input-line"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/60 font-semibold">
                  Last Name
                </label>
                <input
                  className="input-line"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  autoComplete="family-name"
                />
              </div>
            </div>
            <button
              className="w-full bg-charcoal-ink text-paper-cream rounded px-8 py-3 text-[13px] font-medium uppercase tracking-[0.08em] hover:opacity-90 transition-opacity duration-300"
              onClick={submitStep1}
            >
              Next
            </button>
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="staggered-fade-in" style={{ animationDelay: '0s', opacity: 1 }}>
          <div className="text-center mb-8">
            <p className="font-semibold text-[15px] tracking-wide">How many people are in your party?</p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              className="w-12 h-12 border border-charcoal-ink/15 rounded flex items-center justify-center hover:border-charcoal-ink/40 transition-colors text-2xl bg-transparent"
              onClick={() => changeParty(-1)}
            >
              −
            </button>
            <div className="w-24 h-12 border border-charcoal-ink/30 flex items-center justify-center text-xl font-semibold">
              {partySize}
            </div>
            <button
              className="w-12 h-12 border border-charcoal-ink/15 rounded flex items-center justify-center hover:border-charcoal-ink/40 transition-colors text-2xl bg-transparent"
              onClick={() => changeParty(1)}
            >
              +
            </button>
          </div>
          <p className="text-center text-[13px] text-charcoal-ink/60 italic mb-8">
            Include yourself and anyone attending with you.
          </p>
          <div className="flex gap-3">
            <button
              className="flex-1 border border-charcoal-ink/15 bg-white rounded py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold transition-colors duration-300"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              className="flex-[2] bg-charcoal-ink text-paper-cream rounded px-8 py-3 text-[13px] font-medium uppercase tracking-[0.08em] hover:opacity-90 transition-opacity duration-300"
              onClick={submitStep2}
            >
              Next
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 — Confirm guests & dietary preferences */}
      {step === 3 && (
        <section className="staggered-fade-in" style={{ animationDelay: '0s', opacity: 1 }}>
          <div className="text-center mb-8">
            <p className="font-semibold text-[15px] tracking-wide">Confirm each guest and their dietary needs.</p>
            <p className="text-[13px] text-charcoal-ink/50 mt-1">
              Dietary selections are optional.
            </p>
          </div>

          <div className="space-y-6 mb-6">
            {guests.map((g, i) => (
              <div key={i} className="py-4 border-b border-charcoal-ink/10">
                {/* Guest number + name */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[13px] font-semibold text-cinematic-gold w-5 text-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    className="flex-1 bg-transparent outline-none text-[15px] border-b border-charcoal-ink/20 focus:border-cinematic-gold pb-1 transition-colors placeholder:text-charcoal-ink/40"
                    placeholder="Guest name"
                    value={g.name}
                    onChange={(e) => updateGuestName(i, e.target.value)}
                  />
                </div>

                {/* Dietary preference pills */}
                <div className="flex items-center gap-2 pl-8">
                  {DIETARY_OPTIONS.map((opt) => {
                    const selected = g.dietary.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 ${
                          selected
                            ? 'border-cinematic-gold bg-cinematic-gold/10 text-cinematic-gold'
                            : 'border-charcoal-ink/15 bg-transparent text-charcoal-ink/60 hover:border-charcoal-ink/40'
                        }`}
                        onClick={() => toggleDietary(i, opt)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Guest — dashed border */}
          <button
            type="button"
            className="w-full py-4 border border-dashed border-charcoal-ink/20 rounded text-[13px] text-charcoal-ink/50 hover:text-cinematic-gold hover:border-cinematic-gold/40 transition-colors mb-8"
            onClick={addGuest}
          >
            + Add Another Guest
          </button>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              className="flex-1 border border-charcoal-ink/15 bg-white rounded py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold transition-colors duration-300"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              className="flex-[2] bg-charcoal-ink text-paper-cream rounded px-8 py-3 text-[13px] font-medium uppercase tracking-[0.08em] hover:opacity-90 transition-opacity duration-300"
              onClick={handleFinalContinue}
            >
              Continue
            </button>
          </div>
        </section>
      )}
    </main>
  );
}