import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_WEBSITE_SETTINGS, PERMISSIONS } from '../packages/shared/src/index';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TRICLINIUM database seeding...');

  // 1. SYSTEM ROLES
  console.log('Seeding Roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Universal administrative and security control',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Operations, catalog, inquiries, and CMS management',
      isSystem: true,
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Content editor for pages, articles, and FAQs',
      isSystem: true,
    },
  });

  const salesManagerRole = await prisma.role.upsert({
    where: { name: 'SALES_MANAGER' },
    update: {},
    create: {
      name: 'SALES_MANAGER',
      description: 'Inquiries, quotations, and customer communications',
      isSystem: true,
    },
  });

  // 2. PERMISSIONS
  console.log('Seeding Permissions...');
  const permissionsData = [
    { code: PERMISSIONS.PRODUCTS_VIEW, name: 'View Products', module: 'Products' },
    { code: PERMISSIONS.PRODUCTS_CREATE, name: 'Create Products', module: 'Products' },
    { code: PERMISSIONS.PRODUCTS_EDIT, name: 'Edit Products', module: 'Products' },
    { code: PERMISSIONS.PRODUCTS_DELETE, name: 'Delete Products', module: 'Products' },
    { code: PERMISSIONS.PRODUCTS_PUBLISH, name: 'Publish Products', module: 'Products' },

    { code: PERMISSIONS.SERVICES_VIEW, name: 'View Services', module: 'Services' },
    { code: PERMISSIONS.SERVICES_CREATE, name: 'Create Services', module: 'Services' },
    { code: PERMISSIONS.SERVICES_EDIT, name: 'Edit Services', module: 'Services' },
    { code: PERMISSIONS.SERVICES_DELETE, name: 'Delete Services', module: 'Services' },
    { code: PERMISSIONS.SERVICES_PUBLISH, name: 'Publish Services', module: 'Services' },

    { code: PERMISSIONS.INQUIRIES_VIEW, name: 'View Inquiries', module: 'Inquiries' },
    { code: PERMISSIONS.INQUIRIES_EDIT, name: 'Edit Inquiries', module: 'Inquiries' },
    { code: PERMISSIONS.INQUIRIES_DELETE, name: 'Delete Inquiries', module: 'Inquiries' },
    { code: PERMISSIONS.INQUIRIES_EXPORT, name: 'Export Inquiries', module: 'Inquiries' },

    { code: PERMISSIONS.CMS_VIEW, name: 'View CMS Content', module: 'CMS' },
    { code: PERMISSIONS.CMS_EDIT, name: 'Edit CMS Content', module: 'CMS' },
    { code: PERMISSIONS.CMS_PUBLISH, name: 'Publish CMS Content', module: 'CMS' },

    { code: PERMISSIONS.MEDIA_VIEW, name: 'View Media Assets', module: 'Media' },
    { code: PERMISSIONS.MEDIA_UPLOAD, name: 'Upload Media Assets', module: 'Media' },
    { code: PERMISSIONS.MEDIA_DELETE, name: 'Delete Media Assets', module: 'Media' },

    { code: PERMISSIONS.ADMIN_USERS_MANAGE, name: 'Manage Administrators', module: 'Administration' },
    { code: PERMISSIONS.SETTINGS_MANAGE, name: 'Configure Settings', module: 'System' },
    { code: PERMISSIONS.AUDIT_LOGS_VIEW, name: 'View Audit Logs', module: 'Audit' },
  ];

  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });

    // Assign to Super Admin
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: p.id },
    });

    // Assign to Admin (except system/admin settings)
    if (![PERMISSIONS.ADMIN_USERS_MANAGE, PERMISSIONS.SETTINGS_MANAGE].includes(perm.code as any)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      });
    }

    // Assign to Editor (CMS, Media, View catalog)
    if (
      [
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.SERVICES_VIEW,
        PERMISSIONS.CMS_VIEW,
        PERMISSIONS.CMS_EDIT,
        PERMISSIONS.CMS_PUBLISH,
        PERMISSIONS.MEDIA_VIEW,
        PERMISSIONS.MEDIA_UPLOAD,
      ].includes(perm.code as any)
    ) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: editorRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: editorRole.id, permissionId: p.id },
      });
    }

    // Assign to Sales Manager (Inquiries, Quotes, View catalog)
    if (
      [
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.SERVICES_VIEW,
        PERMISSIONS.INQUIRIES_VIEW,
        PERMISSIONS.INQUIRIES_EDIT,
        PERMISSIONS.INQUIRIES_EXPORT,
      ].includes(perm.code as any)
    ) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: salesManagerRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: salesManagerRole.id, permissionId: p.id },
      });
    }
  }

  // 3. INITIAL SUPER ADMIN USER
  console.log('Seeding Initial Super Administrator...');
  const superAdminEmail = 'admin@triclinium.com';
  const superAdminPasswordHash = await bcrypt.hash('Admin123!@#', 12);

  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      passwordHash: superAdminPasswordHash,
      firstName: 'Chief',
      lastName: 'Administrator',
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdminUser.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdminUser.id, roleId: superAdminRole.id },
  });

  // 4. GLOBAL WEBSITE SETTINGS
  console.log('Seeding Website Settings...');
  await prisma.websiteSetting.upsert({
    where: { key: 'global_settings' },
    update: {},
    create: {
      key: 'global_settings',
      value: DEFAULT_WEBSITE_SETTINGS as any,
    },
  });

  // 5. PRODUCT CATEGORIES
  console.log('Seeding Product Categories...');
  const catArch = await prisma.productCategory.upsert({
    where: { slug: 'architectural-hardware' },
    update: {},
    create: {
      name: 'Architectural Hardware',
      slug: 'architectural-hardware',
      description: 'Heavy-duty industrial pivot systems, architectural glass fittings, and structural hinges.',
      displayOrder: 1,
    },
  });

  const catPrecision = await prisma.productCategory.upsert({
    where: { slug: 'precision-assemblies' },
    update: {},
    create: {
      name: 'Precision Assemblies',
      slug: 'precision-assemblies',
      description: 'Precision CNC machined mechanical couplings, bearings, and high-tolerance components.',
      displayOrder: 2,
    },
  });

  const catDigital = await prisma.productCategory.upsert({
    where: { slug: 'digital-industrial-software' },
    update: {},
    create: {
      name: 'Industrial Software & Telemetry',
      slug: 'digital-industrial-software',
      description: 'Enterprise asset management, real-time IoT monitoring suites, and calibration software.',
      displayOrder: 3,
    },
  });

  // 6. PRODUCTS
  console.log('Seeding Products...');
  await prisma.product.upsert({
    where: { slug: 'titan-pivot-hinge-750' },
    update: {},
    create: {
      name: 'Titan-Forged Pivot Hinge 750',
      slug: 'titan-pivot-hinge-750',
      sku: 'TRIC-HW-750',
      shortDescription: 'Industrial-grade architectural pivot hinge engineered for doors up to 750kg.',
      fullDescription: 'The Titan-Forged 750 is machined from solid 316 marine-grade stainless steel with sealed dual needle-thrust bearings. Designed for monumental entrances and extreme environmental exposure, delivering effortless rotation with zero maintenance.',
      categoryId: catArch.id,
      price: 1250.0,
      promotionalPrice: 1120.0,
      currency: 'USD',
      priceVisible: true,
      availability: 'IN_STOCK',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'Titan-Forged Pivot Hinge 750 | TRICLINIUM',
      seoDescription: 'High-capacity 750kg architectural pivot hinge with marine grade 316 stainless steel.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
            altText: 'Titan-Forged Pivot Hinge Top Assembly',
            isPrimary: true,
            displayOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
            altText: 'Precision milled stainless steel pivot core',
            isPrimary: false,
            displayOrder: 1,
          },
        ],
      },
      features: {
        create: [
          { featureText: 'Machined from forged 316-L marine-grade stainless steel', displayOrder: 0 },
          { featureText: 'Maximum door leaf capacity up to 750 kg (1,650 lbs)', displayOrder: 1 },
          { featureText: 'Integrated 3D micro-adjustment mechanism (X, Y, Z axes)', displayOrder: 2 },
          { featureText: 'Tested to over 1,000,000 continuous operating cycles', displayOrder: 3 },
        ],
      },
      specifications: {
        create: [
          { name: 'Load Capacity', value: '750 kg', group: 'Mechanical', displayOrder: 0 },
          { name: 'Material', value: 'AISI 316 Stainless Steel', group: 'Materials', displayOrder: 1 },
          { name: 'Rotation Range', value: '360° Free Swing with optional 90° hold-open', group: 'Operation', displayOrder: 2 },
          { name: 'Certification', value: 'EN 1154 / ANSI Grade 1 Compliant', group: 'Compliance', displayOrder: 3 },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'aerolock-linear-coupler' },
    update: {},
    create: {
      name: 'AeroLock High-Torque Linear Coupler',
      slug: 'aerolock-linear-coupler',
      sku: 'TRIC-PC-420',
      shortDescription: 'Zero-backlash precision coupling designed for high-dynamic servomotor drives.',
      fullDescription: 'The AeroLock linear coupling provides torsionally rigid power transmission with exceptional vibration damping. Features aircraft-grade anodized aluminum clamping hubs and a precision stainless steel disc pack.',
      categoryId: catPrecision.id,
      price: 485.0,
      currency: 'USD',
      priceVisible: true,
      availability: 'IN_STOCK',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'AeroLock Linear Coupler | Precision Engineering',
      seoDescription: 'Zero-backlash precision linear servo coupler with high torsional stiffness.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
            altText: 'AeroLock Precision Coupler',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      features: {
        create: [
          { featureText: 'Zero rotational backlash under reversing loads', displayOrder: 0 },
          { featureText: 'High torsional stiffness with flexible disc pack', displayOrder: 1 },
          { featureText: 'Rated speeds up to 18,000 RPM continuous', displayOrder: 2 },
        ],
      },
      specifications: {
        create: [
          { name: 'Nominal Torque', value: '180 Nm', group: 'Ratings', displayOrder: 0 },
          { name: 'Max Speed', value: '18,000 RPM', group: 'Ratings', displayOrder: 1 },
          { name: 'Bore Diameters', value: '12mm to 35mm keyed or clamp', group: 'Dimensions', displayOrder: 2 },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'omniflow-scada-telemetry-suite' },
    update: {},
    create: {
      name: 'OmniFlow Industrial SCADA Telemetry Suite',
      slug: 'omniflow-scada-telemetry-suite',
      sku: 'TRIC-SW-OMNI',
      shortDescription: 'Cloud-native digital asset telemetry, real-time edge monitoring, and predictive maintenance platform.',
      fullDescription: 'OmniFlow connects physical machinery to cloud analytics via MQTT and OPC-UA protocols. Offers sub-second anomaly detection, vibration telemetry analysis, automated alert dispatching, and comprehensive web dashboard visualization.',
      categoryId: catDigital.id,
      price: 3400.0,
      promotionalPrice: 2950.0,
      currency: 'USD',
      priceVisible: true,
      availability: 'IN_STOCK',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'OmniFlow SCADA Telemetry Software | TRICLINIUM',
      seoDescription: 'Industrial telemetry and asset health predictive maintenance platform.',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            altText: 'OmniFlow SCADA Monitoring Dashboard',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      features: {
        create: [
          { featureText: 'Multi-protocol telemetry ingestion (OPC-UA, Modbus TCP, MQTT)', displayOrder: 0 },
          { featureText: 'Predictive vibration and bearing health algorithms', displayOrder: 1 },
          { featureText: 'Customizable role-based dashboards and SMS/Email escalation', displayOrder: 2 },
          { featureText: 'Full REST and WebSocket API for ERP synchronization', displayOrder: 3 },
        ],
      },
      specifications: {
        create: [
          { name: 'Deployment', value: 'Cloud-hosted or On-Premises Docker Appliance', group: 'Architecture', displayOrder: 0 },
          { name: 'Data Ingestion Rate', value: 'Up to 50,000 events/second per cluster node', group: 'Performance', displayOrder: 1 },
          { name: 'Security', value: 'TLS 1.3, mTLS Device Identity, SOC2 Type II Verified', group: 'Security', displayOrder: 2 },
        ],
      },
    },
  });

  // 7. SERVICE CATEGORIES & SERVICES
  console.log('Seeding Services...');
  const srvCatEngineering = await prisma.serviceCategory.upsert({
    where: { slug: 'engineering-consulting' },
    update: {},
    create: {
      name: 'Engineering Consulting & Design',
      slug: 'engineering-consulting',
      description: 'Feasibility analysis, finite element structural verification, and mechanical design.',
      displayOrder: 1,
    },
  });

  const srvCatFabrication = await prisma.serviceCategory.upsert({
    where: { slug: 'precision-fabrication' },
    update: {},
    create: {
      name: 'Precision Fabrication & Prototyping',
      slug: 'precision-fabrication',
      description: '5-axis CNC milling, laser cutting, certified GTAW welding, and assembly.',
      displayOrder: 2,
    },
  });

  await prisma.service.upsert({
    where: { slug: '5-axis-cnc-machining-fabrication' },
    update: {},
    create: {
      name: 'Advanced 5-Axis CNC Precision Machining',
      slug: '5-axis-cnc-machining-fabrication',
      shortDescription: 'High-tolerance custom component fabrication in titanium, stainless steel, and aerospace aluminum alloys.',
      fullDescription: 'Our advanced facility provides end-to-end multi-axis CNC manufacturing. From CAD review and toolpath optimization to CMM coordinate verification and protective surface finishing, we deliver mission-critical components with tolerances within ±0.005mm.',
      categoryId: srvCatFabrication.id,
      featuredImage: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80',
      pricingModel: 'CUSTOM_QUOTE',
      currency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: '5-Axis CNC Machining Services | TRICLINIUM',
      seoDescription: 'High-precision multi-axis CNC milling and prototyping services.',
      displayOrder: 1,
      features: {
        create: [
          { featureType: 'feature', title: 'Tolerances down to ±0.005 mm (5 microns)', displayOrder: 0 },
          { featureType: 'feature', title: 'Work envelope up to 1,200mm × 800mm × 650mm', displayOrder: 1 },
          { featureType: 'feature', title: 'Raw materials: Inconel, Titanium, 316L, 7075-T6', displayOrder: 2 },
          { featureType: 'benefit', title: 'Reduced lead time through integrated CAD/CAM toolpaths', displayOrder: 0 },
          { featureType: 'benefit', title: 'Full material traceability and optical CMM inspection reports', displayOrder: 1 },
          { featureType: 'process_step', title: 'Engineering CAD Analysis', description: 'Review design for manufacturability (DFM) and material specifications.', displayOrder: 0 },
          { featureType: 'process_step', title: 'Toolpath Simulation & Setup', description: 'Virtual collision testing and custom fixture preparation.', displayOrder: 1 },
          { featureType: 'process_step', title: 'Multi-Axis Execution', description: 'High-speed automated CNC milling with continuous coolant control.', displayOrder: 2 },
          { featureType: 'process_step', title: 'Metrology & QA Certification', description: 'Coordinate measuring machine (CMM) verification and delivery packaging.', displayOrder: 3 },
        ],
      },
    },
  });

  await prisma.service.upsert({
    where: { slug: 'structural-fea-verification' },
    update: {},
    create: {
      name: 'Structural Finite Element Analysis (FEA)',
      slug: 'structural-fea-verification',
      shortDescription: 'Comprehensive stress analysis, harmonic vibration testing, and thermal load modeling for critical industrial assemblies.',
      fullDescription: 'TRICLINIUM engineers utilize high-fidelity computational mechanics to simulate real-world physical stresses before fabrication begins. We provide certified calculations verifying safety factors, cyclic fatigue life, and compliance with international building codes.',
      categoryId: srvCatEngineering.id,
      featuredImage: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1200&q=80',
      pricingModel: 'FIXED',
      price: 2800.0,
      currency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'Structural FEA Engineering Verification | TRICLINIUM',
      seoDescription: 'Finite element analysis and computational engineering simulations for industrial assemblies.',
      displayOrder: 2,
      features: {
        create: [
          { featureType: 'feature', title: 'Static and dynamic stress distribution modeling', displayOrder: 0 },
          { featureType: 'feature', title: 'Harmonic vibration and seismic resonance simulation', displayOrder: 1 },
          { featureType: 'benefit', title: 'Eliminate failure modes prior to physical tooling expenditure', displayOrder: 0 },
          { featureType: 'process_step', title: 'Geometry Clean-up & Meshing', description: 'Construct high-density polyhedral or hexahedral finite meshes.', displayOrder: 0 },
          { featureType: 'process_step', title: 'Boundary Condition Modeling', description: 'Apply operational loads, thermal gradients, and mounting constraints.', displayOrder: 1 },
          { featureType: 'process_step', title: 'Calculation & Formal Reporting', description: 'Deliver comprehensive certified report with von Mises contours and recommendations.', displayOrder: 2 },
        ],
      },
    },
  });

  // 8. TESTIMONIALS
  console.log('Seeding Testimonials...');
  await prisma.testimonial.createMany({
    data: [
      {
        clientName: 'Marcus Vance',
        clientRole: 'Director of Capital Projects',
        companyName: 'Vanguard Infrastructure Group',
        clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        content: 'TRICLINIUM engineered custom heavy-pivot mechanisms for our metropolitan transit headquarters. Their engineering rigor, adherence to tolerance specifications, and prompt delivery set the industry standard.',
        rating: 5,
        isFeatured: true,
        status: 'PUBLISHED',
        displayOrder: 1,
      },
      {
        clientName: 'Elena Rostova',
        clientRole: 'Chief Plant Engineer',
        companyName: 'AeroDynamics Propulsion Labs',
        clientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
        content: 'The OmniFlow telemetry package transformed how we monitor high-frequency vibration across our turbine testing cells. Integration took less than 48 hours, and uptime has remained at 100%.',
        rating: 5,
        isFeatured: true,
        status: 'PUBLISHED',
        displayOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  // 9. FAQS
  console.log('Seeding FAQs...');
  await prisma.faq.createMany({
    data: [
      {
        question: 'What is the standard lead time for custom manufactured components?',
        answer: 'Standard fabrication lead times range between 10 to 18 business days following engineering review and CAD sign-off. Expedited priority production is available for critical project timelines.',
        category: 'Manufacturing',
        displayOrder: 1,
        isPublished: true,
      },
      {
        question: 'Do you provide material test certificates and CMM inspection reports?',
        answer: 'Yes. Every component produced in our facilities is accompanied by full mill test reports (MTR) demonstrating chemical and physical composition, along with calibrated coordinate measuring machine (CMM) inspection data.',
        category: 'Quality Assurance',
        displayOrder: 2,
        isPublished: true,
      },
      {
        question: 'How do I submit an official Request for Quotation (RFQ)?',
        answer: 'You can build an RFQ directly through our website by adding items to the Quotation Builder, or submit your project drawings and specifications through our online inquiry desk.',
        category: 'Procurement',
        displayOrder: 3,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  });

  // 10. BLOG POSTS
  console.log('Seeding Blog Posts...');
  const blogCategory = await prisma.blogCategory.upsert({
    where: { slug: 'engineering-insights' },
    update: {},
    create: {
      name: 'Engineering & Materials',
      slug: 'engineering-insights',
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: 'optimizing-monumental-pivot-assemblies' },
    update: {},
    create: {
      title: 'Optimizing Monumental Architectural Pivot Assemblies: Structural Dynamics & Bearing Longevity',
      slug: 'optimizing-monumental-pivot-assemblies',
      excerpt: 'An in-depth analysis of eccentric load vectors, thermal expansion considerations, and needle-thrust bearing configurations in high-tonnage architectural hardware.',
      content: 'When designing architectural portals exceeding 500 kilograms, conventional hinge kinematics fail due to excessive cantilever deflection. The solution lies in vertical load transfer through ground-anchored thrust bearings...\n\n### 1. Kinematic Vector Analysis\nBy decoupling vertical gravity loads from lateral wind-pressure moments, engineers eliminate premature bearing binding. In the TRICLINIUM Titan-750 series, dual needle-thrust assemblies manage static downward loads up to 15,000 N while lateral bronze bushings absorb horizontal Shear forces...\n\n### 2. Marine Grade Materials\nExposure to seaside environments accelerates galvanic oxidation. Solid 316-L passivation creates a protective chromium oxide layer preventing pitting corrosion along high-stress micro-machined fillets.',
      featuredImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      categoryId: blogCategory.id,
      authorName: 'Dr. Arthur Sterling, Lead Metallurgist',
      status: 'PUBLISHED',
      seoTitle: 'Monumental Pivot Assemblies & Bearing Longevity | TRICLINIUM',
      seoDescription: 'Technical engineering analysis of heavy architectural pivot hardware and bearing design.',
      publishedAt: new Date(),
    },
  });

  // 11. HOMEPAGE SECTIONS
  console.log('Seeding Homepage CMS Sections...');
  const homePage = await prisma.page.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      title: 'TRICLINIUM Corporate Portal',
      slug: 'home',
      content: 'Dynamic Homepage Content',
      status: 'PUBLISHED',
    },
  });

  await prisma.pageSection.upsert({
    where: { id: 'seed-hero-slide-1' },
    update: {},
    create: {
      id: 'seed-hero-slide-1',
      pageId: homePage.id,
      key: 'hero_slide',
      title: 'Primary Hero Slide',
      displayOrder: 1,
      isEnabled: true,
      content: {
        headline: 'Precision Industrial Engineering & Architectural Excellence',
        subheadline: 'Manufacturer of high-tolerance mechanical assemblies, heavy-duty architectural hardware, and enterprise industrial telemetry software.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=85',
        primaryCtaText: 'Explore Catalog',
        primaryCtaLink: '/products',
        secondaryCtaText: 'Request Quotation',
        secondaryCtaLink: '/contact',
      },
    },
  });

  await prisma.pageSection.upsert({
    where: { id: 'seed-stats-section' },
    update: {},
    create: {
      id: 'seed-stats-section',
      pageId: homePage.id,
      key: 'stats',
      title: 'Corporate Statistics',
      displayOrder: 2,
      isEnabled: true,
      content: {
        stats: [
          { label: 'Precision Tolerances Achieved', value: '±0.005mm' },
          { label: 'Enterprise Projects Delivered', value: '450+' },
          { label: 'Maximum Load Capacity Certified', value: '750kg' },
          { label: 'Uptime Reliability SLA', value: '99.99%' },
        ],
      },
    },
  });

  await prisma.pageSection.upsert({
    where: { id: 'seed-why-us-section' },
    update: {},
    create: {
      id: 'seed-why-us-section',
      pageId: homePage.id,
      key: 'why_us',
      title: 'Why Global Industry Leaders Partner with TRICLINIUM',
      displayOrder: 3,
      isEnabled: true,
      content: {
        items: [
          {
            title: 'Rigorous Metallurgy & Traceability',
            description: '100% optical spectrometry and full heat-lot mill test certificates on all stainless and aerospace alloys.',
            icon: 'ShieldCheck',
          },
          {
            title: 'Bespoke CNC & Prototyping',
            description: 'Integrated 5-axis machining centers with automated CMM inspection for mission-critical parts.',
            icon: 'Cpu',
          },
          {
            title: 'End-to-End Quotation & Consultation',
            description: 'Direct collaboration with registered mechanical engineers from RFQ through installation sign-off.',
            icon: 'FileText',
          },
        ],
      },
    },
  });

  console.log('✅ TRICLINIUM database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
