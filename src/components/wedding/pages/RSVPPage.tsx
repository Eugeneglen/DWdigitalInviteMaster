'use client';

import { useState } from 'react';

interface Guest {
  name: string;
  responded: boolean;
  attendance?: string;
  dietary?: string;
}

const INITIAL_GUESTS: Guest[] = [
  { name: '', responded: false },
];

export default function RSVPPage() {
  const [step, setStep] = useState(1);
  const [partySize, setPartySize] = useState(1);
  const [guests, setGuests] = useState<Guest[]>([{ name: '', responded: false }]);
  const [currentGuestIndex, setCurrentGuestIndex] = useState(0);
  const [attendance, setAttendance] = useState<string>('');
  const [dietary, setDietary] = useState('');
  const [done, setDone] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const submitStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    const fullName = firstName.trim() + ' ' + lastName.trim();
    const updated = [...guests];
    if (updated.length === 0) {
      updated.push({ name: fullName, responded: false });
    } else {
      updated[0].name = fullName;
    }
    setGuests(updated);
    setStep(2);
  };

  const submitStep2 = () => {
    let updated = [...guests];
    while (updated.length < partySize) {
      updated.push({ name: 'Guest ' + (updated.length + 1), responded: false });
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

  const addGuest = () => {
    setGuests((g) => [...g, { name: 'Guest ' + (g.length + 1), responded: false }]);
    setPartySize((p) => p + 1);
  };

  const respondFor = (i: number) => {
    setCurrentGuestIndex(i);
    const g = guests[i];
    setAttendance(g.attendance || '');
    setDietary(g.dietary || '');
    setStep(4);
  };

  const selectAttendance = (val: string) => {
    setAttendance(val);
  };

  const submitGuestResponse = () => {
    if (!attendance) return;
    setGuests((g) => {
      const updated = [...g];
      updated[currentGuestIndex] = {
        ...updated[currentGuestIndex],
        attendance,
        dietary,
        responded: true,
      };
      return updated;
    });
    // Find next unresponded
    const next = guests.findIndex((g2, idx) => idx !== currentGuestIndex && !g2.responded);
    if (next !== -1) {
      setTimeout(() => respondFor(next), 50);
    } else {
      setStep(3);
    }
  };

  const allDone = guests.every((g) => g.responded);

  const handleFinalContinue = () => {
    if (!allDone) return;
    // POST to API
    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests }),
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

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3, 4].map((n) => (
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
                />
              </div>
            </div>
            <button
              className="w-full bg-charcoal-ink text-paper-cream py-4 mt-4 text-[12px] tracking-[0.25em] uppercase font-semibold hover:bg-black transition-colors"
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
              className="w-12 h-12 border border-charcoal-ink/30 flex items-center justify-center hover:border-charcoal-ink transition-colors text-2xl"
              onClick={() => changeParty(-1)}
            >
              −
            </button>
            <div className="w-24 h-12 border border-charcoal-ink/30 flex items-center justify-center text-xl font-semibold">
              {partySize}
            </div>
            <button
              className="w-12 h-12 border border-charcoal-ink/30 flex items-center justify-center hover:border-charcoal-ink transition-colors text-2xl"
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
              className="flex-1 border border-charcoal-ink/30 py-4 text-[12px] tracking-[0.25em] uppercase font-semibold hover:border-charcoal-ink transition-colors"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              className="flex-[2] bg-charcoal-ink text-paper-cream py-4 text-[12px] tracking-[0.25em] uppercase font-semibold hover:bg-black transition-colors"
              onClick={submitStep2}
            >
              Next
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="staggered-fade-in" style={{ animationDelay: '0s', opacity: 1 }}>
          <div className="space-y-3 mb-6">
            {guests.map((g, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3 border-b border-charcoal-ink/15">
                <div className="flex-1 min-w-0">
                  <input
                    className="w-full bg-transparent outline-none text-[15px] border-b border-transparent focus:border-cinematic-gold py-1"
                    value={g.name}
                    onChange={(e) => updateGuestName(i, e.target.value)}
                  />
                  {g.responded && (
                    <span className="text-[10px] tracking-[0.18em] uppercase text-cinematic-gold font-semibold">
                      Response saved
                    </span>
                  )}
                </div>
                <button
                  className={`border px-5 py-2 text-[11px] tracking-[0.2em] uppercase font-semibold hover:border-charcoal-ink transition-colors ${
                    g.responded
                      ? 'border-cinematic-gold text-cinematic-gold'
                      : 'border-charcoal-ink/40 text-charcoal-ink'
                  }`}
                  onClick={() => respondFor(i)}
                >
                  {g.responded ? 'Edit' : 'Respond'}
                </button>
              </div>
            ))}
          </div>
          <button
            className="flex items-center gap-2 text-[13px] text-charcoal-ink/70 hover:text-cinematic-gold transition-colors mb-8"
            onClick={addGuest}
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span className="uppercase tracking-[0.18em] text-[11px] font-semibold">Add Another Guest</span>
          </button>
          <div className="flex gap-3">
            <button
              className="flex-1 border border-charcoal-ink/30 py-4 text-[12px] tracking-[0.25em] uppercase font-semibold hover:border-charcoal-ink transition-colors"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              className={`flex-[2] bg-charcoal-ink text-paper-cream py-4 text-[12px] tracking-[0.25em] uppercase font-semibold hover:bg-black transition-colors ${
                !allDone ? 'opacity-40' : ''
              }`}
              disabled={!allDone}
              onClick={handleFinalContinue}
            >
              {allDone ? 'Continue' : 'Respond for all guests'}
            </button>
          </div>
        </section>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <section className="staggered-fade-in" style={{ animationDelay: '0s', opacity: 1 }}>
          <div className="text-center mb-6 pb-4 border-b border-charcoal-ink/20">
            <p className="font-semibold text-[16px]">
              Responding for {guests[currentGuestIndex]?.name}.
            </p>
            <p className="text-[12px] text-charcoal-ink/50 mt-1">
              Guest {currentGuestIndex + 1} of {guests.length}
            </p>
          </div>
          <div className="space-y-8">
            <div>
              <p className="text-[14px] mb-4">
                <span className="text-charcoal-ink/60">1.</span> Will you be able to join us for our Wedding Solemnisation?<span className="text-cinematic-gold">*</span>
              </p>
              <div className="space-y-3">
                {[
                  { val: 'yes', label: 'Yes!' },
                  { val: 'no', label: "I'm sorry, I won't be able to make it" },
                  { val: 'partial', label: "Yes, but I won't be staying for the lunch reception" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    className={`opt-btn rounded-full ${attendance === opt.val ? 'selected' : ''}`}
                    onClick={() => selectAttendance(opt.val)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[14px] mb-3">
                <span className="text-charcoal-ink/60">2.</span> Do you have any dietary restrictions?
              </p>
              <textarea
                className="w-full border border-charcoal-ink/30 p-4 text-[14px] outline-none focus:border-cinematic-gold transition-colors min-h-[110px] bg-transparent"
                placeholder="Write your answer here."
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-10">
            <button
              className="flex-1 border border-charcoal-ink/30 py-4 text-[12px] tracking-[0.25em] uppercase font-semibold hover:border-charcoal-ink transition-colors"
              onClick={() => setStep(3)}
            >
              Back
            </button>
            <button
              className={`flex-[2] bg-charcoal-ink text-paper-cream py-4 text-[12px] tracking-[0.25em] uppercase font-semibold hover:bg-black transition-colors ${
                !attendance ? 'opacity-40' : ''
              }`}
              disabled={!attendance}
              onClick={submitGuestResponse}
            >
              Save &amp; Continue
            </button>
          </div>
        </section>
      )}
    </main>
  );
}