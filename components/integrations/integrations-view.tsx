'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSignature,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Settings2,
  Sparkles,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Integration = {
  id: 'mailchimp' | 'zapsign' | 'whatsapp';
  name: string;
  description: string;
  status: 'connected' | 'available';
  icon: typeof Mail;
  iconClass: string;
  iconBackground: string;
  detail: string;
  action: string;
};

const integrations: Integration[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Envie relatórios e campanhas personalizadas para a sua base de clientes.',
    status: 'connected',
    icon: Mail,
    iconClass: 'text-amber-950',
    iconBackground: 'bg-[#f8d978]',
    detail: 'Conta Moita • Sincronizado há 5 min',
    action: 'Gerenciar',
  },
  {
    id: 'zapsign',
    name: 'ZapSign',
    description: 'Acompanhe contratos enviados, assinados e pendentes sem sair do CRM.',
    status: 'connected',
    icon: FileSignature,
    iconClass: 'text-white',
    iconBackground: 'bg-[#6756e8]',
    detail: '12 contratos acompanhados',
    action: 'Gerenciar',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Centralize conversas e fale com seus leads diretamente pelo Moita.',
    status: 'available',
    icon: MessageCircle,
    iconClass: 'text-white',
    iconBackground: 'bg-[#22bf62]',
    detail: 'WhatsApp Cloud API',
    action: 'Conectar',
  },
];

const activities = [
  {
    icon: Check,
    iconClass: 'bg-emerald-100 text-emerald-700',
    title: 'Contrato assinado por Marina Costa',
    detail: 'ZapSign • Contrato #0048',
    time: 'Há 12 min',
  },
  {
    icon: Send,
    iconClass: 'bg-amber-100 text-amber-700',
    title: 'Relatório mensal entregue',
    detail: 'Mailchimp • 48 destinatários',
    time: 'Hoje, 09:32',
  },
  {
    icon: Users,
    iconClass: 'bg-violet-100 text-violet-700',
    title: '3 novos contatos sincronizados',
    detail: 'Mailchimp • Lista Clientes ativos',
    time: 'Ontem, 17:45',
  },
];

export function IntegrationsView() {
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleIntegration(integration: Integration) {
    setFeedback(
      integration.status === 'connected'
        ? `Abrindo configurações do ${integration.name}`
        : `Vamos iniciar a conexão com o ${integration.name}`,
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 pb-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-brand">Ecossistema Moita</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Integrações
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Conecte as ferramentas do seu time e mantenha toda a operação em um só lugar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFeedback('Solicitação de nova integração iniciada')}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand/40 hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Plus className="h-4 w-4" /> Sugerir integração
        </button>
      </header>

      {feedback && (
        <div
          role="status"
          className="flex items-center justify-between rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm font-medium text-brand"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {feedback}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl bg-[#142d28] p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#80c98c]/10" />
        <div className="absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" /> Automações que trabalham por você
            </div>
            <h2 className="max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">
              Menos tarefas manuais. Mais tempo para seus clientes.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Conecte comunicação, documentos e relatórios para criar uma jornada comercial fluida e
              mensurável.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['2', 'conectadas'],
              ['3', 'fluxos ativos'],
              ['98%', 'entregues'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-4 text-center backdrop-blur"
              >
                <strong className="block text-xl font-semibold sm:text-2xl">{value}</strong>
                <span className="mt-1 block text-[11px] text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Suas integrações</h2>
            <p className="text-sm text-slate-500">
              Configure e acompanhe as conexões da sua empresa.
            </p>
          </div>
          <button
            className="hidden text-sm font-semibold text-brand hover:underline sm:block"
            type="button"
          >
            Ver catálogo
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <article
                key={integration.id}
                className="group flex min-h-[245px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'grid h-12 w-12 place-items-center rounded-xl',
                      integration.iconBackground,
                    )}
                  >
                    <Icon className={cn('h-6 w-6', integration.iconClass)} />
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                      integration.status === 'connected'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        integration.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-400',
                      )}
                    />
                    {integration.status === 'connected' ? 'Conectado' : 'Disponível'}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold text-slate-950 dark:text-white">
                  {integration.name}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                  {integration.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="truncate pr-3 text-xs text-slate-400">{integration.detail}</span>
                  <button
                    type="button"
                    onClick={() => handleIntegration(integration)}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline"
                  >
                    {integration.action} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Fluxos inteligentes</h2>
              <p className="text-sm text-slate-500">
                Automatize etapas importantes da jornada do cliente.
              </p>
            </div>
            <button
              type="button"
              aria-label="Mais opções"
              className="text-slate-400 hover:text-slate-600"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
            <Workflow
              icon={FileSignature}
              title="Contrato assinado"
              description="Atualizar negócio como ganho e avisar o responsável"
              steps={['ZapSign', 'Moita CRM']}
              active
            />
            <Workflow
              icon={Mail}
              title="Relatório mensal"
              description="Enviar o relatório de resultados no primeiro dia útil"
              steps={['Relatórios', 'Mailchimp']}
              active
            />
            <Workflow
              icon={MessageCircle}
              title="Novo lead recebido"
              description="Enviar mensagem de boas-vindas em até 5 minutos"
              steps={['Moita CRM', 'WhatsApp']}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Atividade recente</h2>
              <p className="text-sm text-slate-500">Últimas ações das integrações.</p>
            </div>
            <Clock3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-1">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.title}
                  className="flex gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800"
                >
                  <div
                    className={cn(
                      'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full',
                      activity.iconClass,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {activity.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{activity.detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400">{activity.time}</span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Ver toda a atividade <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>
    </div>
  );
}

function Workflow({
  icon: Icon,
  title,
  description,
  steps,
  active = false,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  steps: [string, string];
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-brand/20 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          {active && (
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              Ativo
            </span>
          )}
        </div>
        <p className="truncate text-xs text-slate-500">{description}</p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">
          {steps[0]} → {steps[1]}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Configurar fluxo ${title}`}
        className="p-2 text-slate-400 hover:text-brand"
      >
        <Settings2 className="h-4 w-4" />
      </button>
    </div>
  );
}
