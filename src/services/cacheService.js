/**
 * Cache Service
 *
 * Multi-layer caching system with Memory (L1), IndexedDB (L2), and Service Worker (L3)
 * Implements stale-while-revalidate pattern and smart invalidation strategies
 *
 * @module services/cacheService
 */

/**
 * Memory Cache (L1)
 * Fast in-memory cache with LRU eviction
 */
class MemoryCache {
  /**
   * @param {number} maxSize - Maximum cache size in bytes
   */
  constructor(maxSize = 50 * 1024 * 1024) { // 50MB default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.currentSize = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {Promise<*>} Cached value or null
   */
  async get(key) {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.currentSize -= item.size;
      this.stats.misses++;
      return null;
    }

    // Update access time for LRU
    item.accessedAt = Date.now();
    this.stats.hits++;
    return item.value;
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = 300000) {
    const size = this.estimateSize(value);

    // Evict if necessary
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    // Don't cache if item is larger than max size
    if (size > this.maxSize) {
      console.warn(`[MemoryCache] Item too large to cache: ${key} (${size} bytes)`);
      return;
    }

    this.cache.set(key, {
      value,
      size,
      expiresAt: Date.now() + ttl,
      accessedAt: Date.now(),
      createdAt: Date.now()
    });

    this.currentSize += size;
  }

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if item was deleted
   */
  async delete(key) {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.currentSize -= item.size;
      return true;
    }
    return false;
  }

  /**
   * Clear all items
   * @returns {Promise<void>}
   */
  async clear() {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Evict least recently used item
   * @private
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.accessedAt < oldestTime) {
        oldestTime = item.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const item = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      this.currentSize -= item.size;
      this.stats.evictions++;
    }
  }

  /**
   * Estimate size of value in bytes
   * @private
   * @param {*} value - Value to estimate
   * @returns {number} Estimated size in bytes
   */
  estimateSize(value) {
    const str = JSON.stringify(value);
    // Rough estimate: 2 bytes per character for UTF-16
    return str.length * 2;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2),
      size: this.currentSize,
      maxSize: this.maxSize,
      itemCount: this.cache.size,
      utilization: ((this.currentSize / this.maxSize) * 100).toFixed(2) + '%'
    };
  }
}

/**
 * IndexedDB Cache (L2)
 * Persistent browser storage
 */
