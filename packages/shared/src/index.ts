import { WebsiteSettingsDTO, RoleName } from '@triclinium/types';

export const SYSTEM_ROLES: Record<RoleName, { name: string; description: string }> = {
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

export const PERMISSIONS = {
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
} as const;

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettingsDTO = {
  general: {
    companyName: 'TRICLINIUM CCTV & Security Systems',
    logoUrl: '/images/triclinium-logo.svg',
    faviconUrl: '/favicon.ico',
    websiteUrl: 'https://triclinium.com',
    description: 'Premier manufacturer and integrator of enterprise 4K AI CCTV surveillance systems, Network Video Recorders (NVR), and smart wireless home alarm systems.',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
  },
  contact: {
    email: 'inquiries@triclinium.com',
    phone: '+1 (800) 555-0199',
    address: '742 Security Parkway, Suite 500, Tech & Security District, NY 10001',
    businessHours: 'Monday - Friday: 8:00 AM - 6:00 PM EST (24/7 Monitoring Center)',
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
    defaultTitle: 'TRICLINIUM | CCTV Surveillance & Advanced Alarm Systems',
    defaultDescription: 'Explore our catalog of high-definition 4K AI CCTV cameras, commercial NVR video storage, wireless intruder alarms, and biometric access control systems.',
    ogImageUrl: '/images/og-cctv.jpg',
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://triclinium.com/sitemap.xml',
  },
  email: {
    senderName: 'TRICLINIUM Security Enterprise',
    senderEmail: 'notifications@triclinium.com',
    notificationRecipients: ['archer.tritech@gmail.com', 'sales@triclinium.com'],
  },
};

export function slugify(text: string): string {
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

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateReferenceNumber(prefix: string = 'TRIC'): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${rand}`;
}
