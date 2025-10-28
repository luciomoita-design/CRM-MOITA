import { addMinutes, subMinutes } from 'date-fns';
import { checkSLA } from '@/server/services/sla-service';

describe('SLA service', () => {
  it('retorna true quando dentro do prazo', () => {
    const createdAt = subMinutes(new Date(), 10);
    expect(checkSLA({ prazoMinutos: 30, createdAt })).toBe(true);
  });

  it('retorna false quando ultrapassa o prazo', () => {
    const createdAt = addMinutes(new Date(), -90);
    expect(checkSLA({ prazoMinutos: 60, createdAt })).toBe(false);
  });
});
