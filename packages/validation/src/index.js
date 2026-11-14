"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inquiryFilterQuerySchema = exports.serviceFilterQuerySchema = exports.productFilterQuerySchema = exports.paginationQuerySchema = exports.websiteSettingsSchema = exports.pageSchema = exports.faqSchema = exports.testimonialSchema = exports.blogPostSchema = exports.heroSlideSchema = exports.inquiryNoteSchema = exports.adminInquiryUpdateSchema = exports.quotationRequestSchema = exports.generalContactSchema = exports.serviceInquirySchema = exports.productInquirySchema = exports.inquiryItemSchema = exports.serviceCategorySchema = exports.updateServiceSchema = exports.createServiceSchema = exports.serviceProcessStepSchema = exports.productCategorySchema = exports.updateProductSchema = exports.createProductSchema = exports.productImageSchema = exports.productSpecificationSchema = exports.updateUserSchema = exports.createUserSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// ================= AUTH SCHEMAS =================
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters long'),
});
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long').optional(),
    roles: zod_1.z.array(zod_1.z.string()).min(1, 'At least one role must be assigned'),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateUserSchema = exports.createUserSchema.partial().omit({ email: true });
// ================= PRODUCT SCHEMAS =================
exports.productSpecificationSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, 'Specification name is required'),
    value: zod_1.z.string().min(1, 'Specification value is required'),
    group: zod_1.z.string().optional().nullable(),
    order: zod_1.z.number().int().default(0),
});
exports.productImageSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    url: zod_1.z.string().url('Must be a valid URL'),
    altText: zod_1.z.string().optional().nullable(),
    isPrimary: zod_1.z.boolean().default(false),
    displayOrder: zod_1.z.number().int().default(0),
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name must be at least 2 characters'),
    slug: zod_1.z.string().min(2, 'Slug is required'),
    sku: zod_1.z.string().min(2, 'SKU is required'),
    shortDescription: zod_1.z.string().min(10, 'Short description must be at least 10 characters'),
    fullDescription: zod_1.z.string().min(20, 'Full description must be at least 20 characters'),
    categoryId: zod_1.z.string().min(1, 'Category is required'),
    price: zod_1.z.number().nonnegative().optional().nullable(),
    promotionalPrice: zod_1.z.number().nonnegative().optional().nullable(),
    currency: zod_1.z.string().default('USD'),
    priceVisible: zod_1.z.boolean().default(true),
    availability: zod_1.z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'PREORDER', 'MADE_TO_ORDER']).default('IN_STOCK'),
    isFeatured: zod_1.z.boolean().default(false),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    seoTitle: zod_1.z.string().optional().nullable(),
    seoDescription: zod_1.z.string().optional().nullable(),
    images: zod_1.z.array(exports.productImageSchema).default([]),
    features: zod_1.z.array(zod_1.z.string()).default([]),
    specifications: zod_1.z.array(exports.productSpecificationSchema).default([]),
    relatedProductIds: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.productCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Category name must be at least 2 characters'),
    slug: zod_1.z.string().min(2, 'Slug is required'),
    description: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal('')),
    parentId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
    displayOrder: zod_1.z.number().int().default(0),
    seoTitle: zod_1.z.string().optional().nullable(),
    seoDescription: zod_1.z.string().optional().nullable(),
});
// ================= SERVICE SCHEMAS =================
exports.serviceProcessStepSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Step title is required'),
    description: zod_1.z.string().min(1, 'Step description is required'),
    order: zod_1.z.number().int().default(0),
});
exports.createServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Service name must be at least 2 characters'),
    slug: zod_1.z.string().min(2, 'Slug is required'),
    shortDescription: zod_1.z.string().min(10, 'Short description must be at least 10 characters'),
    fullDescription: zod_1.z.string().min(20, 'Full description must be at least 20 characters'),
    categoryId: zod_1.z.string().min(1, 'Category is required'),
    featuredImage: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal('')),
    additionalImages: zod_1.z.array(zod_1.z.string().url()).default([]),
    features: zod_1.z.array(zod_1.z.string()).default([]),
    benefits: zod_1.z.array(zod_1.z.string()).default([]),
    process: zod_1.z.array(exports.serviceProcessStepSchema).default([]),
    pricingModel: zod_1.z.enum(['FIXED', 'HOURLY', 'CUSTOM_QUOTE', 'TIERED']).default('CUSTOM_QUOTE'),
    price: zod_1.z.number().nonnegative().optional().nullable(),
    currency: zod_1.z.string().default('USD'),
    isFeatured: zod_1.z.boolean().default(false),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    seoTitle: zod_1.z.string().optional().nullable(),
    seoDescription: zod_1.z.string().optional().nullable(),
    displayOrder: zod_1.z.number().int().default(0),
    relatedServiceIds: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.updateServiceSchema = exports.createServiceSchema.partial();
