'use client';

import React, { useEffect, useState } from 'react';
import {
  Loader2,
  CalendarDays,
  Users,
  Mail,
  MessageSquareHeart,
  CheckCircle2,
  Circle,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCoupleCMSStore, type CoupleCMSPage } from '@/store/useCoupleCMSStore';

// ── Types ──────────────────────────────────────────────────────────────────

interface OverviewData {
  daysUntil: number;
  isPast: boolean;
  weddingDate: string;
  coupleName: string;
  venue: string;
  status: string;
  guests: {
    total: number;
    byStatus: { PENDING: number; ATTENDING: number; DECLINED: number; PARTIAL: number };
    responded: number;
    attendanceRate: number;
    groups: Array<{ name: string; count: number }>;
    totalWithPlusOne: number;
  };
  rsvps: { total: number };
  wishes: { total: number };
  contacts: { total: number };
  content: { completion: number; filledSections: number; totalSections: number };
  checklist: {
    items: Array<{ key: string; label: string; done: boolean }>;
    completed: number;
    total: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    details: string;
    createdAt: string;
    userName: string;
  }>;
  media: { total: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const API_URL = '/api/cms/overview?XTransformPort=3000';

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

const CHECKLIST_PAGE_MAP: Record<string, CoupleCMSPage> = {
  details: 'details',
  hero_image: 'images',
  banner_image: 'images',
  schedule: 'schedule',
  story: 'story',
  faqs: 'faqs',
  gallery: 'images',
  guests: 'guests',
  content: 'content',
  features: 'features',
};

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-sky-100 text-sky-700 border-sky-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
};

function getActionStyle(action: string): string {
  return ACTION_STYLES[action] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}

const CONTENT_SECTION_LABELS = [
  { key: 'hero', label: 'Hero' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'story', label: 'Story' },
  { key: 'rsvp', label: 'RSVP' },
  { key: 'getting-there', label: 'Getting There' },
  { key: 'qa', label: 'Q&A' },
  { key: 'wishes', label: 'Wishes' },
  { key: 'moments', label: 'Moments' },
  { key: 'footer', label: 'Footer' },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function CoupleOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setPage } = useCoupleCMSStore();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_URL);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        }
        const json = await res.json();
        setData(json as OverviewData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  // ── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-cinematic-gold" />
        <p className="text-sm text-charcoal-ink/50 font-medium">Loading your workspace…</p>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-red-600 font-medium">{error ?? 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  // ── Derived Values ─────────────────────────────────────────────────────
  const { daysUntil, isPast, coupleName, guests, rsvps, wishes, content, checklist, recentActivity } = data;

  // Split coupleName into bride & groom
  const nameParts = coupleName.split(/[\s&]+/).filter(Boolean);
  const brideName = nameParts[0] ?? '';
  const groomName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const responseRate =
    guests.total > 0 ? Math.round((guests.responded / guests.total) * 100) : 0;

  // Figure out which content sections are filled
  // The API doesn't tell us which sections are filled individually, so we show the overall completion
  // and infer section status from filledSections count (ordered by common priority)
  const filledSectionKeys = CONTENT_SECTION_LABELS.slice(0, content.filledSections).map((s) => s.key);

  const activityItems = recentActivity.slice(0, 8);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* 1. Welcome Message */}
      <div className="text-center py-4">
        <p className="text-2xl sm:text-3xl font-semibold text-charcoal-ink tracking-tight">
          Welcome, {brideName}{groomName ? ` & ${groomName}` : ''}!
        </p>
        <p className="text-sm text-charcoal-ink/50 mt-2">
          {isPast
            ? 'Your big day has passed!'
            : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} until your big day`}
        </p>
      </div>

      {/* 2. Top Stats Row — 4 cards, 2x2 on mobile, 4-col on md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Days Left */}
        <Card className="py-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
              <CalendarDays className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal-ink/40">
                Days Left
              </p>
              <p className="text-xl font-bold text-cinematic-gold leading-tight">
                {isPast ? '—' : daysUntil}
              </p>
              {!isPast && (
                <p className="text-[11px] text-charcoal-ink/40">days</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Guests */}
        <Card className="py-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal-ink/40">
                Total Guests
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-charcoal-ink leading-tight">
                  {guests.total}
                </p>
                {guests.totalWithPlusOne > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-cinematic-gold/30 text-cinematic-gold">
                    {guests.totalWithPlusOne} with +1
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RSVPs Received */}
        <Card className="py-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
              <Mail className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal-ink/40">
                RSVPs Received
              </p>
              <p className="text-xl font-bold text-charcoal-ink leading-tight">
                {rsvps.total}
              </p>
              {guests.total > 0 && (
                <p className="text-[11px] text-charcoal-ink/40">
                  {responseRate}% responded
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wishes */}
        <Card className="py-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
              <MessageSquareHeart className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal-ink/40">
                Wishes
              </p>
              <p className="text-xl font-bold text-charcoal-ink leading-tight">
                {wishes.total}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Two-column: RSVP Progress + Setup Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: RSVP Progress Card */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-charcoal-ink">
              Guest Response Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {guests.total === 0 ? (
              <p className="text-sm text-charcoal-ink/40 py-4 text-center">
                Add guests to track responses
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-charcoal-ink/50">
                    <span>Attendance Rate</span>
                    <span className="font-semibold text-charcoal-ink">{guests.attendanceRate}%</span>
                  </div>
                  <Progress
                    value={guests.attendanceRate}
                    className="h-2 [&>[data-slot=progress-indicator]]:bg-cinematic-gold"
                  />
                </div>

                {/* Mini stats row */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-xs font-semibold text-charcoal-ink">
                        {guests.byStatus.PENDING}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal-ink/40 uppercase tracking-wider">Pending</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-charcoal-ink">
                        {guests.byStatus.ATTENDING}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal-ink/40 uppercase tracking-wider">Attending</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="size-2 rounded-full bg-red-400 shrink-0" />
                      <span className="text-xs font-semibold text-charcoal-ink">
                        {guests.byStatus.DECLINED}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal-ink/40 uppercase tracking-wider">Declined</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="size-2 rounded-full bg-sky-400 shrink-0" />
                      <span className="text-xs font-semibold text-charcoal-ink">
                        {guests.byStatus.PARTIAL}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal-ink/40 uppercase tracking-wider">Partial</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Setup Checklist Card */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-charcoal-ink">
                Setup Checklist
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-cinematic-gold/30 text-cinematic-gold">
                {checklist.completed}/{checklist.total} completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {checklist.items.map((item) => {
                const targetPage = CHECKLIST_PAGE_MAP[item.key];
                const isDone = item.done;

                return (
                  <li key={item.key}>
                    {isDone || !targetPage ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        <span className="text-sm text-charcoal-ink">{item.label}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPage(targetPage)}
                        className="flex items-center gap-3 w-full text-left group cursor-pointer"
                      >
                        <Circle className="size-4 text-charcoal-ink/25 shrink-0 group-hover:text-cinematic-gold transition-colors" />
                        <span className="text-sm text-charcoal-ink/50 group-hover:text-charcoal-ink transition-colors">
                          {item.label}
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 4. Content Completion Card (full width) */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold text-charcoal-ink">
            Content Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-charcoal-ink/50">
              <span>Completion</span>
              <span className="font-semibold text-charcoal-ink">
                {content.filledSections} of {content.totalSections} sections filled
              </span>
            </div>
            <Progress
              value={content.completion}
              className="h-2 [&>[data-slot=progress-indicator]]:bg-cinematic-gold"
            />
          </div>

          {/* Section labels with check/x icons */}
          <div className="flex flex-wrap gap-2">
            {CONTENT_SECTION_LABELS.map((section) => {
              const isFilled = filledSectionKeys.includes(section.key);
              return (
                <div
                  key={section.key}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isFilled
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-charcoal-ink/10 bg-gray-50 text-charcoal-ink/40'
                  }`}
                >
                  {isFilled ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3" />
                  )}
                  {section.label}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 5. Recent Activity Card (full width) */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold text-charcoal-ink">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityItems.length === 0 ? (
            <p className="text-sm text-charcoal-ink/40 py-4 text-center">
              No recent activity yet
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-0">
              {activityItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 py-3 ${
                    idx < activityItems.length - 1 ? 'border-b border-charcoal-ink/5' : ''
                  }`}
                >
                  {/* Action badge */}
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] mt-0.5 ${getActionStyle(item.action)}`}
                  >
                    {item.action}
                  </Badge>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-charcoal-ink truncate">
                        {item.entity}
                      </span>
                      {item.details && (
                        <>
                          <span className="text-charcoal-ink/20 text-xs">·</span>
                          <span className="text-sm text-charcoal-ink/50 truncate">
                            {item.details}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-ink/35 mt-0.5">
                      {item.userName} · {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}