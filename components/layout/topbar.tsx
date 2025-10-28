'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

export const Topbar = () => {
  const { data } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/70 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Visão geral</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {data?.user?.name ? `Bem-vindo(a), ${data.user.name}` : 'Acompanhe suas negociações em tempo real.'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Alternar tema"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>
    </header>
  );
};
