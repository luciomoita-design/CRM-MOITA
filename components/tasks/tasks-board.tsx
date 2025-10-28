import { prisma } from '@/server/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function TasksBoard() {
  const tasks = await prisma.activity.findMany({
    where: { tipo: 'tarefa' },
    orderBy: { dueAt: 'asc' },
    take: 20
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Minhas tarefas</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{task.titulo}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {task.dueAt ? format(task.dueAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : 'Sem data'}
            </p>
          </div>
        ))}
        {tasks.length === 0 && <p>Nenhuma tarefa cadastrada.</p>}
      </div>
    </div>
  );
}
