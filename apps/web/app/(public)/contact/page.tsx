import React from 'react';
import { ContactClient } from './contact-client';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

export const metadata = {
  title: 'Contact Engineering & Corporate Desk | TRICLINIUM',
  description: 'Reach TRICLINIUM for commercial inquiries, technical product specifications, and custom fabrication RFQs.',
};

export default async function ContactPage() {
  let heroData = {
    badge: '24/7 Monitoring Desk & Technical Inquiries',
    title: 'Contact TRICLINIUM Enterprise',
    subtitle:
      'Connect directly with registered engineers, technical sales representatives, and procurement specialists.',
    backgroundImage: '',
  };

  try {
    const pageData = await fetchApi('/pages/contact');
    if (pageData) {
      if (pageData.title) heroData.title = pageData.title;
      const heroSec = pageData.sections?.find((s: any) => s.key === 'hero');
      if (heroSec?.content) {
        if (heroSec.content.badge) heroData.badge = heroSec.content.badge;
        if (heroSec.content.title) heroData.title = heroSec.content.title;
        if (heroSec.content.subtitle) heroData.subtitle = heroSec.content.subtitle;
        if (heroSec.content.backgroundImage) heroData.backgroundImage = heroSec.content.backgroundImage;
      }
    }
  } catch {}

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 space-y-12">
      {heroData.backgroundImage ? (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl transition-colors">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroData.backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/80 backdrop-blur-[1.5px] bg-gradient-to-r from-white/95 via-white/85 to-white/70 dark:from-slate-950/95 dark:via-slate-950/85 dark:to-slate-950/70" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-block text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest bg-sky-500/10 dark:bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/20 dark:border-sky-400/30 backdrop-blur-sm">
              {heroData.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {heroData.title}
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {heroData.subtitle}
            </p>
          </div>
        </div>
      ) : (
        <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {heroData.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground max-w-2xl">
            {heroData.subtitle}
          </p>
        </div>
      )}

      <ContactClient />
    </div>
  );
}
