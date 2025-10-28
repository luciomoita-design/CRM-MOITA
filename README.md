# Moita CRM

Moita CRM é um CRM completo e moderno, focado no mercado brasileiro e em conformidade com a LGPD. O projeto utiliza Next.js 14 (App Router), Prisma ORM com PostgreSQL, autenticação com NextAuth e uma UI construída com Tailwind CSS e shadcn/ui.

## Recursos principais

- Cadastro e qualificação de leads
- Vendas em pipelines com múltiplos estágios (Kanban)
- Tarefas e calendário com lembretes via BullMQ (Redis)
- Campos personalizados por organização
- Lead scoring configurável e SLA de atendimento
- RBAC (admin, manager, rep), auditoria e logs
- Observabilidade com Pino + OpenTelemetry
- Seeds com dados demo (organização, usuários, pipeline, leads, deals)
- Testes com Vitest e Playwright

## Estrutura do projeto

```
app/                     # Rotas e páginas (App Router)
components/              # Componentes UI e blocos de funcionalidade
lib/                      # Utilidades e configuração de API
server/                   # Serviços de domínio, Prisma e autenticação
prisma/                   # Schema, migração inicial e seed
infra/                    # Configuração do OpenTelemetry collector
```

## Requisitos

- Node.js 18+
- Docker e docker-compose (opcional para ambiente completo)
- PostgreSQL 15
- Redis 7

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário.

```
cp .env.example .env
```

Variáveis principais:

- `DATABASE_URL`: string de conexão PostgreSQL
- `NEXTAUTH_SECRET`: segredo JWT NextAuth
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: credenciais OAuth do Google
- `REDIS_URL`: conexão BullMQ
- `OTEL_EXPORTER_OTLP_ENDPOINT`: endpoint OTLP para traces

## Scripts npm

- `npm run dev` – inicia o servidor Next.js em modo desenvolvimento
- `npm run build` – build de produção
- `npm run start` – inicia o servidor em modo produção
- `npm run lint` – lint com ESLint/Prettier
- `npm run test` – testes unitários Vitest
- `npm run test:e2e` – testes Playwright
- `npm run db:migrate` – aplica migrações Prisma
- `npm run db:seed` – executa seeds (requer `DATABASE_URL` configurada)

## Preview estático

Quer validar rapidamente o fluxo completo antes de executar a stack? Abra os arquivos em `preview/` diretamente no navegador (duplo clique) ou sirva a pasta com `npx serve preview`. Cada tela replica o layout, copy e interações planejadas na aplicação Next.js e possui alternância entre temas claro/escuro.

| Tela | Caminho | Destaques |
| --- | --- | --- |
| Hub de navegação | `preview/index.html` | Coleção de telas, instruções de execução com Docker e credenciais demo. |
| Login | `preview/login.html` | Formulário NextAuth com validação Zod e feedback de erros. |
| Dashboard | `preview/dashboard.html` | KPIs, snapshot de pipeline, heatmap de atividades e conversão por origem. |
| Leads | `preview/leads.html` | Lista com filtros salvos, quick view, consentimento LGPD e ações rápidas. |
| Pipelines | `preview/pipeline.html` | Kanban por estágio com totais previstos e estados de DnD ilustrativos. |
| Calendário | `preview/calendar.html` | Agenda semanal integrada com BullMQ e Google Calendar. |
| Tarefas | `preview/tarefas.html` | Kanban + agenda de atividades com foco em SLA. |

## Executando com docker-compose

```
docker-compose up --build
```

O comando sobe:

- Next.js (`http://localhost:3000`)
- PostgreSQL (`localhost:5432`)
- Redis (`localhost:6379`)
- OpenTelemetry Collector (`localhost:4318`)

Na primeira execução, rode as migrações e seed:

```
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

Acesse com as credenciais demo:

- **Admin**: `admin@moita.crm` / `SenhaSegura123`
- **Manager**: `manager@moita.crm` / `SenhaSegura123`
- **Rep**: `rep@moita.crm` / `SenhaSegura123`

## API

As rotas REST seguem o padrão `/api/{entidade}` com suporte a paginação (`page`, `perPage`) e busca (`q`). Exemplos:

```
GET /api/leads?page=1&perPage=20&q=joao
POST /api/leads
PATCH /api/leads/{id}
DELETE /api/leads/{id}
```

### Endpoints especiais

- `POST /api/leads/{id}/qualificar` – cria/atualiza negócio e recalcula score
- `POST /api/deals/{id}/mover` – atualiza estágio do negócio
- `POST /api/activities/{id}/concluir` – conclui atividade
- `POST /api/webhooks/test` – executa disparo de teste
- `POST /api/scoring/recalculate?entity=lead&organizationId=demo-org`

Todos os endpoints exigem sessão autenticada via NextAuth.

## Testes

```
npm run test        # Vitest
npm run test:e2e    # Playwright
```

## Convenções de código

- TypeScript estrito
- ESLint + Prettier pré-commit via Husky/lint-staged
- Formatação e traduções em PT-BR, fuso `America/Fortaleza`

## Integrações futuras

- Google Calendar, WhatsApp, SMTP e webforms possuem hooks preparados para futura implementação.
