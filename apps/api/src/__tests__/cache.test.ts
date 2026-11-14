import { cache, CACHE_KEYS } from '../integrations/redis';

describe('Resilient Cache Integration', () => {
  it('should store and retrieve data with TTL', async () => {
    const key = 'test:item:1';
    const data = { id: 1, name: 'Precision Assembly' };

    await cache.set(key, data, 60);
    const retrieved = await cache.get<typeof data>(key);

    expect(retrieved).toEqual(data);
  });

  it('should delete keys properly', async () => {
    const key = 'test:item:to-delete';
    await cache.set(key, 'value', 60);
    await cache.del(key);

    const retrieved = await cache.get(key);
    expect(retrieved).toBeNull();
  });

  it('should support atomic increment for rate limiting', async () => {
    const key = 'ratelimit:test-ip';
    const c1 = await cache.incr(key, 60);
    const c2 = await cache.incr(key, 60);

    expect(c1).toBe(1);
    expect(c2).toBe(2);
  });
});
