import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { authenticateRequest, requireMasterAdmin, createAuditLog } from '@/lib/auth-middleware';

// ============================================
// GET — List all users with tenant relations
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const authError = requireMasterAdmin(user);
    if (authError) {
      return Response.json({ success: false, error: authError }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tenantUsers: {
          include: {
            tenant: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        tenantUsers: u.tenantUsers.map((tu) => ({
          id: tu.id,
          role: tu.role,
          tenantId: tu.tenantId,
          tenant: tu.tenant,
          createdAt: tu.createdAt.toISOString(),
        })),
      })),
    });
  } catch (err) {
    console.error('List users error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// POST — Create user + tenant association
// ============================================

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  tenantRole: z.enum(['admin', 'editor', 'viewer']),
});

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return Response.json({ success: false, error: error || 'Authentication required' }, { status: 401 });
    }

    const authError = requireMasterAdmin(user);
    if (authError) {
      return Response.json({ success: false, error: authError }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password, name, tenantId, tenantRole } = parsed.data;

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return Response.json({ success: false, error: 'Tenant not found' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json({ success: false, error: 'A user with this email already exists' }, { status: 400 });
    }

    const hashedPw = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPw,
        name,
        tenantUsers: {
          create: {
            tenantId,
            role: tenantRole,
          },
        },
      },
      include: {
        tenantUsers: {
          include: {
            tenant: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: 'user.create',
      resource: 'User',
      resourceId: newUser.id,
      tenantId,
      details: { email, name, tenantRole },
      request,
    });

    return Response.json(
      {
        success: true,
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatarUrl: newUser.avatarUrl,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
          tenantUsers: newUser.tenantUsers.map((tu) => ({
            id: tu.id,
            role: tu.role,
            tenantId: tu.tenantId,
            tenant: tu.tenant,
            createdAt: tu.createdAt.toISOString(),
          })),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create user error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}