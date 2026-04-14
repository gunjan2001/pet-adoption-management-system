import React, { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import RegisterForm from '@/components/RegisterForm';
import { useAuth } from '@/_core/hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;

    const destination = user?.role === 'admin' ? '/admin' : '/dashboard';
    setLocation(destination);
  }, [isAuthenticated, user?.role, setLocation]);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full max-w-md">
        <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6">
          <h1 className="leading-none font-semibold text-2xl">Create Account</h1>
          <p className="text-muted-foreground text-sm">
            Sign up to start your pet adoption journey
          </p>
        </div>
        <div className="px-6">
          <RegisterForm />

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
