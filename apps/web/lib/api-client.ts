export function getApiBaseUrl(): string {
  // If explicitly provided via environment, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // Client-side in browser: use relative path '/api/v1' so it hits the current domain
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }

  // Server-side (SSR / build)
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL.replace(/\/$/, '');
  }
  if (process.env.API_URL) {
    return process.env.API_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/v1`;
  }

  return 'http://localhost:4000/api/v1';
}

const API_URL = getApiBaseUrl();

let localPortChecked = false;
let isLocalServerAvailable = true;

async function checkLocalServer(): Promise<boolean> {
  if (localPortChecked) return isLocalServerAvailable;
  try {
    // Dynamic eval to prevent client webpack bundler from attempting to bundle 'net'
    const net = eval('require')('net');
    return new Promise((resolve) => {
      const socket = net.createConnection({ port: 4000, host: '127.0.0.1', timeout: 50 }, () => {
        socket.destroy();
        localPortChecked = true;
        isLocalServerAvailable = true;
        resolve(true);
      });
      socket.on('error', () => {
        localPortChecked = true;
        isLocalServerAvailable = false;
        resolve(false);
      });
      socket.on('timeout', () => {
        socket.destroy();
        localPortChecked = true;
        isLocalServerAvailable = false;
        resolve(false);
      });
    });
  } catch {
    return true;
  }
}

export async function isApiReachable(_urlStr: string): Promise<boolean> {
  return true;
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
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}/${cleanEndpoint}`;

  const isServer = typeof window === 'undefined';

  if (isServer && url.includes('localhost:4000')) {
    const available = await checkLocalServer();
    if (!available) {
      throw new ApiError('Local backend API server is not running on port 4000', 'API_OFFLINE', 503);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!isServer && !headers['Authorization']) {
    const token = localStorage.getItem('triclinium_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Fast fetch configuration optimized for speed and caching
  const fetchConfig: RequestInit = {
    ...options,
    headers,
  };

  if (!isServer) {
    // Client-side: attach credentials for session cookies
    fetchConfig.credentials = options.credentials || 'include';
  } else {
    // Server-side (SSR / ISR): 3-second abort timeout prevents serverless lag
    if (!fetchConfig.signal) {
      fetchConfig.signal = AbortSignal.timeout(3000);
    }
    // Enable Next.js ISR data caching for public GET requests if not specified
    if (!fetchConfig.next && !fetchConfig.cache) {
      const method = (options.method || 'GET').toUpperCase();
      if (method === 'GET') {
        fetchConfig.next = { revalidate: 60 };
      }
    }
  }

  try {
    const res = await fetch(url, fetchConfig);

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
    throw new ApiError(err.message || 'API request failed or timed out', 'API_UNREACHABLE', 503);
  }
}

/**
 * Universal authenticated file upload for admin forms (settings, products, services, CMS, media).
 * Works reliably across local development and Vercel serverless deployments.
 */
export async function uploadAdminMedia(file: File): Promise<{ url: string; filename: string }> {
  // Client-side file size pre-check against configured max upload limit
  let maxMb = 2; // Default 2MB limit
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('triclinium_public_settings_cache_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.maxUploadSizeMb && !isNaN(Number(parsed.maxUploadSizeMb))) {
          maxMb = Number(parsed.maxUploadSizeMb);
        }
      }
    }
  } catch {}

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the upload limit of ${maxMb} MB. Please select a file under ${maxMb} MB or adjust the limit in Admin Settings.`
    );
  }

  const formData = new FormData();
  formData.append('file', file);

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/admin/media/upload`;

  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('triclinium_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || `Upload failed with status ${res.status}`);
  }

  const json = await res.json();
  const uploadedUrl = json.data?.url || json.url || '';
  if (!uploadedUrl) {
    throw new Error('Upload succeeded but no media URL was returned by server');
  }

  return {
    url: uploadedUrl,
    filename: json.data?.filename || json.filename || file.name,
  };
}

/**
 * Universal authenticated API fetch helper that guarantees Authorization headers
 * are passed alongside credentials in all environments (local & Vercel).
 */
export async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const cleanPath = path.startsWith('/api/v1') ? path.replace('/api/v1', '') : path;
  return fetchApi<T>(cleanPath, options);
}
