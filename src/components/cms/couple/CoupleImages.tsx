'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Upload, Video, X, ImageIcon, MapPin, BookOpen, Calendar, Camera, Sparkles, Eye, ArrowUpRight, ImageOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCoupleCMSStore } from '@/store/useCoupleCMSStore';
import { invalidateWeddingCache } from '@/hooks/usePublicWedding';

const WEDDING_API = '/api/cms/wedding?XTransformPort=3000';
const CONTENT_API = '/api/cms/content?XTransformPort=3000';
const MEDIA_API = '/api/cms/media?XTransformPort=3000';

interface ContentItem {
  id: string;
  section: string;
  fieldKey: string;
  fieldValue: string;
  fieldType: string;
}

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  category: string;
  sortOrder: number;
}

/** ─── Hero Visual Section (image OR video) — used by CoupleHome ──────────── */

export function HeroVisualSection({ weddingData }: { weddingData: Record<string, unknown> | null }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const heroImgUrl = (weddingData as Record<string, string>)?.heroImageUrl || '';
  const heroVideoUrl = (weddingData as Record<string, string>)?.heroVideoUrl || '';

  const handleFile = async (file: File) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo && !file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image or video file', variant: 'destructive' });
      return;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: 'Error', description: `File too large. Max ${isVideo ? '50 MB' : '10 MB'}.`, variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fieldKey = isVideo ? 'heroVideoUrl' : 'heroImageUrl';
      const clearKey = isVideo ? 'heroImageUrl' : 'heroVideoUrl';

      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [fieldKey]: dataUrl,
          [clearKey]: '',
        }),
      });

      if (!res.ok) throw new Error('Failed to upload');

      // Refresh wedding data
      const weddingRes = await fetch(WEDDING_API);
      if (weddingRes.ok) {
        const data = await weddingRes.json();
        useCoupleCMSStore.getState().setWeddingData(data.wedding ?? data);
      }
      invalidateWeddingCache();
      toast({ title: 'Success', description: `${isVideo ? 'Video' : 'Image'} updated` });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (type: 'image' | 'video') => {
    try {
      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type === 'image' ? 'heroImageUrl' : 'heroVideoUrl']: '' }),
      });
      if (!res.ok) throw new Error('Failed to remove');

      const weddingRes = await fetch(WEDDING_API);
      if (weddingRes.ok) {
        const data = await weddingRes.json();
        useCoupleCMSStore.getState().setWeddingData(data.wedding ?? data);
      }
      invalidateWeddingCache();
      toast({ title: 'Removed', description: `${type === 'image' ? 'Image' : 'Video'} removed` });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card className="border-charcoal-ink/5 shadow-none">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-cinematic-gold/10">
              <Sparkles className="size-3.5 text-cinematic-gold" />
            </div>
            <div>
              <Label className="text-xs font-medium text-charcoal-ink/70 uppercase tracking-wider">Hero Visual</Label>
              <p className="text-[11px] text-charcoal-ink/40">Full-bleed hero image or video on the home page</p>
            </div>
          </div>

          {heroVideoUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border border-charcoal-ink/10 group">
              <video src={heroVideoUrl} className="w-full h-full object-cover" controls />
              <button
                type="button"
                onClick={() => handleRemove('video')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                title="Remove video"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium">
                  <Video className="size-3" /> Video
                </span>
              </div>
            </div>
          ) : heroImgUrl ? (
            <div
              className="relative aspect-video rounded-lg overflow-hidden border border-charcoal-ink/10 group cursor-pointer"
              onClick={() => setPreviewUrl(heroImgUrl)}
            >
              <img src={heroImgUrl} alt="Hero" className="w-full h-full object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove('image'); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                title="Remove image"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to preview · Drag to replace
                </span>
              </div>
            </div>
          ) : (
            <div
              className="relative aspect-video rounded-lg border-2 border-dashed border-charcoal-ink/10 hover:border-cinematic-gold hover:bg-cinematic-gold/5 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-2"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-cinematic-gold" />
              ) : (
                <>
                  <Upload className="size-6 text-charcoal-ink/25" />
                  <p className="text-xs text-charcoal-ink/40 font-medium">Upload hero image or video</p>
                  <p className="text-[10px] text-charcoal-ink/25">Image (max 10 MB) or Video (max 50 MB)</p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/ogg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-3xl p-2">
          <DialogHeader>
            <DialogTitle className="sr-only">Hero Preview</DialogTitle>
          </DialogHeader>
          <img src={previewUrl ?? ''} alt="Preview" className="w-full rounded-lg" unoptimized />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** ─── Banner Section — used by CoupleHome ─────────────────────────────── */

export function BannerSection({ weddingData }: { weddingData: Record<string, unknown> | null }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bannerUrl = (weddingData as Record<string, string>)?.bannerUrl || '';

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File too large. Max 10 MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl: dataUrl }),
      });

      if (!res.ok) throw new Error('Failed to upload');

      const weddingRes = await fetch(WEDDING_API);
      if (weddingRes.ok) {
        const data = await weddingRes.json();
        useCoupleCMSStore.getState().setWeddingData(data.wedding ?? data);
      }
      invalidateWeddingCache();
      toast({ title: 'Success', description: 'Banner updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl: '' }),
      });
      if (!res.ok) throw new Error('Failed to remove');

      const weddingRes = await fetch(WEDDING_API);
      if (weddingRes.ok) {
        const data = await weddingRes.json();
        useCoupleCMSStore.getState().setWeddingData(data.wedding ?? data);
      }
      invalidateWeddingCache();
      toast({ title: 'Removed', description: 'Banner removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card className="border-charcoal-ink/5 shadow-none">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-cinematic-gold/10">
              <ImageIcon className="size-3.5 text-cinematic-gold" />
            </div>
            <div>
              <Label className="text-xs font-medium text-charcoal-ink/70 uppercase tracking-wider">Banner Design</Label>
              <p className="text-[11px] text-charcoal-ink/40">Top banner shown across all pages</p>
            </div>
          </div>

          {bannerUrl ? (
            <div
              className="relative aspect-[21/9] rounded-lg overflow-hidden border border-charcoal-ink/10 group cursor-pointer"
              onClick={() => setPreviewUrl(bannerUrl)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                title="Remove banner"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to preview · Drag to replace
                </span>
              </div>
            </div>
          ) : (
            <div
              className="relative aspect-[21/9] rounded-lg border-2 border-dashed border-charcoal-ink/10 hover:border-cinematic-gold hover:bg-cinematic-gold/5 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-2"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-cinematic-gold" />
              ) : (
                <>
                  <Upload className="size-6 text-charcoal-ink/25" />
                  <p className="text-xs text-charcoal-ink/40 font-medium">Upload banner image</p>
                  <p className="text-[10px] text-charcoal-ink/25">Max 10 MB · Wide aspect ratio recommended</p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-3xl p-2">
          <DialogHeader>
            <DialogTitle className="sr-only">Banner Preview</DialogTitle>
          </DialogHeader>
          <img src={previewUrl ?? ''} alt="Preview" className="w-full rounded-lg" unoptimized />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** ─── View-only single image card ──────────────────────────────────────── */

function ReadOnlyImage({
  src,
  alt,
  aspectClass,
  onPreview,
  badge,
}: {
  src: string;
  alt: string;
  aspectClass: string;
  onPreview: () => void;
  badge?: string;
}) {
  return (
    <Card className="border-charcoal-ink/5 shadow-none overflow-hidden group hover:border-champagne-silk transition-colors duration-200">
      <div
        className={`relative ${aspectClass} bg-charcoal-ink/5 cursor-pointer`}
        onClick={onPreview}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <Eye className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        {badge && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium">
              {badge}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

/** ─── View-only section wrapper ────────────────────────────────────────── */

function ImageSection({
  icon: Icon,
  label,
  description,
  editTab,
  onEditTab,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  editTab: string;
  onEditTab: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-cinematic-gold/10 shrink-0 mt-0.5">
            <Icon className="size-3.5 text-cinematic-gold" />
          </div>
          <div>
            <Label className="text-xs font-medium text-charcoal-ink/70 uppercase tracking-wider">{label}</Label>
            <p className="text-[11px] text-charcoal-ink/40 mt-0.5">{description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditTab}
          className="text-[11px] text-charcoal-ink/40 hover:text-cinematic-gold hover:bg-cinematic-gold/5 h-7 px-2 shrink-0 gap-1"
        >
          Edit in {editTab}
          <ArrowUpRight className="size-3" />
        </Button>
      </div>
      {children}
    </section>
  );
}

/** ─── Empty state placeholder ──────────────────────────────────────────── */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 rounded-lg border border-dashed border-charcoal-ink/10 bg-charcoal-ink/[0.02]">
      <ImageOff className="size-5 text-charcoal-ink/20" />
      <p className="text-xs text-charcoal-ink/35 font-medium">{message}</p>
    </div>
  );
}

/** ─── Main Images Page (view-only gallery) ─────────────────────────────── */

export default function CoupleImages() {
  const { weddingData, setPage } = useCoupleCMSStore();

  // Data fetching states
  const [content, setContent] = useState<ContentItem[]>([]);
  const [scheduleMedia, setScheduleMedia] = useState<MediaItem[]>([]);
  const [storyMedia, setStoryMedia] = useState<MediaItem[]>([]);
  const [momentsMedia, setMomentsMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Preview dialog
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [contentRes, scheduleRes, storyRes, momentsRes] = await Promise.all([
        fetch(CONTENT_API),
        fetch(`${MEDIA_API}&category=schedule`),
        fetch(`${MEDIA_API}&category=story`),
        fetch(`${MEDIA_API}&category=moments`),
      ]);

      if (contentRes.ok) {
        const data = await contentRes.json();
        setContent(data.content ?? []);
      }
      if (scheduleRes.ok) {
        const data = await scheduleRes.json();
        setScheduleMedia(data.media ?? []);
      }
      if (storyRes.ok) {
        const data = await storyRes.json();
        setStoryMedia(data.media ?? []);
      }
      if (momentsRes.ok) {
        const data = await momentsRes.json();
        setMomentsMedia(data.media ?? []);
      }
    } catch {
      // Silent fail for view-only page
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract values from content
  const teaCeremonyImage = content.find((c) => c.section === 'hero' && c.fieldKey === 'teaCeremonyImage')?.fieldValue ?? '';
  const venueImage = content.find((c) => c.section === 'getting-there' && c.fieldKey === 'venueImage')?.fieldValue ?? '';

  // Extract from wedding data
  const heroImgUrl = (weddingData as Record<string, string>)?.heroImageUrl || '';
  const heroVideoUrl = (weddingData as Record<string, string>)?.heroVideoUrl || '';
  const bannerUrl = (weddingData as Record<string, string>)?.bannerUrl || '';

  // Count total images
  const totalImages = [
    heroImgUrl || heroVideoUrl ? 1 : 0,
    bannerUrl ? 1 : 0,
    teaCeremonyImage ? 1 : 0,
    scheduleMedia.length,
    storyMedia.length,
    venueImage ? 1 : 0,
    momentsMedia.length,
  ].reduce((a, b) => a + b, 0);

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-charcoal-ink">Images & Media</h2>
        <p className="text-sm text-charcoal-ink/50 mt-1">
          View all images currently live on your invitation.{' '}
          <span className="text-charcoal-ink/35">
            {totalImages} image{totalImages !== 1 ? 's' : ''} across 7 sections.
          </span>
        </p>
      </div>

      <Separator className="bg-champagne-silk" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="size-8 animate-spin text-cinematic-gold" />
          <p className="text-sm text-charcoal-ink/50 font-medium">Loading images…</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── 1. Hero Visual ───────────────────────────── */}
          <ImageSection
            icon={Sparkles}
            label="Hero Visual"
            description="Full-bleed hero image or video on the Home page"
            editTab="Home"
            onEditTab={() => setPage('home')}
          >
            {heroVideoUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-charcoal-ink/10">
                <video src={heroVideoUrl} className="w-full h-full object-cover" controls />
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium">
                    <Video className="size-3" /> Video
                  </span>
                </div>
              </div>
            ) : heroImgUrl ? (
              <ReadOnlyImage
                src={heroImgUrl}
                alt="Hero image"
                aspectClass="aspect-video"
                onPreview={() => openPreview(heroImgUrl, 'Hero Image')}
              />
            ) : (
              <EmptyState message="No hero image set — upload in Home tab" />
            )}
          </ImageSection>

          <Separator className="bg-champagne-silk" />

          {/* ── 2. Banner Design ────────────────────────── */}
          <ImageSection
            icon={ImageIcon}
            label="Banner Design"
            description="Top banner shown across all section pages"
            editTab="Home"
            onEditTab={() => setPage('home')}
          >
            {bannerUrl ? (
              <ReadOnlyImage
                src={bannerUrl}
                alt="Banner image"
                aspectClass="aspect-[21/9]"
                onPreview={() => openPreview(bannerUrl, 'Banner')}
              />
            ) : (
              <EmptyState message="No banner set — upload in Home tab" />
            )}
          </ImageSection>

          <Separator className="bg-champagne-silk" />

          {/* ── 3. Tea Ceremony Image ───────────────────── */}
          <ImageSection
            icon={Calendar}
            label="Tea Ceremony Image"
            description="Displayed in the tea ceremony section on the Home page"
            editTab="Home"
            onEditTab={() => setPage('home')}
          >
            {teaCeremonyImage ? (
              <ReadOnlyImage
                src={teaCeremonyImage}
                alt="Tea ceremony image"
                aspectClass="aspect-[2/3]"
                onPreview={() => openPreview(teaCeremonyImage, 'Tea Ceremony')}
              />
            ) : (
              <EmptyState message="No tea ceremony image set — upload in Home tab" />
            )}
          </ImageSection>

          <Separator className="bg-champagne-silk" />

          {/* ── 4. Schedule Images ──────────────────────── */}
          <ImageSection
            icon={Calendar}
            label="Schedule Images"
            description={`Ceremony & celebration intro images on the Schedule page (${scheduleMedia.length}/3)`}
            editTab="Schedule"
            onEditTab={() => setPage('schedule')}
          >
            {scheduleMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {scheduleMedia.map((item) => (
                  <ReadOnlyImage
                    key={item.id}
                    src={item.url}
                    alt={item.fileName}
                    aspectClass="aspect-video"
                    onPreview={() => openPreview(item.url, item.fileName)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No schedule images — upload in Schedule tab" />
            )}
          </ImageSection>

          <Separator className="bg-champagne-silk" />

          {/* ── 5. Story Images ─────────────────────────── */}
          <ImageSection
            icon={BookOpen}
            label="Story Images"
            description={`Story section gallery images (${storyMedia.length}/3)`}
            editTab="Story"
            onEditTab={() => setPage('story')}
          >
            {storyMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {storyMedia.map((item) => (
                  <ReadOnlyImage
                    key={item.id}
                    src={item.url}
                    alt={item.fileName}
                    aspectClass="aspect-video"
                    onPreview={() => openPreview(item.url, item.fileName)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No story images — upload in Story tab" />
            )}
          </ImageSection>

          <Separator className="bg-champagne-silk" />

          {/* ── 6. Venue Image ──────────────────────────── */}
          <ImageSection
            icon={MapPin}
            label="Venue Image"
            description="Venue photo displayed on the Schedule and Getting There pages"
            editTab="Getting There"
            onEditTab={() => setPage('getting-there')}
          >
            {venueImage ? (
              <ReadOnlyImage
                src={venueImage}
                alt="Venue image"
                aspectClass="aspect-[4/3]"
                onPreview={() => openPreview(venueImage, 'Venue')}
              />
            ) : (
              <EmptyState message="No venue image set — upload in Getting There tab" />
            )}
          </ImageSection>

          <Separator className="bg-champagne-silk" />

          {/* ── 7. Moments Gallery ──────────────────────── */}
          <ImageSection
            icon={Camera}
            label="Moments Gallery"
            description={`Photo gallery in the Moments section (${momentsMedia.length}/20)`}
            editTab="Moments"
            onEditTab={() => setPage('moments')}
          >
            {momentsMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {momentsMedia.map((item) => (
                  <ReadOnlyImage
                    key={item.id}
                    src={item.url}
                    alt={item.fileName}
                    aspectClass="aspect-square"
                    onPreview={() => openPreview(item.url, item.fileName)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No moments images — upload in Moments tab" />
            )}
          </ImageSection>
        </div>
      )}

      {/* Global Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-3xl p-2">
          <DialogHeader>
            <DialogTitle className="sr-only">{previewTitle} Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <img
              src={previewUrl}
              alt={previewTitle}
              className="w-full rounded-lg"
              unoptimized
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}