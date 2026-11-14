import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileText,
  Award,
  Layers,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { HeroSlider } from '@/components/public/hero-slider';
import { ProductCard } from '@/components/public/product-card';
import { ServiceCard } from '@/components/public/service-card';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 300; // ISR 5 minutes

export default async function HomePage() {
  let homepageData: any = null;

  try {
    homepageData = await fetchApi('/homepage');
  } catch (e) {
    // Graceful fallback if backend not yet running during initial static build
    homepageData = null;
  }

  const heroSlides = homepageData?.heroSlides || [];
  const featuredProducts = homepageData?.featuredProducts || [
    {
      id: 'prod-seed-1',
      name: 'Titan-Forged Pivot Hinge 750',
      slug: 'titan-pivot-hinge-750',
      sku: 'TRIC-HW-750',
      shortDescription: 'Industrial-grade architectural pivot hinge engineered for doors up to 750kg.',
      category: { name: 'Architectural Hardware' },
      price: 1250.0,
      promotionalPrice: 1120.0,
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'prod-seed-2',
      name: 'AeroLock High-Torque Linear Coupler',
      slug: 'aerolock-linear-coupler',
      sku: 'TRIC-PC-420',
      shortDescription: 'Zero-backlash precision coupling designed for high-dynamic servomotor drives.',
      category: { name: 'Precision Assemblies' },
      price: 485.0,
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'prod-seed-3',
      name: 'OmniFlow Industrial SCADA Telemetry Suite',
      slug: 'omniflow-scada-telemetry-suite',
      sku: 'TRIC-SW-OMNI',
      shortDescription: 'Cloud-native digital asset telemetry, real-time edge monitoring, and predictive maintenance platform.',
      category: { name: 'Industrial Software' },
      price: 3400.0,
      promotionalPrice: 2950.0,
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const featuredServices = homepageData?.featuredServices || [
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

  const testimonials = homepageData?.testimonials || [
    {
      id: 't-1',
      clientName: 'Marcus Vance',
      clientRole: 'Director of Capital Projects',
      companyName: 'Vanguard Infrastructure Group',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      content: 'TRICLINIUM engineered custom heavy-pivot mechanisms for our metropolitan transit headquarters. Their engineering rigor and adherence to micron tolerances set the standard.',
      rating: 5,
    },
    {
      id: 't-2',
      clientName: 'Elena Rostova',
      clientRole: 'Chief Plant Engineer',
      companyName: 'AeroDynamics Propulsion Labs',
      clientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
      content: 'The OmniFlow telemetry package transformed how we monitor high-frequency vibration across our turbine testing cells. Flawless telemetry and zero downtime.',
      rating: 5,
    },
  ];

  const stats = homepageData?.sections?.stats?.stats || [
    { label: 'Precision Tolerances Achieved', value: '±0.005mm' },
    { label: 'Enterprise Projects Delivered', value: '450+' },
    { label: 'Maximum Load Capacity Certified', value: '750kg' },
    { label: 'Uptime Reliability SLA', value: '99.99%' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SLIDER */}
      <HeroSlider slides={heroSlides} />

      {/* 2. STATS BAR */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-10">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS CATALOG */}
      <section className="py-20 container mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Standard & Engineered Products</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Product Lineup
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Precision-forged physical assemblies, certified heavy architectural hardware, and enterprise telemetry systems.
            </p>
          </div>
          <Link href="/products" className="mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center gap-2 text-xs font-semibold">
              <span>View All Products</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((prod: any) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              name={prod.name}
              slug={prod.slug}
              sku={prod.sku}
              shortDescription={prod.shortDescription}
              categoryName={prod.category?.name}
              price={prod.price}
              promotionalPrice={prod.promotionalPrice}
              priceVisible={prod.priceVisible}
              currency={prod.currency}
              availability={prod.availability}
              imageUrl={prod.images?.[0]?.url || prod.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* 4. SERVICES OVERVIEW */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">
                Turnkey Engineering Capabilities
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Professional Engineering & Fabrication Services
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                From FEA structural verification to high-speed 5-axis CNC execution, we support your project from concept through certified installation.
              </p>
            </div>
            <Link href="/services" className="mt-4 md:mt-0">
              <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-semibold">
                <span>All Services</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredServices.map((srv: any) => (
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
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-20 container mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2">
            The TRICLINIUM Standard
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Enterprise Engineers Choose Our Solutions
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We bridge the gap between architectural aesthetic ambition and uncompromising mechanical physics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Certified Metallurgy & MTRs</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every ingot and extrusion undergoes spectrometry testing. Full heat-lot mill test reports are delivered with every order to ensure 100% material compliance.
            </p>
          </div>

          <div className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sub-Micron Precision Tolerances</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Using temperature-controlled manufacturing cells and calibrated Zeiss CMM probes, our parts achieve tight tolerances down to ±0.005mm without deviation.
            </p>
          </div>

          <div className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Rapid Commercial Quotations</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our registered engineering desk evaluates RFQs and CAD models with 24-hour initial turnarounds, providing transparent lead-times and tiered pricing.
            </p>
          </div>
        </div>
      </section>

      {/* 6. ABOUT PREVIEW */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/40 border-y">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-xs font-bold text-sky-600 uppercase tracking-widest">
                Our Heritage & Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Architecting the Heavy-Duty Portals of the Future
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Founded to solve the extreme mechanical demands of oversized architectural installations, TRICLINIUM has expanded into a global provider of specialized hardware, high-tolerance contract machining, and IoT asset monitoring software.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>ISO 9001:2015 Registered</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>EN 1154 European Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>316 Marine Grade Passivation</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Full FEA Structural Certification</span>
                </div>
              </div>
              <div className="pt-2">
                <Link href="/about">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
                    Read Our Full Story
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl border">
              <img
                src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
                alt="TRICLINIUM Precision Testing Facility"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-20 container mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2">
            Client Endorsements
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trusted by Infrastructure Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t: any) => (
            <div key={t.id} className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between space-y-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={t.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                  alt={t.clientName}
                  className="h-11 w-11 rounded-full object-cover border"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.clientName}</h4>
                  <p className="text-xs text-muted-foreground">{t.clientRole} · {t.companyName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-16 bg-sky-600 text-white">
        <div className="container mx-auto px-4 sm:px-8 text-center max-w-3xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Have a High-Tonnage Project or Custom Part Specification?
          </h2>
          <p className="text-base text-sky-100 leading-relaxed">
            Submit your CAD geometries or line item requirements today. Our engineering desk will deliver an official proposal within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <Link href="/contact">
              <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-900 font-semibold shadow-md">
                Submit RFQ Specification
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-sky-300 text-white hover:bg-sky-700">
                Browse Full Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
