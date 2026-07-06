'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CalendarDays, MapPin, Mail, Heart, Pencil, CalendarClock, BookOpen, HelpCircle, ChevronRight } from 'lucide-react';
import { useCoupleCMSStore, type CoupleCMSPage } from '@/store/useCoupleCMSStore';

const API_BASE = '/api/cms/wedding?XTransformPort=3000';

interface WeddingData {
  id: string;
  coupleName: string;
  brideName: string | null;
  groomName: string | null;
  weddingDate: string;
  venue: string | null;
  _count?: {
    rsvps?: number;
    wishes?: number;
  };
  [key: string]: unknown;
}

interface QuickAction {
  page: CoupleCMSPage;
  icon: React.ElementType;
  title: string;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    page: 'details',
    icon: Pencil,
    title: 'Edit Your Details',
    description: 'Update names, date, venue, and other wedding information',
  },
  {
    page: 'schedule',
    icon: CalendarClock,
    title: 'Manage Schedule',
    description: 'Add and organize your wedding day events and timeline',
  },
  {
    page: 'story',
    icon: BookOpen,
    title: 'Edit Our Story',
    description: 'Add chapters to share your love story with guests',
  },
  {
    page: 'faqs',
    icon: HelpCircle,
    title: 'Manage FAQs',
    description: 'Create and manage questions your guests might have',
  },
];

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function CoupleOverview() {
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setPage } = useCoupleCMSStore();

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Failed to load wedding data');
        const data = await res.json();
        setWedding(data.wedding as WeddingData);
      } catch {
        // Silently fail — overview can still show quick actions
      } finally {
        setLoading(false);
      }
    };
    fetchWedding();
  }, []);

  const brideName = wedding?.brideName ?? '';
  const groomName = wedding?.groomName ?? '';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-cinematic-gold" />
        <p className="text-sm text-charcoal-ink/50 font-medium">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center py-4">
        <p className="text-2xl sm:text-3xl font-semibold text-charcoal-ink tracking-tight">
          Welcome, {brideName && groomName ? `${brideName} & ${groomName}` : (wedding?.coupleName ?? 'Couple')}! 💍
        </p>
        <p className="text-sm text-charcoal-ink/40 mt-2">
          Here&apos;s an overview of your wedding invitation.
        </p>
      </div>

      {/* Summary Cards — 2x2 on desktop, 1 col mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wedding Date */}
        <div className="flex items-center gap-4 rounded-xl border border-charcoal-ink/5 bg-white p-5">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
            <CalendarDays className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-charcoal-ink/40 uppercase tracking-wider">
              Wedding Date
            </p>
            <p className="text-sm font-semibold text-charcoal-ink mt-0.5 truncate">
              {wedding?.weddingDate ? formatDate(wedding.weddingDate) : 'Not set'}
            </p>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-4 rounded-xl border border-charcoal-ink/5 bg-white p-5">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
            <MapPin className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-charcoal-ink/40 uppercase tracking-wider">
              Venue
            </p>
            <p className="text-sm font-semibold text-charcoal-ink mt-0.5 truncate">
              {wedding?.venue ?? 'Not set'}
            </p>
          </div>
        </div>

        {/* RSVPs Received */}
        <div className="flex items-center gap-4 rounded-xl border border-charcoal-ink/5 bg-white p-5">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
            <Mail className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-charcoal-ink/40 uppercase tracking-wider">
              RSVPs Received
            </p>
            <p className="text-sm font-semibold text-charcoal-ink mt-0.5">
              {wedding?._count?.rsvps ?? 0} response{(wedding?._count?.rsvps ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Wishes Received */}
        <div className="flex items-center gap-4 rounded-xl border border-charcoal-ink/5 bg-white p-5">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
            <Heart className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-charcoal-ink/40 uppercase tracking-wider">
              Wishes Received
            </p>
            <p className="text-sm font-semibold text-charcoal-ink mt-0.5">
              {wedding?._count?.wishes ?? 0} wish{(wedding?._count?.wishes ?? 0) !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-charcoal-ink mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.page}
                type="button"
                onClick={() => setPage(action.page)}
                className="flex items-center gap-4 rounded-xl border border-champagne-silk bg-white p-4 text-left hover:border-cinematic-gold hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0 group-hover:bg-cinematic-gold/20 transition-colors duration-200">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal-ink">
                    {action.title}
                  </p>
                  <p className="text-xs text-charcoal-ink/40 mt-0.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <ChevronRight className="size-4 text-charcoal-ink/20 group-hover:text-cinematic-gold group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}