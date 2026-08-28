import React, { useState } from 'react';
import { Link, Share2, Sparkles, LogOut, ArrowRight, LayoutDashboard, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const publicUrl = user ? `${window.location.origin}/${user.username}` : '';

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.1, x: 0.8 },
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-white">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 text-left transition-transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-10 h-10 bg-[#FFD600] rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:rotate-6">
              <div className="w-5 h-5 bg-white rounded-full border-2 border-black flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-black" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
                OneLink
              </span>
              <span className="hidden sm:inline-block rounded-full bg-[#FFD600] px-2 py-0.5 text-[10px] font-black uppercase text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                BIO
              </span>
            </div>
          </button>

          {/* Navigation Links for Large Screens */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              id="nav-explore-btn"
              onClick={() => onNavigate('/')}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                currentPath === '/'
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-black border border-transparent'
              }`}
            >
              Explore
            </button>
            {user && (
              <button
                id="nav-dashboard-btn"
                onClick={() => onNavigate('/dashboard')}
                className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  currentPath === '/dashboard'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-black border border-transparent'
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Creator Info & Share Button */}
              <div className="hidden sm:flex flex-col text-right">
                <p className="text-xs font-black text-[#1A1A1A] leading-tight truncate max-w-[140px]">
                  {user.displayName || user.username}
                </p>
                <p className="text-[11px] font-bold text-slate-500 font-mono">
                  onelink.bio/{user.username}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full border-2 border-black bg-[#FF80B5] flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.displayName}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Share Pop Button */}
              <button
                id="nav-copy-url-btn"
                onClick={handleCopyLink}
                className="bg-[#1A1A1A] text-white px-4 py-2 rounded-full text-xs font-black tracking-wide border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-black transition-all"
              >
                {copied ? '✓ Copied' : 'Share'}
              </button>

              <button
                id="nav-visit-profile-btn"
                onClick={() => onNavigate(`/${user.username}`)}
                title="View your public live profile"
                className="hidden lg:inline-flex items-center gap-1 rounded-full bg-[#FFD600] px-3.5 py-2 text-xs font-black text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Live View</span>
              </button>

              {/* Logout Button */}
              <button
                id="nav-logout-btn"
                onClick={async () => {
                  await logout();
                  onNavigate('/');
                }}
                title="Log Out"
                className="rounded-full p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors ml-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                id="nav-login-btn"
                onClick={() => onNavigate('/login')}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-[#1A1A1A] hover:bg-neutral-100 rounded-xl transition-colors"
              >
                Log In
              </button>
              <button
                id="nav-signup-btn"
                onClick={() => onNavigate('/signup')}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FFD600] border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <span>Claim Page</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

