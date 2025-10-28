import '@/styles/globals.css';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppProviders } from '@/components/providers';

export const metadata = {
  title: 'Moita CRM',
  description: 'CRM e gestão comercial focado no Brasil com LGPD.'
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <NextIntlClientProvider messages={messages} locale="pt-BR" timeZone="America/Fortaleza">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppProviders>
              {children}
              <Toaster />
            </AppProviders>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
