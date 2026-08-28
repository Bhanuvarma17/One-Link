import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { UserPlus, Mail, Key, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; error?: string }>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-neutral-50">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white mb-3 shadow-2xs">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-950">Claim your OneLink</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Create your permanent profile page in under 60 seconds.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 border border-rose-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form id="signup-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="signup-username" className="block text-xs font-bold text-neutral-700 mb-1.5">
                Choose Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400 font-mono text-sm">
                  /
                </div>
                <input
                  id="signup-username"
                  type="text"
                  required
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-8 pr-3.5 py-2.5 text-sm font-mono text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Username feedback */}
              {isCheckingUsername && (
                <p className="text-[11px] text-neutral-400 mt-1">Checking handle availability...</p>
              )}
              {usernameStatus.available === true && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  onelink.bio/{username} is available!
                </p>
              )}
              {usernameStatus.available === false && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  ✗ {usernameStatus.error || 'Username already taken.'}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="signup-display-name" className="block text-xs font-bold text-neutral-700 mb-1.5">
                Your Full Name / Display Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="signup-display-name"
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-bold text-neutral-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-bold text-neutral-700 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              id="signup-submit-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 active:scale-95 disabled:opacity-50 transition-all mt-2"
            >
              {isSubmitting ? 'Creating Profile...' : 'Create My Free Page'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Bottom Switcher */}
        <div className="text-center">
          <p className="text-xs text-neutral-600">
            Already have an account?{' '}
            <button
              id="goto-login-btn"
              onClick={() => onNavigate('/login')}
              className="font-bold text-neutral-900 hover:underline hover:text-indigo-600"
            >
              Log in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
