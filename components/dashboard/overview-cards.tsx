import { Suspense } from 'react';
import { getDashboardSummary } from '@/server/services/dashboard-service';
import { formatCurrencyBRL } from '@/lib/utils';

export async function OverviewCards() {
  const summary = await getDashboardSummary();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900/80">
        <h3 className="text-sm text-slate-500">Leads novos (7 dias)</h3>
        <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{summary.newLeads}</p>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900/80">
        <h3 className="text-sm text-slate-500">Receita prevista</h3>
        <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrencyBRL(summary.pipelineValue)}
        </p>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900/80">
        <h3 className="text-sm text-slate-500">Atividades hoje</h3>
        <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{summary.activitiesToday}</p>
      </div>
    </div>
  );
}
