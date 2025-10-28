import { prisma } from '@/server/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function CalendarView() {
  const events = await prisma.calendarEvent.findMany({
    orderBy: { inicio: 'asc' },
    take: 20
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Agenda</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <div key={event.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{event.titulo}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {format(event.inicio, "dd/MM/yyyy HH:mm", { locale: ptBR })} -
              {format(event.fim, " HH:mm", { locale: ptBR })}
            </p>
          </div>
        ))}
        {events.length === 0 && <p>Nenhum evento agendado.</p>}
      </div>
    </div>
  );
}
