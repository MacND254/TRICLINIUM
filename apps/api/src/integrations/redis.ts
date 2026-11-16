import { Redis } from '@upstash/redis';
import { config } from '../config';

interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  del(key: string | string[]): Promise<void>;
  delByPattern(pattern: string): Promise<void>;
  flush(): Promise<void>;
  incr(key: string, ttlSeconds?: number): Promise<number>;
}

const globalForMemory = globalThis as unknown as {
  tricliniumMemoryCache?: Map<string, { value: any; expiresAt?: number }>;
};

// In-Memory Fallback Cache when Upstash credentials are not supplied or connection is offline
class MemoryCacheStore implements CacheStore {
  private store: Map<string, { value: any; expiresAt?: number }>;

  constructor() {
    if (!globalForMemory.tricliniumMemoryCache) {
      globalForMemory.tricliniumMemoryCache = new Map();
    }
    this.store = globalForMemory.tricliniumMemoryCache;
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      key.forEach((k) => this.store.delete(k));
    } else {
      this.store.delete(key);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  async incr(key: string, ttlSeconds: number = 60): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const next = current + 1;
    await this.set(key, next, ttlSeconds);
    return next;
  }
}

// Upstash Redis Store
class UpstashCacheStore implements CacheStore {
  private redis: Redis;
  private memoryFallback = new MemoryCacheStore();

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get<T>(key);
      return data ?? null;
    } catch (err) {
      console.warn(`[Redis:get] Failed for key ${key}, falling back to memory:`, err);
      return this.memoryFallback.get<T>(key);
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.redis.set(key, value, { ex: ttlSeconds });
    } catch (err) {
      console.warn(`[Redis:set] Failed for key ${key}, falling back to memory:`, err);
      await this.memoryFallback.set(key, value, ttlSeconds);
    }
  }

  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        if (key.length > 0) await this.redis.del(...key);
      } else {
        await this.redis.del(key);
      }
    } catch (err) {
      console.warn(`[Redis:del] Failed for keys, falling back to memory:`, err);
      await this.memoryFallback.del(key);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys && keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (err) {
      console.warn(`[Redis:delByPattern] Failed for ${pattern}, falling back to memory:`, err);
      await this.memoryFallback.delByPattern(pattern);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (err) {
      await this.memoryFallback.flush();
    }
  }

  async incr(key: string, ttlSeconds: number = 60): Promise<number> {
    try {
      const count = await this.redis.incr(key);
      if (count === 1) {
        await this.redis.expire(key, ttlSeconds);
      }
      return count;
    } catch (err) {
      return this.memoryFallback.incr(key, ttlSeconds);
    }
  }
}

export const cache: CacheStore =
  config.redis.restUrl && config.redis.restToken
    ? new UpstashCacheStore(config.redis.restUrl, config.redis.restToken)
    : new MemoryCacheStore();

// Cache Tagging and Invalidation Helpers
export const CACHE_KEYS = {
  HOMEPAGE: 'triclinium:cache:homepage',
  SETTINGS: 'triclinium:cache:settings',
  PRODUCT_LIST: 'triclinium:cache:products:list',
  PRODUCT_DETAIL: (slug: string) => `triclinium:cache:product:${slug}`,
  PRODUCT_CATEGORIES: 'triclinium:cache:product:categories',
  SERVICE_LIST: 'triclinium:cache:services:list',
  SERVICE_DETAIL: (slug: string) => `triclinium:cache:service:${slug}`,
  SERVICE_CATEGORIES: 'triclinium:cache:service:categories',
  TESTIMONIALS: 'triclinium:cache:testimonials',
  FAQS: 'triclinium:cache:faqs',
  BLOG_LIST: 'triclinium:cache:blog:list',
  BLOG_POST: (slug: string) => `triclinium:cache:blog:${slug}`,
  PAGE: (slug: string) => `triclinium:cache:page:${slug}`,
};

export async function invalidateProductCaches(slug?: string) {
  const keysToDel = [
    CACHE_KEYS.HOMEPAGE,
    CACHE_KEYS.PRODUCT_CATEGORIES,
  ];
  if (slug) {
    keysToDel.push(CACHE_KEYS.PRODUCT_DETAIL(slug));
  }
  await cache.del(keysToDel);
  await cache.delByPattern('triclinium:cache:products:*');
}

export async function invalidateServiceCaches(slug?: string) {
  const keysToDel = [
    CACHE_KEYS.HOMEPAGE,
    CACHE_KEYS.SERVICE_CATEGORIES,
  ];
  if (slug) {
    keysToDel.push(CACHE_KEYS.SERVICE_DETAIL(slug));
  }
  await cache.del(keysToDel);
  await cache.delByPattern('triclinium:cache:services:*');
}

export async function invalidateCmsCaches(pageSlug?: string, blogSlug?: string) {
  const keysToDel = [CACHE_KEYS.HOMEPAGE, CACHE_KEYS.TESTIMONIALS, CACHE_KEYS.FAQS];
  if (pageSlug) keysToDel.push(CACHE_KEYS.PAGE(pageSlug));
  if (blogSlug) keysToDel.push(CACHE_KEYS.BLOG_POST(blogSlug));
  await cache.del(keysToDel);
  await cache.delByPattern('triclinium:cache:blog:*');
  await cache.delByPattern('triclinium:cache:page:*');
}
