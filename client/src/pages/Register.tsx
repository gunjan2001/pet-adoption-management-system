import React from 'react';
import { useLocation, Link } from 'wouter';
import { RegisterForm } from '@/components/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const RegisterPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleRegisterSuccess = (token: string, user: any) => {
    // Redirect based on user role from the registration result
    if (user?.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
  };

  const handleRegisterError = (error: string) => {
    console.error('Registration error:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to start your pet adoption journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onError={handleRegisterError}
          />

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
