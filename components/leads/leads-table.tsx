import { prisma } from '@/server/prisma';

export async function LeadsTable() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { organization: true }
  });

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900/80">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Leads recentes</h2>
      <table className="mt-4 w-full table-auto text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="px-2 py-2">Nome</th>
            <th className="px-2 py-2">Empresa</th>
            <th className="px-2 py-2">Origem</th>
            <th className="px-2 py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t border-slate-100 text-slate-700 dark:border-slate-800 dark:text-slate-200">
              <td className="px-2 py-2">{lead.nome}</td>
              <td className="px-2 py-2">{lead.empresa ?? '-'}</td>
              <td className="px-2 py-2">{lead.origem ?? '-'}</td>
              <td className="px-2 py-2">{lead.score}</td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={4} className="px-2 py-6 text-center text-slate-500">
                Nenhum lead cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
