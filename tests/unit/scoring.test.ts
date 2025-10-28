import { applyRules } from '@/server/services/scoring-service';

describe('scoring service', () => {
  it('soma pesos com base em regras válidas', () => {
    const rules = [
      { id: '1', nome: 'Origem indicação', peso: 25, condicao_json: { field: 'origem', op: 'eq', value: 'Indicação' }, ativo: true },
      { id: '2', nome: 'Ticket alto', peso: 10, condicao_json: { field: 'ticket', op: 'gt', value: 10000 }, ativo: true }
    ];

    const lead = { origem: 'Indicação', ticket: 20000, email: 'lead@crm.com', telefone: '85999990000', empresa: 'Empresa X' };

    const score = applyRules(rules as any, lead);
    expect(score).toBeGreaterThan(60);
  });
});
