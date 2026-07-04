'use client';

import React from 'react';

export interface LegalSection {
  number: string;
  title: string;
  content: React.ReactNode;
}

export interface LegalDocument {
  title: string;
  subtitle: string;
  version: string;
  sections: LegalSection[];
}

export const dataProtectionDocument: LegalDocument = {
  title: 'Data Protection & Information Security Statement',
  subtitle: 'DW Digital Invite CMS — Technical and Organisational Measures',
  version: 'Document version: 0.1 (Draft) | Prepared: 16 June 2026 | Applies to: DW Digital Invite CMS',
  sections: [
    {
      number: '1',
      title: 'Purpose',
      content: (
        <>
          <p>
            This Statement describes the technical and organisational measures Dreamweavers Pte. Ltd. applies to protect personal data and platform integrity in connection with DW Digital Invite CMS, in support of the Protection Obligation under the PDPA. It is intended to be read alongside our Privacy Policy.
          </p>
          <p className="mt-3 text-xs italic text-charcoal-ink/50">
            Drafting note: this Statement describes a target-state security posture appropriate for a SaaS platform handling guest personal data. Before publication, confirm against the platform&apos;s actual architecture, hosting provider, and any completed security assessments, so nothing described here is aspirational rather than factual.
          </p>
        </>
      ),
    },
    {
      number: '2',
      title: 'Encryption',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Data in transit between users and the Service is encrypted using industry-standard transport security (TLS).</li>
          <li>Data at rest, including guest lists, RSVP data, and uploaded media, is stored using encryption appropriate to its sensitivity.</li>
        </ul>
      ),
    },
    {
      number: '3',
      title: 'Access Controls',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Access to production systems and personal data is restricted to personnel who require it to perform their role, on a least-privilege basis.</li>
          <li>Administrative access is protected by strong authentication, and we encourage Organisers to use strong, unique passwords for their accounts.</li>
          <li>Where available, multi-factor authentication options should be offered for account login and especially for administrative or team-member access.</li>
        </ul>
      ),
    },
    {
      number: '4',
      title: 'Authentication',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>User accounts are protected by password-based authentication meeting defined complexity requirements.</li>
          <li>We monitor for patterns consistent with credential-stuffing or brute-force attempts and apply rate limiting and lockout controls as appropriate.</li>
        </ul>
      ),
    },
    {
      number: '5',
      title: 'Logging and Monitoring',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Key system and security events are logged to support detection of unauthorised access or unusual activity.</li>
          <li>Logs are reviewed and retained for a defined period consistent with operational and legal needs, and access to logs is itself restricted.</li>
        </ul>
      ),
    },
    {
      number: '6',
      title: 'Backup Practices',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Data is backed up on a regular schedule to support recovery in the event of data loss, system failure, or a security incident.</li>
          <li>Backup copies are protected with controls consistent with those applied to production data, and retained only for the period necessary to support recovery objectives.</li>
        </ul>
      ),
    },
    {
      number: '7',
      title: 'Incident Response',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>We maintain an incident response process to detect, assess, contain, and remediate security incidents.</li>
          <li>Where an incident involves a notifiable data breach under the PDPA&apos;s Data Breach Notification Obligation, we will assess the breach and, where required, notify the Personal Data Protection Commission of Singapore and affected individuals within the timeframes prescribed by law.</li>
          <li>Organisers will be notified of incidents affecting their account or Guest data without undue delay, so they can meet any notification obligations of their own.</li>
        </ul>
      ),
    },
    {
      number: '8',
      title: 'Vendor and Subprocessor Management',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Third-party vendors that process personal data on our behalf (such as hosting and email delivery providers) are assessed before onboarding and bound by contractual data protection obligations consistent with the PDPA.</li>
          <li>We maintain a record of subprocessors and review this periodically.</li>
        </ul>
      ),
    },
    {
      number: '9',
      title: 'Employee Access Restrictions',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Employee and contractor access to personal data is granted on a need-to-know basis and reviewed periodically.</li>
          <li>Personnel with access to personal data receive guidance on their data protection obligations as part of onboarding.</li>
          <li>Access is promptly revoked when no longer required, including upon role change or departure.</li>
        </ul>
      ),
    },
    {
      number: '10',
      title: 'Secure Software Development Practices',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Changes to the Service follow a defined development and review process, including code review before deployment to production.</li>
          <li>Security-relevant dependencies and components are monitored for known vulnerabilities, with patches applied within a risk-appropriate timeframe.</li>
          <li>Where reasonably practicable, security testing is performed before major releases.</li>
        </ul>
      ),
    },
    {
      number: '11',
      title: 'Updates to This Statement',
      content: (
        <p>We may update this Statement as our security practices evolve. Material changes will be reflected with an updated date.</p>
      ),
    },
    {
      number: '12',
      title: 'Contact',
      content: (
        <p>
          Security-related questions or reports of suspected vulnerabilities can be sent to{' '}
          <a href="mailto:privacy@dreamweavers.com.sg" className="text-cinematic-gold hover:underline underline-offset-2">
            privacy@dreamweavers.com.sg
          </a>{' '}
          or{' '}
          <a href="mailto:support@dwdigitalinvite.com" className="text-cinematic-gold hover:underline underline-offset-2">
            support@dwdigitalinvite.com
          </a>.
        </p>
      ),
    },
  ],
};

