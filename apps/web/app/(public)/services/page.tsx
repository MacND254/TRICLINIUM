import React from 'react';
import Link from 'next/link';
import { Search, Wrench, ArrowRight, ShieldCheck, PhoneCall, CheckCircle2 } from 'lucide-react';
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
        id: 'srv-1',
        name: 'Professional CCTV Installation & Setup',
        slug: 'professional-cctv-installation',
        shortDescription: 'Complete on-site property survey, conduit cable routing, camera mounting, NVR setup, and remote smartphone viewing configuration.',
        category: { name: 'CCTV Installation' },
        pricingModel: 'CUSTOM_QUOTE',
        price: 5000,
        featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
        features: ['Blind spot elimination survey', 'Concealed weatherproof cabling', '4K NVR & remote app setup', '1-Year service warranty'],
      },
      {
        id: 'srv-2',
        name: 'Smart Video Doorbell & Door Cam Setup',
        slug: 'smart-doorbell-door-cam-setup',
        shortDescription: 'Mounting and configuring smart doorbells and door cams with live two-way talk, digital chimes, and smartphone visitor alerts.',
        category: { name: 'Smart Security' },
        pricingModel: 'FIXED',
        price: 3500,
        featuredImage: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1200&q=80',
        features: ['Chime integration', 'Mobile visitor notification', 'PIR motion trigger tuning', 'Cloud/SD storage setup'],
      },
      {
        id: 'srv-3',
        name: 'Wireless Home Alarm & Sensor Installation',
        slug: 'home-alarm-sensor-installation',
        shortDescription: 'Deploying wireless alarm panels, PIR motion detectors, magnetic door/window contacts, loud sirens, and GSM alert calling.',
        category: { name: 'Intrusion Alarms' },
        pricingModel: 'CUSTOM_QUOTE',
        price: 6500,
        featuredImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
        features: ['Wireless multi-zone setup', 'Door/window reed switches', 'Loud exterior siren & strobe', 'SMS/Call alert integration'],
      },
      {
        id: 'srv-4',
        name: 'Video Intercom & Biometric Access Setup',
        slug: 'video-intercom-access-setup',
        shortDescription: 'Villa and multi-apartment video door stations, indoor touchscreen monitors, biometric fingerprint entry, and smart door unlock.',
        category: { name: 'Access Control' },
        pricingModel: 'CUSTOM_QUOTE',
        price: 8500,
        featuredImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
        features: ['Color touch monitors', 'Electric strike lock release', 'Fingerprint & RFID enrollment', 'Multi-tenant options'],
      },
      {
        id: 'srv-5',
        name: 'Home Network & Mesh WiFi Cabling',
        slug: 'home-network-mesh-wifi-cabling',
        shortDescription: 'Structured CAT6 LAN cabling, Gigabit PoE switch installation, server cabinet rack setup, and whole-home seamless mesh WiFi.',
        category: { name: 'Home Networking' },
        pricingModel: 'CUSTOM_QUOTE',
        price: 7500,
        featuredImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
        features: ['Zero dead-zone mesh WiFi', 'CAT6 patch panel & rack neatening', 'PoE switch configuration', 'High-speed speed testing'],
      },
      {
        id: 'srv-6',
        name: 'Perimeter Electric Fence Installation',
        slug: 'electric-fence-installation',
        shortDescription: 'High-tensile perimeter electric fencing with energizer, battery backup, fence alarm siren, and razor wire combination.',
        category: { name: 'Perimeter Security' },
        pricingModel: 'CUSTOM_QUOTE',
        price: 15000,
        featuredImage: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1200&q=80',
        features: ['Certified energizer setup', 'Earthing system & surge protection', 'Fence cut & tampering siren', 'Top wall bracket mounting'],
      },
    ];

    categories = [
      { id: '1', name: 'CCTV Installation', slug: 'cctv-installation' },
      { id: '2', name: 'Smart Security', slug: 'smart-security' },
      { id: '3', name: 'Intrusion Alarms', slug: 'intrusion-alarms' },
      { id: '4', name: 'Access Control', slug: 'access-control' },
      { id: '5', name: 'Home Networking', slug: 'home-networking' },
      { id: '6', name: 'Perimeter Security', slug: 'perimeter-security' },
    ];
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b pb-8">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>Professional Installation &amp; Maintenance</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          TRICLINIUM SYSTEMS Security Services
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          From residential villas to commercial facilities, our certified technicians design, install, and service turnkey CCTV surveillance, smart doorbells, home alarms, video intercoms, electric fencing, and home networking.
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
              className="text-xs font-medium"
            >
              All Services
            </Button>
          </Link>
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/services?category=${cat.slug}`}>
              <Button
                variant={searchParams.category === cat.slug ? 'default' : 'outline'}
                size="sm"
                className="text-xs font-medium whitespace-nowrap"
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
            placeholder="Search security services..."
            className="text-xs pr-8"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Need a Site Survey or Custom Security Package?</h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Our licensed security consultants visit your property to evaluate entrance points, boundary perimeters, and cabling paths to prepare an accurate, transparent proposal in Kenyan Shillings.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-sky-300">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Free Nairobi Metro Site Visits</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 1-Year Workmanship Guarantee</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 24/7 Technical Support Line</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link href="/contact">
            <Button size="lg" className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs whitespace-nowrap shadow-md">
              Book a Free Site Survey
            </Button>
          </Link>
          <a href="tel:+254700555199">
            <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800 text-xs flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-sky-400" />
              <span>Call Us Directly</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
