'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Plus, Trash2, ImageIcon, Star, ImagePlus, Upload, GripVertical, Eye, ImageOff } from 'lucide-react';
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

const API_BASE = '/api/cms/media?XTransformPort=3000';

const CATEGORIES = [
  { value: 'hero', label: 'Hero', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'banner', label: 'Banner', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { value: 'gallery', label: 'Gallery', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'story', label: 'Story', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'couple-photo', label: 'Couple Photo', color: 'bg-sky-50 text-sky-700 border-sky-200' },
] as const;

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

export default function CoupleImages() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    category: 'gallery',
    url: '',
    fileName: '',
  });

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const url = filterCategory === 'all' ? API_BASE : `${API_BASE}&category=${filterCategory}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load media');
      const data = await res.json();
      setMedia(data.media ?? []);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadForm({
        ...uploadForm,
        url: dataUrl,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
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

    try {
      setUploading(true);
      const res = await fetch(API_BASE, {
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
      setUploadForm({ category: 'gallery', url: '', fileName: '' });
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
      const res = await fetch(`${API_BASE}&id=${encodeURIComponent(id)}`, {
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

  const handleSetAs = async (item: MediaItem, type: 'hero' | 'banner') => {
    try {
      const res = await fetch(API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, setAs: type }),
      });

      if (!res.ok) throw new Error('Failed to set image');
      toast.success(`Set as ${type} image`);
    } catch {
      toast.error(`Failed to set as ${type}`);
    }
  };

  const handleMove = async (item: MediaItem, direction: 'up' | 'down') => {
    const idx = media.findIndex((m) => m.id === item.id);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= media.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const swapItem = media[swapIdx];

    try {
      // Swap sort orders
      await fetch(API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, sortOrder: swapItem.sortOrder }),
      });
      await fetch(API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: swapItem.id, sortOrder: item.sortOrder }),
      });

      fetchMedia();
    } catch {
      toast.error('Failed to reorder image');
    }
  };

  const filteredMedia = media;

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
            Upload and manage images for your invitation.
          </p>
        </div>
        <Button
          onClick={() => setUploadDialogOpen(true)}
          className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 shrink-0"
        >
          <Upload className="size-4 mr-1.5" />
          Upload
        </Button>
      </div>

      <Separator className="bg-champagne-silk" />

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider mr-1">Filter:</span>
        <button
          onClick={() => setFilterCategory('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
            filterCategory === 'all'
              ? 'bg-cinematic-gold text-charcoal-ink'
              : 'bg-charcoal-ink/5 text-charcoal-ink/50 hover:bg-charcoal-ink/10'
          }`}
        >
          All ({media.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = media.filter((m) => m.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                filterCategory === cat.value
                  ? 'bg-cinematic-gold text-charcoal-ink'
                  : 'bg-charcoal-ink/5 text-charcoal-ink/50 hover:bg-charcoal-ink/10'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <ImageOff className="size-10 text-champagne-silk" />
          <p className="text-sm text-charcoal-ink/40 font-medium">No images yet</p>
          <p className="text-xs text-charcoal-ink/30">
            Click &quot;Upload&quot; to add your first image.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredMedia.map((item) => (
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
                  {/* Set as hero */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetAs(item, 'hero')}
                    className="h-7 w-7 p-0 text-charcoal-ink/40 hover:text-cinematic-gold hover:bg-cinematic-gold/5"
                    title="Set as hero image"
                  >
                    <Star className="size-3.5" />
                  </Button>
                  {/* Set as banner */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetAs(item, 'banner')}
                    className="h-7 w-7 p-0 text-charcoal-ink/40 hover:text-cinematic-gold hover:bg-cinematic-gold/5"
                    title="Set as banner image"
                  >
                    <ImagePlus className="size-3.5" />
                  </Button>
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
                dragOver
                  ? 'border-cinematic-gold bg-cinematic-gold/5'
                  : uploadForm.url
                    ? 'border-cinematic-gold/30 bg-cinematic-gold/5'
                    : 'border-charcoal-ink/10 hover:border-champagne-silk'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {/* Category select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-charcoal-ink/70">Category</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(v) => setUploadForm({ ...uploadForm, category: v })}
              >
                <SelectTrigger className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
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
                setUploadForm({ category: 'gallery', url: '', fileName: '' });
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
    </div>
  );
}