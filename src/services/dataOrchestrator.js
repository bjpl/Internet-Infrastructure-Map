/**
 * Data Orchestrator
 *
 * Coordinates all data sources with intelligent fallback chain
 * Manages data accuracy confidence levels and auto-refresh scheduling
 * Provides unified interface for components
 *
 * @module services/dataOrchestrator
 */

import { CacheService } from './cacheService.js';
import { TeleGeographyAPI } from './dataSources/TeleGeographyAPI.js';
import { PeeringDBAPI } from './dataSources/PeeringDBAPI.js';
import { CloudflareRadarAPI } from './dataSources/CloudflareRadarAPI.js';
import { FallbackDataSource } from './dataSources/FallbackDataSource.js';

/**
 * Data Orchestrator
 * Central service for coordinating all data sources and caching
 */
export class DataOrchestrator {
  /**
   * @param {Object} [config={}] - Configuration options
   *
   * @example
   * const orchestrator = new DataOrchestrator({
   *   enableAutoRefresh: true,
   *   refreshInterval: 300000,
   *   enableCache: true
   * });
   */
  constructor(config = {}) {
    this.config = {
      enableAutoRefresh: config.enableAutoRefresh !== false,
      refreshInterval: config.refreshInterval || 300000, // 5 minutes
      enableCache: config.enableCache !== false,
      preferredSources: config.preferredSources || ['live', 'cache', 'fallback'],
      ...config
    };

    // Initialize services
    this.cache = new CacheService(config.cache);
    this.telegeography = new TeleGeographyAPI(config.telegeography);
    this.peeringdb = new PeeringDBAPI(config.peeringdb);
    this.cloudflareRadar = new CloudflareRadarAPI(config.cloudflareRadar);
    this.fallback = new FallbackDataSource();

    // Track which sources succeeded for logging
    this.sourceAttempts = {
      cables: [],
      ixps: [],
      datacenters: [],
      attacks: []
    };

    // Track data freshness
    this.freshness = new Map();

    // Auto-refresh tracking
    this.refreshTimers = new Map();

    // Statistics
    this.stats = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      fallbacks: 0,
      errors: 0
    };

