'use client';

import { useState } from 'react';
import LegalDocumentModal from '@/components/wedding/LegalDocumentModal';
import { dataProtectionDocument, termsOfServiceDocument, privacyPolicyDocument } from '@/lib/legal-content';

export default function Footer() {
  const [dataProtectionOpen, setDataProtectionOpen] = useState(false);
  const [termsOfServiceOpen, setTermsOfServiceOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

  const footerLinkClass =
    'font-body-md text-body-md leading-body-md text-charcoal-ink/60 hover:text-cinematic-gold underline-offset-4 hover:underline transition-colors cursor-pointer';

  return (
    <>
      <footer className="w-full py-20 bg-paper-cream border-t border-champagne-silk/10 pb-32 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-canvas-margin flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <a
              className={footerLinkClass}
              href="mailto:concierge@dreamweavers.events"
            >
              Contact Concierge
            </a>
            <button
              className={footerLinkClass}
              onClick={() => setPrivacyPolicyOpen(true)}
            >
              Privacy Policy
            </button>
            <button
              className={footerLinkClass}
              onClick={() => setDataProtectionOpen(true)}
            >
              Data Protection
            </button>
            <button
              className={footerLinkClass}
              onClick={() => setTermsOfServiceOpen(true)}
            >
              Terms of Service
            </button>
          </div>

          <p className="font-label-sm text-label-sm leading-label-sm text-charcoal-ink/40 uppercase tracking-wider font-semibold">
            © 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved.
          </p>
        </div>
      </footer>

      <LegalDocumentModal
        open={privacyPolicyOpen}
        onOpenChange={setPrivacyPolicyOpen}
        document={privacyPolicyDocument}
      />

      <LegalDocumentModal
        open={dataProtectionOpen}
        onOpenChange={setDataProtectionOpen}
        document={dataProtectionDocument}
      />

      <LegalDocumentModal
        open={termsOfServiceOpen}
        onOpenChange={setTermsOfServiceOpen}
        document={termsOfServiceDocument}
      />
    </>
  );
}