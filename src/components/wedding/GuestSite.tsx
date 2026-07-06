'use client';

import { useSession } from 'next-auth/react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useCoupleCMSStore } from '@/store/useCoupleCMSStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import Header from '@/components/wedding/Header';
import MobileDrawer from '@/components/wedding/MobileDrawer';
import BottomNav from '@/components/wedding/BottomNav';
import Footer from '@/components/wedding/Footer';
import MusicPlayer from '@/components/wedding/MusicPlayer';
import { LoginModal } from '@/components/cms/LoginModal';
import type { Section } from '@/store/useNavigationStore';
import dynamic from 'next/dynamic';
import { usePublicWedding } from '@/hooks/usePublicWedding';

// Guest pages — dynamic imports to reduce Turbopack compilation memory
const HomePage = dynamic(() => import('@/components/wedding/pages/HomePage'), { ssr: false });
const SchedulePage = dynamic(() => import('@/components/wedding/pages/SchedulePage'), { ssr: false });
const RSVPPage = dynamic(() => import('@/components/wedding/pages/RSVPPage'), { ssr: false });
const GettingTherePage = dynamic(() => import('@/components/wedding/pages/GettingTherePage'), { ssr: false });
const StoryPage = dynamic(() => import('@/components/wedding/pages/StoryPage'), { ssr: false });
const MomentsPage = dynamic(() => import('@/components/wedding/pages/MomentsPage'), { ssr: false });
const WishesPage = dynamic(() => import('@/components/wedding/pages/WishesPage'), { ssr: false });
const QAPage = dynamic(() => import('@/components/wedding/pages/QAPage'), { ssr: false });

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

interface GuestSiteProps {
  /** Wedding slug — when provided, fetches data for that specific wedding */
  slug?: string;
  /** CSS top value to push the header below an overlay bar (e.g. "44px" for preview mode) */
  topOffset?: string;
  /** Show the "Open Editor" floating button for authenticated couples */
  showEditorButton?: boolean;
}

export default function GuestSite({ slug, topOffset, showEditorButton = false }: GuestSiteProps) {
  const { data: session } = useSession();
  const { currentSection } = useNavigationStore();
  const { togglePreview } = useCoupleCMSStore();
  const { open: loginModalOpen, closeModal } = useAuthModalStore();

  // Pre-fetch wedding data for this slug so all child pages share the cache
  usePublicWedding(slug);

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ACCOUNT_MANAGER';
  const isCouple = session?.user?.role === 'COUPLE';
  const GuestPageComponent = GUEST_PAGES[currentSection] || HomePage;

  return (
    <div className="min-h-screen flex flex-col bg-paper-cream text-charcoal-ink overflow-x-hidden selection:bg-cinematic-gold selection:text-paper-cream">
      <Header topOffset={topOffset} />
      <MobileDrawer />

      <div className="flex-1" style={topOffset ? { paddingTop: '44px' } : undefined}>
        <GuestPageComponent key={currentSection} />
      </div>

      <Footer />

      {/* Music Player — conditional on feature flag, reads config internally */}
      <MusicPlayer />

      <BottomNav />

      {/* Couple CMS toggle — visible floating button for authenticated couples */}
      {showEditorButton && isCouple && (
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
      {!session && (
        <button
          onClick={() => useAuthModalStore.getState().openModal()}
          className="fixed bottom-20 left-6 z-[55] text-xs text-charcoal-ink/20 hover:text-cinematic-gold transition-colors"
          aria-label="Admin login"
        >
          ⚙
        </button>
      )}

      <LoginModal
        open={loginModalOpen}
        onOpenChange={(open) => { if (!open) closeModal(); }}
      />
    </div>
  );
}