export const termsOfServiceDocument: LegalDocument = {
  title: 'Terms of Service',
  subtitle: 'DW Digital Invite CMS — Governing Terms of Use',
  version: 'Document version: 0.1 (Draft) | Prepared: 16 June 2026 | Applies to: DW Digital Invite CMS',
  sections: [
    {
      number: '1',
      title: 'Introduction and Acceptance',
      content: (
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern access to and use of DW Digital Invite CMS (the &ldquo;Service&rdquo;), provided by Dreamweavers Pte. Ltd. (&ldquo;DW Digital Invite,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo; or &ldquo;our&rdquo;). By creating an account, accessing, or using the Service, you agree to be bound by these Terms. If you do not agree, you must not use the Service.
        </p>
      ),
    },
    {
      number: '2',
      title: 'Eligibility and Account Registration',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account.</li>
          <li>You must provide accurate, current, and complete information when registering, and keep it up to date.</li>
          <li>You are responsible for safeguarding your account credentials and for all activity that occurs under your account.</li>
          <li>You must notify us promptly at <a href="mailto:support@dwdigitalinvite.com" className="text-cinematic-gold hover:underline underline-offset-2">support@dwdigitalinvite.com</a> if you suspect unauthorised use of your account.</li>
          <li>Where you create an account on behalf of a business, organisation, or wedding/event planning client, you confirm you have authority to bind that entity to these Terms.</li>
        </ul>
      ),
    },
    {
      number: '3',
      title: 'The Service',
      content: (
        <>
          <p>
            The Service allows you to create digital invitations, build event microsites, manage guest lists and RSVP responses, upload media, send automated reminders, and collaborate with team members through our content management system. The features available to you may depend on your subscription plan.
          </p>
          <p className="mt-3 text-xs italic text-charcoal-ink/50">
            Drafting note: confirm and list the specific tier names, feature limits (for example, number of events, guests, or storage), and any usage caps so this section reflects the actual product before publication.
          </p>
        </>
      ),
    },
    {
      number: '4',
      title: 'Subscription Plans and Billing',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>The Service is currently offered free of charge. We do not currently charge subscription fees, and no payment information is collected to create or use an account.</li>
          <li>If we introduce paid plans in future, we will provide clear notice of pricing, billing cycles, auto-renewal terms, and any applicable taxes before charging you, and these Terms will be updated together with a dedicated Refund &amp; Cancellation Policy describing billing and refund mechanics at that time.</li>
        </ul>
      ),
    },
    {
      number: '5',
      title: 'Acceptable Use',
      content: (
        <p>
          You agree to use the Service in accordance with our Acceptable Use Policy and Community Guidelines, which are incorporated into these Terms by reference. Without limiting those policies, you must not use the Service to create fraudulent, misleading, or unlawful event pages, or to collect Guest data without an appropriate lawful basis.
        </p>
      ),
    },
    {
      number: '6',
      title: 'User-Generated Content and Guest Data',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Your content.</strong> You retain ownership of text, images, logos, and other content you upload to create invitations or microsites (&ldquo;User Content&rdquo;), subject to the licence granted to us in Section 8.
          </li>
          <li>
            <strong>Accuracy of event details.</strong> You are solely responsible for the accuracy of event details, dates, locations, and instructions published through the Service. We are not responsible for losses arising from inaccurate or outdated event information you publish.
          </li>
          <li>
            <strong>Guest data you collect.</strong> Where you use the Service to collect Guest personal data (such as RSVP responses or dietary requirements), you act as the data controller for that data and are responsible for obtaining any necessary consents from your Guests and for complying with the PDPA and any other applicable data protection law. We process that data as your data intermediary, as further described in our Privacy Policy.
          </li>
        </ul>
      ),
    },
    {
      number: '7',
      title: 'Intellectual Property Ownership',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>The Service, including our software, templates, designs, branding, and underlying technology, is owned by Dreamweavers Pte. Ltd. or our licensors and is protected by intellectual property laws. These Terms do not transfer any ownership of the Service to you.</li>
          <li>Templates and design elements we provide may be customised by you for your own event use but remain our intellectual property; resale, redistribution, or sublicensing of unmodified templates outside the Service is not permitted.</li>
          <li>Further detail is set out in our Intellectual Property Policy.</li>
        </ul>
      ),
    },
    {
      number: '8',
      title: 'Licence You Grant to Us',
      content: (
        <p>
          By uploading User Content, you grant us a non-exclusive, worldwide, royalty-free licence to host, store, reproduce, and display that content solely as necessary to operate, maintain, and provide the Service to you and the Guests you invite (for example, displaying your uploaded photo on your invitation page). This licence ends when you delete the relevant content or close your account, subject to residual copies retained in backups for a limited period as described in our Data Protection &amp; Information Security Statement.
        </p>
      ),
    },
    {
      number: '9',
      title: 'Service Availability',
      content: (
        <p>
          We aim to keep the Service available and reliable, but we do not guarantee uninterrupted or error-free operation. The Service may be temporarily unavailable for maintenance, updates, or due to factors outside our reasonable control. We will use reasonable efforts to provide advance notice of planned maintenance where practical.
        </p>
      ),
    },
    {
      number: '10',
      title: 'Platform Limitations',
      content: (
        <p>
          Free accounts may be subject to limits on the number of events, guests, storage, or other usage parameters, which we may modify from time to time. We may also impose reasonable rate limits to protect the stability and security of the Service for all users.
        </p>
      ),
    },
    {
      number: '11',
      title: 'Suspension and Termination',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>You may close your account at any time through your account settings or by contacting <a href="mailto:support@dwdigitalinvite.com" className="text-cinematic-gold hover:underline underline-offset-2">support@dwdigitalinvite.com</a>.</li>
          <li>We may suspend or terminate your account if you breach these Terms, the Acceptable Use Policy, or Community Guidelines, or if required to do so by law.</li>
          <li>Where reasonably possible, we will provide notice before suspension or termination and an opportunity to remedy minor breaches, except where immediate action is necessary to protect the Service, other users, or third parties.</li>
          <li>On termination, your right to use the Service ends, and we may delete your User Content and account data in accordance with our retention practices, except where we are required to retain certain data by law.</li>
        </ul>
      ),
    },
    {
      number: '12',
      title: 'Disclaimers',
      content: (
        <p>
          The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the maximum extent permitted by law, we disclaim all warranties, whether express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, secure, or free of errors, or that any AI-related features (if introduced in future) will be free of inaccuracies.
        </p>
      ),
    },
    {
      number: '13',
      title: 'Limitation of Liability',
      content: (
        <>
          <p>To the maximum extent permitted by law:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Our aggregate liability arising out of or relating to these Terms or the Service will not exceed the greater of (a) the amount you paid us in the twelve months preceding the claim, or (b) a nominal amount to be agreed, given the Service is currently free; and</li>
            <li>We will not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, or for losses arising from inaccurate event details, Guest data you collect, or third-party services you choose to integrate.</li>
          </ul>
          <p className="mt-3 text-xs italic text-charcoal-ink/50">
            Drafting note: Singapore courts will scrutinise liability caps and exclusions for reasonableness, particularly under the Unfair Contract Terms Act 1977 where it applies to consumer contracts. Counsel should confirm enforceability of these provisions, especially while the Service is free of charge.
          </p>
        </>
      ),
    },
    {
      number: '14',
      title: 'Indemnification',
      content: (
        <p>
          You agree to indemnify and hold us harmless from claims, losses, and expenses (including reasonable legal fees) arising from your breach of these Terms, your User Content, your collection or use of Guest data, or your violation of any law or third-party right.
        </p>
      ),
    },
    {
      number: '15',
      title: 'Third-Party Services',
      content: (
        <p>
          The Service may allow integration with third-party tools (for example, messaging platforms used to share invitations). We are not responsible for the practices or availability of third-party services, which are governed by their own terms and privacy policies.
        </p>
      ),
    },
    {
      number: '16',
      title: 'Governing Law and Dispute Resolution',
      content: (
        <p>
          These Terms are governed by the laws of the Republic of Singapore, without regard to conflict-of-law principles. The parties will first attempt to resolve any dispute informally by contacting <a href="mailto:support@dwdigitalinvite.com" className="text-cinematic-gold hover:underline underline-offset-2">support@dwdigitalinvite.com</a>. If a dispute cannot be resolved informally within a reasonable period, it will be subject to the exclusive jurisdiction of the courts of Singapore, unless the parties agree in writing to refer the matter to mediation or arbitration in Singapore.
        </p>
      ),
    },
    {
      number: '17',
      title: 'Changes to These Terms',
      content: (
        <p>
          We may update these Terms from time to time. We will post the updated Terms with a new effective date, and for material changes we will provide additional notice such as an in-app notification or email. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
        </p>
      ),
    },
    {
      number: '18',
      title: 'Contact',
      content: (
        <p>
          Questions about these Terms can be sent to{' '}
          <a href="mailto:support@dwdigitalinvite.com" className="text-cinematic-gold hover:underline underline-offset-2">support@dwdigitalinvite.com</a>{' '}
          or{' '}
          <a href="mailto:enquiry@dreamweavers.com.sg" className="text-cinematic-gold hover:underline underline-offset-2">enquiry@dreamweavers.com.sg</a>, or by post to Tahir Building, Level 4, 140 Robinson Road, Singapore 068907.
        </p>
      ),
    },
  ],
};