export type RoleName = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'SALES_MANAGER';
export type ProductAvailability = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PREORDER' | 'MADE_TO_ORDER';
export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ServicePricingModel = 'FIXED' | 'HOURLY' | 'CUSTOM_QUOTE' | 'TIERED';
export type InquiryStatus = 'NEW' | 'IN_PROGRESS' | 'AWAITING_CUSTOMER' | 'QUOTED' | 'CONVERTED' | 'CLOSED' | 'SPAM';
export type InquiryType = 'PRODUCT' | 'SERVICE' | 'GENERAL' | 'QUOTATION';
export type ContactPreference = 'EMAIL' | 'PHONE' | 'WHATSAPP';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export interface UserDTO {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    roles: RoleDTO[];
    permissions: string[];
}
export interface RoleDTO {
    id: string;
    name: RoleName;
    description?: string | null;
    permissions?: PermissionDTO[];
}
export interface PermissionDTO {
    id: string;
    code: string;
    name: string;
    module: string;
}
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    roles: RoleName[];
    permissions: string[];
}
export interface ProductSpecificationDTO {
    id?: string;
    name: string;
    value: string;
    group?: string | null;
    order: number;
}
export interface ProductImageDTO {
    id?: string;
    url: string;
    altText?: string | null;
    isPrimary: boolean;
    displayOrder: number;
}
export interface ProductCategoryDTO {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    parentId?: string | null;
    parent?: ProductCategoryDTO | null;
    children?: ProductCategoryDTO[];
    displayOrder: number;
    productCount?: number;
    seoTitle?: string | null;
    seoDescription?: string | null;
    createdAt: string;
}
export interface ProductDTO {
    id: string;
    name: string;
    slug: string;
    sku: string;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    category?: ProductCategoryDTO;
    price?: number | null;
    promotionalPrice?: number | null;
    currency: string;
    priceVisible: boolean;
    availability: ProductAvailability;
    isFeatured: boolean;
    status: PublicationStatus;
    seoTitle?: string | null;
    seoDescription?: string | null;
    images: ProductImageDTO[];
    features: string[];
    specifications: ProductSpecificationDTO[];
    relatedProductIds?: string[];
    relatedProducts?: ProductDTO[];
    createdAt: string;
    updatedAt: string;
}
export interface ServiceCategoryDTO {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    displayOrder: number;
    serviceCount?: number;
}
export interface ServiceProcessStepDTO {
    title: string;
    description: string;
    order: number;
}
export interface ServiceDTO {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    category?: ServiceCategoryDTO;
    featuredImage?: string | null;
    additionalImages?: string[];
    features: string[];
    benefits: string[];
    process: ServiceProcessStepDTO[];
    pricingModel: ServicePricingModel;
    price?: number | null;
    currency: string;
    isFeatured: boolean;
    status: PublicationStatus;
    seoTitle?: string | null;
    seoDescription?: string | null;
    displayOrder: number;
    relatedServiceIds?: string[];
    relatedServices?: ServiceDTO[];
    createdAt: string;
    updatedAt: string;
}
export interface InquiryItemDTO {
    id?: string;
    productId?: string | null;
    product?: ProductDTO | null;
    productName?: string;
    quantity: number;
    notes?: string | null;
}
export interface InquiryNoteDTO {
    id: string;
    inquiryId: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
}
export interface InquiryActivityDTO {
    id: string;
    inquiryId: string;
    actorId?: string | null;
    actorName: string;
    action: string;
    details?: string | null;
    createdAt: string;
}
export interface InquiryDTO {
    id: string;
    referenceNumber: string;
    type: InquiryType;
    status: InquiryStatus;
    urgency: UrgencyLevel;
    customerName: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    subject?: string | null;
    message: string;
    preferredContact: ContactPreference;
    assignedToId?: string | null;
    assignedToName?: string | null;
    productId?: string | null;
    product?: ProductDTO | null;
    serviceId?: string | null;
    service?: ServiceDTO | null;
    items: InquiryItemDTO[];
    notes?: InquiryNoteDTO[];
    activities?: InquiryActivityDTO[];
    createdAt: string;
    updatedAt: string;
}
export interface HeroSlideDTO {
    id: string;
    headline: string;
    subheadline: string;
    imageUrl: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    displayOrder: number;
    isActive: boolean;
}
export interface HomepageSectionDTO {
    id: string;
    key: string;
    title: string;
    subtitle?: string;
    content?: any;
    isEnabled: boolean;
    displayOrder: number;
}
export interface BlogPostDTO {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string | null;
    categoryId?: string | null;
    categoryName?: string | null;
    authorName: string;
    tags: string[];
    status: PublicationStatus;
    seoTitle?: string | null;
    seoDescription?: string | null;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface TestimonialDTO {
    id: string;
    clientName: string;
    clientRole?: string | null;
    companyName?: string | null;
    clientAvatar?: string | null;
    content: string;
    rating: number;
    isFeatured: boolean;
    status: PublicationStatus;
    displayOrder: number;
}
export interface FaqDTO {
    id: string;
    question: string;
    answer: string;
    category: string;
    displayOrder: number;
    isPublished: boolean;
}
export interface PageDTO {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: PublicationStatus;
    seoTitle?: string | null;
    seoDescription?: string | null;
    publishedAt?: string | null;
    updatedAt: string;
}
export interface WebsiteSettingsDTO {
    general: {
        companyName: string;
        logoUrl?: string;
        faviconUrl?: string;
        websiteUrl: string;
        description: string;
        language: string;
        timezone: string;
        currency: string;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
        businessHours: string;
    };
    social: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
        whatsapp?: string;
        youtube?: string;
    };
    appearance: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamily: string;
    };
    seo: {
        defaultTitle: string;
        defaultDescription: string;
        ogImageUrl?: string;
        robotsTxt: string;
    };
    email: {
        senderName: string;
        senderEmail: string;
        notificationRecipients: string[];
    };
}
export interface DashboardMetricsDTO {
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    totalServices: number;
    productCategories: number;
    serviceCategories: number;
    newInquiries: number;
    pendingQuotations: number;
    processedInquiries: number;
    publishedArticles: number;
    recentInquiries: InquiryDTO[];
    recentProducts: ProductDTO[];
    recentActivities: AuditLogDTO[];
}
export interface AuditLogDTO {
    id: string;
    userId?: string | null;
    userName: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    createdAt: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
//# sourceMappingURL=index.d.ts.map