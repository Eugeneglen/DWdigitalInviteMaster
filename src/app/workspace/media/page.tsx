'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  alt: string | null;
  folder: string | null;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/workspace/media');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media ?? []);
      }
    } catch {
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/workspace/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      toast.success(`"${file.name}" uploaded successfully`);
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/workspace/media/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }

      toast.success(`"${name}" deleted`);
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-charcoal-ink tracking-tight">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-charcoal-ink/50 font-[family-name:var(--font-inter)]">
            Upload and manage images for your wedding site
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-cinematic-gold hover:bg-cinematic-gold/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-champagne-silk/30 overflow-hidden"
            >
              <div className="aspect-square bg-charcoal-ink/5 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-charcoal-ink/5 rounded animate-pulse w-3/4" />
                <div className="h-2.5 bg-charcoal-ink/5 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && media.length === 0 && (
        <div className="bg-white rounded-xl border border-champagne-silk/30 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-cinematic-gold/8 flex items-center justify-center mb-4">
            <ImageIcon className="w-7 h-7 text-cinematic-gold/50" />
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-lg text-charcoal-ink/60">
            No media yet
          </p>
          <p className="mt-1 text-sm text-charcoal-ink/35 font-[family-name:var(--font-inter)] mb-4">
            Upload your first image to get started
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="border-cinematic-gold/30 text-cinematic-gold hover:bg-cinematic-gold/5 rounded-lg"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
      )}

      {/* Media Grid */}
      {!loading && media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-champagne-silk/30 overflow-hidden hover:shadow-sm hover:border-cinematic-gold/20 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-charcoal-ink/5 relative overflow-hidden">
                {item.mimeType.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-charcoal-ink/20" />
                  </div>
                )}

                {/* Delete button overlay */}
                <button
                  onClick={() => handleDelete(item.id, item.originalName)}
                  disabled={deletingId === item.id}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-charcoal-ink/60 hover:bg-red-600
                    flex items-center justify-center opacity-0 group-hover:opacity-100
                    transition-all duration-200 text-white cursor-pointer disabled:opacity-50"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <p
                  className="text-xs font-medium text-charcoal-ink truncate font-[family-name:var(--font-inter)]"
                  title={item.originalName}
                >
                  {item.originalName}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
                    {formatFileSize(item.size)}
                  </span>
                  <span className="text-[11px] text-charcoal-ink/30 font-[family-name:var(--font-inter)]">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}