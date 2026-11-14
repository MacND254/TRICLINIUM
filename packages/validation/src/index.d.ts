import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    roles: z.ZodArray<z.ZodString, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    isActive: boolean;
    password?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    password?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<Omit<{
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "email">, "strip", z.ZodTypeAny, {
    password?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    roles?: string[] | undefined;
    isActive?: boolean | undefined;
}, {
    password?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    roles?: string[] | undefined;
    isActive?: boolean | undefined;
}>;
export declare const productSpecificationSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    value: z.ZodString;
    group: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    order: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    value: string;
    order: number;
    id?: string | undefined;
    group?: string | null | undefined;
}, {
    name: string;
    value: string;
    id?: string | undefined;
    group?: string | null | undefined;
    order?: number | undefined;
}>;
export declare const productImageSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    url: z.ZodString;
    altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    url: string;
    isPrimary: boolean;
    displayOrder: number;
    id?: string | undefined;
    altText?: string | null | undefined;
}, {
    url: string;
    id?: string | undefined;
    altText?: string | null | undefined;
    isPrimary?: boolean | undefined;
    displayOrder?: number | undefined;
}>;
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    sku: z.ZodString;
    shortDescription: z.ZodString;
    fullDescription: z.ZodString;
    categoryId: z.ZodString;
    price: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    promotionalPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    currency: z.ZodDefault<z.ZodString>;
    priceVisible: z.ZodDefault<z.ZodBoolean>;
    availability: z.ZodDefault<z.ZodEnum<["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER", "MADE_TO_ORDER"]>>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    seoTitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    seoDescription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    images: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        url: z.ZodString;
        altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        displayOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        isPrimary: boolean;
        displayOrder: number;
        id?: string | undefined;
        altText?: string | null | undefined;
    }, {
        url: string;
        id?: string | undefined;
        altText?: string | null | undefined;
        isPrimary?: boolean | undefined;
        displayOrder?: number | undefined;
    }>, "many">>;
    features: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    specifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        value: z.ZodString;
        group: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        order: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value: string;
        order: number;
        id?: string | undefined;
        group?: string | null | undefined;
    }, {
        name: string;
        value: string;
        id?: string | undefined;
        group?: string | null | undefined;
        order?: number | undefined;
    }>, "many">>;
    relatedProductIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    availability: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER" | "MADE_TO_ORDER";
    slug: string;
    name: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    sku: string;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    currency: string;
    priceVisible: boolean;
    isFeatured: boolean;
    images: {
        url: string;
        isPrimary: boolean;
        displayOrder: number;
        id?: string | undefined;
        altText?: string | null | undefined;
    }[];
    features: string[];
    specifications: {
        name: string;
        value: string;
        order: number;
        id?: string | undefined;
        group?: string | null | undefined;
    }[];
    relatedProductIds: string[];
    price?: number | null | undefined;
    promotionalPrice?: number | null | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
}, {
    slug: string;
    name: string;
    sku: string;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    availability?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER" | "MADE_TO_ORDER" | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    price?: number | null | undefined;
    promotionalPrice?: number | null | undefined;
    currency?: string | undefined;
    priceVisible?: boolean | undefined;
    isFeatured?: boolean | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    images?: {
        url: string;
        id?: string | undefined;
        altText?: string | null | undefined;
        isPrimary?: boolean | undefined;
        displayOrder?: number | undefined;
    }[] | undefined;
    features?: string[] | undefined;
    specifications?: {
        name: string;
        value: string;
        id?: string | undefined;
        group?: string | null | undefined;
        order?: number | undefined;
    }[] | undefined;
    relatedProductIds?: string[] | undefined;
}>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    fullDescription: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    promotionalPrice: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    priceVisible: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    availability: z.ZodOptional<z.ZodDefault<z.ZodEnum<["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER", "MADE_TO_ORDER"]>>>;
    isFeatured: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>>;
    seoTitle: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    seoDescription: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    images: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        url: z.ZodString;
        altText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        displayOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        isPrimary: boolean;
        displayOrder: number;
        id?: string | undefined;
        altText?: string | null | undefined;
    }, {
        url: string;
        id?: string | undefined;
        altText?: string | null | undefined;
        isPrimary?: boolean | undefined;
        displayOrder?: number | undefined;
    }>, "many">>>;
    features: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    specifications: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        value: z.ZodString;
        group: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        order: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value: string;
        order: number;
        id?: string | undefined;
        group?: string | null | undefined;
    }, {
        name: string;
        value: string;
        id?: string | undefined;
        group?: string | null | undefined;
        order?: number | undefined;
    }>, "many">>>;
    relatedProductIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    availability?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER" | "MADE_TO_ORDER" | undefined;
    slug?: string | undefined;
    name?: string | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    sku?: string | undefined;
    shortDescription?: string | undefined;
    fullDescription?: string | undefined;
    categoryId?: string | undefined;
    price?: number | null | undefined;
    promotionalPrice?: number | null | undefined;
    currency?: string | undefined;
    priceVisible?: boolean | undefined;
    isFeatured?: boolean | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    images?: {
        url: string;
        isPrimary: boolean;
        displayOrder: number;
        id?: string | undefined;
        altText?: string | null | undefined;
    }[] | undefined;
    features?: string[] | undefined;
    specifications?: {
        name: string;
        value: string;
        order: number;
        id?: string | undefined;
        group?: string | null | undefined;
    }[] | undefined;
    relatedProductIds?: string[] | undefined;
}, {
    availability?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER" | "MADE_TO_ORDER" | undefined;
    slug?: string | undefined;
    name?: string | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    sku?: string | undefined;
    shortDescription?: string | undefined;
    fullDescription?: string | undefined;
    categoryId?: string | undefined;
    price?: number | null | undefined;
    promotionalPrice?: number | null | undefined;
    currency?: string | undefined;
    priceVisible?: boolean | undefined;
    isFeatured?: boolean | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    images?: {
        url: string;
        id?: string | undefined;
        altText?: string | null | undefined;
        isPrimary?: boolean | undefined;
        displayOrder?: number | undefined;
    }[] | undefined;
    features?: string[] | undefined;
    specifications?: {
        name: string;
        value: string;
        id?: string | undefined;
        group?: string | null | undefined;
        order?: number | undefined;
    }[] | undefined;
    relatedProductIds?: string[] | undefined;
}>;
export declare const productCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    imageUrl: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    parentId: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
    seoTitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    seoDescription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    name: string;
    displayOrder: number;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    description?: string | null | undefined;
    imageUrl?: string | null | undefined;
    parentId?: string | null | undefined;
}, {
    slug: string;
    name: string;
    displayOrder?: number | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    description?: string | null | undefined;
    imageUrl?: string | null | undefined;
    parentId?: string | null | undefined;
}>;
export declare const serviceProcessStepSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    order: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    order: number;
    description: string;
    title: string;
}, {
    description: string;
    title: string;
    order?: number | undefined;
}>;
export declare const createServiceSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    shortDescription: z.ZodString;
    fullDescription: z.ZodString;
    categoryId: z.ZodString;
    featuredImage: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    additionalImages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    features: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    benefits: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    process: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        order: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        order: number;
        description: string;
        title: string;
    }, {
        description: string;
        title: string;
        order?: number | undefined;
    }>, "many">>;
    pricingModel: z.ZodDefault<z.ZodEnum<["FIXED", "HOURLY", "CUSTOM_QUOTE", "TIERED"]>>;
    price: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    currency: z.ZodDefault<z.ZodString>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    seoTitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    seoDescription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
    relatedServiceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    name: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    displayOrder: number;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    currency: string;
    isFeatured: boolean;
    features: string[];
    additionalImages: string[];
    benefits: string[];
    process: {
        order: number;
        description: string;
        title: string;
    }[];
    pricingModel: "FIXED" | "HOURLY" | "CUSTOM_QUOTE" | "TIERED";
    relatedServiceIds: string[];
    price?: number | null | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    featuredImage?: string | null | undefined;
}, {
    slug: string;
    name: string;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    displayOrder?: number | undefined;
    price?: number | null | undefined;
    currency?: string | undefined;
    isFeatured?: boolean | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    features?: string[] | undefined;
    featuredImage?: string | null | undefined;
    additionalImages?: string[] | undefined;
    benefits?: string[] | undefined;
    process?: {
        description: string;
        title: string;
        order?: number | undefined;
    }[] | undefined;
    pricingModel?: "FIXED" | "HOURLY" | "CUSTOM_QUOTE" | "TIERED" | undefined;
    relatedServiceIds?: string[] | undefined;
}>;
export declare const updateServiceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    fullDescription: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    featuredImage: z.ZodOptional<z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>>;
    additionalImages: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    features: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    benefits: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    process: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        order: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        order: number;
        description: string;
        title: string;
    }, {
        description: string;
        title: string;
        order?: number | undefined;
    }>, "many">>>;
    pricingModel: z.ZodOptional<z.ZodDefault<z.ZodEnum<["FIXED", "HOURLY", "CUSTOM_QUOTE", "TIERED"]>>>;
    price: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    isFeatured: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>>;
    seoTitle: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    seoDescription: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    displayOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    relatedServiceIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    slug?: string | undefined;
    name?: string | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    displayOrder?: number | undefined;
    shortDescription?: string | undefined;
    fullDescription?: string | undefined;
    categoryId?: string | undefined;
    price?: number | null | undefined;
    currency?: string | undefined;
    isFeatured?: boolean | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    features?: string[] | undefined;
    featuredImage?: string | null | undefined;
    additionalImages?: string[] | undefined;
    benefits?: string[] | undefined;
    process?: {
        order: number;
        description: string;
        title: string;
    }[] | undefined;
    pricingModel?: "FIXED" | "HOURLY" | "CUSTOM_QUOTE" | "TIERED" | undefined;
    relatedServiceIds?: string[] | undefined;
}, {
    slug?: string | undefined;
    name?: string | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    displayOrder?: number | undefined;
    shortDescription?: string | undefined;
    fullDescription?: string | undefined;
    categoryId?: string | undefined;
    price?: number | null | undefined;
    currency?: string | undefined;
    isFeatured?: boolean | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    features?: string[] | undefined;
    featuredImage?: string | null | undefined;
    additionalImages?: string[] | undefined;
    benefits?: string[] | undefined;
    process?: {
        description: string;
        title: string;
        order?: number | undefined;
    }[] | undefined;
    pricingModel?: "FIXED" | "HOURLY" | "CUSTOM_QUOTE" | "TIERED" | undefined;
    relatedServiceIds?: string[] | undefined;
}>;
export declare const serviceCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    name: string;
    displayOrder: number;
    description?: string | null | undefined;
}, {
    slug: string;
    name: string;
    displayOrder?: number | undefined;
    description?: string | null | undefined;
}>;
export declare const inquiryItemSchema: z.ZodObject<{
    productId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    productName: z.ZodOptional<z.ZodString>;
    quantity: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    productId?: string | null | undefined;
    productName?: string | undefined;
    notes?: string | null | undefined;
}, {
    productId?: string | null | undefined;
    productName?: string | undefined;
    quantity?: number | undefined;
    notes?: string | null | undefined;
}>;
export declare const productInquirySchema: z.ZodObject<{
    customerName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    productId: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
    message: z.ZodString;
    preferredContact: z.ZodDefault<z.ZodEnum<["EMAIL", "PHONE", "WHATSAPP"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    message: string;
    productId: string;
    quantity: number;
    customerName: string;
    preferredContact: "EMAIL" | "PHONE" | "WHATSAPP";
    phone?: string | null | undefined;
    company?: string | null | undefined;
}, {
    email: string;
    message: string;
    productId: string;
    customerName: string;
    quantity?: number | undefined;
    phone?: string | null | undefined;
    company?: string | null | undefined;
    preferredContact?: "EMAIL" | "PHONE" | "WHATSAPP" | undefined;
}>;
export declare const serviceInquirySchema: z.ZodObject<{
    customerName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    serviceId: z.ZodString;
    projectDescription: z.ZodString;
    preferredContact: z.ZodDefault<z.ZodEnum<["EMAIL", "PHONE", "WHATSAPP"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    customerName: string;
    preferredContact: "EMAIL" | "PHONE" | "WHATSAPP";
    serviceId: string;
    projectDescription: string;
    phone?: string | null | undefined;
    company?: string | null | undefined;
}, {
    email: string;
    customerName: string;
    serviceId: string;
    projectDescription: string;
    phone?: string | null | undefined;
    company?: string | null | undefined;
    preferredContact?: "EMAIL" | "PHONE" | "WHATSAPP" | undefined;
}>;
export declare const generalContactSchema: z.ZodObject<{
    customerName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    subject: z.ZodString;
    message: z.ZodString;
    preferredContact: z.ZodDefault<z.ZodEnum<["EMAIL", "PHONE", "WHATSAPP"]>>;
}, "strip", z.ZodTypeAny, {
    subject: string;
    email: string;
    message: string;
    customerName: string;
    preferredContact: "EMAIL" | "PHONE" | "WHATSAPP";
    phone?: string | null | undefined;
    company?: string | null | undefined;
}, {
    subject: string;
    email: string;
    message: string;
    customerName: string;
    phone?: string | null | undefined;
    company?: string | null | undefined;
    preferredContact?: "EMAIL" | "PHONE" | "WHATSAPP" | undefined;
}>;
export declare const quotationRequestSchema: z.ZodObject<{
    customerName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    message: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    preferredContact: z.ZodDefault<z.ZodEnum<["EMAIL", "PHONE", "WHATSAPP"]>>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        productName: z.ZodOptional<z.ZodString>;
        quantity: z.ZodDefault<z.ZodNumber>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        productId?: string | null | undefined;
        productName?: string | undefined;
        notes?: string | null | undefined;
    }, {
        productId?: string | null | undefined;
        productName?: string | undefined;
        quantity?: number | undefined;
        notes?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    email: string;
    message: string;
    customerName: string;
    preferredContact: "EMAIL" | "PHONE" | "WHATSAPP";
    items: {
        quantity: number;
        productId?: string | null | undefined;
        productName?: string | undefined;
        notes?: string | null | undefined;
    }[];
    phone?: string | null | undefined;
    company?: string | null | undefined;
}, {
    email: string;
    customerName: string;
    items: {
        productId?: string | null | undefined;
        productName?: string | undefined;
        quantity?: number | undefined;
        notes?: string | null | undefined;
    }[];
    message?: string | undefined;
    phone?: string | null | undefined;
    company?: string | null | undefined;
    preferredContact?: "EMAIL" | "PHONE" | "WHATSAPP" | undefined;
}>;
export declare const adminInquiryUpdateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["NEW", "IN_PROGRESS", "AWAITING_CUSTOMER", "QUOTED", "CONVERTED", "CLOSED", "SPAM"]>>;
    urgency: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    assignedToId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "NEW" | "IN_PROGRESS" | "AWAITING_CUSTOMER" | "QUOTED" | "CONVERTED" | "CLOSED" | "SPAM" | undefined;
    urgency?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    assignedToId?: string | null | undefined;
}, {
    status?: "NEW" | "IN_PROGRESS" | "AWAITING_CUSTOMER" | "QUOTED" | "CONVERTED" | "CLOSED" | "SPAM" | undefined;
    urgency?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    assignedToId?: string | null | undefined;
}>;
export declare const inquiryNoteSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const heroSlideSchema: z.ZodObject<{
    headline: z.ZodString;
    subheadline: z.ZodString;
    imageUrl: z.ZodString;
    primaryCtaText: z.ZodString;
    primaryCtaLink: z.ZodString;
    secondaryCtaText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    secondaryCtaLink: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    displayOrder: number;
    imageUrl: string;
    headline: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText?: string | null | undefined;
    secondaryCtaLink?: string | null | undefined;
}, {
    imageUrl: string;
    headline: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    isActive?: boolean | undefined;
    displayOrder?: number | undefined;
    secondaryCtaText?: string | null | undefined;
    secondaryCtaLink?: string | null | undefined;
}>;
export declare const blogPostSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    excerpt: z.ZodString;
    content: z.ZodString;
    featuredImage: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    categoryId: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    seoTitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    seoDescription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    categoryId?: string | null | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    featuredImage?: string | null | undefined;
}, {
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    categoryId?: string | null | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
    featuredImage?: string | null | undefined;
    tags?: string[] | undefined;
}>;
export declare const testimonialSchema: z.ZodObject<{
    clientName: z.ZodString;
    clientRole: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    companyName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    clientAvatar: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    content: z.ZodString;
    rating: z.ZodDefault<z.ZodNumber>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    displayOrder: number;
    isFeatured: boolean;
    content: string;
    clientName: string;
    rating: number;
    clientRole?: string | null | undefined;
    companyName?: string | null | undefined;
    clientAvatar?: string | null | undefined;
}, {
    content: string;
    clientName: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    displayOrder?: number | undefined;
    isFeatured?: boolean | undefined;
    clientRole?: string | null | undefined;
    companyName?: string | null | undefined;
    clientAvatar?: string | null | undefined;
    rating?: number | undefined;
}>;
export declare const faqSchema: z.ZodObject<{
    question: z.ZodString;
    answer: z.ZodString;
    category: z.ZodString;
    displayOrder: z.ZodDefault<z.ZodNumber>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    category: string;
    displayOrder: number;
    question: string;
    answer: string;
    isPublished: boolean;
}, {
    category: string;
    question: string;
    answer: string;
    displayOrder?: number | undefined;
    isPublished?: boolean | undefined;
}>;
export declare const pageSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    content: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    seoTitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    seoDescription: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    title: string;
    content: string;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
}, {
    slug: string;
    title: string;
    content: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    seoTitle?: string | null | undefined;
    seoDescription?: string | null | undefined;
}>;
export declare const websiteSettingsSchema: z.ZodObject<{
    general: z.ZodObject<{
        companyName: z.ZodString;
        logoUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        faviconUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        websiteUrl: z.ZodUnion<[z.ZodString, z.ZodString]>;
        description: z.ZodString;
        language: z.ZodDefault<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        currency: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        description: string;
        companyName: string;
        websiteUrl: string;
        language: string;
        timezone: string;
        logoUrl?: string | null | undefined;
        faviconUrl?: string | null | undefined;
    }, {
        description: string;
        companyName: string;
        websiteUrl: string;
        currency?: string | undefined;
        logoUrl?: string | null | undefined;
        faviconUrl?: string | null | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }>;
    contact: z.ZodObject<{
        email: z.ZodString;
        phone: z.ZodString;
        address: z.ZodString;
        businessHours: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        phone: string;
        address: string;
        businessHours: string;
    }, {
        email: string;
        phone: string;
        address: string;
        businessHours: string;
    }>;
    social: z.ZodObject<{
        facebook: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        instagram: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        linkedin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        twitter: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        whatsapp: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        youtube: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        facebook?: string | undefined;
        instagram?: string | undefined;
        linkedin?: string | undefined;
        twitter?: string | undefined;
        whatsapp?: string | undefined;
        youtube?: string | undefined;
    }, {
        facebook?: string | undefined;
        instagram?: string | undefined;
        linkedin?: string | undefined;
        twitter?: string | undefined;
        whatsapp?: string | undefined;
        youtube?: string | undefined;
    }>;
    appearance: z.ZodObject<{
        primaryColor: z.ZodString;
        secondaryColor: z.ZodString;
        accentColor: z.ZodString;
        fontFamily: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamily: string;
    }, {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamily: string;
    }>;
    seo: z.ZodObject<{
        defaultTitle: z.ZodString;
        defaultDescription: z.ZodString;
        ogImageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        robotsTxt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        defaultTitle: string;
        defaultDescription: string;
        robotsTxt: string;
        ogImageUrl?: string | null | undefined;
    }, {
        defaultTitle: string;
        defaultDescription: string;
        robotsTxt: string;
        ogImageUrl?: string | null | undefined;
    }>;
    email: z.ZodObject<{
        senderName: z.ZodString;
        senderEmail: z.ZodString;
        notificationRecipients: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        senderName: string;
        senderEmail: string;
        notificationRecipients: string[];
    }, {
        senderName: string;
        senderEmail: string;
        notificationRecipients: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    email: {
        senderName: string;
        senderEmail: string;
        notificationRecipients: string[];
    };
    general: {
        currency: string;
        description: string;
        companyName: string;
        websiteUrl: string;
        language: string;
        timezone: string;
        logoUrl?: string | null | undefined;
        faviconUrl?: string | null | undefined;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
        businessHours: string;
    };
    social: {
        facebook?: string | undefined;
        instagram?: string | undefined;
        linkedin?: string | undefined;
        twitter?: string | undefined;
        whatsapp?: string | undefined;
        youtube?: string | undefined;
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
        robotsTxt: string;
        ogImageUrl?: string | null | undefined;
    };
}, {
    email: {
        senderName: string;
        senderEmail: string;
        notificationRecipients: string[];
    };
    general: {
        description: string;
        companyName: string;
        websiteUrl: string;
        currency?: string | undefined;
        logoUrl?: string | null | undefined;
        faviconUrl?: string | null | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
        businessHours: string;
    };
    social: {
        facebook?: string | undefined;
        instagram?: string | undefined;
        linkedin?: string | undefined;
        twitter?: string | undefined;
        whatsapp?: string | undefined;
        youtube?: string | undefined;
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
        robotsTxt: string;
        ogImageUrl?: string | null | undefined;
    };
}>;
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    order: "asc" | "desc";
    search?: string | undefined;
    sort?: string | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort?: string | undefined;
    order?: "asc" | "desc" | undefined;
}>;
export declare const productFilterQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    category: z.ZodOptional<z.ZodString>;
    availability: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    featured: z.ZodOptional<z.ZodBoolean>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    order: "asc" | "desc";
    category?: string | undefined;
    search?: string | undefined;
    availability?: string | undefined;
    sort?: string | undefined;
    status?: string | undefined;
    featured?: boolean | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}, {
    category?: string | undefined;
    search?: string | undefined;
    availability?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort?: string | undefined;
    status?: string | undefined;
    order?: "asc" | "desc" | undefined;
    featured?: boolean | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}>;
export declare const serviceFilterQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    category: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    featured: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    order: "asc" | "desc";
    category?: string | undefined;
    search?: string | undefined;
    sort?: string | undefined;
    status?: string | undefined;
    featured?: boolean | undefined;
}, {
    category?: string | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort?: string | undefined;
    status?: string | undefined;
    order?: "asc" | "desc" | undefined;
    featured?: boolean | undefined;
}>;
export declare const inquiryFilterQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    urgency: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    order: "asc" | "desc";
    search?: string | undefined;
    sort?: string | undefined;
    type?: string | undefined;
    status?: string | undefined;
    urgency?: string | undefined;
    assignedTo?: string | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort?: string | undefined;
    type?: string | undefined;
    status?: string | undefined;
    order?: "asc" | "desc" | undefined;
    urgency?: string | undefined;
    assignedTo?: string | undefined;
}>;
//# sourceMappingURL=index.d.ts.map