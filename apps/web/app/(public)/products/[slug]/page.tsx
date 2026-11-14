import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { ProductDetailClient } from './product-detail-client';
import { ProductCard } from '@/components/public/product-card';
import { fetchApi } from '@/lib/api-client';

export const revalidate = 60;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    const product = await fetchApi(`/products/${params.slug}`);
    return {
      title: product.seoTitle || `${product.name} | TRICLINIUM`,
      description: product.seoDescription || product.shortDescription,
      openGraph: {
        title: product.name,
        description: product.shortDescription,
        images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch (e) {
    return {
      title: 'Product Specifications | TRICLINIUM',
    };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  let product: any = null;

  try {
    product = await fetchApi(`/products/${params.slug}`);
  } catch (err) {
    // If during dev/build backend is unreachable, check fallback
    if (params.slug === 'titan-pivot-hinge-750') {
      product = {
        id: 'prod-seed-1',
        name: 'Titan-Forged Pivot Hinge 750',
        slug: 'titan-pivot-hinge-750',
        sku: 'TRIC-HW-750',
        shortDescription: 'Industrial-grade architectural pivot hinge engineered for doors up to 750kg.',
        fullDescription: 'The Titan-Forged 750 is machined from solid 316 marine-grade stainless steel with sealed dual needle-thrust bearings. Designed for monumental entrances and extreme environmental exposure, delivering effortless rotation with zero maintenance.',
        category: { name: 'Architectural Hardware', slug: 'architectural-hardware' },
        price: 1250.0,
        promotionalPrice: 1120.0,
        currency: 'USD',
        priceVisible: true,
        availability: 'IN_STOCK',
        features: [
          'Machined from forged 316-L marine-grade stainless steel',
          'Maximum door leaf capacity up to 750 kg (1,650 lbs)',
          'Integrated 3D micro-adjustment mechanism (X, Y, Z axes)',
          'Tested to over 1,000,000 continuous operating cycles',
        ],
        specifications: [
          { name: 'Load Capacity', value: '750 kg', group: 'Mechanical', order: 0 },
          { name: 'Material', value: 'AISI 316 Stainless Steel', group: 'Materials', order: 1 },
          { name: 'Rotation Range', value: '360° Free Swing with 90° hold-open', group: 'Operation', order: 2 },
          { name: 'Compliance', value: 'EN 1154 / ANSI Grade 1', group: 'Standards', order: 3 },
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80' },
          { url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80' },
        ],
        relatedProducts: [],
      };
    } else {
      notFound();
    }
  }

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Hero & Actions */}
      <ProductDetailClient product={product} />

      {/* Full Description & Engineering Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t">
        {/* Full Prose Description */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Detailed Engineering Description
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
              <div className="p-4 text-xs text-muted-foreground">Contact engineering for full dimensional drawings.</div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="pt-12 border-t space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Related Hardware & Complementary Assemblies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.relatedProducts.map((rel: any) => (
              <ProductCard
                key={rel.id}
                id={rel.id}
                name={rel.name}
                slug={rel.slug}
                sku={rel.sku}
                shortDescription={rel.shortDescription}
                price={rel.price}
                imageUrl={rel.images?.[0]?.url}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
