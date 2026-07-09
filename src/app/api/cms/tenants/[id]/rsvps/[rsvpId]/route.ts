import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, requireTenantAccess, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — Single RSVP with guests
// ============================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; rsvpId: string }> }
) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return Response.json({ success: false, error: authError || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId, rsvpId } = await params;
    const accessError = await requireTenantAccess(user, tenantId, 'viewer');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const rsvp = await db.rSVPSubmission.findFirst({
      where: { id: rsvpId, tenantId },
      include: { guests: true },
    });

    if (!rsvp) {
      return Response.json({ success: false, error: 'RSVP not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        id: rsvp.id,
        tenantId: rsvp.tenantId,
        firstName: rsvp.firstName,
        lastName: rsvp.lastName,
        partySize: rsvp.partySize,
        createdAt: rsvp.createdAt.toISOString(),
        updatedAt: rsvp.updatedAt.toISOString(),
        guests: rsvp.guests.map((g) => ({
          id: g.id,
          name: g.name,
          attendance: g.attendance,
          dietary: g.dietary,
          createdAt: g.createdAt.toISOString(),
        })),
      },
    });
  } catch (err) {
    console.error('Get RSVP error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE — Remove RSVP and its guests
// ============================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; rsvpId: string }> }
) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return Response.json({ success: false, error: authError || 'Authentication required' }, { status: 401 });
    }

    const { id: tenantId, rsvpId } = await params;
    const accessError = await requireTenantAccess(user, tenantId, 'editor');
    if (accessError) {
      return Response.json({ success: false, error: accessError }, { status: 403 });
    }

    const existing = await db.rSVPSubmission.findFirst({
      where: { id: rsvpId, tenantId },
    });

    if (!existing) {
      return Response.json({ success: false, error: 'RSVP not found' }, { status: 404 });
    }

    await db.rSVPSubmission.delete({ where: { id: rsvpId } });

    await createAuditLog({
      userId: user.userId,
      action: 'rsvp.delete',
      resource: 'RSVPSubmission',
      resourceId: rsvpId,
      tenantId,
      details: { name: `${existing.firstName} ${existing.lastName}` },
      request,
    });

    return Response.json({ success: true, data: { id: rsvpId } });
  } catch (err) {
    console.error('Delete RSVP error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}