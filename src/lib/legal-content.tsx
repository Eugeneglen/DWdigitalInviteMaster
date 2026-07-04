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

export const privacyPolicyDocument: LegalDocument = {
  title: 'Privacy Policy',
  subtitle: 'DW Digital Invite CMS — Personal Data Protection Act (Singapore) Compliant Draft',
  version: 'Document version: 0.1 (Draft) | Prepared: 16 June 2026 | Applies to: DW Digital Invite CMS',
  sections: [
    {
      number: '1',
      title: 'Introduction',
      content: (
        <>
          <p>
            Dreamweavers Pte. Ltd. (&ldquo;DW Digital Invite,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo; or &ldquo;our&rdquo;) operates DW Digital Invite CMS, a software-as-a-service platform that lets users create digital invitations, build event microsites, manage guest lists and RSVPs, and share invitations by link, email, QR code, or messaging platform (the &ldquo;Service&rdquo;).
          </p>
          <p className="mt-3">
            This Policy explains how we collect, use, disclose, and protect personal data in connection with the Service, in accordance with the Personal Data Protection Act 2012 of Singapore (the &ldquo;PDPA&rdquo;). It applies to visitors to our website, registered users who create an account (&ldquo;Organisers&rdquo;), and individuals whose data is uploaded, collected, or processed through the Service (&ldquo;Guests&rdquo; or &ldquo;Invitees&rdquo;).
          </p>
          <p className="mt-3 text-xs italic text-charcoal-ink/50">
            Drafting note: this Policy assumes the operating entity is Dreamweavers Pte. Ltd., UEN [UEN / company registration number — to be inserted], of Tahir Building, Level 4, 140 Robinson Road, Singapore 068907. Confirm the correct entity, UEN, and whether DW Digital Invite is operated by the same company as the Dreamweavers retail business before publication.
          </p>
        </>
      ),
    },
    {
      number: '2',
      title: 'Scope of This Policy',
      content: (
        <p>
          This Policy does not apply to the separate Dreamweavers e-commerce website or retail operations, except to the extent both share the same back-office systems or contact channels. Where a Guest is invited to an event through the Service, their personal data is handled as described in Section 3.2 below.
        </p>
      ),
    },
    {
      number: '3',
      title: 'Two Categories of Personal Data We Handle',
      content: (
        <>
          <p>
            Because the Service is used by Organisers to collect information about their own Guests, we process personal data in two distinct capacities. This distinction matters under the PDPA and should be reviewed carefully by counsel.
          </p>
          <div className="mt-4">
            <h4 className="font-heading text-sm text-charcoal-ink mb-2">
              <span className="text-cinematic-gold mr-1">3.1</span> Account and Organiser Data
            </h4>
            <p>
              When you register for an account, subscribe to updates, or contact us, we act as the data controller (the organisation determining the purposes and means of processing) in respect of your own personal data as an Organiser, team member, or website visitor.
            </p>
          </div>
          <div className="mt-4">
            <h4 className="font-heading text-sm text-charcoal-ink mb-2">
              <span className="text-cinematic-gold mr-1">3.2</span> Guest and Invitee Data You Upload or Collect
            </h4>
            <p>
              When an Organiser uploads a guest list, builds an RSVP form, or otherwise collects information about Guests through the Service, the Organiser is the data controller for that Guest data, and DW Digital Invite acts as a data intermediary processing that data solely on the Organiser&apos;s instructions. Organisers are responsible for ensuring they have a lawful basis (typically consent or another basis recognised under the PDPA) to collect and share their Guests&apos; personal data with us, and for responding to Guest requests regarding that data in the first instance. We remain bound by the Protection Obligation under the PDPA in respect of Guest data even while acting as an intermediary.
            </p>
            <p className="mt-3 text-xs italic text-charcoal-ink/50">
              Drafting note: confirm whether DW Digital Invite will offer any direct-to-Guest features (for example, Guests creating their own accounts) that would make us a controller for Guest data in additional circumstances.
            </p>
          </div>
        </>
      ),
    },
    {
      number: '4',
      title: 'Personal Data We Collect',
      content: (
        <>
          <p className="mb-3">We may collect the following categories of personal data, depending on how the Service is used:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity and contact data:</strong> name, email address, phone number, mailing address, and similar details provided by Organisers or entered by Guests through RSVP and registration forms.</li>
            <li><strong>Event and guest list data:</strong> guest names, RSVP responses, dietary preferences, seating preferences, plus-one details, and other information Organisers choose to collect from Guests.</li>
            <li><strong>Account data:</strong> login credentials, account preferences, subscription tier, and communications with our support team.</li>
            <li><strong>User-generated content:</strong> images, videos, logos, text, and other content uploaded to build invitations or event microsites.</li>
            <li><strong>Technical and usage data:</strong> IP address, device and browser type, operating system, pages viewed, and similar analytics collected automatically when the Service is used.</li>
            <li><strong>Cookie data:</strong> as described in our separate Cookie Policy.</li>
            <li><strong>Payment data:</strong> the Service is currently offered free of charge and does not collect payment card data directly; if paid plans are introduced, payment details will be processed by a third-party payment processor and this Policy will be updated accordingly.</li>
          </ul>
        </>
      ),
    },
    {
      number: '5',
      title: 'How We Use Personal Data',
      content: (
        <>
          <p className="mb-3">We use personal data to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>create and administer Organiser accounts and provide the Service;</li>
            <li>generate, host, and deliver digital invitations and event microsites;</li>
            <li>collect and display RSVP responses and guest list data to the relevant Organiser;</li>
            <li>send transactional communications, including automated reminders and notifications relating to an event;</li>
            <li>provide customer support and respond to enquiries;</li>
            <li>maintain the security, integrity, and performance of the Service;</li>
            <li>analyse aggregated usage trends to improve the Service; and</li>
            <li>send marketing communications where you have consented, as described in Section 11.</li>
          </ul>
          <p className="mt-3">We do not use Guest data collected on behalf of an Organiser for our own independent marketing purposes.</p>
        </>
      ),
    },
    {
      number: '6',
      title: 'Cookies and Similar Technologies',
      content: (
        <p>
          We use cookies and similar technologies to operate the Service, remember preferences, and understand usage patterns. Full details, including how to manage cookie preferences, are set out in our Cookie Policy, which forms part of this Policy by reference.
        </p>
      ),
    },
    {
      number: '7',
      title: 'Sharing and Disclosure of Personal Data',
      content: (
        <>
          <p className="mb-3">We may disclose personal data to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>cloud hosting and infrastructure providers that store data on our behalf;</li>
            <li>email and messaging delivery providers used to send invitations, reminders, and notifications;</li>
            <li>analytics providers that help us understand Service usage on an aggregated basis;</li>
            <li>professional advisers, including auditors, lawyers, and insurers, where reasonably necessary;</li>
            <li>regulators, courts, or law enforcement agencies, where required by law or to establish, exercise, or defend legal rights; and</li>
            <li>a successor entity in connection with a merger, acquisition, financing, or sale of assets, subject to equivalent protections being maintained.</li>
          </ul>
          <p className="mt-3">We do not sell personal data. Third-party processors are engaged under contractual terms requiring them to protect personal data to a standard consistent with the PDPA.</p>
          <p className="mt-3 text-xs italic text-charcoal-ink/50">
            Drafting note: list the specific named subprocessors (hosting provider, email/SMS gateway, analytics tool) once finalised, as transparency about specific vendors strengthens user trust and may be expected by enterprise customers.
          </p>
        </>
      ),
    },
    {
      number: '8',
      title: 'Overseas Transfer of Personal Data',
      content: (
        <p>
          Personal data may be stored or processed on servers located outside Singapore, including where our hosting or subprocessors operate regional or global infrastructure. Where this occurs, we take steps required under the PDPA&apos;s Transfer Limitation Obligation to ensure recipients provide a standard of protection comparable to the PDPA, including through contractual clauses, before transferring personal data overseas.
        </p>
      ),
    },
    {
      number: '9',
      title: 'Data Retention',
      content: (
        <>
          <p className="mb-3">We retain personal data only for as long as reasonably necessary for the purposes described in this Policy, or as required by law. As a general approach:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account data</strong> is retained for the duration of the account plus a limited period afterward to address legal, accounting, or dispute-resolution needs.</li>
            <li><strong>Guest and event data</strong> is retained based on the Organiser&apos;s settings and event timeline, and may be deleted by the Organiser or automatically archived after the event date.</li>
            <li><strong>Backup copies</strong> may persist for a limited additional period in line with our backup cycle, described in the Data Protection &amp; Information Security Statement.</li>
          </ul>
          <p className="mt-3 text-xs italic text-charcoal-ink/50">
            Drafting note: finalise specific retention periods (for example, &ldquo;12 months after event date&rdquo; or &ldquo;30 days after account closure&rdquo;) with the business before publication; the PDPA&apos;s Retention Limitation Obligation requires retention periods to be tied to genuine business or legal purposes.
          </p>
        </>
      ),
    },
    {
      number: '10',
      title: 'How We Protect Your Personal Data',
      content: (
        <p>
          We apply technical and organisational measures appropriate to the sensitivity of the data involved, including encryption, access controls, and monitoring. Full detail is set out in our Data Protection &amp; Information Security Statement.
        </p>
      ),
    },
    {
      number: '11',
      title: 'Marketing Communications',
      content: (
        <p>
          Where you have consented to receive marketing communications, you may withdraw that consent at any time by using the unsubscribe link in any email or by contacting us using the details in Section 16. Transactional and service-related communications (such as RSVP confirmations or security notices) are not considered marketing and cannot be opted out of while your account remains active.
        </p>
      ),
    },
    {
      number: '12',
      title: 'Your Rights Under the PDPA',
      content: (
        <>
          <p className="mb-3">Subject to the exceptions permitted under the PDPA, you may:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>request access to the personal data we hold about you;</li>
            <li>request correction of inaccurate or incomplete personal data;</li>
            <li>withdraw consent for the collection, use, or disclosure of your personal data, subject to legal or contractual restrictions;</li>
            <li>request information about how your personal data has been or may have been used or disclosed in the past year; and</li>
            <li>lodge a complaint with the Personal Data Protection Commission of Singapore (PDPC) if you believe we have not complied with the PDPA.</li>
          </ul>
          <p className="mt-3">
            Where you are a Guest and wish to exercise these rights in respect of data an Organiser has collected about you, we will direct your request to the relevant Organiser where they remain the data controller, and assist as reasonably required.
          </p>
        </>
      ),
    },
    {
      number: '13',
      title: 'Minors and Event Guests Who Are Minors',
      content: (
        <p>
          The Service is intended for use by adults creating event invitations. Where an Organiser&apos;s guest list includes minors (for example, children attending a wedding or family event), the Organiser is responsible for ensuring there is an appropriate basis for collecting that minor&apos;s personal data, typically through consent of a parent or guardian.
        </p>
      ),
    },
    {
      number: '14',
      title: 'AI Features',
      content: (
        <p>
          DW Digital Invite CMS does not currently offer AI-powered content generation, wording suggestions, translation, layout recommendation, or image-enhancement features. If such features are introduced in future, we will update this Policy, describe how any related data is processed, and provide a dedicated AI Usage &amp; Transparency Policy before those features go live.
        </p>
      ),
    },
    {
      number: '15',
      title: 'Changes to This Policy',
      content: (
        <p>
          We may update this Policy from time to time to reflect changes in our practices or legal requirements. We will indicate the date this Policy was last updated and, for material changes, provide additional notice such as an in-app notification or email.
        </p>
      ),
    },
    {
      number: '16',
      title: 'Contact Us',
      content: (
        <>
          <p className="mb-3">For questions about this Policy or to exercise your rights under the PDPA, please contact our Data Protection Officer:</p>
          <ul className="list-none space-y-1.5 pl-2">
            <li><strong>Email:</strong>{' '}
              <a href="mailto:privacy@dreamweavers.com.sg" className="text-cinematic-gold hover:underline underline-offset-2">privacy@dreamweavers.com.sg</a>
            </li>
            <li><strong>Mailing address:</strong> Tahir Building, Level 4, 140 Robinson Road, Singapore 068907</li>
            <li><strong>General enquiries:</strong>{' '}
              <a href="mailto:enquiry@dreamweavers.com.sg" className="text-cinematic-gold hover:underline underline-offset-2">enquiry@dreamweavers.com.sg</a>{' '}
              / +65 6336 2505
            </li>
          </ul>
          <p className="mt-3">
            We aim to respond to privacy-related requests within a reasonable time, and in any event consistent with the timelines expected under the PDPA.
          </p>
        </>
      ),
    },
  ],
};