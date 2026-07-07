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

interface LegalDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

export default function LegalDocumentModal({
  open,
  onOpenChange,
  title,
  content,
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
              {title}
            </DialogTitle>
            <DialogDescription className="font-body-sm text-body-sm leading-body-sm text-charcoal-ink/60 text-left mt-1">
              Dreamweavers Pte. Ltd.
            </DialogDescription>
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
            <div className="font-body-sm text-body-sm leading-relaxed text-charcoal-ink/75 whitespace-pre-wrap">
              {content}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}