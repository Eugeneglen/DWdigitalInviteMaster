'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  Heart,
  Calendar,
  BookOpen,
  HelpCircle,
  ToggleLeft,
  ImageIcon,
  Users,
  Mail,
  MessageSquareHeart,
  FileText,
  LogOut,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useCoupleCMSStore, type CoupleCMSPage } from '@/store/useCoupleCMSStore';

const NAV_ITEMS: { key: CoupleCMSPage; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Home },
  { key: 'details', label: 'Your Details', icon: Heart },
  { key: 'content', label: 'Content', icon: FileText },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'story', label: 'Our Story', icon: BookOpen },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle },
  { key: 'features', label: 'Features', icon: ToggleLeft },
  { key: 'images', label: 'Images', icon: ImageIcon },
  { key: 'guests', label: 'Guests', icon: Users },
  { key: 'rsvps', label: 'RSVPs', icon: Mail },
  { key: 'wishes', label: 'Wishes', icon: MessageSquareHeart },
];

export default function CoupleCMSLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { currentPage, setPage, weddingId, setWeddingId, weddingData, setWeddingData } = useCoupleCMSStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWedding() {
      try {
        const res = await fetch('/api/cms/wedding?XTransformPort=3000');
        if (!res.ok) {
          if (res.status === 404) {
            setError('No wedding account assigned. Please contact Dreamweavers.');
            return;
          }
          throw new Error('Failed to load wedding data');
        }
        const data = await res.json();
        setWeddingData(data);
        if (data?.id) {
          setWeddingId(String(data.id));
        }
      } catch (err) {
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchWedding();
  }, [setWeddingData, setWeddingId]);

  const coupleName = (() => {
    if (!weddingData) return 'Your Wedding';
    const groom = (weddingData as Record<string, string>).groomName;
    const bride = (weddingData as Record<string, string>).brideName;
    if (groom && bride) return `${bride} & ${groom}`;
    if (groom) return groom;
    if (bride) return bride;
    return 'Your Wedding';
  })();

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CO';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-cream">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-cinematic-gold" />
          <p className="text-sm text-charcoal-ink/60 font-medium">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-cream p-6">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cinematic-gold/10">
            <Heart className="size-8 text-cinematic-gold" />
          </div>
          <h2 className="text-xl font-semibold text-charcoal-ink">
            {error}
          </h2>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="border-charcoal-ink/15 text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold rounded px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper-cream">
      {/* Left Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-champagne-silk bg-paper-cream md:flex">
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cinematic-gold text-white font-bold text-sm">
            DW
          </div>
          <span className="text-sm font-semibold text-charcoal-ink tracking-wide">
            Dreamweavers
          </span>
        </div>

        <Separator className="bg-champagne-silk" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.key;

              return (
                <li key={item.key}>
                  <button
                    onClick={() => setPage(item.key)}
                    className={`
                      relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium
                      transition-colors duration-150
                      ${
                        isActive
                          ? 'border-l-2 border-cinematic-gold bg-cinematic-gold/5 text-cinematic-gold'
                          : 'text-charcoal-ink/60 hover:bg-champagne-silk/40 hover:text-charcoal-ink border-l-2 border-transparent'
                      }
                    `}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator className="bg-champagne-silk" />

        {/* Back to guest site */}
        <div className="p-3">
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full justify-start gap-2 text-charcoal-ink/50 hover:text-charcoal-ink hover:bg-champagne-silk/40 px-3 text-sm font-medium"
          >
            <ArrowLeft className="size-4" />
            Back to Guest Site
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar overlay trigger + bottom nav for small screens */}
      <div className="fixed inset-0 z-50 flex md:hidden">
        {/* This is handled via a mobile bottom bar below the main content */}
      </div>

      {/* Main Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-champagne-silk bg-paper-cream px-4 md:px-6">
          {/* Left: Couple name + mobile menu */}
          <div className="flex items-center gap-3">
            {/* Mobile back button (visible on small screens) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="md:hidden -ml-2 text-charcoal-ink/60 hover:text-charcoal-ink p-2 h-auto"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-base font-semibold text-charcoal-ink truncate">
              {coupleName}
            </h1>
          </div>

          {/* Right: DW logo + Sign Out */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cinematic-gold text-white font-bold text-[11px]">
              DW
            </div>
            <Separator orientation="vertical" className="h-5 !bg-champagne-silk hidden sm:block" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden sm:flex items-center gap-2 text-charcoal-ink/60 hover:text-charcoal-ink px-2 h-auto py-1.5 text-sm font-medium"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </Button>
            <Avatar className="h-7 w-7 sm:hidden border border-champagne-silk">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'User'} />
              <AvatarFallback className="bg-champagne-silk/50 text-[10px] font-medium text-charcoal-ink">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm ring-1 ring-charcoal-ink/5">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-champagne-silk bg-paper-cream/95 backdrop-blur-sm px-1 py-1.5 pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`
                  flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 transition-colors duration-150
                  ${isActive ? 'text-cinematic-gold' : 'text-charcoal-ink/40'}
                `}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </button>
            );
          })}
          {/* More button for remaining items — for now just repeat last two as compact icons */}
          {NAV_ITEMS.slice(5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`
                  flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 transition-colors duration-150
                  ${isActive ? 'text-cinematic-gold' : 'text-charcoal-ink/40'}
                `}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}