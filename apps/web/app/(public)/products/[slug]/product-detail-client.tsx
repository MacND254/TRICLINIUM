'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Check,
  Share2,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuote } from '@/lib/quote-context';
import { InquiryModal } from '@/components/public/inquiry-modal';
import { formatPrice } from '@/lib/utils';

export function ProductDetailClient({ product }: { product: any }) {
  const { addItem, items } = useQuote();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images.map((img: any) => img.url)
    : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'];

  const isInQuote = items.some((i) => i.productId === product.id);
  const displayPrice = product.promotionalPrice ?? product.price;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* 1. Left Gallery */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border bg-white p-8 flex items-center justify-center shadow-sm relative">
          <img
            src={images[activeImageIdx]}
            alt={product.name}
            className="max-h-[82%] max-w-[82%] w-auto h-auto object-contain object-center"
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((imgUrl: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative h-20 w-24 shrink-0 rounded-lg overflow-hidden border-2 bg-white p-1.5 flex items-center justify-center transition-all ${
                  activeImageIdx === idx ? 'border-sky-600 ring-2 ring-sky-200' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="" className="max-h-full max-w-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Right Info & Action Panel */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">
              SKU: {product.sku}
            </span>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
            </button>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-sky-600 font-semibold">{product.category?.name}</p>
        </div>

        {/* Price & Availability */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border flex items-center justify-between">
          <div>
            {product.priceVisible && displayPrice ? (
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Commercial Pricing
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                    {formatPrice(displayPrice, product.currency)}
                  </span>
                  {product.promotionalPrice && product.price && (
                    <span className="text-sm text-muted-foreground line-through font-mono">
                      {formatPrice(product.price, product.currency)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs uppercase text-muted-foreground font-semibold">Commercial Terms</span>
                <div className="text-base font-bold text-sky-700">Custom Quotation Required</div>
              </div>
            )}
          </div>
          <Badge variant="success" className="uppercase font-semibold">
            {product.availability.replace('_', ' ')}
          </Badge>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Key Features List */}
        {product.features && product.features.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Key Engineering Features
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {product.features.map((feat: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="pt-4 border-t space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={() => setInquiryModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Inquire / Request Order</span>
            </Button>

            <Link href="/contact" className="w-full">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <span>Book Site Survey &amp; Installation</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>1-Year Hardware Warranty &amp; Certified Installation Support Included.</span>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        targetId={product.id}
        targetName={`${product.name} (${product.sku})`}
        type="product"
      />
    </div>
  );
}
