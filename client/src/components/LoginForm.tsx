import { useAuth } from '@/_core/hooks/useAuth';
import { getErrorMessage, getFieldErrors } from '@/lib/errorHandler';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { GoogleSignInButton } from './GoogleButton';

// ── Validation functions ───────────────────────────────────────────────────
const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
};

export default function LoginForm() {
  const { login, isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [googleError, setGoogleError] = useState("");


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Field-specific errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const destination = user?.role === 'admin' ? '/admin' : '/dashboard';
    navigate(destination);
  }, [isAuthenticated, user?.role, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    // If any validation fails, don't submit
    if (emailValidation || passwordValidation) {
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
    } catch (err) {
      // Show backend errors in toast
      const fields = getFieldErrors(err);
      if (fields.length > 0) {
        toast.error(fields.map((f) => f.message).join(' · '));
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="you@example.com"
            autoComplete="off"
            className={`w-full px-4 py-2.5 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
              emailError
                ? 'border-red-300 focus:ring-red-400'
                : 'border-gray-200 focus:ring-amber-400'
            }`}
          />
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              placeholder="••••••••"
              autoComplete="off"
              className={`w-full px-4 py-2.5 pr-11 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                passwordError
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-gray-200 focus:ring-amber-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-500 mt-1">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {/* ── Divider ── */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── Google button ── */}
      <GoogleSignInButton
        onSuccess={() => navigate('/pets')}
        onError={(msg) => setGoogleError(msg)}
      />

      {googleError && (
        <p className="text-xs text-red-500 text-center mt-1">{googleError}</p>
      )}
    </div>
  );
}
