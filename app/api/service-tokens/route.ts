import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/server/auth/options';
import { generateServiceToken } from '@/server/auth/service-token';
import { prisma } from '@/server/prisma';
import { logger } from '@/server/logger';

const createSchema = z.object({
  nome: z.string().min(1),
  organizationId: z.string(),
  actingUserId: z.string(),
  escopos: z.array(z.string()).default(['prospecting']),
  expiraEm: z.string().datetime().optional()
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const payload = createSchema.parse(await request.json());
  const { raw, prefix, hash } = generateServiceToken();

  const created = await prisma.serviceToken.create({
    data: {
      nome: payload.nome,
      organizationId: payload.organizationId,
      actingUserId: payload.actingUserId,
      escopos: payload.escopos,
      expiraEm: payload.expiraEm ? new Date(payload.expiraEm) : undefined,
      tokenPrefix: prefix,
      tokenHash: hash,
      criadoPorId: session.user.id
    }
  });

  logger.info({ serviceTokenId: created.id, organizationId: created.organizationId }, 'service token created');

  return NextResponse.json({ id: created.id, tokenPrefix: created.tokenPrefix, raw }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId') ?? undefined;

  const tokens = await prisma.serviceToken.findMany({
    where: organizationId ? { organizationId } : undefined,
    select: {
      id: true,
      nome: true,
      tokenPrefix: true,
      ativo: true,
      escopos: true,
      ultimoUsoEm: true,
      expiraEm: true,
      createdAt: true
    }
  });

  return NextResponse.json({ items: tokens });
}
