import React from 'react';
import Link from 'next/link';
import { Search, Filter, SlidersHorizontal, PackageX } from 'lucide-react';
import { ProductCard } from '@/components/public/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

interface ProductsPageProps {
  searchParams: {
    category?: string;
    availability?: string;
    search?: string;
    sort?: string;
    order?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const queryParams = new URLSearchParams();
  if (searchParams.category) queryParams.set('category', searchParams.category);
  if (searchParams.availability) queryParams.set('availability', searchParams.availability);
  if (searchParams.search) queryParams.set('search', searchParams.search);
  if (searchParams.sort) queryParams.set('sort', searchParams.sort);
  if (searchParams.order) queryParams.set('order', searchParams.order);
  queryParams.set('page', searchParams.page || '1');
  queryParams.set('limit', '12');

  let productsData: any = { items: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 1 } };
  let categoriesData: any[] = [];

  try {
    const [prods, cats] = await Promise.all([
      fetchApi(`/products?${queryParams.toString()}`),
      fetchApi('/product-categories'),
    ]);
    productsData = prods;
    categoriesData = cats;
  } catch (err) {
    // Graceful fallback for initial build without running backend
    productsData = {
      items: [
        {
          id: 'prod-seed-1',
          name: 'Titan-Forged Pivot Hinge 750',
          slug: 'titan-pivot-hinge-750',
          sku: 'TRIC-HW-750',
          shortDescription: 'Industrial-grade architectural pivot hinge engineered for doors up to 750kg.',
          category: { name: 'Architectural Hardware' },
          price: 1250.0,
          promotionalPrice: 1120.0,
          priceVisible: true,
          availability: 'IN_STOCK',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'prod-seed-2',
          name: 'AeroLock High-Torque Linear Coupler',
          slug: 'aerolock-linear-coupler',
          sku: 'TRIC-PC-420',
          shortDescription: 'Zero-backlash precision coupling designed for high-dynamic servomotor drives.',
          category: { name: 'Precision Assemblies' },
          price: 485.0,
          priceVisible: true,
          availability: 'IN_STOCK',
          imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'prod-seed-3',
          name: 'OmniFlow Industrial SCADA Telemetry Suite',
          slug: 'omniflow-scada-telemetry-suite',
          sku: 'TRIC-SW-OMNI',
          shortDescription: 'Cloud-native digital asset telemetry, real-time edge monitoring, and predictive maintenance platform.',
          category: { name: 'Industrial Software' },
          price: 3400.0,
          promotionalPrice: 2950.0,
          priceVisible: true,
          availability: 'IN_STOCK',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      pagination: { total: 3, page: 1, limit: 12, totalPages: 1 },
    };

    categoriesData = [
      { id: '1', name: 'Architectural Hardware', slug: 'architectural-hardware', productCount: 1 },
      { id: '2', name: 'Precision Assemblies', slug: 'precision-assemblies', productCount: 1 },
      { id: '3', name: 'Industrial Software', slug: 'digital-industrial-software', productCount: 1 },
    ];
  }

  const { items, pagination } = productsData;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12">
      {/* Page Header */}
      <div className="border-b pb-8 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Product Catalog & Assemblies
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Explore our certified range of heavy-capacity architectural pivot systems, zero-backlash mechanical drive couplings, and cloud telemetry solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <form method="GET" action="/products" className="space-y-6 bg-card p-5 rounded-xl border">
            {/* Search Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                Search Catalog
              </label>
              <div className="relative">
                <Input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search || ''}
                  placeholder="SKU, keyword, part name..."
                  className="pr-8 text-xs"
                />
                <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                Categories
              </label>
              <div className="space-y-1.5">
                <Link
                  href="/products"
                  className={`block px-2.5 py-1.5 rounded text-xs transition-colors ${
                    !searchParams.category
                      ? 'bg-sky-50 text-sky-700 font-bold dark:bg-sky-950/40 dark:text-sky-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
                  }`}
                >
                  All Categories ({pagination?.total || 0})
                </Link>
                {categoriesData.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                    className={`block px-2.5 py-1.5 rounded text-xs transition-colors ${
                      searchParams.category === cat.slug
                        ? 'bg-sky-50 text-sky-700 font-bold dark:bg-sky-950/40 dark:text-sky-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
                    }`}
                  >
                    {cat.name} {cat.productCount !== undefined && `(${cat.productCount})`}
                  </Link>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                Availability
              </label>
              <select
                name="availability"
                defaultValue={searchParams.availability || ''}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
              >
                <option value="">All Availabilities</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="MADE_TO_ORDER">Made to Order</option>
                <option value="PREORDER">Pre-Order</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                Sort By
              </label>
              <select
                name="sort"
                defaultValue={searchParams.sort || 'newest'}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
              >
                <option value="newest">Newest Releases</option>
                <option value="price">Price: Low to High</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm" className="w-full bg-slate-900 text-white text-xs">
                Apply Filters
              </Button>
              {Object.keys(searchParams).length > 0 && (
                <Link href="/products" className="w-full">
                  <Button type="button" variant="outline" size="sm" className="w-full text-xs">
                    Reset
                  </Button>
                </Link>
              )}
            </div>
          </form>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2">
            <span>
              Showing {items.length} of {pagination?.total || items.length} results
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24 border rounded-xl bg-card space-y-4">
              <PackageX className="h-16 w-16 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Products Matched Your Criteria</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try clearing your search query or selecting a broader category filter.
              </p>
              <Link href="/products">
                <Button variant="outline" size="sm">
                  View Full Catalog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((prod: any) => (
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
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === currentPage;
                const p = new URLSearchParams(queryParams);
                p.set('page', pageNum.toString());

                return (
                  <Link key={pageNum} href={`/products?${p.toString()}`}>
                    <Button
                      size="sm"
                      variant={isCurrent ? 'default' : 'outline'}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {pageNum}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