exports.serviceCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Category name must be at least 2 characters'),
    slug: zod_1.z.string().min(2, 'Slug is required'),
    description: zod_1.z.string().optional().nullable(),
    displayOrder: zod_1.z.number().int().default(0),
});
// ================= INQUIRY & QUOTATION SCHEMAS =================
exports.inquiryItemSchema = zod_1.z.object({
    productId: zod_1.z.string().optional().nullable(),
    productName: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().positive().default(1),
    notes: zod_1.z.string().optional().nullable(),
});
exports.productInquirySchema = zod_1.z.object({
    customerName: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Valid email is required'),
    phone: zod_1.z.string().optional().nullable(),
    company: zod_1.z.string().optional().nullable(),
    productId: zod_1.z.string().min(1, 'Product selection is required'),
    quantity: zod_1.z.number().int().positive().default(1),
    message: zod_1.z.string().min(10, 'Message must be at least 10 characters long'),
    preferredContact: zod_1.z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
});
exports.serviceInquirySchema = zod_1.z.object({
    customerName: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Valid email is required'),
    phone: zod_1.z.string().optional().nullable(),
    company: zod_1.z.string().optional().nullable(),
    serviceId: zod_1.z.string().min(1, 'Service selection is required'),
    projectDescription: zod_1.z.string().min(15, 'Please provide project details (min 15 chars)'),
    preferredContact: zod_1.z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
});
exports.generalContactSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Valid email is required'),
    phone: zod_1.z.string().optional().nullable(),
    company: zod_1.z.string().optional().nullable(),
    subject: zod_1.z.string().min(3, 'Subject is required'),
    message: zod_1.z.string().min(15, 'Message must be at least 15 characters long'),
    preferredContact: zod_1.z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
});
exports.quotationRequestSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Valid email is required'),
    phone: zod_1.z.string().optional().nullable(),
    company: zod_1.z.string().optional().nullable(),
    message: zod_1.z.string().optional().default(''),
    preferredContact: zod_1.z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
    items: zod_1.z.array(exports.inquiryItemSchema).min(1, 'Select at least one product for the quotation'),
});
exports.adminInquiryUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(['NEW', 'IN_PROGRESS', 'AWAITING_CUSTOMER', 'QUOTED', 'CONVERTED', 'CLOSED', 'SPAM']).optional(),
    urgency: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedToId: zod_1.z.string().optional().nullable(),
});
exports.inquiryNoteSchema = zod_1.z.object({
    content: zod_1.z.string().min(2, 'Note content is required'),
});
// ================= CMS SCHEMAS =================
exports.heroSlideSchema = zod_1.z.object({
    headline: zod_1.z.string().min(2, 'Headline is required'),
    subheadline: zod_1.z.string().min(5, 'Subheadline is required'),
    imageUrl: zod_1.z.string().url('Valid image URL is required'),
    primaryCtaText: zod_1.z.string().min(1, 'Primary CTA label required'),
    primaryCtaLink: zod_1.z.string().min(1, 'Primary CTA link required'),
    secondaryCtaText: zod_1.z.string().optional().nullable(),
    secondaryCtaLink: zod_1.z.string().optional().nullable(),
    displayOrder: zod_1.z.number().int().default(0),
    isActive: zod_1.z.boolean().default(true),
});
exports.blogPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title is required'),
    slug: zod_1.z.string().min(3, 'Slug is required'),
    excerpt: zod_1.z.string().min(10, 'Excerpt is required'),
    content: zod_1.z.string().min(20, 'Content is required'),
    featuredImage: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal('')),
    categoryId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    seoTitle: zod_1.z.string().optional().nullable(),
    seoDescription: zod_1.z.string().optional().nullable(),
});
exports.testimonialSchema = zod_1.z.object({
    clientName: zod_1.z.string().min(2, 'Client name is required'),
    clientRole: zod_1.z.string().optional().nullable(),
    companyName: zod_1.z.string().optional().nullable(),
    clientAvatar: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal('')),
    content: zod_1.z.string().min(10, 'Content must be at least 10 characters'),
    rating: zod_1.z.number().int().min(1).max(5).default(5),
    isFeatured: zod_1.z.boolean().default(false),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    displayOrder: zod_1.z.number().int().default(0),
});
exports.faqSchema = zod_1.z.object({
    question: zod_1.z.string().min(5, 'Question is required'),
    answer: zod_1.z.string().min(10, 'Answer is required'),
    category: zod_1.z.string().min(2, 'Category is required'),
    displayOrder: zod_1.z.number().int().default(0),
    isPublished: zod_1.z.boolean().default(true),
});
exports.pageSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title is required'),
    slug: zod_1.z.string().min(2, 'Slug is required'),
    content: zod_1.z.string().min(10, 'Content is required'),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    seoTitle: zod_1.z.string().optional().nullable(),
    seoDescription: zod_1.z.string().optional().nullable(),
});
// ================= SETTINGS SCHEMA =================
exports.websiteSettingsSchema = zod_1.z.object({
    general: zod_1.z.object({
        companyName: zod_1.z.string().min(1),
        logoUrl: zod_1.z.string().optional().nullable(),
        faviconUrl: zod_1.z.string().optional().nullable(),
        websiteUrl: zod_1.z.string().url().or(zod_1.z.string().min(1)),
        description: zod_1.z.string().min(1),
        language: zod_1.z.string().default('en'),
        timezone: zod_1.z.string().default('UTC'),
        currency: zod_1.z.string().default('USD'),
    }),
    contact: zod_1.z.object({
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(1),
        address: zod_1.z.string().min(1),
        businessHours: zod_1.z.string().min(1),
    }),
    social: zod_1.z.object({
        facebook: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        instagram: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        linkedin: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        twitter: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        whatsapp: zod_1.z.string().optional().or(zod_1.z.literal('')),
        youtube: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    }),
    appearance: zod_1.z.object({
        primaryColor: zod_1.z.string(),
        secondaryColor: zod_1.z.string(),
        accentColor: zod_1.z.string(),
        fontFamily: zod_1.z.string(),
    }),
    seo: zod_1.z.object({
        defaultTitle: zod_1.z.string().min(1),
        defaultDescription: zod_1.z.string().min(1),
        ogImageUrl: zod_1.z.string().optional().nullable(),
        robotsTxt: zod_1.z.string().min(1),
    }),
    email: zod_1.z.object({
        senderName: zod_1.z.string().min(1),
        senderEmail: zod_1.z.string().email(),
        notificationRecipients: zod_1.z.array(zod_1.z.string().email()),
    }),
});
// ================= QUERY SCHEMAS =================
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(12),
    search: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional(),
    order: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.productFilterQuerySchema = exports.paginationQuerySchema.extend({
    category: zod_1.z.string().optional(),
    availability: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    featured: zod_1.z.coerce.boolean().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
});
exports.serviceFilterQuerySchema = exports.paginationQuerySchema.extend({
    category: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    featured: zod_1.z.coerce.boolean().optional(),
});
exports.inquiryFilterQuerySchema = exports.paginationQuerySchema.extend({
    type: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    urgency: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map