'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save, Loader2, X, Globe, Mail, Phone, MapPin, Share2,
  Search, Image, Palette, Bell, AlertCircle, CheckCircle2, Building2,
  Upload, Trash2,
} from 'lucide-react';
import { handleKenyanPhoneChange, formatKenyanPhone } from '@/lib/phone';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WebsiteSettings {
  // General
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  // Contact
  contactEmail: string;
  supportEmail: string;
  phone: string;
  phoneAlt: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  // Social
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  // Business
  businessHours: string;
  currency: string;
  currencySymbol: string;
  showPrices: boolean;
  enableQuotations: boolean;
  // Notifications
  notifyEmail: string;
  notifyOnInquiry: boolean;
  notifyOnQuotation: boolean;
  // Mail Gateway (SMTP)
  mailGatewayProvider: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFromEmail: string;
  smtpFromName: string;
}

const DEFAULTS: WebsiteSettings = {
  siteName: 'TRICLINIUM SYSTEMS',
  tagline: 'CCTV Surveillance, Smart Alarms & Home Network Infrastructure',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#0ea5e9',
  accentColor: '#0284c7',
  contactEmail: 'inquiries@triclinium.com',
  supportEmail: 'support@triclinium.com',
  phone: '+254 700 555 199',
  phoneAlt: '+254 711 555 198',
  address: 'Westlands Commercial Center, Ring Road',
  city: 'Nairobi',
  country: 'Kenya',
  postalCode: '00100',
  facebook: '',
  twitter: '',
  linkedin: '',
  instagram: '',
  youtube: '',
  metaTitle: 'TRICLINIUM SYSTEMS — CCTV Surveillance & Smart Security',
  metaDescription: 'Kenya premier supplier & installer of 4K CCTV surveillance cameras, smart video doorbells, wireless home alarms, nanny cams, and video intercoms.',
  metaKeywords: 'cctv nairobi, security cameras kenya, home alarms, video doorbells, nanny cams, video intercom, mesh wifi',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  businessHours: 'Mon–Sat: 08:00–18:00 EAT (24/7 Monitoring Station)',
  currency: 'KES',
  currencySymbol: 'Ksh',
  showPrices: true,
  enableQuotations: true,
  notifyEmail: 'archer.tritech@gmail.com',
  notifyOnInquiry: true,
  notifyOnQuotation: true,
  mailGatewayProvider: 'smtp',
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  smtpFromEmail: 'notifications@triclinium.com',
  smtpFromName: 'TRICLINIUM SYSTEMS Alerts',
};

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

// ─── UI helpers ───────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-5 border-b border-slate-800">
      <div className="h-10 w-10 rounded-xl bg-sky-900/30 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-sky-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ToggleField({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-sky-600' : 'bg-slate-700'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

