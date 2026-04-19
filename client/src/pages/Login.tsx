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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow w-full max-w-md">
        <div className="p-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-black text-gray-900">Sign In</h1>
            <p className="text-gray-600 text-sm">
              Enter your email and password to access your account
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};