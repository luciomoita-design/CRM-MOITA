import { prisma } from '@/server/prisma';
import { CandidateContext } from '@/types/prospecting';

export type GetCandidatesOptions = {
  limit: number;
  diasSemAtividade: number;
  diasCooldown: number;
};

export async function getCandidates(organizationId: string, opts: GetCandidatesOptions): Promise<CandidateContext[]> {
  const now = new Date();
  const atividadeCutoff = new Date(now.getTime() - opts.diasSemAtividade * 24 * 60 * 60 * 1000);
  const cooldownCutoff = new Date(now.getTime() - opts.diasCooldown * 24 * 60 * 60 * 1000);

  const leads = await prisma.lead.findMany({
    where: {
      organizationId,
      consentimentoContato: true,
      doNotContact: false,
      AND: [
        { OR: [{ ultimaProspeccaoEm: null }, { ultimaProspeccaoEm: { lt: cooldownCutoff } }] },
        {
          OR: [
            { semAcompanhamento: true },
            { inativo: true },
            {
              AND: [
                { activities: { none: { createdAt: { gte: atividadeCutoff } } } },
                { conversations: { none: { status: 'ativa' } } }
              ]
            }
          ]
        }
      ]
    },
    orderBy: [{ score: 'asc' }, { createdAt: 'asc' }],
    take: opts.limit,
    include: {
      deals: {
        include: { stage: true, pipeline: true },
        take: 1,
        orderBy: { id: 'desc' }
      },
      conversations: { where: { status: 'ativa' }, take: 1 }
    }
  });

  if (leads.length === 0) {
    return [];
  }

  const leadIds = leads.map((lead) => lead.id);

  const [notes, activities, pricingPlans] = await Promise.all([
    prisma.note.findMany({
      where: { leadId: { in: leadIds } },
      orderBy: { createdAt: 'desc' },
      take: 10 * leads.length
    }),
    prisma.activity.findMany({
      where: { leadId: { in: leadIds } },
      orderBy: { createdAt: 'desc' },
      take: 15 * leads.length
    }),
    prisma.pricingPlan.findMany({ where: { organizationId, ativo: true } })
  ]);

  await prisma.lead.updateMany({
    where: { id: { in: leadIds } },
    data: { ultimaProspeccaoEm: now }
  });

  const planosDisponiveis = pricingPlans.map((plan) => ({
    nome: plan.nome,
    precoBRL: plan.precoBRL,
    descricao: plan.descricao
  }));

  return leads.map((lead) => {
    const motivoFlag: string[] = [];
    if (lead.semAcompanhamento) motivoFlag.push('planilha:semAcompanhamento');
    if (lead.inativo) motivoFlag.push('planilha:inativo');
    const semAtividadeRecente = !activities.some(
      (activity) => activity.leadId === lead.id && activity.createdAt >= atividadeCutoff
    );
    if (!lead.semAcompanhamento && !lead.inativo && semAtividadeRecente) {
      motivoFlag.push(`sem_atividade_${opts.diasSemAtividade}d`);
    }

    const deal = lead.deals[0];

    return {
      leadId: lead.id,
      nome: lead.nome,
      empresa: lead.empresa,
      email: lead.email,
      telefone: lead.telefone,
      instagram: lead.instagram,
      score: lead.score,
      status: lead.status,
      motivoFlag,
      ultimaProspeccaoEm: now.toISOString(),
      deal: deal
        ? {
            dealId: deal.id,
            pipelineNome: deal.pipeline.nome,
            stageNome: deal.stage.nome,
            valorPrevistoBRL: deal.valorPrevistoBRL
          }
        : null,
      notasRecentes: notes
        .filter((note) => note.leadId === lead.id)
        .slice(0, 10)
        .map((note) => ({ content: note.content, createdAt: note.createdAt.toISOString() })),
      atividadesRecentes: activities
        .filter((activity) => activity.leadId === lead.id)
        .slice(0, 15)
        .map((activity) => ({
          tipo: activity.tipo,
          titulo: activity.titulo,
          descricao: activity.descricao,
          doneAt: activity.doneAt ? activity.doneAt.toISOString() : null,
          dueAt: activity.dueAt ? activity.dueAt.toISOString() : null
        })),
      planosDisponiveis,
      conversaAberta: lead.conversations.length > 0
    };
  });
}
