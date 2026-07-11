import { authenticateRequest } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  try {
    const { user, error } = await authenticateRequest(request);

    if (error || !user) {
      return Response.json(
        { success: false, error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantRole: user.tenantRole,
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}