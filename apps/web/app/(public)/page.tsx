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

export const revalidate = 60; // ISR 1 minute

export default async function HomePage() {
  let homepageData: any = null;

  try {
    homepageData = await fetchApi('/homepage');
  } catch (e) {
    console.error('[HomePage SSR fetchApi error]:', e);
    // Graceful fallback if backend not yet running during initial static build
    homepageData = null;
  }

  const heroSlides = homepageData?.heroSlides || [];
  const featuredProducts = homepageData?.featuredProducts || [
    {
      id: 'prod-1',
      name: 'ProSight 4K PoE IP Dome Camera',
      slug: 'prosight-4k-poe-dome-camera',
      sku: 'TRC-CAM-4K-DOM',
      shortDescription: '4K Ultra HD dome camera with AI motion detection, ColorNight vision up to 30m, and weatherproof IP67 housing.',
      category: { name: 'IP & CCTV Cameras' },
      price: 18500,
      promotionalPrice: 16500,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'prod-2',
      name: 'Smart Video Doorbell Pro 2K with Chime',
      slug: 'smart-video-doorbell-pro-2k',
      sku: 'TRIC-DRB-2K',
      shortDescription: 'Crystal-clear 2K HDR smart video doorbell with head-to-toe 160° view, two-way audio talk, and indoor chime box.',
      category: { name: 'Smart Doorbells & Door Cams' },
      price: 16800,
      promotionalPrice: 14500,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'prod-3',
      name: 'SecureHome Pro Wireless Alarm Kit',
      slug: 'securehome-pro-wireless-alarm-kit',
      sku: 'TRC-ALM-PRO-KIT',
      shortDescription: 'Complete wireless home alarm system with motion sensors, door/window contacts, outdoor solar siren, and mobile app control.',
      category: { name: 'Home Alarm Systems' },
      price: 36500,
      promotionalPrice: 32000,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'prod-4',
      name: '360° Smart Baby & Nanny Cam with Audio',
      slug: 'nanny-cam-360-indoor-wifi',
      sku: 'TRIC-NCAM-360',
      shortDescription: 'Indoor pan-tilt smart Wi-Fi camera with 2K Quad-HD video, baby crying detection, and crystal two-way audio talk.',
      category: { name: 'Nanny Cams & Indoor' },
      price: 8500,
      promotionalPrice: 7200,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'prod-5',
      name: 'TouchScreen IP Video Intercom Villa Kit',
      slug: 'video-intercom-touchscreen-system',
      sku: 'TRIC-INT-VILLA',
      shortDescription: 'Modern IP video intercom kit with 7-inch indoor touchscreen monitor, weatherproof outdoor camera station, and remote gate release.',
      category: { name: 'Intercoms & Access Control' },
      price: 36000,
      promotionalPrice: 32500,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'prod-6',
      name: 'MeshGuard Whole-Home WiFi 6 Network Setup',
      slug: 'meshguard-wifi6-home-network-setup',
      sku: 'TRIC-NET-MESH6',
      shortDescription: 'Whole-home mesh Wi-Fi 6 kit with gigabit PoE switch and wall access points for bufferless 4K CCTV and security streaming.',
      category: { name: 'Home Network & Mesh WiFi' },
      price: 28500,
      promotionalPrice: 24900,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const featuredServices = homepageData?.featuredServices || [
    {
      id: 'srv-1',
      name: 'Professional CCTV Installation & Setup',
      slug: 'professional-cctv-installation',
      shortDescription: 'Expert on-site survey, cable routing, camera mounting, NVR configuration, and remote smartphone access setup for homes and businesses.',
      category: { name: 'CCTV Installation' },
      pricingModel: 'CUSTOM_QUOTE',
      price: 5000,
      featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
      features: ['Blind spot elimination survey', 'Concealed weatherproof cabling', '4K NVR & remote app setup'],
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
      features: ['Wireless chime pairing', 'Mobile video notifications', 'PIR motion detection tuning'],
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
      features: ['Multi-zone wireless sensors', '115dB outdoor siren', 'SMS and automated phone alerts'],
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
      features: ['7" Color touch monitors', 'Electric gate & door release', 'Fingerprint & RFID enrollment'],
    },
  ];

  const testimonials = homepageData?.testimonials || [
    {
      id: 't-1',
      clientName: 'James Mwangi',
      clientRole: 'Property Manager',
      companyName: 'Westlands Properties',
      content: 'TRICLINIUM installed a complete 16-camera system across our apartment complex. The image quality is outstanding and the remote viewing app works perfectly.',
      rating: 5,
    },
    {
      id: 't-2',
      clientName: 'Sarah Kamau',
      clientRole: 'Business Owner',
      companyName: 'Kamau Supermart',
      content: 'After the installation, we caught a shoplifting incident on camera within the first week. The team was professional and the system has paid for itself already.',
      rating: 5,
    },
    {
      id: 't-3',
      clientName: 'David Ochieng',
      clientRole: 'Homeowner',
      companyName: '',
      content: 'The wireless alarm system gives us complete peace of mind. Mobile alerts, easy to arm/disarm, and the installation was done in just one afternoon.',
      rating: 5,
    },
  ];

  const stats = homepageData?.sections?.stats?.stats || [
    { label: 'Systems Installed', value: '500+' },
    { label: 'Customer Satisfaction', value: '98%' },
    { label: 'Technical Support', value: '24/7' },
    { label: 'Years Experience', value: '10+' },
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
              <span>Surveillance & Intrusion Detection</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Security & Alarm Systems
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Commercial-grade 4K AI cameras, network video recorders (NVR), wireless intruder alarms, and biometric access control.
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
                Turnkey Security Services
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Professional CCTV & Alarm Installation Services
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                From professional on-site surveys and clean cable routing to mobile app integration and 24/7 system maintenance.
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
            The TRICLINIUM Advantage
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Property Owners Choose TRICLINIUM Security
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We provide reliable surveillance and intelligent alarm systems that deliver 24/7 peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Certified Security Experts</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our technicians are certified security specialists with deep expertise in camera placement, blind spot elimination, and secure network configuration.
            </p>
          </div>

          <div className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI-Powered Motion Analytics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Advanced smart analytics distinguish humans and vehicles from pets and weather events, dramatically reducing false alarms on your smartphone.
            </p>
          </div>

          <div className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Free Site Surveys & Quotes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We provide transparent itemized quotations and fast survey visits, with equipment guarantees and no hidden installation fees.
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
                Our Mission & Expertise
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Protecting Homes, Businesses & Critical Infrastructure
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                TRICLINIUM is a dedicated provider of advanced CCTV surveillance systems and smart intruder alarm solutions. From single-family residences to multi-building corporate campuses, we design, deploy, and support tailored security infrastructures that safeguard people and property.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Licensed Security Installers</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>4K Ultra HD & Color Night Vision</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Real-Time Mobile App Alerts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>1-Year Comprehensive Warranty</span>
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
                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80"
                alt="TRICLINIUM Security Operations"
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
            Trusted by Commercial & Residential Clients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t: any) => (
            <div key={t.id} className="p-8 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between space-y-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-11 w-11 rounded-full bg-sky-900/40 border border-sky-700 flex items-center justify-center font-bold text-sky-400 text-sm shrink-0">
                  {t.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.clientName}</h4>
                  <p className="text-xs text-muted-foreground">{t.clientRole}{t.companyName ? ` · ${t.companyName}` : ''}</p>
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
            Ready to Secure Your Home or Business Facility?
          </h2>
          <p className="text-base text-sky-100 leading-relaxed">
            Request an itemized quotation or contact our surveillance engineers today. We'll design a customized security setup tailored to your exact property layout.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-sky-700 hover:bg-slate-100 font-bold text-sm shadow-md">
                Get a Free Security Quote
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-sky-700 font-bold text-sm">
                Explore CCTV Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
