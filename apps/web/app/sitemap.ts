import { MetadataRoute } from 'next';
import { fetchApi } from '@/lib/api-client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://triclinium.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/testimonials`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  try {
    const [products, services, posts] = await Promise.all([
      fetchApi('/products?limit=100'),
      fetchApi('/services?limit=100'),
      fetchApi('/blog?limit=100'),
    ]);

    const productUrls: MetadataRoute.Sitemap = (products.items || []).map((p: any) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const serviceUrls: MetadataRoute.Sitemap = (services.items || []).map((s: any) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: new Date(s.updatedAt || s.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const postUrls: MetadataRoute.Sitemap = (posts.items || []).map((b: any) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: new Date(b.updatedAt || b.publishedAt || b.createdAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...productUrls, ...serviceUrls, ...postUrls];
  } catch (e) {
    return staticRoutes;
  }
}
