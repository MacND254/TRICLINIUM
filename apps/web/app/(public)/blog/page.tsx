import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

export const metadata = {
  title: 'Engineering & Materials Insights Blog | TRICLINIUM',
  description: 'Technical publications on metallurgy, monumental pivot kinematics, and industrial IoT monitoring.',
};

export default async function BlogPage() {
  let posts: any[] = [];
  let categories: any[] = [];

  try {
    const res = await fetchApi('/blog');
    posts = res.items || [];
    categories = res.categories || [];
  } catch (e) {
    posts = [
      {
        id: 'p-1',
        title: 'Optimizing Monumental Architectural Pivot Assemblies: Structural Dynamics & Bearing Longevity',
        slug: 'optimizing-monumental-pivot-assemblies',
        excerpt: 'An in-depth analysis of eccentric load vectors, thermal expansion considerations, and needle-thrust bearing configurations in high-tonnage architectural hardware.',
        featuredImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        authorName: 'Dr. Arthur Sterling, Lead Metallurgist',
        category: { name: 'Engineering & Materials' },
        publishedAt: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="border-b pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Technical Publications & Engineering Insights
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Whitepapers, technical deep-dives, and research articles by TRICLINIUM engineers covering structural kinematics, metallurgy, and industrial telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={post.featuredImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                  alt={post.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {post.category && (
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    {post.category.name}
                  </span>
                )}
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px]">{post.authorName}</span>
                  </span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 group-hover:text-sky-700"
              >
                <span>Read Full Publication</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
