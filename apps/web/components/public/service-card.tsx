import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ServiceCardProps {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  categoryName?: string;
  featuredImage?: string | null;
  pricingModel?: string;
  price?: number | null;
  currency?: string;
  features?: string[];
}

export function ServiceCard({
  name,
  slug,
  shortDescription,
  categoryName,
  featuredImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  pricingModel = 'CUSTOM_QUOTE',
  price,
  currency = 'KES',
  features = [],
}: ServiceCardProps) {
  const modelLabels: Record<string, string> = {
    FIXED: 'Fixed Installation',
    HOURLY: 'Standard Hourly',
    CUSTOM_QUOTE: 'Custom Scope / Free Survey',
    TIERED: 'Tiered Package',
  };

  const formattedPrice = price
    ? `From Ksh ${price.toLocaleString()}`
    : 'Custom Survey & Quote';

  return (
    <div className="group rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Service Image with badges */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={featuredImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'}
            alt={name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {categoryName && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-slate-700/60 shadow">
              <ShieldCheck className="h-3 w-3 text-sky-400" />
              <span>{categoryName}</span>
            </span>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="bg-sky-600/90 backdrop-blur-sm px-2.5 py-0.5 rounded text-[11px] font-bold">
              {formattedPrice}
            </span>
            <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm text-slate-300">
              {modelLabels[pricingModel] || 'Custom Scope'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <Link href={`/services/${slug}`}>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                {name}
              </h3>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {shortDescription}
            </p>
          </div>

          {/* Key Deliverables */}
          {features.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Scope Highlights:
              </span>
              {features.slice(0, 3).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <Link href={`/services/${slug}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold hover:border-sky-500 hover:text-sky-600 transition-colors"
            >
              <span>Explore Details</span>
              <ArrowRight className="h-3 w-3 ml-1.5" />
            </Button>
          </Link>
          <Link href="/contact" className="flex-1">
            <Button
              size="sm"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm"
            >
              <span>Book Survey</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
