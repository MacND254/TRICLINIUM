import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STANDARD_PAGES = [
  {
    slug: 'services',
    title: 'Professional CCTV & Security Services',
    seoTitle: 'CCTV Installation & Smart Security Services | TRICLINIUM',
    seoDescription: 'Professional 4K CCTV installation, smart video doorbells, wireless alarms, intercoms, and mesh networking across Kenya.',
    content: 'From residential homes in Nairobi to commercial enterprises across Kenya, our licensed engineers deliver turnkey surveillance, smart video doorbells, wireless alarms, intercoms, electric fencing, and high-speed mesh Wi-Fi.',
    hero: {
      badge: 'Certified Security Engineering · East Africa',
      title: 'Professional CCTV, Alarms & Smart Security Installations',
      subtitle: 'From residential homes in Nairobi to commercial enterprises across Kenya, our licensed engineers deliver turnkey surveillance, smart video doorbells, wireless alarms, intercoms, electric fencing, and high-speed mesh Wi-Fi.',
      backgroundImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80',
      bullets: [
        'Free Nairobi Site Survey',
        '1-Year On-Site Workmanship Warranty',
        'Clean, Concealed Conduit Cabling',
        'Transparent KES Pricing',
      ],
      isEnabled: true,
    },
  },
  {
    slug: 'products',
    title: 'Security Products & Hardware Equipment',
    seoTitle: 'Surveillance Cameras, Doorbells & Alarms | TRICLINIUM',
    seoDescription: 'Explore 4K AI CCTV cameras, smart video doorbells, intruder alarms, and video intercoms priced in KES.',
    content: 'Explore our certified 4K AI CCTV cameras, smart video doorbells, door cams, wireless intruder alarm systems, nanny cameras, video intercoms, home mesh networking, and perimeter defense systems — priced in Kenyan Shillings (KES).',
    hero: {
      badge: 'Surveillance & Intelligent Security Systems',
      title: 'Security Products & Hardware Equipment',
      subtitle: 'Explore our certified 4K AI CCTV cameras, smart video doorbells, door cams, wireless intruder alarm systems, nanny cameras, video intercoms, home mesh networking, and perimeter defense systems.',
      backgroundImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1920&q=80',
      bullets: [
        '100% Genuine Certified Hardware',
        '1-Year Equipment Replacement Warranty',
        'Same-Day Nairobi Delivery Available',
        'Pre-Configured & Plug-and-Play Ready',
      ],
      isEnabled: true,
    },
  },
  {
    slug: 'about',
    title: 'About TRICLINIUM SYSTEMS',
    seoTitle: 'About Us | TRICLINIUM SYSTEMS · CCTV & Security',
    seoDescription: 'Learn about TRICLINIUM SYSTEMS, our certified technicians, 4K AI surveillance cameras, and smart wireless alarms.',
    content: 'Founded in 2014 by security engineers and network infrastructure specialists, TRICLINIUM delivers end-to-end CCTV surveillance, smart wireless intruder alarms, and integrated biometric access control solutions for residences, retail establishments, and corporate enterprises across Kenya.',
    hero: {
      badge: 'About TRICLINIUM SYSTEMS',
      title: 'Dedicated to Total Situational Awareness & Proactive Security',
      subtitle: 'Founded in 2014 by security engineers and network infrastructure specialists, TRICLINIUM delivers end-to-end CCTV surveillance, smart wireless intruder alarms, and integrated biometric access control solutions.',
      backgroundImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1920&q=80',
      bullets: [
        'Over 10 Years Industry Track Record',
        'Licensed Engineering Specialists',
        'Zero Blind Spots Commitment',
        'Encrypted Stream Privacy',
      ],
      isEnabled: true,
    },
  },
  {
    slug: 'contact',
    title: 'Contact TRICLINIUM Enterprise',
    seoTitle: 'Contact Engineering & Sales | TRICLINIUM',
    seoDescription: 'Connect directly with registered engineers, technical sales representatives, and procurement specialists.',
    content: 'Connect directly with registered engineers, technical sales representatives, and procurement specialists for site surveys and custom quotations.',
    hero: {
      badge: '24/7 Monitoring Desk & Technical Inquiries',
      title: 'Contact TRICLINIUM Enterprise',
      subtitle: 'Connect directly with registered engineers, technical sales representatives, and procurement specialists.',
      backgroundImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1920&q=80',
      bullets: [
        'Immediate Phone Consultation',
        'Free Nairobi Site Visit Booking',
        'Fast Formal RFQ Turnaround',
      ],
      isEnabled: true,
    },
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    seoTitle: 'Frequently Asked Questions | TRICLINIUM',
    seoDescription: 'Common questions regarding CCTV installations, warranties, surveillance tech, and remote viewing.',
    content: 'Answers to the most common questions regarding our CCTV installation process, warranty coverage, mobile app streaming, and maintenance plans.',
    hero: {
      badge: 'Help & Support Knowledgebase',
      title: 'Frequently Asked Questions',
      subtitle: 'Common questions regarding CCTV installations, warranties, surveillance tech, and remote viewing.',
      backgroundImage: 'https://images.unsplash.com/photo-1558618047-f4e70e3e6fa7?auto=format&fit=crop&w=1920&q=80',
      bullets: [
        'Installation Timelines & Surveys',
        'Mobile App & Cloud Access',
        'Warranty & Replacement Policies',
      ],
      isEnabled: true,
    },
  },
  {
    slug: 'testimonials',
    title: 'Client Case Studies & Endorsements',
    seoTitle: 'Client Endorsements & Case Studies | TRICLINIUM',
    seoDescription: 'Verified reviews from infrastructure leaders, homeowners, and security directors using TRICLINIUM.',
    content: 'Discover how enterprise clients and residential estates achieve zero-downtime security and verified protection with TRICLINIUM systems.',
    hero: {
      badge: 'Verified Reviews & Case Studies',
      title: 'Client Case Studies & Endorsements',
      subtitle: 'Discover how enterprise clients and residential estates achieve zero-downtime operations and certified structural excellence with TRICLINIUM hardware and software.',
      backgroundImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1920&q=80',
      bullets: [
        'Verified Commercial Installations',
        'Gated Community Perimeter Protection',
        '24/7 Monitoring Station Uptime',
      ],
      isEnabled: true,
    },
  },
  {
    slug: 'privacy-policy',
    title: 'TRICLINIUM Privacy Policy',
    seoTitle: 'Privacy Policy | TRICLINIUM',
    seoDescription: 'Our commitment to privacy, data security, and client confidentiality.',
    content: `TRICLINIUM Commercial & Industrial Enterprise ("TRICLINIUM", "we", "our", or "us") is committed to protecting your privacy and confidential engineering specifications. This policy outlines how we collect, store, and process business contact information and inquiry data.

### 1. Information We Collect
When you submit inquiries or request commercial quotations, we collect your name, corporate email address, telephone number, organization name, and relevant technical project details.

### 2. Engineering & CAD Confidentiality
All CAD drawings, dimensional tolerances, and security camera floorplans transmitted to our engineering desk are governed by strict non-disclosure obligations. We never sell, lease, or share technical assets with third-party vendors.

### 3. Data Retention & Security
Inquiry and quotation records are stored in encrypted PostgreSQL database storage complying with modern enterprise cybersecurity standards.`,
    hero: {
      badge: 'Legal & Privacy Compliance',
      title: 'TRICLINIUM Privacy Policy',
      subtitle: 'Effective Date: January 1, 2026. How we protect your data and privacy.',
      backgroundImage: '',
      isEnabled: false,
    },
  },
  {
    slug: 'terms-and-conditions',
    title: 'Commercial Terms & Conditions of Engagement',
    seoTitle: 'Terms & Conditions | TRICLINIUM',
    seoDescription: 'Commercial terms of engagement, warranties, and service agreements.',
    content: `### 1. Quotations and Proposals
Submission of an RFQ through this website constitutes a non-binding request for pricing. An official purchase contract is executed only upon mutual execution of a formal Purchase Order (PO) and specification sign-off.

### 2. Installation Standards & Workmanship
All cabling, camera mounting, and network equipment are installed in conformance with Kenyan Telecommunications and Electrical Safety regulations.

### 3. Warranties & Certifications
TRICLINIUM certifies that all hardware adheres to supplied manufacturer warranties and 1-Year on-site labor coverage.`,
    hero: {
      badge: 'Terms of Service',
      title: 'Commercial Terms & Conditions',
      subtitle: 'Effective Date: January 1, 2026. Terms governing sales and installations.',
      backgroundImage: '',
      isEnabled: false,
    },
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie & Tracking Policy',
    seoTitle: 'Cookie Policy | TRICLINIUM',
    seoDescription: 'How we use cookies to optimize system speed and security.',
    content: `### 1. Use of Cookies
TRICLINIUM uses strictly necessary and performance cookies to maintain secure sessions, remember theme preferences, and optimize system speed.

### 2. Managing Preferences
You can adjust your browser settings at any time to block or delete cookies without affecting your ability to browse our catalog or submit quotes.`,
    hero: {
      badge: 'Cookie Guidelines',
      title: 'Cookie & Tracking Policy',
      subtitle: 'Details on session cookies, performance telemetry, and user preferences.',
      backgroundImage: '',
      isEnabled: false,
    },
  },
];

async function seedPages() {
  console.log('Seeding standard CMS pages...');

  for (const item of STANDARD_PAGES) {
    const page = await prisma.page.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        status: 'PUBLISHED',
      },
      create: {
        slug: item.slug,
        title: item.title,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        content: item.content,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    if (item.hero) {
      const existingHero = await prisma.pageSection.findFirst({
        where: { pageId: page.id, key: 'hero' },
      });

      if (existingHero) {
        await prisma.pageSection.update({
          where: { id: existingHero.id },
          data: {
            title: item.hero.title || page.title,
            content: item.hero,
            isEnabled: item.hero.isEnabled !== false,
          },
        });
      } else {
        await prisma.pageSection.create({
          data: {
            pageId: page.id,
            key: 'hero',
            title: item.hero.title || page.title,
            content: item.hero,
            displayOrder: 0,
            isEnabled: item.hero.isEnabled !== false,
          },
        });
      }
    }

    console.log(`✓ Page "${item.slug}" synced.`);
  }

  console.log('All standard CMS pages seeded successfully.');
}

seedPages()
  .catch((e) => {
    console.error('Failed to seed pages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
