import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/client';
import { cache, CACHE_KEYS, invalidateCmsCaches } from '../../integrations/redis';
import { logAudit } from '../../middleware/audit';
import {
  heroSlideSchema,
  blogPostSchema,
  testimonialSchema,
  faqSchema,
  pageSchema,
} from '@triclinium/validation';
import { slugify } from '@triclinium/shared';

export class CmsController {
  // ================= PUBLIC METHODS =================

  // GET /homepage (Aggregates hero slides, featured sections, statistics, latest blog posts, testimonials)
  static async getPublicHomepage(req: Request, res: Response, next: NextFunction) {
    try {
      const cached = await cache.get(CACHE_KEYS.HOMEPAGE);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const [heroSlides, sections, testimonials, latestPosts, featuredProducts, featuredServices] = await Promise.all([
        prisma.pageSection.findMany({
          where: { key: 'hero_slide', isEnabled: true },
          orderBy: { displayOrder: 'asc' },
        }),
        prisma.pageSection.findMany({
          where: { key: { not: 'hero_slide' }, isEnabled: true },
          orderBy: { displayOrder: 'asc' },
        }),
        prisma.testimonial.findMany({
          where: { status: 'PUBLISHED', isFeatured: true },
          orderBy: { displayOrder: 'asc' },
          take: 6,
        }),
        prisma.blogPost.findMany({
          where: { status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          take: 3,
          include: { category: true },
        }),
        prisma.product.findMany({
          where: { status: 'PUBLISHED', isFeatured: true, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: {
            category: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        }),
        prisma.service.findMany({
          where: { status: 'PUBLISHED', isFeatured: true, deletedAt: null },
          orderBy: { displayOrder: 'asc' },
          take: 4,
          include: { category: true },
        }),
      ]);

      const formatted = {
        heroSlides: heroSlides.map((s) => ({
          id: s.id,
          ...(s.content as any),
        })),
        sections: sections.reduce((acc: any, sec) => {
          acc[sec.key] = {
            id: sec.id,
            title: sec.title,
            ...(sec.content as any),
          };
          return acc;
        }, {}),
        testimonials,
        latestPosts,
        featuredProducts: featuredProducts.map((p) => ({
          ...p,
          price: p.price ? Number(p.price) : null,
          promotionalPrice: p.promotionalPrice ? Number(p.promotionalPrice) : null,
        })),
        featuredServices: featuredServices.map((s) => ({
          ...s,
          price: s.price ? Number(s.price) : null,
        })),
      };

      await cache.set(CACHE_KEYS.HOMEPAGE, formatted, 600);
      return res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }

  // GET /pages/:slug
  static async getPublicPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const cacheKey = CACHE_KEYS.PAGE(slug);

      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const page = await prisma.page.findFirst({
        where: { slug, status: 'PUBLISHED' },
        include: {
          sections: {
            where: { isEnabled: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!page) {
        return res.status(404).json({ success: false, error: { message: 'Page not found' } });
      }

      await cache.set(cacheKey, page, 600);
      return res.json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  // GET /blog
  static async getPublicBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 9;
      const categorySlug = req.query.category as string;
      const tag = req.query.tag as string;

      const where: any = { status: 'PUBLISHED' };

      if (categorySlug) {
        where.category = { slug: categorySlug };
      }
      if (tag) {
        where.tags = { some: { tag: { slug: tag } } };
      }

      const [total, posts, categories] = await Promise.all([
        prisma.blogPost.count({ where }),
        prisma.blogPost.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { publishedAt: 'desc' },
          include: {
            category: true,
            tags: { include: { tag: true } },
          },
        }),
        prisma.blogCategory.findMany({
          include: {
            _count: { select: { posts: { where: { status: 'PUBLISHED' } } } },
          },
        }),
      ]);

      const formattedPosts = posts.map((p) => ({
        ...p,
        tags: p.tags.map((t) => t.tag.name),
      }));

      return res.json({
        success: true,
        data: {
          items: formattedPosts,
          categories: categories.map((c) => ({
            ...c,
            postCount: c._count.posts,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /blog/:slug
  static async getPublicBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const cacheKey = CACHE_KEYS.BLOG_POST(slug);

      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const post = await prisma.blogPost.findFirst({
        where: { slug, status: 'PUBLISHED' },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });

      if (!post) {
        return res.status(404).json({ success: false, error: { message: 'Post not found' } });
      }

      const formatted = {
        ...post,
        tags: post.tags.map((t) => t.tag.name),
      };

      await cache.set(cacheKey, formatted, 600);
      return res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }

  // GET /faqs
  static async getPublicFaqs(req: Request, res: Response, next: NextFunction) {
    try {
      const cached = await cache.get(CACHE_KEYS.FAQS);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const faqs = await prisma.faq.findMany({
        where: { isPublished: true },
        orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
      });

      await cache.set(CACHE_KEYS.FAQS, faqs, 1800);
      return res.json({ success: true, data: faqs });
    } catch (err) {
      next(err);
    }
  }

  // GET /testimonials
  static async getPublicTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const cached = await cache.get(CACHE_KEYS.TESTIMONIALS);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const testimonials = await prisma.testimonial.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { displayOrder: 'asc' },
      });

      await cache.set(CACHE_KEYS.TESTIMONIALS, testimonials, 1800);
      return res.json({ success: true, data: testimonials });
    } catch (err) {
      next(err);
    }
  }

  // ================= ADMIN CMS METHODS =================

  // GET /admin/pages
  static async getAdminPages(req: Request, res: Response, next: NextFunction) {
    try {
      const pages = await prisma.page.findMany({
        orderBy: { updatedAt: 'desc' },
      });
      return res.json({ success: true, data: pages });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/pages
  static async createPage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = pageSchema.parse(req.body);
      const slug = slugify(data.slug);

      const page = await prisma.page.create({
        data: {
          title: data.title,
          slug,
          content: data.content,
          status: data.status,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        },
      });

      await invalidateCmsCaches(page.slug);
      await logAudit({ req, action: 'PAGE_CREATED', entityType: 'Page', entityId: page.id });

      return res.status(201).json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /admin/pages/:id
  static async updatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = pageSchema.partial().parse(req.body);
      const slug = data.slug ? slugify(data.slug) : undefined;

      const page = await prisma.page.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(slug && { slug }),
          ...(data.content && { content: data.content }),
          ...(data.status && {
            status: data.status,
            publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
          }),
          ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
          ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
        },
      });

      await invalidateCmsCaches(page.slug);
      await logAudit({ req, action: 'PAGE_UPDATED', entityType: 'Page', entityId: id });

      return res.json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/blog
  static async getAdminBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: true, tags: { include: { tag: true } } },
      });
      const formatted = posts.map((p) => ({
        ...p,
        category: p.category?.name || 'General',
        coverImageUrl: p.featuredImage || '',
        tags: p.tags.map((t) => t.tag.name),
      }));
      return res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/blog
  static async createBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      if (body.coverImageUrl && !body.featuredImage) {
        body.featuredImage = body.coverImageUrl;
      }
      if (body.category && !body.categoryId) {
        const catName = String(body.category).trim();
        const catSlug = slugify(catName);
        let cat = await prisma.blogCategory.findFirst({ where: { slug: catSlug } });
        if (!cat) {
          cat = await prisma.blogCategory.create({ data: { name: catName, slug: catSlug } });
        }
        body.categoryId = cat.id;
      }

      const data = blogPostSchema.parse(body);
      const slug = slugify(data.slug);

      const post = await prisma.blogPost.create({
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: data.featuredImage || null,
          categoryId: data.categoryId || null,
          status: data.status,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        },
      });

      await invalidateCmsCaches(undefined, post.slug);
      await logAudit({ req, action: 'BLOG_POST_CREATED', entityType: 'BlogPost', entityId: post.id });

      return res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /admin/blog/:id
  static async updateBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = { ...req.body };
      if (body.coverImageUrl !== undefined && !body.featuredImage) {
        body.featuredImage = body.coverImageUrl;
      }
      if (body.category && !body.categoryId) {
        const catName = String(body.category).trim();
        const catSlug = slugify(catName);
        let cat = await prisma.blogCategory.findFirst({ where: { slug: catSlug } });
        if (!cat) {
          cat = await prisma.blogCategory.create({ data: { name: catName, slug: catSlug } });
        }
        body.categoryId = cat.id;
      }

      const data = blogPostSchema.partial().parse(body);
      const slug = data.slug ? slugify(data.slug) : undefined;

      const post = await prisma.blogPost.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(slug && { slug }),
          ...(data.excerpt && { excerpt: data.excerpt }),
          ...(data.content && { content: data.content }),
          ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage || null }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
          ...(data.status && {
            status: data.status,
            publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
          }),
          ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
          ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
        },
      });

      await invalidateCmsCaches(undefined, post.slug);
      await logAudit({ req, action: 'BLOG_POST_UPDATED', entityType: 'BlogPost', entityId: id });

      return res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /admin/blog/:id
  static async deleteBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await prisma.blogPost.findUnique({ where: { id } });
      if (post) {
        await prisma.blogPost.delete({ where: { id } });
        await invalidateCmsCaches(undefined, post.slug);
        await logAudit({ req, action: 'BLOG_POST_DELETED', entityType: 'BlogPost', entityId: id });
      }
      return res.json({ success: true, message: 'Article deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // FAQs CRUD
  static async getAdminFaqs(req: Request, res: Response, next: NextFunction) {
    try {
      const faqs = await prisma.faq.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
      const formatted = faqs.map((f) => ({
        ...f,
        sortOrder: f.displayOrder,
      }));
      return res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }

  static async createFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      if (body.sortOrder !== undefined && body.displayOrder === undefined) {
        body.displayOrder = body.sortOrder;
      }
      delete body.sortOrder;
      const data = faqSchema.parse(body);
      const faq = await prisma.faq.create({ data });
      await cache.del(CACHE_KEYS.FAQS);
      await logAudit({ req, action: 'FAQ_CREATED', entityType: 'Faq', entityId: faq.id });
      return res.status(201).json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  static async updateFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = { ...req.body };
      if (body.sortOrder !== undefined && body.displayOrder === undefined) {
        body.displayOrder = body.sortOrder;
      }
      delete body.sortOrder;
      const data = faqSchema.partial().parse(body);
      const faq = await prisma.faq.update({ where: { id }, data });
      await cache.del(CACHE_KEYS.FAQS);
      await logAudit({ req, action: 'FAQ_UPDATED', entityType: 'Faq', entityId: id });
      return res.json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  static async deleteFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.faq.delete({ where: { id } });
      await cache.del(CACHE_KEYS.FAQS);
      await logAudit({ req, action: 'FAQ_DELETED', entityType: 'Faq', entityId: id });
      return res.json({ success: true, message: 'FAQ deleted' });
    } catch (err) {
      next(err);
    }
  }

  // Testimonials CRUD
  static async createTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const data = testimonialSchema.parse(req.body);
      const testimonial = await prisma.testimonial.create({ data });
      await cache.del([CACHE_KEYS.TESTIMONIALS, CACHE_KEYS.HOMEPAGE]);
      return res.status(201).json({ success: true, data: testimonial });
    } catch (err) {
      next(err);
    }
  }

  static async updateTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = testimonialSchema.partial().parse(req.body);
      const testimonial = await prisma.testimonial.update({ where: { id }, data });
      await cache.del([CACHE_KEYS.TESTIMONIALS, CACHE_KEYS.HOMEPAGE]);
      return res.json({ success: true, data: testimonial });
    } catch (err) {
      next(err);
    }
  }

  static async deleteTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.testimonial.delete({ where: { id } });
      await cache.del([CACHE_KEYS.TESTIMONIALS, CACHE_KEYS.HOMEPAGE]);
      return res.json({ success: true, message: 'Testimonial deleted' });
    } catch (err) {
      next(err);
    }
  }

  // Homepage Sections & Hero Slides Management
  static async getAdminHomepageSections(req: Request, res: Response, next: NextFunction) {
    try {
      const [heroSlides, dbSections] = await Promise.all([
        prisma.pageSection.findMany({
          where: { key: 'hero_slide' },
          orderBy: { displayOrder: 'asc' },
        }),
        prisma.pageSection.findMany({
          where: { key: { not: 'hero_slide' } },
          orderBy: { displayOrder: 'asc' },
        }),
      ]);

      const heroSection = {
        id: 'hero-main',
        key: 'hero',
        title: 'Hero Section & Slides',
        content: {
          slides: heroSlides.map((s) => ({
            id: s.id,
            headline: (s.content as any)?.headline || '',
            subheadline: (s.content as any)?.subheadline || '',
            description: (s.content as any)?.description || '',
            imageUrl: (s.content as any)?.imageUrl || '',
            primaryCTA: {
              label: (s.content as any)?.primaryCtaText || 'Explore Products',
              href: (s.content as any)?.primaryCtaLink || '/products',
            },
            secondaryCTA: {
              label: (s.content as any)?.secondaryCtaText || 'Request Quote',
              href: (s.content as any)?.secondaryCtaLink || '/contact',
            },
            isActive: s.isEnabled,
          })),
        },
        isEnabled: heroSlides.some((s) => s.isEnabled),
        sortOrder: 0,
      };

      const sectionMap: Record<string, any> = {};
      dbSections.forEach((s) => {
        sectionMap[s.key] = s;
      });

      const sectionsList = [
        heroSection,
        {
          id: sectionMap['why_us']?.id || 'why_us',
          key: 'why_choose_us',
          title: sectionMap['why_us']?.title || 'Why Choose Us / Value Proposition',
          content: {
            items: (sectionMap['why_us']?.content as any)?.pillars || [
              { icon: 'ShieldCheck', title: 'Certified Security Experts', description: 'Experienced technicians with deep expertise in camera placement and secure networks.' },
              { icon: 'Cpu', title: 'AI-Powered Motion Analytics', description: 'Advanced smart analytics distinguish humans and vehicles from pets.' },
              { icon: 'FileText', title: 'Free Site Surveys & Quotes', description: 'Transparent itemized quotations with equipment guarantees.' },
            ],
          },
          isEnabled: sectionMap['why_us']?.isEnabled ?? true,
          sortOrder: 1,
        },
        {
          id: 'featured_products',
          key: 'featured_products',
          title: 'Featured Products Grid',
          content: {},
          isEnabled: true,
          sortOrder: 2,
        },
        {
          id: 'featured_services',
          key: 'featured_services',
          title: 'Featured Services Grid',
          content: {},
          isEnabled: true,
          sortOrder: 3,
        },
        {
          id: sectionMap['stats']?.id || 'stats',
          key: 'stats',
          title: sectionMap['stats']?.title || 'Key Statistics / Metrics Counter',
          content: {
            items: (sectionMap['stats']?.content as any)?.stats?.map((st: any) => ({
              value: st.value?.replace(/[^0-9.]/g, '') || '500',
              label: st.label,
              suffix: st.value?.includes('+') ? '+' : st.value?.includes('%') ? '%' : st.value?.includes('s') ? 's' : '',
            })) || [
              { value: '2500', label: 'Cameras & Sensors Installed', suffix: '+' },
              { value: '99.98', label: 'System Uptime Reliability', suffix: '%' },
              { value: '15', label: 'Emergency Alert Speed', suffix: 's' },
              { value: '1', label: 'Certified Equipment Warranty', suffix: '-Year' },
            ],
          },
          isEnabled: sectionMap['stats']?.isEnabled ?? true,
          sortOrder: 4,
        },
        {
          id: sectionMap['about_preview']?.id || 'about_preview',
          key: 'about_preview',
          title: 'About Preview & Teaser',
          content: (sectionMap['about_preview']?.content as any) || {
            headline: 'Protecting Homes, Businesses & Critical Infrastructure',
            description: 'TRICLINIUM is a dedicated provider of advanced CCTV surveillance systems and smart intruder alarm solutions across Kenya.',
            imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
            ctaLabel: 'Read Our Full Story',
            ctaHref: '/about',
          },
          isEnabled: sectionMap['about_preview']?.isEnabled ?? true,
          sortOrder: 5,
        },
        {
          id: sectionMap['cta']?.id || 'cta',
          key: 'cta',
          title: 'Call to Action',
          content: (sectionMap['cta']?.content as any) || {
            headline: 'Ready to Upgrade Your Property Security?',
            description: 'Schedule a free on-site survey or speak with our certified security engineers in Nairobi today.',
            primaryLabel: 'Get Free Security Quote',
            primaryHref: '/contact',
            secondaryLabel: 'Browse All Products',
            secondaryHref: '/products',
          },
          isEnabled: sectionMap['cta']?.isEnabled ?? true,
          sortOrder: 6,
        },
      ];

      return res.json({ success: true, data: sectionsList });
    } catch (err) {
      next(err);
    }
  }

  static async updateHomepageSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const { title, content, isEnabled, displayOrder } = req.body;

      const page = await prisma.page.upsert({
        where: { slug: 'home' },
        update: {},
        create: {
          title: 'Homepage',
          slug: 'home',
          content: 'TRICLINIUM Dynamic Homepage',
        },
      });

      // Synchronize Hero Slides when 'hero' section is updated
      if (key === 'hero' && content && Array.isArray(content.slides)) {
        const slides = content.slides;
        for (let i = 0; i < slides.length; i++) {
          const s = slides[i];
          if (s.imageUrl && typeof s.imageUrl === 'string' && s.imageUrl.startsWith('data:')) {
            try {
              const matches = s.imageUrl.match(/^data:([a-zA-Z0-9\/+.-]+);base64,(.+)$/);
              if (matches) {
                const mimeType = matches[1];
                const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
                const filename = `${Date.now()}-hero-slide-${i + 1}-${Math.random().toString(36).substring(7)}${ext}`;
                await prisma.mediaAsset.create({
                  data: {
                    filename,
                    originalName: `hero-slide-${i + 1}${ext}`,
                    url: s.imageUrl,
                    mimeType,
                    size: Buffer.byteLength(matches[2], 'base64'),
                    provider: 'local',
                  },
                });
                s.imageUrl = `/api/v1/media/file/${filename}`;
              }
            } catch (e) {
              console.warn('[Auto-extract hero slide base64 failed]:', e);
            }
          }
        }

        await prisma.pageSection.deleteMany({ where: { key: 'hero_slide' } });
        for (let i = 0; i < slides.length; i++) {
          const s = slides[i];
          await prisma.pageSection.create({
            data: {
              pageId: page.id,
              key: 'hero_slide',
              title: s.headline ? `Hero: ${s.headline.slice(0, 30)}` : `Slide ${i + 1}`,
              displayOrder: i + 1,
              isEnabled: s.isActive !== false,
              content: {
                headline: s.headline || '',
                subheadline: s.subheadline || '',
                description: s.description || '',
                imageUrl: s.imageUrl || '',
                primaryCtaText: s.primaryCTA?.label || s.primaryCtaText || 'Explore Products',
                primaryCtaLink: s.primaryCTA?.href || s.primaryCtaLink || '/products',
                secondaryCtaText: s.secondaryCTA?.label || s.secondaryCtaText || 'Request Quote',
                secondaryCtaLink: s.secondaryCTA?.href || s.secondaryCtaLink || '/contact',
              },
            },
          });
        }
      }

      // Synchronize stats section format
      if (key === 'stats' && content && Array.isArray(content.items)) {
        const formattedStats = content.items.map((it: any) => ({
          label: it.label,
          value: `${it.value || ''}${it.suffix || ''}`,
        }));
        content.stats = formattedStats;
      }

      // Synchronize why_choose_us section format
      if ((key === 'why_choose_us' || key === 'why_us') && content && Array.isArray(content.items)) {
        content.pillars = content.items;
      }

      const targetKey = key === 'why_choose_us' ? 'why_us' : key;
      const existingSection = await prisma.pageSection.findFirst({
        where: { pageId: page.id, key: targetKey },
      });

      let section;
      if (existingSection) {
        section = await prisma.pageSection.update({
          where: { id: existingSection.id },
          data: {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(isEnabled !== undefined && { isEnabled }),
            ...(displayOrder !== undefined && { displayOrder }),
          },
        });
      } else {
        section = await prisma.pageSection.create({
          data: {
            pageId: page.id,
            key: targetKey,
            title: title || key,
            content: content || {},
            isEnabled: isEnabled !== undefined ? isEnabled : true,
            displayOrder: displayOrder !== undefined ? displayOrder : 0,
          },
        });
      }

      await cache.del(CACHE_KEYS.HOMEPAGE);
      await logAudit({ req, action: 'HOMEPAGE_SECTION_UPDATED', entityType: 'PageSection', entityId: section.id });

      return res.json({ success: true, data: section, message: 'Homepage section updated successfully' });
    } catch (err) {
      next(err);
    }
  }
}
