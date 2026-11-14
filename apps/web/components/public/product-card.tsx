'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuote } from '@/lib/quote-context';
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
  currency = 'USD',
  availability = 'IN_STOCK',
  imageUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
}: ProductCardProps) {
  const { addItem, items } = useQuote();
  const isInQuote = items.some((i) => i.productId === id);

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
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
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
              <span className="text-xs text-muted-foreground uppercase font-medium">Starting at</span>
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
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">Quote on Request</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={isInQuote ? 'secondary' : 'outline'}
            onClick={() =>
              addItem({
                productId: id,
                name,
                sku,
                price: displayPrice,
                imageUrl,
              })
            }
            className="h-8 px-2.5 text-xs flex items-center gap-1"
            title="Add to RFQ Quote list"
          >
            {isInQuote ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="hidden sm:inline">Quoted</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">Quote</span>
              </>
            )}
          </Button>

          <Link href={`/products/${slug}`}>
            <Button size="sm" className="h-8 px-2.5 text-xs bg-slate-900 hover:bg-slate-800 text-white">
              <span>Details</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
