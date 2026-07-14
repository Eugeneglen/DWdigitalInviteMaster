'use client';

import { useState } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import LegalDocumentModal from '@/components/wedding/LegalDocumentModal';
import ContactConciergeModal from '@/components/wedding/ContactConciergeModal';

export default function Footer() {
  const [dataProtectionOpen, setDataProtectionOpen] = useState(false);
  const [termsOfServiceOpen, setTermsOfServiceOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [contactConciergeOpen, setContactConciergeOpen] = useState(false);
  const { footerContent } = useSiteSettings();

  const footerLinkClass =
    'font-body-md text-body-md leading-body-md text-charcoal-ink/60 hover:text-cinematic-gold underline-offset-4 hover:underline transition-colors cursor-pointer';

  return (
    <>
      <footer data-wedding-chrome="" className="w-full py-20 border-t border-champagne-silk/10 pb-32 md:pb-20" style={{ backgroundColor: 'var(--wedding-footer-bg, #FCF9F2)', color: 'var(--wedding-chrome-text, #1A1A1A)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-canvas-margin flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <button
              className={footerLinkClass}
              onClick={() => setContactConciergeOpen(true)}
            >
              Contact Concierge
            </button>
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
            {footerContent.copyright}
          </p>
        </div>
      </footer>

      <ContactConciergeModal
        open={contactConciergeOpen}
        onOpenChange={setContactConciergeOpen}
      />

      <LegalDocumentModal
        open={privacyPolicyOpen}
        onOpenChange={setPrivacyPolicyOpen}
        title="Privacy Policy"
        content={footerContent.privacyPolicy}
      />

      <LegalDocumentModal
        open={dataProtectionOpen}
        onOpenChange={setDataProtectionOpen}
        title="Data Protection"
        content={footerContent.dataProtection}
      />

      <LegalDocumentModal
        open={termsOfServiceOpen}
        onOpenChange={setTermsOfServiceOpen}
        title="Terms of Service"
        content={footerContent.termsOfService}
      />
    </>
  );
}