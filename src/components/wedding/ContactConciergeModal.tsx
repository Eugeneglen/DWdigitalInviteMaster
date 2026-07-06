'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ContactConciergeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactConciergeModal({
  open,
  onOpenChange,
}: ContactConciergeModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
    reason: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            contact: form.contact.trim() || undefined,
            reason: form.reason.trim(),
          }),
        });
        if (!res.ok) {
          setSubmitting(false);
          return;
        }
      } catch {
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSubmitted(true);
    },
    [form]
  );

  const handleClose = useCallback(
    (val: boolean) => {
      if (!val) {
        setForm({ name: '', email: '', contact: '', reason: '' });
        setSubmitted(false);
      }
      onOpenChange(val);
    },
    [onOpenChange]
  );

  const inputClass =
    'input-line w-full';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[560px] bg-paper-cream border-charcoal-ink/10 p-0 gap-0 overflow-hidden rounded-sm"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-charcoal-ink/8">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl md:text-[28px] leading-tight text-charcoal-ink text-left">
              Contact Concierge
            </DialogTitle>
            <DialogDescription className="font-body-sm text-body-sm leading-body-sm text-charcoal-ink/60 text-left mt-1">
              Get in touch with the Dreamweavers team
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => handleClose(false)}
            className="absolute top-6 right-6 p-1.5 rounded-full text-charcoal-ink/40 hover:text-charcoal-ink hover:bg-charcoal-ink/5 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {submitted ? (
            <div className="text-center py-8">
              <span
                className="material-symbols-outlined text-cinematic-gold text-5xl block mb-4"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <h3 className="font-heading text-xl text-charcoal-ink mb-2">
                Message Sent
              </h3>
              <p className="font-body-sm text-body-sm text-charcoal-ink/60 max-w-xs mx-auto">
                Thank you for reaching out. Our concierge team will get back to
                you shortly.
              </p>
              <button
                onClick={() => handleClose(false)}
                className="mt-6 font-label-sm text-label-sm tracking-[0.08em] uppercase text-cinematic-gold hover:text-cinematic-gold/80 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="cc-name"
                  className="block font-label-sm text-label-sm text-charcoal-ink/70 uppercase tracking-[0.08em] mb-2"
                >
                  Full Name
                </label>
                <input
                  id="cc-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="cc-email"
                  className="block font-label-sm text-label-sm text-charcoal-ink/70 uppercase tracking-[0.08em] mb-2"
                >
                  Email Address
                </label>
                <input
                  id="cc-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label
                  htmlFor="cc-contact"
                  className="block font-label-sm text-label-sm text-charcoal-ink/70 uppercase tracking-[0.08em] mb-2"
                >
                  Contact Number
                </label>
                <input
                  id="cc-contact"
                  type="tel"
                  value={form.contact}
                  onChange={updateField('contact')}
                  placeholder="+65 XXXX XXXX"
                  className={inputClass}
                />
              </div>

              {/* Reason */}
              <div>
                <label
                  htmlFor="cc-reason"
                  className="block font-label-sm text-label-sm text-charcoal-ink/70 uppercase tracking-[0.08em] mb-2"
                >
                  Reason for Contact
                </label>
                <textarea
                  id="cc-reason"
                  required
                  rows={4}
                  value={form.reason}
                  onChange={updateField('reason')}
                  placeholder="Tell us how we can help..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-charcoal-ink text-paper-cream font-label-sm text-label-sm tracking-[0.08em] uppercase py-3.5 rounded-sm hover:bg-charcoal-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}