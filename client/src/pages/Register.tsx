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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow w-full max-w-md">
        <div className="p-8">
          <div className="space-y-2 mb-4">
            <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-600 text-sm">
              Sign up to start your pet adoption journey
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};