'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Trash2, Upload, GripVertical, Eye, ImageOff, Video, X, Play, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCoupleCMSStore } from '@/store/useCoupleCMSStore';
import { invalidateWeddingCache } from '@/hooks/usePublicWedding';

const MEDIA_API = '/api/cms/media?XTransformPort=3000';
const WEDDING_API = '/api/cms/wedding?XTransformPort=3000';

const CATEGORIES = [
  { value: 'home', label: 'Home', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', max: 3 },
  { value: 'schedule', label: 'Schedule', color: 'bg-blue-50 text-blue-700 border-blue-200', max: 3 },
  { value: 'story', label: 'Story', color: 'bg-amber-50 text-amber-700 border-amber-200', max: 3 },
  { value: 'moments', label: 'Moments', color: 'bg-purple-50 text-purple-700 border-purple-200', max: 20 },
] as const;

function getCategoryMax(cat: string): number {
  return CATEGORIES.find((c) => c.value === cat)?.max ?? 3;
}

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  category: string;
  sortOrder: number;
}

function getCategoryColor(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.color ?? 'bg-gray-50 text-gray-600 border-gray-200';
}

function getCategoryLabel(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** ─── Hero Visual Section (image OR video) ──────────────────────────── */

export function HeroVisualSection({ weddingData }: { weddingData: Record<string, unknown> | null }) {
  const { setWeddingData } = useCoupleCMSStore();
  const heroImageUrl = (weddingData?.heroImageUrl as string) || null;
  const heroVideoUrl = (weddingData?.heroVideoUrl as string) || null;
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast.error('Please select an image or video file');
      return;
    }

    if (isVideo && file.size > 50 * 1024 * 1024) {
      toast.error('Video must be under 50 MB');
      return;
    }
    if (isImage && file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const updatePayload: Record<string, string | null> = {
        heroImageUrl: isImage ? dataUrl : null,
        heroVideoUrl: isVideo ? dataUrl : null,
      };

      setSaving(true);
      try {
        const res = await fetch(WEDDING_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) throw new Error('Failed to save hero visual');
        const data = await res.json();
        setWeddingData(data.wedding);
        invalidateWeddingCache();
        toast.success(`Hero ${isVideo ? 'video' : 'image'} updated`);
      } catch {
        toast.error('Failed to save hero visual');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveHero = async () => {
    if (!heroImageUrl && !heroVideoUrl) return;
    if (!confirm('Remove the current hero visual?')) return;

    setSaving(true);
    try {
      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroImageUrl: null, heroVideoUrl: null }),
      });
      if (!res.ok) throw new Error('Failed to remove hero visual');
      const data = await res.json();
      setWeddingData(data.wedding);
      invalidateWeddingCache();
      toast.success('Hero visual removed');
    } catch {
      toast.error('Failed to remove hero visual');
    } finally {
      setSaving(false);
    }
  };

  const hasHero = !!(heroImageUrl || heroVideoUrl);

  return (
    <Card className="border-charcoal-ink/5 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-charcoal-ink">Hero Visual</h3>
            <p className="text-xs text-charcoal-ink/40 mt-0.5">
              Upload one image or video for your main page hero section.
            </p>
          </div>
          {hasHero && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveHero}
              disabled={saving}
              className="h-7 text-xs text-charcoal-ink/40 hover:text-red-500 hover:bg-red-50"
            >
              {saving ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3.5 mr-1" />}
              Remove
            </Button>
          )}
        </div>

        <div
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer overflow-hidden ${
            dragOver
              ? 'border-cinematic-gold bg-cinematic-gold/5'
              : hasHero
                ? 'border-cinematic-gold/30 bg-cinematic-gold/5'
                : 'border-charcoal-ink/10 hover:border-champagne-silk'
          }`}
          style={{ minHeight: '200px' }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {saving && (
            <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center">
              <Loader2 className="size-6 animate-spin text-cinematic-gold" />
            </div>
          )}

          {heroVideoUrl ? (
            <div className="relative w-full">
              <video
                src={heroVideoUrl}
                className="w-full max-h-64 object-contain rounded-lg bg-black/5"
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/40 rounded-full p-3">
                  <Play className="size-5 text-white" />
                </div>
              </div>
              <Badge
                variant="outline"
                className="absolute top-2 right-2 bg-black/60 text-white border-transparent text-[10px]"
              >
                <Video className="size-3 mr-1" />
                Video
              </Badge>
            </div>
          ) : heroImageUrl ? (
            <div className="relative w-full">
              <img
                src={heroImageUrl}
                alt="Current hero image"
                className="w-full max-h-64 object-contain rounded-lg"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="flex items-center gap-2 text-champagne-silk">
                <ImagePlus className="size-6" />
                <Video className="size-6" />
              </div>
              <p className="text-sm text-charcoal-ink/50 font-medium text-center">
                Click or drag to upload
              </p>
              <p className="text-xs text-charcoal-ink/30 text-center">
                Image (PNG, JPG, WebP) or Video (MP4, WebM)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/ogg"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {hasHero && (
          <p className="text-[10px] text-charcoal-ink/30 mt-2 text-center">
            Click or drag a new file to replace the current hero visual.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** ─── Banner Section (image only) ───────────────────────────────────── */

export function BannerSection({ weddingData }: { weddingData: Record<string, unknown> | null }) {
  const { setWeddingData } = useCoupleCMSStore();
  const bannerUrl = (weddingData?.bannerUrl as string) || null;
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file for the banner');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      setSaving(true);
      try {
        const res = await fetch(WEDDING_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bannerUrl: dataUrl }),
        });
        if (!res.ok) throw new Error('Failed to save banner');
        const data = await res.json();
        setWeddingData(data.wedding);
        invalidateWeddingCache();
        toast.success('Banner updated');
      } catch {
        toast.error('Failed to save banner');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveBanner = async () => {
    if (!bannerUrl) return;
    if (!confirm('Remove the current banner?')) return;

    setSaving(true);
    try {
      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl: null }),
      });
      if (!res.ok) throw new Error('Failed to remove banner');
      const data = await res.json();
      setWeddingData(data.wedding);
      invalidateWeddingCache();
      toast.success('Banner removed');
    } catch {
      toast.error('Failed to remove banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-charcoal-ink/5 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-charcoal-ink">Banner Design</h3>
            <p className="text-xs text-charcoal-ink/40 mt-0.5">
              Upload your custom banner design for the top of your invitation.
            </p>
          </div>
          {bannerUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveBanner}
              disabled={saving}
              className="h-7 text-xs text-charcoal-ink/40 hover:text-red-500 hover:bg-red-50"
            >
              {saving ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3.5 mr-1" />}
              Remove
            </Button>
          )}
        </div>

        <div
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer overflow-hidden ${
            dragOver
              ? 'border-cinematic-gold bg-cinematic-gold/5'
              : bannerUrl
                ? 'border-cinematic-gold/30 bg-cinematic-gold/5'
                : 'border-charcoal-ink/10 hover:border-champagne-silk'
          }`}
          style={{ minHeight: '160px' }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {saving && (
            <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center">
              <Loader2 className="size-6 animate-spin text-cinematic-gold" />
            </div>
          )}

          {bannerUrl ? (
            <div className="relative w-full">
              <img
                src={bannerUrl}
                alt="Current banner"
                className="w-full max-h-48 object-cover rounded-lg"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <ImagePlus className="size-6 text-champagne-silk" />
              <p className="text-sm text-charcoal-ink/50 font-medium text-center">
                Click or drag to upload
              </p>
              <p className="text-xs text-charcoal-ink/30 text-center">
                PNG, JPG, WebP — displayed at full width
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {bannerUrl && (
          <p className="text-[10px] text-charcoal-ink/30 mt-2 text-center">
            Click or drag a new image to replace the current banner.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** ─── Main Component ──────────────────────────────────────────────────── */

export default function CoupleImages() {
  const { weddingData } = useCoupleCMSStore();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('home');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // inline drop zone
  const dialogInputRef = useRef<HTMLInputElement>(null); // dialog

  const [uploadForm, setUploadForm] = useState({
    category: 'home',
    url: '',
    fileName: '',
  });

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(MEDIA_API);
      if (!res.ok) throw new Error('Failed to load media');
      const data = await res.json();
      setMedia(data.media ?? []);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Helper: count images for a category
  const catCount = (cat: string) => media.filter((m) => m.category === cat).length;

  const handleInlineUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentCount = catCount(filterCategory);
    const maxAllowed = getCategoryMax(filterCategory);
    if (currentCount >= maxAllowed) {
      toast.error(`${getCategoryLabel(filterCategory)} section is full (${maxAllowed} images max).`);
      return;
    }

    const toUpload = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, maxAllowed - currentCount);

    if (toUpload.length === 0) {
      toast.error('Please select image files (PNG, JPG, GIF, WebP)');
      return;
    }

    setUploading(true);
    for (const file of toUpload) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch(MEDIA_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: dataUrl,
            fileName: file.name,
            category: filterCategory,
            fileType: 'IMAGE',
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to upload');
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to upload image');
      }
    }
    setUploading(false);
    toast.success(`${toUpload.length} image${toUpload.length > 1 ? 's' : ''} added to ${getCategoryLabel(filterCategory)}`);
    fetchMedia();
  };

  const handleInlineDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleInlineUpload(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!uploadForm.url) {
      toast.error('Please select an image');
      return;
    }
    if (!uploadForm.fileName) {
      toast.error('File name is required');
      return;
    }

    // Enforce per-category image limit
    const currentCount = media.filter((m) => m.category === uploadForm.category).length;
    const maxAllowed = getCategoryMax(uploadForm.category);
    if (currentCount >= maxAllowed) {
      const label = getCategoryLabel(uploadForm.category);
      toast.error(`${label} section is full (${maxAllowed} images max). Remove an image first.`);
      return;
    }

    try {
      setUploading(true);
      const res = await fetch(MEDIA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadForm.url,
          fileName: uploadForm.fileName,
          category: uploadForm.category,
          fileType: 'IMAGE',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to upload image');
      }

      toast.success('Image added successfully');
      setUploadDialogOpen(false);
      setUploadForm({ category: 'home', url: '', fileName: '' });
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image? This action cannot be undone.')) return;

    try {
      setDeleting(id);
      const res = await fetch(`${MEDIA_API}&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete image');
      }

      toast.success('Image deleted');
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const handleMove = async (item: MediaItem, direction: 'up' | 'down') => {
    const idx = media.findIndex((m) => m.id === item.id);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= media.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const swapItem = media[swapIdx];

    try {
      await fetch(MEDIA_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, sortOrder: swapItem.sortOrder }),
      });
      await fetch(MEDIA_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: swapItem.id, sortOrder: item.sortOrder }),
      });

      fetchMedia();
    } catch {
      toast.error('Failed to reorder image');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-cinematic-gold" />
        <p className="text-sm text-charcoal-ink/50 font-medium">Loading your media…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-ink">Images & Media</h2>
          <p className="text-sm text-charcoal-ink/50 mt-1">
            Manage your hero visual, banner, and upload images for your invitation.
          </p>
        </div>
        <Button
          onClick={() => {
            setUploadForm((f) => ({ ...f, category: filterCategory }));
            setUploadDialogOpen(true);
          }}
          className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 shrink-0"
        >
          <Upload className="size-4 mr-1.5" />
          Upload
        </Button>
      </div>

      <Separator className="bg-champagne-silk" />

      {/* Hero Visual Section — only on Home */}
      {filterCategory === 'home' && (
        <HeroVisualSection weddingData={weddingData} />
      )}

      {/* Banner Section — only on Home (shared across all sections) */}
      {filterCategory === 'home' && (
        <BannerSection weddingData={weddingData} />
      )}

      <Separator className="bg-champagne-silk" />

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const count = catCount(cat.value);
          const isFull = count >= cat.max;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                filterCategory === cat.value
                  ? 'bg-cinematic-gold text-charcoal-ink'
                  : isFull
                    ? 'bg-charcoal-ink/3 text-charcoal-ink/30'
                    : 'bg-charcoal-ink/5 text-charcoal-ink/50 hover:bg-charcoal-ink/10'
              }`}
            >
              {cat.label} ({count}/{cat.max})
            </button>
          );
        })}
      </div>

      {/* Media Grid */}
      {media.length === 0 && catCount(filterCategory) === 0 ? (
        <div
          className={`flex flex-col items-center justify-center py-16 gap-3 rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer ${
            dragOver ? 'border-cinematic-gold bg-cinematic-gold/5' : 'border-charcoal-ink/10 hover:border-champagne-silk'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleInlineDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-8 animate-spin text-cinematic-gold" />
          ) : (
            <>
              <ImagePlus className="size-10 text-champagne-silk" />
              <p className="text-sm text-charcoal-ink/50 font-medium">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-charcoal-ink/30">
                {getCategoryLabel(filterCategory)} — up to {getCategoryMax(filterCategory)} images
              </p>
            </>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleInlineDrop}
        >
          {/* Inline upload card */}
          {catCount(filterCategory) < getCategoryMax(filterCategory) && (
            <Card
              className={`border-2 border-dashed aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors duration-200 ${
                dragOver
                  ? 'border-cinematic-gold bg-cinematic-gold/5'
                  : 'border-charcoal-ink/10 hover:border-champagne-silk hover:bg-champagne-silk/10'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-cinematic-gold" />
              ) : (
                <>
                  <ImagePlus className="size-6 text-champagne-silk" />
                  <p className="text-xs text-charcoal-ink/40 font-medium">Add image</p>
                  <p className="text-[10px] text-charcoal-ink/25">
                    {getCategoryMax(filterCategory) - catCount(filterCategory)} remaining
                  </p>
                </>
              )}
            </Card>
          )}
          {media.map((item) => (
            <Card key={item.id} className="border-charcoal-ink/5 shadow-none overflow-hidden group hover:border-champagne-silk transition-colors duration-200">
              {/* Thumbnail */}
              <div
                className="relative aspect-square bg-charcoal-ink/5 cursor-pointer"
                onClick={() => setPreviewUrl(item.url)}
              >
                <img
                  src={item.url}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  unoptimized
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <Eye className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                {/* Category badge */}
                <Badge
                  variant="outline"
                  className={`absolute top-2 left-2 text-[10px] font-medium ${getCategoryColor(item.category)}`}
                >
                  {getCategoryLabel(item.category)}
                </Badge>
              </div>

              {/* Info bar */}
              <div className="p-2.5">
                <p className="text-xs font-medium text-charcoal-ink truncate mb-2">
                  {item.fileName}
                </p>
                {item.fileSize && (
                  <p className="text-[10px] text-charcoal-ink/40 mb-2">
                    {formatFileSize(item.fileSize)}
                  </p>
                )}
                <div className="flex items-center gap-1">
                  {/* Move up */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMove(item, 'up')}
                    disabled={media.indexOf(item) <= 0}
                    className="h-7 w-7 p-0 text-charcoal-ink/40 hover:text-cinematic-gold hover:bg-cinematic-gold/5 disabled:opacity-20"
                    title="Move up"
                  >
                    <GripVertical className="size-3.5 rotate-180" />
                  </Button>
                  {/* Move down */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMove(item, 'down')}
                    disabled={media.indexOf(item) >= media.length - 1}
                    className="h-7 w-7 p-0 text-charcoal-ink/40 hover:text-cinematic-gold hover:bg-cinematic-gold/5 disabled:opacity-20"
                    title="Move down"
                  >
                    <GripVertical className="size-3.5" />
                  </Button>
                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="h-7 w-7 p-0 text-charcoal-ink/40 hover:text-red-500 hover:bg-red-50 ml-auto"
                    title="Delete"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-charcoal-ink">Upload Image</DialogTitle>
            <DialogDescription className="text-charcoal-ink/50">
              Add a new image to your invitation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Drop zone */}
            <div
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors duration-200 cursor-pointer ${
                uploadForm.url
                  ? 'border-cinematic-gold/30 bg-cinematic-gold/5'
                  : 'border-charcoal-ink/10 hover:border-champagne-silk'
              }`}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files?.[0]?.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setUploadForm((f) => ({ ...f, url: ev.target?.result as string, fileName: files[0].name }));
                  };
                  reader.readAsDataURL(files[0]);
                }
              }}
              onClick={() => dialogInputRef.current?.click()}
            >
              {uploadForm.url ? (
                <div className="relative w-full">
                  <img
                    src={uploadForm.url}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                    unoptimized
                  />
                  <p className="text-xs text-charcoal-ink/40 text-center mt-2">
                    Click or drag to replace
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="size-8 text-champagne-silk mb-2" />
                  <p className="text-sm text-charcoal-ink/50 font-medium">
                    Click or drag an image here
                  </p>
                  <p className="text-xs text-charcoal-ink/30 mt-1">
                    PNG, JPG, GIF, WebP
                  </p>
                </>
              )}
              <input
                ref={dialogInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setUploadForm((f) => ({ ...f, url: ev.target?.result as string, fileName: file.name }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            {/* Category select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-charcoal-ink/70">Section</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(v) => setUploadForm({ ...uploadForm, category: v })}
              >
                <SelectTrigger className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => {
                    const count = catCount(cat.value);
                    const isFull = count >= cat.max;
                    return (
                      <SelectItem key={cat.value} value={cat.value} disabled={isFull}>
                        {cat.label} — {count}/{cat.max} {isFull ? '(full)' : `(${cat.max - count} remaining)`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* File name */}
            <div className="space-y-1.5">
              <Label htmlFor="media-filename" className="text-sm font-medium text-charcoal-ink/70">
                File Name
              </Label>
              <Input
                id="media-filename"
                value={uploadForm.fileName}
                onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                placeholder="e.g. wedding-photo-01.jpg"
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setUploadForm({ category: 'home', url: '', fileName: '' });
              }}
              className="border-charcoal-ink/15 text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold rounded px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !uploadForm.url}
              className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Uploading…
                </>
              ) : (
                'Upload Image'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-2xl p-2">
          <img
            src={previewUrl ?? ''}
            alt="Preview"
            className="w-full rounded-lg"
            unoptimized
          />
        </DialogContent>
      </Dialog>

      {/* Hidden file input for inline drop zone uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleInlineUpload(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}