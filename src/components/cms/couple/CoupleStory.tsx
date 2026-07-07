'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Pencil, Trash2, BookOpen, ImageIcon, Calendar } from 'lucide-react';
import FontPicker from './FontPicker';
import SectionImageUpload from './SectionImageUpload';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

const API_BASE = '/api/cms/stories?XTransformPort=3000';

interface StoryItem {
  id: string;
  title: string;
  content: string;
  date: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

interface FormData {
  title: string;
  date: string;
  imageUrl: string;
  content: string;
}

const emptyForm: FormData = {
  title: '',
  date: '',
  imageUrl: '',
  content: '',
};

export default function CoupleStory() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Content editor state
  const [contentFields, setContentFields] = useState<Record<string, string>>({});
  const [originalFields, setOriginalFields] = useState<Record<string, string>>({});
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({});
  const [savingContent, setSavingContent] = useState(false);

  const CONTENT_KEYS = [
    { key: 'title', label: 'Section Title', placeholder: 'e.g. Our Story', type: 'input' as const },
    { key: 'subtitle', label: 'Section Subtitle', placeholder: 'e.g. A journey of love', type: 'input' as const },
    { key: 'recommendationPrompt', label: 'Recommendation Prompt', placeholder: '', type: 'input' as const },
  ];

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to load stories');
      const data = await res.json();
      setStories(data.stories ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load love story', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/content?XTransformPort=3000');
      if (!res.ok) throw new Error('Failed to load content');
      const data = await res.json();
      const items = (data.items ?? []).filter((i: { section: string }) => i.section === 'story');
      const fields: Record<string, string> = {};
      items.forEach((item: { fieldKey: string; fieldValue: string }) => {
        fields[item.fieldKey] = item.fieldValue;
      });
      setContentFields(fields);
      setOriginalFields({ ...fields });
      setEditedFields({});
    } catch {
      // silently fail for content
    }
  }, []);

  useEffect(() => {
    fetchStories();
    fetchContent();
  }, [fetchStories, fetchContent]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (item: StoryItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      date: item.date ?? '',
      imageUrl: item.imageUrl ?? '',
      content: item.content,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Error', description: 'Chapter title is required', variant: 'destructive' });
      return;
    }
    if (!form.content.trim()) {
      toast({ title: 'Error', description: 'Story content is required', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        date: form.date.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
      };

      let res: Response;
      if (editingId) {
        res = await fetch(API_BASE, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save chapter');
      }

      toast({ title: 'Success', description: editingId ? 'Chapter updated successfully' : 'Chapter added successfully' });
      setDialogOpen(false);
      fetchStories();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save chapter', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (key: string, value: string) => {
    setContentFields((prev) => ({ ...prev, [key]: value }));
    setEditedFields((prev) => ({
      ...prev,
      [key]: value !== originalFields[key],
    }));
  };

  const handleSaveContent = async () => {
    try {
      setSavingContent(true);
      const items = Object.keys(editedFields)
        .filter((k) => editedFields[k])
        .map((fieldKey) => ({
          section: 'story' as const,
          fieldKey,
          fieldValue: contentFields[fieldKey],
        }));
      if (items.length === 0) {
        toast({ title: 'Info', description: 'No changes to save' });
        return;
      }
      const res = await fetch('/api/cms/content?XTransformPort=3000', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed to save content');
      toast({ title: 'Success', description: 'Content saved successfully' });
      setOriginalFields({ ...contentFields });
      setEditedFields({});
    } catch {
      toast({ title: 'Error', description: 'Failed to save content', variant: 'destructive' });
    } finally {
      setSavingContent(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this chapter? This action cannot be undone.')) return;

    try {
      setDeleting(id);
      const res = await fetch(`${API_BASE}&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete chapter');
      }

      toast({ title: 'Success', description: 'Chapter deleted' });
      fetchStories();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete chapter', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-ink">Our Love Story</h2>
          <p className="text-sm text-charcoal-ink/50 mt-1">
            Add chapters to tell the story of your journey together.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {Object.values(editedFields).some(Boolean) && (
            <Button
              onClick={handleSaveContent}
              disabled={savingContent}
              className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300"
            >
              {savingContent ? 'Saving…' : 'Save Content'}
            </Button>
          )}
          <Button
            onClick={openAddDialog}
            className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300"
          >
            <Plus className="size-4 mr-1.5" />
            Add Chapter
          </Button>
        </div>
      </div>

      <SectionImageUpload category="story" label="Story Images" maxImages={3} />
      <Separator className="bg-champagne-silk" />

      <FontPicker section="story" />
      <Separator className="bg-champagne-silk" />

      {/* Content Card */}
      <Card className="border-charcoal-ink/5 shadow-none">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-charcoal-ink mb-4">Story Content</h3>
          <div className="space-y-4">
            {CONTENT_KEYS.map(({ key, label, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider">
                    {label}
                  </Label>
                  {editedFields[key] && (
                    <span className="bg-cinematic-gold w-1.5 h-1.5 rounded-full" />
                  )}
                </div>
                {type === 'textarea' ? (
                  <Textarea
                    value={contentFields[key] ?? ''}
                    onChange={(e) => handleContentChange(key, e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20 resize-none"
                  />
                ) : (
                  <Input
                    value={contentFields[key] ?? ''}
                    onChange={(e) => handleContentChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-champagne-silk" />

      {/* Timeline List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="size-8 animate-spin text-cinematic-gold" />
          <p className="text-sm text-charcoal-ink/50 font-medium">Loading your story…</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <BookOpen className="size-10 text-champagne-silk" />
          <p className="text-sm text-charcoal-ink/40 font-medium">No chapters yet</p>
          <p className="text-xs text-charcoal-ink/30">Click &quot;Add Chapter&quot; to start telling your story.</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-champagne-silk hidden sm:block" />

          {stories.map((item, index) => (
            <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Timeline dot */}
              <div className="hidden sm:flex items-start pt-1.5 shrink-0">
                <div className="relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-cinematic-gold/30 bg-paper-cream">
                  <div className="h-2 w-2 rounded-full bg-cinematic-gold" />
                </div>
              </div>

              {/* Card */}
              <Card className="flex-1 border-charcoal-ink/5 shadow-none hover:border-champagne-silk transition-colors duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Mobile: chapter number */}
                      <span className="sm:hidden inline-flex items-center justify-center h-5 w-5 rounded-full bg-cinematic-gold/10 text-cinematic-gold text-[10px] font-bold mb-2">
                        {index + 1}
                      </span>

                      <h3 className="text-sm font-semibold text-charcoal-ink mb-1">
                        {item.title}
                      </h3>

                      {item.date && (
                        <span className="flex items-center gap-1 text-xs text-cinematic-gold/80 font-medium mb-2">
                          <Calendar className="size-3" />
                          {item.date}
                        </span>
                      )}

                      {item.imageUrl && (
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-ink/40 mb-2">
                          <ImageIcon className="size-3" />
                          <span className="truncate max-w-[200px]">{item.imageUrl}</span>
                        </div>
                      )}

                      <p className="text-xs text-charcoal-ink/50 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                        className="h-8 w-8 p-0 text-charcoal-ink/40 hover:text-cinematic-gold hover:bg-cinematic-gold/5"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="h-8 w-8 p-0 text-charcoal-ink/40 hover:text-red-500 hover:bg-red-50"
                      >
                        {deleting === item.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-charcoal-ink">
              {editingId ? 'Edit Chapter' : 'Add New Chapter'}
            </DialogTitle>
            <DialogDescription className="text-charcoal-ink/50">
              {editingId ? 'Update this chapter of your love story.' : 'Add a new chapter to your love story timeline.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="story-title" className="text-sm font-medium text-charcoal-ink/70">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="story-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. How We Met"
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="story-date" className="text-sm font-medium text-charcoal-ink/70">
                Display Date
              </Label>
              <Input
                id="story-date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="e.g. March 2023"
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="story-image" className="text-sm font-medium text-charcoal-ink/70">
                Image URL
              </Label>
              <Input
                id="story-image"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="story-content" className="text-sm font-medium text-charcoal-ink/70">
                Content / Story <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="story-content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Tell this chapter of your story…"
                rows={4}
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20 resize-none min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-charcoal-ink/15 text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold rounded px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : editingId ? (
                'Update Chapter'
              ) : (
                'Add Chapter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}