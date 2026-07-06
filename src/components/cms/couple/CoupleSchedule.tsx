'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Pencil, Trash2, Clock, MapPin, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const API_BASE = '/api/cms/schedule?XTransformPort=3000';

const EVENT_TYPES = [
  { value: 'TEA_CEREMONY', label: 'Tea Ceremony' },
  { value: 'CEREMONY', label: 'Ceremony' },
  { value: 'RECEPTION', label: 'Reception' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'CUSTOM', label: 'Custom' },
] as const;

const EVENT_TYPE_COLORS: Record<string, string> = {
  TEA_CEREMONY: 'bg-amber-50 text-amber-700 border-amber-200',
  CEREMONY: 'bg-rose-50 text-rose-700 border-rose-200',
  RECEPTION: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DINNER: 'bg-violet-50 text-violet-700 border-violet-200',
  CUSTOM: 'bg-sky-50 text-sky-700 border-sky-200',
};

interface ScheduleItem {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  location: string | null;
  sortOrder: number;
}

interface FormData {
  eventType: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

const emptyForm: FormData = {
  eventType: '',
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
};

export default function CoupleSchedule() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to load schedule');
      const data = await res.json();
      setSchedules(data.schedules ?? []);
    } catch {
      toast.error('Failed to load event schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (item: ScheduleItem) => {
    setEditingId(item.id);
    setForm({
      eventType: item.eventType,
      title: item.title,
      description: item.description ?? '',
      startTime: item.startTime,
      endTime: item.endTime ?? '',
      location: item.location ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (!form.eventType) {
      toast.error('Please select an event type');
      return;
    }
    if (!form.startTime) {
      toast.error('Start time is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        eventType: form.eventType,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startTime: form.startTime,
        endTime: form.endTime || undefined,
        location: form.location.trim() || undefined,
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
        throw new Error(err.error || 'Failed to save event');
      }

      toast.success(editingId ? 'Event updated successfully' : 'Event added successfully');
      setDialogOpen(false);
      fetchSchedules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This action cannot be undone.')) return;

    try {
      setDeleting(id);
      const res = await fetch(`${API_BASE}&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete event');
      }

      toast.success('Event deleted');
      fetchSchedules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  const getEventTypeLabel = (type: string) =>
    EVENT_TYPES.find((t) => t.value === type)?.label ?? type;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-cinematic-gold" />
        <p className="text-sm text-charcoal-ink/50 font-medium">Loading your schedule…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-ink">Event Schedule</h2>
          <p className="text-sm text-charcoal-ink/50 mt-1">
            Manage the events for your wedding day.
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 shrink-0"
        >
          <Plus className="size-4 mr-1.5" />
          Add Event
        </Button>
      </div>

      <Separator className="bg-champagne-silk" />

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <CalendarRange className="size-10 text-champagne-silk" />
          <p className="text-sm text-charcoal-ink/40 font-medium">No events scheduled yet</p>
          <p className="text-xs text-charcoal-ink/30">Click &quot;Add Event&quot; to create your first event.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((item) => (
            <Card key={item.id} className="border-charcoal-ink/5 shadow-none hover:border-champagne-silk transition-colors duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium ${EVENT_TYPE_COLORS[item.eventType] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        {getEventTypeLabel(item.eventType)}
                      </Badge>
                      <h3 className="text-sm font-semibold text-charcoal-ink truncate">
                        {item.title}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-xs text-charcoal-ink/50 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      {item.startTime && (
                        <span className="flex items-center gap-1 text-xs text-charcoal-ink/60">
                          <Clock className="size-3" />
                          {item.startTime}
                          {item.endTime ? ` – ${item.endTime}` : ''}
                        </span>
                      )}
                      {item.location && (
                        <span className="flex items-center gap-1 text-xs text-charcoal-ink/60">
                          <MapPin className="size-3" />
                          {item.location}
                        </span>
                      )}
                    </div>
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
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-charcoal-ink">
              {editingId ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
            <DialogDescription className="text-charcoal-ink/50">
              {editingId ? 'Update the event details below.' : 'Fill in the details for your new event.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-charcoal-ink/70">Event Type</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                <SelectTrigger className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sched-title" className="text-sm font-medium text-charcoal-ink/70">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="sched-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Tea Ceremony"
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sched-desc" className="text-sm font-medium text-charcoal-ink/70">
                Description
              </Label>
              <Textarea
                id="sched-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the event"
                rows={3}
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sched-start" className="text-sm font-medium text-charcoal-ink/70">
                  Start Time
                </Label>
                <Input
                  id="sched-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sched-end" className="text-sm font-medium text-charcoal-ink/70">
                  End Time
                </Label>
                <Input
                  id="sched-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sched-location" className="text-sm font-medium text-charcoal-ink/70">
                Location
              </Label>
              <Input
                id="sched-location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Grand Ballroom, Level 3"
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
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
                'Update Event'
              ) : (
                'Add Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}