'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Pencil, Trash2, Users, Search, Mail, Phone, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

const API_BASE = '/api/cms/guests?XTransformPort=3000';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ATTENDING: { label: 'Attending', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DECLINED: { label: 'Declined', color: 'bg-red-50 text-red-600 border-red-200' },
  PARTIAL: { label: 'Partial', color: 'bg-sky-50 text-sky-700 border-sky-200' },
};

interface GuestItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  groupName: string | null;
  tableNumber: number | null;
  invitationCode: string;
  rsvpStatus: string;
  plusOne: boolean;
  plusOneName: string | null;
  dietaryNotes: string | null;
  sentVia: string | null;
  sentAt: string | null;
  _count?: { rsvps: number };
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  groupName: string;
  tableNumber: string;
  plusOne: boolean;
  plusOneName: string;
  dietaryNotes: string;
}

const emptyForm: FormData = {
  name: '',
  email: '',
  phone: '',
  groupName: '',
  tableNumber: '',
  plusOne: false,
  plusOneName: '',
  dietaryNotes: '',
};

export default function CoupleGuests() {
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true);
      let url = API_BASE;
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (params.length > 0) url += '&' + params.join('&');

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load guests');
      const data = await res.json();
      setGuests(data.guests ?? []);
    } catch {
      toast.error('Failed to load guest list');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (item: GuestItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      email: item.email ?? '',
      phone: item.phone ?? '',
      groupName: item.groupName ?? '',
      tableNumber: item.tableNumber != null ? String(item.tableNumber) : '',
      plusOne: item.plusOne,
      plusOneName: item.plusOneName ?? '',
      dietaryNotes: item.dietaryNotes ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Guest name is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        groupName: form.groupName.trim() || undefined,
        tableNumber: form.tableNumber ? parseInt(form.tableNumber, 10) : undefined,
        plusOne: form.plusOne,
        plusOneName: form.plusOne.trim() || undefined,
        dietaryNotes: form.dietaryNotes.trim() || undefined,
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
        throw new Error(err.error || 'Failed to save guest');
      }

      toast.success(editingId ? 'Guest updated successfully' : 'Guest added successfully');
      setDialogOpen(false);
      fetchGuests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save guest');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this guest? This action cannot be undone.')) return;

    try {
      setDeleting(id);
      const res = await fetch(`${API_BASE}&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete guest');
      }

      toast.success('Guest deleted');
      fetchGuests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete guest');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusConfig = (status: string) => STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-50 text-gray-600 border-gray-200' };

  // Summary stats
  const totalGuests = guests.length;
  const attending = guests.filter((g) => g.rsvpStatus === 'ATTENDING').length;
  const pending = guests.filter((g) => g.rsvpStatus === 'PENDING').length;
  const declined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-cinematic-gold" />
        <p className="text-sm text-charcoal-ink/50 font-medium">Loading your guest list…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-ink">Guest Management</h2>
          <p className="text-sm text-charcoal-ink/50 mt-1">
            Manage your guest list, track RSVPs, and send invitations.
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 shrink-0"
        >
          <Plus className="size-4 mr-1.5" />
          Add Guest
        </Button>
      </div>

      <Separator className="bg-champagne-silk" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-charcoal-ink/5 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-charcoal-ink">{totalGuests}</p>
          <p className="text-xs text-charcoal-ink/40 mt-0.5 font-medium uppercase tracking-wider">Total</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{attending}</p>
          <p className="text-xs text-emerald-600/60 mt-0.5 font-medium uppercase tracking-wider">Attending</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pending}</p>
          <p className="text-xs text-amber-600/60 mt-0.5 font-medium uppercase tracking-wider">Pending</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{declined}</p>
          <p className="text-xs text-red-500/60 mt-0.5 font-medium uppercase tracking-wider">Declined</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-charcoal-ink/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="pl-9 border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ATTENDING">Attending</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Guest List */}
      {guests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Users className="size-10 text-champagne-silk" />
          <p className="text-sm text-charcoal-ink/40 font-medium">
            {search || statusFilter !== 'all' ? 'No guests match your filters' : 'No guests yet'}
          </p>
          <p className="text-xs text-charcoal-ink/30">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Click "Add Guest" to start building your guest list.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {guests.map((guest) => {
            const statusConfig = getStatusConfig(guest.rsvpStatus);
            return (
              <Card
                key={guest.id}
                className="border-charcoal-ink/5 shadow-none hover:border-champagne-silk transition-colors duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="text-sm font-semibold text-charcoal-ink">{guest.name}</h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </Badge>
                        {guest.plusOne && (
                          <Badge variant="outline" className="text-[10px] font-medium bg-pink-50 text-pink-600 border-pink-200">
                            <UserPlus className="size-2.5 mr-0.5" />
                            +1
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap text-xs text-charcoal-ink/50">
                        {guest.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" />
                            {guest.email}
                          </span>
                        )}
                        {guest.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {guest.phone}
                          </span>
                        )}
                        {guest.groupName && (
                          <span className="text-charcoal-ink/40">
                            Group: {guest.groupName}
                          </span>
                        )}
                        {guest.tableNumber != null && (
                          <span className="text-charcoal-ink/40">
                            Table {guest.tableNumber}
                          </span>
                        )}
                        <span className="text-charcoal-ink/30 font-mono text-[10px]">
                          {guest.invitationCode}
                        </span>
                      </div>

                      {guest.plusOneName && (
                        <p className="text-xs text-charcoal-ink/40 mt-1">
                          Plus one: {guest.plusOneName}
                        </p>
                      )}
                      {guest.dietaryNotes && (
                        <p className="text-xs text-charcoal-ink/40 mt-0.5">
                          Dietary: {guest.dietaryNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(guest)}
                        className="h-8 w-8 p-0 text-charcoal-ink/40 hover:text-cinematic-gold hover:bg-cinematic-gold/5"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(guest.id)}
                        disabled={deleting === guest.id}
                        className="h-8 w-8 p-0 text-charcoal-ink/40 hover:text-red-500 hover:bg-red-50"
                      >
                        {deleting === guest.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-charcoal-ink">
              {editingId ? 'Edit Guest' : 'Add New Guest'}
            </DialogTitle>
            <DialogDescription className="text-charcoal-ink/50">
              {editingId ? 'Update guest information below.' : 'Add a new guest to your wedding list.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-1.5">
              <Label htmlFor="guest-name" className="text-sm font-medium text-charcoal-ink/70">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="guest-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sarah Tan"
                className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guest-email" className="text-sm font-medium text-charcoal-ink/70">Email</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sarah@email.com"
                  className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guest-phone" className="text-sm font-medium text-charcoal-ink/70">Phone</Label>
                <Input
                  id="guest-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+65 9123 4567"
                  className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guest-group" className="text-sm font-medium text-charcoal-ink/70">Group / Family</Label>
                <Input
                  id="guest-group"
                  value={form.groupName}
                  onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                  placeholder="e.g. Bride's Family"
                  className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guest-table" className="text-sm font-medium text-charcoal-ink/70">Table Number</Label>
                <Input
                  id="guest-table"
                  type="number"
                  value={form.tableNumber}
                  onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                  placeholder="e.g. 5"
                  className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-charcoal-ink/5 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-ink/70">Plus One</Label>
                <p className="text-xs text-charcoal-ink/40">Guest is allowed to bring a plus one</p>
              </div>
              <Switch
                checked={form.plusOne}
                onCheckedChange={(checked) => setForm({ ...form, plusOne: checked })}
              />
            </div>

            {form.plusOne && (
              <div className="space-y-1.5">
                <Label htmlFor="guest-plusone" className="text-sm font-medium text-charcoal-ink/70">Plus One Name</Label>
                <Input
                  id="guest-plusone"
                  value={form.plusOneName}
                  onChange={(e) => setForm({ ...form, plusOneName: e.target.value })}
                  placeholder="e.g. John Lim"
                  className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="guest-dietary" className="text-sm font-medium text-charcoal-ink/70">Dietary Notes</Label>
              <Input
                id="guest-dietary"
                value={form.dietaryNotes}
                onChange={(e) => setForm({ ...form, dietaryNotes: e.target.value })}
                placeholder="e.g. Vegetarian, nut allergy"
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
                'Update Guest'
              ) : (
                'Add Guest'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}