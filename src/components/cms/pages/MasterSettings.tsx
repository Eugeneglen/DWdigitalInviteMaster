'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ── Types ──────────────────────────────────────────────────────────────────

interface SettingsKV {
  [key: string]: string;
}

// ── Setting Definitions ────────────────────────────────────────────────────

interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'switch';
  defaultValue: string;
  options?: string[];
  placeholder?: string;
}

const SETTINGS_SECTIONS: { title: string; description: string; fields: SettingField[] }[] = [
  {
    title: 'Platform Information',
    description: 'General platform identity and contact details',
    fields: [
      { key: 'platform_name', label: 'Platform Name', type: 'text', defaultValue: 'Dreamweavers', placeholder: 'Dreamweavers' },
      { key: 'platform_tagline', label: 'Platform Tagline', type: 'text', defaultValue: '', placeholder: 'Crafting dream weddings' },
      { key: 'admin_email', label: 'Admin Email', type: 'email', defaultValue: '', placeholder: 'admin@dreamweavers.sg' },
      { key: 'support_email', label: 'Support Email', type: 'email', defaultValue: '', placeholder: 'support@dreamweavers.sg' },
    ],
  },
  {
    title: 'Wedding Defaults',
    description: 'Default values for new wedding accounts',
    fields: [
      { key: 'default_wedding_status', label: 'Default Wedding Status', type: 'select', defaultValue: 'DRAFT', options: ['DRAFT', 'ACTIVE'] },
      { key: 'default_plan', label: 'Default Plan', type: 'select', defaultValue: 'FREE', options: ['FREE', 'PREMIUM', 'ENTERPRISE'] },
      { key: 'max_guests_per_wedding', label: 'Max Guests Per Wedding', type: 'number', defaultValue: '500', placeholder: '500' },
      { key: 'max_media_per_wedding', label: 'Max Media Per Wedding', type: 'number', defaultValue: '100', placeholder: '100' },
    ],
  },
  {
    title: 'RSVP Settings',
    description: 'RSVP submission defaults and limits',
    fields: [
      { key: 'rsvp_allow_guest_submissions', label: 'Allow Guest Submissions', type: 'switch', defaultValue: 'true' },
      { key: 'rsvp_default_deadline_days', label: 'Default Deadline (days before wedding)', type: 'number', defaultValue: '7', placeholder: '7' },
    ],
  },
  {
    title: 'Notification Settings',
    description: 'Email notification preferences',
    fields: [
      { key: 'notify_on_rsvp', label: 'Notify on RSVP Submission', type: 'switch', defaultValue: 'true' },
      { key: 'notify_on_wish', label: 'Notify on New Wish', type: 'switch', defaultValue: 'true' },
      { key: 'notify_on_contact', label: 'Notify on Contact Message', type: 'switch', defaultValue: 'true' },
    ],
  },
];

// ── Main Component ─────────────────────────────────────────────────────────

export default function MasterSettings() {
  const [settings, setSettings] = useState<SettingsKV>({});
  const [initialSettings, setInitialSettings] = useState<SettingsKV>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/master/settings?XTransformPort=3000');
        if (!res.ok) throw new Error(`Failed to load settings (${res.status})`);
        const json = await res.json();
        const fetched: SettingsKV = json.settings || {};

        // Apply defaults for any missing keys
        const withDefaults: SettingsKV = { ...fetched };
        for (const section of SETTINGS_SECTIONS) {
          for (const field of section.fields) {
            if (!(field.key in withDefaults)) {
              withDefaults[field.key] = field.defaultValue;
            }
          }
        }

        setSettings(withDefaults);
        setInitialSettings({ ...withDefaults });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Dirty check
  const isDirty = useCallback(() => {
    const allKeys = new Set([...Object.keys(initialSettings), ...Object.keys(settings)]);
    for (const k of allKeys) {
      if (String(settings[k] ?? '') !== String(initialSettings[k] ?? '')) return true;
    }
    return false;
  }, [settings, initialSettings]);

  const dirty = !loading && isDirty();
  const changedCount = dirty
    ? Object.keys(initialSettings).filter((k) => String(settings[k] ?? '') !== String(initialSettings[k] ?? '')).length
    : 0;

  // Update a single field
  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Save all
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/master/settings?XTransformPort=3000', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const json = await res.json();
      setInitialSettings({ ...settings });
      toast.success(`Settings saved (${json.updated} ${json.updated === 1 ? 'value' : 'values'} updated)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-sm font-medium text-red-500">Error loading settings</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
          <p className="text-slate-500 mt-1">Configure platform settings and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="bg-charcoal-ink text-paper-cream hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
          {dirty && !saving && (
            <span className="ml-2 text-xs opacity-70">({changedCount} change{changedCount !== 1 ? 's' : ''})</span>
          )}
        </Button>
      </div>

      {/* Settings Sections */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-slate-200 rounded-xl bg-white shadow-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64 mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between gap-4">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-9 w-48" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        SETTINGS_SECTIONS.map((section) => (
          <Card key={section.title} className="border-slate-200 rounded-xl bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900">{section.title}</CardTitle>
              <p className="text-sm text-slate-400">{section.description}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              {section.fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-4">
                  <Label htmlFor={field.key} className="text-sm text-slate-700 whitespace-nowrap shrink-0">
                    {field.label}
                  </Label>
                  <div className="w-full max-w-sm">
                    {field.type === 'switch' ? (
                      <div className="flex items-center justify-end">
                        <Switch
                          id={field.key}
                          checked={settings[field.key] === 'true'}
                          onCheckedChange={(checked) => updateField(field.key, checked ? 'true' : 'false')}
                        />
                      </div>
                    ) : field.type === 'select' ? (
                      <Select
                        value={settings[field.key] || field.defaultValue}
                        onValueChange={(val) => updateField(field.key, val)}
                      >
                        <SelectTrigger className="w-full" id={field.key}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type}
                        value={settings[field.key] ?? ''}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="max-w-sm"
                      />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}