'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Save, Globe, Eye, EyeOff, Calendar, Mail, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface AccountInfo {
  coupleName1: string;
  coupleName2: string;
  email: string;
  slug: string;
  weddingDate: string | null;
  status: string;
  plan: string;
}

interface FeatureFlag {
  id: string;
  featureKey: string;
  featureName: string;
  enabled: boolean;
  category: string;
}

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  page: 'Page Visibility',
  interactive: 'Interactive Features',
  display: 'Display Options',
  advanced: 'Advanced',
  custom: 'Custom',
};

function formatWeddingDate(dateStr: string | null): string {
  if (!dateStr) return 'Not set';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function WorkspaceSettingsPage() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingFlags, setSavingFlags] = useState(false);
  const [togglingPage, setTogglingPage] = useState<string | null>(null);
  const [modifiedFlags, setModifiedFlags] = useState<Set<string>>(new Set());

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/workspace/settings');
      if (res.ok) {
        const data = await res.json();
        setAccount(data.account);
        setFlags(data.flags ?? []);
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/workspace/content');
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages ?? []);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchPages();
  }, [fetchSettings, fetchPages]);

  const toggleFlag = (featureKey: string, enabled: boolean) => {
    setFlags((prev) =>
      prev.map((f) => (f.featureKey === featureKey ? { ...f, enabled } : f))
    );
    setModifiedFlags((prev) => {
      const next = new Set(prev);
      next.add(featureKey);
      return next;
    });
  };

  const saveFlags = async () => {
    if (modifiedFlags.size === 0) return;

    setSavingFlags(true);
    try {
      const changes = flags
        .filter((f) => modifiedFlags.has(f.featureKey))
        .map((f) => ({ featureKey: f.featureKey, enabled: f.enabled }));

      const res = await fetch('/api/workspace/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flags: changes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      toast.success('Feature flags updated');
      setModifiedFlags(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save flags');
    } finally {
      setSavingFlags(false);
    }
  };

  const togglePagePublish = async (page: ContentPage) => {
    setTogglingPage(page.slug);
    try {
      const res = await fetch('/api/workspace/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSlug: page.slug, publish: !page.isPublished }),
      });

      if (!res.ok) {
        throw new Error('Failed to toggle page');
      }

      setPages((prev) =>
        prev.map((p) =>
          p.slug === page.slug ? { ...p, isPublished: !p.isPublished } : p
        )
      );
      toast.success(
        `${page.title} ${page.isPublished ? 'unpublished' : 'published'}`
      );
    } catch {
      toast.error('Failed to update page status');
    } finally {
      setTogglingPage(null);
    }
  };

  // Group flags by category
  const groupedFlags = flags.reduce<Record<string, FeatureFlag[]>>((acc, flag) => {
    const cat = flag.category || 'custom';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(flag);
    return acc;
  }, {});

  const categoryOrder = ['page', 'interactive', 'display', 'advanced', 'custom'];

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-charcoal-ink tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-charcoal-ink/50 font-[family-name:var(--font-inter)]">
          Manage your account settings and feature preferences
        </p>
      </div>

      {/* Account Info Section */}
      <div className="bg-white rounded-xl border border-champagne-silk/30 p-6">
        <h2 className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/45 font-[family-name:var(--font-inter)] font-medium mb-4">
          Account Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={Globe} label="Couple Names" value={account ? `${account.coupleName1} & ${account.coupleName2}` : '—'} />
          <InfoRow icon={Mail} label="Email" value={account?.email ?? '—'} />
          <InfoRow icon={Hash} label="Slug" value={account?.slug ?? '—'} mono />
          <InfoRow icon={Calendar} label="Wedding Date" value={account ? formatWeddingDate(account.weddingDate) : '—'} />
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-champagne-silk/20">
          <span className="text-xs text-charcoal-ink/45 font-[family-name:var(--font-inter)]">Status:</span>
          <Badge
            variant="outline"
            className={
              account?.status === 'published'
                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                : 'border-charcoal-ink/20 text-charcoal-ink/60 bg-charcoal-ink/5'
            }
          >
            {account?.status ?? 'draft'}
          </Badge>
          <span className="text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)] ml-2">Plan:</span>
          <Badge variant="outline" className="border-cinematic-gold/30 text-cinematic-gold bg-cinematic-gold/5 capitalize">
            {account?.plan ?? 'free'}
          </Badge>
        </div>
      </div>

      {/* Feature Flags Section */}
      <div className="bg-white rounded-xl border border-champagne-silk/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/45 font-[family-name:var(--font-inter)] font-medium">
              Feature Flags
            </h2>
            <p className="text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)] mt-1">
              Control which features are enabled on your wedding site
            </p>
          </div>
          {modifiedFlags.size > 0 && (
            <Button
              onClick={saveFlags}
              disabled={savingFlags}
              className="bg-cinematic-gold hover:bg-cinematic-gold/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {savingFlags ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes ({modifiedFlags.size})
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {categoryOrder
            .filter((cat) => groupedFlags[cat]?.length)
            .map((category) => (
              <div key={category}>
                <h3 className="text-xs font-medium text-charcoal-ink/70 font-[family-name:var(--font-inter)] mb-3">
                  {CATEGORY_LABELS[category] || category}
                </h3>
                <div className="space-y-0 divide-y divide-champagne-silk/20">
                  {groupedFlags[category].map((flag) => (
                    <div
                      key={flag.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm text-charcoal-ink font-[family-name:var(--font-inter)]">
                          {flag.featureName}
                        </p>
                        <p className="text-[11px] text-charcoal-ink/35 font-[family-name:var(--font-inter)] font-mono mt-0.5">
                          {flag.featureKey}
                        </p>
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={(checked) =>
                          toggleFlag(flag.featureKey, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
                <Separator className="mt-6 bg-champagne-silk/20" />
              </div>
            ))}
        </div>
      </div>

      {/* Publishing Section */}
      <div className="bg-white rounded-xl border border-champagne-silk/30 p-6">
        <h2 className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/45 font-[family-name:var(--font-inter)] font-medium mb-1">
          Publishing
        </h2>
        <p className="text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)] mb-4">
          Toggle page visibility on your live wedding site
        </p>
        <div className="space-y-0 divide-y divide-champagne-silk/20">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <p className="text-sm text-charcoal-ink font-[family-name:var(--font-inter)]">
                  {page.title}
                </p>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    page.isPublished
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                      : 'border-charcoal-ink/15 text-charcoal-ink/40 bg-charcoal-ink/[0.03]'
                  }`}
                >
                  {page.isPublished ? (
                    <Eye className="w-2.5 h-2.5 mr-1" />
                  ) : (
                    <EyeOff className="w-2.5 h-2.5 mr-1" />
                  )}
                  {page.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePagePublish(page)}
                  disabled={togglingPage === page.slug}
                  className="text-[11px] text-cinematic-gold hover:text-cinematic-gold/70 font-[family-name:var(--font-inter)] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {togglingPage === page.slug ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : page.isPublished ? (
                    'Unpublish'
                  ) : (
                    'Publish'
                  )}
                </button>
              </div>
            </div>
          ))}
          {pages.length === 0 && (
            <p className="text-xs text-charcoal-ink/35 font-[family-name:var(--font-inter)] py-4 text-center">
              No pages found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-cinematic-gold/8 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-cinematic-gold" />
      </div>
      <div>
        <p className="text-[11px] text-charcoal-ink/35 font-[family-name:var(--font-inter)] uppercase tracking-[0.12em]">
          {label}
        </p>
        <p
          className={`text-sm text-charcoal-ink font-[family-name:var(--font-inter)] mt-0.5 ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}