type TabId = 'general' | 'contact' | 'social' | 'seo' | 'business' | 'notifications' | 'mail';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'business', label: 'Business', icon: Globe },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'mail', label: 'Mail Gateway', icon: Mail },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/api/v1/admin/media/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Logo upload failed');
      }
      const json = await res.json();
      const uploadedUrl = json.data?.url || json.url || '';
      if (uploadedUrl) {
        set('logoUrl', uploadedUrl);
        showToast('Logo image uploaded successfully. Click Save to persist.');
      }
    } catch (err: any) {
      alert('Logo upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/settings');
      const data = res.data || res;
      const merged: WebsiteSettings = { ...DEFAULTS };

      if (data && typeof data === 'object') {
        for (const [k, v] of Object.entries(data)) {
          if (k in merged) {
            if (typeof (merged as any)[k] === 'boolean') {
              (merged as any)[k] = v === 'true' || v === true;
            } else {
              (merged as any)[k] = v ?? '';
            }
          }
        }
      }

      if (Array.isArray(res.items)) {
        for (const item of res.items) {
          if (item.key in merged) {
            if (typeof (merged as any)[item.key] === 'boolean') {
              (merged as any)[item.key] = item.value === 'true' || item.value === true;
            } else {
              (merged as any)[item.key] = item.value ?? '';
            }
          }
        }
      }

      setSettings(merged);
    } catch {
      // Silently use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = <K extends keyof WebsiteSettings>(key: K, value: WebsiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert settings object to array of {key, value} for API
      const payload = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      await apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify({ settings: payload }) });
      showToast('Settings saved successfully');
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await handleSave();
      const res = await apiFetch('/admin/settings/test-email', { method: 'POST' });
      showToast(res.message || 'Test email sent successfully! Check your inbox.');
    } catch (e: any) {
      showToast(e.message || 'Failed to send test email', 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-xl text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
          <button onClick={() => setToast(null)}><X className="h-4 w-4 opacity-70 hover:opacity-100" /></button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Website Settings</h1>
          <p className="mt-1 text-slate-400">Configure your site, branding, SEO, and notifications.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50 transition-colors shadow-md">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="w-44 shrink-0 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-sky-900/40 text-sky-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Panel */}
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
          {activeTab === 'general' && (
            <>
              <SectionHeader icon={Building2} title="General Settings" description="Site identity, branding, and appearance." />
              <div className="grid grid-cols-2 gap-5">
                <Field label="Site Name" hint="Displayed in header, emails, and browser tab.">
                  <input className={inputCls} value={settings.siteName} onChange={e => set('siteName', e.target.value)} placeholder="TRICLINIUM" />
                </Field>
                <Field label="Tagline">
                  <input className={inputCls} value={settings.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Precision Engineering Excellence" />
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Website Brand Logo" hint="Upload company logo (PNG, SVG, or JPG). Automatically scaled to fit within the 64px nav menu height.">
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-700 bg-slate-800/80">
                    {settings.logoUrl ? (
                      <div className="relative h-14 w-28 rounded-md bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={settings.logoUrl} alt="Brand Logo" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-14 w-28 rounded-md bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center shrink-0 text-slate-500 text-[10px]">
                        <Image className="h-5 w-5 mb-0.5 text-slate-600" />
                        No Logo
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors">
                        {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo Image'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                      </label>
                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => set('logoUrl', '')}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 px-2.5 py-1.5 text-xs text-rose-300 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </Field>
                <Field label="Favicon URL" hint="Browser tab icon.">
                  <input className={inputCls} value={settings.faviconUrl} onChange={e => set('faviconUrl', e.target.value)} placeholder="https://..." />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Primary Color" hint="Main brand color (hex).">
                  <div className="flex gap-2">
                    <input type="color" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="h-10 w-14 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-1" />
                    <input className={inputCls} value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} placeholder="#0ea5e9" />
                  </div>
                </Field>
                <Field label="Accent Color">
                  <div className="flex gap-2">
                    <input type="color" value={settings.accentColor} onChange={e => set('accentColor', e.target.value)} className="h-10 w-14 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-1" />
                    <input className={inputCls} value={settings.accentColor} onChange={e => set('accentColor', e.target.value)} placeholder="#f59e0b" />
                  </div>
                </Field>
              </div>
            </>
          )}

          {activeTab === 'contact' && (
            <>
              <SectionHeader icon={Phone} title="Contact Information" description="Business contact details shown publicly." />
              <div className="grid grid-cols-2 gap-5">
                <Field label="Primary Email">
                  <input type="email" className={inputCls} value={settings.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="info@triclinium.com" />
                </Field>
                <Field label="Support Email">
                  <input type="email" className={inputCls} value={settings.supportEmail} onChange={e => set('supportEmail', e.target.value)} placeholder="support@triclinium.com" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Primary Phone (Auto +254)" hint="e.g. 0700 555 199 -> +254700555199">
                  <input
                    className={inputCls}
                    value={settings.phone}
                    onChange={e => handleKenyanPhoneChange(e, val => set('phone', val))}
                    onBlur={() => set('phone', formatKenyanPhone(settings.phone))}
                    placeholder="+254 700 555 199"
                  />
                </Field>
                <Field label="Secondary Phone (Auto +254)">
                  <input
                    className={inputCls}
                    value={settings.phoneAlt}
                    onChange={e => handleKenyanPhoneChange(e, val => set('phoneAlt', val))}
                    onBlur={() => set('phoneAlt', formatKenyanPhone(settings.phoneAlt))}
                    placeholder="+254 711 555 198"
                  />
                </Field>
              </div>
              <Field label="Street Address">
                <input className={inputCls} value={settings.address} onChange={e => set('address', e.target.value)} placeholder="123 Industrial Boulevard" />
              </Field>
              <div className="grid grid-cols-3 gap-5">
                <Field label="City">
                  <input className={inputCls} value={settings.city} onChange={e => set('city', e.target.value)} placeholder="Metropolis" />
                </Field>
                <Field label="Country">
                  <input className={inputCls} value={settings.country} onChange={e => set('country', e.target.value)} placeholder="United States" />
                </Field>
                <Field label="Postal Code">
                  <input className={inputCls} value={settings.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="10001" />
                </Field>
              </div>
              <Field label="Business Hours">
                <input className={inputCls} value={settings.businessHours} onChange={e => set('businessHours', e.target.value)} placeholder="Mon–Fri: 08:00–17:00" />
              </Field>
            </>
          )}

          {activeTab === 'social' && (
            <>
              <SectionHeader icon={Share2} title="Social Media" description="Links shown in footer and contact page." />
              <div className="space-y-4">
                {[
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/triclinium' },
                  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/triclinium' },
                  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/triclinium' },
                  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/triclinium' },
                  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@triclinium' },
                ].map(({ key, label, placeholder }) => (
                  <Field key={key} label={label}>
                    <input className={inputCls} value={settings[key as keyof WebsiteSettings] as string} onChange={e => set(key as keyof WebsiteSettings, e.target.value as never)} placeholder={placeholder} />
                  </Field>
                ))}
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <SectionHeader icon={Search} title="SEO & Analytics" description="Default metadata and tracking configuration." />
              <Field label="Default Meta Title" hint="Used when page-specific title not set. Max 60 chars.">
                <input className={inputCls} value={settings.metaTitle} onChange={e => set('metaTitle', e.target.value)} maxLength={60} placeholder="TRICLINIUM — Precision Engineering" />
                <p className="mt-1 text-xs text-slate-600">{settings.metaTitle.length}/60 characters</p>
              </Field>
              <Field label="Default Meta Description" hint="Shown in search results. Max 160 chars.">
                <textarea className={`${inputCls} resize-none`} rows={3} value={settings.metaDescription} onChange={e => set('metaDescription', e.target.value)} maxLength={160} placeholder="Leading provider of precision engineering solutions…" />
                <p className="mt-1 text-xs text-slate-600">{settings.metaDescription.length}/160 characters</p>
              </Field>
              <Field label="Meta Keywords" hint="Comma-separated. Limited SEO value but informative.">
                <input className={inputCls} value={settings.metaKeywords} onChange={e => set('metaKeywords', e.target.value)} placeholder="precision engineering, industrial hardware" />
              </Field>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Google Analytics ID" hint="e.g. G-XXXXXXXXXX">
                  <input className={inputCls} value={settings.googleAnalyticsId} onChange={e => set('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" />
                </Field>
                <Field label="Google Tag Manager ID" hint="e.g. GTM-XXXXXXX">
                  <input className={inputCls} value={settings.googleTagManagerId} onChange={e => set('googleTagManagerId', e.target.value)} placeholder="GTM-XXXXXXX" />
                </Field>
              </div>
            </>
          )}

          {activeTab === 'business' && (
            <>
              <SectionHeader icon={Globe} title="Business Configuration" description="Commerce, pricing, and quotation settings." />
              <div className="grid grid-cols-2 gap-5">
                <Field label="Currency Code" hint="ISO 4217 code, e.g. USD, EUR, GBP.">
                  <input className={inputCls} value={settings.currency} onChange={e => set('currency', e.target.value)} placeholder="USD" />
                </Field>
                <Field label="Currency Symbol">
                  <input className={inputCls} value={settings.currencySymbol} onChange={e => set('currencySymbol', e.target.value)} placeholder="$" />
                </Field>
              </div>
              <div className="rounded-xl border border-slate-800 p-5 space-y-5">
                <ToggleField
                  label="Show Prices on Products"
                  hint="Display product pricing publicly. Disable for quote-only businesses."
                  checked={settings.showPrices}
                  onChange={v => set('showPrices', v)}
                />
                <div className="border-t border-slate-800" />
                <ToggleField
                  label="Enable Quotation System"
                  hint="Allow visitors to add items to a quote cart and submit RFQ requests."
                  checked={settings.enableQuotations}
                  onChange={v => set('enableQuotations', v)}
                />
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <SectionHeader icon={Bell} title="Email Notifications" description="Configure where admin alerts are sent." />
              <Field label="Notification Email" hint="All admin alerts go to this address.">
                <input type="email" className={inputCls} value={settings.notifyEmail} onChange={e => set('notifyEmail', e.target.value)} placeholder="alerts@triclinium.com" />
              </Field>
              <div className="rounded-xl border border-slate-800 p-5 space-y-5 mt-4">
                <ToggleField
                  label="Notify on New Inquiry"
                  hint="Send email when a contact or product inquiry is submitted."
                  checked={settings.notifyOnInquiry}
                  onChange={v => set('notifyOnInquiry', v)}
                />
                <div className="border-t border-slate-800" />
                <ToggleField
                  label="Notify on New Quotation"
                  hint="Send email when a quotation request is submitted."
                  checked={settings.notifyOnQuotation}
                  onChange={v => set('notifyOnQuotation', v)}
                />
              </div>

              <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">Dual Email Delivery: Resend + SMTP Gateway</p>
                    <p className="text-xs text-amber-400/70 mt-1">Configure your Resend API key in environment variables (<code className="font-mono">RESEND_API_KEY</code>) or switch to the <strong>Mail Gateway</strong> tab to configure your own direct SMTP credentials (Gmail, Outlook, Mailgun, etc.).</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'mail' && (
            <>
              <SectionHeader
                icon={Mail}
                title="Mail Gateway (SMTP Configuration)"
                description="Configure outgoing SMTP mail server to receive instant customer inquiry alerts directly in your inbox."
              />

              <div className="rounded-xl border border-sky-800/40 bg-sky-950/20 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-sky-200 space-y-1">
                    <p className="font-semibold text-sky-300">Automatic Inquiry Delivery Gateway</p>
                    <p>
                      When a visitor sends a message via the public Contact form or submits a CCTV product/service inquiry, the system immediately dispatches an alert email to <strong className="text-white underline">{settings.notifyEmail || 'archer.tritech@gmail.com'}</strong>.
                    </p>
                    <p className="text-slate-400 text-[11px] pt-1">
                      Works with Gmail, Outlook 365, Mailgun, SendGrid, Amazon SES, or any standard cPanel SMTP server.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="SMTP Host Server" hint="e.g. smtp.gmail.com or mail.yourdomain.com">
                  <input
                    className={inputCls}
                    value={settings.smtpHost}
                    onChange={(e) => set('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </Field>
                <Field label="SMTP Port" hint="Standard ports: 587 (TLS/STARTTLS) or 465 (SSL)">
                  <input
                    className={inputCls}
                    value={settings.smtpPort}
                    onChange={(e) => set('smtpPort', e.target.value)}
                    placeholder="587"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="SMTP Username / Account Email">
                  <input
                    className={inputCls}
                    value={settings.smtpUser}
                    onChange={(e) => set('smtpUser', e.target.value)}
                    placeholder="notifications@yourdomain.com"
                  />
                </Field>
                <Field label="SMTP Password" hint="For Gmail, use a generated 16-character App Password">
                  <input
                    type="password"
                    className={inputCls}
                    value={settings.smtpPass}
                    onChange={(e) => set('smtpPass', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Sender Email Address (From)" hint="Address displayed to recipients">
                  <input
                    type="email"
                    className={inputCls}
                    value={settings.smtpFromEmail}
                    onChange={(e) => set('smtpFromEmail', e.target.value)}
                    placeholder="notifications@triclinium.com"
                  />
                </Field>
                <Field label="Sender Display Name">
                  <input
                    className={inputCls}
                    value={settings.smtpFromName}
                    onChange={(e) => set('smtpFromName', e.target.value)}
                    placeholder="TRICLINIUM Security Enterprise"
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-slate-800 p-4">
                <ToggleField
                  label="Use SSL/TLS Connection"
                  hint="Enable if connecting via port 465. Leave disabled if connecting via port 587 (STARTTLS)."
                  checked={settings.smtpSecure}
                  onChange={(v) => set('smtpSecure', v)}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400">
                  Sends a test message to: <strong className="text-slate-200">{settings.notifyEmail || 'archer.tritech@gmail.com'}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail || saving}
                  className="flex items-center gap-2 rounded-lg border border-sky-700 bg-sky-900/30 px-4 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 disabled:opacity-50 transition-colors"
                >
                  {testingEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                  <span>{testingEmail ? 'Dispatching Test Email...' : 'Send Test Email'}</span>
                </button>
              </div>
            </>
          )}

          {/* Bottom save button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
