import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_FEATURES = [
  // Page Visibility
  { featureKey: 'page.home', featureName: 'Home Page', enabled: true, category: 'page' },
  { featureKey: 'page.schedule', featureName: 'Schedule Page', enabled: true, category: 'page' },
  { featureKey: 'page.rsvp', featureName: 'RSVP Page', enabled: true, category: 'page' },
  { featureKey: 'page.getting-there', featureName: 'Getting There Page', enabled: true, category: 'page' },
  { featureKey: 'page.story', featureName: 'Story Page', enabled: true, category: 'page' },
  { featureKey: 'page.moments', featureName: 'Moments Page', enabled: true, category: 'page' },
  { featureKey: 'page.wishes', featureName: 'Wishes Page', enabled: true, category: 'page' },
  { featureKey: 'page.qa', featureName: 'Q&A Page', enabled: true, category: 'page' },
  // Interactive Features
  { featureKey: 'feature.rsvp', featureName: 'RSVP Submission', enabled: true, category: 'interactive' },
  { featureKey: 'feature.wishes-form', featureName: 'Wishes Form', enabled: true, category: 'interactive' },
  { featureKey: 'feature.wishes-images', featureName: 'Wish Image Upload', enabled: true, category: 'interactive' },
  { featureKey: 'feature.contact-form', featureName: 'Contact Form', enabled: true, category: 'interactive' },
  { featureKey: 'feature.honeymoon-voting', featureName: 'Honeymoon Voting', enabled: true, category: 'interactive' },
  { featureKey: 'feature.calendar-export', featureName: 'Calendar Export', enabled: true, category: 'interactive' },
  { featureKey: 'feature.rsvp-auto-fill', featureName: 'RSVP Auto-Fill', enabled: true, category: 'interactive' },
  // Display Options
  { featureKey: 'display.golden-dust', featureName: 'Golden Dust Overlay', enabled: true, category: 'display' },
  { featureKey: 'display.bokeh', featureName: 'Hero Bokeh Lights', enabled: true, category: 'display' },
  { featureKey: 'display.cursor-effects', featureName: 'Cursor Effects', enabled: true, category: 'display' },
  { featureKey: 'display.dark-mode', featureName: 'Dark Mode', enabled: false, category: 'display' },
  { featureKey: 'display.animations', featureName: 'Page Animations', enabled: true, category: 'display' },
  { featureKey: 'display.bottom-nav', featureName: 'Bottom Navigation', enabled: true, category: 'display' },
  { featureKey: 'display.section-banners', featureName: 'Section Banners', enabled: true, category: 'display' },
  // Advanced
  { featureKey: 'advanced.custom-domain', featureName: 'Custom Domain', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.password-protection', featureName: 'Password Protection', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.analytics', featureName: 'Analytics Dashboard', enabled: true, category: 'advanced' },
  { featureKey: 'advanced.guest-csv-import', featureName: 'CSV Guest Import', enabled: true, category: 'advanced' },
  { featureKey: 'advanced.rsvp-reminder', featureName: 'RSVP Reminders', enabled: false, category: 'advanced' },
  { featureKey: 'advanced.wish-moderation', featureName: 'Wish Moderation', enabled: false, category: 'advanced' },
];

// Minimal page seed: slug, title, sortOrder, and a single empty section with one placeholder block
const DEFAULT_PAGES = [
  { slug: 'home', title: 'Home', sortOrder: 0, sectionSlug: 'banner', sectionTitle: 'Banner', blockKey: 'coupleName', blockType: 'text' },
  { slug: 'schedule', title: 'The Schedule', sortOrder: 1, sectionSlug: 'banner', sectionTitle: 'Schedule Banner', blockKey: 'pageTitle', blockType: 'text' },
  { slug: 'rsvp', title: 'RSVP', sortOrder: 2, sectionSlug: 'banner', sectionTitle: 'RSVP Banner', blockKey: 'pageTitle', blockType: 'text' },
  { slug: 'getting-there', title: 'Getting There', sortOrder: 3, sectionSlug: 'banner', sectionTitle: 'Getting There Banner', blockKey: 'pageTitle', blockType: 'text' },
  { slug: 'story', title: 'Our Story', sortOrder: 4, sectionSlug: 'banner', sectionTitle: 'Story Banner', blockKey: 'pageTitle', blockType: 'text' },
  { slug: 'moments', title: 'Moments', sortOrder: 5, sectionSlug: 'banner', sectionTitle: 'Moments Banner', blockKey: 'pageTitle', blockType: 'text' },
  { slug: 'wishes', title: 'Wishes', sortOrder: 6, sectionSlug: 'banner', sectionTitle: 'Wishes Banner', blockKey: 'pageTitle', blockType: 'text' },
  { slug: 'qa', title: 'Q&A', sortOrder: 7, sectionSlug: 'banner', sectionTitle: 'Q&A Banner', blockKey: 'pageTitle', blockType: 'text' },
];

export async function GET() {
  try {
    const accounts = await db.account.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        coupleName1: true,
        coupleName2: true,
        status: true,
        plan: true,
        weddingDate: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            pages: true,
          },
        },
      },
    });

    const result = accounts.map((a) => ({
      id: a.id,
      slug: a.slug,
      coupleName1: a.coupleName1,
      coupleName2: a.coupleName2,
      status: a.status,
      plan: a.plan,
      weddingDate: a.weddingDate,
      memberCount: a._count.members,
      pageCount: a._count.pages,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ accounts: result });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, coupleName1, coupleName2, email, weddingDate, plan } = body;

    // Validate required fields
    if (!slug || !coupleName1 || !coupleName2 || !email) {
      return NextResponse.json(
        { error: 'slug, coupleName1, coupleName2, and email are required' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, hyphens only)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase alphanumeric with hyphens' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await db.account.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this slug already exists' },
        { status: 409 }
      );
    }

    // Create the account
    const account = await db.account.create({
      data: {
        slug,
        coupleName1,
        coupleName2,
        email,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        plan: plan || 'free',
      },
    });

    // Seed content pages with empty blocks
    for (const page of DEFAULT_PAGES) {
      await db.contentPage.create({
        data: {
          accountId: account.id,
          slug: page.slug,
          title: page.title,
          sortOrder: page.sortOrder,
          sections: {
            create: {
              slug: page.sectionSlug,
              title: page.sectionTitle,
              sortOrder: 0,
              blocks: {
                create: {
                  key: page.blockKey,
                  type: page.blockType,
                  value: '',
                  sortOrder: 0,
                },
              },
            },
          },
        },
      });
    }

    // Seed feature flags for this account
    for (const feature of DEFAULT_FEATURES) {
      await db.featureFlag.create({
        data: {
          accountId: account.id,
          featureKey: feature.featureKey,
          featureName: feature.featureName,
          enabled: feature.enabled,
          category: feature.category,
        },
      });
    }

    return NextResponse.json({ account }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}