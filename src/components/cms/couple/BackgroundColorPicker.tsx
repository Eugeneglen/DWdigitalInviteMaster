'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Palette, Type, AlignHorizontalDistributeCenter, Eye, EyeOff, Link2, Unlink2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { invalidateWeddingCache } from '@/hooks/usePublicWedding';
import { getAutoTextColor, getAutoBorderColor, isDarkBackground } from '@/lib/contrast';

const CONTENT_API = '/api/cms/content?XTransformPort=3000';

/** The default DW beige / paper-cream */
const DEFAULT_BG = '#FCF9F2';

/** Curated preset colors matching DW wedding aesthetics */
const PRESETS = [
  { value: '#FCF9F2', label: 'Paper Cream' },
  { value: '#FDF6EC', label: 'Warm Ivory' },
  { value: '#F5F0E8', label: 'Linen' },
  { value: '#FAF3E0', label: 'Champagne' },
  { value: '#F0EDE8', label: 'Stone' },
  { value: '#EDE8E0', label: 'Sand' },
  { value: '#F7F1E8', label: 'Parchment' },
  { value: '#FFF8F0', label: 'Blush Cream' },
  { value: '#F5EFE6', label: 'Oat' },
  { value: '#EDEDEB', label: 'Silver Mist' },
  { value: '#2C2C2C', label: 'Dark Charcoal' },
  { value: '#1A1A1A', label: 'Deep Black' },
];

/** All CMS colour field keys managed by this component */
interface ColorFields {
  backgroundColor: string;
  headerBackgroundColor: string; // '' = same as page
  textColor: string; // '' = auto
  borderColor: string; // '' = auto
}

const DEFAULT_FIELDS: ColorFields = {
  backgroundColor: DEFAULT_BG,
  headerBackgroundColor: '',
  textColor: '',
  borderColor: '',
};

