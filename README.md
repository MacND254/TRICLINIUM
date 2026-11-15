# TRICLINIUM Enterprise Business Platform

TRICLINIUM is a high-performance, modular full-stack web application designed for commercial & industrial precision engineering, architectural hardware, and telemetry systems. It features a public-facing website with dynamic product/service catalogs, an interactive Request for Quotation (RFQ) workflow, and a centralized administrative CMS console.

---

## Architecture & Monorepo Structure

```
TRICLINIUM/
├── apps/
│   ├── web/                     # Next.js 14 App Router (Public Site & Admin Portal)
│   │   ├── app/
│   │   │   ├── (public)/        # Public catalog, dynamic detail pages, search, contact
│   │   │   ├── admin/           # Secured admin dashboard, CMS managers, settings
│   │   │   └── api/revalidate/  # On-demand ISR revalidation webhook handler
│   │   ├── components/          # Reusable UI primitives, cards, sliders, drawers
│   │   └── lib/                 # API client, context providers (Quote, AdminAuth)
│   └── api/                     # Express.js REST API with TypeScript
│       ├── api/index.ts         # Vercel serverless entrypoint
│       ├── src/
│       │   ├── modules/         # Products, Services, Inquiries, CMS, Settings, Admin, Auth
│       │   ├── middleware/      # JWT Auth, RBAC, Rate Limiting, Audit Logging, Error Handling
│       │   ├── integrations/    # Prisma DB, Resilient Redis Cache, Resend Email, Cloudinary
│       │   └── docs/            # OpenAPI 3.0 / Swagger UI definition
│       └── jest.config.js       # Test configuration
├── packages/
│   ├── types/                   # Shared TypeScript DTOs, domain models, enum types
│   ├── shared/                  # RBAC permissions constants, formatting & slug utilities
│   └── validation/              # Centralized Zod validation schemas
├── prisma/
│   ├── schema.prisma            # Comprehensive relational schema with full indexes
│   └── seed.ts                  # Production-grade seed data (Roles, Admin, Products, FAQs)
├── vercel.json                  # Production serverless deployment configuration
└── tsconfig.base.json           # Shared TypeScript base configuration
```

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons, TanStack React Query, React Hook Form, Zod.
- **Backend**: Node.js, Express.js, TypeScript, Zod, OpenAPI / Swagger UI.
- **Database**: PostgreSQL with Prisma ORM (v5.22.0), relational constraints, composite indexes, soft deletes.
- **Cache**: Upstash Redis with resilient local in-memory fallback for offline/development operation.
- **Media**: Cloudinary integration with local fallback and data-URI fallbacks.
- **Email**: Resend transactional email with built-in responsive HTML templates.
- **Testing**: Jest with comprehensive validation, caching, and API test suites.

---

## Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL instance (Neon, Supabase, or local Docker)

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```
Fill in your database URL (`DATABASE_URL`) and JWT secret (`AUTH_SECRET`).

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma db push

# Seed initial database records
npx tsx prisma/seed.ts
```

**Default Admin Credentials**:
- **Email**: `archer.tritech@gmail.com`
- **Password**: `h34rtb347`

### 4. Build Monorepo
```bash
# Build shared packages (types, shared, validation)
npm run build:packages

# Build API backend
npm run build:api

# Build Next.js frontend
npm run build:web

# Or build everything concurrently:
npm run build
```

### 5. Running the Application
```bash
# Run both API (port 4000) and Web (port 3000) concurrently:
npm run dev

# Or run separately:
npm run dev --workspace=apps/api   # http://localhost:4000
npm run dev --workspace=apps/web   # http://localhost:3000
```

### 6. Running Tests
```bash
npm run test
```

---

## Key Features

### Public Website
- **Hero Slider**: Auto-advancing slider with customizable CTA links and background imagery.
- **Dynamic Catalog**: Full search, category filter, availability filter, pagination, and URL query persistence for `/products` and `/services`.
- **Interactive RFQ Cart**: Sticky slide-out Request for Quotation drawer allowing users to stage products, specify quantities, and submit instant quotation requests with auto-generated reference codes (`QUOT-XXXXX`).
- **SEO & Meta**: Complete dynamic XML sitemap (`/sitemap.xml`), robots (`/robots.txt`), OpenGraph meta, and ISR revalidation (`/api/revalidate`).
- **Legal & Informational**: Company about page, dynamic blog/insights, search engine, accordion FAQs, approved client testimonials, and legal compliance pages (Privacy, Terms, Cookies).

### Administrative Management Console
- **Dashboard**: Real-time KPI summary (products, services, inquiry counts, pending quotations) and chronological audit timeline.
- **Catalog Management**: Creation and editing forms for products (SKU, specifications, features, gallery, tiered pricing) and services (process steps, deliverables).
- **Inquiry & RFQ Pipeline**: Status workflow tracking (PENDING, REVIEWED, QUOTED, CLOSED), internal staff notes stream, urgency tags, and CSV export.
- **CMS Control**:
  - Homepage section customizer (hero slides, why-us items, metrics, stats)
  - Static custom pages (Markdown editor)
  - Blog & article management (rich Markdown, tags, categories, featured status)
  - FAQ manager with accordion preview and category assignment
  - Testimonial manager with approval and star rating controls
- **Media Library**: File upload handling, Cloudinary asset integration, clipboard copy, and removal.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions matrix, account lockout protection (5 failed attempts), user management.
- **Audit Logs**: Immutable audit trail tracking every modification with IP address, user attribution, and JSON metadata.
- **Global Settings**: Branding, contact details, social links, SEO defaults, and email notification toggles.
