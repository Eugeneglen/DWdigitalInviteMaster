'use client';

import dynamic from 'next/dynamic';
import { useCMSStore, type CMSPage } from '@/store/useCMSStore';

const MasterDashboard = dynamic(() => import('./pages/MasterDashboard'), { ssr: false });
const MasterWeddings = dynamic(() => import('./pages/MasterWeddings'), { ssr: false });
const MasterUsers = dynamic(() => import('./pages/MasterUsers'), { ssr: false });
const MasterTemplates = dynamic(() => import('./pages/MasterTemplates'), { ssr: false });
const MasterAnalytics = dynamic(() => import('./pages/MasterAnalytics'), { ssr: false });
const MasterSettings = dynamic(() => import('./pages/MasterSettings'), { ssr: false });

const PAGE_MAP: Record<CMSPage, React.ComponentType> = {
  dashboard: MasterDashboard,
  weddings: MasterWeddings,
  users: MasterUsers,
  templates: MasterTemplates,
  analytics: MasterAnalytics,
  settings: MasterSettings,
};

export default function MasterCMSPageRouter() {
  const { currentPage } = useCMSStore();
  const Page = PAGE_MAP[currentPage];
  return <Page />;
}