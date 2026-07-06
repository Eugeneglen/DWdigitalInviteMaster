'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useCMSStore, type CMSPage } from '@/store/useCMSStore';
import Header from '@/components/wedding/Header';
import MobileDrawer from '@/components/wedding/MobileDrawer';
import BottomNav from '@/components/wedding/BottomNav';
import Footer from '@/components/wedding/Footer';
import { LoginModal } from '@/components/cms/LoginModal';
import MasterCMSLayout from '@/components/cms/MasterCMSLayout';
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

// CMS pages — dynamic imports
const MasterDashboard = dynamic(() => import('@/components/cms/pages/MasterDashboard'), { ssr: false });
const MasterWeddings = dynamic(() => import('@/components/cms/pages/MasterWeddings'), { ssr: false });
const MasterUsers = dynamic(() => import('@/components/cms/pages/MasterUsers'), { ssr: false });
const ComingSoonPage = dynamic(() => import('@/components/cms/pages/ComingSoonPage'), { ssr: false });

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

const CMS_PAGES: Record<CMSPage, React.ComponentType> = {
  dashboard: MasterDashboard,
  weddings: MasterWeddings,
  users: MasterUsers,
  templates: () => <ComingSoonPage title="Content Templates" description="Manage invitation templates and themes" />,
  analytics: () => <ComingSoonPage title="Analytics" description="View platform-wide analytics and reports" />,
  settings: () => <ComingSoonPage title="Settings" description="Configure platform settings and preferences" />,
};

function CMSPageRouter() {
  const { currentPage } = useCMSStore();
  const PageComponent = CMS_PAGES[currentPage] || MasterDashboard;
  return <PageComponent />;
}

export default function Home() {
  const { data: session, status } = useSession();
  const { currentSection } = useNavigationStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [manualView, setManualView] = useState<'guest' | 'cms' | null>(null);

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ACCOUNT_MANAGER';
  const viewMode = manualView ?? (isAdmin ? 'cms' : 'guest');

  // CMS View
  if (viewMode === 'cms' && isAdmin) {
    return <MasterCMSLayout><CMSPageRouter /></MasterCMSLayout>;
  }

  // Guest View
  const PageComponent = GUEST_PAGES[currentSection] || HomePage;

  return (
    <div className="min-h-screen flex flex-col bg-paper-cream text-charcoal-ink overflow-x-hidden selection:bg-cinematic-gold selection:text-paper-cream">
      <Header />
      <MobileDrawer />

      <div className="flex-1">
        <PageComponent key={currentSection} />
      </div>

      <Footer />
      <BottomNav />

      {/* Subtle admin access for authenticated non-admin users */}
      {status === 'authenticated' && !isAdmin && (
        <button
          onClick={() => setManualView('cms')}
          className="fixed bottom-20 left-6 z-[55] text-xs text-charcoal-ink/30 hover:text-cinematic-gold transition-colors"
        >
          CMS
        </button>
      )}

      {/* Admin login trigger — subtle gear icon, bottom-left */}
      {status !== 'authenticated' && (
        <button
          onClick={() => setLoginOpen(true)}
          className="fixed bottom-20 left-6 z-[55] text-xs text-charcoal-ink/20 hover:text-cinematic-gold transition-colors"
          aria-label="Admin login"
        >
          ⚙
        </button>
      )}

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}