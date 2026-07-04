import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { prisma } from '@/server/prisma';

const TOKEN_PREFIX_LENGTH = 12;

export function generateServiceToken(): { raw: string; prefix: string; hash: string } {
  const raw = `mst_${crypto.randomBytes(24).toString('hex')}`;
  const prefix = raw.slice(0, TOKEN_PREFIX_LENGTH);
  const hash = bcrypt.hashSync(raw, 10);
  return { raw, prefix, hash };
}

export type ServiceTokenContext = {
  organizationId: string;
  tokenId: string;
  actingUserId: string;
  scopes: string[];
};

export async function verifyServiceToken(request: NextRequest): Promise<ServiceTokenContext | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const raw = authHeader.slice('Bearer '.length).trim();
  if (raw.length < TOKEN_PREFIX_LENGTH) {
    return null;
  }
  const prefix = raw.slice(0, TOKEN_PREFIX_LENGTH);

  const record = await prisma.serviceToken.findUnique({ where: { tokenPrefix: prefix } });
  if (!record || !record.ativo) {
    return null;
  }
  if (record.expiraEm && record.expiraEm.getTime() < Date.now()) {
    return null;
  }

  const valid = await bcrypt.compare(raw, record.tokenHash);
  if (!valid) {
    return null;
  }

  prisma.serviceToken.update({ where: { id: record.id }, data: { ultimoUsoEm: new Date() } }).catch(() => undefined);

  return {
    organizationId: record.organizationId,
    tokenId: record.id,
    actingUserId: record.actingUserId,
    scopes: record.escopos
  };
}

export async function requireServiceToken(
  request: NextRequest
): Promise<{ ctx: ServiceTokenContext; error: null } | { ctx: null; error: NextResponse }> {
  const ctx = await verifyServiceToken(request);
  if (!ctx) {
    return { ctx: null, error: new NextResponse('Unauthorized', { status: 401 }) };
  }
  return { ctx, error: null };
}

export type EitherAuthContext = { organizationId: string; source: 'session' | 'service-token' };

export async function resolveEitherAuth(request: NextRequest): Promise<EitherAuthContext | null> {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const membership = await prisma.membership.findFirst({ where: { userId: session.user.id } });
    if (membership) {
      return { organizationId: membership.organizationId, source: 'session' };
    }
  }
  const serviceCtx = await verifyServiceToken(request);
  if (serviceCtx) {
    return { organizationId: serviceCtx.organizationId, source: 'service-token' };
  }
  return null;
}
