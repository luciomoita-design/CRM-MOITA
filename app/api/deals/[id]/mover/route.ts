import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { prisma } from '@/server/prisma';
import { logger } from '@/server/logger';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { stageId } = await request.json();
  const stage = await prisma.stage.findUnique({ where: { id: stageId }, include: { pipeline: true } });
  if (!stage) {
    return new NextResponse('Estágio inválido', { status: 400 });
  }

  const deal = await prisma.deal.update({
    where: { id: params.id },
    data: { stageId: stageId, pipelineId: stage.pipelineId, probabilidade: stage.probabilidade }
  });

  logger.info({ dealId: deal.id, stageId }, 'deal moved');

  return NextResponse.json(deal);
}
