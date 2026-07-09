'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  type LucideIcon,
  LayoutDashboard,
  Building2,
  Users,
  ToggleLeft,
  FileText,
  LogOut,
  Menu,
  ArrowLeft,
  Bell,
  Settings,
  Calendar,
  HelpCircle,
  ImageIcon,
  FileEdit,
  ClipboardCheck,
  Heart,
  BarChart3,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { useCMSStore, type CMSPage } from '@/store/useCMSStore';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy-load CMS pages to reduce Turbopack memory pressure
const CMSDashboard = dynamic(() => import('./pages/CMSDashboard'));
const CMSTenants = dynamic(() => import('./pages/CMSTenants'));
const CMSUsers = dynamic(() => import('./pages/CMSUsers'));
const CMSFeatures = dynamic(() => import('./pages/CMSFeatures'));
const CMSAuditLog = dynamic(() => import('./pages/CMSAuditLog'));
const CMSSettings = dynamic(() => import('./pages/CMSSettings'));
const CMSSchedule = dynamic(() => import('./pages/CMSSchedule'));
const CMSFAQ = dynamic(() => import('./pages/CMSFAQ'));
const CMSMedia = dynamic(() => import('./pages/CMSMedia'));
const CMSContent = dynamic(() => import('./pages/CMSContent'));
const CMSRsvps = dynamic(() => import('./pages/CMSRsvps'));
const CMSWishes = dynamic(() => import('./pages/CMSWishes'));
const CMSAnalytics = dynamic(() => import('./pages/CMSAnalytics'));

type NavItem = { page: CMSPage; label: string; icon: LucideIcon } | { separator: true; label: string };

const NAV_ITEMS: NavItem[] = [
  // Overview section
  { page: 'dashboard' as CMSPage, label: 'Dashboard', icon: LayoutDashboard },
  { separator: true, label: 'CONTENT' },

  // Content Management section
  { page: 'settings' as CMSPage, label: 'Settings', icon: Settings },
  { page: 'schedule-editor' as CMSPage, label: 'Schedule', icon: Calendar },
  { page: 'faq-editor' as CMSPage, label: 'FAQ', icon: HelpCircle },
  { page: 'media' as CMSPage, label: 'Media', icon: ImageIcon },
  { page: 'content' as CMSPage, label: 'Content', icon: FileEdit },
  { separator: true, label: 'GUEST DATA' },

  // Guest Data section
  { page: 'rsvps' as CMSPage, label: 'RSVPs', icon: ClipboardCheck },
  { page: 'wishes' as CMSPage, label: 'Wishes', icon: Heart },
  { page: 'analytics' as CMSPage, label: 'Analytics', icon: BarChart3 },
  { separator: true, label: 'SYSTEM' },

  // System section (master admin only)
  { page: 'tenants' as CMSPage, label: 'Tenants', icon: Building2 },
  { page: 'users' as CMSPage, label: 'Users', icon: Users },
  { page: 'features' as CMSPage, label: 'Feature Flags', icon: ToggleLeft },
  { page: 'audit' as CMSPage, label: 'Audit Log', icon: FileText },
];

