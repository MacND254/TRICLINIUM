"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_WEBSITE_SETTINGS = exports.PERMISSIONS = exports.SYSTEM_ROLES = void 0;
exports.slugify = slugify;
exports.formatCurrency = formatCurrency;
exports.generateReferenceNumber = generateReferenceNumber;
exports.SYSTEM_ROLES = {
    SUPER_ADMIN: {
        name: 'Super Administrator',
        description: 'Full system control, administrator management, security and settings access.',
    },
    ADMIN: {
        name: 'Administrator',
        description: 'Management of products, services, inquiries, and standard CMS content.',
    },
    EDITOR: {
        name: 'Editor',
        description: 'Editing content, blog posts, FAQs, testimonials, and static pages.',
    },
    SALES_MANAGER: {
        name: 'Sales / Inquiry Manager',
        description: 'Processing customer inquiries, generating quotations, and managing customer communications.',
    },
};
exports.PERMISSIONS = {
    // Products
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_EDIT: 'products.edit',
    PRODUCTS_DELETE: 'products.delete',
    PRODUCTS_PUBLISH: 'products.publish',
    // Services
    SERVICES_VIEW: 'services.view',
    SERVICES_CREATE: 'services.create',
    SERVICES_EDIT: 'services.edit',
    SERVICES_DELETE: 'services.delete',
    SERVICES_PUBLISH: 'services.publish',
    // Inquiries
    INQUIRIES_VIEW: 'inquiries.view',
    INQUIRIES_EDIT: 'inquiries.edit',
    INQUIRIES_DELETE: 'inquiries.delete',
    INQUIRIES_EXPORT: 'inquiries.export',
    // CMS
    CMS_VIEW: 'cms.view',
    CMS_EDIT: 'cms.edit',
    CMS_PUBLISH: 'cms.publish',
    // Media
    MEDIA_VIEW: 'media.view',
    MEDIA_UPLOAD: 'media.upload',
    MEDIA_DELETE: 'media.delete',
    // Admin & System
    ADMIN_USERS_MANAGE: 'admin.users.manage',
    SETTINGS_MANAGE: 'settings.manage',
    AUDIT_LOGS_VIEW: 'audit.view',
};
exports.DEFAULT_WEBSITE_SETTINGS = {
    general: {
        companyName: 'TRICLINIUM Commercial & Industrial Enterprise',
        logoUrl: '/images/triclinium-logo.svg',
        faviconUrl: '/favicon.ico',
        websiteUrl: 'https://triclinium.com',
        description: 'Premier provider of high-grade architectural elements, custom manufactured products, and comprehensive commercial services.',
        language: 'en',
        timezone: 'UTC',
        currency: 'USD',
    },
    contact: {
        email: 'info@triclinium.com',
        phone: '+1 (800) 555-0199',
        address: '742 Evergreen Boulevard, Suite 500, Industrial District, NY 10001',
        businessHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST',
    },
    social: {
        facebook: 'https://facebook.com/triclinium',
        instagram: 'https://instagram.com/triclinium',
        linkedin: 'https://linkedin.com/company/triclinium',
        twitter: 'https://twitter.com/triclinium',
        whatsapp: '+18005550199',
    },
    appearance: {
        primaryColor: '#0f172a', // Slate 900
        secondaryColor: '#334155', // Slate 700
        accentColor: '#0284c7', // Sky 600
        fontFamily: 'Inter, sans-serif',
    },
    seo: {
        defaultTitle: 'TRICLINIUM | Premium Products & Engineering Services',
        defaultDescription: 'Explore our catalog of precision-engineered physical & digital products, and bespoke enterprise consulting and industrial services.',
        ogImageUrl: '/images/og-default.jpg',
        robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://triclinium.com/sitemap.xml',
    },
    email: {
        senderName: 'TRICLINIUM Enterprise',
        senderEmail: 'notifications@triclinium.com',
        notificationRecipients: ['admin@triclinium.com', 'sales@triclinium.com'],
    },
};
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
function generateReferenceNumber(prefix = 'TRIC') {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${rand}`;
}
//# sourceMappingURL=index.js.map