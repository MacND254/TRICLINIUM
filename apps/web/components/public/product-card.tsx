'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  categoryName?: string;
  price?: number | null;
  promotionalPrice?: number | null;
  priceVisible?: boolean;
  currency?: string;
  availability?: string;
  imageUrl?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  sku,
  shortDescription,
  categoryName,
  price,
  promotionalPrice,
  priceVisible = true,
  currency = 'KES',
  availability = 'IN_STOCK',
  imageUrl = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
}: ProductCardProps) {
  const displayPrice = promotionalPrice ?? price;

  const availabilityLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'outline' }> = {
    IN_STOCK: { label: 'In Stock', variant: 'success' },
    LOW_STOCK: { label: 'Low Stock', variant: 'warning' },
    OUT_OF_STOCK: { label: 'Backorder', variant: 'outline' },
    PREORDER: { label: 'Pre-Order', variant: 'outline' },
    MADE_TO_ORDER: { label: 'Custom Build', variant: 'outline' },
  };

  const avail = availabilityLabels[availability] || { label: 'Available', variant: 'outline' };

  return (
    <div className="group rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Product Image Area */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white p-4 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
          <img
            src={imageUrl}
            alt={name}
            className="max-h-full max-w-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {categoryName && (
              <span className="inline-block rounded bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-white">
                {categoryName}
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant={avail.variant} className="text-[10px] uppercase font-semibold">
              {avail.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="text-[11px] text-muted-foreground font-mono mb-1">SKU: {sku}</div>
          <Link href={`/products/${slug}`}>
            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-600 transition-colors">
              {name}
            </h3>
          </Link>
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between">
        <div>
          {priceVisible && displayPrice ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatPrice(displayPrice, currency)}
                </span>
                {promotionalPrice && price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(price, currency)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[11px] text-muted-foreground font-medium uppercase">Pricing</span>
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">Price on Request</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Link href={`/products/${slug}`}>
            <Button size="sm" className="h-8 px-3 text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1 shadow-sm">
              <span>View Product</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
