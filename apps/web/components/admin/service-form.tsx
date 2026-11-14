'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';

interface ServiceFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function ServiceForm({ initialData, isEdit }: ServiceFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage ||
      'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80'
  );

  const [pricingModel, setPricingModel] = useState(initialData?.pricingModel || 'CUSTOM_QUOTE');
  const [price, setPrice] = useState(initialData?.price ?? '');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');

  const [features, setFeatures] = useState<string[]>(
    initialData?.features || ['Tolerances to ±0.005mm', '100% Optical Metrology CMM Verification']
  );

  const [benefits, setBenefits] = useState<string[]>(
    initialData?.benefits || ['Direct CAD/CAM collaboration', 'Full material heat-lot traceability']
  );

  const [process, setProcess] = useState<Array<{ title: string; description: string }>>(
    initialData?.process || [
      { title: 'Engineering CAD Analysis', description: 'Review design for manufacturability and alloy selection.' },
      { title: 'Multi-Axis Execution', description: 'Precision milling with continuous coolant control.' },
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetchApi('/service-categories');
        setCategories(res);
        if (!categoryId && res.length > 0) {
          setCategoryId(res[0].id);
        }
      } catch (e) {}
    }
    loadCats();
  }, []);

  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));
  const updateFeature = (idx: number, val: string) => {
    const next = [...features];
    next[idx] = val;
    setFeatures(next);
  };

  const addBenefit = () => setBenefits([...benefits, '']);
  const removeBenefit = (idx: number) => setBenefits(benefits.filter((_, i) => i !== idx));
  const updateBenefit = (idx: number, val: string) => {
    const next = [...benefits];
    next[idx] = val;
    setBenefits(next);
  };

  const addStep = () => setProcess([...process, { title: '', description: '' }]);
  const removeStep = (idx: number) => setProcess(process.filter((_, i) => i !== idx));
  const updateStep = (idx: number, field: string, val: string) => {
    const next = [...process];
    next[idx] = { ...next[idx], [field]: val };
    setProcess(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      categoryId,
      shortDescription,
      fullDescription,
      featuredImage: featuredImage || null,
      pricingModel,
      price: price === '' ? null : Number(price),
      isFeatured,
      status,
      features: features.filter((f) => f.trim().length > 0),
      benefits: benefits.filter((b) => b.trim().length > 0),
      process: process.filter((p) => p.title.trim().length > 0),
    };

    try {
      if (isEdit && initialData?.id) {
        await fetchApi(`/admin/services/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/admin/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      router.push('/admin/services');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/services')}
            className="border-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Cancel</span>
          </Button>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? `Edit Service: ${name}` : 'Create Engineering Service'}
          </h1>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{isEdit ? 'Save Changes' : 'Publish Service'}</span>
            </>
          )}
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Metadata */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Service Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Service Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Advanced 5-Axis CNC Precision Machining"
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Category *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Featured Image URL</label>
          <Input
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://..."
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Short Description *</label>
          <Input
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="One-line summary for cards."
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Full Scope of Service *</label>
          <Textarea
            required
            rows={5}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed engineering capabilities, tolerances, machine specs..."
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>
      </div>

      {/* Pricing & Status */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Commercial Terms</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Pricing Model</label>
            <select
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white"
            >
              <option value="CUSTOM_QUOTE">Custom Scope / RFQ</option>
              <option value="FIXED">Fixed Engagement</option>
              <option value="HOURLY">Hourly T&M</option>
              <option value="TIERED">Tiered Package</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Base Price (optional)</label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 2800.00"
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-sky-600"
            />
            <span>Feature on Homepage Services Overview</span>
          </label>
        </div>
      </div>

      {/* Process Workflow Steps Builder */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Methodology & Process Steps</h3>
          <Button type="button" size="sm" variant="outline" onClick={addStep} className="h-7 text-xs border-slate-700">
            <Plus className="h-3 w-3 mr-1" /> Add Step
          </Button>
        </div>
        <div className="space-y-3">
          {process.map((step, idx) => (
            <div key={idx} className="flex gap-3 items-start bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                {idx + 1}
              </span>
              <div className="flex-1 space-y-2">
                <Input
                  value={step.title}
                  onChange={(e) => updateStep(idx, 'title', e.target.value)}
                  placeholder="Step title, e.g. CAD Toolpath Simulation"
                  className="bg-slate-900 border-slate-700 text-white text-xs h-8"
                />
                <Input
                  value={step.description}
                  onChange={(e) => updateStep(idx, 'description', e.target.value)}
                  placeholder="Detailed explanation of activities in this phase..."
                  className="bg-slate-900 border-slate-700 text-white text-xs h-8"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStep(idx)}
                className="h-8 w-8 text-rose-400 hover:text-rose-300 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Features & Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Technical Features</h3>
            <Button type="button" size="sm" variant="outline" onClick={addFeature} className="h-7 text-xs border-slate-700">
              <Plus className="h-3 w-3 mr-1" /> Add Feature
            </Button>
          </div>
          <div className="space-y-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={feat}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  placeholder="e.g. ±0.005mm Tolerance threshold"
                  className="bg-slate-950 border-slate-800 text-white text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFeature(idx)}
                  className="h-8 w-8 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Commercial Benefits</h3>
            <Button type="button" size="sm" variant="outline" onClick={addBenefit} className="h-7 text-xs border-slate-700">
              <Plus className="h-3 w-3 mr-1" /> Add Benefit
            </Button>
          </div>
          <div className="space-y-2">
            {benefits.map((ben, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={ben}
                  onChange={(e) => updateBenefit(idx, e.target.value)}
                  placeholder="e.g. Complete mill test reports"
                  className="bg-slate-950 border-slate-800 text-white text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBenefit(idx)}
                  className="h-8 w-8 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
