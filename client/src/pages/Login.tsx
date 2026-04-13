import React from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/LoginForm';

export const LoginPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleLoginSuccess = (token: string, user: any) => {
    // Redirect based on user role from the login result
    if (user?.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
