import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter both your email/username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        onNavigate('/dashboard');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoIdentifier: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await login(demoIdentifier, 'password123');
      if (res.success) {
        onNavigate('/dashboard');
      } else {
        setError(res.error || 'Demo login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-neutral-50">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white mb-3 shadow-2xs">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-950">Welcome back</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Log in to manage your OneLink bio profile and links.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 border border-rose-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-bold text-neutral-700 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  placeholder="bhanu or bhanu@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 active:scale-95 disabled:opacity-50 transition-all mt-2"
            >
              {isSubmitting ? 'Logging In...' : 'Log In to Dashboard'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Quick Test Demo Accounts:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="quick-login-bhanu"
                onClick={() => handleQuickDemoLogin('bhanu')}
                className="flex items-center justify-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 py-2 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-colors shadow-2xs"
              >
                <span>Bhanu Varma</span>
              </button>

              <button
                type="button"
                id="quick-login-sarah"
                onClick={() => handleQuickDemoLogin('sarah_design')}
                className="flex items-center justify-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 py-2 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-colors shadow-2xs"
              >
                <span>Sarah Chen</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 text-center mt-2">
              Demo accounts use password: <code className="font-semibold text-neutral-600">password123</code>
            </p>
          </div>
        </div>

        {/* Bottom Switcher */}
        <div className="text-center">
          <p className="text-xs text-neutral-600">
            Don&apos;t have a OneLink page yet?{' '}
            <button
              id="goto-signup-btn"
              onClick={() => onNavigate('/signup')}
              className="font-bold text-neutral-900 hover:underline hover:text-indigo-600"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
