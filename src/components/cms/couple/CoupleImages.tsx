'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Upload, Video, X, Save, ImageIcon, MapPin, BookOpen, Calendar, Camera, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCoupleCMSStore } from '@/store/useCoupleCMSStore';
import { invalidateWeddingCache } from '@/hooks/usePublicWedding';
import InlineImageUpload from './InlineImageUpload';
import SectionImageUpload from './SectionImageUpload';

const WEDDING_API = '/api/cms/wedding?XTransformPort=3000';
const CONTENT_API = '/api/cms/content?XTransformPort=3000';

interface ContentItem {
  id: string;
  section: string;
  fieldKey: string;
  fieldValue: string;
  fieldType: string;
}

/** ─── Hero Visual Section (image OR video) ──────────────────────────── */

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
          <img src={previewUrl ?? ''} alt="Preview" className="w-full rounded-lg" unoptimized />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** ─── Banner Section ───────────────────────────────────────────────── */

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
          <img src={previewUrl ?? ''} alt="Preview" className="w-full rounded-lg" unoptimized />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** ─── Main Images Page ──────────────────────────────────────────────── */

export default function CoupleImages() {
  const { weddingData } = useCoupleCMSStore();

  // Content fields for Tea Ceremony and Venue images
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(CONTENT_API);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setContent(data.content ?? []);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Get/set content field values
  const getFieldValue = (section: string, fieldKey: string): string => {
    const edited = editedFields[`${section}/${fieldKey}`];
    if (edited !== undefined) return edited;
    return content.find((c) => c.section === section && c.fieldKey === fieldKey)?.fieldValue ?? '';
  };

  const setFieldValue = (section: string, fieldKey: string, value: string) => {
    setEditedFields((prev) => ({ ...prev, [`${section}/${fieldKey}`]: value }));
  };

  // Save all pending content changes
  const hasChanges = Object.keys(editedFields).length > 0;

  const handleSave = async () => {
    if (!hasChanges) return;
    try {
      setSaving(true);
      const items = Object.entries(editedFields).map(([key, fieldValue]) => {
        const [section, fieldKey] = key.split('/');
        return { section, fieldKey, fieldValue, fieldType: 'IMAGE_URL' };
      });

      const res = await fetch(CONTENT_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Failed to save');
      }

      const data = await res.json();
      const savedContent = data.content ?? [];
      setContent((prev) => {
        const updated = [...prev];
        for (const item of savedContent) {
          const idx = updated.findIndex(
            (c) => c.section === item.section && c.fieldKey === item.fieldKey
          );
          if (idx >= 0) updated[idx] = item;
          else updated.push(item);
        }
        return updated;
      });

      setEditedFields({});
      invalidateWeddingCache();
      toast({ title: 'Saved', description: 'Images updated successfully' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Tea Ceremony image values
  const teaCeremonyImage = getFieldValue('hero', 'teaCeremonyImage');
  // Venue image values
  const venueImage = getFieldValue('getting-there', 'venueImage');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-ink">Images & Media</h2>
          <p className="text-sm text-charcoal-ink/50 mt-1">
            Manage all images across your invitation in one place.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges || loading}
          className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 shrink-0 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1.5" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4 mr-1.5" />
              Save{hasChanges ? ` (${Object.keys(editedFields).length})` : ''}
            </>
          )}
        </Button>
      </div>

      <Separator className="bg-champagne-silk" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="size-8 animate-spin text-cinematic-gold" />
          <p className="text-sm text-charcoal-ink/50 font-medium">Loading images…</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── 1. Hero Visual ───────────────────────────── */}
          <section className="space-y-2">
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="size-3.5 text-cinematic-gold" />
              Hero Visual
            </Label>
            <HeroVisualSection weddingData={weddingData} />
          </section>

          <Separator className="bg-champagne-silk" />

          {/* ── 2. Banner Design ────────────────────────── */}
          <section className="space-y-2">
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="size-3.5 text-cinematic-gold" />
              Banner Design
            </Label>
            <p className="text-[11px] text-charcoal-ink/40 -mt-1">Shared across all section pages</p>
            <BannerSection weddingData={weddingData} />
          </section>

          <Separator className="bg-champagne-silk" />

          {/* ── 3. Tea Ceremony Image ───────────────────── */}
          <section className="space-y-2">
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="size-3.5 text-cinematic-gold" />
              Tea Ceremony Image
            </Label>
            <p className="text-[11px] text-charcoal-ink/40 -mt-1">Displayed on the Home page tea ceremony section</p>
            <Card className="border-charcoal-ink/5 shadow-none">
              <CardContent className="p-4">
                <InlineImageUpload
                  value={teaCeremonyImage}
                  onChange={(dataUrl) => setFieldValue('hero', 'teaCeremonyImage', dataUrl)}
                  onRemove={() => setFieldValue('hero', 'teaCeremonyImage', '')}
                  label="Upload tea ceremony photo"
                  aspectClass="aspect-[2/3]"
                />
              </CardContent>
            </Card>
          </section>

          <Separator className="bg-champagne-silk" />

          {/* ── 4. Schedule Images ──────────────────────── */}
          <section className="space-y-2">
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="size-3.5 text-cinematic-gold" />
              Schedule Images
            </Label>
            <p className="text-[11px] text-charcoal-ink/40 -mt-1">
              Ceremony &amp; Celebration intro images on the Schedule page
            </p>
            <SectionImageUpload category="schedule" label="Schedule Images" maxImages={3} />
          </section>

          <Separator className="bg-champagne-silk" />

          {/* ── 5. Story Hero Image ─────────────────────── */}
          <section className="space-y-2">
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="size-3.5 text-cinematic-gold" />
              Story Images
            </Label>
            <p className="text-[11px] text-charcoal-ink/40 -mt-1">
              Story section hero image (timeline chapter images are managed per-chapter in the Story tab)
            </p>
            <SectionImageUpload category="story" label="Story Images" maxImages={3} />
          </section>

          <Separator className="bg-champagne-silk" />

          {/* ── 6. Getting There — Venue Image ──────────── */}
          <section className="space-y-2">
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="size-3.5 text-cinematic-gold" />
              Venue Image
            </Label>
            <p className="text-[11px] text-charcoal-ink/40 -mt-1">
              Venue photo displayed on the Schedule page
            </p>
            <Card className="border-charcoal-ink/5 shadow-none">
              <CardContent className="p-4">
                <InlineImageUpload
                  value={venueImage}
                  onChange={(dataUrl) => setFieldValue('getting-there', 'venueImage', dataUrl)}
                  onRemove={() => setFieldValue('getting-there', 'venueImage', '')}
                  label="Upload venue photo"
                  aspectClass="aspect-[4/3]"
                />
              </CardContent>
            </Card>
          </section>

          <Separator className="bg-champagne-silk" />

          {/* ── 7. Moments Gallery ──────────────────────── */}
          <section className="space-y-2">
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-2">
              <Camera className="size-3.5 text-cinematic-gold" />
              Moments Gallery
            </Label>
            <p className="text-[11px] text-charcoal-ink/40 -mt-1">
              Photo gallery displayed in the Moments section
            </p>
            <SectionImageUpload category="moments" label="Moments Gallery" maxImages={20} />
          </section>
        </div>
      )}
    </div>
  );
}