import { z } from 'zod';

export type EntityConfig = {
  model: string;
  schema: z.ZodTypeAny;
  searchable?: string[];
};

export const entityConfigs = {
  users: {
    model: 'user',
    schema: z.object({
      nome: z.string(),
      email: z.string().email(),
      senha_hash: z.string().optional(),
      role: z.enum(['admin', 'manager', 'rep']),
      timezone: z.string().default('America/Fortaleza'),
      ativo: z.boolean().default(true)
    }),
    searchable: ['nome', 'email']
  },
  organizations: {
    model: 'organization',
    schema: z.object({
      nome: z.string(),
      cnpj_opcional: z.string().nullable().optional(),
      ownerId: z.string()
    }),
    searchable: ['nome', 'cnpj_opcional']
  },
  memberships: {
    model: 'membership',
    schema: z.object({
      userId: z.string(),
      organizationId: z.string(),
      role: z.enum(['admin', 'manager', 'rep'])
    }),
    searchable: []
  },
  pipelines: {
    model: 'pipeline',
    schema: z.object({
      organizationId: z.string(),
      nome: z.string(),
      descricao: z.string().optional(),
      ordem: z.number().int()
    }),
    searchable: ['nome', 'descricao']
  },
  stages: {
    model: 'stage',
    schema: z.object({
      pipelineId: z.string(),
      nome: z.string(),
      ordem: z.number().int(),
      probabilidade: z.number().min(0).max(1)
    }),
    searchable: ['nome']
  },
  leads: {
    model: 'lead',
    schema: z.object({
      organizationId: z.string(),
      nome: z.string(),
      empresa: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      telefone: z.string().optional(),
      origem: z.string().optional(),
      ownerId: z.string().optional(),
      score: z.number().min(0).max(100).default(0),
      status: z.string().default('novo'),
      consentimentoContato: z.boolean().default(true),
      doNotContact: z.boolean().default(false)
    }),
    searchable: ['nome', 'empresa', 'email', 'telefone']
  },
  deals: {
    model: 'deal',
    schema: z.object({
      leadId: z.string(),
      pipelineId: z.string(),
      stageId: z.string(),
      valorPrevistoBRL: z.number().default(0),
      moeda: z.string().default('BRL'),
      probabilidade: z.number().min(0).max(1).default(0),
      dataFechamentoPrevista: z.string().datetime().optional(),
      responsavelId: z.string().optional()
    }),
    searchable: []
  },
  activities: {
    model: 'activity',
    schema: z.object({
      organizationId: z.string(),
      leadId: z.string().optional().nullable(),
      dealId: z.string().optional().nullable(),
      tipo: z.enum(['call', 'meet', 'email', 'whatsapp', 'tarefa']),
      titulo: z.string(),
      descricao: z.string().optional(),
      dueAt: z.string().datetime().optional(),
      doneAt: z.string().datetime().optional(),
      ownerId: z.string()
    }),
    searchable: ['titulo', 'descricao']
  },
  calendarEvents: {
    model: 'calendarEvent',
    schema: z.object({
      organizationId: z.string(),
      titulo: z.string(),
      descricao: z.string().optional(),
      inicio: z.string().datetime(),
      fim: z.string().datetime(),
      allDay: z.boolean().default(false),
      ownerId: z.string(),
      relatedLeadId: z.string().optional(),
      relatedDealId: z.string().optional()
    }),
    searchable: ['titulo', 'descricao']
  },
  customFieldDefinitions: {
    model: 'customFieldDefinition',
    schema: z.object({
      organizationId: z.string(),
      scope: z.enum(['lead', 'deal', 'organization', 'pipeline']),
      key: z.string(),
      label: z.string(),
      tipo: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'boolean']),
      options: z.array(z.string()).optional(),
      required: z.boolean().default(false),
      uniquePerOrg: z.boolean().default(false)
    }),
    searchable: ['label', 'key']
  },
  customFieldValues: {
    model: 'customFieldValue',
    schema: z.object({
      definitionId: z.string(),
      entityId: z.string(),
      value_json: z.any()
    }),
    searchable: []
  },
  notes: {
    model: 'note',
    schema: z.object({
      organizationId: z.string(),
      leadId: z.string().optional(),
      dealId: z.string().optional(),
      authorId: z.string(),
      content: z.string()
    }),
    searchable: ['content']
  },
  files: {
    model: 'file',
    schema: z.object({
      organizationId: z.string(),
      leadId: z.string().optional(),
      dealId: z.string().optional(),
      authorId: z.string(),
      name: z.string(),
      url: z.string().url(),
      mime: z.string(),
      size: z.number()
    }),
    searchable: ['name', 'mime']
  },
  auditLogs: {
    model: 'auditLog',
    schema: z.object({
      organizationId: z.string(),
      actorId: z.string(),
      action: z.string(),
      entityType: z.string(),
      entityId: z.string(),
      diff_json: z.any(),
      createdAt: z.string().datetime().optional()
    }),
    searchable: ['action', 'entityType', 'entityId']
  },
  webhooks: {
    model: 'webhook',
    schema: z.object({
      organizationId: z.string(),
      url: z.string().url(),
      secret: z.string(),
      events: z.array(z.string())
    }),
    searchable: ['url']
  },
  scoringRules: {
    model: 'scoringRule',
    schema: z.object({
      organizationId: z.string(),
      nome: z.string(),
      peso: z.number(),
      condicao_json: z.any(),
      ativo: z.boolean().default(true)
    }),
    searchable: ['nome']
  },
  slaConfigs: {
    model: 'sLAConfig',
    schema: z.object({
      organizationId: z.string(),
      nome: z.string(),
      alvo: z.enum(['primeiro_contato', 'mover_estagio']),
      prazoMinutos: z.number().int(),
      ativo: z.boolean().default(true)
    }),
    searchable: ['nome']
  }
} as const satisfies Record<string, EntityConfig>;

export type EntityKey = keyof typeof entityConfigs;
