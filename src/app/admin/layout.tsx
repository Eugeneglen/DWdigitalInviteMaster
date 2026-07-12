'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut, SessionProvider } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  Layers,
  Settings,
  ScrollText,
  LogOut,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Accounts', href: '/admin/accounts', icon: Users },
  { label: 'Features', href: '/admin/features', icon: Layers },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Redirect to CMS login modal if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/?view=cms';
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cinematic-gold/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cinematic-gold animate-pulse" />
          </div>
          <span className="text-sm text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
            Loading admin...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-paper-cream">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-container-low border-r border-champagne-silk/40 flex flex-col z-30">
        {/* Brand */}
        <div className="px-6 py-6">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-cinematic-gold/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cinematic-gold" />
            </div>
            <div>
              <span className="font-[family-name:var(--font-playfair)] text-base font-semibold text-charcoal-ink tracking-tight block leading-tight">
                Dreamweavers
              </span>
              <span className="text-[11px] text-charcoal-ink/45 uppercase tracking-[0.15em] font-[family-name:var(--font-inter)]">
                PTL Console
              </span>
            </div>
          </Link>
        </div>

        <Separator className="bg-champagne-silk/30" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 custom-scrollbar overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-[family-name:var(--font-inter)]
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-cinematic-gold/10 text-cinematic-gold font-medium'
                      : 'text-charcoal-ink/60 hover:text-charcoal-ink hover:bg-charcoal-ink/[0.03]'
                  }
                `}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cinematic-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-champagne-silk/30" />

        {/* Logout */}
        <div className="px-3 py-4">
          <button
            onClick={() => signOut({ callbackUrl: '/?view=cms' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full
              text-charcoal-ink/50 hover:text-red-600 hover:bg-red-50
              transition-all duration-200 font-[family-name:var(--font-inter)] cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}