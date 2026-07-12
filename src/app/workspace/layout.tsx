'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut, SessionProvider } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  FileText,
  ImageIcon,
  Settings,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/workspace', icon: LayoutDashboard },
  { label: 'Content Editor', href: '/workspace/content', icon: FileText },
  { label: 'Media Library', href: '/workspace/media', icon: ImageIcon },
  { label: 'Settings', href: '/workspace/settings', icon: Settings },
];

function WorkspaceSidebar({ accountName }: { accountName: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-container-low border-r border-champagne-silk/40 flex flex-col z-30">
      {/* Brand */}
      <div className="px-6 py-6">
        <Link href="/workspace" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-cinematic-gold/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cinematic-gold" />
          </div>
          <div>
            <span className="font-[family-name:var(--font-playfair)] text-base font-semibold text-charcoal-ink tracking-tight block leading-tight">
              Dreamweavers
            </span>
            <span className="text-[11px] text-charcoal-ink/45 uppercase tracking-[0.15em] font-[family-name:var(--font-inter)]">
              Couple Workspace
            </span>
          </div>
        </Link>
      </div>

      <Separator className="bg-champagne-silk/30" />

      {/* Account Name */}
      <div className="px-6 py-4">
        <p className="text-[11px] text-charcoal-ink/35 uppercase tracking-[0.18em] font-[family-name:var(--font-inter)] mb-1">
          Wedding
        </p>
        <p className="font-[family-name:var(--font-playfair)] text-sm font-medium text-charcoal-ink truncate">
          {accountName}
        </p>
      </div>

      <Separator className="bg-champagne-silk/30" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 custom-scrollbar overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/workspace'
              ? pathname === '/workspace'
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
          onClick={() => signOut({ callbackUrl: '/?view=couple' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full
            text-charcoal-ink/50 hover:text-red-600 hover:bg-red-50
            transition-all duration-200 font-[family-name:var(--font-inter)] cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function WorkspaceTopBar({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-20 bg-paper-cream/80 backdrop-blur-md border-b border-champagne-silk/20">
      <div className="flex items-center justify-between px-6 lg:px-8 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-cinematic-gold/10 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-cinematic-gold" />
          </div>
          <span className="text-sm font-[family-name:var(--font-inter)] text-charcoal-ink/70">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}

function WorkspaceLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [accountName, setAccountName] = useState('');

  // Redirect to couple login modal if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/?view=couple';
    }
  }, [status]);

  // Fetch account name for the sidebar — all hooks before early returns
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    fetch('/api/workspace/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.accountName) {
          setAccountName(data.accountName);
        }
      })
      .catch(() => {
        // silently fail — will show empty account name
      });
  }, [session?.user?.id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cinematic-gold/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cinematic-gold animate-pulse" />
          </div>
          <span className="text-sm text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
            Loading workspace...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userName = session.user?.name || session.user?.email || 'User';

  return (
    <div className="min-h-screen flex bg-paper-cream">
      <WorkspaceSidebar accountName={accountName} />

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <WorkspaceTopBar userName={userName} />
        <div className="flex-1 p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>
    </SessionProvider>
  );
}