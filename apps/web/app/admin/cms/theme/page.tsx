'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Check,
  Save,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Eye,
  ShieldCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';

const COLOR_PRESETS = [
  { name: 'Electric Sky (Default)', primary: '#0ea5e9', accent: '#0284c7', desc: 'Modern cybersecurity cyan/blue' },
  { name: 'Sentinel Royal Navy', primary: '#2563eb', accent: '#1d4ed8', desc: 'High-assurance law enforcement blue' },
  { name: 'Emerald Shield', primary: '#10b981', accent: '#059669', desc: 'Secure defense green & safe monitoring' },
  { name: 'Apex Crimson Guard', primary: '#ef4444', accent: '#dc2626', desc: 'Urgent intrusion alarm & active deterrence' },
  { name: 'Amber Sentinel', primary: '#f59e0b', accent: '#d97706', desc: 'Industrial caution & thermal detection' },
  { name: 'Deep Cyber Violet', primary: '#8b5cf6', accent: '#7c3aed', desc: 'AI neural surveillance & edge intelligence' },
];

const COLOR_GRADINGS = [
  {
    id: 'cyber-security',
    name: 'Cyber Security (Recommended)',
    desc: 'Deep high-contrast backgrounds with vivid crisp highlights and glowing borders.',
  },
  {
    id: 'corporate-slate',
    name: 'Corporate Slate & Steel',
    desc: 'Balanced neutral slate tones for clean enterprise and commercial projects.',
  },
  {
    id: 'emerald-defense',
    name: 'Emerald Defense',
    desc: 'Subtle forest & emerald accents for residential perimeter defense.',
  },
  {
    id: 'midnight-sentinel',
    name: 'Midnight Sentinel',
    desc: 'Ultra-deep blacks with razor-sharp neon highlights.',
  },
];

const RADIUS_OPTIONS = [
  { id: 'rounded-md', name: 'Sharp High-Tech (6px)', value: '6px' },
  { id: 'rounded-xl', name: 'Modern Rounded (12px - Default)', value: '12px' },
  { id: 'rounded-2xl', name: 'Soft Gentle (16px)', value: '16px' },
];

export default function AdminThemePage() {
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9');
  const [accentColor, setAccentColor] = useState('#0284c7');
  const [themeMode, setThemeMode] = useState('system');
  const [colorGrading, setColorGrading] = useState('cyber-security');
  const [borderRadius, setBorderRadius] = useState('rounded-xl');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadThemeSettings() {
      try {
        const res = await fetchApi('/admin/settings');
        const data = res.data || res;
        if (data.primaryColor) setPrimaryColor(data.primaryColor);
        if (data.accentColor) setAccentColor(data.accentColor);
        if (data.themeMode) setThemeMode(data.themeMode);
        if (data.colorGrading) setColorGrading(data.colorGrading);
        if (data.borderRadius) setBorderRadius(data.borderRadius);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadThemeSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetchApi('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          primaryColor,
          accentColor,
          themeMode,
          colorGrading,
          borderRadius,
        }),
      });

      // Update live CSS variables immediately for preview
      document.documentElement.style.setProperty('--user-primary', primaryColor);
      document.documentElement.style.setProperty('--user-accent', accentColor);
      document.body.dataset.colorGrading = colorGrading;

      setToastMsg('Theme & Color Grading updated successfully! Public pages now reflect your changes.');
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save theme settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-sky-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Theme &amp; Color Grading Customizer
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control the visual palette, color grading mood, and default appearance mode for all public-facing visitors.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Theme Changes</span>
        </Button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Color Palettes & Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Preset Palettes */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span>Security Color Presets</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = primaryColor.toLowerCase() === preset.primary.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setAccentColor(preset.accent);
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/30 ring-1 ring-sky-500'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="h-9 w-9 rounded-lg shrink-0 border border-white/20 shadow flex items-center justify-center"
                      style={{ backgroundColor: preset.primary }}
                    >
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{preset.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Pickers */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Primary Accent Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-12 rounded border border-slate-700 bg-slate-800 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Secondary / Hover Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-12 rounded border border-slate-700 bg-slate-800 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Grading Mood */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-400" />
              <span>Color Grading &amp; Atmosphere</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {COLOR_GRADINGS.map((cg) => {
                const isSelected = colorGrading === cg.id;
                return (
                  <button
                    key={cg.id}
                    type="button"
                    onClick={() => setColorGrading(cg.id)}
                    className={`flex items-start justify-between p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/30 ring-1 ring-sky-500'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{cg.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{cg.desc}</div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Visitor Theme Mode */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Default Visitor Appearance Mode
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'system', name: 'Auto (System)', icon: Laptop },
                { id: 'dark', name: 'Dark Mode', icon: Moon },
                { id: 'light', name: 'Light Mode', icon: Sun },
              ].map((m) => {
                const isSelected = themeMode === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setThemeMode(m.id)}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className="space-y-6">
          <div className="sticky top-6 p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-sky-400" />
                <span>Live Component Preview</span>
              </span>
              <Badge variant="outline" className="text-[9px] uppercase font-bold border-slate-700 text-slate-300">
                User-End Look
              </Badge>
            </div>

            {/* Simulated Public Card */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Featured 4K CCTV
                </span>
                <span className="text-[11px] font-mono font-bold text-white">
                  Ksh 14,500
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-white">
                  ApexGuard 4K AI Turret Camera
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Sony Starvis 2 sensor with full-color night vision and active vehicle tracking.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                  <span>1-Year Kenya On-Site Warranty</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Inquire / Request Order</span>
                <ArrowRight className="h-3 w-3" />
              </button>

              <button
                type="button"
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 transition-colors"
              >
                Book Free Site Survey
              </button>
            </div>

            {/* Color summary */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Primary:</span>
                <span className="text-white font-bold">{primaryColor}</span>
              </div>
              <div className="flex justify-between">
                <span>Accent:</span>
                <span className="text-white font-bold">{accentColor}</span>
              </div>
              <div className="flex justify-between">
                <span>Mood:</span>
                <span className="text-white">{colorGrading}</span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Publish Theme to Website
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
