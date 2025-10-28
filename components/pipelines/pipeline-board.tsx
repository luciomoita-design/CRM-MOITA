import { getPipelineSnapshot } from '@/server/services/dashboard-service';
import { formatCurrencyBRL } from '@/lib/utils';

export async function PipelineBoard() {
  const snapshot = await getPipelineSnapshot();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {snapshot.map((stage) => (
        <div key={stage.stageId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {stage.stageName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{stage.deals} negócios</p>
          <p className="mt-2 text-lg font-semibold text-brand">
            {formatCurrencyBRL(stage.totalValue)}
          </p>
        </div>
      ))}
    </div>
  );
}
