/**
 * Cloudflare Radar API Client
 *
 * Provides real-time attack data, traffic patterns, and BGP routing information
 * from Cloudflare's global network observability platform
 *
 * API Documentation: https://developers.cloudflare.com/radar/
 * Rate Limits: 300 requests per 5 minutes (free tier)
 *
 * @module services/dataSources/CloudflareRadarAPI
 */

import { APIClient } from '../apiService.js';

/**
 * Cloudflare Radar API Client
 * Fetches real-time attack and traffic data from Cloudflare's global network
 */
export class CloudflareRadarAPI {
  /**
   * @param {Object} [config={}] - Configuration options
   * @param {string} [config.token] - Cloudflare API token (required)
   * @param {string} [config.baseUrl] - API base URL
   * @param {number} [config.pollInterval=60000] - Polling interval for real-time data (ms)
   */
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://api.cloudflare.com/client/v4/radar';
    this.token = config.token || import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN;
    this.pollInterval = config.pollInterval || 60000; // 1 minute

    if (!this.token) {
      console.warn('[CloudflareRadarAPI] No API token provided. Real-time data will not be available.');
    }

    this.client = new APIClient({
      baseUrl: this.baseUrl,
      timeout: 15000,
      headers: this.token ? {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      } : {},
      circuitBreaker: {
        failureThreshold: 5,
        timeout: 60000
      },
      retry: {
        maxAttempts: 3,
        baseDelay: 1000
      }
    });

    // Register transformers
    this.client.registerTransformer('cloudflare-attacks', this.transformAttackData.bind(this));
    this.client.registerTransformer('cloudflare-traffic', this.transformTrafficData.bind(this));
    this.client.registerTransformer('cloudflare-bgp', this.transformBGPData.bind(this));

    // Rate limiting (300 requests per 5 minutes)
    this.rateLimit = {
      requests: 300,
      window: 300000, // 5 minutes
      remaining: 300,
      resetAt: Date.now() + 300000
    };