    if (this.config.enableAutoRefresh) {
      this.startAutoRefresh();
    }
  }

  /**
   * Get submarine cables with automatic fallback
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object>} Cable data with metadata
   *
   * @example
   * const result = await orchestrator.getCables({ region: 'Atlantic' });
   * console.log(`Got ${result.data.length} cables with confidence ${result.metadata.confidence}`);
   */
  async getCables(options = {}) {
    this.stats.requests++;
    const cacheKey = `cables:${JSON.stringify(options)}`;
    this.sourceAttempts.cables = [];

    try {
      // Try cache first if enabled
      if (this.config.enableCache) {
        const cached = await this.cache.get(cacheKey);
        if (cached && !this.isStale(cacheKey)) {
          this.stats.cacheHits++;
          this.sourceAttempts.cables.push({ source: 'cache', success: true });
          console.log('[DataOrchestrator] ✓ Cables from cache', {
            count: cached.data?.length,
            confidence: cached.metadata?.confidence
          });
          return this.enrichMetadata(cached, 'cache');
        }
        this.stats.cacheMisses++;
      }

      // Try live API
      try {
        this.stats.apiCalls++;
        console.log('[DataOrchestrator] → Fetching cables from TeleGeography API...');
        const cables = await this.telegeography.getCables(options);

        const result = {
          data: cables,
          metadata: {
            source: 'telegeography',
            confidence: 0.85,
            freshness: 'live',
            timestamp: Date.now(),
            count: cables.length
          }
        };

        this.sourceAttempts.cables.push({ source: 'telegeography-api', success: true });
        console.log('[DataOrchestrator] ✓ Cables from live API', {
          count: cables.length,
          confidence: 0.85
        });

        // Cache the result
        if (this.config.enableCache) {
          await this.cache.set(cacheKey, result, { ttl: 86400000 * 30, persist: true });
        }

        this.updateFreshness(cacheKey, result.metadata);
        return result;

      } catch (apiError) {
        this.sourceAttempts.cables.push({
          source: 'telegeography-api',
          success: false,
          error: apiError.message
        });
        console.warn('[DataOrchestrator] ✗ TeleGeography API failed:', apiError.message);

        // Try stale cache before fallback
        if (this.config.enableCache) {
          const staleCache = await this.cache.get(cacheKey);
          if (staleCache) {
            console.log('[DataOrchestrator] ⚠ Using stale cache for cables');
            this.sourceAttempts.cables.push({ source: 'stale-cache', success: true });
            return {
              ...staleCache,
              metadata: {
                ...staleCache.metadata,
                freshness: 'stale',
                confidence: Math.max(staleCache.metadata.confidence - 0.2, 0.4),
                staleSince: this.freshness.get(cacheKey)?.timestamp
              }
            };
          }
        }

        // Try fallback data
        console.log('[DataOrchestrator] → Trying fallback data source...');
        this.stats.fallbacks++;
        const fallbackCables = await this.fallback.getCables(options);

        const result = {
          data: fallbackCables,
          metadata: {
            source: 'fallback',
            confidence: 0.5,
            freshness: 'static',
            timestamp: Date.now(),
            count: fallbackCables.length,
            fallbackReason: apiError.message
          }
        };

        this.sourceAttempts.cables.push({ source: 'fallback', success: true });
        console.log('[DataOrchestrator] ✓ Cables from fallback', {
          count: fallbackCables.length,
          confidence: 0.5
        });

        // Cache fallback data briefly
        if (this.config.enableCache) {
          await this.cache.set(cacheKey, result, { ttl: 3600000 });
        }

        return result;
      }
    } catch (error) {
      this.stats.errors++;
      console.error('[DataOrchestrator] ✗ Failed to get cables from all sources:', error);
      console.log('[DataOrchestrator] Source attempts:', this.sourceAttempts.cables);
      throw error;
    }
  }

  /**
   * Get Internet Exchange Points with fallback
   * @param {Object} [filters={}] - Query filters
   * @returns {Promise<Object>} IXP data with metadata
   *
   * @example
   * const result = await orchestrator.getIXPs({ country: 'US' });
   */
  async getIXPs(filters = {}) {
    this.stats.requests++;
    const cacheKey = `ixps:${JSON.stringify(filters)}`;

    try {
      // Check cache
      if (this.config.enableCache) {
        const cached = await this.cache.get(cacheKey);
        if (cached && !this.isStale(cacheKey)) {
          this.stats.cacheHits++;
          return this.enrichMetadata(cached, 'cache');
        }
        this.stats.cacheMisses++;
      }

      // Try live API
      try {
        this.stats.apiCalls++;
        const ixps = await this.peeringdb.getIXPs(filters);

        const result = {
          data: ixps,
          metadata: {
            source: 'peeringdb',
            confidence: 0.98,
            freshness: 'live',
            timestamp: Date.now(),
            count: ixps.length
          }
        };

        // Cache result
        if (this.config.enableCache) {
          await this.cache.set(cacheKey, result, { ttl: 86400000 * 7, persist: true });
        }

        this.updateFreshness(cacheKey, result.metadata);
        return result;

      } catch (apiError) {
        console.warn('[DataOrchestrator] PeeringDB API failed, trying fallback:', apiError.message);

        // Try fallback
        this.stats.fallbacks++;
        const fallbackIXPs = await this.fallback.getIXPs(filters);

        return {
          data: fallbackIXPs,
          metadata: {
            source: 'fallback',
            confidence: 0.5,
            freshness: 'static',
            timestamp: Date.now(),
            count: fallbackIXPs.length,
            fallbackReason: apiError.message
          }
        };
      }
    } catch (error) {
      this.stats.errors++;
      console.error('[DataOrchestrator] Failed to get IXPs:', error);
      throw error;
    }
  }

  /**
   * Get data centers with fallback
   * @param {Object} [filters={}] - Query filters
   * @returns {Promise<Object>} Data center data with metadata
   *
   * @example
   * const result = await orchestrator.getDataCenters({ city: 'London' });
   */
  async getDataCenters(filters = {}) {
    this.stats.requests++;
    const cacheKey = `datacenters:${JSON.stringify(filters)}`;

    try {
      // Check cache
      if (this.config.enableCache) {
        const cached = await this.cache.get(cacheKey);
        if (cached && !this.isStale(cacheKey)) {
          this.stats.cacheHits++;
          return this.enrichMetadata(cached, 'cache');
        }
        this.stats.cacheMisses++;
      }

      // Try live API
      try {
        this.stats.apiCalls++;
        const facilities = await this.peeringdb.getFacilities(filters);

        const result = {
          data: facilities,
          metadata: {
            source: 'peeringdb',
            confidence: 0.95,
            freshness: 'live',
            timestamp: Date.now(),
            count: facilities.length
          }
        };

        // Cache result
        if (this.config.enableCache) {
          await this.cache.set(cacheKey, result, { ttl: 86400000 * 7, persist: true });
        }

        this.updateFreshness(cacheKey, result.metadata);
        return result;

      } catch (apiError) {
        console.warn('[DataOrchestrator] PeeringDB facilities API failed, trying fallback:', apiError.message);

        // Try fallback
        this.stats.fallbacks++;
        const fallbackDCs = await this.fallback.getDataCenters(filters);

        return {
          data: fallbackDCs,
          metadata: {
            source: 'fallback',
            confidence: 0.5,
            freshness: 'static',
            timestamp: Date.now(),
            count: fallbackDCs.length,
            fallbackReason: apiError.message
          }
        };
      }
    } catch (error) {
      this.stats.errors++;
      console.error('[DataOrchestrator] Failed to get data centers:', error);
      throw error;
    }
  }

  /**
   * Get real-time attack data from Cloudflare Radar
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object>} Attack data with metadata
   */
  async getAttackData(options = {}) {
    this.stats.requests++;
    const cacheKey = `attacks:${JSON.stringify(options)}`;
    this.sourceAttempts.attacks = [];

    try {
      // Try live API (short cache for real-time data)
      if (this.config.enableCache) {
        const cached = await this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.metadata.timestamp < 60000)) { // 1 minute cache
          this.stats.cacheHits++;
          this.sourceAttempts.attacks.push({ source: 'cache', success: true });
          return this.enrichMetadata(cached, 'cache');
        }
        this.stats.cacheMisses++;
      }

      try {
        this.stats.apiCalls++;
        console.log('[DataOrchestrator] → Fetching attack data from Cloudflare Radar...');
        const attacks = await this.cloudflareRadar.getAttackData(options);

        this.sourceAttempts.attacks.push({ source: 'cloudflare-radar-api', success: true });
        console.log('[DataOrchestrator] ✓ Attack data from live API', {
          count: attacks.data?.length,
          confidence: attacks.metadata?.confidence
        });

        // Cache briefly (1 minute for real-time data)
        if (this.config.enableCache) {
          await this.cache.set(cacheKey, attacks, { ttl: 60000 });
        }

        return attacks;

      } catch (apiError) {
        this.sourceAttempts.attacks.push({
          source: 'cloudflare-radar-api',
          success: false,
          error: apiError.message
        });
        console.warn('[DataOrchestrator] ✗ Cloudflare Radar API failed:', apiError.message);

        // Return empty with error metadata
        return {
          data: [],
          metadata: {
            source: 'unavailable',
            confidence: 0,
            freshness: 'none',
            timestamp: Date.now(),
            count: 0,
            error: apiError.message
          }
        };
      }
    } catch (error) {
      this.stats.errors++;
      console.error('[DataOrchestrator] ✗ Failed to get attack data:', error);
      throw error;
    }
  }

  /**
   * Get all infrastructure data (cables, IXPs, data centers, attacks)
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object>} Combined infrastructure data
   *
   * @example
   * const infrastructure = await orchestrator.getAllInfrastructure();
   */
  async getAllInfrastructure(options = {}) {
    console.log('[DataOrchestrator] Fetching all infrastructure data...');

    const [cables, ixps, datacenters, attacks] = await Promise.all([
      this.getCables(options.cables).catch(e => {
        console.error('[DataOrchestrator] Cables fetch failed:', e.message);
        return { data: [], metadata: { error: e.message, confidence: 0 } };
      }),
      this.getIXPs(options.ixps).catch(e => {
        console.error('[DataOrchestrator] IXPs fetch failed:', e.message);
        return { data: [], metadata: { error: e.message, confidence: 0 } };
      }),
      this.getDataCenters(options.datacenters).catch(e => {
        console.error('[DataOrchestrator] Data centers fetch failed:', e.message);
        return { data: [], metadata: { error: e.message, confidence: 0 } };
      }),
      this.getAttackData(options.attacks).catch(e => {
        console.error('[DataOrchestrator] Attack data fetch failed:', e.message);
        return { data: [], metadata: { error: e.message, confidence: 0 } };
      })
    ]);

    const result = {
      cables,
      ixps,
      datacenters,
      attacks,
      metadata: {
        timestamp: Date.now(),
        totalItems: cables.data.length + ixps.data.length + datacenters.data.length,
        averageConfidence: this.calculateAverageConfidence([cables, ixps, datacenters, attacks]),
        sourceAttempts: this.sourceAttempts
      }
    };

    console.log('[DataOrchestrator] ✓ All infrastructure data fetched', {
      cables: cables.data.length,
      ixps: ixps.data.length,
      datacenters: datacenters.data.length,
      attacks: attacks.data.length,
      avgConfidence: result.metadata.averageConfidence
    });

    return result;
  }

  /**
   * Invalidate cache for specific data type
   * @param {string} dataType - Type of data to invalidate
   * @returns {Promise<void>}
   */
  async invalidateCache(dataType) {
    // This would invalidate all cache keys matching the pattern
    console.log(`[DataOrchestrator] Invalidating cache for ${dataType}`);
    // Implementation would delete all matching keys
  }

  /**
   * Force refresh of data
   * @param {string} dataType - Type of data to refresh
   * @param {Object} [options={}] - Refresh options
   * @returns {Promise<Object>} Refreshed data
   */
  async refreshData(dataType, options = {}) {
    await this.invalidateCache(dataType);

    switch (dataType) {
      case 'cables':
        return this.getCables(options);
      case 'ixps':
        return this.getIXPs(options);
      case 'datacenters':
        return this.getDataCenters(options);
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  /**
   * Start auto-refresh for all data types
   * @private
   */
  startAutoRefresh() {
    const dataTypes = ['cables', 'ixps', 'datacenters'];

    dataTypes.forEach(dataType => {
      const timer = setInterval(async () => {
        try {
          console.log(`[DataOrchestrator] Auto-refreshing ${dataType}`);
          await this.refreshData(dataType);
        } catch (error) {
          console.error(`[DataOrchestrator] Auto-refresh failed for ${dataType}:`, error);
        }
      }, this.config.refreshInterval);

      this.refreshTimers.set(dataType, timer);
    });
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    for (const timer of this.refreshTimers.values()) {
      clearInterval(timer);
    }
    this.refreshTimers.clear();
  }

  /**
   * Check if cached data is stale
   * @private
   * @param {string} key - Cache key
   * @returns {boolean} True if stale
   */
  isStale(key) {
    const freshness = this.freshness.get(key);
    if (!freshness) return true;

    const age = Date.now() - freshness.timestamp;
    const maxAge = this.getMaxAge(key);

    return age > maxAge;
  }

  /**
   * Get maximum age for cache key
   * @private
   * @param {string} key - Cache key
   * @returns {number} Max age in milliseconds
   */
  getMaxAge(key) {
    if (key.startsWith('cables:')) return 86400000 * 30; // 30 days
    if (key.startsWith('ixps:')) return 86400000 * 7; // 7 days
    if (key.startsWith('datacenters:')) return 86400000 * 7; // 7 days
    return 300000; // 5 minutes default
  }

  /**
   * Update freshness tracking
   * @private
   * @param {string} key - Cache key
   * @param {Object} metadata - Data metadata
   */
  updateFreshness(key, metadata) {
    this.freshness.set(key, {
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Enrich metadata with cache information
   * @private
   * @param {Object} data - Cached data
   * @param {string} source - Source type
   * @returns {Object} Enriched data
   */
  enrichMetadata(data, source) {
    return {
      ...data,
      metadata: {
        ...data.metadata,
        retrievedFrom: source,
        cachedAt: this.freshness.get(source)?.timestamp
      }
    };
  }

  /**
   * Calculate average confidence across multiple results
   * @private
   * @param {Array} results - Array of result objects
   * @returns {number} Average confidence (0-1)
   */
  calculateAverageConfidence(results) {
    const confidences = results
      .map(r => r.metadata?.confidence || 0)
      .filter(c => c > 0);

    if (confidences.length === 0) return 0;

    return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  }

  /**
   * Get comprehensive health status
   * @returns {Object} Health information for all services
   */
  getHealth() {
    return {
      orchestrator: {
        autoRefresh: this.config.enableAutoRefresh,
        cacheEnabled: this.config.enableCache,
        refreshInterval: this.config.refreshInterval,
        activeRefreshTimers: this.refreshTimers.size
      },
      services: {
        telegeography: this.telegeography.getHealth(),
        peeringdb: this.peeringdb.getHealth(),
        cloudflareRadar: this.cloudflareRadar.getHealth(),
        fallback: this.fallback.getHealth()
      },
      cache: this.cache.getStats(),
      statistics: this.getStatistics(),
      recentAttempts: this.sourceAttempts
    };
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStatistics() {
    const cacheHitRate = this.stats.requests > 0
      ? (this.stats.cacheHits / this.stats.requests * 100).toFixed(2)
      : 0;

    const fallbackRate = this.stats.requests > 0
      ? (this.stats.fallbacks / this.stats.requests * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      cacheHitRate: `${cacheHitRate}%`,
      fallbackRate: `${fallbackRate}%`
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.stats = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      fallbacks: 0,
      errors: 0
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopAutoRefresh();
    this.freshness.clear();
  }
}

export default DataOrchestrator;
