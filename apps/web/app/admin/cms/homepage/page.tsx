'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, GripVertical, Eye, EyeOff, Edit2, Save, X, ChevronDown, ChevronUp, Loader2, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface HomepageSection {
  id: string;
  key: string;
  title: string;
  content: Record<string, unknown>;
  isEnabled: boolean;
  sortOrder: number;
}

interface HeroSlide {
  id?: string;
  headline: string;
  subheadline: string;
  description: string;
  imageUrl: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
  isActive: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || '';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}/api/v1${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {type === 'error' && <AlertCircle className="h-4 w-4 shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

function SectionCard({
  section,
  onToggle,
  onSave,
  children,
}: {
  section: HomepageSection;
  onToggle: (key: string, enabled: boolean) => void;
  onSave: (key: string, content: Record<string, unknown>) => void;
  children: (content: Record<string, unknown>, setContent: (c: Record<string, unknown>) => void, save: () => void) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState(section.content);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    await onSave(section.key, content);
    setSaving(false);
  }, [onSave, section.key, content]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <GripVertical className="h-5 w-5 text-slate-600 cursor-grab" />
        <div className="flex-1">
          <p className="font-semibold text-slate-100">{section.title}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">{section.key}</p>
        </div>
        <button
          onClick={() => onToggle(section.key, !section.isEnabled)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${section.isEnabled ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
        >
          {section.isEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {section.isEnabled ? 'Visible' : 'Hidden'}
        </button>
        <button
          onClick={() => setExpanded(e => !e)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 px-5 py-5 space-y-4">
          {children(content, setContent, save)}
          <div className="flex justify-end pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-4">
      <label className="pt-2.5 text-sm font-medium text-slate-400">{label}</label>
      <div>{children}</div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";
const textareaCls = `${inputCls} min-h-[80px] resize-y`;

// ─── Hero Editor ─────────────────────────────────────────────────────────────

function HeroEditor({ content, setContent }: { content: Record<string, unknown>; setContent: (c: Record<string, unknown>) => void }) {
  const slides: HeroSlide[] = Array.isArray(content.slides) ? (content.slides as HeroSlide[]) : [
    { headline: 'Engineering Excellence', subheadline: 'Precision • Innovation • Reliability', description: 'Industrial solutions built to last.', imageUrl: '', primaryCTA: { label: 'Explore Products', href: '/products' }, secondaryCTA: { label: 'Request Quote', href: '/contact' }, isActive: true }
  ];

  const updateSlide = (idx: number, field: string, value: unknown) => {
    const updated = slides.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setContent({ ...content, slides: updated });
  };

  const updateCTA = (idx: number, ctaKey: 'primaryCTA' | 'secondaryCTA', field: string, value: string) => {
    const updated = slides.map((s, i) => i === idx ? { ...s, [ctaKey]: { ...(s[ctaKey] || {}), [field]: value } } : s);
    setContent({ ...content, slides: updated });
  };

  const addSlide = () => {
    setContent({ ...content, slides: [...slides, { headline: '', subheadline: '', description: '', imageUrl: '', primaryCTA: { label: 'Learn More', href: '/products' }, secondaryCTA: { label: 'Contact Us', href: '/contact' }, isActive: true }] });
  };

  const removeSlide = (idx: number) => {
    setContent({ ...content, slides: slides.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {slides.map((slide, idx) => (
        <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slide {idx + 1}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input type="checkbox" checked={slide.isActive} onChange={e => updateSlide(idx, 'isActive', e.target.checked)} className="rounded" />
                Active
              </label>
              {slides.length > 1 && (
                <button onClick={() => removeSlide(idx)} className="rounded p-1 text-rose-400 hover:bg-rose-900/30"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>
          </div>
          <FieldRow label="Headline">
            <input className={inputCls} value={slide.headline} onChange={e => updateSlide(idx, 'headline', e.target.value)} placeholder="Main headline text" />
          </FieldRow>
          <FieldRow label="Subheadline">
            <input className={inputCls} value={slide.subheadline} onChange={e => updateSlide(idx, 'subheadline', e.target.value)} placeholder="Supporting tagline" />
          </FieldRow>
          <FieldRow label="Description">
            <textarea className={textareaCls} rows={2} value={slide.description} onChange={e => updateSlide(idx, 'description', e.target.value)} placeholder="Slide description text" />
          </FieldRow>
          <FieldRow label="Background Image">
            <input className={inputCls} value={slide.imageUrl} onChange={e => updateSlide(idx, 'imageUrl', e.target.value)} placeholder="https://..." />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">Primary CTA</p>
              <input className={inputCls} value={slide.primaryCTA?.label || ''} onChange={e => updateCTA(idx, 'primaryCTA', 'label', e.target.value)} placeholder="Button label" />
              <input className={inputCls} value={slide.primaryCTA?.href || ''} onChange={e => updateCTA(idx, 'primaryCTA', 'href', e.target.value)} placeholder="/path or URL" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">Secondary CTA</p>
              <input className={inputCls} value={slide.secondaryCTA?.label || ''} onChange={e => updateCTA(idx, 'secondaryCTA', 'label', e.target.value)} placeholder="Button label" />
              <input className={inputCls} value={slide.secondaryCTA?.href || ''} onChange={e => updateCTA(idx, 'secondaryCTA', 'href', e.target.value)} placeholder="/path or URL" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addSlide} className="flex items-center gap-2 rounded-lg border border-dashed border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:border-sky-500 hover:text-sky-400 transition-colors w-full justify-center">
        <Plus className="h-4 w-4" /> Add Slide
      </button>
    </div>
  );
}

// ─── Generic List Editor (Why Us, Stats, etc.) ────────────────────────────────

function ListEditor({
  content, setContent, listKey, itemFields, addLabel,
}: {
  content: Record<string, unknown>;
  setContent: (c: Record<string, unknown>) => void;
  listKey: string;
  itemFields: { key: string; label: string; type: 'text' | 'textarea' | 'number' }[];
  addLabel: string;
}) {
  const items: Record<string, unknown>[] = Array.isArray(content[listKey]) ? (content[listKey] as Record<string, unknown>[]) : [];

  const update = (idx: number, field: string, value: unknown) => {
    const updated = items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    setContent({ ...content, [listKey]: updated });
  };

  const add = () => {
    const blank: Record<string, unknown> = {};
    itemFields.forEach(f => { blank[f.key] = f.type === 'number' ? 0 : ''; });
    setContent({ ...content, [listKey]: [...items, blank] });
  };

  const remove = (idx: number) => {
    setContent({ ...content, [listKey]: items.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Item {idx + 1}</span>
            <button onClick={() => remove(idx)} className="rounded p-1 text-rose-400 hover:bg-rose-900/30"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {itemFields.map(field => (
            <FieldRow key={field.key} label={field.label}>
              {field.type === 'textarea' ? (
                <textarea className={textareaCls} rows={2} value={String(item[field.key] || '')} onChange={e => update(idx, field.key, e.target.value)} />
              ) : (
                <input type={field.type} className={inputCls} value={String(item[field.key] || '')} onChange={e => update(idx, field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)} />
              )}
            </FieldRow>
          ))}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 rounded-lg border border-dashed border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:border-sky-500 hover:text-sky-400 transition-colors w-full justify-center">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}

// ─── Simple Text Editor ────────────────────────────────────────────────────────

function SimpleEditor({ content, setContent, fields }: {
  content: Record<string, unknown>;
  setContent: (c: Record<string, unknown>) => void;
  fields: { key: string; label: string; type: 'text' | 'textarea' }[];
}) {
  return (
    <div className="space-y-3">
      {fields.map(field => (
        <FieldRow key={field.key} label={field.label}>
          {field.type === 'textarea' ? (
            <textarea className={textareaCls} rows={3} value={String(content[field.key] || '')} onChange={e => setContent({ ...content, [field.key]: e.target.value })} />
          ) : (
            <input className={inputCls} value={String(content[field.key] || '')} onChange={e => setContent({ ...content, [field.key]: e.target.value })} />
          )}
        </FieldRow>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomepageCMSPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/homepage/sections');
      setSections(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      // If API unavailable, provide sensible defaults
      setSections([
        { id: '1', key: 'hero', title: 'Hero Section', content: { slides: [] }, isEnabled: true, sortOrder: 0 },
        { id: '2', key: 'featured_products', title: 'Featured Products', content: {}, isEnabled: true, sortOrder: 1 },
        { id: '3', key: 'services_overview', title: 'Services Overview', content: {}, isEnabled: true, sortOrder: 2 },
        { id: '4', key: 'why_choose_us', title: 'Why Choose Us', content: { items: [] }, isEnabled: true, sortOrder: 3 },
        { id: '5', key: 'about_preview', title: 'About Preview', content: { headline: '', description: '' }, isEnabled: true, sortOrder: 4 },
        { id: '6', key: 'stats', title: 'Statistics', content: { items: [] }, isEnabled: true, sortOrder: 5 },
        { id: '7', key: 'cta', title: 'Call to Action', content: { headline: '', description: '', primaryCTA: { label: '', href: '' } }, isEnabled: true, sortOrder: 6 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const handleToggle = async (key: string, enabled: boolean) => {
    try {
      await apiFetch(`/admin/homepage/sections/${key}`, { method: 'PUT', body: JSON.stringify({ isEnabled: enabled }) });
      setSections(prev => prev.map(s => s.key === key ? { ...s, isEnabled: enabled } : s));
      showToast(`Section ${enabled ? 'enabled' : 'hidden'}`);
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    }
  };

  const handleSave = async (key: string, content: Record<string, unknown>) => {
    try {
      await apiFetch(`/admin/homepage/sections/${key}`, { method: 'PUT', body: JSON.stringify({ content }) });
      setSections(prev => prev.map(s => s.key === key ? { ...s, content } : s));
      showToast('Section saved successfully');
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    }
  };

  const renderEditor = (section: HomepageSection) => {
    switch (section.key) {
      case 'hero':
        return (content: Record<string, unknown>, setContent: (c: Record<string, unknown>) => void, save: () => void) => (
          <HeroEditor content={content} setContent={setContent} />
        );
      case 'why_choose_us':
        return (content: Record<string, unknown>, setContent: (c: Record<string, unknown>) => void) => (
          <ListEditor content={content} setContent={setContent} listKey="items" addLabel="Add Advantage"
            itemFields={[{ key: 'icon', label: 'Icon Name', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }]} />
        );
      case 'stats':
        return (content: Record<string, unknown>, setContent: (c: Record<string, unknown>) => void) => (
          <ListEditor content={content} setContent={setContent} listKey="items" addLabel="Add Stat"
            itemFields={[{ key: 'value', label: 'Value', type: 'text' }, { key: 'label', label: 'Label', type: 'text' }, { key: 'suffix', label: 'Suffix (e.g. +)', type: 'text' }]} />
        );
      case 'about_preview':
        return (content: Record<string, unknown>, setContent: (c: Record<string, unknown>) => void) => (
          <SimpleEditor content={content} setContent={setContent} fields={[
            { key: 'headline', label: 'Headline', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'imageUrl', label: 'Image URL', type: 'text' },
            { key: 'ctaLabel', label: 'CTA Label', type: 'text' },
            { key: 'ctaHref', label: 'CTA Link', type: 'text' },
          ]} />
        );
      case 'cta':
        return (content: Record<string, unknown>, setContent: (c: Record<string, unknown>) => void) => (
          <SimpleEditor content={content} setContent={setContent} fields={[
            { key: 'headline', label: 'Headline', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'primaryLabel', label: 'Primary CTA Label', type: 'text' },
            { key: 'primaryHref', label: 'Primary CTA Link', type: 'text' },
            { key: 'secondaryLabel', label: 'Secondary CTA Label', type: 'text' },
            { key: 'secondaryHref', label: 'Secondary CTA Link', type: 'text' },
          ]} />
        );
      default:
        return (content: Record<string, unknown>, setContent: (c: Record<string, unknown>) => void) => (
          <div className="text-sm text-slate-500 italic">This section is auto-populated from database content (products/services). No manual content editing required.</div>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Homepage CMS</h1>
        <p className="mt-1 text-slate-400">Manage and configure every section of the public homepage.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {sections
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(section => (
              <SectionCard key={section.key} section={section} onToggle={handleToggle} onSave={handleSave}>
                {renderEditor(section)}
              </SectionCard>
            ))}
        </div>
      )}
    </div>
  );
}
