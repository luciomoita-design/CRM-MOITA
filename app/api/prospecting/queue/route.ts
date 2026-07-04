import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireServiceToken } from '@/server/auth/service-token';
import { getCandidates } from '@/server/services/prospecting-service';

const queryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  diasSemAtividade: z.coerce.number().int().min(1).default(30),
  diasCooldown: z.coerce.number().int().min(1).default(3)
});

export async function GET(request: NextRequest) {
  const { ctx, error } = await requireServiceToken(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const opts = queryQuerySchema.parse({
    limit: searchParams.get('limit') ?? undefined,
    diasSemAtividade: searchParams.get('diasSemAtividade') ?? undefined,
    diasCooldown: searchParams.get('diasCooldown') ?? undefined
  });

  const items = await getCandidates(ctx.organizationId, opts);

  return NextResponse.json({ items, total: items.length });
}
