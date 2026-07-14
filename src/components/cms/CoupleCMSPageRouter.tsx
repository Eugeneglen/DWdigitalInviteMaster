'use client';

import dynamic from 'next/dynamic';
import { useCoupleCMSStore } from '@/store/useCoupleCMSStore';

// ── Dedicated Couple CMS pages ──────────────────────────────────────────────
// These pages are self-contained: each fetches its own data via couple-scoped
// APIs (e.g. /api/cms/overview, /api/cms/schedule) and manages its own state.
// They do NOT depend on useCMSStore.authUser (Master CMS store) or master-admin
// only endpoints, which the previous shared pages/CMS*.tsx did.
const CoupleOverview = dynamic(() => import('./couple/CoupleOverview'), { ssr: false });
const CoupleDetails = dynamic(() => import('./couple/CoupleDetails'), { ssr: false });
const CoupleContent = dynamic(() => import('./couple/CoupleContent'), { ssr: false });
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

export default function CoupleCMSPageRouter() {
  const { currentPage } = useCoupleCMSStore();

  switch (currentPage) {
    case 'overview':
      return <CoupleOverview />;
    case 'details':
      return <CoupleDetails />;
    case 'content':
      return <CoupleContent />;
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
