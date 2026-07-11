import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper-cream text-charcoal-ink px-6">
      <div className="text-center max-w-md">
        {/* DW Logo / Icon */}
        <div className="mx-auto mb-8">
          <svg className="mx-auto h-14 w-auto" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Dreamweavers">
            <rect x="0" y="8" width="20" height="16" rx="2" fill="#D4AF37" />
            <rect x="4" y="12" width="12" height="8" rx="1" fill="#FAF6F0" />
            <rect x="24" y="4" width="20" height="24" rx="2" fill="#D4AF37" />
            <rect x="28" y="8" width="12" height="16" rx="1" fill="#FAF6F0" />
            <rect x="48" y="0" width="20" height="32" rx="2" fill="#D4AF37" />
            <rect x="52" y="4" width="12" height="24" rx="1" fill="#FAF6F0" />
          </svg>
        </div>

        {/* 404 heading */}
        <h1 className="font-playfair text-5xl font-bold text-cinematic-gold mb-4">
          404
        </h1>
        <h2 className="font-playfair text-xl font-semibold text-charcoal-ink mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-charcoal-ink/60 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-cinematic-gold hover:bg-cinematic-gold/90 text-white px-8 py-3 text-sm font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}