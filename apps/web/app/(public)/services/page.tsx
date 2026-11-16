import React from 'react';
import Link from 'next/link';
import {
  Search,
  Wrench,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  CalendarCheck,
  Camera,
  BellRing,
  Wifi,
  DoorClosed,
  Zap,
  Settings2,
  HelpCircle,
} from 'lucide-react';
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

const FALLBACK_SERVICES = [
  {
    id: 'srv-1',
    name: 'Professional 4K CCTV Installation & Cabling',
    slug: 'professional-cctv-installation',
    shortDescription: 'Complete property survey, concealed conduit cable routing, 4K dome & bullet camera mounting, NVR setup, and remote smartphone live-view configuration.',
    category: { name: 'CCTV Installation' },
    pricingModel: 'CUSTOM_QUOTE',
    price: 5000,
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Blind-spot elimination site assessment',
      'High-grade pure copper Cat6 cabling with conduit',
      '4K NVR recording with AI human/vehicle detection',
      'Remote viewing on Android, iOS, Windows & Mac',
      '1-Year comprehensive workmanship warranty',
    ],
  },
  {
    id: 'srv-2',
    name: 'Smart Video Doorbell & Door Cam Deployment',
    slug: 'smart-doorbell-door-cam-setup',
    shortDescription: 'Mounting and configuring smart 2K dual-camera doorbells with live two-way talk, digital chime integration, and instant smartphone gate notifications.',
    category: { name: 'Smart Security' },
    pricingModel: 'FIXED',
    price: 3500,
    featuredImage: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Hardwired 24V or rechargeable battery setup',
      'Multi-room chime receiver pairing',
      'Dual-lens package and visitor detection calibration',
      'Remote electric gate strike release integration',
    ],
  },
  {
    id: 'srv-3',
    name: 'Wireless Home Alarm & Perimeter Intruder Setup',
    slug: 'home-alarm-sensor-installation',
    shortDescription: 'Deploying wireless alarm panels, pet-immune dual-tech PIR motion detectors, magnetic door/window reed switches, loud sirens, and GSM alert calling.',
    category: { name: 'Intrusion Alarms' },
    pricingModel: 'CUSTOM_QUOTE',
    price: 6500,
    featuredImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Multi-zone wireless coverage with 1,200m range',
      'Pet-immune sensors (ignores animals up to 25kg)',
      '110dB outdoor solar strobe siren',
      'Triple-path alerts (Wi-Fi, 4G cellular SIM & SMS)',
    ],
  },
  {
    id: 'srv-4',
    name: 'HD Video Intercom & Gate Automation Access',
    slug: 'video-intercom-access-setup',
    shortDescription: 'Villa and gated estate video door stations, indoor 7-inch touchscreen monitors, biometric fingerprint entry, and motorized gate automation integration.',
    category: { name: 'Access Control' },
    pricingModel: 'CUSTOM_QUOTE',
    price: 8500,
    featuredImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    features: [
      '7-inch ultra-thin indoor capacitive touchscreen',
      'Weatherproof IP66 outdoor call panel with night vision',
      'Keycard RFID, PIN code and fingerprint enrollment',
      'One-touch electric gate release from app or monitor',
    ],
  },
  {
    id: 'srv-5',
    name: 'Structured LAN Cabling & Whole-Home Mesh Wi-Fi',
    slug: 'home-network-mesh-wifi-cabling',
    shortDescription: 'Structured Cat6 network cabling, server cabinet rack neatening, PoE switch deployment, and seamless whole-home mesh Wi-Fi to eliminate dead spots.',
    category: { name: 'Home Networking' },
    pricingModel: 'CUSTOM_QUOTE',
    price: 7500,
    featuredImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Fluke-tested pure copper Cat6 patch cabling',
      'Gigabit PoE switches for uninterrupted camera streams',
      'Wi-Fi 6 seamless roaming across multiple floors',
      'Wall-mount network cabinet & cable management',
    ],
  },
  {
    id: 'srv-6',
    name: 'Perimeter Electric Fence Installation & Energizers',
    slug: 'electric-fence-installation',
    shortDescription: 'High-tensile perimeter electric fencing with Nemtek-grade energizers, battery backup, fence tamper alarm siren, and razor wire combinations.',
    category: { name: 'Perimeter Security' },
    pricingModel: 'CUSTOM_QUOTE',
    price: 15000,
    featuredImage: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&w=1200&q=80',
    features: [
      'High-grade stainless steel / galvanized fence wire',
      'Smart energizer with 24-hour backup battery',
      'Zone cut and short-circuit instant siren triggers',
      'Kenyatta National Safety & KRA compliant installations',
    ],
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Free On-Site Property Survey',
    description: 'Our certified security technicians visit your premises to assess entrance gates, blind spots, cable pathways, and perimeter vulnerabilities.',
    icon: Camera,
  },
  {
    step: '02',
    title: 'Custom Blueprint & KES Quotation',
    description: 'You receive an itemized, transparent quotation in Kenyan Shillings detailing camera angles, storage capacity, and exact labor costs.',
    icon: CalendarCheck,
  },
  {
    step: '03',
    title: 'Clean Concealed Conduit Cabling',
    description: 'We neatly route pure copper cables through PVC conduits and mount tamper-resistant hardware without damaging walls or home aesthetics.',
    icon: Settings2,
  },
  {
    step: '04',
    title: 'Mobile App Setup & 1-Year Guarantee',
    description: 'We connect all family members’ smartphones, configure instant push notifications, test night vision, and issue your 1-year warranty card.',
    icon: ShieldCheck,
  },
];

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  let services: any[] = [];
  let categories: any[] = [];

  let heroData = {
    badge: 'Certified Security Engineering · East Africa',
    title: 'Professional CCTV, Alarms & Smart Security Installations',
    subtitle:
      'From residential homes in Nairobi to commercial enterprises across Kenya, our licensed engineers deliver turnkey surveillance, smart video doorbells, wireless alarms, intercoms, electric fencing, and high-speed mesh Wi-Fi.',
    backgroundImage: '',
    bullets: [
      'Free Nairobi Site Survey',
      '1-Year On-Site Workmanship Warranty',
      'Clean, Concealed Conduit Cabling',
      'Transparent KES Pricing',
    ],
  };

  try {
    const query = new URLSearchParams();
    if (searchParams.category) query.set('category', searchParams.category);
    if (searchParams.search) query.set('search', searchParams.search);

    const [srvRes, catRes, pageRes] = await Promise.all([
      fetchApi(`/services?${query.toString()}`),
      fetchApi('/service-categories'),
      fetchApi('/pages/services').catch(() => null),
    ]);
    services = srvRes.items && srvRes.items.length > 0 ? srvRes.items : FALLBACK_SERVICES;
    categories = catRes || [];

    if (pageRes) {
      if (pageRes.title) heroData.title = pageRes.title;
      const heroSec = pageRes.sections?.find((s: any) => s.key === 'hero');
      if (heroSec?.content) {
        if (heroSec.content.badge) heroData.badge = heroSec.content.badge;
        if (heroSec.content.title) heroData.title = heroSec.content.title;
        if (heroSec.content.subtitle) heroData.subtitle = heroSec.content.subtitle;
        if (heroSec.content.backgroundImage) heroData.backgroundImage = heroSec.content.backgroundImage;
        if (Array.isArray(heroSec.content.bullets) && heroSec.content.bullets.length > 0) {
          heroData.bullets = heroSec.content.bullets;
        }
      }
    }
  } catch (e) {
    services = FALLBACK_SERVICES;
  }

  // Filter fallback if searchParams present and backend failed
  if (searchParams.category) {
    services = services.filter((s) => s.category?.name?.toLowerCase().includes(searchParams.category!.toLowerCase()));
  }
  if (searchParams.search) {
    const sTerm = searchParams.search.toLowerCase();
    services = services.filter((s) => s.name.toLowerCase().includes(sTerm) || s.shortDescription.toLowerCase().includes(sTerm));
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950 text-slate-900 dark:text-white p-8 sm:p-14 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/50 transition-colors">
        {heroData.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url(${heroData.backgroundImage})` }}
          >
            {/* Elegant high-contrast theme-adaptive overlay so text is crisp and readable in both light and dark modes */}
            <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/75 backdrop-blur-[1.5px] bg-gradient-to-r from-white/95 via-white/85 to-white/70 dark:from-slate-950/95 dark:via-slate-950/80 dark:to-slate-950/60" />
          </div>
        )}
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 dark:border-sky-400/30 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>{heroData.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {heroData.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
            {heroData.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            {heroData.bullets.map((bullet, idx) => (
              <span key={idx} className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-800/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> {bullet}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative Grid glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 dark:opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-transparent to-transparent" />
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Link href="/services">
            <Button
              variant={!searchParams.category ? 'default' : 'outline'}
              size="sm"
              className="text-xs font-semibold rounded-lg"
            >
              All Services ({services.length})
            </Button>
          </Link>
          <Link href="/services?category=CCTV">
            <Button
              variant={searchParams.category === 'CCTV' ? 'default' : 'outline'}
              size="sm"
              className="text-xs font-semibold whitespace-nowrap rounded-lg"
            >
              CCTV Surveillance
            </Button>
          </Link>
          <Link href="/services?category=Smart">
            <Button
              variant={searchParams.category === 'Smart' ? 'default' : 'outline'}
              size="sm"
              className="text-xs font-semibold whitespace-nowrap rounded-lg"
            >
              Video Doorbells
            </Button>
          </Link>
          <Link href="/services?category=Alarms">
            <Button
              variant={searchParams.category === 'Alarms' ? 'default' : 'outline'}
              size="sm"
              className="text-xs font-semibold whitespace-nowrap rounded-lg"
            >
              Home Alarms
            </Button>
          </Link>
          <Link href="/services?category=Access">
            <Button
              variant={searchParams.category === 'Access' ? 'default' : 'outline'}
              size="sm"
              className="text-xs font-semibold whitespace-nowrap rounded-lg"
            >
              Intercoms &amp; Access
            </Button>
          </Link>
          <Link href="/services?category=Networking">
            <Button
              variant={searchParams.category === 'Networking' ? 'default' : 'outline'}
              size="sm"
              className="text-xs font-semibold whitespace-nowrap rounded-lg"
            >
              Mesh Wi-Fi &amp; LAN
            </Button>
          </Link>
        </div>

        {/* Search */}
        <form method="GET" action="/services" className="relative w-full md:w-72">
          <Input
            name="search"
            defaultValue={searchParams.search || ''}
            placeholder="Search security services..."
            className="text-xs pr-8 rounded-lg"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600">
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

      {/* 4-Step Installation Workflow Section */}
      <div className="rounded-3xl border bg-card p-8 sm:p-12 space-y-8 shadow-sm">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Precision Execution Standard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How We Secure Your Property in 4 Steps
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Every security system deployed by TRICLINIUM SYSTEMS follows our certified 4-stage engineering protocol for maximum reliability and clean aesthetics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between space-y-4 hover:border-sky-500/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
                      {step.step}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consultation & Site Survey Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-800 shadow-xl">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="h-4 w-4" />
            <span>Instant Dispatch &amp; Technical Support</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Protect Your Home or Business?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Contact our licensed technicians today to schedule a free site survey anywhere in Nairobi. We inspect your property, calculate cable runs, and provide an official KES quotation with zero obligation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
          <Link href="/contact" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30">
              Book a Free Site Survey
            </Button>
          </Link>
          <a href="tel:+254700555199" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 text-xs flex items-center justify-center gap-2">
              <PhoneCall className="h-4 w-4 text-sky-400" />
              <span>Call +254 700 555 199</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
