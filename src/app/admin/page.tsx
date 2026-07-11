'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Globe,
  UserCheck,
  MailCheck,
  Heart,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminData {
  totalAccounts: number;
  activeSites: number;
  totalGuests: number;
  totalRsvps: number;
  totalWishes: number;
  totalContacts: number;
  recentRsvps: {
    id: string;
    firstName: string;
    lastName: string;
    partySize: number;
    createdAt: string;
    guests: { attendance: string }[];
  }[];
  recentWishes: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
  }[];
  recentContacts: {
    id: string;
    name: string;
    reason: string;
    status: string;
    createdAt: string;
  }[];
}

const stats = [
  {
    key: 'totalAccounts' as const,
    label: 'Total Accounts',
    icon: Users,
    description: 'Registered wedding accounts',
  },
  {
    key: 'activeSites' as const,
    label: 'Active Sites',
    icon: Globe,
    description: 'Published wedding sites',
  },
  {
    key: 'totalGuests' as const,
    label: 'Total Guests',
    icon: UserCheck,
    description: 'Guests across all sites',
  },
  {
    key: 'totalRsvps' as const,
    label: 'Total RSVPs',
    icon: MailCheck,
    description: 'RSVP submissions received',
  },
  {
    key: 'totalWishes' as const,
    label: 'Total Wishes',
    icon: Heart,
    description: 'Wishes submitted by guests',
  },
  {
    key: 'totalContacts' as const,
    label: 'Total Contacts',
    icon: MessageSquare,
    description: 'Contact form submissions',
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-champagne-silk/30 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-3 w-36" />
    </div>
  );
}

function ActivityCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-champagne-silk/30 p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-charcoal-ink tracking-tight">
          Dreamweavers PTL
        </h1>
        <p className="mt-1 text-sm text-charcoal-ink/50 font-[family-name:var(--font-inter)]">
          Platform overview and management console
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => {
              const Icon = stat.icon;
              const value = data ? data[stat.key] : 0;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-champagne-silk/30 p-5
                             hover:shadow-sm hover:border-cinematic-gold/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.12em] text-charcoal-ink/45 font-[family-name:var(--font-inter)] font-medium">
                        {stat.label}
                      </p>
                      <p className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-charcoal-ink tabular-nums">
                        {value}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-cinematic-gold/8 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-cinematic-gold" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)]">
                    {stat.description}
                  </p>
                </div>
              );
            })}
      </div>

      {/* Recent Activity Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActivityCardSkeleton />
          <ActivityCardSkeleton />
          <ActivityCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent RSVPs */}
          <div className="bg-white rounded-xl border border-champagne-silk/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cinematic-gold/8 flex items-center justify-center">
                <MailCheck className="w-3.5 h-3.5 text-cinematic-gold" />
              </div>
              <h3 className="text-sm font-medium text-charcoal-ink font-[family-name:var(--font-inter)]">
                Recent RSVPs
              </h3>
            </div>
            {data?.recentRsvps.length === 0 ? (
              <p className="text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)] py-4 text-center">
                No RSVPs yet
              </p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {data?.recentRsvps.map((rsvp) => {
                  const attending = rsvp.guests.filter(
                    (g) => g.attendance === 'yes'
                  ).length;
                  const total = rsvp.guests.length;
                  return (
                    <div
                      key={rsvp.id}
                      className="flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-charcoal-ink truncate font-[family-name:var(--font-inter)]">
                          {rsvp.firstName} {rsvp.lastName}
                        </p>
                        <p className="text-[11px] text-charcoal-ink/35 font-[family-name:var(--font-inter)]">
                          {formatDate(rsvp.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0 ml-2 border-cinematic-gold/30 text-cinematic-gold bg-cinematic-gold/5"
                      >
                        {attending}/{total} attending
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Wishes */}
          <div className="bg-white rounded-xl border border-champagne-silk/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cinematic-gold/8 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-cinematic-gold" />
              </div>
              <h3 className="text-sm font-medium text-charcoal-ink font-[family-name:var(--font-inter)]">
                Recent Wishes
              </h3>
            </div>
            {data?.recentWishes.length === 0 ? (
              <p className="text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)] py-4 text-center">
                No wishes yet
              </p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {data?.recentWishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-charcoal-ink truncate font-[family-name:var(--font-inter)]">
                        {wish.name}
                      </p>
                      <p className="text-[11px] text-charcoal-ink/35 font-[family-name:var(--font-inter)]">
                        {formatDate(wish.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ml-2 ${
                        wish.status === 'approved'
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                          : wish.status === 'pending'
                            ? 'border-amber-300 text-amber-700 bg-amber-50'
                            : 'border-charcoal-ink/20 text-charcoal-ink/50 bg-charcoal-ink/5'
                      }`}
                    >
                      {wish.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Contacts */}
          <div className="bg-white rounded-xl border border-champagne-silk/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cinematic-gold/8 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-cinematic-gold" />
              </div>
              <h3 className="text-sm font-medium text-charcoal-ink font-[family-name:var(--font-inter)]">
                Recent Contacts
              </h3>
            </div>
            {data?.recentContacts.length === 0 ? (
              <p className="text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)] py-4 text-center">
                No contacts yet
              </p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {data?.recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-charcoal-ink truncate font-[family-name:var(--font-inter)]">
                        {contact.name}
                      </p>
                      <p className="text-[11px] text-charcoal-ink/35 font-[family-name:var(--font-inter)]">
                        {formatDate(contact.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ml-2 ${
                        contact.status === 'open'
                          ? 'border-amber-300 text-amber-700 bg-amber-50'
                          : 'border-emerald-300 text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {contact.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}