class IndexedDBCache {
  /**
   * @param {string} dbName - Database name
   * @param {string} [storeName='cache'] - Object store name
   */
  constructor(dbName, storeName = 'cache') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
    this.ready = this.init();
  }

  /**
   * Initialize IndexedDB
   * @private
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {Promise<*>} Cached value or null
   */
  async get(key) {
    await this.ready;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result;

        if (!item) {
          resolve(null);
          return;
        }

        // Check expiration
        if (Date.now() > item.expiresAt) {
          this.delete(key); // Clean up expired item
          resolve(null);
          return;
        }

        resolve(item.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = 300000) {
    await this.ready;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const item = {
        key,
        value,
        expiresAt: Date.now() + ttl,
        createdAt: Date.now()
      };

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if item was deleted
   */
  async delete(key) {
    await this.ready;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all items
   * @returns {Promise<void>}
   */
  async clear() {
    await this.ready;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clean up expired items
   * @returns {Promise<number>} Number of items cleaned
   */
  async cleanExpired() {
    await this.ready;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          count++;
          cursor.continue();
        } else {
          resolve(count);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Cache Invalidation Strategy
 * Determines when and how to invalidate cached data
 */
class InvalidationStrategy {
  constructor() {
    this.rules = new Map();
    this.initializeRules();
  }

  /**
   * Initialize invalidation rules for different data types
   * @private
   */
  initializeRules() {
    // Submarine cables change rarely
    this.rules.set('cables', {
      ttl: 86400000 * 30, // 30 days
      staleWhileRevalidate: true,
      revalidateOn: ['user-interaction', 'manual-refresh']
    });

    // BGP routes change frequently
    this.rules.set('bgp-routes', {
      ttl: 300000, // 5 minutes
      staleWhileRevalidate: true,
      revalidateOn: ['time-based', 'websocket-update']
    });

    // Real-time metrics
    this.rules.set('metrics', {
      ttl: 60000, // 1 minute
      staleWhileRevalidate: false,
      revalidateOn: ['time-based']
    });

    // Data centers change occasionally
    this.rules.set('datacenters', {
      ttl: 86400000 * 7, // 7 days
      staleWhileRevalidate: true,
      revalidateOn: ['user-interaction']
    });

    // IXP data
    this.rules.set('ixps', {
      ttl: 86400000 * 7, // 7 days
      staleWhileRevalidate: true,
      revalidateOn: ['user-interaction']
    });
  }

  /**
   * Get invalidation rule for data type
   * @param {string} dataType - Type of data
   * @returns {Object} Invalidation rule
   */
  getRule(dataType) {
    return this.rules.get(dataType) || {
      ttl: 300000, // Default 5 minutes
      staleWhileRevalidate: true,
      revalidateOn: ['time-based']
    };
  }

  /**
   * Determine if data should be invalidated
   * @param {string} key - Cache key
   * @param {Object} metadata - Cache metadata
   * @returns {boolean} True if should invalidate
   */
  shouldInvalidate(key, metadata) {
    const dataType = this.extractDataType(key);
    const rule = this.getRule(dataType);

    // Time-based invalidation
    const age = Date.now() - metadata.createdAt;
    if (age > rule.ttl && !rule.staleWhileRevalidate) {
      return true;
    }

    return false;
  }

  /**
   * Extract data type from cache key
   * @private
   * @param {string} key - Cache key
   * @returns {string} Data type
   */
  extractDataType(key) {
    // Extract from key pattern like "cables:123" or "api:bgp-routes:456"
    const parts = key.split(':');
    return parts[parts.length - 2] || parts[0];
  }
}

/**
 * Multi-Layer Cache Manager
 * Coordinates L1 (Memory), L2 (IndexedDB), and L3 (Service Worker) caches
 */
export class CacheService {
  /**
   * @param {Object} [options={}] - Cache configuration
   * @param {number} [options.l1MaxSize] - L1 cache max size
   * @param {string} [options.dbName] - IndexedDB database name
   */
  constructor(options = {}) {
    this.l1 = new MemoryCache(options.l1MaxSize);
    this.l2 = new IndexedDBCache(options.dbName || 'internet-map-cache');
    this.invalidationStrategy = new InvalidationStrategy();
    this.revalidating = new Set(); // Track ongoing revalidations
  }

  /**
   * Get data from cache with fallback through layers
   * @param {string} key - Cache key
   * @param {Object} [options={}] - Get options
   * @returns {Promise<*>} Cached value or null
   *
   * @example
   * const cacheService = new CacheService();
   * const data = await cacheService.get('cables:atlantic-1');
   */
  async get(key, options = {}) {
    const { maxAge = Infinity } = options;

    // Try L1 (Memory)
    let data = await this.l1.get(key);
    if (data) {
      return data;
    }

    // Try L2 (IndexedDB)
    data = await this.l2.get(key);
    if (data) {
      // Promote to L1
      const rule = this.invalidationStrategy.getRule(this.invalidationStrategy.extractDataType(key));
      await this.l1.set(key, data, rule.ttl);
      return data;
    }

    return null;
  }

  /**
   * Set data in cache layers
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {Object} [options={}] - Set options
   * @returns {Promise<void>}
   *
   * @example
   * await cacheService.set('cables:atlantic-1', cableData, {
   *   persist: true,
   *   ttl: 86400000
   * });
   */
  async set(key, value, options = {}) {
    const dataType = this.invalidationStrategy.extractDataType(key);
    const rule = this.invalidationStrategy.getRule(dataType);
    const { ttl = rule.ttl, persist = true } = options;

    // Always set in L1
    await this.l1.set(key, value, ttl);

    // Conditionally persist to L2
    if (persist) {
      await this.l2.set(key, value, ttl);
    }
  }

  /**
   * Stale-While-Revalidate pattern
   * Returns stale data immediately while fetching fresh data in background
   * @param {string} key - Cache key
   * @param {Function} fetcher - Function to fetch fresh data
   * @param {Object} [options={}] - Options
   * @returns {Promise<*>} Data (may be stale)
   *
   * @example
   * const data = await cacheService.staleWhileRevalidate(
   *   'cables:atlantic-1',
   *   () => apiClient.get('/cables/atlantic-1')
   * );
   */
  async staleWhileRevalidate(key, fetcher, options = {}) {
    const cached = await this.get(key);
    const dataType = this.invalidationStrategy.extractDataType(key);
    const rule = this.invalidationStrategy.getRule(dataType);

    if (cached) {
      // Return cached data immediately
      const cacheAge = Date.now() - (cached.metadata?.timestamp || 0);

      // Revalidate in background if stale
      if (cacheAge > rule.ttl && !this.revalidating.has(key)) {
        this.backgroundRevalidate(key, fetcher, options);
      }

      return cached;
    }

    // No cache, fetch and cache
    const fresh = await fetcher();
    await this.set(key, fresh, options);
    return fresh;
  }

  /**
   * Background revalidation
   * @private
   * @param {string} key - Cache key
   * @param {Function} fetcher - Fetch function
   * @param {Object} options - Options
   */
  async backgroundRevalidate(key, fetcher, options) {
    if (this.revalidating.has(key)) {
      return; // Already revalidating
    }

    this.revalidating.add(key);

    try {
      const fresh = await fetcher();
      await this.set(key, fresh, options);

      // Emit event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cache-revalidated', {
          detail: { key, data: fresh }
        }));
      }
    } catch (error) {
      console.warn(`[CacheService] Background revalidation failed for ${key}:`, error);
    } finally {
      this.revalidating.delete(key);
    }
  }

  /**
   * Delete item from all cache layers
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(key) {
    const [deleted1, deleted2] = await Promise.all([
      this.l1.delete(key),
      this.l2.delete(key)
    ]);

    return deleted1 || deleted2;
  }

  /**
   * Clear all caches
   * @returns {Promise<void>}
   */
  async clear() {
    await Promise.all([
      this.l1.clear(),
      this.l2.clear()
    ]);
  }

  /**
   * Get cache statistics
   * @returns {Object} Combined cache stats
   */
  getStats() {
    return {
      l1: this.l1.getStats(),
      revalidating: this.revalidating.size
    };
  }

  /**
   * Clean expired items from persistent cache
   * @returns {Promise<number>} Number of items cleaned
   */
  async cleanExpired() {
    return await this.l2.cleanExpired();
  }
}

export { MemoryCache, IndexedDBCache, InvalidationStrategy };
