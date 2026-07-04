import { getCandidates } from '@/server/services/prospecting-service';

const findMany = vi.fn();
const noteFindMany = vi.fn().mockResolvedValue([]);
const activityFindMany = vi.fn().mockResolvedValue([]);
const pricingPlanFindMany = vi.fn().mockResolvedValue([]);
const updateMany = vi.fn().mockResolvedValue({ count: 0 });

vi.mock('@/server/prisma', () => ({
  prisma: {
    lead: {
      findMany: (...args: unknown[]) => findMany(...args),
      updateMany: (...args: unknown[]) => updateMany(...args)
    },
    note: { findMany: (...args: unknown[]) => noteFindMany(...args) },
    activity: { findMany: (...args: unknown[]) => activityFindMany(...args) },
    pricingPlan: { findMany: (...args: unknown[]) => pricingPlanFindMany(...args) }
  }
}));

describe('prospecting service', () => {
  beforeEach(() => {
    findMany.mockReset();
    noteFindMany.mockClear();
    activityFindMany.mockClear();
    pricingPlanFindMany.mockClear();
    updateMany.mockClear();
  });

  it('retorna lista vazia sem candidatos e não bate no banco de notas/atividades', async () => {
    findMany.mockResolvedValue([]);

    const result = await getCandidates('org-1', { limit: 20, diasSemAtividade: 30, diasCooldown: 3 });

    expect(result).toEqual([]);
    expect(noteFindMany).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('monta o contexto do candidato e marca o motivo da flag', async () => {
    findMany.mockResolvedValue([
      {
        id: 'lead-1',
        nome: 'Cliente X',
        empresa: 'Empresa X',
        email: 'x@x.com',
        telefone: '85999990000',
        instagram: '@x',
        score: 10,
        status: 'novo',
        semAcompanhamento: true,
        inativo: false,
        deals: [],
        conversations: []
      }
    ]);

    const result = await getCandidates('org-1', { limit: 20, diasSemAtividade: 30, diasCooldown: 3 });

    expect(result).toHaveLength(1);
    expect(result[0].leadId).toBe('lead-1');
    expect(result[0].motivoFlag).toContain('planilha:semAcompanhamento');
    expect(result[0].conversaAberta).toBe(false);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['lead-1'] } },
      data: { ultimaProspeccaoEm: expect.any(Date) }
    });
  });
});
