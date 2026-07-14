'use client';

import dynamic from 'next/dynamic';
import { Lock } from 'lucide-react';
import { useCoupleCMSStore } from '@/store/useCoupleCMSStore';
import { isPageEnabled, extractFeatureFlags, PAGE_TO_FEATURE } from '@/lib/feature-lock';
import { FEATURE_LABELS } from '@/lib/constants';

// ── Dedicated Couple CMS pages ──────────────────────────────────────────────
const CoupleOverview = dynamic(() => import('./couple/CoupleOverview'), { ssr: false });
const CoupleDetails = dynamic(() => import('./couple/CoupleDetails'), { ssr: false });
const CoupleHome = dynamic(() => import('./couple/CoupleHome'), { ssr: false });
const CoupleSchedule = dynamic(() => import('./couple/CoupleSchedule'), { ssr: false });
const CoupleRSVPs = dynamic(() => import('./couple/CoupleRSVPs'), { ssr: false });
const CoupleGettingThere = dynamic(() => import('./couple/CoupleGettingThere'), { ssr: false });
const CoupleStory = dynamic(() => import('./couple/CoupleStory'), { ssr: false });
const CoupleWishes = dynamic(() => import('./couple/CoupleWishes'), { ssr: false });
const CoupleFAQs = dynamic(() => import('./couple/CoupleFAQs'), { ssr: false });
const CoupleMoments = dynamic(() => import('./couple/CoupleMoments'), { ssr: false });
const CoupleGuests = dynamic(() => import('./couple/CoupleGuests'), { ssr: false });
const CoupleAnalytics = dynamic(() => import('./couple/CoupleAnalytics'), { ssr: false });
const CoupleAuditLog = dynamic(() => import('./couple/CoupleAuditLog'), { ssr: false });
const CoupleSharing = dynamic(() => import('./couple/CoupleSharing'), { ssr: false });
const CoupleFeatures = dynamic(() => import('./couple/CoupleFeatures'), { ssr: false });

/** Locked screen shown when a couple tries to access a disabled feature */
function LockedFeaturePage({ featureKey }: { featureKey: string }) {
  const label = FEATURE_LABELS[featureKey] || featureKey;
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-charcoal-ink/5 mb-6">
        <Lock className="size-8 text-charcoal-ink/30" />
      </div>
      <h2 className="text-xl font-semibold text-charcoal-ink mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        {label} is not available
      </h2>
      <p className="text-sm text-charcoal-ink/50 max-w-md leading-relaxed">
        This feature is not included in your current package.
        Contact your DreamWeavers consultant to upgrade and unlock {label}.
      </p>
    </div>
  );
}

export default function CoupleCMSPageRouter() {
  const { currentPage, weddingData } = useCoupleCMSStore();
  const featureFlags = extractFeatureFlags(weddingData as Record<string, unknown> | null);

  // Check if the current page's feature is disabled
  const pageEnabled = isPageEnabled(currentPage, featureFlags);
  const featureKey = PAGE_TO_FEATURE[currentPage];

  if (!pageEnabled && featureKey) {
    return <LockedFeaturePage featureKey={featureKey} />;
  }

  switch (currentPage) {
    case 'overview':
      return <CoupleOverview />;
    case 'details':
      return <CoupleDetails />;
    case 'home':
      return <CoupleHome />;
    case 'schedule':
      return <CoupleSchedule />;
    case 'rsvps':
      return <CoupleRSVPs />;
    case 'getting-there':
      return <CoupleGettingThere />;
    case 'story':
      return <CoupleStory />;
    case 'wishes':
      return <CoupleWishes />;
    case 'faqs':
      return <CoupleFAQs />;
    case 'moments':
      return <CoupleMoments />;
    case 'guests':
      return <CoupleGuests />;
    case 'analytics':
      return <CoupleAnalytics />;
    case 'audit':
      return <CoupleAuditLog />;
    case 'sharing':
      return <CoupleSharing />;
    case 'features':
      return <CoupleFeatures />;
    default:
      return <CoupleOverview />;
  }
}
