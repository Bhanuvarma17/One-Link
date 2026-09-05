import React, { useState, useEffect } from 'react';
import { User, ThemePreset } from '../types';
import { THEME_CONFIGS } from '../utils/themeStyles';
import { authApi } from '../services/api';
import {
  User as UserIcon, Camera, Sparkles, Check, AlertCircle,
  Palette, RefreshCw, Upload, Image as ImageIcon
} from 'lucide-react';

interface ProfileEditorProps {
  user: User;
  onProfileUpdate: (updates: Partial<User>) => Promise<boolean>;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onProfileUpdate }) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [theme, setTheme] = useState<ThemePreset>(user.theme || 'minimal');

  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; error?: string }>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state if user changes
  useEffect(() => {
    setDisplayName(user.displayName);
    setUsername(user.username);
    setBio(user.bio);
    setAvatarUrl(user.avatarUrl);
    setTheme(user.theme || 'minimal');
  }, [user]);

  // Real-time debounce username check
  useEffect(() => {
    if (!username || username.trim().toLowerCase() === user.usernameLower) {
      setUsernameStatus({});
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await authApi.checkUsername(username.trim());
        setUsernameStatus(res);
      } catch {
        // Ignored
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, user.usernameLower]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRandomizeBot = () => {
    const seed = Math.random().toString(36).substring(2, 9);
    setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!displayName.trim()) {
      setErrorMessage('Display Name cannot be empty.');
      return;
    }

    if (!username.trim()) {
      setErrorMessage('Username cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const ok = await onProfileUpdate({
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        theme,
      });

      if (ok) {
        setSuccessMessage('Profile saved successfully! Changes are now live on your public page.');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form id="profile-editor-form" onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-[#6366F1] rounded-full inline-block" />
          <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
            Edit Profile Information
          </h2>
        </div>
        <p className="text-xs font-bold text-slate-500 mt-1">
          This information will be displayed at the top of your public OneLink page.
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-[#ECFDF5] p-3.5 text-xs font-black text-emerald-950 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-in fade-in">
          <Check className="h-4 w-4 shrink-0 text-emerald-800" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-[#FFF1F2] p-3.5 text-xs font-black text-rose-950 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Avatar Section */}
      <div className="space-y-3">
        <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
          Profile Photo / Avatar
        </label>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <div className="h-22 w-22 rounded-full border-2 border-black bg-[#FF80B5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            </div>
            <label
              htmlFor="avatar-file-upload"
              title="Upload new image"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD600] border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform cursor-pointer"
            >
              <Camera className="h-4 w-4" />
            </label>
            <input
              id="avatar-file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="avatar-file-upload"
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Photo
              </label>

              <button
                type="button"
                onClick={handleRandomizeBot}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Generate Avatar
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Presets:</span>
              {AVATAR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(p)}
                  className={`h-8 w-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                    avatarUrl === p ? 'border-black ring-2 ring-[#FFD600] scale-110' : 'border-black/40'
                  }`}
                >
                  <img src={p} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Image URL input */}
        <div className="pt-2">
          <label htmlFor="custom-avatar-url" className="block text-[11px] font-black text-slate-600 mb-1">
            Or paste image URL directly:
          </label>
          <input
            id="custom-avatar-url"
            type="text"
            value={avatarUrl}
            placeholder="https://..."
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
          />
        </div>
      </div>

      {/* Identity Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display Name */}
        <div>
          <label htmlFor="edit-display-name" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1.5">
            Display Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="edit-display-name"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Bhanu Varma"
            className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2.5 text-sm font-bold text-neutral-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
          />
          <p className="text-[11px] font-bold text-slate-500 mt-1">This will be prominent at the top of your page.</p>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="edit-username" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1.5">
            Username / Handle <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-black font-mono text-sm font-black">
              /
            </div>
            <input
              id="edit-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="bhanu"
              className="w-full rounded-xl border-2 border-black bg-white pl-7 pr-3.5 py-2.5 text-sm font-mono font-bold text-neutral-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
            />
          </div>

          {/* Validation status feedback */}
          {isCheckingUsername && (
            <p className="text-[11px] font-bold text-slate-500 mt-1">Checking handle availability...</p>
          )}
          {usernameStatus.available === true && (
            <p className="text-[11px] font-black text-emerald-600 mt-1">✓ Handle is available!</p>
          )}
          {usernameStatus.available === false && (
            <p className="text-[11px] font-black text-rose-600 mt-1">
              ✗ {usernameStatus.error || 'Username is not available'}
            </p>
          )}

          {/* Live Public URL Card */}
          <div className="mt-2.5 rounded-xl border-2 border-black bg-[#FFFDF5] p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Public URL (Main URL + /{username || 'username'})
              </span>
              <span className="text-[9px] font-black bg-[#FFD600] text-black px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                LIVE
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="font-mono text-xs font-black text-black break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/${username || 'username'}` : `/${username || 'username'}`}
              </span>
              <button
                type="button"
                id="copy-editor-public-url-btn"
                onClick={async () => {
                  if (!username) return;
                  try {
                    await navigator.clipboard.writeText(`${window.location.origin}/${username}`);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  } catch {
                    // Fallback
                  }
                }}
                className="shrink-0 rounded-lg bg-[#FFD600] px-3 py-1 text-[11px] font-black text-black border border-black hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                {copiedUrl ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-1">
              Your public bio page is instantly accessible by appending your username to this website&apos;s main URL.
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="edit-bio" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
            Bio Description
          </label>
          <span className="text-[11px] font-bold text-slate-500">{bio.length} / 250</span>
        </div>
        <textarea
          id="edit-bio"
          rows={3}
          maxLength={250}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell visitors who you are, what you build, or how to contact you..."
          className="w-full rounded-xl border-2 border-black bg-white p-3 text-sm font-bold text-neutral-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FFD600] resize-none"
        />
      </div>

      {/* Theme Picker */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-[#FFD600] rounded-full inline-block" />
          <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
            Select Visual Theme Preset
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.keys(THEME_CONFIGS) as ThemePreset[]).map((themeKey) => {
            const config = THEME_CONFIGS[themeKey];
            const isSelected = theme === themeKey;

            return (
              <button
                key={themeKey}
                type="button"
                id={`theme-select-${themeKey}`}
                onClick={() => setTheme(themeKey)}
                className={`relative flex flex-col p-3 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-black bg-[#FFFDF5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-2 ring-[#FFD600]'
                    : 'border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
                }`}
              >
                {/* Visual Swatch Pill */}
                <div
                  className="w-full h-12 rounded-xl mb-2.5 flex items-center justify-center border-2 border-black overflow-hidden shadow-2xs"
                  style={{ backgroundColor: config.previewColor }}
                >
                  <div
                    className="w-16 h-3.5 rounded-full border border-black shadow-2xs"
                    style={{ backgroundColor: config.accentColor }}
                  />
                </div>

                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-[#1A1A1A] truncate">
                    {config.name}
                  </span>
                  {isSelected && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#10B981] text-white text-[10px] font-black border border-black shrink-0">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-500 capitalize mt-0.5">{config.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t-2 border-black/10">
        <button
          type="submit"
          id="save-profile-btn"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FFD600] border-2 border-black px-7 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all"
        >
          {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
};

