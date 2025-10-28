'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/forms/zod-resolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Informe sua senha'),
  remember: z.boolean().optional()
});

type FormData = z.infer<typeof schema>;

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: false }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    });

    setLoading(false);
    if (result?.error) {
      toast({ title: 'Erro ao entrar', description: result.error, variant: 'destructive' });
      return;
    }

    window.location.href = '/dashboard';
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Moita CRM</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Sua operação comercial sob controle</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      >
        <Icons.google className="mr-2 h-4 w-4" /> Entrar com Google
      </Button>
    </form>
  );
}
