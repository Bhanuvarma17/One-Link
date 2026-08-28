import React, { useState, useEffect } from 'react';
import { PublicProfile, LinkItem } from '../types';
import { publicApi } from '../services/api';
import { THEME_CONFIGS } from '../utils/themeStyles';
import { getPlatformIcon } from '../components/PhonePreview';
import { QRCodeModal } from '../components/QRCodeModal';
import { useAuth } from '../context/AuthContext';
import {
  Share2, ExternalLink, RefreshCw, Check, Sparkles,
  Edit3, AlertCircle, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublicProfilePageProps {
  username: string;
  onNavigate: (path: string) => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ username, onNavigate }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<PublicProfile['profile'] | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPublicProfile() {
      setIsLoading(true);
      setNotFound(false);
      try {
        const res = await publicApi.getProfile(username);
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setLinks(res.data.links || []);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (username) {
      loadPublicProfile();
    }
  }, [username]);

  const handleLinkClick = (link: LinkItem) => {
    // Asynchronously record click count
    publicApi.trackClick(link.id);
  };

  const handleShare = async () => {
    const pageUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.displayName || username} on OneLink`,
          text: `Check out ${profile?.displayName || username}'s bio and links!`,
          url: pageUrl,
        });
      } else {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.2 } });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-7 w-7 animate-spin text-indigo-400" />
          <p className="text-xs font-semibold text-neutral-400">Loading OneLink profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFDF5] text-neutral-900">
        <div className="w-full max-w-md rounded-3xl border-2 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFD600] text-black mb-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-8 w-8" />
          </div>

          <span className="rounded-full bg-[#FFFDF5] px-3.5 py-1 text-xs font-mono font-black text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            @{username}
          </span>

          <h1 className="text-3xl font-black text-[#1A1A1A] mt-4">
            Profile Not Found
          </h1>

          <p className="text-xs font-bold text-slate-600 mt-2 mb-6 leading-relaxed">
            The creator handle <span className="font-black text-black">@{username}</span> has not been claimed yet.
          </p>

          <div className="space-y-3">
            <button
              id="claim-this-username-btn"
              onClick={() => onNavigate(`/signup?username=${encodeURIComponent(username)}`)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD600] border-2 border-black py-3 text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <span>Claim @{username} on OneLink</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              id="not-found-back-home-btn"
              onClick={() => onNavigate('/')}
              className="w-full rounded-xl border-2 border-black bg-white py-2.5 text-xs font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              Explore Other Creators
            </button>
          </div>
        </div>
      </div>
    );
  }

  const themeKey = (profile.theme || 'minimal') as keyof typeof THEME_CONFIGS;
  const theme = THEME_CONFIGS[themeKey] || THEME_CONFIGS.minimal;
  const isOwner = currentUser && currentUser.usernameLower === profile.username.toLowerCase();
  const pageUrl = window.location.href;

  return (
    <div
      id="public-profile-container"
      className={`min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 transition-colors duration-300 ${theme.bgClass}`}
    >
      {/* Top Floating Utility Bar */}
      <div className="w-full max-w-lg flex items-center justify-between pt-2 pb-6">
        <button
          id="public-brand-home-btn"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-2xs border border-neutral-200/80 hover:bg-white transition-all"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>OneLink</span>
        </button>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              id="owner-edit-profile-btn"
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Page</span>
            </button>
          )}

          <button
            id="public-share-btn"
            onClick={handleShare}
            title="Share this profile"
            className="flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs border border-neutral-200 hover:bg-white transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Canvas Card */}
      <main className="w-full max-w-lg flex-1 flex flex-col items-center justify-start my-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
              alt={profile.displayName}
              className={`h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover shadow-lg border-4 bg-white ${theme.avatarBorder}`}
            />
          </div>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textPrimary}`}>
            {profile.displayName || profile.username}
          </h1>

          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className={`text-xs sm:text-sm font-mono font-medium opacity-80 ${theme.textSecondary}`}>
              @{profile.username}
            </span>
          </div>

          {profile.bio && (
            <p className={`mt-3 max-w-md text-xs sm:text-sm leading-relaxed ${theme.textSecondary}`}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links Column */}
        <div className="w-full space-y-3">
          {links.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300/60 p-8 text-center bg-white/50 backdrop-blur-xs">
              <p className={`text-xs font-medium ${theme.textSecondary}`}>
                This creator hasn&apos;t published any links yet.
              </p>
            </div>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                id={`public-link-${link.id}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link)}
                className={`group relative flex items-center justify-between w-full px-5 py-4 rounded-2xl text-sm font-bold shadow-xs transition-all duration-200 active:scale-[0.98] ${theme.cardClass} ${theme.cardHover}`}
              >
                <div className="flex items-center gap-3.5 truncate">
                  <span className="opacity-80 group-hover:opacity-100 transition-opacity">
                    {getPlatformIcon(link.icon, link.url)}
                  </span>
                  <span className="truncate">{link.title}</span>
                </div>

                <ExternalLink className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </a>
            ))
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-lg mt-12 mb-4 text-center">
        <button
          id="public-footer-badge-btn"
          onClick={() => onNavigate('/signup')}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs border border-neutral-200/90 hover:bg-white hover:shadow-xs transition-all"
        >
          <span>Create your own</span>
          <span className="font-bold text-indigo-600">OneLink</span>
          <span className="rounded-full bg-indigo-50 px-1.5 py-0.2 text-[10px] text-indigo-700 font-bold">
            Free
          </span>
        </button>
      </footer>

      {/* Share / QR Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={pageUrl}
        username={profile.username}
        displayName={profile.displayName}
      />
    </div>
  );
};
