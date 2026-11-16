'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, FileText, Loader2, AlertCircle, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
  excerpt?: string;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {message}
      <button onClick={onClose}><X className="h-4 w-4" /></button>
    </div>
  );
}

function PageModal({ page, onClose, onSave }: {
  page: Partial<Page> | null;
  onClose: () => void;
  onSave: (data: Partial<Page> & { content: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    excerpt: page?.excerpt || '',
    content: '',
    isPublished: page?.isPublished ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...page, ...form });
    setSaving(false);
  };

  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none";
  const textareaCls = `${inputCls} resize-y font-mono`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="font-semibold text-slate-100">{page?.id ? 'Edit Page' : 'New Page'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Page Title *</label>
              <input className={inputCls} value={form.title} onChange={e => {
                const title = e.target.value;
                const slug = page?.id ? form.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                setForm(f => ({ ...f, title, slug }));
              }} placeholder="About Our Company" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">URL Slug *</label>
              <input className={inputCls} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="about-our-company" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Excerpt</label>
            <textarea className={textareaCls} rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary shown in previews…" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Content (Markdown)</label>
            <textarea className={textareaCls} rows={16} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="# Page Title&#10;&#10;Write your page content in Markdown…" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500" />
            <span className="text-sm text-slate-300">Published (visible to public)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
          <button onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.title || !form.slug}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {page?.id ? 'Save Changes' : 'Create Page'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CMSPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Page> | null | undefined>(undefined); // undefined=closed, null=new
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/cms/pages');
      setPages(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleSave = async (data: Partial<Page> & { content: string }) => {
    try {
      if (data.id) {
        await apiFetch(`/admin/cms/pages/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Page updated');
      } else {
        await apiFetch('/admin/cms/pages', { method: 'POST', body: JSON.stringify(data) });
        showToast('Page created');
      }
      setEditing(undefined);
      await fetchPages();
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    try {
      await apiFetch(`/admin/cms/pages/${id}`, { method: 'DELETE' });
      showToast('Page deleted');
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    }
  };

  const handleTogglePublish = async (page: Page) => {
    try {
      await apiFetch(`/admin/cms/pages/${page.id}`, { method: 'PUT', body: JSON.stringify({ isPublished: !page.isPublished }) });
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, isPublished: !p.isPublished } : p));
      showToast(page.isPublished ? 'Page unpublished' : 'Page published');
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    }
  };

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {editing !== undefined && (
        <PageModal page={editing} onClose={() => setEditing(undefined)} onSave={handleSave} />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Pages</h1>
          <p className="mt-1 text-slate-400">Manage static content pages (Privacy Policy, Terms, etc.)</p>
        </div>
        <button onClick={() => setEditing(null)}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      <div className="mb-5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          placeholder="Search pages…"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium">No pages found</p>
            <p className="text-sm mt-1">Create your first page to get started</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Updated</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(page => (
                <tr key={page.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-200">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 font-mono text-xs">/{page.slug}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${page.isPublished ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${page.isPublished ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleTogglePublish(page)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors" title={page.isPublished ? 'Unpublish' : 'Publish'}>
                        {page.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setEditing(page)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(page.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
