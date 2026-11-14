'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchApi } from '@/lib/api-client';

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');

  const [price, setPrice] = useState(initialData?.price ?? '');
  const [promotionalPrice, setPromotionalPrice] = useState(initialData?.promotionalPrice ?? '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [priceVisible, setPriceVisible] = useState(initialData?.priceVisible ?? true);
  const [availability, setAvailability] = useState(initialData?.availability || 'IN_STOCK');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');

  const [features, setFeatures] = useState<string[]>(
    initialData?.features || ['Machined from 316 Marine Grade Stainless Steel']
  );

  const [specifications, setSpecifications] = useState<Array<{ name: string; value: string; group?: string }>>(
    initialData?.specifications || [{ name: 'Capacity', value: '750 kg', group: 'Mechanical' }]
  );

  const [images, setImages] = useState<Array<{ url: string; altText?: string; isPrimary: boolean }>>(
    initialData?.images || [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        altText: 'Primary Assembly View',
        isPrimary: true,
      },
    ]
  );

  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetchApi('/product-categories');
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

  const addSpec = () => setSpecifications([...specifications, { name: '', value: '' }]);
  const removeSpec = (idx: number) => setSpecifications(specifications.filter((_, i) => i !== idx));
  const updateSpec = (idx: number, field: string, val: string) => {
    const next = [...specifications];
    next[idx] = { ...next[idx], [field]: val };
    setSpecifications(next);
  };

  const addImage = () => setImages([...images, { url: '', isPrimary: false }]);
  const removeImage = (idx: number) => setImages(images.filter((_, i) => i !== idx));
  const updateImage = (idx: number, field: string, val: any) => {
    const next = [...images];
    next[idx] = { ...next[idx], [field]: val };
    setImages(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      sku,
      categoryId,
      shortDescription,
      fullDescription,
      price: price === '' ? null : Number(price),
      promotionalPrice: promotionalPrice === '' ? null : Number(promotionalPrice),
      currency,
      priceVisible,
      availability,
      isFeatured,
      status,
      features: features.filter((f) => f.trim().length > 0),
      specifications: specifications.filter((s) => s.name.trim().length > 0),
      images: images.filter((img) => img.url.trim().length > 0),
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };

    try {
      if (isEdit && initialData?.id) {
        await fetchApi(`/admin/products/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      router.push('/admin/products');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product');
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
            onClick={() => router.push('/admin/products')}
            className="border-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Cancel</span>
          </Button>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? `Edit Product: ${name}` : 'Create New Product Specification'}
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
              <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
            </>
          )}
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Grid: 1. Core Metadata */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Core Metadata</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">Product Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Titan-Forged Pivot Hinge 750"
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">SKU *</label>
            <Input
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="TRIC-HW-750"
              className="bg-slate-950 border-slate-800 text-white text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">URL Slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="titan-pivot-hinge-750"
              className="bg-slate-950 border-slate-800 text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Product Category *</label>
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
          <label className="text-xs font-semibold text-slate-300 block mb-1">Short Description (for cards) *</label>
          <Input
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="One or two sentences summarizing the product."
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Full Detailed Engineering Description *</label>
          <Textarea
            required
            rows={5}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed mechanical prose, operational specs, metallurgical standards..."
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>
      </div>

      {/* Grid: 2. Pricing, Inventory & Status */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Pricing & Inventory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Base Price</label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1250.00"
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Promotional Price</label>
            <Input
              type="number"
              step="0.01"
              value={promotionalPrice}
              onChange={(e) => setPromotionalPrice(e.target.value)}
              placeholder="1120.00"
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white"
            >
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="MADE_TO_ORDER">Made to Order</option>
              <option value="PREORDER">Pre-Order</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Publication Status</label>
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

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={priceVisible}
              onChange={(e) => setPriceVisible(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-sky-600"
            />
            <span>Show Price on Public Website</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-sky-600"
            />
            <span>Feature on Homepage</span>
          </label>
        </div>
      </div>

      {/* Grid: 3. Dynamic Specifications & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Specifications Builder */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Specifications</h3>
            <Button type="button" size="sm" variant="outline" onClick={addSpec} className="h-7 text-xs border-slate-700">
              <Plus className="h-3 w-3 mr-1" /> Add Spec
            </Button>
          </div>
          <div className="space-y-2">
            {specifications.map((spec, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={spec.name}
                  onChange={(e) => updateSpec(idx, 'name', e.target.value)}
                  placeholder="e.g. Load Capacity"
                  className="bg-slate-950 border-slate-800 text-white text-xs flex-1"
                />
                <Input
                  value={spec.value}
                  onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                  placeholder="e.g. 750 kg"
                  className="bg-slate-950 border-slate-800 text-white text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSpec(idx)}
                  className="h-8 w-8 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Features Builder */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Key Features</h3>
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
                  placeholder="e.g. 316-L marine grade stainless steel"
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
      </div>

      {/* Grid: 4. Image Gallery URLs */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Product Images & Gallery</h3>
          <Button type="button" size="sm" variant="outline" onClick={addImage} className="h-7 text-xs border-slate-700">
            <Plus className="h-3 w-3 mr-1" /> Add Image URL
          </Button>
        </div>
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <Input
                value={img.url}
                onChange={(e) => updateImage(idx, 'url', e.target.value)}
                placeholder="https://images.unsplash.com/... or Cloudinary URL"
                className="bg-slate-950 border-slate-800 text-white text-xs flex-1"
              />
              <Input
                value={img.altText || ''}
                onChange={(e) => updateImage(idx, 'altText', e.target.value)}
                placeholder="Alt description"
                className="bg-slate-950 border-slate-800 text-white text-xs w-48 hidden sm:block"
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer shrink-0">
                <input
                  type="radio"
                  name="primary_image"
                  checked={img.isPrimary}
                  onChange={() => {
                    const next = images.map((im, i) => ({ ...im, isPrimary: i === idx }));
                    setImages(next);
                  }}
                />
                <span>Primary</span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeImage(idx)}
                className="h-8 w-8 text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: 5. SEO Configuration */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">SEO & Metadata</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Custom SEO Title</label>
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. Titan-Forged 750kg Pivot Hinge | TRICLINIUM"
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Custom Meta Description</label>
            <Input
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Search engine summary..."
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
