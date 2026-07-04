'use client';

import { useStore } from '@/lib/store';
import Navbar from '@/components/wedding/Navbar';
import MobileDrawer from '@/components/wedding/MobileDrawer';
import BottomNav from '@/components/wedding/BottomNav';
import Footer from '@/components/wedding/Footer';
import HomePage from '@/components/wedding/pages/HomePage';
import SchedulePage from '@/components/wedding/pages/SchedulePage';
import RSVPPage from '@/components/wedding/pages/RSVPPage';
import GettingTherePage from '@/components/wedding/pages/GettingTherePage';
import StoryPage from '@/components/wedding/pages/StoryPage';
import MomentsPage from '@/components/wedding/pages/MomentsPage';
import WishesPage from '@/components/wedding/pages/WishesPage';
import QAPage from '@/components/wedding/pages/QAPage';
import AdminDashboardPage from '@/components/wedding/pages/AdminDashboardPage';
import AdminGuestsPage from '@/components/wedding/pages/AdminGuestsPage';
import AdminMediaPage from '@/components/wedding/pages/AdminMediaPage';

const GUEST_PAGES: Record<string, React.ComponentType> = {
  home: HomePage,
  schedule: SchedulePage,
  rsvp: RSVPPage,
  'getting-there': GettingTherePage,
  story: StoryPage,
  moments: MomentsPage,
  wishes: WishesPage,
  qa: QAPage,
};

const ADMIN_PAGES: Record<string, React.ComponentType> = {
  'admin-dashboard': AdminDashboardPage,
  'admin-guests': AdminGuestsPage,
  'admin-media': AdminMediaPage,
};

const ADMIN_KEYS = new Set(Object.keys(ADMIN_PAGES));

export default function Home() {
  const { currentPage } = useStore();

  const isAdmin = ADMIN_KEYS.has(currentPage);

  if (isAdmin) {
    const PageComponent = ADMIN_PAGES[currentPage] || AdminDashboardPage;
    return <PageComponent key={currentPage} />;
  }

  const PageComponent = GUEST_PAGES[currentPage] || HomePage;

  return (
    <div className="min-h-screen flex flex-col bg-paper-cream text-charcoal-ink overflow-x-hidden">
      <Navbar />
      <MobileDrawer />

      <div className="flex-1">
        <PageComponent key={currentPage} />
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}