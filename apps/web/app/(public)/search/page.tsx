import React from 'react';
import Link from 'next/link';
import { Search, Package, Wrench, FileText, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api-client';

export const metadata = {
  title: 'Search Catalog & Technical Library | TRICLINIUM',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  let products: any[] = [];
  let services: any[] = [];
  let posts: any[] = [];

  if (query.trim()) {
    try {
      const [pRes, sRes, bRes] = await Promise.all([
        fetchApi(`/products?search=${encodeURIComponent(query)}&limit=6`),
        fetchApi(`/services?search=${encodeURIComponent(query)}&limit=6`),
        fetchApi(`/blog?search=${encodeURIComponent(query)}&limit=6`),
      ]);
      products = pRes.items || [];
      services = sRes.items || [];
      posts = bRes.items || [];
    } catch (e) {
      // Fallback
    }
  }

  const totalResults = products.length + services.length + posts.length;

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-4xl space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Universal Search Desk
        </h1>
        <p className="text-sm text-muted-foreground">
          Query part numbers, hardware dimensions, engineering disciplines, and whitepapers.
        </p>

        {/* Search Bar */}
        <form method="GET" action="/search" className="pt-4 max-w-xl mx-auto flex gap-2">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search pivot hinges, couplers, FEA, milling..."
            className="text-sm h-11"
            autoFocus
          />
          <Button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white h-11 px-6">
            <Search className="h-4 w-4 mr-2" />
            <span>Search</span>
          </Button>
        </form>
      </div>

      {query && (
        <div className="space-y-8">
          <div className="text-xs text-muted-foreground pb-2 border-b">
            Found <strong>{totalResults}</strong> result(s) for query &ldquo;{query}&rdquo;
          </div>

          {/* Products Group */}
          {products.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-sky-600" />
                <span>Matching Products ({products.length})</span>
              </h3>
              <div className="divide-y border rounded-xl overflow-hidden bg-card">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">SKU: {p.sku} · {p.category?.name}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Services Group */}
          {services.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="h-4 w-4 text-sky-600" />
                <span>Matching Services ({services.length})</span>
              </h3>
              <div className="divide-y border rounded-xl overflow-hidden bg-card">
                {services.map((s) => (
                  <Link
                    key={s.id}
                    href={`/services/${s.slug}`}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h4>
                      <p className="text-xs text-muted-foreground">{s.shortDescription}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Blog Articles */}
          {posts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-sky-600" />
                <span>Technical Publications ({posts.length})</span>
              </h3>
              <div className="divide-y border rounded-xl overflow-hidden bg-card">
                {posts.map((b) => (
                  <Link
                    key={b.id}
                    href={`/blog/${b.slug}`}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.title}</h4>
                      <p className="text-xs text-muted-foreground">{b.excerpt}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm border rounded-xl">
              No matching records found. Try searching with a broader term or SKU prefix.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
