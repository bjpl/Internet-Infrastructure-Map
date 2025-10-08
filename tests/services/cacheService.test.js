/**
 * Unit Tests for Cache Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCache, CacheService } from '../../src/services/cacheService.js';

describe('MemoryCache', () => {
  let cache;

  beforeEach(() => {
    cache = new MemoryCache(1000); // 1KB max for testing
  });

  it('should store and retrieve values', async () => {
    await cache.set('key1', { data: 'value1' }, 60000);
    const value = await cache.get('key1');

    expect(value).toEqual({ data: 'value1' });
  });

  it('should return null for missing keys', async () => {
    const value = await cache.get('nonexistent');
    expect(value).toBeNull();
  });

  it('should expire values after TTL', async () => {
    await cache.set('key1', { data: 'value1' }, 100); // 100ms TTL

    // Value should exist immediately
    let value = await cache.get('key1');
    expect(value).toEqual({ data: 'value1' });

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));

    // Value should be expired
    value = await cache.get('key1');
    expect(value).toBeNull();
  });

  it('should delete values', async () => {
    await cache.set('key1', { data: 'value1' }, 60000);
    const deleted = await cache.delete('key1');

    expect(deleted).toBe(true);
    const value = await cache.get('key1');
    expect(value).toBeNull();
  });

  it('should clear all values', async () => {
    await cache.set('key1', 'value1', 60000);
    await cache.set('key2', 'value2', 60000);

    await cache.clear();

    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
  });

  it('should evict LRU items when full', async () => {
    // Fill cache to capacity
    await cache.set('key1', 'x'.repeat(300), 60000);
    await cache.set('key2', 'x'.repeat(300), 60000);
    await cache.set('key3', 'x'.repeat(300), 60000);

    // Access key1 to make it more recent
    await cache.get('key1');

    // Add another item (should evict key2)
    await cache.set('key4', 'x'.repeat(300), 60000);

    expect(await cache.get('key1')).toBeTruthy(); // Should exist
    expect(await cache.get('key2')).toBeNull(); // Should be evicted
    expect(await cache.get('key3')).toBeTruthy(); // Should exist
    expect(await cache.get('key4')).toBeTruthy(); // Should exist
  });

  it('should track statistics', async () => {
    await cache.set('key1', 'value1', 60000);

    await cache.get('key1'); // Hit
    await cache.get('key2'); // Miss

    const stats = cache.getStats();

    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(parseFloat(stats.hitRate)).toBe(0.50);
  });
});

describe('CacheService', () => {
  let cacheService;

  beforeEach(() => {
    cacheService = new CacheService({
      l1MaxSize: 1000,
      dbName: 'test-cache'
    });
  });

  it('should set and get values', async () => {
    await cacheService.set('key1', { data: 'value1' });
    const value = await cacheService.get('key1');

    expect(value).toEqual({ data: 'value1' });
  });

  it('should return null for missing keys', async () => {
    const value = await cacheService.get('nonexistent');
    expect(value).toBeNull();
  });

  it('should delete values', async () => {
    await cacheService.set('key1', 'value1');
    const deleted = await cacheService.delete('key1');

    expect(deleted).toBe(true);
    const value = await cacheService.get('key1');
    expect(value).toBeNull();
  });

  it('should track cache statistics', () => {
    const stats = cacheService.getStats();

    expect(stats).toHaveProperty('l1');
    expect(stats.l1).toHaveProperty('hits');
    expect(stats.l1).toHaveProperty('misses');
    expect(stats.l1).toHaveProperty('hitRate');
  });

  it('should implement stale-while-revalidate', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { data: `value-${callCount}` };
    };

    // First call should fetch
    const result1 = await cacheService.staleWhileRevalidate('key1', fetcher);
    expect(result1).toEqual({ data: 'value-1' });
    expect(callCount).toBe(1);

    // Second immediate call should use cache
    const result2 = await cacheService.staleWhileRevalidate('key1', fetcher);
    expect(result2).toEqual({ data: 'value-1' });
    expect(callCount).toBe(1); // Fetcher not called again
  });
});
