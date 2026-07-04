'use client';

const HERO_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA-OyKfcsxXAmZDArHbDXl1cVCgGUG5liFPzyHdVvMG6_4jN9pNTrN9GCrkdnegli9UPJUSPs39KJRsRP7AiLem4xYS-q1ZYq1T3DAIqyvn3wAvbdkoMVkufft0SpQw4gDTPSnIml6k62lRYobUrNu70UGIILiMZQ0fAydTXXwVZ1oswQZ-mjPT8H9mDDqfhxsMSI5zla8GKz_ILXbmdRjtRUk682dPEDBD6I81DzEx7dITgjb6vxQoee5599jkYf_vCYP7npydvxqx';

interface HeroBannerProps {
  title: string;
  subtitle?: string;
}

export default function HeroBanner({ title, subtitle }: HeroBannerProps) {
  return (
    <div
      className="w-full h-[360px] md:h-[420px] bg-cover bg-center mt-[54px] md:mt-[64px] relative z-40 border-b border-champagne-silk/20 flex items-center justify-center"
      style={{ backgroundImage: `url('${HERO_BG}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-paper-cream/30 via-paper-cream/10 to-paper-cream/60" />
      <div className="relative z-10 text-center px-6">
        <h1
          className="text-[44px] md:text-[72px] leading-[1.05] text-charcoal-ink tracking-tight font-bold drop-shadow-sm"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-[11px] md:text-xs uppercase tracking-[0.25em] text-cinematic-gold font-semibold drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}