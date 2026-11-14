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

export async function generateMetadata({ params }: ServicePageProps) {
  try {
    const srv = await fetchApi(`/services/${params.slug}`);
    return {
      title: srv.seoTitle || `${srv.name} | TRICLINIUM Services`,
      description: srv.seoDescription || srv.shortDescription,
    };
  } catch (e) {
    return { title: 'Engineering Service | TRICLINIUM' };
  }
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  let service: any = null;

  try {
    service = await fetchApi(`/services/${params.slug}`);
  } catch (err) {
    if (params.slug === '5-axis-cnc-machining-fabrication') {
      service = {
        id: 'srv-seed-1',
        name: 'Advanced 5-Axis CNC Precision Machining',
        slug: '5-axis-cnc-machining-fabrication',
        shortDescription: 'High-tolerance custom component fabrication in titanium, stainless steel, and aerospace aluminum alloys.',
        fullDescription: 'Our advanced facility provides end-to-end multi-axis CNC manufacturing. From CAD review and toolpath optimization to CMM coordinate verification and protective surface finishing, we deliver mission-critical components with tolerances within ±0.005mm.',
        category: { name: 'Precision Fabrication', slug: 'precision-fabrication' },
        featuredImage: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80',
        pricingModel: 'CUSTOM_QUOTE',
        features: [
          'Tolerances down to ±0.005 mm (5 microns)',
          'Work envelope up to 1,200mm × 800mm × 650mm',
          'Raw materials: Inconel, Titanium, 316L, 7075-T6',
        ],
        benefits: [
          'Reduced lead time through integrated CAD/CAM toolpaths',
          'Full material traceability and optical CMM inspection reports',
        ],
        process: [
          { title: 'Engineering CAD Analysis', description: 'Review design for manufacturability (DFM) and material specifications.', order: 0 },
          { title: 'Toolpath Simulation & Setup', description: 'Virtual collision testing and custom fixture preparation.', order: 1 },
          { title: 'Multi-Axis Execution', description: 'High-speed automated CNC milling with continuous coolant control.', order: 2 },
          { title: 'Metrology & QA Certification', description: 'Coordinate measuring machine (CMM) verification and delivery packaging.', order: 3 },
        ],
        relatedServices: [],
      };
    } else {
      notFound();
    }
  }

  if (!service) notFound();

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
            <Link href={`/services?category=${service.category.slug}`} className="hover:text-foreground">
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
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {service.name}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {service.shortDescription}
          </p>

          <ServiceDetailClient service={service} />
        </div>

        <div className="aspect-[4/3] rounded-xl overflow-hidden border shadow-lg">
          <img
            src={service.featuredImage || 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80'}
            alt={service.name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Detailed Overview & Engineering Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Scope of Engagement & Technical Specifications
          </h2>
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-card p-6 rounded-xl border">
            {service.fullDescription}
          </div>

          {/* Process Workflow Steps */}
          {service.process && service.process.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Execution Methodology & Workflow Steps
              </h3>
              <div className="space-y-4">
                {service.process.map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border bg-card">
                    <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
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
              <span>Commercial Benefits</span>
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
                <div className="text-xs text-muted-foreground">Certified quality assured engagement.</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-600" />
              <span>Technical Capabilities</span>
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
