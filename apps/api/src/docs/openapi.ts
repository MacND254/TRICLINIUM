export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'TRICLINIUM Commercial Platform REST API',
    version: '1.0.0',
    description: 'RESTful API for the TRICLINIUM enterprise business catalog, inquiry processing, CMS, and administration platform.',
    contact: {
      name: 'TRICLINIUM Engineering Team',
      email: 'engineering@triclinium.com',
    },
  },
  servers: [
    { url: '/api/v1', description: 'Production / Local API Endpoint' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'triclinium_session',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/products': {
      get: {
        summary: 'List published products with filtering, search, and pagination',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'availability', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: { 200: { description: 'Paginated product list' } },
      },
    },
    '/products/{slug}': {
      get: {
        summary: 'Get single published product by slug with specifications and gallery',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Product detailed object' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/services': {
      get: {
        summary: 'List published services with filtering and pagination',
        responses: { 200: { description: 'Paginated services list' } },
      },
    },
    '/services/{slug}': {
      get: {
        summary: 'Get single published service by slug with process steps and benefits',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Service details' } },
      },
    },
    '/inquiries': {
      post: {
        summary: 'Submit a product or service inquiry',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { 201: { description: 'Inquiry registered' } },
      },
    },
    '/quotation-requests': {
      post: {
        summary: 'Submit a multi-item Request for Quotation (RFQ)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { 201: { description: 'Quotation request logged' } },
      },
    },
    '/admin/auth/login': {
      post: {
        summary: 'Authenticate administrator with credentials',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@triclinium.com' },
                  password: { type: 'string', example: 'Admin123!@#' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Session created' } },
      },
    },
    '/admin/dashboard': {
      get: {
        summary: 'Retrieve real-time database dashboard statistics',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: { 200: { description: 'Aggregated database metrics' } },
      },
    },
  },
};
