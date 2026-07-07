import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/cms/overview — rich dashboard stats for couple
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wedding = await db.weddingAccount.findFirst({
      where: { ownerId: session.user.id },
      include: {
        guests: true,
        rsvps: { include: { guests: true } },
        wishes: true,
        content: true,
        schedules: true,
        stories: true,
        faqs: true,
        features: true,
        media: true,
        contacts: true,
      },
    });

    if (!wedding) {
      return NextResponse.json({ error: 'No wedding account found' }, { status: 404 });
    }

    // Days until wedding
    const now = new Date();
    const weddingDate = new Date(wedding.weddingDate);
    const diffMs = weddingDate.getTime() - now.getTime();
    const daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const isPast = diffMs < 0;

    // Guest stats
    const totalGuests = wedding.guests.length;
    const guestsByStatus: Record<string, number> = { PENDING: 0, ATTENDING: 0, DECLINED: 0, PARTIAL: 0 };
    for (const g of wedding.guests) {
      const s = g.rsvpStatus || 'PENDING';
      guestsByStatus[s] = (guestsByStatus[s] || 0) + 1;
    }
    const respondedGuests = totalGuests - (guestsByStatus.PENDING || 0);
    const attendanceRate = totalGuests > 0 ? Math.round((guestsByStatus.ATTENDING / totalGuests) * 100) : 0;

    // RSVP submissions
    const totalRSVPs = wedding.rsvps.length;
    const totalWishes = wedding.wishes.length;
    const totalContacts = wedding.contacts.length;

    // Content completion — check which sections have content
    const contentSections = new Set(wedding.content.map((c) => c.section));
    const filledSections = contentSections.size;
    const totalSections = 9; // hero, schedule, story, rsvp, getting-there, qa, wishes, moments, footer
    const contentCompletion = Math.round((filledSections / totalSections) * 100);

    // Checklist items
    const checklist = [
      { key: 'details', label: 'Wedding details filled in', done: !!(wedding.coupleName && wedding.venue && wedding.weddingDate) },
      { key: 'hero_image', label: 'Hero visual uploaded', done: !!(wedding.heroImageUrl || wedding.heroVideoUrl) },
      { key: 'banner_image', label: 'Banner image uploaded', done: wedding.media.some((m) => m.category === 'banner') },
      { key: 'schedule', label: 'Event schedule created', done: wedding.schedules.length > 0 },
      { key: 'story', label: 'Love story added', done: wedding.stories.length > 0 },
      { key: 'faqs', label: 'FAQs created', done: wedding.faqs.length > 0 },
      { key: 'gallery', label: 'Gallery photos uploaded', done: wedding.media.filter((m) => m.category === 'gallery').length > 0 },
      { key: 'guests', label: 'Guest list added', done: totalGuests > 0 },
      { key: 'content', label: 'Section content written', done: filledSections >= 5 },
      { key: 'features', label: 'Features configured', done: wedding.features.some((f) => f.isEnabled) },
    ];
    const completedChecklist = checklist.filter((c) => c.done).length;
    const totalChecklist = checklist.length;

    // Recent activity (last 15 audit logs for this wedding)
    const recentActivity = await db.auditLog.findMany({
      where: { weddingId: wedding.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    // Guest group distribution (top 5 groups)
    const groupCounts: Record<string, number> = {};
    for (const g of wedding.guests) {
      const group = g.groupName || 'Ungrouped';
      groupCounts[group] = (groupCounts[group] || 0) + 1;
    }
    const guestGroups = Object.entries(groupCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      daysUntil,
      isPast,
      weddingDate: wedding.weddingDate,
      coupleName: wedding.coupleName,
      venue: wedding.venue,
      status: wedding.status,
      guests: {
        total: totalGuests,
        byStatus: guestsByStatus,
        responded: respondedGuests,
        attendanceRate,
        groups: guestGroups,
        totalWithPlusOne: wedding.guests.filter((g) => g.plusOne).length,
      },
      rsvps: { total: totalRSVPs },
      wishes: { total: totalWishes },
      contacts: { total: totalContacts },
      content: { completion: contentCompletion, filledSections, totalSections },
      checklist: { items: checklist, completed: completedChecklist, total: totalChecklist },
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        details: log.details,
        createdAt: log.createdAt,
        userName: log.user?.name || 'System',
      })),
      media: { total: wedding.media.length },
    });
  } catch (error) {
    console.error('Overview API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}