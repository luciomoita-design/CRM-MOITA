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
ios/                      # Projeto iOS nativo (SwiftUI + Clean Architecture)
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

## Aplicativo iOS nativo (Moita CRM)

O diretório `ios/` contém um aplicativo nativo SwiftUI para iOS 17+ construído com Swift 5.9, Combine e SwiftData seguindo Clean Architecture + MVVM.

### Pré-requisitos

- Xcode 15 ou superior (iOS 17 SDK)
- Swift 5.9+

### Estrutura iOS

```
ios/MoitaCRM.xcodeproj            # Projeto Xcode com targets App, Widgets, Intents e Testes
ios/MoitaCRM/App                  # Bootstrapping, roteamento e dependências
ios/MoitaCRM/Domain               # Modelos SwiftData, protocolos e serviços de domínio
ios/MoitaCRM/Data                 # Implementações de repositórios, rede, persistência e seeds
ios/MoitaCRM/Features             # Módulos: Auth, Leads, Pipelines, Deals, Activities, Calendar, CustomFields, Scoring, SLA, Reports, Settings
ios/MoitaCRM/Shared               # Componentes reutilizáveis, utilidades e extensões
ios/MoitaCRM/Resources            # Assets, Mock server JSON e arquivos de configuração
ios/MoitaCRMTests                 # Testes unitários (ScoringService, SLAService, SyncService)
ios/MoitaCRMUITests               # Testes UI básicos (login → lead → pipeline)
ios/MoitaCRMWidgets               # WidgetKit com tarefas e deals da semana
ios/MoitaCRMIntents               # App Intents/Siri Shortcuts para criação rápida
```

### Configuração e execução

1. Abra `ios/MoitaCRM.xcodeproj` no Xcode 15+.
2. Selecione o esquema **MoitaCRM** e rode em um simulador iOS 17 ou dispositivo.
3. O seed automático cria pipeline, usuários, leads, deals, regras de scoring e SLA demo na primeira execução.
4. Para alternar entre API mock e remota, utilize o toggle em **Configurações → Rede**.

### Funcionalidades principais do app

- Navegação TabView: Pipelines, Leads, Tarefas, Calendário, Relatórios e Configurações.
- Pipelines Kanban com arrastar/soltar (haptics) e cálculo de valor previsto por estágio.
- Leads com busca, filtros persistentes, tabs de dados, atividades, campos personalizados, notas e arquivos (placeholder).
- Deals com criação rápida a partir do lead e edição simplificada.
- Inbox de tarefas (Hoje/Próximos 7 dias/Atrasadas) com swipe para concluir e agendamento de notificações locais.
- Calendário com visões mês/semana/dia e vínculo com leads/deals.
- Builder de campos personalizados, Lead Scoring com recálculo manual/automático, monitor de SLA e alertas.
- Relatórios com conversão por estágio, tempo médio, origem e heatmap de atividades usando agregações SwiftData.
- Exportação CSV/JSON, App Intents (Siri), Widgets, seeds demo e armazenamento seguro de tokens no Keychain.

### Build de Release

1. No Xcode, selecione o esquema **MoitaCRM**.
2. Menu **Product → Archive** para gerar um build assinado.
3. Utilize o Organizer para distribuir (TestFlight/App Store) ou exportar IPA.

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
