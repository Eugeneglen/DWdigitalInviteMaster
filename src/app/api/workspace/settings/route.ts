import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { DEV_ACCOUNT_ID } from '@/lib/tenant';

export async function GET() {
  try {
    const session = await getServerSession();
    const accountId = session?.user?.id ?? DEV_ACCOUNT_ID;

    // Get account info
    const membership = await db.accountMember.findFirst({
      where: { userId: session?.user?.id },
      include: { account: true },
    });

    if (!membership) {
      // Fallback: try to find account by dev ID
      const account = await db.account.findUnique({
        where: { id: accountId },
      });
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }

      const flags = await db.featureFlag.findMany({
        where: { accountId },
        orderBy: [{ category: 'asc' }, { featureKey: 'asc' }],
      });

      return NextResponse.json({
        account: {
          coupleName1: account.coupleName1,
          coupleName2: account.coupleName2,
          email: account.email,
          slug: account.slug,
          weddingDate: account.weddingDate,
          status: account.status,
          plan: account.plan,
        },
        flags,
      });
    }

    const account = membership.account;
    const flags = await db.featureFlag.findMany({
      where: { accountId: account.id },
      orderBy: [{ category: 'asc' }, { featureKey: 'asc' }],
    });

    return NextResponse.json({
      account: {
        coupleName1: account.coupleName1,
        coupleName2: account.coupleName2,
        email: account.email,
        slug: account.slug,
        weddingDate: account.weddingDate,
        status: account.status,
        plan: account.plan,
      },
      flags,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    const accountId = session?.user?.id;

    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { flags } = body as {
      flags: { featureKey: string; enabled: boolean }[];
    };

    if (!Array.isArray(flags)) {
      return NextResponse.json(
        { error: 'flags must be an array' },
        { status: 400 }
      );
    }

    // Update each flag using upsert
    for (const flag of flags) {
      if (typeof flag.featureKey !== 'string' || typeof flag.enabled !== 'boolean') {
        continue;
      }

      await db.featureFlag.upsert({
        where: {
          accountId_featureKey: {
            accountId,
            featureKey: flag.featureKey,
          },
        },
        update: { enabled: flag.enabled },
        create: {
          accountId,
          featureKey: flag.featureKey,
          featureName: flag.featureKey,
          enabled: flag.enabled,
          category: 'custom',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}