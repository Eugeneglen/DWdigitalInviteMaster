'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Mail, Search, CheckCircle, XCircle, MinusCircle, Users, Heart, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FontPicker from './FontPicker';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE = '/api/cms/rsvps?XTransformPort=3000';

interface GuestResponse {
  id: string;
  name: string;
  attendance: string;
  dietary: string | null;
}

interface RSVPItem {
  id: string;
  firstName: string;
  lastName: string;
  partySize: number;
  createdAt: string;
  guests: GuestResponse[];
}

function computeStatus(guests: GuestResponse[]): { label: string; color: string; icon: React.ElementType } {
  if (guests.length === 0) return { label: 'Unknown', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: MinusCircle };
  const allYes = guests.every((g) => g.attendance === 'yes');
  const allNo = guests.every((g) => g.attendance === 'no');
  if (allYes) return { label: 'All Attending', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle };
  if (allNo) return { label: 'All Declined', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle };
  return { label: 'Mixed', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: MinusCircle };
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-SG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function CoupleRSVPs() {
  const [rsvps, setRsvps] = useState<RSVPItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchRSVPs = useCallback(async () => {
    try {
      setLoading(true);
      let url = API_BASE;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load RSVPs');
      const data = await res.json();
      let items: RSVPItem[] = data.rsvps ?? [];

      // Client-side search
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(
          (r) =>
            r.firstName.toLowerCase().includes(q) ||
            r.lastName.toLowerCase().includes(q) ||
            r.guests.some((g) => g.name.toLowerCase().includes(q))
        );
      }

      setRsvps(items);
      setTotal(data.total ?? 0);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchRSVPs();
  }, [fetchRSVPs]);

  // Stats
  const totalAttending = rsvps.reduce(
    (acc, r) => acc + r.guests.filter((g) => g.attendance === 'yes').length,
    0
  );
  const totalDeclined = rsvps.reduce(
    (acc, r) => acc + r.guests.filter((g) => g.attendance === 'no').length,
    0
  );

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/cms/export?XTransformPort=3000&type=rsvps');
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rsvps-export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Success', description: 'Export downloaded' });
    } catch {
      toast({ title: 'Error', description: 'Export failed', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-cinematic-gold" />
        <p className="text-sm text-charcoal-ink/50 font-medium">Loading RSVPs…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-ink">RSVP Responses</h2>
          <p className="text-sm text-charcoal-ink/50 mt-1">
            View and track all guest RSVP submissions.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={exporting}
          variant="outline"
          className="border-charcoal-ink/15 text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 shrink-0"
        >
          {exporting ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Download className="size-4 mr-1.5" />}
          Export CSV
        </Button>
      </div>

      <FontPicker section="rsvp" />
      <Separator className="bg-champagne-silk" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-charcoal-ink/5 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-charcoal-ink">{total}</p>
          <p className="text-xs text-charcoal-ink/40 mt-0.5 font-medium uppercase tracking-wider">Submissions</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{totalAttending}</p>
          <p className="text-xs text-emerald-600/60 mt-0.5 font-medium uppercase tracking-wider">Attending</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{totalDeclined}</p>
          <p className="text-xs text-red-500/60 mt-0.5 font-medium uppercase tracking-wider">Declined</p>
        </div>
        <div className="rounded-xl border border-charcoal-ink/5 bg-white p-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Users className="size-4 text-charcoal-ink/40" />
            <p className="text-2xl font-bold text-charcoal-ink">
              {total > 0 ? Math.round((totalAttending / Math.max(totalAttending + totalDeclined, 1)) * 100) : 0}%
            </p>
          </div>
          <p className="text-xs text-charcoal-ink/40 mt-0.5 font-medium uppercase tracking-wider">Attendance Rate</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-charcoal-ink/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="pl-9 border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Responses</SelectItem>
            <SelectItem value="attending">All Attending</SelectItem>
            <SelectItem value="declined">All Declined</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* RSVP List */}
      {rsvps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Mail className="size-10 text-champagne-silk" />
          <p className="text-sm text-charcoal-ink/40 font-medium">
            {total === 0 ? 'No RSVPs received yet' : 'No RSVPs match your filters'}
          </p>
          <p className="text-xs text-charcoal-ink/30">
            {total === 0
              ? 'RSVPs will appear here once guests start responding.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {rsvps.map((rsvp) => {
            const status = computeStatus(rsvp.guests);
            const StatusIcon = status.icon;
            const attendingCount = rsvp.guests.filter((g) => g.attendance === 'yes').length;

            return (
              <Card key={rsvp.id} className="border-charcoal-ink/5 shadow-none hover:border-champagne-silk transition-colors duration-200">
                <CardContent className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-charcoal-ink/5 text-charcoal-ink text-sm font-semibold shrink-0">
                        {rsvp.firstName[0]}{rsvp.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-charcoal-ink">
                          {rsvp.firstName} {rsvp.lastName}
                        </h3>
                        <p className="text-xs text-charcoal-ink/40">{formatDate(rsvp.createdAt)}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium flex items-center gap-1 ${status.color}`}
                    >
                      <StatusIcon className="size-3" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* Guest responses */}
                  <div className="bg-charcoal-ink/[0.02] rounded-lg p-3 space-y-2">
                    {rsvp.guests.map((guest) => (
                      <div key={guest.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {guest.attendance === 'yes' ? (
                            <CheckCircle className="size-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="size-3.5 text-red-400 shrink-0" />
                          )}
                          <span className="text-xs text-charcoal-ink/70 truncate">{guest.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {guest.dietary && (
                            <span className="text-[10px] text-charcoal-ink/40 bg-white px-1.5 py-0.5 rounded border border-charcoal-ink/5">
                              {guest.dietary}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-charcoal-ink/5 flex items-center justify-between">
                      <span className="text-[10px] text-charcoal-ink/40">
                        Party size: {rsvp.partySize}
                      </span>
                      <span className="text-[10px] font-medium text-charcoal-ink/50">
                        {attendingCount} of {rsvp.guests.length} attending
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}