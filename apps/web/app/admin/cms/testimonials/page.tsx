'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Star, StarOff, Eye, EyeOff, Loader2, X, Quote } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface Testimonial {
  id: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  clientImageUrl: string;
  content: string;
  rating: number;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {message} <button onClick={onClose}><X className="h-4 w-4" /></button>
    </div>
  );
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange?.(i)} className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star className={`h-4 w-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
        </button>
      ))}
    </div>
  );
}

function TestimonialModal({ testimonial, onClose, onSave }: {
  testimonial: Partial<Testimonial> | null;
  onClose: () => void;
  onSave: (data: Partial<Testimonial>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    clientName: testimonial?.clientName || '',
    clientTitle: testimonial?.clientTitle || '',
    clientCompany: testimonial?.clientCompany || '',
    clientImageUrl: testimonial?.clientImageUrl || '',
    content: testimonial?.content || '',
    rating: testimonial?.rating || 5,
    isApproved: testimonial?.isApproved ?? true,
    isFeatured: testimonial?.isFeatured ?? false,
  });
  const [saving, setSaving] = useState(false);

  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none";

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.content.trim()) return;
    setSaving(true);
    await onSave({ ...testimonial, ...form });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-slate-100">{testimonial?.id ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Client Name *</label>
              <input className={inputCls} value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Job Title</label>
              <input className={inputCls} value={form.clientTitle} onChange={e => setForm(f => ({ ...f, clientTitle: e.target.value }))} placeholder="CEO" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Company</label>
              <input className={inputCls} value={form.clientCompany} onChange={e => setForm(f => ({ ...f, clientCompany: e.target.value }))} placeholder="Acme Industries" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Photo URL</label>
              <input className={inputCls} value={form.clientImageUrl} onChange={e => setForm(f => ({ ...f, clientImageUrl: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Testimonial *</label>
            <textarea className={`${inputCls} resize-y`} rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="What the client said about working with TRICLINIUM…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Rating</label>
            <StarRating rating={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" checked={form.isApproved} onChange={e => setForm(f => ({ ...f, isApproved: e.target.checked }))} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500" />
              Approved (public)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500" />
              Featured (homepage)
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <button onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.clientName || !form.content}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50">
            {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {testimonial?.id ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CMSTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Testimonial> | null | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/cms/testimonials');
      setTestimonials(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch { setTestimonials([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleSave = async (data: Partial<Testimonial>) => {
    try {
      if (data.id) {
        await apiFetch(`/admin/cms/testimonials/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Testimonial updated');
      } else {
        await apiFetch('/admin/cms/testimonials', { method: 'POST', body: JSON.stringify(data) });
        showToast('Testimonial added');
      }
      setEditing(undefined);
      await fetchTestimonials();
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await apiFetch(`/admin/cms/testimonials/${id}`, { method: 'DELETE' });
      showToast('Deleted');
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleToggle = async (t: Testimonial, field: 'isApproved' | 'isFeatured') => {
    try {
      await apiFetch(`/admin/cms/testimonials/${t.id}`, { method: 'PUT', body: JSON.stringify({ [field]: !t[field] }) });
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, [field]: !x[field] } : x));
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {editing !== undefined && <TestimonialModal testimonial={editing} onClose={() => setEditing(undefined)} onSave={handleSave} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Testimonials</h1>
          <p className="mt-1 text-slate-400">{testimonials.filter(t => t.isApproved).length} approved · {testimonials.filter(t => t.isFeatured).length} featured</p>
        </div>
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-sky-500" /></div>
      ) : testimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Quote className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-medium">No testimonials yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {testimonials.map(t => (
            <div key={t.id} className={`rounded-xl border bg-slate-900 p-5 space-y-3 transition-opacity ${!t.isApproved ? 'opacity-50' : ''} ${t.isFeatured ? 'border-sky-800' : 'border-slate-800'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {t.clientImageUrl ? (
                    <img src={t.clientImageUrl} alt={t.clientName} className="h-10 w-10 rounded-full object-cover bg-slate-800" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-sky-900/40 flex items-center justify-center">
                      <span className="text-sky-400 font-semibold">{t.clientName.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-200 text-sm">{t.clientName}</p>
                    <p className="text-xs text-slate-500">{[t.clientTitle, t.clientCompany].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
                {t.isFeatured && <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />}
              </div>
              <StarRating rating={t.rating} />
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">"{t.content}"</p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1">
                  <button onClick={() => handleToggle(t, 'isApproved')} title={t.isApproved ? 'Hide' : 'Approve'}
                    className={`rounded-lg p-1.5 transition-colors ${t.isApproved ? 'text-emerald-400 hover:bg-emerald-900/30' : 'text-slate-500 hover:bg-slate-800'}`}>
                    {t.isApproved ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => handleToggle(t, 'isFeatured')} title={t.isFeatured ? 'Unfeature' : 'Feature'}
                    className={`rounded-lg p-1.5 transition-colors ${t.isFeatured ? 'text-amber-400 hover:bg-amber-900/30' : 'text-slate-500 hover:bg-slate-800'}`}>
                    {t.isFeatured ? <Star className="h-3.5 w-3.5" /> : <StarOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-sky-400"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(t.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