    // Polling state
    this.pollingActive = false;
    this.pollingTimer = null;
    this.latestData = {
      attacks: null,
      traffic: null,
      bgp: null
    };
  }

  /**
   * Get Layer 3/4 DDoS attack timeseries data
   *
   * Rate Limit: Counts as 1 request per call
   * Update Frequency: Real-time (1-minute granularity)
   *
   * @param {Object} [options={}] - Query options
   * @param {string} [options.dateRange='1h'] - Time range (1h, 6h, 12h, 24h, 7d, 30d)
   * @param {string} [options.location] - ISO 3166-1 alpha-2 country code
   * @param {string[]} [options.protocols] - Protocol filter (tcp, udp, icmp, gre)
   * @returns {Promise<Object>} Attack data with metadata
   *
   * @example
   * const attacks = await cloudflare.getAttackData({ dateRange: '1h', location: 'US' });
   * console.log(`Detected ${attacks.data.length} attacks in last hour`);
   */
  async getAttackData(options = {}) {
    if (!this.token) {
      throw new Error('Cloudflare Radar API token required for attack data');
    }

    try {
      const params = {
        dateRange: options.dateRange || '1h',
        format: 'json',
        ...this.buildLocationParams(options.location),
        ...this.buildProtocolParams(options.protocols)
      };

      const response = await this.client.get('/attacks/layer3/timeseries_groups', {
        params,
        source: 'cloudflare-attacks',
        transform: true
      });

      this.updateRateLimit(response);
      this.latestData.attacks = response;

      return response;
    } catch (error) {
      console.error('[CloudflareRadarAPI] Failed to fetch attack data:', error);
      throw error;
    }
  }

  /**
   * Get global traffic patterns and trends
   *
   * Rate Limit: Counts as 1 request per call
   * Update Frequency: Every 5 minutes
   *
   * @param {Object} [options={}] - Query options
   * @param {string} [options.dateRange='24h'] - Time range
   * @param {string} [options.location] - Country code
   * @returns {Promise<Object>} Traffic data with metadata
   */
  async getTrafficData(options = {}) {
    if (!this.token) {
      throw new Error('Cloudflare Radar API token required for traffic data');
    }

    try {
      const params = {
        dateRange: options.dateRange || '24h',
        format: 'json',
        ...this.buildLocationParams(options.location)
      };

      const response = await this.client.get('/http/timeseries_groups', {
        params,
        source: 'cloudflare-traffic',
        transform: true
      });

      this.updateRateLimit(response);
      this.latestData.traffic = response;

      return response;
    } catch (error) {
      console.error('[CloudflareRadarAPI] Failed to fetch traffic data:', error);
      throw error;
    }
  }

  /**
   * Get BGP routing announcements and changes
   *
   * Rate Limit: Counts as 1 request per call
   * Update Frequency: Real-time
   *
   * @param {Object} [options={}] - Query options
   * @param {number} [options.asn] - Autonomous System Number
   * @param {string} [options.prefix] - IP prefix
   * @returns {Promise<Object>} BGP data with metadata
   */
  async getBGPData(options = {}) {
    if (!this.token) {
      throw new Error('Cloudflare Radar API token required for BGP data');
    }

    try {
      const params = {
        format: 'json'
      };

      if (options.asn) params.asn = options.asn;
      if (options.prefix) params.prefix = options.prefix;

      const response = await this.client.get('/bgp/routes', {
        params,
        source: 'cloudflare-bgp',
        transform: true
      });

      this.updateRateLimit(response);
      this.latestData.bgp = response;

      return response;
    } catch (error) {
      console.error('[CloudflareRadarAPI] Failed to fetch BGP data:', error);
      throw error;
    }
  }

  /**
   * Get top attack vectors globally or by location
   *
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object>} Attack vector statistics
   */
  async getAttackVectors(options = {}) {
    if (!this.token) {
      throw new Error('Cloudflare Radar API token required');
    }

    const params = {
      dateRange: options.dateRange || '24h',
      format: 'json',
      ...this.buildLocationParams(options.location)
    };

    const response = await this.client.get('/attacks/layer3/top/attacks', {
      params,
      source: 'cloudflare-attacks',
      transform: false
    });

    return this.transformAttackVectors(response);
  }

  /**
   * Start real-time polling for attack and traffic data
   * Polls at configured interval and updates latestData
   *
   * @param {Object} [options={}] - Polling options
   * @param {Function} [options.onUpdate] - Callback for each update
   * @param {Function} [options.onError] - Error callback
   */
  startPolling(options = {}) {
    if (this.pollingActive) {
      console.warn('[CloudflareRadarAPI] Polling already active');
      return;
    }

    if (!this.token) {
      console.error('[CloudflareRadarAPI] Cannot start polling without API token');
      return;
    }

    this.pollingActive = true;
    console.log(`[CloudflareRadarAPI] Starting real-time polling (interval: ${this.pollInterval}ms)`);

    const poll = async () => {
      try {
        // Fetch latest data in parallel
        const [attacks, traffic] = await Promise.allSettled([
          this.getAttackData({ dateRange: '1h' }),
          this.getTrafficData({ dateRange: '1h' })
        ]);

        if (attacks.status === 'fulfilled') {
          this.latestData.attacks = attacks.value;
        }
        if (traffic.status === 'fulfilled') {
          this.latestData.traffic = traffic.value;
        }

        // Notify callback
        if (options.onUpdate) {
          options.onUpdate(this.latestData);
        }

      } catch (error) {
        console.error('[CloudflareRadarAPI] Polling error:', error);
        if (options.onError) {
          options.onError(error);
        }
      }

      // Schedule next poll if still active
      if (this.pollingActive) {
        this.pollingTimer = setTimeout(poll, this.pollInterval);
      }
    };

    // Start first poll immediately
    poll();
  }

  /**
   * Stop real-time polling
   */
  stopPolling() {
    this.pollingActive = false;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
    console.log('[CloudflareRadarAPI] Stopped real-time polling');
  }

  /**
   * Get latest polled data without making new API call
   *
   * @returns {Object} Latest cached data
   */
  getLatestData() {
    return { ...this.latestData };
  }

  /**
   * Build location query parameters
   * @private
   */
  buildLocationParams(location) {
    if (!location) return {};
    return { location };
  }

  /**
   * Build protocol filter parameters
   * @private
   */
  buildProtocolParams(protocols) {
    if (!protocols || !Array.isArray(protocols)) return {};
    return { protocol: protocols.join(',') };
  }

  /**
   * Transform attack data to visualization format
   * @private
   */
  async transformAttackData(rawData) {
    const result = rawData.result || {};
    const timeseries = result.timeseries || [];

    const transformed = timeseries.map(entry => ({
      timestamp: new Date(entry.timestamp).getTime(),
      attacks: {
        total: this.sumAttackValues(entry.values),
        byProtocol: {
          udp: entry.values?.udp || 0,
          tcp: entry.values?.tcp || 0,
          syn: entry.values?.syn || 0,
          icmp: entry.values?.icmp || 0,
          gre: entry.values?.gre || 0
        }
      },
      metadata: {
        source: 'cloudflare-radar',
        confidence: 0.95,
        freshness: 'realtime'
      }
    }));

    return {
      data: transformed,
      metadata: {
        source: 'cloudflare-radar',
        timestamp: Date.now(),
        confidence: 0.95,
        freshness: 'realtime',
        count: transformed.length,
        dateRange: result.meta?.dateRange
      }
    };
  }

  /**
   * Transform traffic data to visualization format
   * @private
   */
  async transformTrafficData(rawData) {
    const result = rawData.result || {};
    const timeseries = result.timeseries || [];

    const transformed = timeseries.map(entry => ({
      timestamp: new Date(entry.timestamp).getTime(),
      traffic: {
        requests: entry.values?.requests || 0,
        bytes: entry.values?.bytes || 0,
        bandwidth: entry.values?.bandwidth || 0
      },
      metadata: {
        source: 'cloudflare-radar',
        confidence: 0.92,
        freshness: 'realtime'
      }
    }));

    return {
      data: transformed,
      metadata: {
        source: 'cloudflare-radar',
        timestamp: Date.now(),
        confidence: 0.92,
        freshness: 'realtime',
        count: transformed.length
      }
    };
  }

  /**
   * Transform BGP data to visualization format
   * @private
   */
  async transformBGPData(rawData) {
    const result = rawData.result || {};
    const routes = result.routes || [];

    const transformed = routes.map(route => ({
      prefix: route.prefix,
      asn: route.origin_asn,
      aspath: route.as_path || [],
      timestamp: new Date(route.seen_at).getTime(),
      metadata: {
        source: 'cloudflare-radar',
        confidence: 0.90,
        freshness: 'realtime'
      }
    }));

    return {
      data: transformed,
      metadata: {
        source: 'cloudflare-radar',
        timestamp: Date.now(),
        confidence: 0.90,
        freshness: 'realtime',
        count: transformed.length
      }
    };
  }

  /**
   * Transform attack vector statistics
   * @private
   */
  transformAttackVectors(rawData) {
    const result = rawData.result || {};
    const top = result.top || [];

    return {
      data: top.map(vector => ({
        type: vector.name,
        count: vector.value,
        percentage: vector.percentage
      })),
      metadata: {
        source: 'cloudflare-radar',
        timestamp: Date.now(),
        confidence: 0.93,
        freshness: 'realtime'
      }
    };
  }

  /**
   * Sum all attack values
   * @private
   */
  sumAttackValues(values) {
    if (!values) return 0;
    return Object.values(values).reduce((sum, val) => sum + (val || 0), 0);
  }

  /**
   * Update rate limit tracking from response headers
   * @private
   */
  updateRateLimit(response) {
    // Cloudflare uses X-RateLimit-* headers
    // This would parse them if available in the response object
    this.rateLimit.remaining = Math.max(0, this.rateLimit.remaining - 1);

    // Reset tracking if window expired
    if (Date.now() >= this.rateLimit.resetAt) {
      this.rateLimit.remaining = this.rateLimit.requests;
      this.rateLimit.resetAt = Date.now() + this.rateLimit.window;
    }
  }

  /**
   * Get rate limit status
   * @returns {Object} Rate limit information
   */
  getRateLimit() {
    return {
      ...this.rateLimit,
      percentRemaining: (this.rateLimit.remaining / this.rateLimit.requests * 100).toFixed(1)
    };
  }

  /**
   * Check if rate limit is approaching threshold
   * @returns {boolean} True if < 20% remaining
   */
  isRateLimitLow() {
    return this.rateLimit.remaining < (this.rateLimit.requests * 0.2);
  }

  /**
   * Get health status
   * @returns {Object} Service health information
   */
  getHealth() {
    return {
      service: 'cloudflare-radar',
      authenticated: !!this.token,
      polling: this.pollingActive,
      pollInterval: this.pollInterval,
      rateLimit: this.getRateLimit(),
      circuitState: this.client.getCircuitState(),
      latestDataAge: {
        attacks: this.latestData.attacks?.metadata?.timestamp
          ? Date.now() - this.latestData.attacks.metadata.timestamp
          : null,
        traffic: this.latestData.traffic?.metadata?.timestamp
          ? Date.now() - this.latestData.traffic.metadata.timestamp
          : null
      }
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopPolling();
    this.latestData = { attacks: null, traffic: null, bgp: null };
  }
}

export default CloudflareRadarAPI;
