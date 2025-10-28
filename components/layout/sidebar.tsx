'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Calendar,
  ListChecks,
  Cog,
  BarChart3
} from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/pipelines', label: 'Pipelines', icon: KanbanSquare },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/tarefas', label: 'Tarefas', icon: ListChecks },
  { href: '/dashboard/calendario', label: 'Calendário', icon: Calendar },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Cog }
];

export const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/80 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:flex">
      <div className="mb-8">
        <Link href="/dashboard" className="text-2xl font-semibold text-brand">
          Moita CRM
        </Link>
        <p className="text-sm text-slate-500 dark:text-slate-400">Operação comercial completa</p>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand/10 text-brand shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg bg-slate-100 p-4 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
        <p>
          Dados sensíveis são tratados conforme a <strong>LGPD</strong>. Consulte a auditoria em Configurações → Segurança.
        </p>
      </div>
    </aside>
  );
};
