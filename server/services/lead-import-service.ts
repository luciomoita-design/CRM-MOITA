import Papa from 'papaparse';
import { z } from 'zod';
import { prisma } from '@/server/prisma';
import { logger } from '@/server/logger';

export const columnMappingSchema = z.object({
  matchBy: z.enum(['telefone', 'email', 'nome']).default('telefone'),
  columns: z.object({
    matchColumn: z.string(),
    instagram: z.string().optional(),
    semAcompanhamento: z.string().optional(),
    inativo: z.string().optional()
  }),
  flagColumns: z.array(z.string()).default([])
});

export type ColumnMapping = z.infer<typeof columnMappingSchema>;

export type ImportError = { linha: number; motivo: string };

export type ImportSummary = {
  batchId: string;
  totalLinhas: number;
  totalAtualizados: number;
  totalNaoEncontrados: number;
  erros: ImportError[];
};

export function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
  const [header, ...rows] = result.data;
  return { header: header ?? [], rows };
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export function parseBooleanish(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return ['sim', 'true', '1', 'x', 'yes'].includes(v);
}

export type MappedRow = {
  matchValue: string;
  data: {
    instagram?: string;
    semAcompanhamento?: boolean;
    inativo?: boolean;
  };
  flags: Record<string, string>;
};

export function mapRowToLeadUpdate(row: string[], header: string[], mapping: ColumnMapping): MappedRow {
  const indexOf = (name: string) => header.indexOf(name);
  const valueAt = (name?: string) => {
    if (!name) return undefined;
    const idx = indexOf(name);
    return idx >= 0 ? row[idx] : undefined;
  };

  const rawMatch = valueAt(mapping.columns.matchColumn) ?? '';
  const matchValue = mapping.matchBy === 'telefone' ? normalizePhone(rawMatch) : normalizeText(rawMatch);

  const data: MappedRow['data'] = {};
  const instagram = valueAt(mapping.columns.instagram);
  if (instagram) data.instagram = instagram.trim();
  if (mapping.columns.semAcompanhamento) {
    data.semAcompanhamento = parseBooleanish(valueAt(mapping.columns.semAcompanhamento));
  }
  if (mapping.columns.inativo) {
    data.inativo = parseBooleanish(valueAt(mapping.columns.inativo));
  }

  const flags: Record<string, string> = {};
  for (const col of mapping.flagColumns) {
    const v = valueAt(col);
    if (v !== undefined) flags[col] = v;
  }

  return { matchValue, data, flags };
}

export async function importLeadsFromCsv(input: {
  organizationId: string;
  fileText: string;
  fileName: string;
  mapping: ColumnMapping;
  importadoPorId: string;
}): Promise<ImportSummary> {
  const { organizationId, fileText, fileName, mapping, importadoPorId } = input;
  const { header, rows } = parseCsv(fileText);
  const leadWhereField = mapping.matchBy;

  const candidates = await prisma.lead.findMany({
    where: { organizationId },
    select: { id: true, telefone: true, email: true, nome: true }
  });
  const candidatesByMatchValue = new Map<string, (typeof candidates)[number]>();
  for (const lead of candidates) {
    const value = lead[leadWhereField];
    if (!value) continue;
    const normalized = leadWhereField === 'telefone' ? normalizePhone(value) : normalizeText(value);
    candidatesByMatchValue.set(normalized, lead);
  }

  const erros: ImportError[] = [];
  const updates: { leadId: string; data: MappedRow['data']; flags: Record<string, string> }[] = [];

  rows.forEach((row, index) => {
    const linha = index + 2; // +1 header, +1 humano (1-based)
    const mapped = mapRowToLeadUpdate(row, header, mapping);

    if (!mapped.matchValue) {
      erros.push({ linha, motivo: `Coluna de match (${mapping.columns.matchColumn}) vazia` });
      return;
    }

    const found = candidatesByMatchValue.get(mapped.matchValue);
    if (!found) {
      erros.push({ linha, motivo: `Nenhum lead encontrado para ${mapping.matchBy}="${mapped.matchValue}"` });
      return;
    }

    updates.push({ leadId: found.id, data: mapped.data, flags: mapped.flags });
  });

  const batch = await prisma.leadImportBatch.create({
    data: {
      organizationId,
      arquivoNome: fileName,
      colunasMapeamento: mapping,
      totalLinhas: rows.length,
      totalAtualizados: updates.length,
      totalNaoEncontrados: erros.length,
      erros_json: erros,
      importadoPorId
    }
  });

  await Promise.all(
    updates.map(({ leadId, data, flags }) =>
      prisma.lead.update({
        where: { id: leadId },
        data: {
          ...data,
          prospeccaoFlags: Object.keys(flags).length > 0 ? flags : undefined,
          importBatchId: batch.id
        }
      })
    )
  );

  logger.info({ organizationId, batchId: batch.id, totalAtualizados: updates.length, erros: erros.length }, 'lead import batch processed');

  return {
    batchId: batch.id,
    totalLinhas: rows.length,
    totalAtualizados: updates.length,
    totalNaoEncontrados: erros.length,
    erros
  };
}
