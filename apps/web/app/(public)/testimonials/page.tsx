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

  try {
    testimonials = await fetchApi('/testimonials');
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
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Client Case Studies & Endorsements
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover how enterprise clients achieve zero-downtime operations and certified structural excellence with TRICLINIUM hardware and software.
        </p>
      </div>

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
