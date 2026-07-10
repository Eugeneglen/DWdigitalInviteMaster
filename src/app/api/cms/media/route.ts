import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

async function getWeddingId(userId: string): Promise<string | null> {
  const w = await db.weddingAccount.findFirst({ where: { ownerId: userId }, select: { id: true } });
  return w?.id ?? null;
}

// GET /api/cms/media?category=gallery
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { weddingId };
    if (category) where.category = category;

    const media = await db.weddingMedia.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      take: 200,
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Get media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cms/media
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const body = await req.json();
    const { url, fileName, fileType, fileSize, category, thumbnailUrl } = body as {
      url: string;
      fileName: string;
      fileType?: string;
      fileSize?: number;
      category: string;
      thumbnailUrl?: string;
    };

    if (!url || !fileName || !category) {
      return NextResponse.json({ error: 'url, fileName, and category are required' }, { status: 400 });
    }

    const maxSort = await db.weddingMedia.findFirst({
      where: { weddingId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const media = await db.weddingMedia.create({
      data: {
        weddingId,
        url,
        fileName,
        fileType: fileType || 'IMAGE',
        fileSize: fileSize || null,
        category,
        thumbnailUrl: thumbnailUrl || null,
        sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        weddingId,
        action: 'CREATE',
        entity: 'WeddingMedia',
        entityId: media.id,
        details: JSON.stringify({ fileName, category }),
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error('Create media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/cms/media
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const body = await req.json();
    const { id, category, sortOrder, fileName, setAs } = body as {
      id: string;
      category?: string;
      sortOrder?: number;
      fileName?: string;
      setAs?: 'hero' | 'banner';
    };

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.weddingMedia.findFirst({
      where: { id, weddingId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (category !== undefined) updateData.category = category;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (fileName !== undefined) updateData.fileName = fileName;

    const updated = await db.weddingMedia.update({
      where: { id },
      data: updateData,
    });

    // Handle setAs hero/banner
    if (setAs === 'hero' || setAs === 'banner') {
      const field = setAs === 'hero' ? 'heroImageUrl' : 'bannerUrl';
      await db.weddingAccount.update({
        where: { id: weddingId },
        data: { [field]: existing.url },
      });
    }

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        weddingId,
        action: 'UPDATE',
        entity: 'WeddingMedia',
        entityId: id,
        details: JSON.stringify({ category, sortOrder, fileName, setAs }),
      },
    });

    return NextResponse.json({ media: updated });
  } catch (error) {
    console.error('Update media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cms/media?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const weddingId = await getWeddingId(session.user.id);
    if (!weddingId) return NextResponse.json({ error: 'No wedding account' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.weddingMedia.findFirst({
      where: { id, weddingId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    await db.weddingMedia.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        weddingId,
        action: 'DELETE',
        entity: 'WeddingMedia',
        entityId: id,
        details: JSON.stringify({ fileName: existing.fileName, category: existing.category }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}