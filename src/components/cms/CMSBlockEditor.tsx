'use client';

import { useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { WorkspaceBlock, BlockType } from '@/types/content';

interface CMSBlockEditorProps {
  block: WorkspaceBlock;
  onChange: (value: string) => void;
}

const TYPE_BADGE_COLORS: Record<BlockType, string> = {
  text: 'bg-champagne-silk text-charcoal-ink',
  richtext: 'bg-champagne-silk text-charcoal-ink',
  image: 'bg-emerald-100 text-emerald-800',
  gallery: 'bg-violet-100 text-violet-800',
  'timeline-item': 'bg-amber-100 text-amber-800',
  'faq-item': 'bg-sky-100 text-sky-800',
  'venue-info': 'bg-rose-100 text-rose-800',
  'map-embed': 'bg-teal-100 text-teal-800',
};

const TYPE_LABELS: Record<BlockType, string> = {
  text: 'Text',
  richtext: 'Rich Text',
  image: 'Image',
  gallery: 'Gallery',
  'timeline-item': 'Timeline',
  'faq-item': 'FAQ',
  'venue-info': 'Venue',
  'map-embed': 'Map',
};

/** Try to parse JSON safely, return null on failure */
function tryParseJSON(str: string): Record<string, string> | null {
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Text block: simple single-line input */
function TextEditor({ block, onChange }: CMSBlockEditorProps) {
  return <Input value={block.value} onChange={(e) => onChange(e.target.value)} className="font-[family-name:var(--font-inter)]" />;
}

/** Rich text block: textarea */
function RichTextEditor({ block, onChange }: CMSBlockEditorProps) {
  return (
    <Textarea
      value={block.value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="font-[family-name:var(--font-inter)] min-h-[100px] resize-y"
    />
  );
}

/** Image block: URL input + preview */
function ImageEditor({ block, onChange }: CMSBlockEditorProps) {
  const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(block.value);

  return (
    <div className="space-y-2">
      <Input
        value={block.value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className="font-[family-name:var(--font-inter)]"
      />
      {isImageUrl && block.value && (
        <div className="relative h-32 w-full overflow-hidden rounded-md border border-border bg-muted">
          <img
            src={block.value}
            alt={block.key}
            className="h-full w-full object-cover"
            aria-label={`Preview for ${block.key}`}
          />
        </div>
      )}
    </div>
  );
}

/** Gallery block: JSON textarea */
function GalleryEditor({ block, onChange }: CMSBlockEditorProps) {
  return (
    <div className="space-y-1">
      <Textarea
        value={block.value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder='[{"url": "...", "alt": "..."}]'
        className="font-[family-name:var(--font-inter)] font-mono text-sm min-h-[100px] resize-y"
      />
      <p className="text-[11px] text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
        JSON array of image objects
      </p>
    </div>
  );
}

/** Timeline item: time + description side by side */
function TimelineItemEditor({ block, onChange }: CMSBlockEditorProps) {
  const parsed = useMemo(() => tryParseJSON(block.value), [block.value]);
  const time = parsed?.time ?? '';
  const description = parsed?.description ?? '';

  const handleChange = useCallback(
    (field: 'time' | 'description', val: string) => {
      const current = tryParseJSON(block.value) ?? {};
      onChange(JSON.stringify({ ...current, [field]: val }));
    },
    [block.value, onChange],
  );

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr]">
      <Input
        value={time}
        onChange={(e) => handleChange('time', e.target.value)}
        placeholder="14:00"
        className="font-[family-name:var(--font-inter)]"
      />
      <Input
        value={description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Ceremony begins"
        className="font-[family-name:var(--font-inter)]"
      />
    </div>
  );
}

/** FAQ item: question + answer stacked */
function FaqItemEditor({ block, onChange }: CMSBlockEditorProps) {
  const parsed = useMemo(() => tryParseJSON(block.value), [block.value]);
  const question = parsed?.question ?? '';
  const answer = parsed?.answer ?? '';

  const handleChange = useCallback(
    (field: 'question' | 'answer', val: string) => {
      const current = tryParseJSON(block.value) ?? {};
      onChange(JSON.stringify({ ...current, [field]: val }));
    },
    [block.value, onChange],
  );

  return (
    <div className="space-y-2">
      <Input
        value={question}
        onChange={(e) => handleChange('question', e.target.value)}
        placeholder="Question"
        className="font-[family-name:var(--font-inter)]"
      />
      <Input
        value={answer}
        onChange={(e) => handleChange('answer', e.target.value)}
        placeholder="Answer"
        className="font-[family-name:var(--font-inter)]"
      />
    </div>
  );
}

/** Venue info: name, address, phone, url stacked */
function VenueInfoEditor({ block, onChange }: CMSBlockEditorProps) {
  const parsed = useMemo(() => tryParseJSON(block.value), [block.value]);
  const name = parsed?.name ?? '';
  const address = parsed?.address ?? '';
  const phone = parsed?.phone ?? '';
  const url = parsed?.url ?? '';

  const handleChange = useCallback(
    (field: 'name' | 'address' | 'phone' | 'url', val: string) => {
      const current = tryParseJSON(block.value) ?? {};
      onChange(JSON.stringify({ ...current, [field]: val }));
    },
    [block.value, onChange],
  );

  return (
    <div className="space-y-2">
      <Input
        value={name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Venue name"
        className="font-[family-name:var(--font-inter)]"
      />
      <Input
        value={address}
        onChange={(e) => handleChange('address', e.target.value)}
        placeholder="Address"
        className="font-[family-name:var(--font-inter)]"
      />
      <Input
        value={phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        placeholder="Phone"
        className="font-[family-name:var(--font-inter)]"
      />
      <Input
        value={url}
        onChange={(e) => handleChange('url', e.target.value)}
        placeholder="https://..."
        className="font-[family-name:var(--font-inter)]"
      />
    </div>
  );
}

/** Map embed: textarea for embed code/URL */
function MapEmbedEditor({ block, onChange }: CMSBlockEditorProps) {
  return (
    <Textarea
      value={block.value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder="Paste embed code or map URL"
      className="font-[family-name:var(--font-inter)] font-mono text-sm min-h-[80px] resize-y"
    />
  );
}

const EDITORS: Record<BlockType, React.ComponentType<CMSBlockEditorProps>> = {
  text: TextEditor,
  richtext: RichTextEditor,
  image: ImageEditor,
  gallery: GalleryEditor,
  'timeline-item': TimelineItemEditor,
  'faq-item': FaqItemEditor,
  'venue-info': VenueInfoEditor,
  'map-embed': MapEmbedEditor,
};

export function CMSBlockEditor({ block, onChange }: CMSBlockEditorProps) {
  const Editor = EDITORS[block.type];

  return (
    <div className="w-full space-y-1.5">
      <span className="block text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/50 font-[family-name:var(--font-inter)]">
        {block.key}
      </span>
      <Editor block={block} onChange={onChange} />
    </div>
  );
}

export { TYPE_BADGE_COLORS, TYPE_LABELS };