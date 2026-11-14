import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole, requirePermission } from '../../middleware/rbac';
import { PERMISSIONS } from '@triclinium/shared';

export const productsRouter = Router();

// ================= PUBLIC ROUTES =================
productsRouter.get('/products', ProductsController.getPublicProducts);
productsRouter.get('/products/:slug', ProductsController.getPublicProductBySlug);
productsRouter.get('/product-categories', ProductsController.getPublicCategories);

// ================= ADMIN PRODUCT ROUTES =================
productsRouter.get(
  '/admin/products',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_VIEW),
  ProductsController.getAdminProducts
);

productsRouter.get(
  '/admin/products/:id',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_VIEW),
  ProductsController.getAdminProductById
);

productsRouter.post(
  '/admin/products',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_CREATE),
  ProductsController.createProduct
);

productsRouter.patch(
  '/admin/products/:id',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_EDIT),
  ProductsController.updateProduct
);

productsRouter.delete(
  '/admin/products/:id',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_DELETE),
  ProductsController.deleteProduct
);

// ================= ADMIN CATEGORY ROUTES =================
productsRouter.post(
  '/admin/product-categories',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_CREATE),
  ProductsController.createCategory
);

productsRouter.patch(
  '/admin/product-categories/:id',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_EDIT),
  ProductsController.updateCategory
);

productsRouter.delete(
  '/admin/product-categories/:id',
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_DELETE),
  ProductsController.deleteCategory
);
