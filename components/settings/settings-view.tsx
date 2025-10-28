import Link from 'next/link';

export function SettingsView() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Configurações</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Configure pipelines, campos personalizados, permissões e webhooks da sua organização.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <Link href="/dashboard/configuracoes/campos" className="text-brand hover:underline">
              Campos personalizados
            </Link>
          </li>
          <li>
            <Link href="/dashboard/configuracoes/seguranca" className="text-brand hover:underline">
              Segurança e LGPD
            </Link>
          </li>
          <li>
            <Link href="/dashboard/configuracoes/webhooks" className="text-brand hover:underline">
              Webhooks
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