export default function BackgroundColorPicker() {
  const [fields, setFields] = useState<ColorFields>(DEFAULT_FIELDS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Fetch ──────────────────────────────────────────────
  const fetchColors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONTENT_API}&section=global`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const items: { fieldKey: string; fieldValue: string }[] = data.content ?? [];
      setFields((prev) => ({
        ...prev,
        backgroundColor: items.find((i) => i.fieldKey === 'backgroundColor')?.fieldValue ?? DEFAULT_BG,
        headerBackgroundColor: items.find((i) => i.fieldKey === 'headerBackgroundColor')?.fieldValue ?? '',
        textColor: items.find((i) => i.fieldKey === 'textColor')?.fieldValue ?? '',
        borderColor: items.find((i) => i.fieldKey === 'borderColor')?.fieldValue ?? '',
      }));
    } catch {
      // Silently fall back to defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  // ── Save ───────────────────────────────────────────────
  const saveField = async (fieldKey: string, fieldValue: string) => {
    setFields((prev) => ({ ...prev, [fieldKey]: fieldValue }));
    setSaving(true);
    try {
      const res = await fetch(CONTENT_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ section: 'global', fieldKey, fieldValue, fieldType: 'TEXT' }],
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      invalidateWeddingCache();
    } catch {
      toast({
        title: 'Error',
        description: `Failed to save ${fieldKey}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Derived values ─────────────────────────────────────
  const isDark = isDarkBackground(fields.backgroundColor);
  const autoText = getAutoTextColor(fields.backgroundColor);
  const autoBorder = getAutoBorderColor(fields.backgroundColor);
  const activeText = fields.textColor || autoText;
  const activeBorder = fields.borderColor || autoBorder;
  const headerLinked = fields.headerBackgroundColor === '';
  const headerBg = fields.headerBackgroundColor || fields.backgroundColor;

  // ── Helpers ────────────────────────────────────────────
  const getContrastLabel = (bg: string) => (isDarkBackground(bg) ? 'Light' : 'Dark');

  if (loading) {
    return (
      <Card className="border-charcoal-ink/5 shadow-none">
        <CardContent className="p-4 flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-cinematic-gold" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-charcoal-ink/5 shadow-none">
      <CardContent className="p-4 space-y-5">
        {/* ─── Section 1: Page Background ─── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-cinematic-gold" />
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider">
              Page Background
            </Label>
            {saving && <Loader2 className="size-3.5 animate-spin text-cinematic-gold ml-auto" />}
          </div>

          {/* Current color preview bar */}
          <div
            className="relative h-14 rounded-md border border-charcoal-ink/10 overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: fields.backgroundColor }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center text-xs font-medium opacity-60 transition-colors duration-300"
              style={{ color: autoText }}
            >
              {fields.backgroundColor.toUpperCase()}
              <span className="ml-2 opacity-70">— {isDark ? 'Dark' : 'Light'}</span>
            </div>
            <input
              type="color"
              value={fields.backgroundColor}
              onChange={(e) => saveField('backgroundColor', e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Pick a custom colour"
            />
          </div>

          {/* Preset swatches grid */}
          <div>
            <p className="text-[11px] text-charcoal-ink/40 mb-2">Presets</p>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESETS.map((preset) => {
                const isActive = fields.backgroundColor.toUpperCase() === preset.value.toUpperCase();
                return (
                  <button
                    key={preset.value}
                    onClick={() => saveField('backgroundColor', preset.value)}
                    className={`
                      group relative h-8 rounded-md border transition-all duration-150
                      ${isActive
                        ? 'border-cinematic-gold ring-2 ring-cinematic-gold/30 scale-105'
                        : 'border-charcoal-ink/10 hover:border-cinematic-gold/50 hover:scale-105'
                      }
                    `}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                    aria-label={preset.label}
                  >
                    {isActive && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ color: getContrastLabel(preset.value) === 'Light' ? '#E8E0D0' : '#1A1A1A' }}
                      >
                        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <span
                      className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-charcoal-ink text-paper-cream opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
                    >
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {fields.backgroundColor.toUpperCase() !== DEFAULT_BG.toUpperCase() && (
            <button
              onClick={() => saveField('backgroundColor', DEFAULT_BG)}
              className="text-[11px] text-charcoal-ink/40 hover:text-cinematic-gold transition-colors"
            >
              Reset to default (Paper Cream)
            </button>
          )}
        </div>

        <Separator className="bg-champagne-silk/40" />

        {/* ─── Section 2: Header Background ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlignHorizontalDistributeCenter className="size-4 text-cinematic-gold" />
              <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider">
                Header Background
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {headerLinked ? (
                <Link2 className="size-3 text-cinematic-gold" />
              ) : (
                <Unlink2 className="size-3 text-charcoal-ink/40" />
              )}
              <Switch
                checked={headerLinked}
                onCheckedChange={(checked) => {
                  if (checked) {
                    // Link = clear header bg (falls back to page bg)
                    saveField('headerBackgroundColor', '');
                  } else {
                    // Unlink = set to current page bg as starting point
                    saveField('headerBackgroundColor', fields.backgroundColor);
                  }
                }}
                className="scale-75"
              />
            </div>
          </div>

          {headerLinked ? (
            <p className="text-[11px] text-charcoal-ink/40">
              Same as page background
            </p>
          ) : (
            <div className="space-y-2">
              <div
                className="relative h-10 rounded-md border border-charcoal-ink/10 overflow-hidden transition-colors duration-300"
                style={{ backgroundColor: headerBg }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center text-[11px] font-medium opacity-60 transition-colors duration-300"
                  style={{ color: getAutoTextColor(headerBg) }}
                >
                  {headerBg.toUpperCase()}
                </div>
                <input
                  type="color"
                  value={headerBg}
                  onChange={(e) => saveField('headerBackgroundColor', e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Pick header background colour"
                />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-charcoal-ink/40">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm border border-charcoal-ink/10" style={{ backgroundColor: fields.backgroundColor }} />
                  Page
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm border border-charcoal-ink/10" style={{ backgroundColor: headerBg }} />
                  Header
                </span>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-champagne-silk/40" />

        {/* ─── Section 3: Text & Border Contrast ─── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Type className="size-4 text-cinematic-gold" />
            <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider">
              Text &amp; Border Contrast
            </Label>
          </div>

          {/* Auto-contrast indicator */}
          <div className="flex items-center justify-between rounded-md border border-charcoal-ink/5 bg-charcoal-ink/[0.02] px-3 py-2.5">
            <div className="flex items-center gap-2">
              {fields.textColor === '' && fields.borderColor === '' ? (
                <Eye className="size-3.5 text-cinematic-gold" />
              ) : (
                <EyeOff className="size-3.5 text-charcoal-ink/40" />
              )}
              <span className="text-[11px] text-charcoal-ink/60">
                Auto-contrast {fields.textColor || fields.borderColor ? 'off' : 'on'}
              </span>
            </div>
            <button
              onClick={() => {
                if (fields.textColor || fields.borderColor) {
                  // Re-enable auto
                  if (fields.textColor) saveField('textColor', '');
                  if (fields.borderColor) saveField('borderColor', '');
                }
              }}
              disabled={!fields.textColor && !fields.borderColor}
              className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
                (!fields.textColor && !fields.borderColor)
                  ? 'text-charcoal-ink/20 cursor-default'
                  : 'text-cinematic-gold hover:text-cinematic-gold/80'
              }`}
            >
              Reset to auto
            </button>
          </div>

          {/* Text colour */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-charcoal-ink/50 flex items-center gap-1.5">
              Text Colour
              {fields.textColor ? (
                <span className="text-[9px] text-cinematic-gold uppercase">Manual</span>
              ) : (
                <span className="text-[9px] text-charcoal-ink/30 uppercase">Auto</span>
              )}
            </Label>
            <div className="flex items-center gap-3">
              <div
                className="relative w-9 h-9 rounded-md border border-charcoal-ink/10 overflow-hidden transition-colors shrink-0"
                style={{ backgroundColor: activeText }}
              >
                <input
                  type="color"
                  value={activeText}
                  onChange={(e) => saveField('textColor', e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Pick text colour"
                />
              </div>
              <span className="text-[11px] font-mono text-charcoal-ink/50">{activeText.toUpperCase()}</span>
              {!fields.textColor && (
                <span className="text-[10px] text-charcoal-ink/30 ml-auto">{autoText === '#E8E0D0' ? 'Warm White' : 'Charcoal'}</span>
              )}
            </div>
          </div>

          {/* Border colour */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-charcoal-ink/50 flex items-center gap-1.5">
              Border / Divider Colour
              {fields.borderColor ? (
                <span className="text-[9px] text-cinematic-gold uppercase">Manual</span>
              ) : (
                <span className="text-[9px] text-charcoal-ink/30 uppercase">Auto</span>
              )}
            </Label>
            <div className="flex items-center gap-3">
              <div
                className="relative w-9 h-9 rounded-md border border-charcoal-ink/10 overflow-hidden transition-colors shrink-0"
                style={{ backgroundColor: activeBorder }}
              >
                <input
                  type="color"
                  value={activeBorder}
                  onChange={(e) => saveField('borderColor', e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Pick border colour"
                />
              </div>
              <span className="text-[11px] font-mono text-charcoal-ink/50">{activeBorder.toUpperCase()}</span>
              {!fields.borderColor && (
                <span className="text-[10px] text-charcoal-ink/30 ml-auto">{autoBorder === '#3A3428' ? 'Warm Dark' : 'Champagne'}</span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Live Preview ─── */}
        <Separator className="bg-champagne-silk/40" />
        <div className="space-y-2">
          <Label className="text-[11px] text-charcoal-ink/40 uppercase tracking-wider">Preview</Label>
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: activeBorder + '40' }}
          >
            {/* Preview header */}
            <div
              className="flex items-center justify-between px-3 py-2 border-b"
              style={{
                backgroundColor: headerBg,
                borderBottomColor: activeBorder + '30',
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: fields.headerBackgroundColor ? getAutoTextColor(headerBg) : activeText }}>Header</span>
              <span className="text-[9px]" style={{ color: (fields.headerBackgroundColor ? getAutoTextColor(headerBg) : activeText) + '80' }}>Nav · Nav · Nav</span>
            </div>
            {/* Preview body */}
            <div className="px-3 py-3 space-y-2" style={{ backgroundColor: fields.backgroundColor }}>
              <div className="h-2 w-3/4 rounded-full" style={{ backgroundColor: activeText + '80' }} />
              <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: activeText + '25' }} />
              <div className="h-1.5 w-5/6 rounded-full" style={{ backgroundColor: activeText + '25' }} />
              <div className="flex gap-2 mt-2">
                <div className="h-5 w-14 rounded-md border" style={{ borderColor: activeText + '30', backgroundColor: 'transparent' }} />
                <div className="h-5 w-14 rounded-md border" style={{ borderColor: activeText + '30', backgroundColor: 'transparent' }} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}