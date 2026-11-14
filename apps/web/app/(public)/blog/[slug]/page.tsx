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
      title: `${post.title} | TRICLINIUM Insights`,
      description: post.excerpt,
    };
  } catch (e) {
    return { title: 'Engineering Article | TRICLINIUM' };
  }
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  let post: any = null;

  try {
    post = await fetchApi(`/blog/${params.slug}`);
  } catch (err) {
    if (params.slug === 'optimizing-monumental-pivot-assemblies') {
      post = {
        title: 'Optimizing Monumental Architectural Pivot Assemblies: Structural Dynamics & Bearing Longevity',
        slug: 'optimizing-monumental-pivot-assemblies',
        excerpt: 'An in-depth analysis of eccentric load vectors, thermal expansion considerations, and needle-thrust bearing configurations in high-tonnage architectural hardware.',
        content: `When designing architectural portals exceeding 500 kilograms, conventional hinge kinematics fail due to excessive cantilever deflection. The solution lies in vertical load transfer through ground-anchored thrust bearings.

### 1. Kinematic Vector Analysis
By decoupling vertical gravity loads from lateral wind-pressure moments, engineers eliminate premature bearing binding. In the TRICLINIUM Titan-750 series, dual needle-thrust assemblies manage static downward loads up to 15,000 N while lateral bronze bushings absorb horizontal Shear forces.

### 2. Marine Grade Materials & Passivation
Exposure to seaside environments accelerates galvanic oxidation. Solid 316-L passivation creates a protective chromium oxide layer preventing pitting corrosion along high-stress micro-machined fillets.

### 3. Conclusion & Recommendations
For high-traffic monumental installations, always specify verified axial load capacity and insist on factory-supplied mill test reports verifying alloy integrity before field installation.`,
        featuredImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        authorName: 'Dr. Arthur Sterling, Lead Metallurgist',
        category: { name: 'Engineering & Materials' },
        publishedAt: new Date().toISOString(),
      };
    } else {
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
