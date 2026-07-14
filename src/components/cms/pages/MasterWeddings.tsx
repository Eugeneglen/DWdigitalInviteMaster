'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Ban,
  Play,
  Archive,
  Heart,
  Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCMSStore } from '@/store/useCMSStore';
import WeddingCreationWizard from './WeddingCreationWizard';

// ── Types ──────────────────────────────────────────────────────────────────

interface Wedding {
  id: string;
  slug: string;
  coupleName: string;
  brideName: string | null;
  groomName: string | null;
  weddingDate: string;
  venueAddress: string | null;
  status: string;
  plan: string;
  features?: { featureKey: string; isEnabled: boolean }[];
  _count?: {
    rsvps?: number;
    wishes?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface WeddingForm {
  coupleName: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venueAddress: string;
  plan: string;
  sections: string[];
}

const OPTIONAL_SECTIONS = [
  { key: 'story', label: 'Story' },
  { key: 'wishes', label: 'Wishes' },
  { key: 'qa', label: 'Q&A' },
  { key: 'moments', label: 'Moments' },
];

const EMPTY_FORM: WeddingForm = {
  coupleName: '',
  brideName: '',
  groomName: '',
  weddingDate: '',
  venueAddress: '',
  plan: 'GOLD',
  sections: [],
};

// ── Helpers ────────────────────────────────────────────────────────────────

const statusVariant: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
};

const planVariant: Record<string, string> = {
  PLATINUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  DIAMOND: 'bg-purple-50 text-purple-700 border-purple-200',
  GOLD: 'bg-slate-100 text-slate-500 border-slate-200',
};

function formatWeddingDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncate(str: string | null, max: number) {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

function slugFromNames(coupleName: string): string {
  return coupleName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `wedding-${Date.now()}`;
}

// ── Table Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Heart className="h-10 w-10 mb-3" />
      <p className="text-sm font-medium text-slate-500">
        {hasSearch ? 'No weddings match your search' : 'No wedding accounts yet'}
      </p>
      <p className="text-xs mt-1">
        {hasSearch
          ? 'Try adjusting your search terms'
          : 'Click "Create Wedding" to get started'}
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function MasterWeddings() {
  const { selectWedding } = useCMSStore();

  // Data state
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WeddingForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch weddings ─────────────────────────────────────────────────────

  const fetchWeddings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(
        `/api/master/weddings?${params.toString()}&XTransformPort=3000`
      );
      if (!res.ok) throw new Error(`Failed to fetch weddings (${res.status})`);
      const json = await res.json();
      setWeddings(Array.isArray(json) ? json : json.weddings ?? []);
    } catch {
      setWeddings([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // ── Search debounce ────────────────────────────────────────────────────
  // Single debounced fetch — fires on mount AND when search changes (after 300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWeddings();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchWeddings]);

  // ── Dialog handlers ────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(w: Wedding) {
    setEditingId(w.id);
    const enabledSections = (w.features ?? [])
      .filter((f) => f.isEnabled && OPTIONAL_SECTIONS.some((s) => s.key === f.featureKey))
      .map((f) => f.featureKey);
    setForm({
      coupleName: w.coupleName,
      brideName: w.brideName ?? '',
      groomName: w.groomName ?? '',
      weddingDate: w.weddingDate ? w.weddingDate.slice(0, 10) : '',
      venueAddress: w.venueAddress ?? '',
      plan: w.plan,
      sections: enabledSections,
    });
    setDialogOpen(true);
  }

  function setField<K extends keyof WeddingForm>(key: K, value: WeddingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Submit (create or update) ──────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.coupleName.trim()) {
      toast({ title: 'Validation Error', description: 'Couple name is required.', variant: 'destructive' });
      return;
    }
    if (!form.weddingDate) {
      toast({ title: 'Validation Error', description: 'Wedding date is required.', variant: 'destructive' });
      return;
    }
    if (!form.venueAddress.trim()) {
      toast({ title: 'Validation Error', description: 'Venue address is required.', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);

      const payload: Record<string, unknown> = {
        coupleName: form.coupleName.trim(),
        brideName: form.brideName.trim() || null,
        groomName: form.groomName.trim() || null,
        weddingDate: new Date(form.weddingDate).toISOString(),
        venueAddress: form.venueAddress.trim(),
        plan: form.plan,
        sections: form.sections,
      };

      if (editingId) {
        // Update
        const res = await fetch('/api/master/weddings?XTransformPort=3000', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(typeof err.error === 'string' ? err.error : 'Update failed');
        }
        toast({ title: 'Wedding Updated', description: `${form.coupleName.trim()} has been updated.` });
      } else {
        // Create — auto-generate slug
        payload.slug = slugFromNames(form.coupleName);
        const res = await fetch('/api/master/weddings?XTransformPort=3000', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(typeof err.error === 'string' ? err.error : 'Create failed');
        }
        toast({ title: 'Wedding Created', description: `${form.coupleName.trim()} has been created.` });
      }

      setDialogOpen(false);
      fetchWeddings();
    } catch (err) {
      toast({
        title: editingId ? 'Update Failed' : 'Create Failed',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Status toggle (Suspend / Activate) ─────────────────────────────────

  async function toggleStatus(w: Wedding) {
    const newStatus = w.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const res = await fetch('/api/master/weddings?XTransformPort=3000', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: w.id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      toast({ title: 'Status Updated', description: `${w.coupleName} is now ${newStatus}.` });
      fetchWeddings();
    } catch {
      toast({ title: 'Action Failed', description: 'Could not update wedding status.', variant: 'destructive' });
    }
  }

  // ── Archive ────────────────────────────────────────────────────────────

  async function archiveWedding(w: Wedding) {
    try {
      const res = await fetch('/api/master/weddings?XTransformPort=3000', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: w.id }),
      });
      if (!res.ok) throw new Error('Archive failed');
      toast({ title: 'Wedding Archived', description: `${w.coupleName} has been archived.` });
      fetchWeddings();
    } catch {
      toast({ title: 'Archive Failed', description: 'Could not archive wedding.', variant: 'destructive' });
    }
  }

  // ── Filtered list ──────────────────────────────────────────────────────

  const query = search.toLowerCase();
  const filtered = query
    ? weddings.filter(
        (w) =>
          w.coupleName.toLowerCase().includes(query) ||
          (w.brideName ?? '').toLowerCase().includes(query) ||
          (w.groomName ?? '').toLowerCase().includes(query) ||
          w.slug.toLowerCase().includes(query)
      )
    : weddings;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by couple name, bride, groom, or slug..."
            className="pl-9 border-slate-200 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setWizardOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Create Wedding
        </Button>
      </div>

      {/* Data Table */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasSearch={query.length > 0} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="text-slate-600 font-semibold">
                    Couple Name
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold">
                    Wedding Date
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold">
                    Venue
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold">
                    Plan
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold text-center">
                    RSVPs
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold text-center">
                    Wishes
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((w) => (
                  <TableRow
                    key={w.id}
                    className="border-slate-100 cursor-pointer"
                    onClick={() => selectWedding(w.id)}
                  >
                    {/* Couple Name */}
                    <TableCell>
                      <p className="font-semibold text-slate-900 text-sm">
                        {w.coupleName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        /{w.slug}
                      </p>
                    </TableCell>

                    {/* Wedding Date */}
                    <TableCell className="text-sm text-slate-600">
                      {w.weddingDate
                        ? formatWeddingDate(w.weddingDate)
                        : '—'}
                    </TableCell>

                    {/* Venue */}
                    <TableCell className="text-sm text-slate-600 max-w-[160px] truncate">
                      {truncate(w.venueAddress, 24)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          statusVariant[w.status] ??
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }
                      >
                        {w.status}
                      </Badge>
                    </TableCell>

                    {/* Plan */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          planVariant[w.plan] ??
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }
                      >
                        {w.plan}
                      </Badge>
                    </TableCell>

                    {/* RSVPs */}
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {w._count?.rsvps ?? 0}
                      </Badge>
                    </TableCell>

                    {/* Wishes */}
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {w._count?.wishes ?? 0}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              selectWedding(w.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(w);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(w);
                            }}
                          >
                            {w.status === 'SUSPENDED' ? (
                              <>
                                <Play className="h-4 w-4" />
                                Activate
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4" />
                                Suspend
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveWedding(w);
                            }}
                          >
                            <Archive className="h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Wedding' : 'Create Wedding'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the wedding account details below.'
                : 'Fill in the details to create a new wedding account.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Couple Name */}
            <div className="space-y-2">
              <Label htmlFor="coupleName">
                Couple Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="coupleName"
                placeholder="e.g. Eleanor & James"
                value={form.coupleName}
                onChange={(e) => setField('coupleName', e.target.value)}
                required
              />
            </div>

            {/* Bride & Groom — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brideName">Bride Name</Label>
                <Input
                  id="brideName"
                  placeholder="Bride's name"
                  value={form.brideName}
                  onChange={(e) => setField('brideName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groomName">Groom Name</Label>
                <Input
                  id="groomName"
                  placeholder="Groom's name"
                  value={form.groomName}
                  onChange={(e) => setField('groomName', e.target.value)}
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div className="space-y-2">
              <Label htmlFor="weddingDate">
                Wedding Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="weddingDate"
                type="date"
                value={form.weddingDate}
                onChange={(e) => setField('weddingDate', e.target.value)}
                required
              />
            </div>

            {/* Venue Address */}
            <div className="space-y-2">
              <Label htmlFor="venueAddress">
                Venue Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="venueAddress"
                placeholder="Full venue address"
                value={form.venueAddress}
                onChange={(e) => setField('venueAddress', e.target.value)}
                required
              />
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select
                value={form.plan}
                onValueChange={(v) => setField('plan', v)}
              >
                <SelectTrigger className="w-full border-slate-200">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                  <SelectItem value="DIAMOND">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Optional Sections */}
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700 font-semibold">Optional Sections</Label>
                <p className="text-xs text-slate-400 mt-0.5">
                  Home, Schedule, RSVP &amp; Getting There are always included. Toggle additional sections for this wedding.
                </p>
              </div>
              <div className="space-y-3">
                {OPTIONAL_SECTIONS.map((section) => {
                  const checked = form.sections.includes(section.key);
                  return (
                    <div key={section.key} className="flex items-center justify-between">
                      <Label htmlFor={`section-${section.key}`} className="text-sm text-slate-600 cursor-pointer">
                        {section.label}
                      </Label>
                      <Switch
                        id={`section-${section.key}`}
                        checked={checked}
                        onCheckedChange={(checked) => {
                          setForm((prev) => ({
                            ...prev,
                            sections: checked
                              ? [...prev.sections, section.key]
                              : prev.sections.filter((s) => s !== section.key),
                          }));
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingId ? 'Saving...' : 'Creating...'}
                  </>
                ) : editingId ? (
                  'Save Changes'
                ) : (
                  'Create Wedding'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Wedding Creation Wizard (4-step) */}
      <WeddingCreationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCreated={fetchWeddings}
      />
    </div>
  );
}