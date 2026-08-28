import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LinkItem, User, ThemePreset } from '../types';
import { userApi } from '../services/api';
import { ShareBar } from '../components/ShareBar';
import { LinkEditor } from '../components/LinkEditor';
import { ProfileEditor } from '../components/ProfileEditor';
import { PhonePreview } from '../components/PhonePreview';
import { THEME_CONFIGS } from '../utils/themeStyles';
import {
  Link2, User as UserIcon, Palette, BarChart3, Smartphone,
  ExternalLink, Eye, Check, AlertCircle, RefreshCw
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

type TabType = 'links' | 'profile' | 'themes' | 'analytics';

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, updateProfile, isLoading: isAuthLoading } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('links');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Load user links
  useEffect(() => {
    if (!user) return;
    async function fetchLinks() {
      setIsLoadingLinks(true);
      try {
        const res = await userApi.getLinks();
        if (res.success && res.data?.links) {
          setLinks(res.data.links);
        }
      } finally {
        setIsLoadingLinks(false);
      }
    }
    fetchLinks();
  }, [user]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-3 text-sm text-neutral-500 font-medium">
          <RefreshCw className="h-5 w-5 animate-spin text-neutral-700" />
          Loading your OneLink dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    onNavigate('/login');
    return null;
  }

  const handleProfileSave = async (updates: Partial<User>): Promise<boolean> => {
    const res = await updateProfile(updates);
    return res.success;
  };

  const handleSelectTheme = async (themeKey: ThemePreset) => {
    await updateProfile({ theme: themeKey });
  };

  // Compute analytics
  const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);
  const activeLinksCount = links.filter((l) => l.isActive).length;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Share Bar */}
        <ShareBar user={user} onNavigate={onNavigate} />

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Management Tabs & Editors */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Tab Navigation Pill Bar */}
            <div className="flex items-center justify-between border-b border-neutral-200/90 pb-3">
              <nav className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                <button
                  id="tab-links-btn"
                  onClick={() => setActiveTab('links')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'links'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                  }`}
                >
                  <Link2 className="h-4 w-4" />
                  <span>Links</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      activeTab === 'links' ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {links.length}
                  </span>
                </button>

                <button
                  id="tab-profile-btn"
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Profile</span>
                </button>

                <button
                  id="tab-themes-btn"
                  onClick={() => setActiveTab('themes')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'themes'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  <span>Themes</span>
                </button>

                <button
                  id="tab-analytics-btn"
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </button>
              </nav>

              {/* Mobile Preview Toggle Button */}
              <button
                id="toggle-mobile-preview-btn"
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="lg:hidden flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50"
              >
                <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                <span>{showMobilePreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
            </div>

            {/* Tab Content Cards */}
            <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-xs">
              {activeTab === 'links' && (
                <LinkEditor
                  links={links}
                  onLinksChange={(updated) => setLinks(updated)}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileEditor
                  user={user}
                  onProfileUpdate={handleProfileSave}
                />
              )}

              {activeTab === 'themes' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Custom Profile Themes</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Select a visual aesthetic. Your public profile will instantly adopt these styles.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(Object.keys(THEME_CONFIGS) as ThemePreset[]).map((themeKey) => {
                      const themeConfig = THEME_CONFIGS[themeKey];
                      const isCurrent = user.theme === themeKey;

                      return (
                        <div
                          key={themeKey}
                          id={`theme-card-${themeKey}`}
                          onClick={() => handleSelectTheme(themeKey)}
                          className={`group cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                            isCurrent
                              ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                              : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-neutral-900">
                              {themeConfig.name}
                            </span>
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                                <Check className="h-3 w-3" /> Active
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-neutral-400 group-hover:text-indigo-600">
                                Apply Theme
                              </span>
                            )}
                          </div>

                          {/* Theme Mini Mockup */}
                          <div
                            className={`h-28 w-full rounded-xl p-3 flex flex-col items-center justify-center gap-2 border shadow-inner ${themeConfig.bgClass}`}
                          >
                            <div className="h-7 w-7 rounded-full border bg-white shadow-2xs" />
                            <div
                              className={`w-3/4 py-1 rounded-lg text-center text-[10px] font-semibold border ${themeConfig.cardClass}`}
                            >
                              Sample Link Item
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Profile Engagement</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Real-time visitor counts and link performance metrics.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5">
                      <span className="text-xs font-semibold text-neutral-500">Total Page Views</span>
                      <div className="text-3xl font-extrabold text-neutral-950 mt-1">
                        {user.pageViews || 0}
                      </div>
                      <span className="text-[11px] text-neutral-400 mt-1 block">Visits to /{user.username}</span>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5">
                      <span className="text-xs font-semibold text-neutral-500">Total Link Clicks</span>
                      <div className="text-3xl font-extrabold text-indigo-600 mt-1">
                        {totalClicks}
                      </div>
                      <span className="text-[11px] text-neutral-400 mt-1 block">Across all active links</span>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5">
                      <span className="text-xs font-semibold text-neutral-500">Active Links</span>
                      <div className="text-3xl font-extrabold text-neutral-950 mt-1">
                        {activeLinksCount} <span className="text-sm font-normal text-neutral-400">/ 20</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 mt-1 block">Published on profile</span>
                    </div>
                  </div>

                  {/* Per-Link Breakdown Table */}
                  <div className="mt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                      Clicks Per Link Breakdown
                    </h3>

                    {links.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic">No links created yet.</p>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-neutral-200">
                        <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
                          <thead className="bg-neutral-50 font-bold text-neutral-700">
                            <tr>
                              <th className="px-4 py-3">Link Title</th>
                              <th className="px-4 py-3">URL</th>
                              <th className="px-4 py-3 text-right">Total Clicks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 bg-white">
                            {links.map((link) => (
                              <tr key={link.id} className="hover:bg-neutral-50/60">
                                <td className="px-4 py-3 font-semibold text-neutral-900 truncate max-w-[150px]">
                                  {link.title}
                                </td>
                                <td className="px-4 py-3 text-neutral-500 truncate max-w-[200px]">
                                  {link.url}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">
                                  {link.clicks || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Phone Mockup Preview */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-sm flex flex-col items-center">
              <PhonePreview
                user={user}
                links={links}
              />
            </div>
          </div>
        </div>

        {/* Mobile Preview Modal / Drawer */}
        {showMobilePreview && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
            <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 p-4 text-white shadow-2xl flex flex-col items-center">
              <button
                onClick={() => setShowMobilePreview(false)}
                className="self-end mb-2 rounded-full bg-neutral-800 p-2 text-xs font-bold text-neutral-300 hover:text-white"
              >
                Close Preview ✕
              </button>
              <PhonePreview user={user} links={links} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
