import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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
  featuredImage = 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
  pricingModel = 'CUSTOM_QUOTE',
  features = [],
}: ServiceCardProps) {
  const modelLabels: Record<string, string> = {
    FIXED: 'Fixed Engagement',
    HOURLY: 'Hourly T&M',
    CUSTOM_QUOTE: 'Custom Scope / RFQ',
    TIERED: 'Tiered Package',
  };

  return (
    <div className="group rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Service Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={featuredImage || 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80'}
            alt={name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {categoryName && (
            <span className="absolute top-3 left-3 inline-block rounded bg-slate-900/80 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-medium text-white">
              {categoryName}
            </span>
          )}
          <span className="absolute bottom-3 right-3 inline-block rounded bg-sky-600/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
            {modelLabels[pricingModel] || 'Custom Scope'}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <Link href={`/services/${slug}`}>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
              {name}
            </h3>
          </Link>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {shortDescription}
          </p>

          {/* Highlights */}
          {features.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {features.slice(0, 3).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
        <Link href={`/services/${slug}`} className="block">
          <Button variant="outline" className="w-full justify-between text-xs font-semibold group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <span>Explore Engineering Scope</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
