import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/client';
import { cache, CACHE_KEYS, invalidateProductCaches } from '../../integrations/redis';
import { logAudit } from '../../middleware/audit';
import {
  createProductSchema,
  updateProductSchema,
  productCategorySchema,
  productFilterQuerySchema,
} from '@triclinium/validation';
import { slugify } from '@triclinium/shared';

export class ProductsController {
  // ================= PUBLIC METHODS =================

  // GET /products
  static async getPublicProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productFilterQuerySchema.parse(req.query);
      const cacheKey = `${CACHE_KEYS.PRODUCT_LIST}:${JSON.stringify(query)}`;

      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const where: any = {
        status: 'PUBLISHED',
        deletedAt: null,
      };

      if (query.category) {
        where.category = {
          OR: [{ slug: query.category }, { id: query.category }],
        };
      }

      if (query.availability) {
        where.availability = query.availability;
      }

      if (query.featured !== undefined) {
        where.isFeatured = query.featured;
      }

      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        where.price = {};
        if (query.minPrice !== undefined) where.price.gte = query.minPrice;
        if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
      }

      if (query.search) {
        const searchPattern = query.search.trim();
        where.OR = [
          { name: { contains: searchPattern, mode: 'insensitive' } },
          { shortDescription: { contains: searchPattern, mode: 'insensitive' } },
          { sku: { contains: searchPattern, mode: 'insensitive' } },
        ];
      }

      let orderBy: any = { createdAt: 'desc' };
      if (query.sort === 'price') {
        orderBy = { price: query.order || 'asc' };
      } else if (query.sort === 'name') {
        orderBy = { name: query.order || 'asc' };
      }

      const page = query.page || 1;
      const limit = query.limit || 12;
      const skip = (page - 1) * limit;

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: true,
            images: { orderBy: { displayOrder: 'asc' } },
            features: { orderBy: { displayOrder: 'asc' } },
            specifications: { orderBy: { displayOrder: 'asc' } },
          },
        }),
      ]);

      const formatted = products.map((p) => ({
        ...p,
        price: p.price ? Number(p.price) : null,
        promotionalPrice: p.promotionalPrice ? Number(p.promotionalPrice) : null,
        features: p.features.map((f) => f.featureText),
      }));

      const responseData = {
        items: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      await cache.set(cacheKey, responseData, 300); // 5 mins cache
      return res.json({ success: true, data: responseData });
    } catch (err) {
      next(err);
    }
  }

  // GET /products/:slug
  static async getPublicProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const cacheKey = CACHE_KEYS.PRODUCT_DETAIL(slug);

      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const product = await prisma.product.findFirst({
        where: {
          slug,
          status: 'PUBLISHED',
          deletedAt: null,
        },
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          features: { orderBy: { displayOrder: 'asc' } },
          specifications: { orderBy: { displayOrder: 'asc' } },
          relatedFrom: {
            include: {
              relatedProduct: {
                include: {
                  category: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
        });
      }

      const formatted = {
        ...product,
        price: product.price ? Number(product.price) : null,
        promotionalPrice: product.promotionalPrice ? Number(product.promotionalPrice) : null,
        features: product.features.map((f) => f.featureText),
        relatedProducts: product.relatedFrom.map((rel) => ({
          ...rel.relatedProduct,
          price: rel.relatedProduct.price ? Number(rel.relatedProduct.price) : null,
          promotionalPrice: rel.relatedProduct.promotionalPrice ? Number(rel.relatedProduct.promotionalPrice) : null,
        })),
      };

      await cache.set(cacheKey, formatted, 600); // 10 mins cache
      return res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }

  // GET /product-categories
  static async getPublicCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const cached = await cache.get(CACHE_KEYS.PRODUCT_CATEGORIES);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const categories = await prisma.productCategory.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { products: { where: { status: 'PUBLISHED', deletedAt: null } } },
          },
          children: {
            include: {
              _count: {
                select: { products: { where: { status: 'PUBLISHED', deletedAt: null } } },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      // Filter to root categories
      const rootCategories = categories
        .filter((c) => !c.parentId)
        .map((c) => ({
          ...c,
          productCount: c._count.products,
          children: c.children.map((child) => ({
            ...child,
            productCount: child._count.products,
          })),
        }));

      await cache.set(CACHE_KEYS.PRODUCT_CATEGORIES, rootCategories, 1800);
      return res.json({ success: true, data: rootCategories });
    } catch (err) {
      next(err);
    }
  }

  // ================= ADMIN METHODS =================

  // GET /admin/products
  static async getAdminProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';
      const status = req.query.status as any;
      const categoryId = req.query.categoryId as string;

      const where: any = {
        deletedAt: null,
      };

      if (status) where.status = status;
      if (categoryId) where.categoryId = categoryId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            category: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          items: products.map((p) => ({
            ...p,
            price: p.price ? Number(p.price) : null,
            promotionalPrice: p.promotionalPrice ? Number(p.promotionalPrice) : null,
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

  // GET /admin/products/:id
  static async getAdminProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          features: { orderBy: { displayOrder: 'asc' } },
          specifications: { orderBy: { displayOrder: 'asc' } },
          relatedFrom: { select: { relatedProductId: true } },
        },
      });

      if (!product) {
        return res.status(404).json({ success: false, error: { message: 'Product not found' } });
      }

      return res.json({
        success: true,
        data: {
          ...product,
          price: product.price ? Number(product.price) : null,
          promotionalPrice: product.promotionalPrice ? Number(product.promotionalPrice) : null,
          features: product.features.map((f) => f.featureText),
          relatedProductIds: product.relatedFrom.map((r) => r.relatedProductId),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/products
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductSchema.parse(req.body);
      const slug = data.slug ? slugify(data.slug) : slugify(data.name);

      const created = await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: data.name,
            slug,
            sku: data.sku,
            shortDescription: data.shortDescription,
            fullDescription: data.fullDescription,
            categoryId: data.categoryId,
            price: data.price !== null && data.price !== undefined ? data.price : null,
            promotionalPrice: data.promotionalPrice !== null && data.promotionalPrice !== undefined ? data.promotionalPrice : null,
            currency: data.currency,
            priceVisible: data.priceVisible,
            availability: data.availability,
            isFeatured: data.isFeatured,
            status: data.status,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            images: {
              create: data.images.map((img, idx) => ({
                url: img.url,
                altText: img.altText,
                isPrimary: img.isPrimary ?? idx === 0,
                displayOrder: img.displayOrder ?? idx,
              })),
            },
            features: {
              create: data.features.map((feat, idx) => ({
                featureText: feat,
                displayOrder: idx,
              })),
            },
            specifications: {
              create: data.specifications.map((spec, idx) => ({
                name: spec.name,
                value: spec.value,
                group: spec.group,
                displayOrder: spec.order ?? idx,
              })),
            },
          },
        });

        if (data.relatedProductIds && data.relatedProductIds.length > 0) {
          await tx.productRelated.createMany({
            data: data.relatedProductIds.map((relId) => ({
              productId: product.id,
              relatedProductId: relId,
            })),
          });
        }

        return product;
      });

      await invalidateProductCaches(created.slug);

      await logAudit({
        req,
        action: 'PRODUCT_CREATED',
        entityType: 'Product',
        entityId: created.id,
        details: { name: created.name, sku: created.sku },
      });

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Product created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /admin/products/:id
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateProductSchema.parse(req.body);

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: { message: 'Product not found' } });
      }

      const slug = data.slug ? slugify(data.slug) : undefined;

      const updated = await prisma.$transaction(async (tx) => {
        // Update product scalars
        const prod = await tx.product.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(slug && { slug }),
            ...(data.sku && { sku: data.sku }),
            ...(data.shortDescription && { shortDescription: data.shortDescription }),
            ...(data.fullDescription && { fullDescription: data.fullDescription }),
            ...(data.categoryId && { categoryId: data.categoryId }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.promotionalPrice !== undefined && { promotionalPrice: data.promotionalPrice }),
            ...(data.currency && { currency: data.currency }),
            ...(data.priceVisible !== undefined && { priceVisible: data.priceVisible }),
            ...(data.availability && { availability: data.availability }),
            ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
            ...(data.status && { status: data.status }),
            ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
            ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
          },
        });

        // Replace images if provided
        if (data.images) {
          await tx.productImage.deleteMany({ where: { productId: id } });
          if (data.images.length > 0) {
            await tx.productImage.createMany({
              data: data.images.map((img, idx) => ({
                productId: id,
                url: img.url,
                altText: img.altText,
                isPrimary: img.isPrimary ?? idx === 0,
                displayOrder: img.displayOrder ?? idx,
              })),
            });
          }
        }

        // Replace features if provided
        if (data.features) {
          await tx.productFeature.deleteMany({ where: { productId: id } });
          if (data.features.length > 0) {
            await tx.productFeature.createMany({
              data: data.features.map((feat, idx) => ({
                productId: id,
                featureText: feat,
                displayOrder: idx,
              })),
            });
          }
        }

        // Replace specifications if provided
        if (data.specifications) {
          await tx.productSpecification.deleteMany({ where: { productId: id } });
          if (data.specifications.length > 0) {
            await tx.productSpecification.createMany({
              data: data.specifications.map((spec, idx) => ({
                productId: id,
                name: spec.name,
                value: spec.value,
                group: spec.group,
                displayOrder: spec.order ?? idx,
              })),
            });
          }
        }

        // Replace related products if provided
        if (data.relatedProductIds) {
          await tx.productRelated.deleteMany({ where: { productId: id } });
          if (data.relatedProductIds.length > 0) {
            await tx.productRelated.createMany({
              data: data.relatedProductIds.map((relId) => ({
                productId: id,
                relatedProductId: relId,
              })),
            });
          }
        }

        return prod;
      });

      await invalidateProductCaches(existing.slug);
      if (slug && slug !== existing.slug) {
        await invalidateProductCaches(slug);
      }

      await logAudit({
        req,
        action: 'PRODUCT_UPDATED',
        entityType: 'Product',
        entityId: id,
        details: { name: updated.name },
      });

      return res.json({
        success: true,
        data: updated,
        message: 'Product updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /admin/products/:id
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({ where: { id } });

      if (!product) {
        return res.status(404).json({ success: false, error: { message: 'Product not found' } });
      }

      // Soft delete: set deletedAt
      await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'ARCHIVED' },
      });

      await invalidateProductCaches(product.slug);

      await logAudit({
        req,
        action: 'PRODUCT_ARCHIVED',
        entityType: 'Product',
        entityId: id,
        details: { name: product.name },
      });

      return res.json({
        success: true,
        message: 'Product archived successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // ================= CATEGORY MANAGEMENT =================

  // POST /admin/product-categories
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = productCategorySchema.parse(req.body);
      const slug = slugify(data.slug || data.name);

      const category = await prisma.productCategory.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          imageUrl: data.imageUrl || null,
          parentId: data.parentId || null,
          displayOrder: data.displayOrder,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
        },
      });

      await cache.del(CACHE_KEYS.PRODUCT_CATEGORIES);

      await logAudit({
        req,
        action: 'PRODUCT_CATEGORY_CREATED',
        entityType: 'ProductCategory',
        entityId: category.id,
      });

      return res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /admin/product-categories/:id
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = productCategorySchema.partial().parse(req.body);
      const slug = data.slug ? slugify(data.slug) : undefined;

      const category = await prisma.productCategory.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(slug && { slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
          ...(data.parentId !== undefined && { parentId: data.parentId || null }),
          ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
          ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
          ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
        },
      });

      await cache.del(CACHE_KEYS.PRODUCT_CATEGORIES);

      return res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /admin/product-categories/:id
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Protection: Check if any active products belong to this category
      const productCount = await prisma.product.count({
        where: { categoryId: id, deletedAt: null },
      });

      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_EMPTY',
            message: `Cannot delete category: contains ${productCount} assigned active product(s). Please reassign or archive them first.`,
          },
        });
      }

      await prisma.productCategory.delete({ where: { id } });
      await cache.del(CACHE_KEYS.PRODUCT_CATEGORIES);

      await logAudit({
        req,
        action: 'PRODUCT_CATEGORY_DELETED',
        entityType: 'ProductCategory',
        entityId: id,
      });

      return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
