import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { prisma } from '@/server/prisma';
import { recalculateScores } from '@/server/services/scoring-service';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id }, include: { organization: true } });
  if (!lead) {
    return new NextResponse('Lead não encontrado', { status: 404 });
  }

  const qualifiedStage = await prisma.stage.findFirst({
    where: { pipeline: { organizationId: lead.organizationId }, nome: 'Qualificado' }
  });

  const deal = await prisma.deal.upsert({
    where: { leadId: lead.id },
    update: { stageId: qualifiedStage?.id ?? undefined },
    create: {
      leadId: lead.id,
      pipelineId: qualifiedStage?.pipelineId ?? (await prisma.pipeline.findFirstOrThrow({ where: { organizationId: lead.organizationId } })).id,
      stageId: qualifiedStage?.id ?? (await prisma.stage.findFirstOrThrow({ where: { pipeline: { organizationId: lead.organizationId } } })).id,
      valorPrevistoBRL: 0,
      moeda: 'BRL',
      probabilidade: qualifiedStage?.probabilidade ?? 0.3
    }
  });

  await recalculateScores('lead', lead.organizationId);

  return NextResponse.json({ leadId: lead.id, dealId: deal.id });
}
