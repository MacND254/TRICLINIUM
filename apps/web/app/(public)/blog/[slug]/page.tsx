import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  try {
    const post = await fetchApi(`/blog/${params.slug}`);
    return {
      title: `${post.title} | TRICLINIUM SYSTEMS Security Insights`,
      description: post.excerpt,
    };
  } catch (e) {
    return { title: 'Security Guide | TRICLINIUM SYSTEMS' };
  }
}

const FALLBACK_POSTS: Record<string, any> = {
  'choosing-the-best-cctv-system-kenya': {
    title: 'How to Choose the Best 4K CCTV Camera System for Your Home or Business in Kenya',
    slug: 'choosing-the-best-cctv-system-kenya',
    excerpt: 'A comprehensive buyer guide comparing IP PoE vs wireless cameras, night vision capabilities, NVR storage sizing, and remote smartphone monitoring in Nairobi.',
    content: `Securing your residential property or commercial enterprise in Kenya requires selecting a surveillance solution built for reliability, clear visual evidence, and continuous operation through power fluctuations.

### 1. Power over Ethernet (PoE) vs. Wireless Cameras
For permanent residential perimeter security and business installations, Power over Ethernet (PoE) remains the gold standard. A single Cat6 network cable delivers both gigabit video transmission and DC power directly from your Network Video Recorder (NVR), eliminating Wi-Fi interference and battery degradation. For indoor baby monitoring or rental homes, high-bandwidth 5GHz Wi-Fi cameras provide quick plug-and-play flexibility.

### 2. Resolution & Optical Sensor Quality: Why 4K (8MP) Matters
In security investigations, resolution is the difference between an unidentifiable blur and actionable digital evidence. 4K cameras (3840×2160 pixels) let you digitally zoom in on vehicle number plates, facial features, and currency transactions without pixelation. Look for cameras equipped with Sony STARVIS™ or equivalent large sensors that excel in low-light environments.

### 3. Night Vision: Color at Night vs Traditional Infrared
Traditional IR illuminators produce black-and-white night footage where vehicle colors and clothing descriptions are lost. Modern Color-Night-Vision cameras utilize f/1.0 super-aperture lenses and warm supplementary LED arrays to capture full-spectrum color video 24 hours a day.

### 4. Storage Sizing & Backup Power in Kenya
With H.265+ smart video compression, a 4-channel 4K system requires approximately 2TB to 4TB of surveillance-grade hard drive capacity for 30 days of continuous recording. Pairing your NVR and PoE switch with a line-interactive UPS (Uninterruptible Power Supply) guarantees your surveillance continues recording seamlessly during KPLC power cuts.`,
    featuredImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    authorName: 'Kelvin Mwangi, Lead Security Engineer',
    category: { name: 'CCTV & Surveillance' },
    publishedAt: new Date().toISOString(),
  },
  'smart-video-doorbells-vs-traditional-intercoms': {
    title: 'Smart Video Doorbells vs Traditional Audio Intercoms: Which Is Right for Your Gate?',
    slug: 'smart-video-doorbells-vs-traditional-intercoms',
    excerpt: 'Compare dual-camera AI package detection, smartphone remote unlocking, and weatherproofing for residential gates and apartment complexes.',
    content: `Perimeter access control starts at the front gate or doorway. In Kenya, modern gated communities and standalone homes are increasingly upgrading from legacy audio-only buzzers to intelligent 2K video doorbells.

### 1. Visual Verification & Dual-Camera Coverage
Traditional intercoms only allow audio communication, making it impossible to verify the visitor identity or see what they are carrying. Modern smart doorbells feature dual cameras: an ultrawide front-facing lens for visitor faces and a downward-angled lens specifically focused on parcels and packages placed on your doorstep.

### 2. Smartphone Remote Gate Release
Whether you are at your office in Upper Hill, traveling abroad, or simply in the backyard, smart video doorbells connect directly to your smartphone app over 4G/5G. You receive instant push notifications with a live 2K video feed, two-way audio talkback, and can trigger your electric gate strike lock with a single tap.

### 3. Weatherproofing & Tamper Resistance
Exterior gate installations in Kenya face harsh equatorial sunlight, seasonal torrential rains, and dust. Ensure any doorbell or intercom you choose is IP65 or IP66 rated, with metal anti-tamper mounting brackets and loud local sirens that sound if unauthorized removal is attempted.`,
    featuredImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    authorName: 'Sarah Kimani, Smart Home Specialist',
    category: { name: 'Access Control' },
    publishedAt: new Date().toISOString(),
  },
  'preventing-false-alarms-dual-tech-pir': {
    title: 'Preventing False Alarms: Why Dual-Tech PIR and Microwave Sensors Matter',
    slug: 'preventing-false-alarms-dual-tech-pir',
    excerpt: 'Understand how AI human recognition and pet-immune sensors eliminate nuisance sirens while ensuring 100% genuine intrusion alerts via SMS and M-Pesa linked monitoring.',
    content: `False alarms are one of the most frustrating challenges homeowners face with older intruder systems. Repeated midnight false triggers caused by pets, drafts, or curtains lead to alarm fatigue where homeowners eventually stop arming their systems altogether.

### 1. Dual-Technology Detection Explained
Traditional PIR (Passive Infrared) sensors only detect changes in thermal radiation. A burst of warm sunlight or a curious house pet can trip the sensor. Dual-tech motion detectors combine both PIR heat detection and Doppler Microwave radar. An alarm is only activated when BOTH physical motion and body heat are simultaneously confirmed.

### 2. Pet Immunity up to 25 kg
Modern detector lenses use specialized optical zoning that ignores heat signatures close to the floor (such as dogs and cats under 25kg) while immediately triggering on upright human silhouettes entering the protected zone.

### 3. Triple-Path Alert Dispatch (Wi-Fi + GSM/4G + SMS)
TRICLINIUM SYSTEMS alarm hubs utilize triple-path communication: high-speed Wi-Fi as primary, automatic 4G cellular SIM failover, and SMS backup. If intruders cut your home fiber line, the alarm immediately dispatches push notifications and phone calls to all registered family members within seconds.`,
    featuredImage: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&w=1200&q=80',
    authorName: 'David Omondi, Systems Architect',
    category: { name: 'Intrusion Alarms' },
    publishedAt: new Date().toISOString(),
  },
};

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  let post: any = null;

  try {
    post = await fetchApi(`/blog/${params.slug}`);
  } catch (err) {
    post = FALLBACK_POSTS[params.slug];
    if (!post) {
      notFound();
    }
  }

  if (!post) notFound();

  return (
    <article className="container mx-auto px-4 sm:px-8 py-12 max-w-4xl space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-foreground">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Header */}
      <div className="space-y-4">
        {post.category && (
          <span className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs uppercase rounded-full">
            {post.category.name}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2 border-b pb-6">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="h-4 w-4 text-sky-600" />
            <span>{post.authorName}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-sky-600" />
            <span>{formatDate(post.publishedAt)}</span>
          </span>
        </div>
      </div>

      {/* Hero Image */}
      {post.featuredImage && (
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden border shadow-lg">
          <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed whitespace-pre-line py-4">
        {post.content}
      </div>

      {/* Back button */}
      <div className="pt-8 border-t flex justify-between items-center">
        <Link href="/blog">
          <button className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Publications</span>
          </button>
        </Link>
      </div>
    </article>
  );
}
