'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, BookOpen, Loader2, X, Tag, Calendar, Star, UploadCloud } from 'lucide-react';
import { uploadAdminMedia, apiFetch } from '@/lib/api-client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { name: string };
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {message} <button onClick={onClose}><X className="h-4 w-4" /></button>
    </div>
  );
}

function StatusBadge({ status }: { status: BlogPost['status'] }) {
  const map = {
    PUBLISHED: 'bg-emerald-900/40 text-emerald-400',
    DRAFT: 'bg-amber-900/30 text-amber-400',
    ARCHIVED: 'bg-slate-800 text-slate-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-400' : status === 'DRAFT' ? 'bg-amber-400' : 'bg-slate-500'}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function PostModal({ post, onClose, onSave }: {
  post: Partial<BlogPost> | null;
  onClose: () => void;
  onSave: (data: Partial<BlogPost>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    coverImageUrl: post?.coverImageUrl || post?.featuredImage || '',
    category: post?.category || '',
    tags: (post?.tags || []).join(', '),
    status: post?.status || 'DRAFT',
    isFeatured: post?.isFeatured || false,
  });
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none";
  const textareaCls = `${inputCls} resize-y`;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadStatus(null);
      const uploaded = await uploadAdminMedia(file);
      if (uploaded.url) {
        setForm(f => ({ ...f, coverImageUrl: uploaded.url }));
        setUploadStatus({ message: 'Cover image uploaded successfully!', type: 'success' });
      }
    } catch (err: any) {
      setUploadStatus({ message: err.message || 'Failed to upload image', type: 'error' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...post,
      ...form,
      featuredImage: form.coverImageUrl,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="font-semibold text-slate-100">{post?.id ? 'Edit Post' : 'New Blog Post'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Post Title *</label>
              <input className={inputCls} value={form.title} onChange={e => {
                const title = e.target.value;
                const slug = post?.id ? form.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                setForm(f => ({ ...f, title, slug }));
              }} placeholder="How to Choose the Best 4K CCTV..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">URL Slug *</label>
              <input className={inputCls} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="choosing-the-best-cctv-system" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="CCTV & Surveillance" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
              <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as BlogPost['status'] }))}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Tags (comma-separated)</label>
            <input className={inputCls} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="cctv, alarms, security, wireless" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">Featured Image</label>
            {uploadStatus && (
              <div
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center justify-between font-medium ${
                  uploadStatus.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-800/80 text-rose-300'
                }`}
              >
                <span>{uploadStatus.message}</span>
                <button
                  type="button"
                  onClick={() => setUploadStatus(null)}
                  className="ml-2 hover:opacity-80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {form.coverImageUrl && (
              <div className="relative w-full max-w-sm h-36 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, coverImageUrl: '' }))}
                  className="absolute top-2 right-2 p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input className={`${inputCls} flex-1`} value={form.coverImageUrl} onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))} placeholder="Paste image URL (https://...) or upload" />
              <label className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 text-xs font-medium cursor-pointer shrink-0">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Excerpt</label>
            <textarea className={textareaCls} rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Brief summary for listing pages and SEO…" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Content (Markdown) *</label>
            <textarea className={`${textareaCls} font-mono text-xs`} rows={16} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="# Post Title&#10;&#10;Write your article content in Markdown…" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500" />
            <span className="text-sm text-slate-300">Featured post (shown on homepage)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
          <button onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.title || !form.slug}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50">
            {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {post?.id ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CMSBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editing, setEditing] = useState<Partial<BlogPost> | null | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/blog');
      const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      setPosts(list.map((p: any) => ({
        ...p,
        category: p.category?.name || (typeof p.category === 'string' ? p.category : 'General'),
        coverImageUrl: p.featuredImage || p.coverImageUrl || '',
      })));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSave = async (data: Partial<BlogPost>) => {
    try {
      const payload = {
        ...data,
        featuredImage: data.coverImageUrl || data.featuredImage,
      };
      if (data.id) {
        await apiFetch(`/admin/blog/${data.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        showToast('Post updated');
      } else {
        await apiFetch('/admin/blog', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Post created');
      }
      setEditing(undefined);
      await fetchPosts();
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await apiFetch(`/admin/blog/${id}`, { method: 'DELETE' });
      showToast('Post deleted');
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await apiFetch(`/admin/blog/${post.id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
      showToast(newStatus === 'PUBLISHED' ? 'Post published' : 'Post moved to drafts');
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {editing !== undefined && <PostModal post={editing} onClose={() => setEditing(undefined)} onSave={handleSave} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Blog & News</h1>
          <p className="mt-1 text-slate-400">{posts.length} article{posts.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            placeholder="Search posts…" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-sky-500 focus:outline-none">
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-sky-500" /></div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <BookOpen className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium">No posts found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginated.map(post => (
                <tr key={post.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {post.isFeatured && <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                      <span className="font-medium text-slate-200 line-clamp-1">{post.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    {post.category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                        <Tag className="h-3 w-3" />{post.category}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={post.status} /></td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggleStatus(post)} title={post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                        {post.status === 'PUBLISHED' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setEditing(post)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors">
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

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
