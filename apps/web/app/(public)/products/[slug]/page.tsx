import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ProductDetailClient } from './product-detail-client';
import { ProductCard } from '@/components/public/product-card';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

const FALLBACK_PRODUCTS: Record<string, any> = {
  'prosight-4k-poe-dome-camera': {
    id: 'prod-1',
    name: 'ProSight 4K PoE IP Dome Camera',
    slug: 'prosight-4k-poe-dome-camera',
    sku: 'TRC-CAM-4K-DOM',
    shortDescription: 'Commercial 4K Ultra HD dome camera with AI motion classification, ColorNight vision up to 30m, and weatherproof IP67 housing.',
    fullDescription: 'The TRICLINIUM ProSight 4K PoE IP Dome Camera is designed for high-risk indoor and outdoor monitoring. Featuring an 8-Megapixel optical sensor, it provides crisp 3840x2160 resolution that captures sharp facial features and vehicle details. Its integrated ColorNight sensor delivers full-color imagery in low-light environments without intrusive lighting, while edge AI filters eliminate false alarms caused by animals, rain, or moving branches.',
    category: { name: 'IP Surveillance Cameras', slug: 'ip-surveillance-cameras' },
    price: 18500,
    promotionalPrice: 16500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      '8.0 Megapixel 4K UHD sensor with H.265+ ultra compression',
      'ColorNight™ low-light sensor with supplemental warm LED',
      'Edge AI human & vehicle target classification',
      'Vandal-resistant IK10 dome with IP67 weatherproof rating',
      'Power over Ethernet (PoE 802.3af) single-cable installation',
    ],
    specifications: [
      { name: 'Resolution', value: '4K UHD (3840 × 2160 @ 30fps)' },
      { name: 'Lens', value: '2.8mm Fixed Lens (110° FOV)' },
      { name: 'Night Vision', value: '30m ColorNight + Smart IR' },
      { name: 'Audio', value: 'Built-in noise-canceling microphone' },
      { name: 'Protection', value: 'IP67 Waterproof, IK10 Vandal-Proof' },
      { name: 'Power', value: 'PoE (802.3af) or 12V DC' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80' },
      { url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'apexguard-4k-ai-turret-camera': {
    id: 'prod-apex',
    name: 'ApexGuard 4K AI Turret Camera',
    slug: 'apexguard-4k-ai-turret-camera',
    sku: 'TRIC-CAM-4K-AI',
    shortDescription: 'Industrial 4K Ultra-HD turret camera with ColorNight sensor, DeepLearning human/vehicle classification, and 110dB siren.',
    fullDescription: 'The TRICLINIUM ApexGuard 4K AI Turret Camera delivers forensic-grade 3840x2160 resolution under extreme lighting conditions. Powered by edge neural processors, it classifies human and vehicular intrusions with 99.8% precision, eliminating foliage and animal false alarms.',
    category: { name: 'IP Surveillance Cameras', slug: 'ip-surveillance-cameras' },
    price: 19500,
    promotionalPrice: 17500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      'Neural Edge AI human/vehicle filtering with 99.8% accuracy',
      'ColorNight full-spectrum color night vision up to 50 meters',
      'Automated 110dB siren and red/blue strobe deterrent',
      'Built-in two-way audio intercom',
    ],
    specifications: [
      { name: 'Sensor', value: '8.3 Megapixel 4K UHD' },
      { name: 'Optical Lens', value: '2.8mm Wide-Angle (112° FOV)' },
      { name: 'Night Vision', value: 'ColorNight 0.0005 Lux + Smart IR 50m' },
      { name: 'Audio', value: 'Built-in Mic & Speaker (110dB Siren)' },
      { name: 'Rating', value: 'IP67 Weatherproof, -40°C to +65°C' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80' },
      { url: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'smart-video-doorbell-pro-2k': {
    id: 'prod-doorbell',
    name: 'Smart Video Doorbell Pro 2K with Wireless Chime',
    slug: 'smart-video-doorbell-pro-2k',
    sku: 'TRIC-DRB-2K',
    shortDescription: 'Crystal-clear 2K HDR smart video doorbell with head-to-toe 160° view, two-way audio talk, package detection, and indoor chime.',
    fullDescription: 'Know who is at your front door from anywhere in the world. The TRICLINIUM Smart Video Doorbell Pro captures visitors from head to toe in crisp 2K Quad-HD resolution. Equipped with dual-band Wi-Fi, ultra-low latency two-way audio, and custom motion detection zones that alert your phone instantly when guests press the chime or approach the porch.',
    category: { name: 'Smart Doorbells & Door Cams', slug: 'smart-doorbells-door-cams' },
    price: 16800,
    promotionalPrice: 14500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      '2K Quad-HD 2048x1536 resolution with HDR contrast',
      '160° Head-to-toe expanded vertical viewing angle',
      'Instant mobile video call notification on doorbell press',
      'Package & person AI smart recognition',
      'Wireless plug-in chime box included with adjustable volume',
    ],
    specifications: [
      { name: 'Resolution', value: '2K QHD (2048 × 1536)' },
      { name: 'Field of View', value: '160° Diagonal (4:3 Aspect Ratio)' },
      { name: 'Connectivity', value: 'Dual-Band 2.4GHz / 5GHz Wi-Fi' },
      { name: 'Storage', value: 'MicroSD slot up to 256GB + NVR RTSP streaming' },
      { name: 'Power', value: 'Hardwired 16V-24V AC or Internal 6500mAh Battery' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1200&q=80' },
      { url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'ultraview-wireless-door-cam': {
    id: 'prod-doorcam',
    name: 'UltraView Wireless Door Camera & Digital Peephole',
    slug: 'ultraview-wireless-door-cam',
    sku: 'TRIC-DCAM-WIFI',
    shortDescription: 'Wire-free door peephole security camera with 4.3-inch indoor color monitor, auto human detection, and night vision.',
    fullDescription: 'Upgrade standard door peepholes into an intelligent digital security barrier. The UltraView Door Cam mounts securely through standard peephole holes with zero drilling required. Inside, a 4.3-inch LCD color screen allows anyone at home (including children and elders) to clearly see who is outside, while sending simultaneous push alerts to your smartphone.',
    category: { name: 'Smart Doorbells & Door Cams', slug: 'smart-doorbells-door-cams' },
    price: 13500,
    promotionalPrice: 11900,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      'Zero wire drilling: fits standard 14-22mm door peepholes',
      '4.3-inch high-resolution IPS indoor color screen',
      'Rechargeable 5000mAh battery providing up to 90 days standby',
      'IR night vision with auto-switch in dim lighting',
    ],
    specifications: [
      { name: 'Display', value: '4.3-inch IPS Color Display' },
      { name: 'Camera', value: '1080p Full-HD with 130° Wide Angle' },
      { name: 'Door Thickness', value: 'Supports 35mm to 110mm doors' },
      { name: 'Battery', value: '5000mAh Lithium Rechargeable' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'securehome-pro-wireless-alarm-kit': {
    id: 'prod-alarm',
    name: 'SecureHome Pro Wireless Alarm Kit',
    slug: 'securehome-pro-wireless-alarm-kit',
    sku: 'TRC-ALM-PRO-KIT',
    shortDescription: 'Complete wireless home alarm system with motion sensors, door/window contacts, outdoor solar siren, and mobile app control.',
    fullDescription: 'The SecureHome Pro Wireless Alarm Kit provides multi-layered intrusion protection for modern houses and villas. Centered around a smart frequency-hopping hub with GSM 4G cellular backup, it coordinates with pet-immune PIR motion detectors, magnetic door contacts, and a high-decibel outdoor siren that triggers immediately upon perimeter breaches.',
    category: { name: 'Home Alarm Systems', slug: 'home-alarm-systems' },
    price: 36500,
    promotionalPrice: 32000,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      'Smart alarm hub with 4G SIM cellular & Wi-Fi dual path redundancy',
      'Includes 3x pet-immune motion sensors & 4x magnetic door contacts',
      'Loud 115dB outdoor siren with strobe light',
      'Up to 18 hours battery backup during power blackouts',
      'Instant SMS, automated voice call, and push notifications',
    ],
    specifications: [
      { name: 'Zones', value: 'Up to 64 wireless accessories' },
      { name: 'Protocol', value: '868MHz frequency hopping with AES-128 encryption' },
      { name: 'Connectivity', value: '4G LTE GSM Micro-SIM + Wi-Fi 2.4GHz' },
      { name: 'Backup Power', value: 'Li-Ion battery up to 18 hours' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80' },
      { url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'nanny-cam-360-indoor-wifi': {
    id: 'prod-nanny',
    name: '360° Smart Baby & Nanny Cam with Two-Way Audio',
    slug: 'nanny-cam-360-indoor-wifi',
    sku: 'TRIC-NCAM-360',
    shortDescription: 'Indoor pan-tilt smart Wi-Fi camera with 2K Quad-HD video, baby crying detection, soothing lullabies, and crystal two-way audio.',
    fullDescription: 'Keep a watchful eye on your child, nanny, or elderly loved ones with the TRICLINIUM 360° Smart Nanny Cam. Features complete 360° pan and 90° tilt control straight from your phone, continuous motion tracking, instant baby cry detection alerts, and loud two-way talk so you can communicate effortlessly from the office or while traveling.',
    category: { name: 'Nanny Cams & Indoor Cameras', slug: 'nanny-cams-indoor' },
    price: 8500,
    promotionalPrice: 7200,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      '360° motorized pan & 90° tilt motorized remote control',
      '2K Quad-HD resolution with clear night vision up to 10 meters',
      'Intelligent baby crying detection & motion tracking',
      'Two-way audio communication with noise-canceling mic',
      'Privacy mode shutter hides the lens when you are at home',
    ],
    specifications: [
      { name: 'Resolution', value: '2K QHD (2304 × 1296 @ 25fps)' },
      { name: 'Pan / Tilt', value: '355° Horizontal, 90° Vertical' },
      { name: 'Storage', value: 'MicroSD slot (up to 256GB) + Cloud support' },
      { name: 'Audio', value: 'Integrated microphone & speaker' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'video-intercom-touchscreen-system': {
    id: 'prod-intercom',
    name: 'TouchScreen IP Video Intercom Villa Kit',
    slug: 'video-intercom-touchscreen-system',
    sku: 'TRIC-INT-VILLA',
    shortDescription: 'Modern IP video intercom kit with 7-inch indoor touchscreen monitor, weatherproof outdoor camera station, and remote gate release.',
    fullDescription: 'Screen visitors and open gates with style and convenience. The TRICLINIUM Villa Video Intercom includes an outdoor stainless-steel camera station with wide-angle night vision and RFID keyfob unlock, connected to a sleek 7-inch wall-mounted indoor touch monitor that answers door calls and opens magnetic pedestrian gates.',
    category: { name: 'Intercoms & Access Control', slug: 'intercoms-access-control' },
    price: 36000,
    promotionalPrice: 32500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      '7-inch ultra-thin color touchscreen indoor monitor',
      'Outdoor doorbell camera with 1080p HD & infrared night vision',
      'Remote electric gate and pedestrian door unlock support',
      'RFID card and keyfob quick door opening',
      'Connects with TRICLINIUM smartphone app for remote gate opening',
    ],
    specifications: [
      { name: 'Monitor', value: '7" Capacitive Touch LCD (1024 × 600)' },
      { name: 'Camera', value: '2.0 Megapixel 1080p (120° Angle)' },
      { name: 'Relay Output', value: '2 Relays (Gate Motor + Mag Lock)' },
      { name: 'Wiring', value: 'Standard CAT6 PoE or 4-Wire' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'meshguard-wifi6-home-network-setup': {
    id: 'prod-network',
    name: 'MeshGuard Whole-Home WiFi 6 & Network Rack Setup',
    slug: 'meshguard-wifi6-home-network-setup',
    sku: 'TRIC-NET-MESH6',
    shortDescription: 'Enterprise-grade whole-home mesh Wi-Fi 6 kit with gigabit PoE switch and wall access points for bufferless 4K CCTV streaming.',
    fullDescription: 'Eliminate Wi-Fi dead zones and power all your IP CCTV cameras, smart doorbells, and entertainment devices with the MeshGuard Home Network System. Featuring tri-band Wi-Fi 6 technology with gigabit wired backhaul, it provides lightning-fast roaming coverage throughout multi-story houses and outdoor compound gardens.',
    category: { name: 'Home Networking & Mesh WiFi', slug: 'home-networking-mesh-wifi' },
    price: 28500,
    promotionalPrice: 24900,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      'Tri-Band Wi-Fi 6 speeds up to 3,000 Mbps with zero dead spots',
      'Seamless roaming handoff between access points',
      'Dedicated VLAN isolation for CCTV cameras and IoT gadgets',
      'Gigabit PoE switch powers security cameras over network cable',
    ],
    specifications: [
      { name: 'Wi-Fi Standard', value: 'Wi-Fi 6 (802.11ax) Tri-Band AX3000' },
      { name: 'Coverage Area', value: 'Up to 5,500 sq. ft (Expandable)' },
      { name: 'Ports', value: '4x Gigabit LAN/WAN ports per node' },
      { name: 'Device Capacity', value: 'Supports up to 150 connected devices' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'vaultguard-8ch-nvr-system': {
    id: 'prod-2',
    name: 'VaultGuard 8-Channel 4K NVR System',
    slug: 'vaultguard-8ch-nvr-system',
    sku: 'TRC-NVR-8CH-4K',
    shortDescription: 'Professional 8-channel 4K NVR with 2TB surveillance storage, PoE ports, remote mobile app, and AI intelligent alerts.',
    fullDescription: 'The TRICLINIUM VaultGuard 8-Channel NVR is the core recording hub for high-definition home and commercial camera setups. With 8 independent PoE ports, it powers and connects cameras through single Ethernet cables. Pre-fitted with a surveillance-grade hard disk for continuous 24/7 recording.',
    category: { name: 'NVR & DVR Systems', slug: 'nvr-dvr-systems' },
    price: 54000,
    promotionalPrice: 48500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      '8 Built-in independent PoE+ camera network ports',
      'Pre-installed 2TB surveillance hard disk included',
      'Supports cameras up to 4K 8MP resolution',
      'Zero monthly cloud fees with local encrypted hard drive storage',
    ],
    specifications: [
      { name: 'Channels', value: '8 IP Channels up to 8 Megapixels' },
      { name: 'PoE Ports', value: '8x RJ-45 10/100 Mbps PoE+' },
      { name: 'Video Output', value: '1x HDMI 4K, 1x VGA' },
      { name: 'Storage', value: '1 SATA interface up to 10TB (2TB pre-installed)' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'biometric-smart-door-lock-d100': {
    id: 'prod-lock',
    name: 'Biometric Smart Digital Door Lock D100',
    slug: 'biometric-smart-door-lock-d100',
    sku: 'TRIC-LCK-BIO',
    shortDescription: 'Keyless smart door lock featuring 3D semiconductor fingerprint reader, anti-peep PIN code, RFID card, and smartphone app unlock.',
    fullDescription: 'Never worry about lost or forgotten keys again. The TRICLINIUM Biometric Smart Lock D100 replaces conventional mechanical door locks with bank-level biometric authentication. Unlock in less than 0.3 seconds via fingerprint, set one-time visitor passcodes for housekeepers, and receive instant alert notifications when your door is opened.',
    category: { name: 'Smart Locks & Biometrics', slug: 'smart-locks' },
    price: 24500,
    promotionalPrice: 21900,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      '0.3s Quick biometric fingerprint identification',
      'Virtual anti-peep passcode input prevents shoulder surfing',
      'Temporary OTP passcodes for visitors and service technicians',
      'Emergency mechanical key and USB-C power jumpstart',
    ],
    specifications: [
      { name: 'Unlock Methods', value: 'Fingerprint, PIN, RFID Card, Smartphone App, Key' },
      { name: 'Door Fit', value: 'Fits wooden and metal doors 38mm-70mm' },
      { name: 'Battery Life', value: 'Up to 12 months (4x AA batteries with low power alert)' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
  'electric-fence-energizer-perimeter-kit': {
    id: 'prod-fence',
    name: 'Electric Fence Energizer & Perimeter Alarm Kit',
    slug: 'electric-fence-energizer-perimeter-kit',
    sku: 'TRIC-FNC-5J',
    shortDescription: 'Heavy-duty 5-Joule perimeter fence energizer with battery backup, cut-wire tampering siren, and key switch control.',
    fullDescription: 'Deter intruders at the boundary line with high-voltage physical deterrence. The TRICLINIUM 5-Joule Fence Energizer powers up to 5km of multi-strand perimeter fencing. If fence wires are severed or shorted, it activates a piercing 120dB siren and alerts your mobile alarm hub instantly.',
    category: { name: 'Perimeter Security', slug: 'perimeter-security' },
    price: 42000,
    promotionalPrice: 38000,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    features: [
      '5-Joule high-power pulse output for strong perimeter defense',
      'Intelligent fence wire cut and tampering alarm detection',
      'Internal 7Ah battery keeps fence live during power outages',
      'Key switch & remote keyfob on/off control',
    ],
    specifications: [
      { name: 'Output Energy', value: '5 Joules @ 500 Ohms' },
      { name: 'Open Circuit Voltage', value: 'Up to 9,900 Volts' },
      { name: 'Backup Battery', value: '12V 7Ah rechargeable lead-acid battery' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1200&q=80' },
    ],
  },
};

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    const product = await fetchApi(`/products/${params.slug}`);
    return {
      title: product.seoTitle || `${product.name} | TRICLINIUM SYSTEMS`,
      description: product.seoDescription || product.shortDescription,
    };
  } catch (e) {
    const fallback = FALLBACK_PRODUCTS[params.slug];
    if (fallback) {
      return {
        title: `${fallback.name} | TRICLINIUM SYSTEMS`,
        description: fallback.shortDescription,
      };
    }
    return {
      title: 'Security Equipment & Specifications | TRICLINIUM SYSTEMS',
    };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  let product: any = null;

  try {
    product = await fetchApi(`/products/${params.slug}`);
  } catch (err) {
    product = FALLBACK_PRODUCTS[params.slug];
  }

  // Also check if fallback has it if backend returned 404
  if (!product && FALLBACK_PRODUCTS[params.slug]) {
    product = FALLBACK_PRODUCTS[params.slug];
  }

  // Fallback to first product if slug not found
  if (!product) {
    product = FALLBACK_PRODUCTS['prosight-4k-poe-dome-camera'];
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-foreground">Security Products</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/products?category=${product.category.slug || ''}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Hero & Actions */}
      <ProductDetailClient product={product} />

      {/* Full Description & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t">
        {/* Full Prose Description */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Product Overview &amp; Capabilities
          </h2>
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-card p-6 rounded-xl border">
            {product.fullDescription}
          </div>
        </div>

        {/* Specifications Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            <span>Technical Specifications</span>
          </h2>

          <div className="border rounded-xl overflow-hidden bg-card divide-y">
            {product.specifications && product.specifications.length > 0 ? (
              product.specifications.map((spec: any, idx: number) => (
                <div key={idx} className="p-3 text-xs flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">{spec.name}</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right font-mono">
                    {spec.value}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-muted-foreground">Contact our technical team for full data sheets.</div>
            )}
          </div>
        </div>
      </div>

      {/* Warranty & Installation Guarantee Notice */}
      <div className="p-6 rounded-xl border bg-slate-50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Need Professional Installation in Kenya?
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Our certified technicians provide on-site installation, clean cable concealment, and mobile app configuration across Nairobi and countrywide.
            </p>
          </div>
        </div>
        <Link href="/contact" className="shrink-0">
          <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors">
            Request Site Survey
          </button>
        </Link>
      </div>
    </div>
  );
}
