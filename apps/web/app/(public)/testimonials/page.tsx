import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 300;

export const metadata = {
  title: 'Client Endorsements & Case Studies | TRICLINIUM',
  description: 'Verified reviews from infrastructure leaders, project directors, and chief plant engineers using TRICLINIUM products.',
};

export default async function TestimonialsPage() {
  let testimonials: any[] = [];
  let heroData = {
    badge: 'Verified Reviews & Case Studies',
    title: 'Client Case Studies & Endorsements',
    subtitle:
      'Discover how enterprise clients and residential estates achieve zero-downtime operations and certified structural excellence with TRICLINIUM hardware and software.',
    backgroundImage: '',
  };

  try {
    const [testRes, pageRes] = await Promise.all([
      fetchApi('/testimonials'),
      fetchApi('/pages/testimonials').catch(() => null),
    ]);
    testimonials = testRes || [];

    if (pageRes) {
      if (pageRes.title) heroData.title = pageRes.title;
      const heroSec = pageRes.sections?.find((s: any) => s.key === 'hero');
      if (heroSec?.content) {
        if (heroSec.content.badge) heroData.badge = heroSec.content.badge;
        if (heroSec.content.title) heroData.title = heroSec.content.title;
        if (heroSec.content.subtitle) heroData.subtitle = heroSec.content.subtitle;
        if (heroSec.content.backgroundImage) heroData.backgroundImage = heroSec.content.backgroundImage;
      }
    }
  } catch (e) {
    testimonials = [
      {
        id: 't-1',
        clientName: 'Marcus Vance',
        clientRole: 'Director of Capital Projects',
        companyName: 'Vanguard Infrastructure Group',
        clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        content: 'TRICLINIUM engineered custom heavy-pivot mechanisms for our metropolitan transit headquarters. Their engineering rigor, adherence to tolerance specifications, and prompt delivery set the industry standard.',
        rating: 5,
      },
      {
        id: 't-2',
        clientName: 'Elena Rostova',
        clientRole: 'Chief Plant Engineer',
        companyName: 'AeroDynamics Propulsion Labs',
        clientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
        content: 'The OmniFlow telemetry package transformed how we monitor high-frequency vibration across our turbine testing cells. Integration took less than 48 hours, and uptime has remained at 100%.',
        rating: 5,
      },
    ];
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 space-y-12">
      {heroData.backgroundImage ? (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl text-center transition-colors">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroData.backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-[1.5px] bg-gradient-to-t from-white via-white/85 to-white/70 dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950/70" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-block text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest bg-sky-500/10 dark:bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/20 dark:border-sky-400/30 backdrop-blur-sm">
              {heroData.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {heroData.title}
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {heroData.subtitle}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-1.5">
            {heroData.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {heroData.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-muted-foreground">
            {heroData.subtitle}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {testimonials.map((t) => (
          <div key={t.id} className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <img
                src={t.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                alt={t.clientName}
                className="h-12 w-12 rounded-full object-cover border"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.clientName}</h4>
                <p className="text-xs text-muted-foreground">{t.clientRole}</p>
                <p className="text-xs font-semibold text-sky-600">{t.companyName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
