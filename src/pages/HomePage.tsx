import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { publicApi } from '../services/api';
import { THEME_CONFIGS } from '../utils/themeStyles';
import {
  Link as LinkIcon, Sparkles, ArrowRight, CheckCircle2,
  ShieldCheck, Smartphone, Eye, ExternalLink, Zap, Users, Globe
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [claimHandle, setClaimHandle] = useState('');
  const [featuredCreators, setFeaturedCreators] = useState<Array<any>>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);

  useEffect(() => {
    async function loadCreators() {
      try {
        const res = await publicApi.getFeaturedCreators();
        if (res.success && res.data?.creators) {
          setFeaturedCreators(res.data.creators);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoadingCreators(false);
      }
    }
    loadCreators();
  }, []);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimHandle.trim()) return;
    const clean = claimHandle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    onNavigate(`/signup?username=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-neutral-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 border-b-2 border-black bg-white">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD600] px-4 py-1.5 text-xs font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-6">
            <Sparkles className="h-4 w-4 text-black" />
            <span>The Modern Link-in-Bio Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#1A1A1A] leading-[1.1] max-w-3xl mx-auto">
            One Link for your entire digital presence.
          </h1>

          <p className="mt-5 text-base sm:text-lg font-bold text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create a vibrant, personalized bio page in seconds. Showcase your portfolio, projects, social channels, and store under a memorable custom URL.
          </p>

          {/* Interactive Claim Username Box */}
          <div className="mt-8 mx-auto max-w-md">
            <form
              id="claim-username-form"
              onSubmit={handleClaim}
              className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl border-2 border-black bg-white p-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="flex items-center pl-3 text-black font-mono text-sm w-full sm:w-auto">
                <span className="text-black font-black">onelink.bio/</span>
                <input
                  id="claim-username-input"
                  type="text"
                  placeholder="yourname"
                  value={claimHandle}
                  onChange={(e) => setClaimHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-transparent px-1 py-2 text-sm font-mono font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                id="claim-username-btn"
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FFD600] border-2 border-black px-6 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <span>Claim Page</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="text-[11px] font-bold text-slate-500 mt-2">
              Free forever • No credit card required • Up to 20 custom links
            </p>
          </div>

          {/* Quick Demo Action for logged in / guest */}
          {user ? (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                id="hero-go-dashboard-btn"
                onClick={() => onNavigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD600] border-2 border-black px-7 py-3.5 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-black text-slate-600">Quick explore demo profiles:</span>
              <button
                id="demo-bhanu-btn"
                onClick={() => onNavigate('/bhanu')}
                className="rounded-full border-2 border-black bg-white px-3.5 py-1 text-xs font-mono font-black text-black hover:bg-[#FFD600] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                /bhanu
              </button>
              <button
                id="demo-sarah-btn"
                onClick={() => onNavigate('/sarah_design')}
                className="rounded-full border-2 border-black bg-white px-3.5 py-1 text-xs font-mono font-black text-black hover:bg-[#FF80B5] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                /sarah_design
              </button>
              <button
                id="demo-alex-btn"
                onClick={() => onNavigate('/alex_photo')}
                className="rounded-full border-2 border-black bg-white px-3.5 py-1 text-xs font-mono font-black text-black hover:bg-[#10B981] hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                /alex_photo
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Live Profiles Grid */}
      <section className="py-16 bg-[#FFFDF5] border-b-2 border-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider">
                <span className="w-2.5 h-6 bg-[#6366F1] rounded-full inline-block" />
                Community Showcase
              </div>
              <h2 className="text-3xl font-black text-[#1A1A1A] mt-1">
                Explore Creator Pages
              </h2>
            </div>
            <p className="text-xs font-bold text-slate-600 max-w-md">
              Check out how creators, students, and freelancers format their OneLink bio pages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCreators.map((creator) => {
              const themeConfig = THEME_CONFIGS[creator.theme as keyof typeof THEME_CONFIGS] || THEME_CONFIGS.minimal;

              return (
                <div
                  key={creator.username}
                  id={`creator-card-${creator.username}`}
                  onClick={() => onNavigate(`/${creator.username}`)}
                  className="group relative cursor-pointer rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-16 w-16 rounded-full border-2 border-black bg-[#FF80B5] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
                        <img
                          src={creator.avatarUrl}
                          alt={creator.displayName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="rounded-full bg-[#FFD600] px-3 py-1 text-[11px] font-mono font-black text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                        /{creator.username}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#1A1A1A] group-hover:text-[#6366F1] transition-colors">
                      {creator.displayName}
                    </h3>
                    <p className="text-xs font-bold text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {creator.bio}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t-2 border-black/10 flex items-center justify-between text-xs text-neutral-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5 text-black" />
                      {creator.linkCount || 0} links
                    </span>
                    <span className="rounded-md bg-[#FFFDF5] px-2 py-0.5 text-[10px] font-black text-black border border-black capitalize">
                      {themeConfig.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 bg-white border-b-2 border-black">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A]">
              Everything you need in a Link-in-Bio
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 mt-2 max-w-xl mx-auto">
              Engineered for speed, high conversion, and seamless multi-device browsing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border-2 border-black bg-[#FFFDF5] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD600] border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-[#1A1A1A]">Permanent Public URL</h3>
              <p className="text-xs font-bold text-slate-600 mt-2 leading-relaxed">
                Claim your clean handle like <code className="font-mono font-black text-black bg-white px-1.5 py-0.5 rounded-md border border-black">/bhanu</code>. Share it in your Instagram, TikTok, Twitter, or resume bio.
              </p>
            </div>

            <div className="rounded-3xl border-2 border-black bg-[#FFFDF5] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF80B5] border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-[#1A1A1A]">Live Phone Simulator</h3>
              <p className="text-xs font-bold text-slate-600 mt-2 leading-relaxed">
                Preview your changes in real-time as you reorder links, customize bios, or switch color themes.
              </p>
            </div>

            <div className="rounded-3xl border-2 border-black bg-[#FFFDF5] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10B981] border-2 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-[#1A1A1A]">Strict Ownership & Security</h3>
              <p className="text-xs font-bold text-slate-600 mt-2 leading-relaxed">
                Full server-side access control guarantees that each creator strictly controls their own profile and links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto bg-black text-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFD600] text-black font-black text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              1
            </div>
            <span className="font-black text-lg tracking-tight">OneLink</span>
          </div>

          <p className="text-xs font-bold text-neutral-400">
            © 2026 OneLink. Multi-user link-in-bio platform for creators and professionals.
          </p>

          <div className="flex items-center gap-4 text-xs font-black">
            <button onClick={() => onNavigate('/login')} className="hover:text-[#FFD600] transition-colors">
              Log In
            </button>
            <button onClick={() => onNavigate('/signup')} className="hover:text-[#FFD600] transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
