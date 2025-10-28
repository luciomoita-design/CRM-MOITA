import { getPipelineSnapshot } from '@/server/services/dashboard-service';
import { formatCurrencyBRL } from '@/lib/utils';

export async function PipelineSnapshot() {
  const snapshot = await getPipelineSnapshot();
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900/80">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Pipelines em andamento</h3>
      <div className="mt-4 grid gap-4">
        {snapshot.map((stage) => (
          <div key={stage.stageId} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stage.stageName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stage.deals} deals</p>
              </div>
              <span className="text-sm font-medium text-brand">
                {formatCurrencyBRL(stage.totalValue)}
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: `${Math.min(stage.probability * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
        {snapshot.length === 0 && <p>Nenhum negócio ativo.</p>}
      </div>
    </div>
  );
}
