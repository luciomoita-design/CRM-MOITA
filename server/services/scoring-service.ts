import { prisma } from '@/server/prisma';
import { differenceInHours } from 'date-fns';

export type ScoringEntity = 'lead' | 'deal';

type Rule = {
  id: string;
  nome: string;
  peso: number;
  condicao_json: any;
  ativo: boolean;
};

export async function recalculateScores(entity: ScoringEntity, organizationId: string) {
  const rules = await prisma.scoringRule.findMany({ where: { organizationId, ativo: true } });

  if (entity === 'lead') {
    const leads = await prisma.lead.findMany({ where: { organizationId } });
    for (const lead of leads) {
      const score = applyRules(rules, lead);
      await prisma.lead.update({ where: { id: lead.id }, data: { score } });
    }
  }

  if (entity === 'deal') {
    const deals = await prisma.deal.findMany({ where: { pipeline: { organizationId } }, include: { stage: true } });
    for (const deal of deals) {
      const score = applyRules(rules, deal);
      await prisma.deal.update({ where: { id: deal.id }, data: { probabilidade: score / 100 } });
    }
  }
}

export function applyRules(rules: Rule[], entity: any) {
  let total = 0;
  let max = 0;
  for (const rule of rules) {
    max += rule.peso;
    if (evaluateCondition(rule.condicao_json, entity)) {
      total += rule.peso;
    }
  }

  if ('email' in entity || 'telefone' in entity || 'empresa' in entity) {
    let completeness = 0;
    if (entity.email) completeness += 5;
    if (entity.telefone) completeness += 7;
    if (entity.empresa) completeness += 8;
    total += completeness;
    max += 20;
  }

  if ('stage' in entity && entity.stage?.probabilidade) {
    total += entity.stage.probabilidade * 25;
    max += 25;
  }

  if ('activities' in entity) {
    const lastActivity = entity.activities?.[0];
    if (lastActivity?.dueAt) {
      const hours = differenceInHours(new Date(), lastActivity.dueAt);
      if (hours <= 24) total += 20;
      else if (hours <= 72) total += 10;
      max += 20;
    }
  }

  return Math.min(100, Math.round((total / Math.max(max, 1)) * 100));
}

function evaluateCondition(condition: any, entity: any): boolean {
  if (!condition) return false;
  const { field, op, value } = condition;
  const entityValue = entity[field];
  switch (op) {
    case 'eq':
      return entityValue === value;
    case 'in':
      return Array.isArray(value) && value.includes(entityValue);
    case 'gt':
      return entityValue > value;
    case 'lt':
      return entityValue < value;
    default:
      return false;
  }
}
