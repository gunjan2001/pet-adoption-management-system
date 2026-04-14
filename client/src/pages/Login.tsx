import React, { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/_core/hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;

    const destination = user?.role === 'admin' ? '/admin' : '/dashboard';
    setLocation(destination);
  }, [isAuthenticated, user?.role, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full max-w-md">
        <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6">
          <h1 className="leading-none font-semibold text-2xl">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email and password to sign in to your account
          </p>
        </div>
        <div className="px-6">
          <LoginForm />

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
