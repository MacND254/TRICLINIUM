import { z } from 'zod';

// ================= AUTH SCHEMAS =================
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z)')
  .regex(/[0-9]/, 'Password must contain at least one digit (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)');

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: passwordSchema.optional(),
  roles: z.array(z.string()).min(1, 'At least one role must be assigned'),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial().omit({ email: true });

// ================= PRODUCT SCHEMAS =================
export const productSpecificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Specification name is required'),
  value: z.string().min(1, 'Specification value is required'),
  group: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1, 'Image URL or path is required'),
  altText: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  sku: z.string().min(2, 'SKU is required'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  fullDescription: z.string().min(20, 'Full description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().nonnegative().optional().nullable(),
  promotionalPrice: z.number().nonnegative().optional().nullable(),
  currency: z.string().default('USD'),
  priceVisible: z.boolean().default(true),
  availability: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'PREORDER', 'MADE_TO_ORDER']).default('IN_STOCK'),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  images: z.array(productImageSchema).default([]),
  features: z.array(z.string()).default([]),
  specifications: z.array(productSpecificationSchema).default([]),
  relatedProductIds: z.array(z.string()).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable().or(z.literal('')),
  parentId: z.string().optional().nullable().or(z.literal('')),
  displayOrder: z.number().int().default(0),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

// ================= SERVICE SCHEMAS =================
export const serviceProcessStepSchema = z.object({
  title: z.string().min(1, 'Step title is required'),
  description: z.string().min(1, 'Step description is required'),
  order: z.number().int().default(0),
});

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  fullDescription: z.string().min(20, 'Full description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  featuredImage: z.string().optional().nullable().or(z.literal('')),
  additionalImages: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  process: z.array(serviceProcessStepSchema).default([]),
  pricingModel: z.enum(['FIXED', 'HOURLY', 'CUSTOM_QUOTE', 'TIERED']).default('CUSTOM_QUOTE'),
  price: z.number().nonnegative().optional().nullable(),
  currency: z.string().default('USD'),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  relatedServiceIds: z.array(z.string()).default([]),
});

export const updateServiceSchema = createServiceSchema.partial();

export const serviceCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
});

// ================= INQUIRY & QUOTATION SCHEMAS =================
export const inquiryItemSchema = z.object({
  productId: z.string().optional().nullable(),
  productName: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().optional().nullable(),
});

export const productInquirySchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  productId: z.string().min(1, 'Product selection is required'),
  quantity: z.number().int().positive().default(1),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
  preferredContact: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
});

export const serviceInquirySchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  serviceId: z.string().min(1, 'Service selection is required'),
  projectDescription: z.string().min(15, 'Please provide project details (min 15 chars)'),
  preferredContact: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
});

export const generalContactSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(15, 'Message must be at least 15 characters long'),
  preferredContact: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
});

export const quotationRequestSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  message: z.string().optional().default(''),
  preferredContact: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
  items: z.array(inquiryItemSchema).min(1, 'Select at least one product for the quotation'),
});

export const adminInquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'AWAITING_CUSTOMER', 'QUOTED', 'CONVERTED', 'CLOSED', 'SPAM']).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().optional().nullable(),
});

export const inquiryNoteSchema = z.object({
  content: z.string().min(2, 'Note content is required'),
});

// ================= CMS SCHEMAS =================
export const heroSlideSchema = z.object({
  headline: z.string().min(2, 'Headline is required'),
  subheadline: z.string().min(5, 'Subheadline is required'),
  imageUrl: z.string().min(1, 'Image URL or path is required'),
  primaryCtaText: z.string().min(1, 'Primary CTA label required'),
  primaryCtaLink: z.string().min(1, 'Primary CTA link required'),
  secondaryCtaText: z.string().optional().nullable(),
  secondaryCtaLink: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3, 'Slug is required'),
  excerpt: z.string().min(10, 'Excerpt is required'),
  content: z.string().min(20, 'Content is required'),
  featuredImage: z.string().optional().nullable().or(z.literal('')),
  categoryId: z.string().optional().nullable().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export const testimonialSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  clientRole: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  clientAvatar: z.string().optional().nullable().or(z.literal('')),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  rating: z.number().int().min(1).max(5).default(5),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  displayOrder: z.number().int().default(0),
});

export const faqSchema = z.object({
  question: z.string().min(5, 'Question is required'),
  answer: z.string().min(10, 'Answer is required'),
  category: z.string().min(2, 'Category is required'),
  displayOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const pageSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  content: z.string().min(10, 'Content is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

// ================= SETTINGS SCHEMA =================
export const websiteSettingsSchema = z.object({
  general: z.object({
    companyName: z.string().min(1),
    logoUrl: z.string().optional().nullable(),
    faviconUrl: z.string().optional().nullable(),
    websiteUrl: z.string().url().or(z.string().min(1)),
    description: z.string().min(1),
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    currency: z.string().default('USD'),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
    businessHours: z.string().min(1),
  }),
  social: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
  }),
  appearance: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
    fontFamily: z.string(),
  }),
  seo: z.object({
    defaultTitle: z.string().min(1),
    defaultDescription: z.string().min(1),
    ogImageUrl: z.string().optional().nullable(),
    robotsTxt: z.string().min(1),
  }),
  email: z.object({
    senderName: z.string().min(1),
    senderEmail: z.string().email(),
    notificationRecipients: z.array(z.string().email()),
  }),
});

// ================= QUERY SCHEMAS =================
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const productFilterQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  availability: z.string().optional(),
  status: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export const serviceFilterQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  status: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

export const inquiryFilterQuerySchema = paginationQuerySchema.extend({
  type: z.string().optional(),
  status: z.string().optional(),
  urgency: z.string().optional(),
  assignedTo: z.string().optional(),
});
