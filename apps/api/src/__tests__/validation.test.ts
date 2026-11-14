import {
  loginSchema,
  productInquirySchema,
  serviceInquirySchema,
  quotationRequestSchema,
  createProductSchema,
  createServiceSchema,
  websiteSettingsSchema,
} from '@triclinium/validation';

describe('Shared Zod Validation Schemas', () => {
  describe('Authentication Validation', () => {
    it('should validate correct login credentials', () => {
      const valid = { email: 'admin@triclinium.com', password: 'Password123!@#' };
      expect(() => loginSchema.parse(valid)).not.toThrow();
    });

    it('should reject invalid email and short password', () => {
      const invalid = { email: 'not-an-email', password: '123' };
      expect(() => loginSchema.parse(invalid)).toThrow();
    });
  });

  describe('Product Inquiry Validation', () => {
    it('should validate correct product inquiry', () => {
      const inquiry = {
        customerName: 'Marcus Vance',
        email: 'marcus@vanguard.com',
        phone: '+1 555-0199',
        company: 'Vanguard Group',
        productId: 'prod-uuid-1234',
        quantity: 10,
        message: 'Requesting detailed delivery schedule for monumental pivot hinges.',
        preferredContact: 'EMAIL',
      };
      expect(() => productInquirySchema.parse(inquiry)).not.toThrow();
    });

    it('should reject inquiry with missing product or short message', () => {
      const invalid = {
        customerName: 'A',
        email: 'invalid',
        productId: '',
        message: 'short',
      };
      expect(() => productInquirySchema.parse(invalid)).toThrow();
    });
  });

  describe('Quotation Request Validation', () => {
    it('should validate multi-item quotation request', () => {
      const rfq = {
        customerName: 'Elena Rostova',
        email: 'elena@aerodynamics.com',
        items: [
          { productId: 'item-1', quantity: 5, notes: 'Clear anodized' },
          { productId: 'item-2', quantity: 20, notes: 'Titanium grade 5' },
        ],
        preferredContact: 'EMAIL',
      };
      expect(() => quotationRequestSchema.parse(rfq)).not.toThrow();
    });

    it('should reject empty item list in quotation request', () => {
      const emptyRfq = {
        customerName: 'Elena',
        email: 'elena@example.com',
        items: [],
      };
      expect(() => quotationRequestSchema.parse(emptyRfq)).toThrow();
    });
  });

  describe('Product Catalog Validation', () => {
    it('should validate complete product creation payload', () => {
      const product = {
        name: 'Titan-Forged Pivot Hinge 750',
        slug: 'titan-forged-pivot-hinge-750',
        sku: 'TRIC-HW-750',
        shortDescription: 'Industrial-grade architectural pivot hinge engineered for doors up to 750kg.',
        fullDescription: 'Machined from solid 316 marine-grade stainless steel with sealed dual needle-thrust bearings.',
        categoryId: 'cat-uuid-1',
        price: 1250,
        currency: 'USD',
        availability: 'IN_STOCK',
        features: ['316 Marine Grade', '750kg load rating'],
        specifications: [{ name: 'Capacity', value: '750kg', order: 0 }],
      };
      expect(() => createProductSchema.parse(product)).not.toThrow();
    });
  });

  describe('Service Validation', () => {
    it('should validate service creation with process steps', () => {
      const service = {
        name: '5-Axis CNC Precision Machining',
        slug: '5-axis-cnc-machining',
        shortDescription: 'High-tolerance custom component fabrication for aerospace and architectural applications.',
        fullDescription: 'Comprehensive multi-axis CNC manufacturing delivering parts within ±0.005mm tolerances.',
        categoryId: 'srv-cat-1',
        pricingModel: 'CUSTOM_QUOTE',
        features: ['5-axis capabilities'],
        benefits: ['Fast turnaround'],
        process: [{ title: 'CAD Analysis', description: 'Review DFM requirements', order: 0 }],
      };
      expect(() => createServiceSchema.parse(service)).not.toThrow();
    });
  });
});
