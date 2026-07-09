'use client';

import { useNavigationStore } from '@/store/useNavigationStore';
import Header from '@/components/wedding/Header';
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
import type { Section } from '@/store/useNavigationStore';

const PAGES: Record<Section, React.ComponentType> = {
  home: HomePage,
  schedule: SchedulePage,
  rsvp: RSVPPage,
  'getting-there': GettingTherePage,
  story: StoryPage,
  moments: MomentsPage,
  wishes: WishesPage,
  qa: QAPage,
};

export default function Home() {
  const { currentSection } = useNavigationStore();
  const PageComponent = PAGES[currentSection] || HomePage;

  return (
    <div className="min-h-screen flex flex-col bg-paper-cream text-charcoal-ink overflow-x-hidden selection:bg-cinematic-gold selection:text-paper-cream">
      <Header />
      <MobileDrawer />

      <div className="flex-1">
        <PageComponent key={currentSection} />
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}