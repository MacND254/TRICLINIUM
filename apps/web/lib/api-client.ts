const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api/v1';

let reachabilityCache: { [origin: string]: { status: boolean; timestamp: number } } = {};

/**
 * Fast, silent reachability probe for server-side environments to prevent Next.js fetch ECONNREFUSED build clutter.
 */
export async function isApiReachable(urlStr: string): Promise<boolean> {
  if (typeof window !== 'undefined') return true;

  try {
    const parsed = new URL(urlStr);
    const origin = parsed.origin;
    const now = Date.now();
    const cached = reachabilityCache[origin];
    if (cached && now - cached.timestamp < 10000) {
      return cached.status;
    }

    const isHttps = parsed.protocol === 'https:';
    // Use dynamic evaluation to prevent client webpack bundler from trying to resolve Node modules
    const reqModule = eval('require')(isHttps ? 'https' : 'http');
    const port = parsed.port ? parseInt(parsed.port, 10) : (isHttps ? 443 : 80);

    return new Promise((resolve) => {
      const req = reqModule.request(
        {
          hostname: parsed.hostname,
          port,
          path: '/api/v1/health',
          method: 'GET',
          timeout: 150,
        },
        () => {
          reachabilityCache[origin] = { status: true, timestamp: Date.now() };
          resolve(true);
        }
      );
      req.on('error', () => {
        reachabilityCache[origin] = { status: false, timestamp: Date.now() };
        resolve(false);
      });
      req.on('timeout', () => {
        req.destroy();
        reachabilityCache[origin] = { status: false, timestamp: Date.now() };
        resolve(false);
      });
      req.end();
    });
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;
  retryAfter?: number;

  constructor(
    message: string,
    code: string = 'API_ERROR',
    status: number = 500,
    details?: any,
    retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  // If executing in server environment (e.g. Next.js build or SSR), check if API server is reachable
  if (typeof window === 'undefined') {
    const reachable = await isApiReachable(url);
    if (!reachable) {
      throw new ApiError('API server is unreachable', 'API_UNREACHABLE', 503);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== 'undefined' && !headers['Authorization']) {
    const token = localStorage.getItem('triclinium_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials || 'include',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
      const errorCode = data?.error?.code || 'REQUEST_FAILED';
      const retryHeader = res.headers.get('Retry-After');
      const retryAfter = data?.error?.retryAfter || (retryHeader ? parseInt(retryHeader, 10) : undefined);
      throw new ApiError(errorMsg, errorCode, res.status, data?.error?.details, retryAfter);
    }

    return (data?.data ?? data) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network error occurred', 'NETWORK_ERROR', 500);
  }
}
