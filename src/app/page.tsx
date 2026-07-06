'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useCMSStore, type CMSPage } from '@/store/useCMSStore';
import { useCoupleCMSStore, type CoupleCMSPage } from '@/store/useCoupleCMSStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import Header from '@/components/wedding/Header';
import MobileDrawer from '@/components/wedding/MobileDrawer';
import BottomNav from '@/components/wedding/BottomNav';
import Footer from '@/components/wedding/Footer';
import { LoginModal } from '@/components/cms/LoginModal';
import MasterCMSLayout from '@/components/cms/MasterCMSLayout';
import CoupleCMSLayout from '@/components/cms/CoupleCMSLayout';
import type { Section } from '@/store/useNavigationStore';
import dynamic from 'next/dynamic';

// Guest pages — dynamic imports to reduce Turbopack compilation memory
const HomePage = dynamic(() => import('@/components/wedding/pages/HomePage'), { ssr: false });
const SchedulePage = dynamic(() => import('@/components/wedding/pages/SchedulePage'), { ssr: false });
const RSVPPage = dynamic(() => import('@/components/wedding/pages/RSVPPage'), { ssr: false });
const GettingTherePage = dynamic(() => import('@/components/wedding/pages/GettingTherePage'), { ssr: false });
const StoryPage = dynamic(() => import('@/components/wedding/pages/StoryPage'), { ssr: false });
const MomentsPage = dynamic(() => import('@/components/wedding/pages/MomentsPage'), { ssr: false });
const WishesPage = dynamic(() => import('@/components/wedding/pages/WishesPage'), { ssr: false });
const QAPage = dynamic(() => import('@/components/wedding/pages/QAPage'), { ssr: false });

// Master CMS pages — dynamic imports
const MasterDashboard = dynamic(() => import('@/components/cms/pages/MasterDashboard'), { ssr: false });
const MasterWeddings = dynamic(() => import('@/components/cms/pages/MasterWeddings'), { ssr: false });
const MasterUsers = dynamic(() => import('@/components/cms/pages/MasterUsers'), { ssr: false });
const MasterAnalytics = dynamic(() => import('@/components/cms/pages/MasterAnalytics'), { ssr: false });
const MasterSettings = dynamic(() => import('@/components/cms/pages/MasterSettings'), { ssr: false });
const ComingSoonPage = dynamic(() => import('@/components/cms/pages/ComingSoonPage'), { ssr: false });

// Couple CMS pages — dynamic imports
const CoupleOverview = dynamic(() => import('@/components/cms/couple/CoupleOverview'), { ssr: false });
const CoupleDetails = dynamic(() => import('@/components/cms/couple/CoupleDetails'), { ssr: false });
const CoupleContent = dynamic(() => import('@/components/cms/couple/CoupleContent'), { ssr: false });
const CoupleSchedule = dynamic(() => import('@/components/cms/couple/CoupleSchedule'), { ssr: false });
const CoupleStory = dynamic(() => import('@/components/cms/couple/CoupleStory'), { ssr: false });
const CoupleFAQs = dynamic(() => import('@/components/cms/couple/CoupleFAQs'), { ssr: false });
const CoupleFeatures = dynamic(() => import('@/components/cms/couple/CoupleFeatures'), { ssr: false });
const CoupleImages = dynamic(() => import('@/components/cms/couple/CoupleImages'), { ssr: false });
const CoupleGuests = dynamic(() => import('@/components/cms/couple/CoupleGuests'), { ssr: false });
const CoupleRSVPs = dynamic(() => import('@/components/cms/couple/CoupleRSVPs'), { ssr: false });
const CoupleWishes = dynamic(() => import('@/components/cms/couple/CoupleWishes'), { ssr: false });
const CoupleAuditLog = dynamic(() => import('@/components/cms/couple/CoupleAuditLog'), { ssr: false });

const GUEST_PAGES: Record<Section, React.ComponentType> = {
  home: HomePage,
  schedule: SchedulePage,
  rsvp: RSVPPage,
  'getting-there': GettingTherePage,
  story: StoryPage,
  moments: MomentsPage,
  wishes: WishesPage,
  qa: QAPage,
};

const MASTER_CMS_PAGES: Record<CMSPage, React.ComponentType> = {
  dashboard: MasterDashboard,
  weddings: MasterWeddings,
  users: MasterUsers,
  templates: () => <ComingSoonPage title="Content Templates" description="Manage invitation templates and themes" />,
  analytics: MasterAnalytics,
  settings: MasterSettings,
};

const COUPLE_CMS_PAGES: Record<CoupleCMSPage, React.ComponentType> = {
  overview: CoupleOverview,
  details: CoupleDetails,
  content: CoupleContent,
  schedule: CoupleSchedule,
  story: CoupleStory,
  faqs: CoupleFAQs,
  features: CoupleFeatures,
  images: CoupleImages,
  guests: CoupleGuests,
  rsvps: CoupleRSVPs,
  wishes: CoupleWishes,
  audit: CoupleAuditLog,
};

