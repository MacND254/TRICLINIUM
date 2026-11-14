import React from 'react';
import Link from 'next/link';
import { Search, Wrench, ArrowRight } from 'lucide-react';
import { ServiceCard } from '@/components/public/service-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

interface ServicesPageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  let services: any[] = [];
  let categories: any[] = [];

  try {
    const query = new URLSearchParams();
    if (searchParams.category) query.set('category', searchParams.category);
    if (searchParams.search) query.set('search', searchParams.search);

    const [srvRes, catRes] = await Promise.all([
      fetchApi(`/services?${query.toString()}`),
      fetchApi('/service-categories'),
    ]);
    services = srvRes.items || [];
    categories = catRes || [];
  } catch (e) {
    // Fallback for initial build
    services = [
      {
        id: 'srv-seed-1',
        name: 'Advanced 5-Axis CNC Precision Machining',
        slug: '5-axis-cnc-machining-fabrication',
        shortDescription: 'High-tolerance custom component fabrication in titanium, stainless steel, and aerospace aluminum alloys.',
        category: { name: 'Precision Fabrication' },
        pricingModel: 'CUSTOM_QUOTE',
        featuredImage: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80',
        features: ['Tolerances to ±0.005mm', '100% optical CMM verified', 'Raw: Inconel & Titanium'],
      },
      {
        id: 'srv-seed-2',
        name: 'Structural Finite Element Analysis (FEA)',
        slug: 'structural-fea-verification',
        shortDescription: 'Comprehensive stress analysis, harmonic vibration testing, and thermal load modeling for critical industrial assemblies.',
        category: { name: 'Engineering Consulting' },
        pricingModel: 'FIXED',
        featuredImage: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1200&q=80',
        features: ['Static & dynamic stress models', 'Seismic resonance analysis', 'Code-compliant reports'],
      },
    ];

    categories = [
      { id: '1', name: 'Precision Fabrication', slug: 'precision-fabrication' },
      { id: '2', name: 'Engineering Consulting', slug: 'engineering-consulting' },
    ];
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Commercial & Industrial Engineering Services
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          From finite element structural verification to multi-axis precision fabrication, our registered engineers support critical projects across infrastructure, defense, and architecture.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Link href="/services">
            <Button
              variant={!searchParams.category ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              All Disciplines
            </Button>
          </Link>
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/services?category=${cat.slug}`}>
              <Button
                variant={searchParams.category === cat.slug ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
              >
                {cat.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/services" className="relative w-full md:w-72">
          <Input
            name="search"
            defaultValue={searchParams.search || ''}
            placeholder="Search engineering services..."
            className="text-xs pr-8"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((srv: any) => (
          <ServiceCard
            key={srv.id}
            id={srv.id}
            name={srv.name}
            slug={srv.slug}
            shortDescription={srv.shortDescription}
            categoryName={srv.category?.name}
            featuredImage={srv.featuredImage}
            pricingModel={srv.pricingModel}
            price={srv.price}
            features={srv.features}
          />
        ))}
      </div>

      {/* Consultation Banner */}
      <div className="p-8 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Require a Custom Engineering Engagement?</h3>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Our team handles custom toolpath planning, on-site metrology inspections, and certified structural finite element calculations. Contact an engineer today.
          </p>
        </div>
        <Link href="/contact">
          <Button size="lg" className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs whitespace-nowrap">
            Schedule Engineering Consultation
          </Button>
        </Link>
      </div>
    </div>
  );
}
