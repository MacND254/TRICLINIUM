import { WebsiteSettingsDTO, RoleName } from '@triclinium/types';
export declare const SYSTEM_ROLES: Record<RoleName, {
    name: string;
    description: string;
}>;
export declare const PERMISSIONS: {
    readonly PRODUCTS_VIEW: "products.view";
    readonly PRODUCTS_CREATE: "products.create";
    readonly PRODUCTS_EDIT: "products.edit";
    readonly PRODUCTS_DELETE: "products.delete";
    readonly PRODUCTS_PUBLISH: "products.publish";
    readonly SERVICES_VIEW: "services.view";
    readonly SERVICES_CREATE: "services.create";
    readonly SERVICES_EDIT: "services.edit";
    readonly SERVICES_DELETE: "services.delete";
    readonly SERVICES_PUBLISH: "services.publish";
    readonly INQUIRIES_VIEW: "inquiries.view";
    readonly INQUIRIES_EDIT: "inquiries.edit";
    readonly INQUIRIES_DELETE: "inquiries.delete";
    readonly INQUIRIES_EXPORT: "inquiries.export";
    readonly CMS_VIEW: "cms.view";
    readonly CMS_EDIT: "cms.edit";
    readonly CMS_PUBLISH: "cms.publish";
    readonly MEDIA_VIEW: "media.view";
    readonly MEDIA_UPLOAD: "media.upload";
    readonly MEDIA_DELETE: "media.delete";
    readonly ADMIN_USERS_MANAGE: "admin.users.manage";
    readonly SETTINGS_MANAGE: "settings.manage";
    readonly AUDIT_LOGS_VIEW: "audit.view";
};
export declare const DEFAULT_WEBSITE_SETTINGS: WebsiteSettingsDTO;
export declare function slugify(text: string): string;
export declare function formatCurrency(amount: number, currency?: string): string;
export declare function generateReferenceNumber(prefix?: string): string;
//# sourceMappingURL=index.d.ts.map