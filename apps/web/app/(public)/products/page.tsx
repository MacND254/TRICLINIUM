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

const FALLBACK_SECURITY_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'ProSight 4K PoE IP Dome Camera',
    slug: 'prosight-4k-poe-dome-camera',
    sku: 'TRC-CAM-4K-DOM',
    shortDescription: 'Commercial 4K Ultra HD dome camera with AI motion classification, ColorNight vision up to 30m, and weatherproof IP67 housing.',
    category: { name: 'IP & CCTV Cameras', slug: 'ip-surveillance-cameras' },
    price: 18500,
    promotionalPrice: 16500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-2',
    name: 'Smart Video Doorbell Pro 2K with Wireless Chime',
    slug: 'smart-video-doorbell-pro-2k',
    sku: 'TRIC-DRB-2K',
    shortDescription: 'Crystal-clear 2K HDR smart video doorbell with head-to-toe 160° view, two-way audio talk, package detection, and indoor chime.',
    category: { name: 'Smart Doorbells & Door Cams', slug: 'smart-doorbells-door-cams' },
    price: 16800,
    promotionalPrice: 14500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-3',
    name: 'UltraView Wireless Door Camera & Digital Peephole',
    slug: 'ultraview-wireless-door-cam',
    sku: 'TRIC-DCAM-WIFI',
    shortDescription: 'Wire-free door peephole security camera with 4.3-inch indoor color monitor, auto human detection, and night vision.',
    category: { name: 'Smart Doorbells & Door Cams', slug: 'smart-doorbells-door-cams' },
    price: 13500,
    promotionalPrice: 11900,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-4',
    name: 'SecureHome Pro Wireless Alarm Kit',
    slug: 'securehome-pro-wireless-alarm-kit',
    sku: 'TRC-ALM-PRO-KIT',
    shortDescription: 'Complete wireless home alarm system with motion sensors, door/window contacts, outdoor solar siren, and mobile app control.',
    category: { name: 'Home Alarm Systems', slug: 'home-alarm-systems' },
    price: 36500,
    promotionalPrice: 32000,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-5',
    name: '360° Smart Baby & Nanny Cam with Two-Way Audio',
    slug: 'nanny-cam-360-indoor-wifi',
    sku: 'TRIC-NCAM-360',
    shortDescription: 'Indoor pan-tilt smart Wi-Fi camera with 2K Quad-HD video, baby crying detection, soothing lullabies, and crystal two-way audio.',
    category: { name: 'Nanny Cams & Indoor Monitoring', slug: 'nanny-cams-indoor' },
    price: 8500,
    promotionalPrice: 7200,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-6',
    name: 'TouchScreen IP Video Intercom Villa Kit',
    slug: 'video-intercom-touchscreen-system',
    sku: 'TRIC-INT-VILLA',
    shortDescription: 'Modern IP video intercom kit with 7-inch indoor touchscreen monitor, weatherproof outdoor camera station, and remote gate release.',
    category: { name: 'Intercoms & Access Control', slug: 'intercoms-access-control' },
    price: 36000,
    promotionalPrice: 32500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-7',
    name: 'MeshGuard Whole-Home WiFi 6 & Network Rack Setup',
    slug: 'meshguard-wifi6-home-network-setup',
    sku: 'TRIC-NET-MESH6',
    shortDescription: 'Enterprise whole-home mesh Wi-Fi 6 kit with gigabit PoE switch and wall access points for bufferless 4K CCTV streaming.',
    category: { name: 'Home Network & Mesh WiFi', slug: 'home-networking-mesh-wifi' },
    price: 28500,
    promotionalPrice: 24900,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-8',
    name: 'VaultGuard 8-Channel 4K NVR System',
    slug: 'vaultguard-8ch-nvr-system',
    sku: 'TRC-NVR-8CH-4K',
    shortDescription: 'Professional 8-channel 4K NVR with 2TB surveillance storage, PoE ports, remote mobile app, and AI intelligent alerts.',
    category: { name: 'NVR & Storage Systems', slug: 'nvr-dvr-systems' },
    price: 54000,
    promotionalPrice: 48500,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-9',
    name: 'Biometric Smart Digital Door Lock D100',
    slug: 'biometric-smart-door-lock-d100',
    sku: 'TRIC-LCK-BIO',
    shortDescription: 'Keyless smart door lock featuring 3D semiconductor fingerprint reader, anti-peep PIN code, RFID card, and smartphone app unlock.',
    category: { name: 'Smart Biometric Locks', slug: 'smart-locks' },
    price: 24500,
    promotionalPrice: 21900,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prod-10',
    name: 'Electric Fence Energizer & Perimeter Alarm Kit',
    slug: 'electric-fence-energizer-perimeter-kit',
    sku: 'TRIC-FNC-5J',
    shortDescription: 'Heavy-duty 5-Joule perimeter fence energizer with battery backup, cut-wire tampering siren, and key switch control.',
    category: { name: 'Perimeter Electric Fencing', slug: 'perimeter-security' },
    price: 42000,
    promotionalPrice: 38000,
    currency: 'KES',
    priceVisible: true,
    availability: 'IN_STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1200&q=80',
  },
];