const PAGE_TITLES: Record<CMSPage, string> = {
  login: 'Sign In',
  dashboard: 'Dashboard',
  tenants: 'Tenants',
  'tenant-detail': 'Tenant Detail',
  users: 'Users',
  features: 'Feature Flags',
  audit: 'Audit Log',
  settings: 'Settings',
  'schedule-editor': 'Schedule',
  'faq-editor': 'FAQ',
  media: 'Media',
  content: 'Content',
  rsvps: 'RSVPs',
  wishes: 'Wishes',
  analytics: 'Analytics',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const cmsPage = useCMSStore((s) => s.cmsPage);
  const setCmsPage = useCMSStore((s) => s.setCmsPage);
  const authUser = useCMSStore((s) => s.authUser);
  const logout = useCMSStore((s) => s.logout);
  const returnToGuest = useCMSStore((s) => s.returnToGuest);

  const handleNav = (page: CMSPage) => {
    setCmsPage(page);
    onNavigate?.();
  };

  // Filter out SYSTEM section for non-master-admin users
  const isMasterAdmin = authUser?.role === 'master_admin';
  const systemStartIndex = NAV_ITEMS.findIndex(
    (item) => 'separator' in item && item.label === 'SYSTEM'
  );
  const visibleNavItems =
    isMasterAdmin || systemStartIndex === -1
      ? NAV_ITEMS
      : NAV_ITEMS.slice(0, systemStartIndex);

  return (
    <div className="flex flex-col h-full bg-charcoal-ink text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <Image
          src="/dreamweavers-logo.png"
          alt="Dreamweavers"
          width={32}
          height={32}
        />
        <div>
          <span className="font-semibold text-sm">DWdigitalInvite</span>
          <p className="text-[10px] text-gray-400 -mt-0.5">Admin Panel</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-3">
          {visibleNavItems.map((item, idx) => {
            if ('separator' in item) {
              return (
                <div key={`sep-${item.label}`} className="px-4 pt-5 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              );
            }
            const isActive = cmsPage === item.page;
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-cinematic-gold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/10 text-xs text-cinematic-gold">
                {authUser ? getInitials(authUser.name) : '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {authUser?.name || 'Unknown'}
              </p>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-cinematic-gold/40 text-cinematic-gold mt-0.5"
              >
                {authUser?.role || '—'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 space-y-1">
          <button
            onClick={returnToGuest}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Site
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CMSLayout() {
  const cmsPage = useCMSStore((s) => s.cmsPage);
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const authUser = useCMSStore((s) => s.authUser);
  const selectedTenantId = useCMSStore((s) => s.selectedTenantId);

  const pageTitle = PAGE_TITLES[cmsPage] || 'Dashboard';

  const renderPage = () => {
    switch (cmsPage) {
      case 'dashboard':
        return <CMSDashboard />;
      case 'tenants':
      case 'tenant-detail':
        return <CMSTenants />;
      case 'users':
        return <CMSUsers />;
      case 'features':
        return <CMSFeatures />;
      case 'audit':
        return <CMSAuditLog />;
      case 'settings':
        return <CMSSettings />;
      case 'schedule-editor':
        return <CMSSchedule />;
      case 'faq-editor':
        return <CMSFAQ />;
      case 'media':
        return <CMSMedia />;
      case 'content':
        return <CMSContent />;
      case 'rsvps':
        return <CMSRsvps selectedTenantId={selectedTenantId} authUser={authUser} />;
      case 'wishes':
        return <CMSWishes selectedTenantId={selectedTenantId} authUser={authUser} />;
      case 'analytics':
        return <CMSAnalytics selectedTenantId={selectedTenantId} authUser={authUser} />;
      default:
        return <CMSDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[var(--font-inter),system-ui,sans-serif]">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 bottom-0 w-64 z-40">
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <div className={`${!isMobile ? 'ml-64' : ''} min-h-screen flex flex-col`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-charcoal-ink">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Navigation</SheetTitle>
                    </SheetHeader>
                    <SidebarContent onNavigate={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
              )}

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => useCMSStore.getState().setCmsPage('dashboard')}
                      className="cursor-pointer text-gray-500 hover:text-charcoal-ink"
                    >
                      CMS
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-charcoal-ink font-medium">
                      {pageTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification placeholder */}
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-charcoal-ink">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-gray-100 text-xs text-charcoal-ink">
                        {authUser ? getInitials(authUser.name) : '??'}
                      </AvatarFallback>
                    </Avatar>
                    {!isMobile && (
                      <span className="text-sm text-charcoal-ink font-medium">
                        {authUser?.name || 'User'}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{authUser?.name}</span>
                      <span className="text-xs text-gray-500">{authUser?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => useCMSStore.getState().setCmsPage('dashboard')}
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => useCMSStore.getState().logout()}
                    className="text-red-600 focus:text-red-600"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={cmsPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}