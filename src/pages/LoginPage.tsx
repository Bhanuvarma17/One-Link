import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, User, AlertCircle, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 bg-[#FFFDF5]">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="rounded-3xl border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD600] text-black mb-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <LogIn className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-black text-[#1A1A1A]">Welcome back</h1>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Log in to manage your OneLink bio profile and links.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-[#FFF1F2] p-3.5 text-xs font-black text-rose-950 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" />
              <span>{error}</span>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-black">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  placeholder="bhanu or bhanu@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white pl-10 pr-3.5 py-2.5 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                  Password
                </label>
                <button
                  type="button"
                  id="toggle-password-text-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-black text-slate-600 hover:text-black flex items-center gap-1 transition-colors"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-black">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white pl-10 pr-11 py-2.5 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-600 hover:text-black transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'View password'}
                  title={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-black" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD600] border-2 border-black py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all mt-2"
            >
              {isSubmitting ? 'Logging In...' : 'Log In to Dashboard'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="mt-8 pt-6 border-t-2 border-black/10">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-600 mb-3 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-black" />
              <span>Quick Test Demo Accounts:</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="quick-login-bhanu"
                onClick={() => handleQuickDemoLogin('bhanu')}
                className="flex items-center justify-center gap-1 rounded-xl border-2 border-black bg-[#FFFDF5] py-2.5 px-3 text-xs font-black text-black hover:bg-[#FFD600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>Bhanu Varma</span>
              </button>

              <button
                type="button"
                id="quick-login-sarah"
                onClick={() => handleQuickDemoLogin('sarah_design')}
                className="flex items-center justify-center gap-1 rounded-xl border-2 border-black bg-[#FFFDF5] py-2.5 px-3 text-xs font-black text-black hover:bg-[#FF80B5] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>Sarah Chen</span>
              </button>
            </div>
            <p className="text-[11px] font-bold text-slate-500 text-center mt-2.5">
              Demo accounts use password: <code className="font-mono font-black text-black bg-neutral-100 px-1.5 py-0.5 rounded border border-black/20">password123</code>
            </p>
          </div>
        </div>

        {/* Bottom Switcher */}
        <div className="text-center">
          <p className="text-xs font-bold text-slate-600">
            Don&apos;t have a OneLink page yet?{' '}
            <button
              id="goto-signup-btn"
              onClick={() => onNavigate('/signup')}
              className="font-black text-black underline decoration-2 hover:text-[#6366F1]"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
