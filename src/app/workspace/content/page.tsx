'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Home,
  Calendar,
  MailCheck,
  MapPin,
  BookOpen,
  Camera,
  Heart,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageInfo {
  slug: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PageMeta extends PageInfo {
  isPublished: boolean;
  publishedAt: string | null;
}

interface Block {
  id: string;
  key: string;
  type: string;
  value: string;
  meta: unknown;
  sortOrder: number;
}

interface Section {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  blocks: Block[];
}

interface PageContent {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt: string | null;
  sections: Section[];
}

// ─── Static Page List ───────────────────────────────────────────────────────

const PAGES: PageInfo[] = [
  { slug: 'home', title: 'Home', icon: Home },
  { slug: 'schedule', title: 'Schedule', icon: Calendar },
  { slug: 'rsvp', title: 'RSVP', icon: MailCheck },
  { slug: 'getting-there', title: 'Getting There', icon: MapPin },
  { slug: 'story', title: 'Our Story', icon: BookOpen },
  { slug: 'moments', title: 'Moments', icon: Camera },
  { slug: 'wishes', title: 'Wishes', icon: Heart },
  { slug: 'qa', title: 'Q&A', icon: HelpCircle },
];

// ─── Block Editors ──────────────────────────────────────────────────────────

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/50 font-[family-name:var(--font-inter)] block mb-1.5">
      {children}
    </label>
  );
}

function TextBlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      className="input-line font-[family-name:var(--font-inter)] text-[15px]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function RichTextBlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      rows={5}
      className="input-line font-[family-name:var(--font-inter)] text-[15px] resize-none min-h-[100px]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function ImageBlockEditor({
  value,
  onChange,
  onPreview,
}: {
  value: string;
  onChange: (v: string) => void;
  onPreview: (url: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <BlockLabel>Image URL</BlockLabel>
          <input
            type="text"
            className="input-line font-[family-name:var(--font-inter)] text-[15px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onPreview(value)}
            className="mt-5 shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-champagne-silk/40 hover:border-cinematic-gold/50 transition-colors cursor-pointer"
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </button>
        )}
      </div>
    </div>
  );
}

