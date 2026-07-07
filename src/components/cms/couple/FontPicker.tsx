'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CONTENT_API = '/api/cms/content?XTransformPort=3000';

interface FontOption {
  value: string;
  category: string;
  preview: string;
}

const FONT_OPTIONS: FontOption[] = [
  // ── Elegant Serif ────────────────────────────────────────
  { value: 'Playfair Display', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'Cormorant Garamond', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'EB Garamond', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'Lora', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'Spectral', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'Libre Baskerville', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'Merriweather', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'DM Serif Display', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'Bodoni Moda', category: 'Elegant Serif', preview: 'Eleanor & James' },
  { value: 'Philosopher', category: 'Elegant Serif', preview: 'Eleanor & James' },
  // ── Display Serif ────────────────────────────────────────
  { value: 'Cinzel', category: 'Display Serif', preview: 'Eleanor & James' },
  { value: 'Cinzel Decorative', category: 'Display Serif', preview: 'Eleanor & James' },
  { value: 'Prata', category: 'Display Serif', preview: 'Eleanor & James' },
  { value: 'Italiana', category: 'Display Serif', preview: 'Eleanor & James' },
  { value: 'Arizonia', category: 'Display Serif', preview: 'Eleanor & James' },
  // ── Modern Sans ─────────────────────────────────────────
  { value: 'Montserrat', category: 'Modern Sans', preview: 'Eleanor & James' },
  { value: 'Raleway', category: 'Modern Sans', preview: 'Eleanor & James' },
  { value: 'Poppins', category: 'Modern Sans', preview: 'Eleanor & James' },
  { value: 'Lato', category: 'Modern Sans', preview: 'Eleanor & James' },
  { value: 'Quicksand', category: 'Modern Sans', preview: 'Eleanor & James' },
  { value: 'Nunito', category: 'Modern Sans', preview: 'Eleanor & James' },
  { value: 'Work Sans', category: 'Modern Sans', preview: 'Eleanor & James' },
  { value: 'Josefin Sans', category: 'Modern Sans', preview: 'Eleanor & James' },
  // ── Script & Calligraphy ─────────────────────────────────
  { value: 'Great Vibes', category: 'Script & Calligraphy', preview: 'Eleanor & James' },
  { value: 'Alex Brush', category: 'Script & Calligraphy', preview: 'Eleanor & James' },
  { value: 'Allura', category: 'Script & Calligraphy', preview: 'Eleanor & James' },
  { value: 'Parisienne', category: 'Script & Calligraphy', preview: 'Eleanor & James' },
  { value: 'Tangerine', category: 'Script & Calligraphy', preview: 'Eleanor & James' },
  { value: 'Sacramento', category: 'Script & Calligraphy', preview: 'Eleanor & James' },
  { value: 'Petit Formal Script', category: 'Script & Calligraphy', preview: 'Eleanor & James' },
  { value: 'Cookie', category: 'Script & Calligraphy', preview: 'Eleanor & James' },
  // ── Handwritten ─────────────────────────────────────────
  { value: 'Dancing Script', category: 'Handwritten', preview: 'Eleanor & James' },
  { value: 'Kaushan Script', category: 'Handwritten', preview: 'Eleanor & James' },
  { value: 'Caveat', category: 'Handwritten', preview: 'Eleanor & James' },
  { value: 'Amatic SC', category: 'Handwritten', preview: 'Eleanor & James' },
  { value: 'Satisfy', category: 'Handwritten', preview: 'Eleanor & James' },
  { value: 'Pacifico', category: 'Handwritten', preview: 'Eleanor & James' },
  { value: 'Lobster', category: 'Handwritten', preview: 'Eleanor & James' },
  { value: 'Yellowtail', category: 'Handwritten', preview: 'Eleanor & James' },
];

const FONT_CATEGORIES = [...new Set(FONT_OPTIONS.map((f) => f.category))];

const DEFAULT_FONT = 'Playfair Display';

interface FontPickerProps {
  section: string;
}

export default function FontPicker({ section }: FontPickerProps) {
  const [selectedFont, setSelectedFont] = useState<string>(DEFAULT_FONT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch current font for this section on mount
  useEffect(() => {
    async function fetchFont() {
      try {
        setLoading(true);
        const res = await fetch(`${CONTENT_API}&section=${encodeURIComponent(section)}`);
        if (!res.ok) throw new Error('Failed to load font');
        const data = await res.json();
        const fontItem = (data.content ?? []).find(
          (item: { fieldKey: string; fieldValue: string }) => item.fieldKey === 'fontFamily'
        );
        if (fontItem?.fieldValue) {
          setSelectedFont(fontItem.fieldValue);
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load section font',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchFont();
  }, [section]);

  const handleChange = async (value: string) => {
    setSelectedFont(value);
    setSaving(true);
    try {
      const res = await fetch(CONTENT_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              section,
              fieldKey: 'fontFamily',
              fieldValue: value,
              fieldType: 'TEXT',
            },
          ],
        }),
      });
      if (!res.ok) throw new Error('Failed to save font');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save font selection',
        variant: 'destructive',
      });
      // Revert to previous selection on error
      setSelectedFont(DEFAULT_FONT);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-charcoal-ink/5 shadow-none">
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2.5">
          <Label className="text-xs font-medium text-charcoal-ink/50 uppercase tracking-wider">
            Section Font
          </Label>
          <div className="relative">
            <Select
              value={selectedFont}
              onValueChange={handleChange}
              disabled={loading || saving}
            >
              <SelectTrigger className="border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-3.5 animate-spin text-cinematic-gold" />
                    Saving…
                  </span>
                ) : (
                  <SelectValue placeholder="Select font…" />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-[340px]">
                {FONT_CATEGORIES.map((category) => (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-[11px] text-cinematic-gold/80 font-semibold uppercase tracking-wider">
                      {category}
                    </SelectLabel>
                    {FONT_OPTIONS.filter((f) => f.category === category).map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span className="flex items-center justify-between gap-6 w-full">
                          <span className="truncate">{font.value}</span>
                          <span
                            className="text-charcoal-ink/60 text-sm shrink-0"
                            style={{ fontFamily: `'${font.value}', serif` }}
                          >
                            {font.preview}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {loading && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <Loader2 className="size-3.5 animate-spin text-charcoal-ink/30" />
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        {!loading && (
          <div className="border-t border-champagne-silk/40 pt-3">
            <p className="text-[11px] text-charcoal-ink/40 uppercase tracking-wider mb-2 font-medium">Preview</p>
            <p
              className="text-2xl text-charcoal-ink leading-relaxed"
              style={{ fontFamily: `'${selectedFont}', serif` }}
            >
              Eleanor & James
            </p>
            <p
              className="text-sm text-charcoal-ink/50 mt-1 italic leading-relaxed"
              style={{ fontFamily: `'${selectedFont}', serif` }}
            >
              Together with their families, request the pleasure of your company
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}