function MasterCMSPageRouter() {
  const { currentPage } = useCMSStore();
  const PageComponent = MASTER_CMS_PAGES[currentPage] || MasterDashboard;
  return <PageComponent />;
}

function CoupleCMSPageRouter() {
  const { currentPage } = useCoupleCMSStore();
  const PageComponent = COUPLE_CMS_PAGES[currentPage] || CoupleOverview;
  return <PageComponent />;
}

export default function Home() {
  const { data: session, status } = useSession();
  const { currentSection } = useNavigationStore();
  const { previewMode, togglePreview } = useCoupleCMSStore();
  const { open: loginModalOpen, closeModal } = useAuthModalStore();
  const [manualView, setManualView] = useState<'guest' | 'cms' | 'couple' | null>(null);
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ACCOUNT_MANAGER';
  const isCouple = session?.user?.role === 'COUPLE';

  // Derive view: URL param takes priority, then manual toggle, then role-based default
  const urlView = viewParam === 'cms' && isAdmin ? 'cms' as const
    : viewParam === 'couple' && isCouple ? 'couple' as const
    : null;
  const viewMode = manualView ?? urlView ?? (isAdmin ? 'cms' : isCouple ? 'couple' : 'guest');

  // Show login modal when ?view= param requires auth but user isn't authenticated
  const wantsCMS = viewParam === 'cms' || viewParam === 'couple';
  const showLoginModal = loginModalOpen || (wantsCMS && status !== 'authenticated');
  const GuestPageComponent = GUEST_PAGES[currentSection] || HomePage;

  // Master CMS View
  if (viewMode === 'cms' && isAdmin) {
    return (
      <>
        <MasterCMSLayout><MasterCMSPageRouter /></MasterCMSLayout>
        <LoginModal open={showLoginModal} onOpenChange={(open) => { if (!open) closeModal(); }} />
      </>
    );
  }

  // Preview Mode — couple user previewing their wedding as a guest
  if (previewMode && isCouple) {
    return (
      <div className="min-h-screen flex flex-col bg-paper-cream text-charcoal-ink overflow-x-hidden selection:bg-cinematic-gold selection:text-paper-cream">
        {/* Floating CMS Toggle Bar */}
        <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-cinematic-gold text-white px-4 py-2.5 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="size-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span className="text-sm font-medium">Viewing as Guest</span>
          </div>
          <button
            onClick={() => togglePreview(false)}
            className="flex items-center gap-1.5 rounded-md bg-white/20 hover:bg-white/30 px-3.5 py-1.5 text-xs font-semibold transition-colors"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Open Editor
          </button>
        </div>
        <div className="pt-11">
          <Header />
        </div>
        <MobileDrawer />
        <div className="flex-1">
          <GuestPageComponent key={currentSection} />
        </div>
        <Footer />
        <BottomNav />
        <LoginModal open={showLoginModal} onOpenChange={(open) => { if (!open) closeModal(); }} />
      </div>
    );
  }

  // Couple CMS View
  if (viewMode === 'couple' && isCouple) {
    return (
      <>
        <CoupleCMSLayout><CoupleCMSPageRouter /></CoupleCMSLayout>
        <LoginModal open={showLoginModal} onOpenChange={(open) => { if (!open) closeModal(); }} />
      </>
    );
  }

  // Guest View
  return (
    <div className="min-h-screen flex flex-col bg-paper-cream text-charcoal-ink overflow-x-hidden selection:bg-cinematic-gold selection:text-paper-cream">
      <Header />
      <MobileDrawer />

      <div className="flex-1">
        <GuestPageComponent key={currentSection} />
      </div>

      <Footer />
      <BottomNav />

      {/* Couple CMS toggle — visible floating button for authenticated couples */}
      {status === 'authenticated' && !isAdmin && (
        <button
          onClick={() => togglePreview(false)}
          className="fixed bottom-20 right-4 z-[55] flex items-center gap-2 rounded-full bg-cinematic-gold text-white pl-3 pr-4 py-2.5 text-xs font-semibold shadow-lg hover:bg-cinematic-gold/90 active:scale-95 transition-all"
          aria-label="Open Editor"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Open Editor
        </button>
      )}

      {/* Admin login trigger — subtle gear icon, bottom-left */}
      {status !== 'authenticated' && (
        <button
          onClick={() => useAuthModalStore.getState().openModal()}
          className="fixed bottom-20 left-6 z-[55] text-xs text-charcoal-ink/20 hover:text-cinematic-gold transition-colors"
          aria-label="Admin login"
        >
          ⚙
        </button>
      )}

      <LoginModal open={showLoginModal} onOpenChange={(open) => { if (!open) closeModal(); }} />
    </div>
  );
}