function GalleryBlockEditor({
  value,
  onChange,
  onPreview,
}: {
  value: string;
  onChange: (v: string) => void;
  onPreview: (url: string) => void;
}) {
  let items: { alt: string; url: string }[] = [];
  try {
    items = JSON.parse(value || '[]');
  } catch {
    items = [];
  }

  const handleChange = (newItems: { alt: string; url: string }[]) => {
    onChange(JSON.stringify(newItems));
  };

  const updateItem = (
    index: number,
    field: 'alt' | 'url',
    val: string
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    handleChange(updated);
  };

  const addItem = () => {
    handleChange([...items, { alt: '', url: '' }]);
  };

  const removeItem = (index: number) => {
    handleChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-2 p-3 rounded-lg bg-paper-cream/50 border border-champagne-silk/20"
        >
          <div className="flex-1 space-y-2">
            <input
              type="text"
              className="input-line font-[family-name:var(--font-inter)] text-sm"
              value={item.alt}
              onChange={(e) => updateItem(i, 'alt', e.target.value)}
              placeholder="Alt text"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input-line flex-1 font-[family-name:var(--font-inter)] text-sm"
                value={item.url}
                onChange={(e) => updateItem(i, 'url', e.target.value)}
                placeholder="Image URL"
              />
              {item.url && (
                <button
                  type="button"
                  onClick={() => onPreview(item.url)}
                  className="shrink-0 w-10 h-10 rounded overflow-hidden border border-champagne-silk/30 hover:border-cinematic-gold/50 transition-colors cursor-pointer"
                >
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="mt-1 shrink-0 p-1 rounded text-charcoal-ink/30 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm text-cinematic-gold hover:text-cinematic-gold/80 font-[family-name:var(--font-inter)] transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Image
      </button>
    </div>
  );
}

function TimelineItemBlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  let items: { time: string; title: string; description: string }[] = [];
  try {
    items = JSON.parse(value || '[]');
  } catch {
    items = [];
  }

  const handleChange = (
    newItems: { time: string; title: string; description: string }[]
  ) => {
    onChange(JSON.stringify(newItems));
  };

  const updateItem = (
    index: number,
    field: 'time' | 'title' | 'description',
    val: string
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    handleChange(updated);
  };

  const addItem = () => {
    handleChange([...items, { time: '', title: '', description: '' }]);
  };

  const removeItem = (index: number) => {
    handleChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-3 rounded-lg bg-paper-cream/50 border border-champagne-silk/20 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-[0.15em] uppercase text-charcoal-ink/35 font-[family-name:var(--font-inter)]">
              Item {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="p-1 rounded text-charcoal-ink/30 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            className="input-line font-[family-name:var(--font-inter)] text-sm"
            value={item.time}
            onChange={(e) => updateItem(i, 'time', e.target.value)}
            placeholder="Time (e.g. 2:00 PM)"
          />
          <input
            type="text"
            className="input-line font-[family-name:var(--font-inter)] text-sm"
            value={item.title}
            onChange={(e) => updateItem(i, 'title', e.target.value)}
            placeholder="Title"
          />
          <textarea
            rows={2}
            className="input-line font-[family-name:var(--font-inter)] text-sm resize-none"
            value={item.description}
            onChange={(e) => updateItem(i, 'description', e.target.value)}
            placeholder="Description"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm text-cinematic-gold hover:text-cinematic-gold/80 font-[family-name:var(--font-inter)] transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Timeline Item
      </button>
    </div>
  );
}

function FaqItemBlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  let items: { question: string; answer: string }[] = [];
  try {
    items = JSON.parse(value || '[]');
  } catch {
    items = [];
  }

  const handleChange = (newItems: { question: string; answer: string }[]) => {
    onChange(JSON.stringify(newItems));
  };

  const updateItem = (
    index: number,
    field: 'question' | 'answer',
    val: string
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    handleChange(updated);
  };

  const addItem = () => {
    handleChange([...items, { question: '', answer: '' }]);
  };

  const removeItem = (index: number) => {
    handleChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-3 rounded-lg bg-paper-cream/50 border border-champagne-silk/20 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-[0.15em] uppercase text-charcoal-ink/35 font-[family-name:var(--font-inter)]">
              FAQ {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="p-1 rounded text-charcoal-ink/30 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            className="input-line font-[family-name:var(--font-inter)] text-sm"
            value={item.question}
            onChange={(e) => updateItem(i, 'question', e.target.value)}
            placeholder="Question"
          />
          <textarea
            rows={3}
            className="input-line font-[family-name:var(--font-inter)] text-sm resize-none"
            value={item.answer}
            onChange={(e) => updateItem(i, 'answer', e.target.value)}
            placeholder="Answer"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm text-cinematic-gold hover:text-cinematic-gold/80 font-[family-name:var(--font-inter)] transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add FAQ
      </button>
    </div>
  );
}

function MapEmbedBlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        className="input-line font-[family-name:var(--font-inter)] text-[15px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Embed URL or iframe src"
      />
      {value && (
        <div className="rounded-lg overflow-hidden border border-champagne-silk/30 h-48">
          <iframe
            src={value}
            className="w-full h-full border-0"
            title="Map Preview"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

function VenueInfoBlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  let items: { name: string; description: string }[] = [];
  try {
    items = JSON.parse(value || '[]');
  } catch {
    items = [];
  }

  const handleChange = (newItems: { name: string; description: string }[]) => {
    onChange(JSON.stringify(newItems));
  };

  const updateItem = (
    index: number,
    field: 'name' | 'description',
    val: string
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    handleChange(updated);
  };

  const addItem = () => {
    handleChange([...items, { name: '', description: '' }]);
  };

  const removeItem = (index: number) => {
    handleChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-3 rounded-lg bg-paper-cream/50 border border-champagne-silk/20 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-[0.15em] uppercase text-charcoal-ink/35 font-[family-name:var(--font-inter)]">
              Venue {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="p-1 rounded text-charcoal-ink/30 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            className="input-line font-[family-name:var(--font-inter)] text-sm"
            value={item.name}
            onChange={(e) => updateItem(i, 'name', e.target.value)}
            placeholder="Venue name"
          />
          <textarea
            rows={2}
            className="input-line font-[family-name:var(--font-inter)] text-sm resize-none"
            value={item.description}
            onChange={(e) => updateItem(i, 'description', e.target.value)}
            placeholder="Description"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm text-cinematic-gold hover:text-cinematic-gold/80 font-[family-name:var(--font-inter)] transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Venue
      </button>
    </div>
  );
}

function DefaultBlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      rows={4}
      className="w-full rounded-lg border border-champagne-silk/30 bg-paper-cream/50 px-3 py-2 font-[family-name:var(--font-inter)] text-sm text-charcoal-ink resize-none focus:outline-none focus:ring-1 focus:ring-cinematic-gold/40 focus:border-cinematic-gold/40 transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ─── Block Router ────────────────────────────────────────────────────────────

function BlockEditor({
  block,
  value,
  onChange,
  onPreviewImage,
}: {
  block: Block;
  value: string;
  onChange: (v: string) => void;
  onPreviewImage: (url: string) => void;
}) {
  switch (block.type) {
    case 'text':
      return <TextBlockEditor value={value} onChange={onChange} />;
    case 'richtext':
      return <RichTextBlockEditor value={value} onChange={onChange} />;
    case 'image':
      return (
        <ImageBlockEditor
          value={value}
          onChange={onChange}
          onPreview={onPreviewImage}
        />
      );
    case 'gallery':
      return (
        <GalleryBlockEditor
          value={value}
          onChange={onChange}
          onPreview={onPreviewImage}
        />
      );
    case 'timeline-item':
      return <TimelineItemBlockEditor value={value} onChange={onChange} />;
    case 'faq-item':
      return <FaqItemBlockEditor value={value} onChange={onChange} />;
    case 'map-embed':
      return <MapEmbedBlockEditor value={value} onChange={onChange} />;
    case 'venue-info':
      return <VenueInfoBlockEditor value={value} onChange={onChange} />;
    default:
      return <DefaultBlockEditor value={value} onChange={onChange} />;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ContentEditorPage() {
  // Page list with metadata
  const [pageMetas, setPageMetas] = useState<PageMeta[]>([]);
  const [loadingMetas, setLoadingMetas] = useState(true);

  // Current page content
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  // Block editing state
  const [blockValues, setBlockValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>(
    {}
  );
  const [dirtyBlocks, setDirtyBlocks] = useState<Set<string>>(new Set());

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Save state
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Image preview modal
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Mobile nav drawer
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ── Fetch all page metadata on mount ──

  useEffect(() => {
    async function fetchMetas() {
      try {
        const results = await Promise.allSettled(
          PAGES.map(async (p) => {
            const res = await fetch(`/api/workspace/content/${p.slug}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.page as PageContent;
          })
        );

        const metas: PageMeta[] = PAGES.map((p, i) => ({
          slug: p.slug,
          title: p.title,
          icon: p.icon,
          isPublished:
            (results[i].status === 'fulfilled' && results[i].value
              ? results[i].value.isPublished
              : false) ?? false,
          publishedAt:
            results[i].status === 'fulfilled' && results[i].value
              ? results[i].value.publishedAt
              : null,
        }));

        setPageMetas(metas);
      } catch {
        // Silently fail — page list will be empty
      } finally {
        setLoadingMetas(false);
      }
    }

    fetchMetas();
  }, []);

  // ── Fetch page content when selected ──

  const loadPageContent = useCallback(async (slug: string) => {
    setPageLoading(true);
    setSelectedSlug(slug);
    setMobileNavOpen(false);

    try {
      const res = await fetch(`/api/workspace/content/${slug}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const page = data.page as PageContent;

      setPageContent(page);

      // Initialize block values
      const values: Record<string, string> = {};
      const originals: Record<string, string> = {};
      for (const section of page.sections) {
        for (const block of section.blocks) {
          values[block.id] = block.value;
          originals[block.id] = block.value;
        }
      }
      setBlockValues(values);
      setOriginalValues(originals);
      setDirtyBlocks(new Set());

      // Open all sections by default
      const sectionIds = new Set(page.sections.map((s) => s.id));
      setOpenSections(sectionIds);
    } catch {
      toast.error('Failed to load page content');
      setPageContent(null);
    } finally {
      setPageLoading(false);
    }
  }, []);

  // ── Auto-select first page after metas load ──

  useEffect(() => {
    if (!loadingMetas && pageMetas.length > 0 && !selectedSlug) {
      loadPageContent(pageMetas[0].slug);
    }
  }, [loadingMetas, pageMetas, selectedSlug, loadPageContent]);

  // ── Block value change handler ──

  const handleBlockChange = (blockId: string, value: string) => {
    setBlockValues((prev) => ({ ...prev, [blockId]: value }));
    setDirtyBlocks((prev) => {
      const next = new Set(prev);
      if (value !== originalValues[blockId]) {
        next.add(blockId);
      } else {
        next.delete(blockId);
      }
      return next;
    });
  };

  // ── Toggle section open/closed ──

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // ── Save ──

  const handleSave = async () => {
    if (!selectedSlug || dirtyBlocks.size === 0) return;

    setSaving(true);
    try {
      const blocks = Array.from(dirtyBlocks).map((id) => ({
        id,
        value: blockValues[id],
      }));

      const res = await fetch(`/api/workspace/content/${selectedSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });

      if (!res.ok) throw new Error('Save failed');

      const data = await res.json();

      // Update originals with the server response
      const newOriginals = { ...originalValues };
      for (const block of data.blocks as Block[]) {
        newOriginals[block.id] = block.value;
      }
      setOriginalValues(newOriginals);
      setDirtyBlocks(new Set());

      toast.success('Changes saved successfully');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ── Publish / Unpublish ──

  const handleTogglePublish = async () => {
    if (!selectedSlug || !pageContent) return;

    const newPublishState = !pageContent.isPublished;
    setPublishing(true);

    try {
      const res = await fetch('/api/workspace/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSlug: selectedSlug,
          publish: newPublishState,
        }),
      });

      if (!res.ok) throw new Error('Publish failed');

      const data = await res.json();
      const updatedPage = data.page as PageContent;

      setPageContent((prev) =>
        prev
          ? { ...prev, isPublished: updatedPage.isPublished, publishedAt: updatedPage.publishedAt }
          : null
      );

      // Update meta list
      setPageMetas((prev) =>
        prev.map((m) =>
          m.slug === selectedSlug
            ? { ...m, isPublished: updatedPage.isPublished, publishedAt: updatedPage.publishedAt }
            : m
        )
      );

      toast.success(
        newPublishState ? 'Page published' : 'Page unpublished'
      );
    } catch {
      toast.error('Failed to update publish status');
    } finally {
      setPublishing(false);
    }
  };

  // ── Derived state ──

  const dirtyCount = dirtyBlocks.size;
  const selectedPageMeta = pageMetas.find((m) => m.slug === selectedSlug);

  // ── Loading state ──

  if (loadingMetas) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-cinematic-gold animate-spin" />
      </div>
    );
  }

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-charcoal-ink tracking-tight">
            Content Editor
          </h1>
          <p className="mt-1 text-sm text-charcoal-ink/50 font-[family-name:var(--font-inter)]">
            Edit and manage your wedding page content.
          </p>
        </div>

        {/* Mobile page selector */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="border-champagne-silk/40 font-[family-name:var(--font-inter)]"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {selectedPageMeta?.title ?? 'Select Page'}
            </span>
          </Button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="flex gap-6">
        {/* Left Column — Page Navigation (hidden on mobile unless toggled) */}
        <aside
          className={`${
            mobileNavOpen ? 'flex' : 'hidden'
          } lg:flex flex-col w-[280px] shrink-0`}
        >
          <nav className="bg-white rounded-xl border border-champagne-silk/30 overflow-hidden">
            <div className="px-4 py-3 bg-paper-cream/50 border-b border-champagne-silk/20">
              <p className="text-[11px] tracking-[0.18em] uppercase text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
                Pages
              </p>
            </div>
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
              {pageMetas.map((page) => {
                const Icon = page.icon;
                const isActive = page.slug === selectedSlug;

                return (
                  <button
                    key={page.slug}
                    type="button"
                    onClick={() => loadPageContent(page.slug)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      transition-all duration-150 cursor-pointer
                      border-b border-champagne-silk/10 last:border-b-0
                      ${
                        isActive
                          ? 'bg-cinematic-gold/[0.07] border-l-2 border-l-cinematic-gold'
                          : 'hover:bg-paper-cream/60 border-l-2 border-l-transparent'
                      }
                    `}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-cinematic-gold'
                          : 'text-charcoal-ink/35'
                      }`}
                    />
                    <span
                      className={`text-sm font-[family-name:var(--font-inter)] truncate flex-1 ${
                        isActive
                          ? 'text-charcoal-ink font-medium'
                          : 'text-charcoal-ink/60'
                      }`}
                    >
                      {page.title}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        page.isPublished
                          ? 'bg-emerald-500'
                          : 'bg-charcoal-ink/15'
                      }`}
                      title={
                        page.isPublished
                          ? 'Published'
                          : 'Draft'
                      }
                    />
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Right Column — Block Editor */}
        <div className="flex-1 min-w-0">
          {pageLoading ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-champagne-silk/30">
              <Loader2 className="w-5 h-5 text-cinematic-gold animate-spin" />
            </div>
          ) : !pageContent ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-champagne-silk/30">
              <p className="text-sm text-charcoal-ink/40 font-[family-name:var(--font-inter)]">
                Select a page from the left to start editing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Page Title + Status */}
              <div className="bg-white rounded-xl border border-champagne-silk/30 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {selectedPageMeta && (
                      <div className="w-9 h-9 rounded-lg bg-cinematic-gold/8 flex items-center justify-center shrink-0">
                        <selectedPageMeta.icon className="w-4 h-4 text-cinematic-gold" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-charcoal-ink">
                        {pageContent.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] tracking-[0.1em] uppercase font-[family-name:var(--font-inter)] px-2 py-0 ${
                            pageContent.isPublished
                              ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50'
                              : 'border-champagne-silk/40 text-charcoal-ink/40 bg-paper-cream/50'
                          }`}
                        >
                          {pageContent.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        {pageContent.sections.length > 0 && (
                          <span className="text-[11px] text-charcoal-ink/30 font-[family-name:var(--font-inter)]">
                            {pageContent.sections.reduce(
                              (sum, s) => sum + s.blocks.length,
                              0
                            )}{' '}
                            blocks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {pageContent.sections.map((section) => {
                  const isOpen = openSections.has(section.id);
                  return (
                    <Collapsible
                      key={section.id}
                      open={isOpen}
                      onOpenChange={() => toggleSection(section.id)}
                    >
                      <div className="bg-white rounded-xl border border-champagne-silk/30 overflow-hidden">
                        <CollapsibleTrigger className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-paper-cream/40 transition-colors cursor-pointer">
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-cinematic-gold shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-charcoal-ink/30 shrink-0" />
                          )}
                          <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-charcoal-ink">
                            {section.title}
                          </span>
                          <span className="text-[11px] text-charcoal-ink/30 font-[family-name:var(--font-inter)] ml-auto">
                            {section.blocks.length} block
                            {section.blocks.length !== 1 ? 's' : ''}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-5 pb-5 space-y-5">
                            <Separator className="bg-champagne-silk/20" />
                            {section.blocks.map((block) => (
                              <div key={block.id} className="space-y-1.5">
                                <BlockLabel>
                                  {block.key.replace(/-/g, ' ')}
                                </BlockLabel>
                                <BlockEditor
                                  block={block}
                                  value={
                                    blockValues[block.id] ?? block.value
                                  }
                                  onChange={(v) =>
                                    handleBlockChange(block.id, v)
                                  }
                                  onPreviewImage={(url) =>
                                    setImagePreviewUrl(url)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="bg-white rounded-xl border border-champagne-silk/30 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={dirtyCount === 0 || saving}
                      className="bg-cinematic-gold text-white hover:bg-cinematic-gold/90 font-[family-name:var(--font-inter)]"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    {dirtyCount > 0 && (
                      <span className="text-[11px] text-cinematic-gold font-[family-name:var(--font-inter)]">
                        {dirtyCount} unsaved change
                        {dirtyCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleTogglePublish}
                    disabled={publishing}
                    className="border-champagne-silk/40 font-[family-name:var(--font-inter)] hover:bg-paper-cream/50"
                  >
                    {publishing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : pageContent.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {publishing
                      ? 'Updating...'
                      : pageContent.isPublished
                        ? 'Unpublish'
                        : 'Publish'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog
        open={!!imagePreviewUrl}
        onOpenChange={(open) => !open && setImagePreviewUrl(null)}
      >
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-black border-none">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of the selected image
          </DialogDescription>
          {imagePreviewUrl && (
            <img
              src={imagePreviewUrl}
              alt="Full preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}