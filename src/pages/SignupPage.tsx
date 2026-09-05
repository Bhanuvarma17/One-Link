import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { UserPlus, Mail, Key, User, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (path: string) => void;
  initialUsername?: string;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate, initialUsername = '' }) => {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; error?: string }>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const mainOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  // Debounced live handle check
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus({});
      return;
    }

    const clean = username.trim().toLowerCase();
    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await authApi.checkUsername(clean);
        setUsernameStatus(res);
      } catch {
        // Ignore
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!username.trim()) {
      setError('Please choose a username for your link.');
      return;
    }

    if (usernameStatus.available === false) {
      setError(usernameStatus.error || 'Username is not available.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup({
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        displayName: displayName.trim() || username.trim(),
        password,
      });

      if (res.success) {
        onNavigate('/dashboard');
      } else {
        setError(res.error || 'Failed to create account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 bg-[#FFFDF5]">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-3xl border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD600] text-black mb-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <UserPlus className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-black text-[#1A1A1A]">Claim your OneLink</h1>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Create your permanent public URL in under 60 seconds.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-[#FFF1F2] p-3.5 text-xs font-black text-rose-950 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" />
              <span>{error}</span>
            </div>
          )}

          <form id="signup-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="signup-username" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Choose Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-black font-mono font-black text-sm">
                  /
                </div>
                <input
                  id="signup-username"
                  type="text"
                  required
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full rounded-xl border-2 border-black bg-white pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
                />
              </div>

              {/* Live Public URL Preview & Username feedback */}
              {isCheckingUsername && (
                <p className="text-[11px] font-bold text-slate-500 mt-1">Checking handle availability...</p>
              )}
              {username && usernameStatus.available === true && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#ECFDF5] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[11px] text-emerald-950">
                  <div className="flex items-center gap-1.5 font-black text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Handle is available!</span>
                  </div>
                  <p className="font-mono font-bold text-slate-700 mt-1 break-all">
                    Public URL: <span className="font-black text-black underline bg-[#FFD600]/30 px-1 py-0.5 rounded">{mainOrigin}/{username}</span>
                  </p>
                </div>
              )}
              {usernameStatus.available === false && (
                <p className="text-[11px] font-black text-rose-600 mt-1">
                  ✗ {usernameStatus.error || 'Username already taken.'}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="signup-display-name" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Your Full Name / Display Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-black">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="signup-display-name"
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white pl-10 pr-3.5 py-2.5 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-black">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white pl-10 pr-3.5 py-2.5 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
                />
              </div>
            </div>

            {/* Password with View Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="signup-password" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  id="toggle-signup-password-text-btn"
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
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white pl-10 pr-11 py-2.5 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
                />
                <button
                  type="button"
                  id="toggle-signup-password-visibility-btn"
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
              id="signup-submit-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD600] border-2 border-black py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all mt-2"
            >
              {isSubmitting ? 'Creating Profile...' : 'Create My Free Page'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Bottom Switcher */}
        <div className="text-center">
          <p className="text-xs font-bold text-slate-600">
            Already have an account?{' '}
            <button
              id="goto-login-btn"
              onClick={() => onNavigate('/login')}
              className="font-black text-black underline decoration-2 hover:text-[#6366F1]"
            >
              Log in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
