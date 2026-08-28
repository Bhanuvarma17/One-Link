import React, { useState } from 'react';
import { LinkItem } from '../types';
import { userApi } from '../services/api';
import { getPlatformIcon } from './PhonePreview';
import {
  Plus, ArrowUp, ArrowDown, Trash2, Edit3, Check, X,
  ExternalLink, Eye, EyeOff, BarChart2, AlertCircle, GripVertical
} from 'lucide-react';

interface LinkEditorProps {
  links: LinkItem[];
  onLinksChange: (updatedLinks: LinkItem[]) => void;
}

const ICON_OPTIONS = [
  { id: 'globe', label: 'Website / Portfolio' },
  { id: 'github', label: 'GitHub' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'spotify', label: 'Spotify / Music' },
  { id: 'shopping-bag', label: 'Store / Merch' },
  { id: 'calendar', label: 'Calendly / Booking' },
  { id: 'book', label: 'Blog / Medium' },
  { id: 'mail', label: 'Email Contact' },
  { id: 'sparkles', label: 'Special Project' },
];

export const LinkEditor: React.FC<LinkEditorProps> = ({ links, onLinksChange }) => {
  // New link form state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('globe');
  const [addError, setAddError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit link state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editIcon, setEditIcon] = useState('globe');
  const [editError, setEditError] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const maxLinksReached = links.length >= 20;

  // Auto-detect icon from URL typing
  const handleUrlInputChange = (val: string, setIconFn: (icon: string) => void) => {
    const lower = val.toLowerCase();
    if (lower.includes('github.com')) setIconFn('github');
    else if (lower.includes('linkedin.com')) setIconFn('linkedin');
    else if (lower.includes('instagram.com')) setIconFn('instagram');
    else if (lower.includes('twitter.com') || lower.includes('x.com')) setIconFn('twitter');
    else if (lower.includes('youtube.com') || lower.includes('youtu.be')) setIconFn('youtube');
    else if (lower.includes('spotify.com')) setIconFn('spotify');
    else if (lower.includes('calendly.com')) setIconFn('calendar');
    else if (lower.includes('dev.to') || lower.includes('medium.com')) setIconFn('book');
    else if (lower.includes('store') || lower.includes('shop')) setIconFn('shopping-bag');
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newTitle.trim()) {
      setAddError('Please enter a link title (e.g. "My Portfolio").');
      return;
    }

    if (!newUrl.trim()) {
      setAddError('Please enter a URL (e.g. "https://example.com").');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await userApi.createLink({
        title: newTitle.trim(),
        url: newUrl.trim(),
        icon: newIcon,
      });

      if (res.success && res.data?.link) {
        onLinksChange([...links, res.data.link]);
        setNewTitle('');
        setNewUrl('');
        setNewIcon('globe');
        setIsAdding(false);
      } else {
        setAddError(res.error || 'Failed to create link');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditIcon(link.icon || 'globe');
    setEditError('');
  };

  const handleSaveEdit = async (id: string) => {
    setEditError('');

    if (!editTitle.trim()) {
      setEditError('Link title cannot be empty.');
      return;
    }

    if (!editUrl.trim()) {
      setEditError('Link URL cannot be empty.');
      return;
    }

    try {
      const res = await userApi.updateLink(id, {
        title: editTitle.trim(),
        url: editUrl.trim(),
        icon: editIcon,
      });

      if (res.success && res.data?.link) {
        onLinksChange(links.map((l) => (l.id === id ? res.data!.link : l)));
        setEditingId(null);
      } else {
        setEditError(res.error || 'Failed to update link');
      }
    } catch {
      setEditError('Network error while updating link');
    }
  };

  const handleToggleActive = async (link: LinkItem) => {
    try {
      const res = await userApi.updateLink(link.id, {
        isActive: !link.isActive,
      });
      if (res.success && res.data?.link) {
        onLinksChange(links.map((l) => (l.id === link.id ? res.data!.link : l)));
      }
    } catch {
      // Error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await userApi.deleteLink(id);
      if (res.success) {
        onLinksChange(links.filter((l) => l.id !== id));
        setDeletingId(null);
      }
    } catch {
      // Error
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    // Optimistically update local state
    onLinksChange(newLinks);

    // Persist reorder to server
    try {
      const linkIds = newLinks.map((l) => l.id);
      const res = await userApi.reorderLinks(linkIds);
      if (res.success && res.data?.links) {
        onLinksChange(res.data.links);
      }
    } catch {
      // Revert if error
      onLinksChange(links);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Limits */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#10B981] rounded-full inline-block" />
            <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
              Manage Links
              <span className="rounded-full bg-[#FFD600] px-2.5 py-0.5 text-xs font-black text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                {links.length} / 20
              </span>
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Add, reorder, or customize the links visitors see on your profile.
          </p>
        </div>

        {!isAdding && (
          <button
            id="add-new-link-btn"
            disabled={maxLinksReached}
            onClick={() => setIsAdding(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-black px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
              maxLinksReached
                ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed shadow-none'
                : 'bg-[#10B981] text-white hover:bg-[#059669] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
            }`}
          >
            <Plus className="h-4 w-4" />
            Add New Link
          </button>
        )}
      </div>

      {maxLinksReached && (
        <div className="flex items-center gap-2 rounded-xl bg-[#FEF3C7] p-3 text-xs font-black text-amber-950 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
          <span>You have reached the maximum limit of 20 links per profile.</span>
        </div>
      )}

      {/* Add New Link Card Form */}
      {isAdding && (
        <form
          id="add-link-form"
          onSubmit={handleAddLink}
          className="rounded-2xl border-2 border-black bg-[#FFFDF5] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981] text-white text-xs border border-black">
                +
              </span>
              New Link Entry
            </span>
            <button
              type="button"
              id="cancel-add-link-btn"
              onClick={() => {
                setIsAdding(false);
                setAddError('');
              }}
              className="text-neutral-500 hover:text-black p-1 rounded-full hover:bg-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {addError && (
            <div className="flex items-center gap-2 rounded-xl bg-[#FFF1F2] p-3 text-xs font-black text-rose-950 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" />
              <span>{addError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-link-title" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1">
                Link Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="new-link-title"
                type="text"
                required
                placeholder="e.g. My GitHub, Portfolio, YouTube..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2.5 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
              />
            </div>

            <div>
              <label htmlFor="new-link-icon" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1">
                Platform Icon
              </label>
              <select
                id="new-link-icon"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="new-link-url" className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1">
              Destination URL <span className="text-rose-500">*</span>
            </label>
            <input
              id="new-link-url"
              type="text"
              required
              placeholder="e.g. https://github.com/yourusername or yoursite.com"
              value={newUrl}
              onChange={(e) => {
                setNewUrl(e.target.value);
                handleUrlInputChange(e.target.value, setNewIcon);
              }}
              className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2.5 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-2xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setAddError('');
              }}
              className="rounded-xl border-2 border-black bg-white px-4 py-2.5 text-xs font-black text-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-new-link-btn"
              disabled={isSubmitting}
              className="rounded-xl bg-[#10B981] border-2 border-black px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#059669] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Add Link to Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Links List */}
      {links.length === 0 && !isAdding ? (
        <div className="rounded-2xl border-2 border-dashed border-black/40 bg-white p-8 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD600] border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3">
            <ExternalLink className="h-7 w-7" />
          </div>
          <h3 className="text-base font-black text-[#1A1A1A]">No links created yet</h3>
          <p className="text-xs font-bold text-slate-500 max-w-xs mx-auto mt-1 mb-4">
            Click &quot;Add New Link&quot; to showcase your website, portfolio, social channels, or shop.
          </p>
          <button
            id="empty-add-link-btn"
            onClick={() => setIsAdding(true)}
            className="rounded-xl bg-[#FFD600] border-2 border-black px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => {
            const isEditing = editingId === link.id;
            const isDeleting = deletingId === link.id;

            if (isEditing) {
              return (
                <div
                  key={link.id}
                  className="rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3"
                >
                  <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">Edit Link Details</span>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-neutral-500 hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {editError && (
                    <div className="rounded-xl bg-[#FFF1F2] p-2.5 text-xs font-black text-rose-950 border-2 border-black">
                      {editError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`edit-title-${link.id}`} className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1">
                        Title
                      </label>
                      <input
                        id={`edit-title-${link.id}`}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-xl border-2 border-black px-3.5 py-2 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-icon-${link.id}`} className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1">
                        Icon
                      </label>
                      <select
                        id={`edit-icon-${link.id}`}
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="w-full rounded-xl border-2 border-black px-3 py-2 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`edit-url-${link.id}`} className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-1">
                      URL
                    </label>
                    <input
                      id={`edit-url-${link.id}`}
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full rounded-xl border-2 border-black px-3.5 py-2 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border-2 border-black px-3.5 py-2 text-xs font-black text-neutral-800 hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id={`save-edit-${link.id}`}
                      onClick={() => handleSaveEdit(link.id)}
                      className="rounded-xl bg-[#FFD600] border-2 border-black px-4 py-2 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={link.id}
                id={`link-item-${link.id}`}
                className={`group flex items-center justify-between gap-3 rounded-2xl border-2 border-black bg-white p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  link.isActive ? 'hover:translate-x-0.5 hover:translate-y-0.5' : 'opacity-60 bg-neutral-100 border-dashed'
                }`}
              >
                {/* Left: Reorder buttons & Icon */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <button
                      id={`move-up-${link.id}`}
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      title="Move Link Up"
                      className="rounded-md p-1 text-black hover:bg-[#FFD600] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      id={`move-down-${link.id}`}
                      disabled={index === links.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      title="Move Link Down"
                      className="rounded-md p-1 text-black hover:bg-[#FFD600] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD600] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                    {getPlatformIcon(link.icon, link.url)}
                  </div>

                  {/* Title & URL */}
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#1A1A1A] truncate">
                        {link.title}
                      </span>
                      {!link.isActive && (
                        <span className="rounded-md bg-neutral-300 px-1.5 py-0.2 text-[10px] font-black text-neutral-800 border border-black">
                          Hidden
                        </span>
                      )}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-black truncate hover:underline"
                    >
                      <span className="truncate max-w-[180px] sm:max-w-xs">{link.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                    </a>
                  </div>
                </div>

                {/* Right: Stats & Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Clicks counter */}
                  <div
                    title="Total public clicks"
                    className="hidden sm:flex items-center gap-1 rounded-xl bg-[#10B981] px-2.5 py-1 text-xs font-black text-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <BarChart2 className="h-3.5 w-3.5 text-white" />
                    <span>{link.clicks || 0}</span>
                  </div>

                  {/* Toggle Active / Inactive */}
                  <button
                    id={`toggle-visibility-${link.id}`}
                    onClick={() => handleToggleActive(link)}
                    title={link.isActive ? 'Hide from public profile' : 'Show on public profile'}
                    className={`rounded-xl p-2 text-xs border border-black transition-all ${
                      link.isActive
                        ? 'text-black bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'text-neutral-500 bg-neutral-200'
                    }`}
                  >
                    {link.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    id={`edit-link-${link.id}`}
                    onClick={() => startEditing(link)}
                    title="Edit link title & URL"
                    className="rounded-xl p-2 text-black bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFD600] transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  {/* Delete or Confirm Delete */}
                  {isDeleting ? (
                    <div className="flex items-center gap-1 bg-rose-100 border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-in fade-in">
                      <span className="text-[11px] font-black text-rose-950 px-1">Del?</span>
                      <button
                        id={`confirm-delete-${link.id}`}
                        onClick={() => handleDelete(link.id)}
                        className="rounded-lg bg-rose-600 border border-black p-1 text-white hover:bg-rose-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="rounded-lg bg-white border border-black p-1 text-black hover:bg-neutral-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`delete-link-${link.id}`}
                      onClick={() => setDeletingId(link.id)}
                      title="Delete link"
                      className="rounded-xl p-2 text-rose-600 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

