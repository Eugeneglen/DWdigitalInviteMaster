import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

async function getWeddingId(userId: string): Promise<string | null> {
  const w = await db.weddingAccount.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  });
  return w?.id ?? null;
}

/** UTF-8 BOM for Excel compatibility */
const BOM = '\uFEFF';

function csvRow(cells: (string | number | null | undefined)[]): string {
  return cells
    .map((c) => {
      const s = c == null ? '' : String(c);
      return `"${s.replace(/"/g, '""')}"`;
    })
    .join(',');
}

function csvResponse(filename: string, rows: string[]): NextResponse {
  const body = BOM + rows.join('\n');
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

// GET /api/cms/export?type=guests|rsvps|wishes|contact
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) {
      return NextResponse.json({ error: 'No wedding account' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') ?? '';

    switch (type) {
      // ── Guests ──────────────────────────────────────────────
      case 'guests': {
        const guests = await db.guest.findMany({
          where: { weddingId },
          orderBy: { createdAt: 'desc' },
        });

        const rows: string[] = [
          csvRow([
            'Name',
            'Email',
            'Phone',
            'Group',
            'Table',
            'Invitation Code',
            'RSVP Status',
            'Plus One',
            'Plus One Name',
            'Dietary Notes',
            'Sent Via',
            'Sent At',
            'Created At',
          ]),
        ];

        for (const g of guests) {
          rows.push(
            csvRow([
              g.name,
              g.email,
              g.phone,
              g.groupName,
              g.tableNumber,
              g.invitationCode,
              g.rsvpStatus,
              g.plusOne ? 'Yes' : 'No',
              g.plusOneName,
              g.dietaryNotes,
              g.sentVia,
              g.sentAt?.toISOString() ?? '',
              g.createdAt.toISOString(),
            ])
          );
        }

        return csvResponse(`guests-export-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      }

      // ── RSVPs ───────────────────────────────────────────────
      case 'rsvps': {
        const rsvps = await db.rSVPSubmission.findMany({
          where: { weddingId },
          include: { guests: true },
          orderBy: { createdAt: 'desc' },
        });

        const rows: string[] = [
          csvRow([
            'Submitted By',
            'Party Size',
            'Submitted At',
            'Guest Name',
            'Attendance',
            'Dietary',
          ]),
        ];

        for (const r of rsvps) {
          if (r.guests.length > 0) {
            for (const g of r.guests) {
              rows.push(
                csvRow([
                  `${r.firstName} ${r.lastName}`,
                  r.partySize,
                  r.createdAt.toISOString(),
                  g.name,
                  g.attendance === 'yes'
                    ? 'Attending'
                    : g.attendance === 'no'
                      ? 'Declined'
                      : 'Partial',
                  g.dietary,
                ])
              );
            }
          } else {
            rows.push(
              csvRow([
                `${r.firstName} ${r.lastName}`,
                r.partySize,
                r.createdAt.toISOString(),
                '—',
                '—',
                '',
              ])
            );
          }
        }

        return csvResponse(`rsvps-export-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      }

      // ── Wishes ──────────────────────────────────────────────
      case 'wishes': {
        const wishes = await db.wish.findMany({
          where: { weddingId },
          orderBy: { createdAt: 'desc' },
        });

        const rows: string[] = [
          csvRow(['Name', 'Relationship', 'Message', 'Image URL', 'Created At']),
        ];

        for (const w of wishes) {
          rows.push(
            csvRow([
              w.name,
              w.relationship,
              w.message,
              w.imageUrl,
              w.createdAt.toISOString(),
            ])
          );
        }

        return csvResponse(`wishes-export-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      }

      // ── Contact Submissions ─────────────────────────────────
      case 'contact': {
        const contacts = await db.contactSubmission.findMany({
          where: { weddingId },
          orderBy: { createdAt: 'desc' },
        });

        const rows: string[] = [
          csvRow(['Name', 'Email', 'Contact Number', 'Reason', 'Created At']),
        ];

        for (const c of contacts) {
          rows.push(
            csvRow([
              c.name,
              c.email,
              c.contact,
              c.reason,
              c.createdAt.toISOString(),
            ])
          );
        }

        return csvResponse(`contacts-export-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: guests, rsvps, wishes, contact' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}