const FALLBACK_SECURITY_CATEGORIES = [
  { id: 'cat-1', name: 'IP & CCTV Cameras', slug: 'ip-surveillance-cameras', productCount: 2 },
  { id: 'cat-2', name: 'Smart Doorbells & Door Cams', slug: 'smart-doorbells-door-cams', productCount: 2 },
  { id: 'cat-3', name: 'Home Alarm Systems', slug: 'home-alarm-systems', productCount: 1 },
  { id: 'cat-4', name: 'Nanny Cams & Indoor', slug: 'nanny-cams-indoor', productCount: 1 },
  { id: 'cat-5', name: 'Intercoms & Access Control', slug: 'intercoms-access-control', productCount: 1 },
  { id: 'cat-6', name: 'Home Network & Mesh WiFi', slug: 'home-networking-mesh-wifi', productCount: 1 },
  { id: 'cat-7', name: 'NVR & Storage Systems', slug: 'nvr-dvr-systems', productCount: 1 },
  { id: 'cat-8', name: 'Smart Biometric Locks', slug: 'smart-locks', productCount: 1 },
  { id: 'cat-9', name: 'Perimeter Electric Fencing', slug: 'perimeter-security', productCount: 1 },
];

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

  let heroData = {
    badge: 'Surveillance & Intelligent Security Systems',
    title: 'Security Products & Hardware Equipment',
    subtitle:
      'Explore our certified 4K AI CCTV cameras, smart video doorbells, door cams, wireless intruder alarm systems, nanny cameras, video intercoms, home mesh networking, and perimeter defense systems — priced in Kenyan Shillings (KES).',
    backgroundImage: '',
  };

  try {
    const [prods, cats, pageRes] = await Promise.all([
      fetchApi(`/products?${queryParams.toString()}`),
      fetchApi('/product-categories'),
      fetchApi('/pages/products').catch(() => null),
    ]);
    if (prods?.items && prods.items.length > 0) {
      productsData = prods;
    } else {
      productsData = {
        items: FALLBACK_SECURITY_PRODUCTS,
        pagination: { total: FALLBACK_SECURITY_PRODUCTS.length, page: 1, limit: 12, totalPages: 1 },
      };
    }
    categoriesData = cats?.length > 0 ? cats : FALLBACK_SECURITY_CATEGORIES;

    if (pageRes) {
      if (pageRes.title) heroData.title = pageRes.title;
      const heroSec = pageRes.sections?.find((s: any) => s.key === 'hero');
      if (heroSec?.content) {
        if (heroSec.content.badge) heroData.badge = heroSec.content.badge;
        if (heroSec.content.title) heroData.title = heroSec.content.title;
        if (heroSec.content.subtitle) heroData.subtitle = heroSec.content.subtitle;
        if (heroSec.content.backgroundImage) heroData.backgroundImage = heroSec.content.backgroundImage;
      }
    }
  } catch (err) {
    productsData = {
      items: FALLBACK_SECURITY_PRODUCTS,
      pagination: { total: FALLBACK_SECURITY_PRODUCTS.length, page: 1, limit: 12, totalPages: 1 },
    };
    categoriesData = FALLBACK_SECURITY_CATEGORIES;
  }

  // Filter fallback items locally if search or category param was supplied
  let displayedItems = productsData.items || [];
  if (searchParams.category) {
    displayedItems = displayedItems.filter(
      (p: any) =>
        p.category?.slug === searchParams.category ||
        p.category?.name?.toLowerCase().includes(searchParams.category!.toLowerCase())
    );
  }
  if (searchParams.search) {
    const q = searchParams.search.toLowerCase();
    displayedItems = displayedItems.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }

  const { pagination } = productsData;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12">
      {/* Page Header / Hero Banner */}
      {heroData.backgroundImage ? (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 border border-slate-700/60 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-2xl mb-8 transition-colors">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroData.backgroundImage})` }}
          >
            {/* Dimmed cinematic overlay: keeps image richly visible while ensuring text contrast */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px] bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/30" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-block text-xs font-bold text-sky-200 uppercase tracking-widest bg-sky-500/20 px-3 py-1 rounded-full border border-sky-400/40 backdrop-blur-md">
              {heroData.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {heroData.title}
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed drop-shadow-sm">
              {heroData.subtitle}
            </p>
          </div>
        </div>
      ) : (
        <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-8">
          <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-1.5">
            {heroData.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {heroData.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground max-w-2xl">
            {heroData.subtitle}
          </p>
        </div>
      )}

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
                  placeholder="Camera, doorbell, alarm, nanny..."
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
                  All Security Products ({displayedItems.length})
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
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                Stock Availability
              </label>
              <select
                name="availability"
                defaultValue={searchParams.availability || ''}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
              >
                <option value="">All Items</option>
                <option value="IN_STOCK">In Stock (Nairobi Warehouses)</option>
                <option value="PREORDER">Available on Order</option>
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
                <option value="newest">Newest Security Equipment</option>
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
              Showing {displayedItems.length} security equipment items
            </span>
          </div>

          {displayedItems.length === 0 ? (
            <div className="text-center py-24 border rounded-xl bg-card space-y-4">
              <PackageX className="h-16 w-16 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Security Products Matched Your Criteria</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try clearing your search query or selecting a broader security category.
              </p>
              <Link href="/products">
                <Button variant="outline" size="sm">
                  View Full Security Catalog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedItems.map((prod: any) => (
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
                  currency={prod.currency || 'KES'}
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
