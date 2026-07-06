import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wedding/public?slug=eleanor-james
// Returns all wedding data needed by guest-facing pages
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    const where = slug
      ? { slug, status: 'ACTIVE' }
      : { status: 'ACTIVE' as const };

    const wedding = await db.weddingAccount.findFirst({
      where,
      include: {
        content: true,
        schedules: { orderBy: { sortOrder: 'asc' } },
        faqs: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        stories: { orderBy: { sortOrder: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        features: true,
      },
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Transform content array into nested map for easy lookup
    const contentMap: Record<string, Record<string, string>> = {};
    for (const c of wedding.content) {
      if (!contentMap[c.section]) contentMap[c.section] = {};
      contentMap[c.section][c.fieldKey] = c.fieldValue;
    }

    // Group media by category
    const mediaByCategory: Record<string, typeof wedding.media> = {};
    for (const m of wedding.media) {
      if (!mediaByCategory[m.category]) mediaByCategory[m.category] = [];
      mediaByCategory[m.category].push(m);
    }

    // Build feature flags map
    const featureFlags: Record<string, boolean> = {};
    for (const f of wedding.features) {
      featureFlags[f.featureKey] = f.isEnabled;
    }

    return NextResponse.json({
      wedding: {
        id: wedding.id,
        slug: wedding.slug,
        coupleName: wedding.coupleName,
        brideName: wedding.brideName,
        groomName: wedding.groomName,
        weddingDate: wedding.weddingDate,
        weddingTime: wedding.weddingTime,
        venue: wedding.venue,
        venueAddress: wedding.venueAddress,
        googleMapsUrl: wedding.googleMapsUrl,
        heroImageUrl: wedding.heroImageUrl,
        bannerUrl: wedding.bannerUrl,
      },
      content: contentMap,
      schedules: wedding.schedules,
      faqs: wedding.faqs,
      stories: wedding.stories,
      media: wedding.media,
      mediaByCategory,
      featureFlags,
    });
  } catch (error) {
    console.error('Public wedding API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}