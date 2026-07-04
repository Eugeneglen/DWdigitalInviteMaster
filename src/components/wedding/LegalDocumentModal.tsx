'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LegalDocument } from '@/lib/legal-content';

interface LegalDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: LegalDocument;
}

export default function LegalDocumentModal({
  open,
  onOpenChange,
  document,
}: LegalDocumentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[720px] max-h-[85vh] bg-paper-cream border-charcoal-ink/10 p-0 gap-0 overflow-hidden rounded-sm"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-charcoal-ink/8">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl md:text-[28px] leading-tight text-charcoal-ink text-left">
              {document.title}
            </DialogTitle>
            <DialogDescription className="font-body-sm text-body-sm leading-body-sm text-charcoal-ink/60 text-left mt-1">
              {document.subtitle}
            </DialogDescription>
            <p className="font-label-sm text-label-xs leading-label-sm text-charcoal-ink/40 mt-2 tracking-wide">
              {document.version}
            </p>
          </DialogHeader>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 p-1.5 rounded-full text-charcoal-ink/40 hover:text-charcoal-ink hover:bg-charcoal-ink/5 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 max-h-[calc(85vh-180px)]">
          <div className="px-8 py-8">
            {document.sections.map((section, idx) => (
              <div key={section.number} className={idx > 0 ? 'mt-6' : ''}>
                <h3 className="font-heading text-base md:text-lg text-charcoal-ink mb-3">
                  <span className="text-cinematic-gold mr-2">{section.number}.</span>
                  {section.title}
                </h3>
                <div className="font-body-sm text-body-sm leading-relaxed text-charcoal-ink/75">
                  {section.content}
                </div>
              </div>
            ))}

            {/* Draft disclaimer */}
            <div className="mt-10 p-4 bg-champagne-silk/20 border border-champagne-silk/30 rounded-sm">
              <p className="font-label-xs text-label-xs text-charcoal-ink/50 tracking-wide uppercase">
                DRAFT — FOR INTERNAL &amp; SINGAPORE LEGAL COUNSEL REVIEW. NOT FOR PUBLICATION.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}