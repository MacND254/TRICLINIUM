import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PERMISSIONS } from '@triclinium/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TRICLINIUM CCTV Surveillance & Security Database Seeding...');

  // ================= 1. ROLES & PERMISSIONS =================
  console.log('Seeding Roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Universal administrative and security control',
    },
  });

  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Operations, CCTV catalog, inquiries, and CMS management',
    },
  });

  await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Content editor for pages, articles, and FAQs',
    },
  });

  await prisma.role.upsert({
    where: { name: 'SALES_MANAGER' },
    update: {},
    create: {
      name: 'SALES_MANAGER',
      description: 'Inquiries, quotations, and customer communications',
    },
  });

  console.log('Seeding Permissions...');
  const permissionsList = [
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

  for (const perm of permissionsList) {
    const createdPerm = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module },
      create: perm,
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: createdPerm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: createdPerm.id,
      },
    });
  }

  // ================= 2. INITIAL SUPER ADMIN =================
  console.log('Seeding Initial Super Administrator...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Admin123!@#', salt);

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'admin@triclinium.com' },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      email: 'admin@triclinium.com',
      passwordHash,
      firstName: 'Chief',
      lastName: 'Administrator',
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // ================= 3. WEBSITE SETTINGS =================
  console.log('Seeding Website Settings...');
  const initialSettings = [
    { key: 'siteName', value: 'TRICLINIUM SYSTEMS' },
    { key: 'tagline', value: 'Next-Generation CCTV Surveillance, Smart Alarms & Home Network Infrastructure' },
    { key: 'description', value: 'Premier supplier and certified integrator of high-definition 4K AI CCTV cameras, smart doorbells, wireless home alarms, nanny cams, intercoms, and whole-home networking in Kenya.' },
    { key: 'contactEmail', value: 'inquiries@triclinium.com' },
    { key: 'supportEmail', value: 'support@triclinium.com' },
    { key: 'notifyEmail', value: 'admin@triclinium.com' },
    { key: 'phone', value: '+254 700 555 199' },
    { key: 'phoneAlt', value: '+254 711 555 198' },
    { key: 'address', value: 'Westlands Commercial Center, Ring Road, Nairobi, Kenya' },
    { key: 'businessHours', value: 'Monday - Saturday: 8:00 AM - 6:00 PM EAT (24/7 Monitoring Station)' },
    { key: 'showPrices', value: 'true' },
    { key: 'enableQuotations', value: 'true' },
    { key: 'metaTitle', value: 'TRICLINIUM SYSTEMS | CCTV Surveillance & Smart Security' },
    { key: 'metaDescription', value: 'Commercial and residential video surveillance, 4K AI IP cameras, smart video doorbells, wireless home alarms, and certified installation across Kenya.' },
    { key: 'currency', value: 'KES' },
    { key: 'currencySymbol', value: 'Ksh' },
    { key: 'mailGatewayProvider', value: 'SMTP' },
    { key: 'smtpHost', value: 'smtp.gmail.com' },
    { key: 'smtpPort', value: '587' },
    { key: 'smtpSecure', value: 'false' },
    { key: 'smtpUser', value: '' },
    { key: 'smtpPass', value: '' },
    { key: 'smtpFromEmail', value: 'notifications@triclinium.com' },
    { key: 'smtpFromName', value: 'TRICLINIUM SYSTEMS Alert' },
  ];

  for (const s of initialSettings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  // ================= 4. PRODUCT CATEGORIES =================
  console.log('Seeding CCTV & Alarm Product Categories...');
  const catCameras = await prisma.productCategory.upsert({
    where: { slug: 'ai-ip-surveillance-cameras' },
    update: {
      name: 'AI IP Surveillance Cameras',
      description: 'Commercial 4K Ultra-HD optical surveillance cameras with human/vehicle edge analytics and active deterrent strobes.',
      displayOrder: 1,
    },
    create: {
      name: 'AI IP Surveillance Cameras',
      slug: 'ai-ip-surveillance-cameras',
      description: 'Commercial 4K Ultra-HD optical surveillance cameras with human/vehicle edge analytics and active deterrent strobes.',
      displayOrder: 1,
    },
  });

  const catNVR = await prisma.productCategory.upsert({
    where: { slug: 'nvr-video-recorders' },
    update: {
      name: 'Network Video Recorders (NVR)',
      description: 'Enterprise PoE NVR units supporting 8 to 128 channels with RAID redundancy, H.265+ compression, and AI smart search.',
      displayOrder: 2,
    },
    create: {
      name: 'Network Video Recorders (NVR)',
      slug: 'nvr-video-recorders',
      description: 'Enterprise PoE NVR units supporting 8 to 128 channels with RAID redundancy, H.265+ compression, and AI smart search.',
      displayOrder: 2,
    },
  });

  const catAlarms = await prisma.productCategory.upsert({
    where: { slug: 'smart-home-alarm-systems' },
    update: {
      name: 'Smart Home Alarm Systems',
      description: 'Intelligent wireless intruder detection hubs, dual PIR motion sensors, magnetic door contacts, and outdoor solar sirens.',
      displayOrder: 3,
    },
    create: {
      name: 'Smart Home Alarm Systems',
      slug: 'smart-home-alarm-systems',
      description: 'Intelligent wireless intruder detection hubs, dual PIR motion sensors, magnetic door contacts, and outdoor solar sirens.',
      displayOrder: 3,
    },
  });

  const catAccess = await prisma.productCategory.upsert({
    where: { slug: 'access-control-intercoms' },
    update: {
      name: 'Access Control & Video Intercoms',
      description: 'Biometric face recognition terminals, 2K smart video doorbells, RFID gate controllers, and remote electromagnetic door strikes.',
      displayOrder: 4,
    },
    create: {
      name: 'Access Control & Video Intercoms',
      slug: 'access-control-intercoms',
      description: 'Biometric face recognition terminals, 2K smart video doorbells, RFID gate controllers, and remote electromagnetic door strikes.',
      displayOrder: 4,
    },
  });

  // ================= 5. PRODUCTS =================
  console.log('Seeding CCTV & Alarm Products...');

  // Product 1: 4K AI Turret Camera
  await prisma.product.upsert({
    where: { slug: 'apexguard-4k-ai-turret-camera' },
    update: {},
    create: {
      name: 'TRICLINIUM ApexGuard 4K AI Turret Camera',
      slug: 'apexguard-4k-ai-turret-camera',
      sku: 'TRIC-CAM-4K-AI',
      categoryId: catCameras.id,
      shortDescription: 'Industrial 4K Ultra-HD turret camera with ColorNight™ sensor, DeepLearning human/vehicle classification, and 110dB siren.',
      fullDescription: `The TRICLINIUM ApexGuard 4K AI Turret Camera delivers forensic-grade 3840x2160 resolution under extreme lighting conditions. Powered by edge neural processors, it classifies human and vehicular intrusions with 99.8% precision, eliminating foliage and animal false alarms.\n\nEquipped with ColorNight™ F1.0 aperture technology and warm supplement lighting, full-color video is preserved in complete pitch darkness up to 50 meters. An integrated two-way intercom and high-intensity strobe light enable automated deterrence before property damage occurs.`,
      price: 18500.0,
      promotionalPrice: 16500.0,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'TRICLINIUM ApexGuard 4K AI Turret Camera | Commercial CCTV',
      seoDescription: 'High-definition 4K AI turret CCTV camera featuring ColorNight color night-vision, two-way audio, and active strobe deterrence.',
      specifications: {
        create: [
          { name: 'Sensor Resolution', value: '8.3 Megapixel 4K UHD (3840 × 2160 @ 30fps)', displayOrder: 1 },
          { name: 'Optical Lens', value: '2.8mm Wide-Angle (112° Horizontal FOV)', displayOrder: 2 },
          { name: 'Night Vision', value: 'ColorNight™ 0.0005 Lux + Smart IR up to 50m', displayOrder: 3 },
          { name: 'AI Analytics', value: 'Perimeter Intrusion, Line Crossing, Human & Vehicle Classification', displayOrder: 4 },
          { name: 'Audio & Deterrence', value: 'Built-in Mic & Speaker, 110dB Siren, Red/Blue Flashing Strobe', displayOrder: 5 },
          { name: 'Protection Rating', value: 'IP67 Weatherproof, -40°C to +65°C Operating Range', displayOrder: 6 },
          { name: 'Power Input', value: 'Power-over-Ethernet (PoE 802.3af) or 12V DC', displayOrder: 7 },
        ],
      },
      features: {
        create: [
          { featureText: 'Neural Edge AI human/vehicle filtering with 99.8% accuracy.', displayOrder: 1 },
          { featureText: 'ColorNight™ full-spectrum color night vision up to 50 meters.', displayOrder: 2 },
          { featureText: 'Automated 110dB siren and red/blue strobe deterrent upon perimeter breach.', displayOrder: 3 },
          { featureText: 'NDAA compliant with military-grade AES-256 encrypted RTSP stream.', displayOrder: 4 },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
            altText: 'TRICLINIUM ApexGuard 4K AI Turret Security Camera',
            displayOrder: 0,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?auto=format&fit=crop&w=1200&q=80',
            altText: 'ApexGuard 4K Camera Lens and IR Array',
            displayOrder: 1,
            isPrimary: false,
          },
        ],
      },
    },
  });

  // Product 2: 360 PTZ Camera
  await prisma.product.upsert({
    where: { slug: 'sentinel-360-4k-ptz-camera' },
    update: {},
    create: {
      name: 'TRICLINIUM Sentinel 360° 4K PTZ Camera',
      slug: 'sentinel-360-4k-ptz-camera',
      sku: 'TRIC-CAM-PTZ50',
      categoryId: catCameras.id,
      shortDescription: 'High-speed speed-dome PTZ surveillance camera with 30x optical zoom, Laser IR night-vision 150m, and Auto-Tracking 3.0.',
      fullDescription: `Engineered for expansive commercial perimeters, logistics facilities, and large estates, the TRICLINIUM Sentinel 360° PTZ camera combines an endless 360° high-speed pan mechanism with a 30x optical zoom lens.\n\nIts Auto-Tracking 3.0 algorithms lock onto moving subjects up to 300 meters away, smoothly zooming in to capture facial features and license plate characters. Built with an all-metal cast enclosure rated at IK10 impact resistance and IP67 weather sealing.`,
      price: 48000.0,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'TRICLINIUM Sentinel 360 4K PTZ Camera | 30x Zoom',
      seoDescription: 'Enterprise 4K speed dome PTZ camera with 30x optical zoom, auto-tracking 3.0, and 150m laser infrared illumination.',
      specifications: {
        create: [
          { name: 'Optical Zoom', value: '30x Optical Zoom (4.5mm – 135mm), 16x Digital Zoom', displayOrder: 1 },
          { name: 'Resolution', value: '4K Ultra-HD (3840 × 2160 @ 60fps)', displayOrder: 2 },
          { name: 'Pan / Tilt Range', value: '360° Endless Pan, -15° to +90° Auto-Flip Tilt', displayOrder: 3 },
          { name: 'Speed Control', value: 'Pan speed up to 400°/sec Preset, 0.1° – 300°/sec Manual', displayOrder: 4 },
          { name: 'Laser Night Vision', value: 'Adaptive Laser IR Illuminators up to 150 meters', displayOrder: 5 },
          { name: 'Vandal Rating', value: 'IK10 Vandal-Proof, IP67 Waterproof, Built-in Wiper', displayOrder: 6 },
        ],
      },
      features: {
        create: [
          { featureText: 'Auto-Tracking 3.0 locks onto moving targets smoothly across 300 meters.', displayOrder: 1 },
          { featureText: 'Optical Image Stabilization keeps telephoto video clear in high winds.', displayOrder: 2 },
          { featureText: 'License Plate Capture mode readable day or night up to 120 km/h.', displayOrder: 3 },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1549109926-58f039549485?auto=format&fit=crop&w=1200&q=80',
            altText: 'TRICLINIUM Sentinel 360 PTZ Camera',
            displayOrder: 0,
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Product 3: 32-Channel 4K AI NVR
  await prisma.product.upsert({
    where: { slug: 'enterprise-32ch-4k-ai-nvr' },
    update: {},
    create: {
      name: 'TRICLINIUM Enterprise 32-Channel 4K AI NVR',
      slug: 'enterprise-32ch-4k-ai-nvr',
      sku: 'TRIC-NVR-32AI',
      categoryId: catNVR.id,
      shortDescription: 'Enterprise 32-channel network video recorder with 16 independent PoE ports, 4 SATA bays (up to 64TB), and facial recognition engine.',
      fullDescription: `The TRICLINIUM Enterprise 32-Channel NVR is the robust backbone for modern video surveillance operations. Supporting up to 32 4K streams at 384Mbps incoming bandwidth, this 1.5U rackmount appliance features 16 built-in PoE+ network ports for plug-and-play camera deployment.\n\nEquipped with hardware AI accelerators, it performs real-time face comparison against up to 100,000 enrolled profiles, generates heat maps, and allows natural language timeline filtering.`,
      price: 52000.0,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'TRICLINIUM 32-Channel 4K AI NVR Video Recorder',
      seoDescription: '32-channel PoE Network Video Recorder with 64TB storage capacity, RAID support, and facial recognition.',
      specifications: {
        create: [
          { name: 'Channels Supported', value: '32 IP Channels up to 12 Megapixels', displayOrder: 1 },
          { name: 'PoE Ports', value: '16 Built-in IEEE 802.3af/at PoE+ Ports (200W Budget)', displayOrder: 2 },
          { name: 'Internal Storage', value: '4 SATA Interfaces, up to 16TB per drive (64TB Total)', displayOrder: 3 },
          { name: 'Video Outputs', value: '1x HDMI 4K (3840×2160), 1x HDMI 1080p, 1x VGA', displayOrder: 4 },
          { name: 'Bandwidth', value: '384 Mbps Incoming / 384 Mbps Outgoing Throughput', displayOrder: 5 },
          { name: 'RAID Support', value: 'RAID 0, RAID 1, RAID 5, RAID 10 Hardware Redundancy', displayOrder: 6 },
        ],
      },
      features: {
        create: [
          { featureText: 'Onboard facial recognition database storing up to 100,000 profiles.', displayOrder: 1 },
          { featureText: 'AI Smart Search locates incidents across 30 days of footage in under 3 seconds.', displayOrder: 2 },
          { featureText: 'Zero-cloud local storage ensures total confidentiality without recurring fees.', displayOrder: 3 },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
            altText: 'TRICLINIUM 32CH 4K AI NVR Unit',
            displayOrder: 0,
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Product 4: Aegis Pro Smart Home Alarm Hub
  await prisma.product.upsert({
    where: { slug: 'aegis-pro-wireless-alarm-hub' },
    update: {},
    create: {
      name: 'TRICLINIUM Aegis Pro Wireless Home Alarm Hub',
      slug: 'aegis-pro-wireless-alarm-hub',
      sku: 'TRIC-ALM-PROHUB',
      categoryId: catAlarms.id,
      shortDescription: 'Tri-channel smart security hub with dual 4G LTE SIM backup, 64 wireless zones, 105dB internal siren, and 18-hour power outage battery.',
      fullDescription: `The TRICLINIUM Aegis Pro Hub represents the gold standard in residential and commercial intruder alarm systems. Operating across 868MHz frequency-hopping wireless protocol, it reliably connects with up to 64 sensors across a 2,000-meter open-air range.\n\nEquipped with dual 4G LTE cellular modems, Gigabit Ethernet, and Wi-Fi, it guarantees alert transmission even if burglars cut power and phone lines. Seamlessly integrates with TRICLINIUM CCTV cameras for instant video alarm verification.`,
      price: 36500.0,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'TRICLINIUM Aegis Pro Smart Wireless Home Alarm Hub',
      seoDescription: 'Wireless home alarm hub with dual 4G SIM backup, anti-jamming encryption, and instant smartphone notifications.',
      specifications: {
        create: [
          { name: 'Connected Devices', value: 'Up to 64 Wireless Zones (Sensors, Sirens, Keypads)', displayOrder: 1 },
          { name: 'Communication Channels', value: 'Ethernet, Wi-Fi 2.4/5GHz, Dual 4G LTE Micro-SIM', displayOrder: 2 },
          { name: 'Wireless Protocol', value: 'SecureHop™ 868MHz with AES-128 Encryption & Anti-Jamming', displayOrder: 3 },
          { name: 'Backup Battery', value: 'Li-Ion 4800mAh (Up to 18 hours operation on mains outage)', displayOrder: 4 },
          { name: 'Internal Siren', value: '105 dB High-Decibel Piezo Siren', displayOrder: 5 },
          { name: 'Certifications', value: 'EN 50131 Grade 2 Certified, CE, FCC', displayOrder: 6 },
        ],
      },
      features: {
        create: [
          { featureText: 'Triple-path communication with Dual 4G LTE SIMs + Wi-Fi + Gigabit Ethernet.', displayOrder: 1 },
          { featureText: 'Immediate video verification clips pushed directly to iOS and Android apps.', displayOrder: 2 },
          { featureText: 'Anti-jamming frequency hopping triggers alarms if radio signals are blocked.', displayOrder: 3 },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
            altText: 'TRICLINIUM Aegis Pro Alarm Hub',
            displayOrder: 0,
            isPrimary: true,
          },
        ],
      },
    },
  });

  // Product 5: Dual-Optic Outdoor Solar PIR Motion Detector
  await prisma.product.upsert({
    where: { slug: 'dual-optic-outdoor-solar-pir-sensor' },
    update: {},
    create: {
      name: 'TRICLINIUM Dual-Optic Outdoor Solar PIR Motion Detector',
      slug: 'dual-optic-outdoor-solar-pir-sensor',
      sku: 'TRIC-ALM-PIRDual',
      categoryId: catAlarms.id,
      shortDescription: 'Solar-powered wireless outdoor perimeter sensor with dual PIR + microwave radar detection, 25kg pet-immunity, and anti-masking.',
      fullDescription: `Protect perimeter boundaries before intruders ever reach exterior doors or windows. The TRICLINIUM Dual-Optic Outdoor Sensor combines two passive infrared sensors with 24GHz microwave radar to confirm genuine human movement.\n\nEquipped with a monocrystalline solar panel and rechargeable lithium cell, it requires zero external wiring or battery replacements for up to 5 years. Immune to dogs and pets weighing up to 25kg.`,
      price: 9500.0,
      currency: 'KES',
      priceVisible: true,
      availability: 'IN_STOCK',
      isFeatured: false,
      status: 'PUBLISHED',
      seoTitle: 'TRICLINIUM Dual-Optic Solar PIR Motion Sensor | Outdoor Alarm',
      seoDescription: 'Outdoor wireless pet-immune PIR and microwave intruder alarm sensor with solar charging.',
      specifications: {
        create: [
          { name: 'Detection Range', value: '12 meters × 90° Wide Angle', displayOrder: 1 },
          { name: 'Technology', value: 'Dual PIR Sensors + 24GHz Microwave Doppler Radar', displayOrder: 2 },
          { name: 'Pet Immunity', value: 'Ignores pets and animals up to 25kg (55 lbs)', displayOrder: 3 },
          { name: 'Power Supply', value: 'Built-in Monocrystalline Solar Panel + 3.7V Rechargeable Cell', displayOrder: 4 },
          { name: 'Anti-Masking', value: 'Active IR anti-masking detects spray paint or covers', displayOrder: 5 },
          { name: 'Enclosure Rating', value: 'IP66 Waterproof & UV-Resistant Polycarbonate', displayOrder: 6 },
        ],
      },
      features: {
        create: [
          { featureText: 'Dual PIR + 24GHz microwave validation eliminates environmental false alarms.', displayOrder: 1 },
          { featureText: 'Self-charging solar panel provides continuous multi-year operation.', displayOrder: 2 },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1200&q=80',
            altText: 'Outdoor Solar PIR Motion Sensor',
            displayOrder: 0,
            isPrimary: true,
          },
        ],
      },
    },
  });

  // ================= 6. SERVICES =================
  console.log('Seeding CCTV & Alarm Security Services...');
  const catSrvCommercial = await prisma.serviceCategory.upsert({
    where: { slug: 'commercial-surveillance-services' },
    update: {
      name: 'Commercial CCTV & Surveillance Services',
      description: 'End-to-end site evaluation, conduit cabling, high-definition camera installation, and multi-location monitoring setups.',
      displayOrder: 1,
    },
    create: {
      name: 'Commercial CCTV & Surveillance Services',
      slug: 'commercial-surveillance-services',
      description: 'End-to-end site evaluation, conduit cabling, high-definition camera installation, and multi-location monitoring setups.',
      displayOrder: 1,
    },
  });

  const catSrvResidential = await prisma.serviceCategory.upsert({
    where: { slug: 'residential-alarm-services' },
    update: {
      name: 'Residential Alarm & Perimeter Security',
      description: 'Smart home security architecture, wireless intruder alarm installation, glass-break calibration, and mobile monitoring integration.',
      displayOrder: 2,
    },
    create: {
      name: 'Residential Alarm & Perimeter Security',
      slug: 'residential-alarm-services',
      description: 'Smart home security architecture, wireless intruder alarm installation, glass-break calibration, and mobile monitoring integration.',
      displayOrder: 2,
    },
  });

  // Service 1: Turnkey Commercial CCTV Installation
  await prisma.service.upsert({
    where: { slug: 'turnkey-commercial-cctv-installation' },
    update: {},
    create: {
      name: 'Turnkey Commercial CCTV Installation & Cabling',
      slug: 'turnkey-commercial-cctv-installation',
      categoryId: catSrvCommercial.id,
      shortDescription: 'Full-scope architectural site survey, optical coverage design, Cat6 PoE cabling, and 4K AI CCTV camera installation.',
      fullDescription: `TRICLINIUM delivers certified commercial surveillance installations for corporate campuses, warehouses, retail centers, and residential developments.\n\nOur licensed engineers perform 3D optical coverage modeling to eliminate blind spots, install plenum-rated shielded Cat6 cabling in steel conduit, and configure automated alert zones directly to your security command desk or smartphone devices.`,
      featuredImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'PUBLISHED',
      features: {
        create: [
          { title: 'Zero Blind Spot Design', description: 'Engineered lens focal lengths ensure complete property coverage without surveillance gaps.', displayOrder: 1, featureType: 'feature' },
          { title: 'Concealed Conduit Cabling', description: 'Weatherproof galvanized and powder-coated conduits protect cabling against weather and sabotage.', displayOrder: 2, featureType: 'feature' },
          { title: 'Compliant & Certified', description: 'NDAA-compliant hardware, strict GDPR privacy mask configurations, and certified electrical standards.', displayOrder: 3, featureType: 'feature' },
          { title: 'Phase 1: Site Survey & 3D Modeling', description: 'Comprehensive optical coverage diagram and blind-spot identification.', displayOrder: 4, featureType: 'process_step' },
          { title: 'Phase 2: Structured PoE Cabling', description: 'Plenum-rated Cat6 installation with enterprise patch panels.', displayOrder: 5, featureType: 'process_step' },
          { title: 'Phase 3: Camera Mount & Calibration', description: 'Precision mounting of 4K AI IP cameras and speed dome PTZs.', displayOrder: 6, featureType: 'process_step' },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
            altText: 'Technician installing commercial CCTV surveillance camera',
            displayOrder: 0,
          },
        ],
      },
    },
  });

  // Service 2: Smart Home Alarm Installation
  await prisma.service.upsert({
    where: { slug: 'smart-home-alarm-installation-monitoring' },
    update: {},
    create: {
      name: 'Smart Home Alarm Installation & 24/7 Monitoring',
      slug: 'smart-home-alarm-installation-monitoring',
      categoryId: catSrvResidential.id,
      shortDescription: 'Custom wireless intruder alarm deployment with perimeter barrier sensors, video verification, and 24/7 central station monitoring.',
      fullDescription: `Safeguard your family and residence with TRICLINIUM's tailored smart home alarm architecture. Our certified security technicians configure multi-layered perimeter defense: magnetic door/window sensors, acoustic glass-break detectors, and outdoor solar radar motion detectors.\n\nConnected directly to our UL-listed 24/7 Central Monitoring Station, verified alarms trigger emergency security personnel and police dispatch in under 30 seconds.`,
      featuredImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'PUBLISHED',
      features: {
        create: [
          { title: '< 30s Emergency Dispatch', description: 'Direct priority routing to local law enforcement and rapid response security patrols.', displayOrder: 1, featureType: 'feature' },
          { title: 'Instant Mobile Video Push', description: 'Receive high-definition video clips on your smartphone the split-second a sensor triggers.', displayOrder: 2, featureType: 'feature' },
          { title: 'Child & Senior Friendly', description: 'One-touch wireless keyfobs and RFID tags allow effortless arming/disarming for all family members.', displayOrder: 3, featureType: 'feature' },
          { title: 'Phase 1: Security Risk Audit', description: 'Evaluate residential entry points, perimeter weaknesses, and family routine.', displayOrder: 4, featureType: 'process_step' },
          { title: 'Phase 2: Hardware Deployment', description: 'Mount wireless alarm hub, calibrate pet-immune PIRs, and install solar sirens.', displayOrder: 5, featureType: 'process_step' },
          { title: 'Phase 3: Central Link & Training', description: 'Connect system to 24/7 emergency dispatch and configure mobile apps.', displayOrder: 6, featureType: 'process_step' },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
            altText: 'Smart home alarm security integration and mobile control',
            displayOrder: 0,
          },
        ],
      },
    },
  });

  // ================= 7. FAQS =================
  console.log('Seeding CCTV & Alarm FAQs...');
  const faqs = [
    {
      category: 'Surveillance & CCTV',
      question: 'What is the main difference between IP cameras and older analog systems?',
      answer: 'IP (Internet Protocol) cameras process and encode video directly on the camera hardware, delivering pristine 4K resolution (4x higher than standard 1080p), built-in AI for human and vehicle detection, and power/data transmission over a single standard Cat6 Ethernet cable (PoE). Analog systems suffer from signal degradation over distance and lack modern AI analytics.',
      sortOrder: 1,
    },
    {
      category: 'Surveillance & CCTV',
      question: 'Can I view and control my security cameras remotely on my phone?',
      answer: 'Yes! All TRICLINIUM CCTV systems include free, secure mobile apps for iOS and Android. You can view live multi-camera feeds, search playback by date/event, receive instant push notifications when human movement is detected, and speak through two-way audio from anywhere in the world without monthly cloud subscription fees.',
      sortOrder: 2,
    },
    {
      category: 'Home Alarms',
      question: 'Will our dogs or cats trigger the alarm motion detectors?',
      answer: 'No. TRICLINIUM indoor and outdoor PIR sensors use dual-optic digital pulse analysis with built-in pet immunity that ignores animals weighing up to 25kg (55 lbs). The sensors distinguish between the horizontal thermal profile of animals and the vertical mass signature of a standing human.',
      sortOrder: 3,
    },
    {
      category: 'Home Alarms',
      question: 'What happens if a burglar cuts my power or home internet cable?',
      answer: 'Our Aegis Pro smart alarm hubs feature dual 4G LTE cellular modems and an onboard lithium backup battery that operates for up to 18 hours without grid power. If electrical lines or Wi-Fi cables are cut, the system instantly switches to cellular transmission and triggers an immediate tamper alert.',
      sortOrder: 4,
    },
    {
      category: 'Storage & Hardware',
      question: 'How many days of video does a 32-channel NVR retain?',
      answer: 'With modern H.265+ smart video compression and our intelligent bit-rate throttling, a 32-channel NVR equipped with 32TB of surveillance-grade hard drives typically retains between 30 and 45 days of continuous 4K video recording, or up to 90 days when set to AI motion-triggered recording.',
      sortOrder: 5,
    },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        displayOrder: faq.sortOrder,
        isPublished: true,
      },
    });
  }

  // ================= 8. TESTIMONIALS =================
  console.log('Seeding Testimonials...');
  const testimonials = [
    {
      clientName: 'Marcus Vance',
      clientRole: 'Director of Asset Protection',
      companyName: 'Metro Distribution Logistics',
      content: 'TRICLINIUM outfitted our 140,000 sq ft distribution terminal with 48 ApexGuard 4K cameras and Sentinel PTZs. The optical clarity and auto-tracking have reduced inventory shrink by over 92% in our first six months.',
      rating: 5,
      isFeatured: true,
      status: 'PUBLISHED' as const,
    },
    {
      clientName: 'Elena Rostova',
      clientRole: 'Homeowner & Estate Manager',
      companyName: 'Highland Ridge Estates',
      content: 'Having the Aegis Pro wireless alarm integrated with our perimeter cameras gave us complete peace of mind. The system caught an intruder trying to breach our outer perimeter gate at 3:00 AM, strobed the siren, and dispatched police before he could even touch the front porch.',
      rating: 5,
      isFeatured: true,
      status: 'PUBLISHED' as const,
    },
    {
      clientName: 'David Chen',
      clientRole: 'Chief of Physical Security',
      companyName: 'Apex Financial Plaza',
      content: 'Zero cloud subscription fees, completely on-premise 64TB NVR storage, and instant facial recognition alerts for VIPs and unauthorized personnel. TRICLINIUM delivers true enterprise security engineering.',
      rating: 5,
      isFeatured: true,
      status: 'PUBLISHED' as const,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: t,
    });
  }

  // ================= 9. BLOG POSTS =================
  console.log('Seeding Blog Posts...');
  await prisma.blogPost.upsert({
    where: { slug: 'how-ai-video-analytics-stops-burglary-before-entry' },
    update: {},
    create: {
      title: 'How AI Video Analytics and Active Deterrence Prevent Break-Ins Before They Occur',
      slug: 'how-ai-video-analytics-stops-burglary-before-entry',
      excerpt: 'Traditional CCTV merely recorded crimes for post-incident review. Discover how edge AI and active sirens stop criminals in their tracks before entry.',
      content: `# Active Deterrence: The Shift from Passive Recording to Active Protection

For decades, commercial and residential video surveillance served a strictly retrospective function: after a burglary occurred, property owners and police would review grainier footage to identify suspects.

With modern **Deep Learning AI Video Analytics**, surveillance systems have transformed from passive recording devices into active, proactive security guards.

---

## 1. Edge-Based Human & Vehicle Classification

Older motion detection operated on pixel-change algorithms. Wind-blown tree branches, heavy rainstorms, headlights, and roaming neighborhood cats would cause dozens of false alarms every night.

Today's **TRICLINIUM ApexGuard 4K cameras** run localized neural networks directly on the camera's image processor. By analyzing skeletal posture, silhouette ratios, and directional vectors, the camera ignores non-threats and only triggers alerts for genuine human or vehicular trespassers.

---

## 2. Active Deterrent Audio & Strobe Lighting

When an unauthorized subject steps over a virtual boundary during armed hours:
1. **Red/Blue High-Intensity Strobes** flash rapidly, illuminating the intruder's face for forensic capture and signaling they have been spotted.
2. **110dB Siren / Voice Message**: An audible warning ("Attention: You have entered a restricted area. Security has been dispatched") shatters the burglar's expectation of secrecy.
3. **Instant Mobile Push**: The property owner and monitoring station receive a 5-second 4K video clip in under two seconds.

In over 94% of tested scenarios, active audio-visual deterrence causes intruders to flee immediately, preventing expensive door breaches, broken windows, and property loss.

---

## 3. Integrating CCTV with Wireless Home Alarm Hubs

When outdoor cameras are linked to indoor alarm sirens through systems like the **TRICLINIUM Aegis Pro Hub**, property defense becomes layered:
- **Zone 1: Outer Perimeter** (Solar radar motion sensors detect approach)
- **Zone 2: Property Boundary** (Turret cameras strobe and sound alert)
- **Zone 3: Entry Points** (Magnetic contacts and glass-break sensors)

To learn how our team can design an optical coverage plan for your commercial facility or private estate, submit an RFQ quotation request or contact our security specialists today.`,
      featuredImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
      authorName: 'TRICLINIUM Security Engineers',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  // ================= 10. HOMEPAGE CMS SECTIONS =================
  console.log('Seeding Homepage CMS Sections...');
  const homePage = await prisma.page.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      title: 'TRICLINIUM CCTV Surveillance & Security Portal',
      slug: 'home',
      content: 'Dynamic Homepage Content',
      status: 'PUBLISHED',
    },
  });

  const slide1Content = {
    headline: 'Advanced CCTV Surveillance & Smart Security Systems',
    subheadline: 'High-Definition 4K Cameras • AI Motion Detection • Remote Smartphone Monitoring • 24/7 Wireless Alarms',
    description: 'TRICLINIUM SYSTEMS delivers complete residential & commercial security solutions. From smart video doorbells and door cams to high-capacity 4K NVRs, wireless intruder alarm systems, and video intercoms across Kenya.',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1920&q=85',
    primaryCtaText: 'Explore Security Products',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Get Free Security Quote',
    secondaryCtaLink: '/contact',
  };

  await prisma.pageSection.upsert({
    where: { id: 'seed-hero-slide-1' },
    update: {
      content: slide1Content,
    },
    create: {
      id: 'seed-hero-slide-1',
      pageId: homePage.id,
      key: 'hero_slide',
      title: 'Primary Hero Slide',
      displayOrder: 1,
      isEnabled: true,
      content: slide1Content,
    },
  });

  const slide2Content = {
    headline: 'Smart Home Alarms, Video Doorbells & Door Cams',
    subheadline: 'Triple-Path 4G Cellular Redundancy • Pet-Immune Motion Radar • Loud 115dB Sirens',
    description: 'Defend your home perimeter with wire-free door cameras, 2K video doorbells with two-way talk, smart alarm hubs, and solar sirens that alert you before intruders enter.',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1920&q=85',
    primaryCtaText: 'View Alarm Systems',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Installation Services',
    secondaryCtaLink: '/services',
  };

  await prisma.pageSection.upsert({
    where: { id: 'seed-hero-slide-2' },
    update: {
      content: slide2Content,
    },
    create: {
      id: 'seed-hero-slide-2',
      pageId: homePage.id,
      key: 'hero_slide',
      title: 'Secondary Hero Slide',
      displayOrder: 2,
      isEnabled: true,
      content: slide2Content,
    },
  });

  const slide3Content = {
    headline: 'Video Intercoms, 360° Nanny Cams & Whole-Home Mesh Wi-Fi',
    subheadline: 'Touchscreen Gate Release • Baby Crying Detection • Zero-Buffering 4K CCTV Streaming',
    description: 'Screen visitors at your gate with 7-inch touch monitors, monitor children with smart pan-tilt nanny cameras, and eliminate Wi-Fi dead zones with structured CAT6 cabling.',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1920&q=85',
    primaryCtaText: 'Explore All Systems',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Request Site Survey',
    secondaryCtaLink: '/contact',
  };

  await prisma.pageSection.upsert({
    where: { id: 'seed-hero-slide-3' },
    update: {
      content: slide3Content,
    },
    create: {
      id: 'seed-hero-slide-3',
      pageId: homePage.id,
      key: 'hero_slide',
      title: 'Tertiary Hero Slide',
      displayOrder: 3,
      isEnabled: true,
      content: slide3Content,
    },
  });

  const whyUsPillars = [
    {
      title: 'Forensic 4K Ultra-HD Clarity',
      description: 'Capture facial features and license plates with crystal-clear 3840x2160 resolution and full-spectrum color night-vision up to 50 meters.',
      icon: 'Camera',
    },
    {
      title: 'DeepLearning Zero False Alarms',
      description: 'Neural edge processors filter out foliage, rain, and pets to alert security solely on genuine human and vehicular threats.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Zero Cloud Fees & 100% On-Premise',
      description: 'Full ownership of your video footage. High-capacity local NVR RAID storage with zero monthly fees and encrypted remote mobile access.',
      icon: 'Lock',
    },
    {
      title: 'Triple-Path Alarm Redundancy',
      description: 'Dual 4G LTE SIM backup plus Wi-Fi and Ethernet ensures alarm dispatch signals reach your phone even if power lines are severed.',
      icon: 'Radio',
    },
  ];

  await prisma.pageSection.upsert({
    where: { id: 'seed-why-us-section' },
    update: {
      title: 'Why Property Owners Rely on TRICLINIUM SYSTEMS',
      content: { pillars: whyUsPillars },
    },
    create: {
      id: 'seed-why-us-section',
      pageId: homePage.id,
      key: 'why_us',
      title: 'Why Property Owners Rely on TRICLINIUM SYSTEMS',
      displayOrder: 4,
      isEnabled: true,
      content: { pillars: whyUsPillars },
    },
  });

  const statsList = [
    { label: 'Cameras & Sensors Installed', value: '2,500+' },
    { label: 'System Uptime Reliability', value: '99.98%' },
    { label: 'Emergency Alert Speed', value: '< 15s' },
    { label: 'Certified Hardware Warranty', value: '1-Year' },
  ];

  await prisma.pageSection.upsert({
    where: { id: 'seed-stats-section' },
    update: {
      title: 'Security Milestone Statistics',
      content: { stats: statsList },
    },
    create: {
      id: 'seed-stats-section',
      pageId: homePage.id,
      key: 'stats',
      title: 'Security Milestone Statistics',
      displayOrder: 5,
      isEnabled: true,
      content: { stats: statsList },
    },
  });

  console.log('✅ TRICLINIUM CCTV Surveillance & Security seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
