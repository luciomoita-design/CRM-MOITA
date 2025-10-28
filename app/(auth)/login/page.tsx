import { SignInForm } from '@/components/auth/sign-in-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur dark:bg-slate-900/80">
        <SignInForm />
      </div>
    </div>
  );
}
