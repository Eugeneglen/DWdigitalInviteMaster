'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Heart,
  MessageCircle,
  ImageIcon,
  ArrowRight,
  Loader2,
  CalendarDays,
  Globe,
} from 'lucide-react';

interface WorkspaceData {
  accountName: string;
  accountSlug: string;
  accountStatus: string;
  weddingDate: string | null;
  plan: string;
  stats: {
    pagesPublished: number;
    totalPages: number;
    rsvpCount: number;
    wishesCount: number;
    mediaCount: number;
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <Card className="border border-champagne-silk/30 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/40 font-[family-name:var(--font-inter)] mb-2">
            {label}
          </p>
          <p className="text-2xl font-[family-name:var(--font-playfair)] font-semibold text-charcoal-ink">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)] mt-1">
              {sub}
            </p>
          )}
        </div>
        <div className="w-9 h-9 rounded-lg bg-cinematic-gold/8 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-cinematic-gold" />
        </div>
      </div>
    </Card>
  );
}

export default function WorkspaceDashboardPage() {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workspace/content')
      .then((res) => res.json())
      .then((result) => {
        if (result.accountName) {
          setData(result);
        }
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-cinematic-gold animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
          Unable to load workspace data. Please ensure your account is set up.
        </p>
      </div>
    );
  }

  const formattedDate = data.weddingDate
    ? new Date(data.weddingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-charcoal-ink tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-charcoal-ink/50 font-[family-name:var(--font-inter)]">
          Manage your wedding website content and settings.
        </p>
      </div>

      {/* Wedding Info Card */}
      <Card className="border border-champagne-silk/30 bg-white overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-cinematic-gold/40 via-cinematic-gold to-cinematic-gold/40" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/40 font-[family-name:var(--font-inter)] mb-1.5">
                Your Wedding
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-charcoal-ink">
                {data.accountName}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-cinematic-gold" />
                <span className="text-sm text-charcoal-ink/60 font-[family-name:var(--font-inter)]">
                  {formattedDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cinematic-gold" />
                <span className="text-sm text-charcoal-ink/60 font-[family-name:var(--font-inter)]">
                  /{data.accountSlug}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] tracking-[0.1em] uppercase font-[family-name:var(--font-inter)] font-medium ${
                data.accountStatus === 'published'
                  ? 'bg-emerald-50 text-emerald-700'
                  : data.accountStatus === 'draft'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-charcoal-ink/5 text-charcoal-ink/50'
              }`}
            >
              {data.accountStatus}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] tracking-[0.1em] uppercase font-[family-name:var(--font-inter)] font-medium bg-cinematic-gold/8 text-cinematic-gold">
              {data.plan}
            </span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Pages Published"
          value={data.stats.pagesPublished}
          sub={`${data.stats.totalPages} total pages`}
        />
        <StatCard
          icon={Heart}
          label="RSVP Submissions"
          value={data.stats.rsvpCount}
        />
        <StatCard
          icon={MessageCircle}
          label="Wishes"
          value={data.stats.wishesCount}
        />
        <StatCard
          icon={ImageIcon}
          label="Media Assets"
          value={data.stats.mediaCount}
        />
      </div>

      <Separator className="bg-champagne-silk/20" />

      {/* Quick Actions */}
      <div>
        <h3 className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/40 font-[family-name:var(--font-inter)] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/workspace/content">
            <Card className="border border-champagne-silk/30 bg-white p-5 hover:border-cinematic-gold/30 transition-colors duration-200 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cinematic-gold/8 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-cinematic-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-ink font-[family-name:var(--font-inter)]">
                      Content Editor
                    </p>
                    <p className="text-xs text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
                      Edit your wedding pages
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-ink/25 group-hover:text-cinematic-gold transition-colors" />
              </div>
            </Card>
          </Link>

          <Link href="/workspace/media">
            <Card className="border border-champagne-silk/30 bg-white p-5 hover:border-cinematic-gold/30 transition-colors duration-200 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cinematic-gold/8 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-cinematic-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-ink font-[family-name:var(--font-inter)]">
                      Media Library
                    </p>
                    <p className="text-xs text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
                      Upload and manage images
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-ink/25 group-hover:text-cinematic-gold transition-colors" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}