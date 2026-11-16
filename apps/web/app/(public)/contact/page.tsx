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
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 border border-slate-700/60 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-2xl transition-colors">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroData.backgroundImage})` }}
          >
            {/* Dimmed cinematic overlay: keeps image richly visible while ensuring text contrast */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px] bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/30" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-block text-xs font-bold text-sky-200 uppercase tracking-widest bg-sky-500/20 px-3 py-1 rounded-full border border-sky-400/40 backdrop-blur-md">
              {heroData.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {heroData.title}
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed drop-shadow-sm">
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
