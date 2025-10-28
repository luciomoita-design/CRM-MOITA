import { prisma } from '@/server/prisma';

export async function ReportsView() {
  const deals = await prisma.deal.findMany({ include: { stage: true } });
  const pipelineValue = deals.reduce((acc, deal) => acc + (deal.valorPrevistoBRL ?? 0), 0);
  const ganhos = deals.filter((deal) => deal.stage.nome === 'Ganhou').length;
  const perdidos = deals.filter((deal) => deal.stage.nome === 'Perdido').length;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Relatórios resumidos</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs uppercase text-slate-500">Valor total</p>
          <p className="text-2xl font-semibold text-brand">R$ {pipelineValue.toLocaleString('pt-BR')}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-white p-4 shadow-sm dark:border-green-900/60 dark:bg-slate-900/80">
          <p className="text-xs uppercase text-slate-500">Negócios ganhos</p>
          <p className="text-2xl font-semibold text-green-600">{ganhos}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm dark:border-red-900/60 dark:bg-slate-900/80">
          <p className="text-xs uppercase text-slate-500">Negócios perdidos</p>
          <p className="text-2xl font-semibold text-red-600">{perdidos}</p>
        </div>
      </div>
    </div>
  );
}
