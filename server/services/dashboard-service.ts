import { addDays, subDays } from 'date-fns';
import { prisma } from '@/server/prisma';

export async function getDashboardSummary() {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const [newLeads, pipelineValue, activitiesToday] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.deal.aggregate({
      _sum: { valorPrevistoBRL: true },
      where: { stage: { probabilidade: { gt: 0 } } }
    }),
    prisma.activity.count({
      where: {
        dueAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), 1)
        }
      }
    })
  ]);

  return {
    newLeads,
    pipelineValue: pipelineValue._sum.valorPrevistoBRL ?? 0,
    activitiesToday
  };
}

export async function getRecentActivities() {
  const activities = await prisma.activity.findMany({
    orderBy: { dueAt: 'desc' },
    take: 5
  });
  return activities.map((activity) => ({
    id: activity.id,
    title: activity.titulo,
    type: activity.tipo,
    when: activity.dueAt ?? activity.createdAt ?? new Date()
  }));
}

export async function getPipelineSnapshot() {
  const stages = await prisma.stage.findMany({
    include: {
      deals: {
        select: {
          id: true,
          valorPrevistoBRL: true,
          probabilidade: true
        }
      }
    }
  });

  return stages.map((stage) => {
    const totalValue = stage.deals.reduce((sum, deal) => sum + (deal.valorPrevistoBRL ?? 0), 0);
    const probability =
      stage.deals.reduce((sum, deal) => sum + (deal.probabilidade ?? stage.probabilidade ?? 0), 0) /
      Math.max(stage.deals.length, 1);

    return {
      stageId: stage.id,
      stageName: stage.nome,
      deals: stage.deals.length,
      totalValue,
      probability
    };
  });
}
