import { PrismaClient, Role, ActivityTipo, CustomFieldScope, CustomFieldTipo, SLAAlvo } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('SenhaSegura123', 10);

  const organization = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      nome: 'Moita CRM Demo',
      cnpj_opcional: '12.345.678/0001-99',
      owner: {
        create: {
          nome: 'Alice Admin',
          email: 'admin@moita.crm',
          senha_hash: senhaHash,
          role: Role.admin
        }
      }
    },
    include: { owner: true }
  });

  const [manager, rep] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'manager@moita.crm' },
      update: {},
      create: {
        nome: 'Marcelo Manager',
        email: 'manager@moita.crm',
        senha_hash: senhaHash,
        role: Role.manager
      }
    }),
    prisma.user.upsert({
      where: { email: 'rep@moita.crm' },
      update: {},
      create: {
        nome: 'Renata Rep',
        email: 'rep@moita.crm',
        senha_hash: senhaHash,
        role: Role.rep
      }
    })
  ]);

  await prisma.membership.createMany({
    data: [
      { userId: organization.ownerId, organizationId: organization.id, role: Role.admin },
      { userId: manager.id, organizationId: organization.id, role: Role.manager },
      { userId: rep.id, organizationId: organization.id, role: Role.rep }
    ],
    skipDuplicates: true
  });

  const pipeline = await prisma.pipeline.upsert({
    where: { id: 'pipeline-demo' },
    update: {},
    create: {
      id: 'pipeline-demo',
      nome: 'Pipeline Padrão',
      descricao: 'Prospecção até fechamento',
      ordem: 1,
      organizationId: organization.id
    }
  });

  const stageNames = [
    { nome: 'Prospecção', probabilidade: 0.1 },
    { nome: 'Qualificado', probabilidade: 0.3 },
    { nome: 'Proposta', probabilidade: 0.5 },
    { nome: 'Fechamento', probabilidade: 0.7 },
    { nome: 'Ganhou', probabilidade: 0.95 },
    { nome: 'Perdido', probabilidade: 0.05 }
  ];

  const stages = [] as { id: string; nome: string; probabilidade: number }[];
  for (const [index, item] of stageNames.entries()) {
    const stage = await prisma.stage.upsert({
      where: { id: `${pipeline.id}-${item.nome}` },
      update: {},
      create: {
        id: `${pipeline.id}-${item.nome}`,
        pipelineId: pipeline.id,
        nome: item.nome,
        ordem: index + 1,
        probabilidade: item.probabilidade
      }
    });
    stages.push(stage);
  }

  const leads = await prisma.lead.createMany({
    data: [
      {
        id: 'lead-1',
        organizationId: organization.id,
        nome: 'João Silva',
        empresa: 'Silva Tech',
        email: 'joao@silvatech.com',
        telefone: '+55 (85) 99999-0000',
        origem: 'Indicação',
        ownerId: manager.id,
        score: 75
      },
      {
        id: 'lead-2',
        organizationId: organization.id,
        nome: 'Carla Mendes',
        empresa: 'Mendes Finance',
        email: 'carla@mendesfinance.com',
        telefone: '+55 (11) 98888-7777',
        origem: 'Orgânico',
        ownerId: rep.id,
        score: 60
      }
    ],
    skipDuplicates: true
  });

  await prisma.deal.createMany({
    data: [
      {
        id: 'deal-1',
        leadId: 'lead-1',
        pipelineId: pipeline.id,
        stageId: stages[2].id,
        valorPrevistoBRL: 25000,
        moeda: 'BRL',
        probabilidade: stages[2].probabilidade,
        responsavelId: manager.id
      },
      {
        id: 'deal-2',
        leadId: 'lead-2',
        pipelineId: pipeline.id,
        stageId: stages[0].id,
        valorPrevistoBRL: 15000,
        moeda: 'BRL',
        probabilidade: stages[0].probabilidade,
        responsavelId: rep.id
      }
    ],
    skipDuplicates: true
  });

  await prisma.activity.createMany({
    data: [
      {
        id: 'act-1',
        organizationId: organization.id,
        leadId: 'lead-1',
        tipo: ActivityTipo.call,
        titulo: 'Ligação inicial',
        descricao: 'Apresentação da Moita CRM',
        dueAt: new Date(),
        ownerId: manager.id
      },
      {
        id: 'act-2',
        organizationId: organization.id,
        dealId: 'deal-2',
        tipo: ActivityTipo.email,
        titulo: 'Enviar proposta',
        dueAt: new Date(),
        ownerId: rep.id
      }
    ],
    skipDuplicates: true
  });

  await prisma.customFieldDefinition.createMany({
    data: [
      {
        id: 'cf-indice',
        organizationId: organization.id,
        scope: CustomFieldScope.lead,
        key: 'setor',
        label: 'Setor',
        tipo: CustomFieldTipo.select,
        options: ['Tecnologia', 'Serviços', 'Varejo'],
        required: false,
        uniquePerOrg: false
      }
    ],
    skipDuplicates: true
  });

  await prisma.scoringRule.createMany({
    data: [
      {
        id: 'score-origem-indicacao',
        organizationId: organization.id,
        nome: 'Origem Indicação',
        peso: 25,
        condicao_json: { field: 'origem', op: 'eq', value: 'Indicação' },
        ativo: true
      },
      {
        id: 'score-origem-organico',
        organizationId: organization.id,
        nome: 'Origem Orgânica',
        peso: 15,
        condicao_json: { field: 'origem', op: 'eq', value: 'Orgânico' },
        ativo: true
      }
    ],
    skipDuplicates: true
  });

  await prisma.sLAConfig.createMany({
    data: [
      {
        id: 'sla-primeiro-contato',
        organizationId: organization.id,
        nome: 'Primeiro contato em 30 minutos',
        alvo: SLAAlvo.primeiro_contato,
        prazoMinutos: 30,
        ativo: true
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed concluído');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
