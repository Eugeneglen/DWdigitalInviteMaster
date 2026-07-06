'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE = '/api/cms/audit-logs?XTransformPort=3000';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  userName: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTION_BADGE: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  DELETE: 'bg-red-50 text-red-600 border-red-200',
  LOGIN: 'bg-slate-100 text-slate-600 border-slate-200',
  LOGOUT: 'bg-slate-100 text-slate-600 border-slate-200',
  ACTIVATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUSPEND: 'bg-amber-50 text-amber-700 border-amber-200',
  EXPORT: 'bg-purple-50 text-purple-700 border-purple-200',
};

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'EXPORT', label: 'Export' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'Guest', label: 'Guest' },
  { value: 'WeddingAccount', label: 'Wedding Account' },
  { value: 'WeddingContent', label: 'Wedding Content' },
  { value: 'WeddingFeature', label: 'Wedding Feature' },
  { value: 'EventSchedule', label: 'Event Schedule' },
  { value: 'FAQ', label: 'FAQ' },
  { value: 'StoryItem', label: 'Story Item' },
  { value: 'WeddingMedia', label: 'Wedding Media' },
  { value: 'RSVPSubmission', label: 'RSVP Submission' },
  { value: 'Wish', label: 'Wish' },
  { value: 'ContactSubmission', label: 'Contact Submission' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 30) return `${diffDay} days ago`;
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

function formatEntityLabel(entity: string): string {
  const label = ENTITY_OPTIONS.find((o) => o.value === entity);
  return label ? label.label : entity;
}

function parseDetailsPreview(details: string | null): string {
  if (!details) return '';
  try {
    const parsed = JSON.parse(details);
    // If it's an object, extract meaningful key-value pairs
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed).slice(0, 2);
      return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
    }
    return String(parsed);
  } catch {
    return details;
  }
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '…';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CoupleAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = [`page=${page}`, 'limit=20'];
      if (actionFilter) params.push(`action=${actionFilter}`);
      if (entityFilter) params.push(`entity=${entityFilter}`);

      const res = await fetch(`${API_BASE}&${params.join('&')}`);
      if (!res.ok) throw new Error('Failed to load audit logs');
      const data = await res.json();
      setLogs(data.logs ?? []);
      setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, pages: 0 });
    } catch {
      toast.error('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityFilter]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // ── Computed stats ─────────────────────────────────────────────────────────

  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return logs.filter((l) => new Date(l.createdAt) >= weekAgo).length;
  }, [logs]);

  const mostActiveEntity = useMemo(() => {
    if (logs.length === 0) return '—';
    const counts: Record<string, number> = {};
    for (const l of logs) {
      counts[l.entity] = (counts[l.entity] || 0) + 1;
    }
    const max = Math.max(...Object.values(counts));
    const top = Object.entries(counts).find(([, v]) => v === max);
    return top ? formatEntityLabel(top[0]) : '—';
  }, [logs]);

  // ── Pagination handlers ────────────────────────────────────────────────────

  const goToPrev = () => {
    if (pagination.page > 1) fetchLogs(pagination.page - 1);
  };

  const goToNext = () => {
    if (pagination.page < pagination.pages) fetchLogs(pagination.page + 1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-charcoal-ink tracking-tight">
          Activity Log
        </h2>
        <p className="mt-1 text-sm text-charcoal-ink/60">
          Track all changes made to your wedding invitation
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={actionFilter}
          onValueChange={(v) => setActionFilter(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-white border-champagne-silk text-charcoal-ink text-sm">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value || '__all__'}
                value={opt.value || '__all__'}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={entityFilter}
          onValueChange={(v) => setEntityFilter(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-white border-champagne-silk text-charcoal-ink text-sm">
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value || '__all__'}
                value={opt.value || '__all__'}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-champagne-silk">
              <CardContent className="p-4">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-7 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-champagne-silk">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-champagne-silk">
                <Activity className="h-4 w-4 text-charcoal-ink/70" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-charcoal-ink/40">
                  Total Events
                </p>
                <p className="text-xl font-semibold text-charcoal-ink">
                  {pagination.total}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-champagne-silk">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-champagne-silk">
                <Calendar className="h-4 w-4 text-charcoal-ink/70" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-charcoal-ink/40">
                  This Week
                </p>
                <p className="text-xl font-semibold text-charcoal-ink">
                  {thisWeekCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-champagne-silk">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-champagne-silk">
                <TrendingUp className="h-4 w-4 text-charcoal-ink/70" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-charcoal-ink/40">
                  Most Active Entity
                </p>
                <p className="text-sm font-semibold text-charcoal-ink truncate">
                  {mostActiveEntity}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity List */}
      <Card className="border-champagne-silk">
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-champagne-silk">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <div className="text-right space-y-1.5 hidden sm:block">
                    <Skeleton className="h-3 w-20 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-champagne-silk mb-4">
                <FileText className="h-6 w-6 text-charcoal-ink/40" />
              </div>
              <p className="text-sm font-medium text-charcoal-ink">
                No activity recorded yet
              </p>
              <p className="mt-1 text-sm text-charcoal-ink/60">
                Changes to your wedding will appear here
              </p>
            </div>
          ) : (
            <div className="custom-scrollbar max-h-[500px] overflow-y-auto divide-y divide-champagne-silk">
              {logs.map((log) => {
                const badgeClass =
                  ACTION_BADGE[log.action] ??
                  'bg-slate-100 text-slate-600 border-slate-200';
                const detailsPreview = parseDetailsPreview(log.details);

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-champagne-silk/30 transition-colors"
                  >
                    {/* Action badge */}
                    <Badge
                      variant="outline"
                      className={`shrink-0 mt-0.5 text-[11px] font-medium ${badgeClass}`}
                    >
                      {log.action}
                    </Badge>

                    {/* Entity + details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-ink truncate">
                        {formatEntityLabel(log.entity)}
                      </p>
                      {detailsPreview && (
                        <p className="text-xs text-charcoal-ink/60 mt-0.5 truncate">
                          {truncate(detailsPreview, 80)}
                        </p>
                      )}
                    </div>

                    {/* Time + user */}
                    <div className="shrink-0 text-right hidden sm:block">
                      <p className="text-xs text-charcoal-ink">
                        {formatTimeAgo(log.createdAt)}
                      </p>
                      <p className="text-[11px] text-charcoal-ink/40 mt-0.5">
                        {log.userName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && pagination.pages > 0 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            disabled={pagination.page <= 1}
            className="border-champagne-silk text-charcoal-ink hover:bg-champagne-silk/50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-charcoal-ink/60">
            Page {pagination.page} of {pagination.pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={pagination.page >= pagination.pages}
            className="border-champagne-silk text-charcoal-ink hover:bg-champagne-silk/50 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(196, 168, 120, 0.3);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(196, 168, 120, 0.5);
        }
      `}</style>
    </div>
  );
}