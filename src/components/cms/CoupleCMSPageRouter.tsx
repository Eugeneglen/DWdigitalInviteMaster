'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useCoupleCMSStore, type CoupleCMSPage } from '@/store/useCoupleCMSStore';

const CMSDashboard = dynamic(() => import('./pages/CMSDashboard'), { ssr: false });
const CMSContent = dynamic(() => import('./pages/CMSContent'), { ssr: false });
const CMSSchedule = dynamic(() => import('./pages/CMSSchedule'), { ssr: false });
const CMSFAQ = dynamic(() => import('./pages/CMSFAQ'), { ssr: false });
const CMSFeatures = dynamic(() => import('./pages/CMSFeatures'), { ssr: false });
const CMSMedia = dynamic(() => import('./pages/CMSMedia'), { ssr: false });
const CMSSettings = dynamic(() => import('./pages/CMSSettings'), { ssr: false });
const CMSAuditLog = dynamic(() => import('./pages/CMSAuditLog'), { ssr: false });
const ComingSoonPage = dynamic(() => import('./pages/ComingSoonPage'), { ssr: false });

// These pages need selectedTenantId + authUser props
const CMSRsvps = dynamic(() => import('./pages/CMSRsvps'), { ssr: false });
const CMSWishes = dynamic(() => import('./pages/CMSWishes'), { ssr: false });
const CMSAnalytics = dynamic(() => import('./pages/CMSAnalytics'), { ssr: false });

const COMING_SOON: Record<string, { title: string; description: string }> = {
  details: { title: 'Your Details', description: 'Manage your personal and wedding details.' },
  home: { title: 'Home Page Editor', description: 'Customize your wedding home page.' },
  'getting-there': { title: 'Getting There', description: 'Configure venue and travel information.' },
  story: { title: 'Our Story', description: 'Edit your love story timeline.' },
  moments: { title: 'Moments', description: 'Manage special moments and memories.' },
  guests: { title: 'Guest Management', description: 'View and manage your guest list.' },
  sharing: { title: 'Sharing', description: 'Configure sharing and QR code settings.' },
};

/** Wrapper that provides couple auth context to pages that need it */
function CoupleContextPage({ page }: { page: 'rsvps' | 'wishes' | 'analytics' }) {
  const { data: session } = useSession();
  const [resolvedTenantId, setResolvedTenantId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.tenantId) {
            setResolvedTenantId(data.tenantId);
          }
        }
      } catch {
        // silently handle — tenantId will remain null
      }
    }
    fetchMe();
  }, []);

  const coupleContext = {
    selectedTenantId: resolvedTenantId,
    authUser: session?.user
      ? {
          userId: session.user.id,
          email: session.user.email ?? '',
          name: session.user.name ?? '',
          role: session.user.role,
          tenantId: resolvedTenantId ?? session.user.id,
        }
      : null,
  };

  switch (page) {
    case 'rsvps':
      return <CMSRsvps {...coupleContext} />;
    case 'wishes':
      return <CMSWishes {...coupleContext} />;
    case 'analytics':
      return <CMSAnalytics {...coupleContext} />;
  }
}

export default function CoupleCMSPageRouter() {
  const { currentPage } = useCoupleCMSStore();

  switch (currentPage) {
    case 'overview':
      return <CMSDashboard />;
    case 'details':
    case 'home':
    case 'getting-there':
    case 'story':
    case 'moments':
    case 'guests':
    case 'sharing': {
      const info = COMING_SOON[currentPage]!;
      return <ComingSoonPage title={info.title} description={info.description} />;
    }
    case 'content':
      return <CMSContent />;
    case 'schedule':
      return <CMSSchedule />;
    case 'rsvps':
      return <CoupleContextPage page="rsvps" />;
    case 'wishes':
      return <CoupleContextPage page="wishes" />;
    case 'faqs':
      return <CMSFAQ />;
    case 'features':
      return <CMSFeatures />;
    case 'analytics':
      return <CoupleContextPage page="analytics" />;
    case 'audit':
      return <CMSAuditLog />;
    default:
      return <CMSDashboard />;
  }
}