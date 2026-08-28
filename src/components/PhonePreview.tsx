import React from 'react';
import { User, LinkItem } from '../types';
import { THEME_CONFIGS } from '../utils/themeStyles';
import { 
  Globe, Github, Linkedin, Instagram, Twitter, Youtube, 
  ExternalLink, Mail, Music, Video, ShoppingBag, Sparkles,
  BookOpen, Calendar, MapPin, Eye
} from 'lucide-react';

interface PhonePreviewProps {
  user: User;
  links: LinkItem[];
  previewTheme?: string;
  onLinkClick?: (link: LinkItem) => void;
}

export const getPlatformIcon = (iconName?: string, url?: string) => {
  const normalized = (iconName || '').toLowerCase();
  const lowerUrl = (url || '').toLowerCase();

  if (normalized === 'github' || lowerUrl.includes('github.com')) return <Github className="h-4 w-4 shrink-0" />;
  if (normalized === 'linkedin' || lowerUrl.includes('linkedin.com')) return <Linkedin className="h-4 w-4 shrink-0" />;
  if (normalized === 'instagram' || lowerUrl.includes('instagram.com')) return <Instagram className="h-4 w-4 shrink-0" />;
  if (normalized === 'twitter' || normalized === 'x' || lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return <Twitter className="h-4 w-4 shrink-0" />;
  if (normalized === 'youtube' || lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <Youtube className="h-4 w-4 shrink-0" />;
  if (normalized === 'spotify' || normalized === 'music' || lowerUrl.includes('spotify.com')) return <Music className="h-4 w-4 shrink-0" />;
  if (normalized === 'shopping-bag' || normalized === 'shop' || lowerUrl.includes('store') || lowerUrl.includes('shop')) return <ShoppingBag className="h-4 w-4 shrink-0" />;
  if (normalized === 'calendar' || lowerUrl.includes('calendly.com')) return <Calendar className="h-4 w-4 shrink-0" />;
  if (normalized === 'book' || lowerUrl.includes('dev.to') || lowerUrl.includes('medium.com')) return <BookOpen className="h-4 w-4 shrink-0" />;
  if (normalized === 'mail' || lowerUrl.startsWith('mailto:')) return <Mail className="h-4 w-4 shrink-0" />;
  if (normalized === 'sparkles') return <Sparkles className="h-4 w-4 shrink-0" />;
  
  return <Globe className="h-4 w-4 shrink-0" />;
};

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  user,
  links,
  previewTheme,
  onLinkClick,
}) => {
  const activeThemeKey = (previewTheme || user.theme || 'vibrant') as keyof typeof THEME_CONFIGS;
  const theme = THEME_CONFIGS[activeThemeKey] || THEME_CONFIGS.vibrant;

  const activeLinks = links.filter((l) => l.isActive);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5 mb-3 text-xs font-black text-black uppercase tracking-wider bg-[#FFD600] px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <Eye className="h-3.5 w-3.5" />
        Live Mobile Simulator
      </div>

      {/* Phone Shell with Neo-brutalist Bold Black Frame */}
      <div className="relative w-[320px] h-[640px] rounded-[3rem] bg-white p-2.5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-[8px] border-black flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-4.5 bg-black rounded-full z-30 flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFD600]" />
        </div>

        {/* Screen Content Container */}
        <div
          className={`relative w-full h-full rounded-[2.2rem] overflow-y-auto custom-scrollbar flex flex-col p-5 pt-8 transition-colors duration-300 ${theme.bgClass}`}
        >
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mt-2 mb-4">
            <div className="relative mb-2.5">
              <div className="w-20 h-20 rounded-full border-2 border-black bg-[#FF80B5] overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <h2 className={`text-base font-black tracking-tight leading-tight ${theme.textPrimary}`}>
              {user.displayName || user.username}
            </h2>

            <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">
              @{user.username}
            </p>

            {user.bio && (
              <p className="text-[11px] font-bold text-slate-800 mt-2 px-2.5 py-1.5 rounded-xl border border-black/20 bg-white/70 shadow-2xs leading-relaxed max-w-[240px] line-clamp-3">
                {user.bio}
              </p>
            )}
          </div>

          {/* Links List */}
          <div className="flex flex-col gap-2.5 w-full flex-1">
            {activeLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border-2 border-dashed border-black/30 my-auto bg-white/40">
                <p className="text-xs font-black text-slate-500">
                  No active links yet. Add your links to see them live!
                </p>
              </div>
            ) : (
              activeLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (onLinkClick) {
                      e.preventDefault();
                      onLinkClick(link);
                    }
                  }}
                  className={`group relative flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-black transition-all duration-150 ${theme.cardClass} ${theme.cardHover}`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                      {getPlatformIcon(link.icon, link.url)}
                    </span>
                    <span className="truncate">{link.title}</span>
                  </div>

                  <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </a>
              ))
            )}
          </div>

          {/* Footer Branding */}
          <div className="mt-5 mb-1 flex items-center justify-center">
            <span className="text-[10px] font-black text-slate-700 bg-white/80 px-2.5 py-1 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
              OneLink BIO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

