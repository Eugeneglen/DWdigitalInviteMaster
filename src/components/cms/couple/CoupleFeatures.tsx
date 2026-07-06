'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Timer, CalendarClock, Mail, BookOpen, Image, Heart, MapPin, HelpCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const API_BASE = '/api/cms/features?XTransformPort=3000';

interface FeatureConfig {
  featureKey: string;
  displayName: string;
  description: string;
  icon: React.ElementType;
}

const FEATURE_REGISTRY: Record<string, FeatureConfig> = {
  countdown: {
    featureKey: 'countdown',
    displayName: 'Countdown Timer',
    description: 'Show a live countdown to your wedding day',
    icon: Timer,
  },
  schedule: {
    featureKey: 'schedule',
    displayName: 'Event Schedule',
    description: 'Display the timeline of your wedding day events',
    icon: CalendarClock,
  },
  rsvp: {
    featureKey: 'rsvp',
    displayName: 'RSVP Form',
    description: 'Allow guests to submit their attendance response',
    icon: Mail,
  },
  story: {
    featureKey: 'story',
    displayName: 'Our Story',
    description: 'Share your love story timeline with guests',
    icon: BookOpen,
  },
  gallery: {
    featureKey: 'gallery',
    displayName: 'Photo Gallery',
    description: 'Display a gallery of your favorite moments',
    icon: Image,
  },
  wishes: {
    featureKey: 'wishes',
    displayName: 'Wishes & Blessings',
    description: 'Let guests leave their heartfelt messages',
    icon: Heart,
  },
  'getting-there': {
    featureKey: 'getting-there',
    displayName: 'Getting There',
    description: 'Provide directions and venue information',
    icon: MapPin,
  },
  qa: {
    featureKey: 'qa',
    displayName: 'Questions & Answers',
    description: 'Address common guest questions',
    icon: HelpCircle,
  },
  moments: {
    featureKey: 'moments',
    displayName: 'Moments',
    description: 'Share special moments captured on your journey',
    icon: Sparkles,
  },
};

const FEATURE_ORDER = [
  'countdown',
  'schedule',
  'rsvp',
  'story',
  'gallery',
  'wishes',
  'getting-there',
  'qa',
  'moments',
];

interface FeatureItem {
  featureKey: string;
  enabled: boolean;
}

export default function CoupleFeatures() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to load features');
      const data = await res.json();
      setFeatures(data.features ?? []);
    } catch {
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const getFeatureConfig = (key: string): FeatureConfig => {
    return (
      FEATURE_REGISTRY[key] ?? {
        featureKey: key,
        displayName: key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        description: 'Toggle this feature on or off',
        icon: Sparkles,
      }
    );
  };

  const handleToggle = (key: string) => {
    // Optimistic update
    setFeatures((prev) =>
      prev.map((f) => (f.featureKey === key ? { ...f, enabled: !f.enabled } : f))
    );

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving indicator
    setSavingKey(key);

    // Immediate save on toggle
    const updatedFeatures = features.map((f) =>
      f.featureKey === key ? { ...f, enabled: !f.enabled } : f
    );

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(API_BASE, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features: updatedFeatures }),
        });

        if (!res.ok) {
          throw new Error('Failed to save features');
        }

        const config = getFeatureConfig(key);
        const isEnabled = updatedFeatures.find((f) => f.featureKey === key)?.enabled;
        toast.success(
          `${config.displayName} ${isEnabled ? 'enabled' : 'disabled'}`
        );
      } catch {
        // Revert optimistic update
        setFeatures(features);
        toast.error('Failed to save feature changes');
      } finally {
        setSavingKey(null);
      }
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-cinematic-gold" />
        <p className="text-sm text-charcoal-ink/50 font-medium">Loading features…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-charcoal-ink">Invitation Features</h2>
        <p className="text-sm text-charcoal-ink/50 mt-1">
          Toggle which sections are visible to your guests on the invitation.
        </p>
      </div>

      <Separator className="bg-champagne-silk" />

      {/* Feature Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FEATURE_ORDER.map((key) => {
          const config = getFeatureConfig(key);
          const feature = features.find((f) => f.featureKey === key);
          const isEnabled = feature?.enabled ?? false;
          const isSaving = savingKey === key;
          const Icon = config.icon;

          return (
            <Card
              key={key}
              className={`border-charcoal-ink/5 shadow-none transition-colors duration-200 ${
                isEnabled
                  ? 'bg-white hover:border-champagne-silk'
                  : 'bg-charcoal-ink/[0.02]'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors duration-200 ${
                        isEnabled
                          ? 'bg-cinematic-gold/10 text-cinematic-gold'
                          : 'bg-charcoal-ink/5 text-charcoal-ink/30'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-charcoal-ink">
                        {config.displayName}
                      </h3>
                      <p className="text-xs text-charcoal-ink/40 mt-0.5 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin text-cinematic-gold/60" />
                    ) : (
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleToggle(key)}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}