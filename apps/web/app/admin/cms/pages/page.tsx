'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  AlertCircle,
  X,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { apiFetch, uploadAdminMedia } from '@/lib/api-client';

interface PageSection {
  id?: string;
  key: string;
  title?: string | null;
  content?: any;
  isEnabled: boolean;
  displayOrder: number;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt: string;
  sections?: PageSection[];
}

interface HeroConfig {
  badge: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  bullets: string[];
  isEnabled: boolean;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-xl text-white text-sm font-medium border ${
        type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'
      }`}
    >
      {type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function PageModal({
  page,
  onClose,
  onSave,
}: {
  page: Partial<Page> | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'content'>('general');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulletInput, setBulletInput] = useState('');

  // Extract existing hero section if any
  const existingHeroSection = page?.sections?.find((s) => s.key === 'hero');
  const initialHeroContent = existingHeroSection?.content || {};

  const [form, setForm] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    status: (page?.status as 'PUBLISHED' | 'DRAFT') || 'PUBLISHED',
    seoTitle: page?.seoTitle || '',
    seoDescription: page?.seoDescription || '',
  });

  const [hero, setHero] = useState<HeroConfig>({
    badge: initialHeroContent.badge || '',
    title: initialHeroContent.title || page?.title || '',
    subtitle: initialHeroContent.subtitle || '',
    backgroundImage: initialHeroContent.backgroundImage || '',
    bullets: Array.isArray(initialHeroContent.bullets) ? initialHeroContent.bullets : [],
    isEnabled: initialHeroContent.isEnabled !== undefined ? initialHeroContent.isEnabled : true,
  });

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const res = await uploadAdminMedia(file);
      if (res.url) {
        setHero((prev) => ({ ...prev, backgroundImage: res.url }));
      }
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingHero(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddBullet = () => {
    if (!bulletInput.trim()) return;
    setHero((prev) => ({ ...prev, bullets: [...prev.bullets, bulletInput.trim()] }));
    setBulletInput('');
  };

  const handleRemoveBullet = (index: number) => {
    setHero((prev) => ({ ...prev, bullets: prev.bullets.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        hero: {
          ...hero,
          title: hero.title || form.title,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none';
  const textareaCls = `${inputCls} resize-y font-mono`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {page?.id ? `Edit Page: ${page.title || page.slug}` : 'Create New Website Page'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize page metadata, hero banner image, highlights, and body content
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 shrink-0 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General &amp; SEO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`py-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'hero'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Hero Banner &amp; Image</span>
            {hero.backgroundImage && <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`py-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Page Body (Markdown)
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Page Title *</label>
                  <input
                    className={inputCls}
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = page?.id
                        ? form.slug
                        : title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '');
                      setForm((f) => ({ ...f, title, slug }));
                    }}
                    placeholder="e.g. Professional Security & CCTV Installation Services"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL Slug *</label>
                  <div className="flex items-center">
                    <span className="rounded-l-lg border border-r-0 border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-400">
                      /
                    </span>
                    <input
                      className={`${inputCls} rounded-l-none font-mono text-xs`}
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      placeholder="services"
                      disabled={['home', 'services', 'products', 'about', 'contact'].includes(page?.slug || '')}
                    />
                  </div>
                  {['home', 'services', 'products', 'about', 'contact'].includes(page?.slug || '') && (
                    <p className="text-[10px] text-amber-400 mt-1">
                      System route slug is reserved to maintain public website integrity.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">SEO Meta Title</label>
                  <input
                    className={inputCls}
                    value={form.seoTitle}
                    onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                    placeholder="e.g. CCTV Installations Kenya | TRICLINIUM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Publication Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  >
                    <option value="PUBLISHED">Published (Visible on Live Website)</option>
                    <option value="DRAFT">Draft (Internal Only)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">SEO Meta Description</label>
                <textarea
                  className={textareaCls}
                  rows={3}
                  value={form.seoDescription}
                  onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                  placeholder="Summary displayed in Google search results and social previews..."
                />
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-6">
              {/* Hero Banner Background Image Section */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-sky-400" />
                      <span>Hero Section Background Image</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Set a high-resolution background image for this page&apos;s header banner (recommended 1920×800px or larger).
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={hero.isEnabled}
                      onChange={(e) => setHero((h) => ({ ...h, isEnabled: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-sky-500"
                    />
                    <span>Enable Hero Section</span>
                  </label>
                </div>

                {/* Banner Preview Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Hero Live Appearance Preview:</span>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('dark')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        previewTheme === 'dark'
                          ? 'bg-slate-800 text-sky-400 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Dark Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('light')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        previewTheme === 'light'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Light Mode
                    </button>
                  </div>
                </div>

                {/* Banner Preview Box */}
                <div className={`relative aspect-[21/8] w-full rounded-xl overflow-hidden border transition-colors ${
                  previewTheme === 'light'
                    ? 'border-slate-300 bg-slate-900 text-white'
                    : 'border-slate-700 bg-slate-900 text-white'
                } flex items-center justify-center`}>
                  {hero.backgroundImage ? (
                    <>
                      <img
                        src={hero.backgroundImage}
                        alt="Hero background preview"
                        className="h-full w-full object-cover"
                      />
                      {/* Live overlay preview adhering to dimmed, high-visibility cinematic style */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-center backdrop-blur-[0.5px] bg-slate-950/40 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/30 text-white">
                        {hero.badge && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full w-fit mb-2 bg-sky-500/20 border border-sky-400/40 text-sky-200">
                            {hero.badge}
                          </span>
                        )}
                        <h4 className="text-lg font-bold line-clamp-1 text-white drop-shadow-sm">
                          {hero.title || form.title || 'Page Headline'}
                        </h4>
                        <p className="text-xs line-clamp-2 max-w-xl mt-1 text-slate-200 drop-shadow-sm">
                          {hero.subtitle || 'Page subtitle and description text will render here over the background image.'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                      <ImageIcon className="h-10 w-10 text-slate-500" />
                      <span className="text-xs font-medium">No custom hero background image assigned</span>
                      <span className="text-[11px] text-slate-500">
                        Default gradient styling is active
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload & URL Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="flex-1">
                    <input
                      className={inputCls}
                      value={hero.backgroundImage}
                      onChange={(e) => setHero((h) => ({ ...h, backgroundImage: e.target.value }))}
                      placeholder="https://... or upload local image file below"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingHero}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                    >
                      {uploadingHero ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </button>
                    {hero.backgroundImage && (
                      <button
                        type="button"
                        onClick={() => setHero((h) => ({ ...h, backgroundImage: '' }))}
                        className="rounded-lg border border-slate-700 hover:border-rose-500 hover:text-rose-400 px-3 py-2 text-xs text-slate-400 transition-colors"
                      >
                        Clear Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hero Text Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hero Badge Text</label>
                  <input
                    className={inputCls}
                    value={hero.badge}
                    onChange={(e) => setHero((h) => ({ ...h, badge: e.target.value }))}
                    placeholder="e.g. Certified Security Engineering · East Africa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hero Headline / Title</label>
                  <input
                    className={inputCls}
                    value={hero.title}
                    onChange={(e) => setHero((h) => ({ ...h, title: e.target.value }))}
                    placeholder={form.title || 'Professional CCTV Installations'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hero Subtitle / Description</label>
                <textarea
                  className={textareaCls}
                  rows={3}
                  value={hero.subtitle}
                  onChange={(e) => setHero((h) => ({ ...h, subtitle: e.target.value }))}
                  placeholder="Explain what TRICLINIUM offers on this page..."
                />
              </div>

              {/* Key Highlights / Bullet Points */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Key Highlights / Checklist Badges (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    value={bulletInput}
                    onChange={(e) => setBulletInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBullet();
                      }
                    }}
                    placeholder="e.g. Free Nairobi Site Survey (press enter or click Add)"
                  />
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 text-xs font-semibold text-slate-200 border border-slate-700 shrink-0"
                  >
                    Add
                  </button>
                </div>

                {hero.bullets.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {hero.bullets.map((b, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{b}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="hover:text-rose-400 text-slate-400 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Page Body Content (Markdown Supported)
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  Supports # Headings, **bold**, - lists, and [links](url)
                </span>
              </div>
              <textarea
                className={textareaCls}
                rows={16}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="# Page Heading&#10;&#10;Write comprehensive page content in markdown format..."
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <div className="text-xs text-slate-400">
            {hero.backgroundImage && (
              <span className="inline-flex items-center gap-1.5 text-sky-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Hero image attached
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.title || !form.slug}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-semibold text-white shadow-lg transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{page?.id ? 'Save Page Changes' : 'Create Page'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CMSPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Page> | null | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/cms/pages');
      setPages(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleSave = async (data: any) => {
    try {
      if (data.id) {
        await apiFetch(`/admin/cms/pages/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        showToast(`Page "${data.title}" updated successfully.`);
      } else {
        await apiFetch('/admin/cms/pages', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        showToast(`Page "${data.title}" created successfully.`);
      }
      setEditing(undefined);
      await fetchPages();
    } catch (e: unknown) {
      showToast((e as Error).message || 'Failed to save page', 'error');
    }
  };

  const handleDelete = async (page: Page) => {
    const isProtected = ['home', 'services', 'products', 'about', 'contact'].includes(page.slug);
    if (isProtected) {
      alert(`System page "${page.title}" cannot be deleted because it is required by the website structure.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete page "${page.title}"? This cannot be undone.`)) return;

    try {
      await apiFetch(`/admin/cms/pages/${page.id}`, { method: 'DELETE' });
      showToast(`Page "${page.title}" deleted.`);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
    } catch (e: unknown) {
      showToast((e as Error).message || 'Failed to delete page', 'error');
    }
  };

  const handleTogglePublish = async (page: Page) => {
    const nextStatus = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await apiFetch(`/admin/cms/pages/${page.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, status: nextStatus } : p))
      );
      showToast(nextStatus === 'PUBLISHED' ? `"${page.title}" is now published.` : `"${page.title}" set to draft.`);
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {editing !== undefined && (
        <PageModal page={editing} onClose={() => setEditing(undefined)} onSave={handleSave} />
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-sky-400" />
            <span>Website Pages &amp; CMS Editor</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Edit hero background images, banners, page titles, and body content for all website pages (/services, /products, /about, etc.)
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Page</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          placeholder="Search pages by title or slug (e.g. services, about)..."
        />
      </div>

      {/* Pages Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
            <span className="text-xs">Loading website pages...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-slate-300">No pages matched your search</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60">
              <tr className="font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Page &amp; Route</th>
                <th className="px-5 py-3.5">Hero Banner Image</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((page) => {
                const heroSection = page.sections?.find((s) => s.key === 'hero');
                const heroImage = heroSection?.content?.backgroundImage;
                const isPublished = page.status === 'PUBLISHED';
                const isSystemPage = ['home', 'services', 'products', 'about', 'contact'].includes(page.slug);

                return (
                  <tr key={page.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{page.title}</span>
                          {isSystemPage && (
                            <span className="rounded bg-sky-950/80 border border-sky-800/50 text-[10px] text-sky-300 px-1.5 py-0.2 font-medium">
                              System Route
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                          <span>/{page.slug}</span>
                          <Link
                            href={`/${page.slug === 'home' ? '' : page.slug}`}
                            target="_blank"
                            className="text-slate-500 hover:text-sky-400 transition-colors inline-flex items-center gap-0.5"
                            title="Open live page in new tab"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {heroImage ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={heroImage}
                            alt={`${page.title} hero`}
                            className="h-10 w-20 rounded-md object-cover border border-slate-700 shrink-0"
                          />
                          <span className="text-[11px] text-slate-300 font-medium">Custom Hero</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Default gradient</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          isPublished
                            ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400 text-[11px]">
                      {new Date(page.updatedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTogglePublish(page)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                          title={isPublished ? 'Unpublish page' : 'Publish page'}
                        >
                          {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditing(page)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors border border-slate-700 hover:border-sky-500"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-sky-400" />
                          <span>Edit</span>
                        </button>
                        {!isSystemPage && (
                          <button
                            onClick={() => handleDelete(page)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                            title="Delete page"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
