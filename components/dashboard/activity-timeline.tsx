import { getRecentActivities } from '@/server/services/dashboard-service';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function ActivityTimeline() {
  const activities = await getRecentActivities();
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900/80">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Últimas atividades</h3>
      <ul className="mt-4 space-y-4 text-sm">
        {activities.map((activity) => (
          <li key={activity.id} className="border-l-2 border-brand/50 pl-4">
            <p className="font-medium text-slate-900 dark:text-slate-100">{activity.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activity.type} • {formatDistanceToNow(activity.when, { locale: ptBR, addSuffix: true })}
            </p>
          </li>
        ))}
        {activities.length === 0 && <li>Nenhuma atividade recente.</li>}
      </ul>
    </div>
  );
}
