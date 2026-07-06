'use client';

import { useState, useEffect } from 'react';

// Module-level cache — shared across all component instances in the SPA
let cachedData: PublicWeddingData | null = null;
let cachedPromise: Promise<PublicWeddingData | null> | null = null;

export interface PublicWeddingData {
  wedding: {
    id: string;
    slug: string;
    coupleName: string;
    brideName: string | null;
    groomName: string | null;
    weddingDate: string;
    weddingTime: string | null;
    venue: string | null;
    venueAddress: string | null;
    googleMapsUrl: string | null;
    heroImageUrl: string | null;
    bannerUrl: string | null;
  };
  content: Record<string, Record<string, string>>;
  schedules: {
    id: string;
    eventType: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string | null;
    location: string | null;
    sortOrder: number;
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
    sortOrder: number;
  }[];
  stories: {
    id: string;
    title: string;
    content: string;
    date: string | null;
    imageUrl: string | null;
    sortOrder: number;
  }[];
  media: {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    fileName: string;
    fileType: string;
    fileSize: number | null;
    category: string;
    sortOrder: number;
  }[];
  mediaByCategory: Record<string, PublicWeddingData['media']>;
  featureFlags: Record<string, boolean>;
}

async function fetchWeddingData(): Promise<PublicWeddingData | null> {
  if (cachedData) return cachedData;
  if (cachedPromise) return cachedPromise;

  cachedPromise = fetch('/api/wedding/public?XTransformPort=3000')
    .then((res) => {
      if (!res.ok) return null;
      return res.json();
    })
    .then((data) => {
      cachedData = data;
      return data;
    })
    .catch(() => null);

  return cachedPromise;
}

/**
 * Fetches the public wedding data once and caches it for the session.
 * All guest pages share the same cached response.
 */
export function usePublicWedding() {
  const [data, setData] = useState<PublicWeddingData | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (cachedData) return;
    let cancelled = false;

    fetchWeddingData().then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  /** Helper to get a content field value with fallback */
  const getField = (section: string, fieldKey: string, fallback = ''): string => {
    if (!data) return fallback;
    return data.content[section]?.[fieldKey] ?? fallback;
  };

  return { data, loading, getField };
}