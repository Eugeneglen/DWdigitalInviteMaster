'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-paper-cream text-charcoal-ink antialiased">
        <div className="text-center p-6 max-w-md">
          {/* DW Logo */}
          <Link href="/" className="inline-block mb-8" aria-label="Dreamweavers Home">
            <svg className="mx-auto h-12 w-auto" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="8" width="20" height="16" rx="2" fill="#D4AF37" />
              <rect x="4" y="12" width="12" height="8" rx="1" fill="#FAF6F0" />
              <rect x="24" y="4" width="20" height="24" rx="2" fill="#D4AF37" />
              <rect x="28" y="8" width="12" height="16" rx="1" fill="#FAF6F0" />
              <rect x="48" y="0" width="20" height="32" rx="2" fill="#D4AF37" />
              <rect x="52" y="4" width="12" height="24" rx="1" fill="#FAF6F0" />
            </svg>
          </Link>

          <h1 className="font-playfair text-2xl font-semibold text-charcoal-ink mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-charcoal-ink/60 mb-8 leading-relaxed">
            An unexpected error occurred. This has been logged and we&apos;re looking into it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="rounded-lg bg-cinematic-gold hover:bg-cinematic-gold/90 text-white px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border border-charcoal-ink/20 hover:border-cinematic-gold hover:text-cinematic-gold px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}