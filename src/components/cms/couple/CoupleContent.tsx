'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Save, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { invalidateWeddingCache } from '@/hooks/usePublicWedding';

const API_BASE = '/api/cms/content?XTransformPort=3000';

interface ContentItem {
  id: string;
  section: string;
  fieldKey: string;
  fieldValue: string;
  fieldType: string;
}

interface SectionConfig {
  key: string;
  label: string;
  description: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'url'; placeholder: string }[];
}

const SECTIONS: SectionConfig[] = [
  // Note: Hero, Schedule, Story, Moments, and Getting There section text
  // fields are edited directly in their respective CMS pages (CoupleHome,
  // CoupleSchedule, CoupleStory, CoupleMoments, CoupleGettingThere) where
  // they're contextual. This page manages the remaining text-only sections.
  {
    key: 'rsvp',
    label: 'RSVP Section',
    description: 'Text displayed on the RSVP form',
    fields: [
      { key: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g. RSVP' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'text', placeholder: 'e.g. Kindly respond by 1st November 2027' },
      { key: 'deadline', label: 'RSVP Deadline', type: 'text', placeholder: 'e.g. 2027-11-01' },
      { key: 'thankYouMessage', label: 'Thank You Message', type: 'textarea', placeholder: 'Message shown after RSVP submission...' },
      { key: 'declinedMessage', label: 'Declined Message', type: 'textarea', placeholder: 'Message shown when guest declines...' },
      { key: 'ceremonyName', label: 'Ceremony Name', type: 'text', placeholder: 'e.g. Wedding Solemnisation, Wedding Reception' },
      { key: 'optYes', label: '"Yes" Option Label', type: 'text', placeholder: 'e.g. Yes!' },
      { key: 'optPartial', label: '"Partial" Option Label', type: 'text', placeholder: "e.g. Yes, but I won't be staying for the reception" },
      { key: 'optNo', label: '"No" Option Label', type: 'text', placeholder: "e.g. I'm sorry, I won't be able to make it" },
      { key: 'dietaryOptions', label: 'Dietary Options', type: 'text', placeholder: 'Comma-separated: Halal, Vegetarian, No Seafood, Vegan' },
      { key: 'step0Title', label: 'Step 1 Title', type: 'text', placeholder: 'e.g. Enter your name to RSVP' },
      { key: 'step0Subtext', label: 'Step 1 Subtitle', type: 'text', placeholder: 'e.g. You can respond for more guests in the following steps.' },
      { key: 'step1Title', label: 'Step 2 Title', type: 'text', placeholder: 'e.g. How many people are in your party?' },
      { key: 'step2Title', label: 'Step 3 Title', type: 'text', placeholder: 'e.g. Confirm each guest and their dietary needs.' },
      { key: 'step2Subtext', label: 'Step 3 Subtitle', type: 'text', placeholder: 'e.g. Dietary selections are optional.' },
      { key: 'resultThankYou', label: 'Thank You Title', type: 'text', placeholder: 'e.g. Thank you' },
      { key: 'resultWeMissYou', label: 'Declined Title', type: 'text', placeholder: "e.g. We'll Miss You" },
    ],
  },
  {
    key: 'wishes',
    label: 'Wishes & Blessings',
    description: 'Wishes section header and form labels',
    fields: [
      { key: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g. Wishes & Blessings' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'text', placeholder: 'e.g. Leave your heartfelt message for the couple' },
      { key: 'nameLabel', label: 'Name Field Label', type: 'text', placeholder: 'e.g. Your Name' },
      { key: 'messageLabel', label: 'Message Field Label', type: 'text', placeholder: 'e.g. Your Message' },
      { key: 'relationshipLabel', label: 'Relationship Field Label', type: 'text', placeholder: 'e.g. Your Relationship to the Couple' },
      { key: 'submitLabel', label: 'Submit Button Label', type: 'text', placeholder: 'e.g. Weave into Archive' },
      { key: 'heirloomLabel', label: 'Section Label (Eyebrow)', type: 'text', placeholder: 'e.g. The Living Heirloom' },
      { key: 'formEyebrow', label: 'Form Section Eyebrow', type: 'text', placeholder: 'e.g. YOUR TURN' },
      { key: 'formHeading', label: 'Form Section Heading', type: 'text', placeholder: 'e.g. Contribute to the Heirloom' },
    ],
  },
  {
    key: 'qa',
    label: 'Questions & Answers',
    description: 'Q&A section header text',
    fields: [
      { key: 'title', label: 'Section Title', type: 'text', placeholder: 'e.g. Questions & Answers' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'text', placeholder: 'e.g. Everything you need to know' },
      { key: 'contactPrompt', label: 'Contact Prompt', type: 'text', placeholder: 'e.g. Still have questions? Message the couple' },
      { key: 'contactEmail', label: 'Contact Email', type: 'text', placeholder: 'e.g. concierge@example.com' },
      { key: 'ctaEyebrow', label: 'CTA Eyebrow Text', type: 'text', placeholder: 'e.g. NEED MORE HELP?' },
      { key: 'ctaDescription', label: 'CTA Description', type: 'textarea', placeholder: 'Description text below the CTA heading...' },
      { key: 'ctaButtonLabel', label: 'CTA Button Label', type: 'text', placeholder: 'e.g. Message the Couple' },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    description: 'Footer text and contact information',
    fields: [
      { key: 'contactLabel', label: 'Contact Label', type: 'text', placeholder: 'e.g. Contact Concierge' },
      { key: 'copyright', label: 'Copyright Text', type: 'text', placeholder: 'e.g. © 2027 Eleanor & James' },
    ],
  },
];

export default function CoupleContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hero']));
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to load content');
      const data = await res.json();
      setContent(data.content ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load content', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getFieldValue = (section: string, fieldKey: string): string => {
    const edited = editedFields[`${section}/${fieldKey}`];
    if (edited !== undefined) return edited;

    const item = content.find((c) => c.section === section && c.fieldKey === fieldKey);
    return item?.fieldValue ?? '';
  };

  const setFieldValue = (section: string, fieldKey: string, value: string) => {
    setEditedFields((prev) => ({
      ...prev,
      [`${section}/${fieldKey}`]: value,
    }));
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Build items array from edited fields
      const items = Object.entries(editedFields).map(([key, fieldValue]) => {
        const [section, fieldKey] = key.split('/');
        return { section, fieldKey, fieldValue };
      });

      if (items.length === 0) {
        toast({ title: 'No changes', description: 'No changes to save' });
        return;
      }

      const res = await fetch(API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save content');
      }

      // Update local content state
      const data = await res.json();
      const savedContent = data.content ?? [];
      setContent((prev) => {
        const updated = [...prev];
        for (const item of savedContent) {
          const idx = updated.findIndex(
            (c) => c.section === item.section && c.fieldKey === item.fieldKey
          );
          if (idx >= 0) {
            updated[idx] = item;
          } else {
            updated.push(item);
          }
        }
        return updated;
      });

      setEditedFields({});
      invalidateWeddingCache();
      toast({ title: 'Success', description: 'Content saved successfully' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save content', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(editedFields).length > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-cinematic-gold" />
        <p className="text-sm text-charcoal-ink/50 font-medium">Loading content…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-ink">Content Editor</h2>
          <p className="text-sm text-charcoal-ink/50 mt-1">
            Edit the text content for each section of your invitation.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="bg-cinematic-gold text-charcoal-ink hover:bg-cinematic-gold/90 rounded px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 shrink-0 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1.5" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4 mr-1.5" />
              Save{hasChanges ? ` (${Object.keys(editedFields).length})` : ''}
            </>
          )}
        </Button>
      </div>

      <Separator className="bg-champagne-silk" />

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const isExpanded = expandedSections.has(section.key);
          const hasSectionChanges = section.fields.some(
            (f) => editedFields[`${section.key}/${f.key}`] !== undefined
          );

          return (
            <Card
              key={section.key}
              className={`border-charcoal-ink/5 shadow-none transition-colors duration-200 ${
                hasSectionChanges ? 'border-cinematic-gold/40 bg-cinematic-gold/[0.02]' : ''
              }`}
            >
              <CardHeader
                className="pb-3 cursor-pointer select-none"
                onClick={() => toggleSection(section.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-cinematic-gold/10 text-cinematic-gold shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-charcoal-ink flex items-center gap-2">
                        {section.label}
                        {hasSectionChanges && (
                          <span className="inline-flex h-2 w-2 rounded-full bg-cinematic-gold" />
                        )}
                      </CardTitle>
                      <p className="text-xs text-charcoal-ink/40 mt-0.5">{section.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-charcoal-ink/30" />
                  ) : (
                    <ChevronRight className="size-4 text-charcoal-ink/30" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {section.fields.map((field) => {
                    const value = getFieldValue(section.key, field.key);
                    const isChanged = editedFields[`${section.key}/${field.key}`] !== undefined;

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label
                          htmlFor={`content-${section.key}-${field.key}`}
                          className="text-sm font-medium text-charcoal-ink/70 flex items-center gap-1.5"
                        >
                          {field.label}
                          {isChanged && (
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-cinematic-gold" />
                          )}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            id={`content-${section.key}-${field.key}`}
                            value={value}
                            onChange={(e) => setFieldValue(section.key, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className={`border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20 resize-none ${
                              isChanged ? 'border-cinematic-gold/50' : ''
                            }`}
                          />
                        ) : (
                          <Input
                            id={`content-${section.key}-${field.key}`}
                            type={field.type === 'url' ? 'url' : 'text'}
                            value={value}
                            onChange={(e) => setFieldValue(section.key, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className={`border-charcoal-ink/10 focus:border-cinematic-gold focus:ring-cinematic-gold/20 ${
                              isChanged ? 'border-cinematic-gold/50' : ''
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}