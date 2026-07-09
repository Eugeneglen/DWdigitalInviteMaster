import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const suggestionSchema = z.object({
  name: z.string().min(1, 'Suggestion is required'),
  suggestedBy: z.string().min(1, 'Your name is required'),
});

async function getDefaultTenantId(): Promise<string> {
  const tenant = await db.tenant.findFirst({ where: { status: 'active' } });
  if (!tenant) throw new Error('No active tenant found');
  return tenant.id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = suggestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, suggestedBy } = parsed.data;
    const tenantId = await getDefaultTenantId();

    const suggestion = await db.honeymoonSuggestion.create({
      data: { tenantId, name, suggestedBy },
    });

    return NextResponse.json({ success: true, id: suggestion.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}