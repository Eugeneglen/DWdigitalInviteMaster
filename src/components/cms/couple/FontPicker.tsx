'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CONTENT_API = '/api/cms/content?XTransformPort=3000';

const FONT_OPTIONS = [
  { value: 'Playfair Display', category: 'serif' },
  { value: 'Cormorant Garamond', category: 'serif' },
  { value: 'Lora', category: 'serif' },
  { value: 'Montserrat', category: 'sans-serif' },
  { value: 'Raleway', category: 'sans-serif' },
  { value: 'Lato', category: 'sans-serif' },
  { value: 'Great Vibes', category: 'cursive' },
  { value: 'Dancing Script', category: 'cursive' },
  { value: 'Josefin Sans', category: 'sans-serif' },
] as const;

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
      <CardContent className="p-4">
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
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value, fallback: font.category }}>
                      {font.value}
                    </span>
                  </SelectItem>
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
      </CardContent>
    </Card>
  );
}