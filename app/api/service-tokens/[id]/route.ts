import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { prisma } from '@/server/prisma';
import { logger } from '@/server/logger';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  await prisma.serviceToken.update({ where: { id: params.id }, data: { ativo: false } });
  logger.info({ serviceTokenId: params.id }, 'service token revoked');

  return NextResponse.json({ success: true });
}
