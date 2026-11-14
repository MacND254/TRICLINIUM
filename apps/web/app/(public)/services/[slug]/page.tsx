import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, CheckCircle, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { ServiceDetailClient } from './service-detail-client';
import { ServiceCard } from '@/components/public/service-card';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

interface ServicePageProps {
  params: {
    slug: string;
  };
}

const FALLBACK_SERVICES: Record<string, any> = {
  'professional-cctv-installation': {
    id: 'srv-1',
    name: 'Professional CCTV Installation & Setup',
    slug: 'professional-cctv-installation',
    shortDescription: 'Comprehensive on-site survey, cable routing, camera mounting, NVR configuration, and remote smartphone access setup for homes and businesses.',
    fullDescription: 'Our certified security technicians deliver clean, turnkey CCTV surveillance installations across Kenya. We perform complete property assessments to eliminate blind spots, install high-grade weatherproof CAT6 PoE cabling in protective conduit, configure 4K Network Video Recorders (NVR), set up encrypted remote mobile viewing on iOS and Android devices, and train you and your staff on playback and incident retrieval.',
    category: { name: 'CCTV Installation', slug: 'cctv-installation' },
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    pricingModel: 'CUSTOM_QUOTE',
    price: 5000,
    features: [
      'Professional property survey & blind-spot elimination',
      'Heavy-duty weatherproof conduit and pure copper CAT6 cabling',
      '4K Ultra HD cameras with Color Night Vision and AI Detection',
      'Mobile phone remote viewing setup (iOS & Android)',
      '1-Year comprehensive installation and equipment warranty',
    ],
    benefits: [
      'Total peace of mind with 24/7 video recording and real-time alerts',
      'Clean, discreet aesthetic installation with no dangling wires',
      'Local storage with zero mandatory monthly subscription fees',
    ],
    process: [
      { title: 'Free On-Site Security Assessment', description: 'We evaluate entry points, perimeter fence lines, and lighting conditions to formulate a tailored layout.', order: 0 },
      { title: 'Equipment Selection & Itemized Quote', description: 'Clear quotation in KES specifying cameras, storage capacity, power backup, and materials.', order: 1 },
      { title: 'Clean Structured Installation', description: 'Concealed cabling, precise bracket mounting, and NVR video rack setup.', order: 2 },
      { title: 'Mobile App Configuration & Handover', description: 'Setting up remote viewing, testing motion alerts, and customer demonstration.', order: 3 },
    ],
  },
  'smart-doorbell-door-cam-setup': {
    id: 'srv-2',
    name: 'Smart Video Doorbell & Door Cam Setup',
    slug: 'smart-doorbell-door-cam-setup',
    shortDescription: 'Mounting and configuring smart doorbells and door cams with live two-way talk, digital chimes, and smartphone visitor alerts.',
    fullDescription: 'Transform your front door security with an intelligent smart doorbell and door camera installation. Our technicians mount doorbells, integrate wireless indoor chimes, set up motion sensitivity zones to avoid false street triggers, and ensure instant video calling connects to all household smartphones when visitors arrive.',
    category: { name: 'Smart Security', slug: 'smart-security' },
    featuredImage: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1200&q=80',
    pricingModel: 'FIXED',
    price: 3500,
    features: [
      'Precision mounting with anti-tamper security screws',
      'Integration with wireless plug-in indoor chime boxes',
      'Smartphone app configuration for all family members',
      'PIR human detection tuning and custom motion zones',
      'Local microSD and cloud backup setup',
    ],
    benefits: [
      'See, hear, and speak to visitors at your door from anywhere in the world',
      'Deter package theft and porch prowlers with instant video recordings',
      'Clear head-to-toe viewing day and night',
    ],
    process: [
      { title: 'Door Inspection & Power Check', description: 'Verifying Wi-Fi signal strength and door frame dimensions for optimal camera angle.', order: 0 },
      { title: 'Firmware & Wi-Fi Pairing', description: 'Configuring network encryption and syncing the chime receiver.', order: 1 },
      { title: 'Secure Mounting & Angle Wedge', description: 'Installing mounting plates and angled wedges for complete porch coverage.', order: 2 },
      { title: 'Testing & App Onboarding', description: 'Simulating visitor rings and verifying smartphone push notifications.', order: 3 },
    ],
  },
  'home-alarm-sensor-installation': {
    id: 'srv-3',
    name: 'Wireless Home Alarm & Intrusion Sensor Installation',
    slug: 'home-alarm-sensor-installation',
    shortDescription: 'Deploying wireless alarm panels, PIR motion detectors, magnetic door/window contacts, loud sirens, and GSM alert calling.',
    fullDescription: 'Protect your family and property against unauthorized intruders with our smart wireless alarm installation service. We strategically deploy anti-tamper door contacts on exterior doors and windows, install pet-immune infrared motion detectors in interior hallways, and wire a 115dB outdoor siren that alerts neighbors and scares off burglars before they gain entry.',
    category: { name: 'Intrusion Alarms', slug: 'intrusion-alarms' },
    featuredImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    pricingModel: 'CUSTOM_QUOTE',
    price: 6500,
    features: [
      'Multi-zone wireless alarm hub deployment with GSM SIM backup',
      'Pet-immune passive infrared (PIR) motion sensors',
      'Magnetic door and window reed sensors on all perimeter access points',
      'Piercing 115dB outdoor strobe siren with flashing warning LED',
      'Automated SMS text and phone call dispatch alerts',
    ],
    benefits: [
      'Immediate intrusion deterrence before burglars enter living quarters',
      'Operates continuously during power blackouts with 18-hour battery backup',
      'No messy wall chasing or visible wires across living rooms',
    ],
    process: [
      { title: 'Perimeter Vulnerability Audit', description: 'Locating blind spots, sliding doors, and accessible ground-floor windows.', order: 0 },
      { title: 'Sensor Deployment & Calibration', description: 'Positioning PIR motion detectors and setting pet-immunity thresholds.', order: 1 },
      { title: 'Cellular SIM & Hub Setup', description: 'Inserting Safaricom/Airtel SIM card for dual-path emergency communication.', order: 2 },
      { title: 'Alarm Simulation & Demonstration', description: 'Testing arm/disarm keyfobs, keypad PINs, and emergency panic buttons.', order: 3 },
    ],
  },
  'video-intercom-access-setup': {
    id: 'srv-4',
    name: 'Video Intercom & Biometric Access Control Setup',
    slug: 'video-intercom-access-setup',
    shortDescription: 'Villa and multi-apartment video door stations, indoor touchscreen monitors, biometric fingerprint entry, and smart door unlock.',
    fullDescription: 'Control entrance security with modern video intercom and biometric door release systems. Our engineers install rugged outdoor door stations with HD night-vision cameras, connect indoor 7-inch color touchscreens, and wire electronic strike or magnetic locks to allow remote gate unlocking from both the indoor monitor and mobile phones.',
    category: { name: 'Access Control', slug: 'access-control' },
    featuredImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    pricingModel: 'CUSTOM_QUOTE',
    price: 8500,
    features: [
      'Touchscreen indoor monitors with high-definition two-way video calling',
      'Remote electric gate motor and pedestrian mag-lock integration',
      'Biometric fingerprint, RFID keycard, and passcode entry options',
      'Vandal-resistant IP65 outdoor door camera station',
      'Mobile app forwarding for remote gate opening when away from home',
    ],
    benefits: [
      'Never walk to the gate in the rain to check who is visiting',
      'Full audit log of door entries with snapshot images',
      'Seamless keyless access for family members and employees',
    ],
    process: [
      { title: 'Gate & Door Strike Assessment', description: 'Checking gate motor controllers and lock power requirements.', order: 0 },
      { title: 'Conduit & Signal Cabling', description: 'Running heavy-duty outdoor CAT6 cabling from gate pillar to indoor monitor.', order: 1 },
      { title: 'Lock & Relay Interfacing', description: 'Wiring 12V fail-secure strike locks and magnetic release switches.', order: 2 },
      { title: 'Fingerprint & RFID Enrollment', description: 'Registering family member biometric profiles and testing mobile access.', order: 3 },
    ],
  },
  'home-network-mesh-wifi-cabling': {
    id: 'srv-5',
    name: 'Home Network & Mesh WiFi Cabling Setup',
    slug: 'home-network-mesh-wifi-cabling',
    slugAlt: 'home-networking',
    shortDescription: 'Structured CAT6 LAN cabling, Gigabit PoE switch installation, server cabinet rack setup, and whole-home seamless mesh WiFi.',
    fullDescription: 'High-definition 4K CCTV surveillance and smart home devices depend on rock-solid internet infrastructure. We design and install structured CAT6 network cabling, terminate cables into neat wall patch panels and network racks, deploy Gigabit Power-over-Ethernet (PoE) switches, and configure high-speed Mesh Wi-Fi 6 systems that eliminate dead zones across every room and outdoor patio.',
    category: { name: 'Home Networking', slug: 'home-networking' },
    featuredImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    pricingModel: 'CUSTOM_QUOTE',
    price: 7500,
    features: [
      'Structured CAT6 Gigabit network cabling in concealed conduits',
      'Wall-mounted mini server rack & patch panel cable organization',
      'Gigabit PoE switches for uninterrupted camera and AP power',
      'Tri-Band Mesh Wi-Fi 6 access point deployment',
      'Bandwidth prioritization (QoS) and IoT guest network isolation',
    ],
    benefits: [
      'Buffer-free 4K video surveillance streaming and smooth remote playback',
      'Whole-compound Wi-Fi coverage with seamless roaming',
      'Neat, professional rack setup that protects equipment from overheating',
    ],
    process: [
      { title: 'Wi-Fi Signal Heatmap & Survey', description: 'Analyzing wall thickness and RF interference points across the building.', order: 0 },
      { title: 'Cable Pulling & Trunking', description: 'Pulling 100% solid copper CAT6 cables through ceiling voids or PVC conduit.', order: 1 },
      { title: 'Patch Panel Termination & Testing', description: 'Punch-down termination, fluking cable continuity, and rack neatening.', order: 2 },
      { title: 'Mesh AP Optimization & Speed Test', description: 'Tuning radio channels for maximum throughput and seamless handoff.', order: 3 },
    ],
  },
  'electric-fence-installation': {
    id: 'srv-6',
    name: 'Perimeter Electric Fence Installation & Maintenance',
    slug: 'electric-fence-installation',
    shortDescription: 'High-tensile perimeter electric fencing with energizer, battery backup, fence alarm siren, and razor wire combination.',
    fullDescription: 'Create an unbreachable physical and psychological deterrent around your residential compound, school, or commercial warehouse. We erect multi-strand high-tensile electric fences atop perimeter boundary walls, complete with a powerful certified energizer, deep earth grounding system, cut-wire tampering sensors, and emergency battery backup that operates during Kenya Power outages.',
    category: { name: 'Perimeter Security', slug: 'perimeter-security' },
    featuredImage: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1200&q=80',
    pricingModel: 'CUSTOM_QUOTE',
    price: 15000,
    features: [
      'High-tensile aluminum or stainless steel wire with heavy-duty insulators',
      'Certified high-voltage pulse energizer compliant with safety standards',
      'Integrated cut-wire, short-circuit, and tamper alarm detection',
      'Rechargeable 12V battery backup ensuring continuous 24/7 protection',
      'Interfacing with house alarm sirens and mobile phone SMS alerts',
    ],
    benefits: [
      'Immediate physical deterrent that prevents intruders from scaling walls',
      'Audible alarm alerts before intruders ever set foot on your property',
      'Durable, rust-free materials designed for long-term outdoor exposure',
    ],
    process: [
      { title: 'Boundary Wall Measurement', description: 'Measuring perimeter length, inspecting wall structural stability, and corner angles.', order: 0 },
      { title: 'Bracket & Pole Mounting', description: 'Welding or bolting heavy-duty hot-dip galvanized bracket posts.', order: 1 },
      { title: 'Wire Stringing & Earth Spikes', description: 'Straining high-tensile wire and driving copper earth rods into moist ground.', order: 2 },
      { title: 'Energizer Commissioning', description: 'Testing pulse voltage, cut-wire siren trigger, and safety sign compliance.', order: 3 },
    ],
  },
};

