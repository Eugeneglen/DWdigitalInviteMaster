import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Defaults ──────────────────────────────────────────────────────────────

const DEFAULT_NAV_TABS = [
  { id: 'home', label: 'Home', section: 'home', enabled: true },
  { id: 'schedule', label: 'Schedule', section: 'schedule', enabled: true },
  { id: 'rsvp', label: 'RSVP', section: 'rsvp', enabled: true },
  { id: 'getting-there', label: 'Getting There', section: 'getting-there', enabled: true },
  { id: 'story', label: 'Story', section: 'story', enabled: true },
  { id: 'wishes', label: 'Wishes', section: 'wishes', enabled: true },
  { id: 'qa', label: 'Q&A', section: 'qa', enabled: true },
  { id: 'moments', label: 'Moments', section: 'moments', enabled: true },
];

const DEFAULT_FOOTER = {
  copyright: '© 2026 DREAMWEAVERS DIGITAL HEIRLOOMS. All rights reserved.',
  privacyPolicy: 'Privacy Policy content will appear here once configured by the administrator.',
  dataProtection: 'Data Protection content will appear here once configured by the administrator.',
  termsOfService: 'Terms of Service content will appear here once configured by the administrator.',
};

// GET /api/site-settings — public endpoint for guest-facing site
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ['site_nav_tabs', 'footer_copyright', 'footer_privacy_policy', 'footer_data_protection', 'footer_terms_of_service'],
        },
      },
    });

    const kv: Record<string, string> = {};
    for (const s of settings) {
      kv[s.key] = s.value;
    }

    // Parse nav tabs — fall back to defaults
    let navTabs = DEFAULT_NAV_TABS;
    if (kv['site_nav_tabs']) {
      try {
        const parsed = JSON.parse(kv['site_nav_tabs']);
        if (Array.isArray(parsed) && parsed.length > 0) {
          navTabs = parsed;
        }
      } catch {
        // Use defaults if JSON is invalid
      }
    }

    // Filter to only enabled tabs
    const enabledTabs = navTabs.filter((t) => t.enabled !== false);

    // Footer content — fall back to defaults
    const footerContent = {
      copyright: kv['footer_copyright'] || DEFAULT_FOOTER.copyright,
      privacyPolicy: kv['footer_privacy_policy'] || DEFAULT_FOOTER.privacyPolicy,
      dataProtection: kv['footer_data_protection'] || DEFAULT_FOOTER.dataProtection,
      termsOfService: kv['footer_terms_of_service'] || DEFAULT_FOOTER.termsOfService,
    };

    return NextResponse.json({ navTabs: enabledTabs, footerContent });
  } catch (error) {
    console.error('Site settings GET error:', error);
    // Return defaults even on error so the guest site never breaks
    return NextResponse.json({
      navTabs: DEFAULT_NAV_TABS.filter((t) => t.enabled !== false),
      footerContent: DEFAULT_FOOTER,
    });
  }
}