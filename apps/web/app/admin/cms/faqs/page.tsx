'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Loader2, X, HelpCircle, GripVertical, Save } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {message} <button onClick={onClose}><X className="h-4 w-4" /></button>
    </div>
  );
}

function FAQForm({ faq, onSave, onCancel }: {
  faq?: Partial<FAQ>;
  onSave: (data: Partial<FAQ>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    question: faq?.question || '',
    answer: faq?.answer || '',
    category: faq?.category || 'General',
    isPublished: faq?.isPublished ?? true,
  });
  const [saving, setSaving] = useState(false);

  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none";

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    await onSave({ ...faq, ...form });
    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-sky-800 bg-slate-900 p-5 space-y-4">
      <div className="grid grid-cols-[1fr_200px] gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Question *</label>
          <input className={inputCls} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="What materials do you work with?" autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
          <input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="General" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Answer *</label>
        <textarea className={`${inputCls} resize-y`} rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Provide a clear, helpful answer…" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
          <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500" />
          Published
        </label>
        <div className="flex gap-2">
          <button onClick={onCancel} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.question.trim() || !form.answer.trim()}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50">
            {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
            {faq?.id ? 'Save Changes' : 'Add FAQ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ faq, onEdit, onDelete, onTogglePublish }: {
  faq: FAQ;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border bg-slate-900 overflow-hidden transition-all ${faq.isPublished ? 'border-slate-800' : 'border-slate-800 opacity-60'}`}>
      <div className="flex items-start gap-3 px-5 py-4">
        <GripVertical className="h-5 w-5 text-slate-700 cursor-grab mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <button className="text-left flex-1" onClick={() => setExpanded(e => !e)}>
              <p className="font-medium text-slate-200 leading-snug">{faq.question}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-500">{faq.category}</span>
                {!faq.isPublished && <span className="text-xs text-amber-500">Hidden</span>}
              </div>
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={onTogglePublish} title={faq.isPublished ? 'Hide' : 'Show'}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${faq.isPublished ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {faq.isPublished ? 'Live' : 'Hidden'}
              </button>
              <button onClick={onEdit} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-sky-400"><Edit2 className="h-3.5 w-3.5" /></button>
              <button onClick={onDelete} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
              <button onClick={() => setExpanded(e => !e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800">
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-800 px-5 py-4 bg-slate-800/30">
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function CMSFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/cms/faqs');
      setFaqs(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFAQs(); }, [fetchFAQs]);

  const handleSave = async (data: Partial<FAQ>) => {
    try {
      if (data.id) {
        await apiFetch(`/admin/cms/faqs/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('FAQ updated');
        setEditingId(null);
      } else {
        await apiFetch('/admin/cms/faqs', { method: 'POST', body: JSON.stringify(data) });
        showToast('FAQ added');
        setAdding(false);
      }
      await fetchFAQs();
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await apiFetch(`/admin/cms/faqs/${id}`, { method: 'DELETE' });
      showToast('FAQ deleted');
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleTogglePublish = async (faq: FAQ) => {
    try {
      await apiFetch(`/admin/cms/faqs/${faq.id}`, { method: 'PUT', body: JSON.stringify({ isPublished: !faq.isPublished }) });
      setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isPublished: !f.isPublished } : f));
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const categories = ['ALL', ...Array.from(new Set(faqs.map(f => f.category).filter(Boolean)))];
  const filtered = faqs.filter(f => categoryFilter === 'ALL' || f.category === categoryFilter);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">FAQs</h1>
          <p className="mt-1 text-slate-400">{faqs.length} question{faqs.length !== 1 ? 's' : ''} across {categories.length - 1} categories</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      {categories.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${categoryFilter === cat ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="mb-5">
          <FAQForm onSave={handleSave} onCancel={() => setAdding(false)} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-sky-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <HelpCircle className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-medium">No FAQs found</p>
          <p className="text-sm mt-1">Add your first FAQ above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(faq => (
            editingId === faq.id ? (
              <FAQForm key={faq.id} faq={faq} onSave={handleSave} onCancel={() => setEditingId(null)} />
            ) : (
              <FAQItem key={faq.id} faq={faq}
                onEdit={() => setEditingId(faq.id)}
                onDelete={() => handleDelete(faq.id)}
                onTogglePublish={() => handleTogglePublish(faq)} />
            )
          ))}
        </div>
      )}
    </div>
  );
}
