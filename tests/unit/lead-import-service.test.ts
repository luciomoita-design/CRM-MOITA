import { parseCsv, mapRowToLeadUpdate, parseBooleanish, columnMappingSchema } from '@/server/services/lead-import-service';

describe('lead import service', () => {
  it('faz parse de CSV com vírgula entre aspas', () => {
    const csv = 'nome,empresa,telefone\n"Silva, João","Silva & Cia","(85) 99999-0000"';
    const { header, rows } = parseCsv(csv);
    expect(header).toEqual(['nome', 'empresa', 'telefone']);
    expect(rows[0]).toEqual(['Silva, João', 'Silva & Cia', '(85) 99999-0000']);
  });

  it('interpreta valores booleanos comuns em planilhas', () => {
    expect(parseBooleanish('sim')).toBe(true);
    expect(parseBooleanish('Não')).toBe(false);
    expect(parseBooleanish('1')).toBe(true);
    expect(parseBooleanish('0')).toBe(false);
    expect(parseBooleanish('x')).toBe(true);
    expect(parseBooleanish('')).toBe(false);
    expect(parseBooleanish(undefined)).toBe(false);
  });

  it('mapeia uma linha para os campos do lead conforme o mapeamento de colunas', () => {
    const mapping = columnMappingSchema.parse({
      matchBy: 'telefone',
      columns: {
        matchColumn: 'telefone',
        instagram: 'insta',
        semAcompanhamento: 'sem_acompanhamento'
      },
      flagColumns: ['segmento']
    });
    const header = ['telefone', 'insta', 'sem_acompanhamento', 'segmento'];
    const row = ['(85) 99999-0000', '@clienteexemplo', 'sim', 'varejo'];

    const mapped = mapRowToLeadUpdate(row, header, mapping);

    expect(mapped.matchValue).toBe('85999990000');
    expect(mapped.data.instagram).toBe('@clienteexemplo');
    expect(mapped.data.semAcompanhamento).toBe(true);
    expect(mapped.flags).toEqual({ segmento: 'varejo' });
  });

  it('retorna matchValue vazio quando a coluna de match está em branco', () => {
    const mapping = columnMappingSchema.parse({
      columns: { matchColumn: 'telefone' }
    });
    const header = ['telefone'];
    const mapped = mapRowToLeadUpdate([''], header, mapping);
    expect(mapped.matchValue).toBe('');
  });
});