export async function generateMetadata({ params }: ServicePageProps) {
  try {
    const srv = await fetchApi(`/services/${params.slug}`);
    return {
      title: srv.seoTitle || `${srv.name} | TRICLINIUM SYSTEMS`,
      description: srv.seoDescription || srv.shortDescription,
    };
  } catch (e) {
    const fallback = FALLBACK_SERVICES[params.slug];
    if (fallback) {
      return {
        title: `${fallback.name} | TRICLINIUM SYSTEMS`,
        description: fallback.shortDescription,
      };
    }
    return { title: 'Security & Tech Services | TRICLINIUM SYSTEMS' };
  }
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  let service: any = null;

  try {
    service = await fetchApi(`/services/${params.slug}`);
  } catch (err) {
    service = FALLBACK_SERVICES[params.slug];
  }

  // Also check if fallback has it if backend returned 404
  if (!service && FALLBACK_SERVICES[params.slug]) {
    service = FALLBACK_SERVICES[params.slug];
  }

  // Fallback to first service if slug not found
  if (!service) {
    service = FALLBACK_SERVICES['professional-cctv-installation'];
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/services" className="hover:text-foreground">Services</Link>
        {service.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/services?category=${service.category.slug || ''}`} className="hover:text-foreground">
              {service.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-xs">{service.name}</span>
      </nav>

      {/* Main Service Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs uppercase rounded-full">
            {service.category?.name}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {service.name}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {service.shortDescription}
          </p>

          <ServiceDetailClient service={service} />
        </div>

        <div className="aspect-[4/3] rounded-xl overflow-hidden border shadow-lg bg-slate-100 dark:bg-slate-900">
          <img
            src={service.featuredImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80'}
            alt={service.name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Detailed Overview & Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Service Overview &amp; Scope of Work
          </h2>
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-card p-6 rounded-xl border">
            {service.fullDescription}
          </div>

          {/* Process Workflow Steps */}
          {service.process && service.process.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Step-by-Step Installation Process
              </h3>
              <div className="space-y-4">
                {service.process.map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border bg-card">
                    <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Benefits Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-slate-50 dark:bg-slate-900/50 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <span>Key Customer Benefits</span>
            </h3>
            <div className="space-y-2">
              {service.benefits && service.benefits.length > 0 ? (
                service.benefits.map((ben: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ben}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">Certified quality assured installation.</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-600" />
              <span>Service Highlights &amp; Inclusions</span>
            </h3>
            <div className="space-y-2">
              {service.features && service.features.map((feat: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
