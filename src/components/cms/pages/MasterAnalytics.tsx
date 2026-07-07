'use client';

import React, { useEffect, useState } from 'react';
import {
  Heart, CheckCircle, Users, Mail, MessageSquareHeart, UserCheck,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ── Types ──────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalWeddings: number;
  activeWeddings: number;
  totalUsers: number;
  totalRSVPs: number;
  totalWishes: number;
  totalContacts: number;
  totalGuests: number;
  rsvpTrend: { date: string; count: number }[];
  weddingStatusBreakdown: Record<string, number>;
  planBreakdown: Record<string, number>;
  recentActivity: {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    details: string | null;
    createdAt: string;
    user: { name: string | null; email: string } | null;
  }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRelative(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10b981',
  DRAFT: '#f59e0b',
  SUSPENDED: '#ef4444',
  ARCHIVED: '#94a3b8',
  COMPLETED: '#3b82f6',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: '#94a3b8',
  PREMIUM: '#d4af37',
  ENTERPRISE: '#8b5cf6',
};

// ── Sub-components ─────────────────────────────────────────────────────────

function KPICard({ label, value, icon: Icon, subtitle }: {
  label: string; value: number; icon: React.ElementType; subtitle?: string;
}) {
  return (
    <Card className="border-slate-200 rounded-xl bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{label}</p>
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function KPICardSkeleton() {
  return (
    <Card className="border-slate-200 rounded-xl bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <Skeleton className="mt-2 h-8 w-16" />
        <Skeleton className="mt-1 h-3 w-32" />
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function MasterAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await fetch('/api/master/analytics?XTransformPort=3000');
        if (!res.ok) throw new Error(`Failed to load analytics (${res.status})`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-sm font-medium text-red-500">Error loading analytics</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  // Prepare chart data
  const statusPieData = data
    ? Object.entries(data.weddingStatusBreakdown)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const planBarData = data
    ? Object.entries(data.planBreakdown).map(([name, count]) => ({ name, count }))
    : [];

  const trendData = data?.rsvpTrend.map((d) => ({
    ...d,
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
        <p className="text-slate-500 mt-1">Platform-wide metrics and reports</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
          : data && (
            <>
              <KPICard label="Total Weddings" value={data.totalWeddings} icon={Heart} subtitle={`${data.activeWeddings} active`} />
              <KPICard label="Active Weddings" value={data.activeWeddings} icon={CheckCircle} subtitle="currently live" />
              <KPICard label="Total Users" value={data.totalUsers} icon={Users} subtitle="active accounts" />
              <KPICard label="Total RSVPs" value={data.totalRSVPs} icon={Mail} subtitle="all submissions" />
              <KPICard label="Total Wishes" value={data.totalWishes} icon={MessageSquareHeart} subtitle="guest messages" />
              <KPICard label="Total Guests" value={data.totalGuests} icon={UserCheck} subtitle="tracked guests" />
            </>
          )
        }
      </div>

      {/* Charts Row 1: RSVP Trend + Wedding Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RSVP Trend — Area Chart (spans 2 cols) */}
        <Card className="lg:col-span-2 border-slate-200 rounded-xl bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">RSVP Trend</CardTitle>
            <p className="text-sm text-slate-400">Submissions over the last 30 days</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rsvpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    labelStyle={{ color: '#475569' }}
                  />
                  <Area type="monotone" dataKey="count" name="RSVPs" stroke="#D4AF37" strokeWidth={2} fill="url(#rsvpGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Wedding Status — Donut Chart */}
        <Card className="border-slate-200 rounded-xl bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">Wedding Status</CardTitle>
            <p className="text-sm text-slate-400">Distribution by status</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : statusPieData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Plan Distribution */}
      <Card className="border-slate-200 rounded-xl bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-900">Plan Distribution</CardTitle>
          <p className="text-sm text-slate-400">Weddings by subscription plan</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[200px] w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={planBarData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
                <Bar dataKey="count" name="Weddings" radius={[0, 6, 6, 0]} barSize={28}>
                  {planBarData.map((entry) => (
                    <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-slate-200 rounded-xl bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
          <p className="text-sm text-slate-400">Last 10 audit log entries</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20 shrink-0" />
                  <Skeleton className="h-4 w-32 shrink-0" />
                  <Skeleton className="h-4 w-24 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : data && data.recentActivity.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm">No activity yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Entity</th>
                    <th className="text-left py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.recentActivity.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-4 whitespace-nowrap text-slate-500">{formatRelative(log.createdAt)}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-slate-700 font-medium">{log.user?.name || 'System'}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">{log.action}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-slate-600">{log.entity}</td>
                      <td className="py-2.5 text-slate-400 max-w-[200px] truncate">{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}