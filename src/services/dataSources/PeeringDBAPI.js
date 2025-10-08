/**
 * PeeringDB API Client
 *
 * Data source for Internet Exchange Points (IXPs), data centers, and network interconnections
 * Provides high-quality, real-time infrastructure data
 *
 * @module services/dataSources/PeeringDBAPI
 */

import { APIClient } from '../apiService.js';

/**
 * PeeringDB API Client
 * Fetches and transforms IXP and data center data
 */
export class PeeringDBAPI {
  /**
   * @param {Object} [config={}] - Configuration options
   */
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://api.peeringdb.com/api';
    this.apiKey = config.apiKey || import.meta.env.VITE_PEERINGDB_API_KEY; // Optional, public API available
    this.corsProxy = config.corsProxy || import.meta.env.VITE_CORS_PROXY;

    // Use CORS proxy if configured (for development/testing)
    const effectiveBaseUrl = this.corsProxy
      ? `${this.corsProxy}${encodeURIComponent(this.baseUrl)}`
      : this.baseUrl;

    this.client = new APIClient({
      baseUrl: effectiveBaseUrl,
      timeout: 10000,
      headers: this.apiKey ? { 'Authorization': `Api-Key ${this.apiKey}` } : {},
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
    this.client.registerTransformer('peeringdb-ixp', this.transformIXPData.bind(this));
    this.client.registerTransformer('peeringdb-fac', this.transformFacilityData.bind(this));
    this.client.registerTransformer('peeringdb-net', this.transformNetworkData.bind(this));

    // Rate limiting (100 requests per hour for public API)
    this.rateLimit = {
      requests: 100,
      window: 3600000,
      remaining: 100,
      resetAt: Date.now() + 3600000
    };
  }

  /**
   * Get all Internet Exchange Points
   * @param {Object} [filters={}] - Query filters
   * @returns {Promise<Array>} Array of IXP data
   *
   * @example
   * const peeringdb = new PeeringDBAPI();
   * const ixps = await peeringdb.getIXPs({ country: 'US' });
   */
  async getIXPs(filters = {}) {
    try {
      const params = {
        depth: 2, // Include related objects
        ...this.buildFilters(filters)
      };

      const response = await this.client.get('/ix', {
        params,
        source: 'peeringdb-ixp',
        transform: true
      });

      this.updateRateLimit(response);
      return response.data;
    } catch (error) {
      console.error('[PeeringDBAPI] Failed to fetch IXPs:', error);
      throw error;
    }
  }

  /**
   * Get specific IXP by ID
   * @param {number} ixpId - IXP identifier
   * @returns {Promise<Object>} IXP data
   */
  async getIXP(ixpId) {
    const response = await this.client.get(`/ix/${ixpId}`, {
      params: { depth: 2 },
      source: 'peeringdb-ixp',
      transform: true
    });

    return response.data[0];
  }

  /**
   * Get data centers (facilities)
   * @param {Object} [filters={}] - Query filters
   * @returns {Promise<Array>} Array of facility data
   */
  async getFacilities(filters = {}) {
    try {
      const params = {
        depth: 2,
        ...this.buildFilters(filters)
      };

      const response = await this.client.get('/fac', {
        params,
        source: 'peeringdb-fac',
        transform: true
      });

      this.updateRateLimit(response);
      return response.data;
    } catch (error) {
      console.error('[PeeringDBAPI] Failed to fetch facilities:', error);
      throw error;
    }
  }

  /**
   * Get specific facility by ID
   * @param {number} facId - Facility identifier
   * @returns {Promise<Object>} Facility data
   */
  async getFacility(facId) {
    const response = await this.client.get(`/fac/${facId}`, {
      params: { depth: 2 },
      source: 'peeringdb-fac',
      transform: true
    });

    return response.data[0];
  }

  /**
   * Get networks
   * @param {Object} [filters={}] - Query filters
   * @returns {Promise<Array>} Array of network data
   */
  async getNetworks(filters = {}) {
    try {
      const params = this.buildFilters(filters);

      const response = await this.client.get('/net', {
        params,
        source: 'peeringdb-net',
        transform: true
      });

      this.updateRateLimit(response);
      return response.data;
    } catch (error) {
      console.error('[PeeringDBAPI] Failed to fetch networks:', error);
      throw error;
    }
  }

  /**
   * Get networks at specific IXP
   * @param {number} ixpId - IXP identifier
   * @returns {Promise<Array>} Networks at IXP
   */
  async getIXPNetworks(ixpId) {
    const response = await this.client.get('/netixlan', {
      params: { ix_id: ixpId },
      source: 'peeringdb-net',
      transform: false
    });

    return response.data || [];
  }

  /**
   * Build query filters
   * @private
   * @param {Object} filters - Filter object
   * @returns {Object} API query parameters
   */
  buildFilters(filters) {
    const params = {};

    if (filters.country) params.country = filters.country;
    if (filters.city) params.city = filters.city;
    if (filters.asn) params.asn = filters.asn;
    if (filters.name) params.name__contains = filters.name;

    return params;
  }

  /**
   * Transform IXP data to visualization format
   * @private
   * @param {Object} rawData - Raw API response
   * @returns {Object} Transformed data
   */
  async transformIXPData(rawData) {
    const ixps = rawData.data || [];

    const transformed = ixps.map(ixp => ({
      id: `ixp-${ixp.id}`,
      type: 'ixp',
      name: ixp.name,
      nameShort: ixp.name_long || ixp.name,

      // Location
      location: {
        lat: parseFloat(ixp.latitude) || 0,
        lng: parseFloat(ixp.longitude) || 0,
        city: ixp.city,
        country: ixp.country
      },

      // Network information
      networks: {
        count: ixp.net_count || 0,
        list: ixp.netixlan_set || []
      },

      // Technical details
      specs: {
        media: ixp.media || 'Ethernet',
        speed: ixp.traffic_speed || 'Unknown',
        website: ixp.website,
        techEmail: ixp.tech_email,
        policyEmail: ixp.policy_email
      },

      // Visual properties
      visual: {
        size: this.calculateIXPSize(ixp.net_count || 0),
        importance: this.calculateImportance(ixp),
        color: this.getCountryColor(ixp.country),
        glow: (ixp.net_count || 0) > 100
      },

      // Data quality
      metadata: {
        source: 'peeringdb',
        confidence: 0.98, // PeeringDB is highly reliable
        freshness: 'realtime',
        lastUpdated: new Date(ixp.updated).getTime(),
        created: new Date(ixp.created).getTime(),
        dataQuality: this.assessIXPQuality(ixp)
      }
    }));

    return {
      data: transformed,
      metadata: {
        source: 'peeringdb',
        timestamp: Date.now(),
        confidence: 0.98,
        freshness: 'realtime',
        count: transformed.length
      }
    };
  }

  /**
   * Transform facility data to visualization format
   * @private
   * @param {Object} rawData - Raw API response
   * @returns {Object} Transformed data
   */
  async transformFacilityData(rawData) {
    const facilities = rawData.data || [];

    const transformed = facilities.map(fac => ({
      id: `facility-${fac.id}`,
      type: 'datacenter',
      name: fac.name,

      // Location
      location: {
        lat: parseFloat(fac.latitude) || 0,
        lng: parseFloat(fac.longitude) || 0,
        address: fac.address1,
        city: fac.city,
        state: fac.state,
        country: fac.country,
        zipcode: fac.zipcode
      },

      // Network information
      networks: {
        count: fac.net_count || 0
      },

      // Facility details
      specs: {
        website: fac.website,
        clli: fac.clli, // Common Language Location Identifier
        npanxx: fac.npanxx,
        availableSpace: fac.available_voltage_services,
        sales: {
          email: fac.sales_email,
          phone: fac.sales_phone
        },
        tech: {
          email: fac.tech_email,
          phone: fac.tech_phone
        }
      },

      // Visual properties
      visual: {
        size: this.calculateFacilitySize(fac.net_count || 0),
        importance: fac.net_count || 0,
        icon: 'datacenter'
      },

      // Data quality
      metadata: {
        source: 'peeringdb',
        confidence: 0.95,
        freshness: 'realtime',
        lastUpdated: new Date(fac.updated).getTime(),
        created: new Date(fac.created).getTime(),
        dataQuality: this.assessFacilityQuality(fac)
      }
    }));

    return {
      data: transformed,
      metadata: {
        source: 'peeringdb',
        timestamp: Date.now(),
        confidence: 0.95,
        freshness: 'realtime',
        count: transformed.length
      }
    };
  }

  /**
   * Transform network data
   * @private
   * @param {Object} rawData - Raw API response
   * @returns {Object} Transformed data
   */
  async transformNetworkData(rawData) {
    const networks = rawData.data || [];

    const transformed = networks.map(net => ({
      id: `network-${net.id}`,
      type: 'network',
      name: net.name,
      asn: net.asn,

      info: {
        website: net.website,
        policyUrl: net.policy_url,
        policyGeneral: net.policy_general,
        policyRatio: net.policy_ratio,
        policyContracts: net.policy_contracts
      },

      metadata: {
        source: 'peeringdb',
        confidence: 0.98,
        freshness: 'realtime',
        lastUpdated: new Date(net.updated).getTime()
      }
    }));

    return {
      data: transformed,
      metadata: {
        source: 'peeringdb',
        timestamp: Date.now(),
        count: transformed.length
      }
    };
  }

  /**
   * Calculate IXP visual size based on network count
   * @private
   * @param {number} networkCount - Number of networks
   * @returns {number} Visual size (1-5)
   */
  calculateIXPSize(networkCount) {
    // Logarithmic scale: 1-10 networks = size 1, 100+ = size 3+
    if (networkCount < 10) return 1;
    if (networkCount < 50) return 2;
    if (networkCount < 100) return 3;
    if (networkCount < 200) return 4;
    return 5;
  }

  /**
   * Calculate facility visual size
   * @private
   * @param {number} networkCount - Number of networks
   * @returns {number} Visual size
   */
  calculateFacilitySize(networkCount) {
    return Math.min(1 + Math.log10(Math.max(networkCount, 1)), 4);
  }

  /**
   * Calculate importance score for IXP
   * @private
   * @param {Object} ixp - IXP data
   * @returns {number} Importance score (0-100)
   */
  calculateImportance(ixp) {
    let score = 0;

    // Network count is primary factor
    score += Math.min((ixp.net_count || 0) / 10, 50);

    // Major cities get bonus
    const majorCities = ['London', 'Frankfurt', 'Amsterdam', 'New York', 'Tokyo', 'Singapore'];
    if (majorCities.includes(ixp.city)) {
      score += 20;
    }

    // Activity bonus
    const daysSinceUpdate = (Date.now() - new Date(ixp.updated).getTime()) / 86400000;
    if (daysSinceUpdate < 30) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Get color based on country
   * @private
   * @param {string} country - Country code
   * @returns {string} Hex color
   */
  getCountryColor(country) {
    const colors = {
      'US': '#3b82f6',
      'GB': '#ef4444',
      'DE': '#f59e0b',
      'NL': '#10b981',
      'JP': '#8b5cf6',
      'SG': '#ec4899'
    };

    return colors[country] || '#6b7280';
  }

  /**
   * Assess IXP data quality
   * @private
   * @param {Object} ixp - IXP data
   * @returns {number} Quality score 0-1
   */
  assessIXPQuality(ixp) {
    let score = 0;
    let factors = 0;

    if (ixp.latitude && ixp.longitude) { score += 1; } factors++;
    if (ixp.website) { score += 1; } factors++;
    if (ixp.tech_email) { score += 1; } factors++;
    if (ixp.net_count > 0) { score += 1; } factors++;

    return score / factors;
  }

  /**
   * Assess facility data quality
   * @private
   * @param {Object} fac - Facility data
   * @returns {number} Quality score 0-1
   */
  assessFacilityQuality(fac) {
    let score = 0;
    let factors = 0;

    if (fac.latitude && fac.longitude) { score += 1; } factors++;
    if (fac.address1) { score += 1; } factors++;
    if (fac.website) { score += 1; } factors++;
    if (fac.sales_email || fac.tech_email) { score += 1; } factors++;

    return score / factors;
  }

  /**
   * Update rate limit tracking
   * @private
   * @param {Object} response - API response
   */
  updateRateLimit(response) {
    // PeeringDB includes rate limit headers
    // This would parse X-RateLimit-* headers if available
    this.rateLimit.remaining = Math.max(0, this.rateLimit.remaining - 1);
  }

  /**
   * Get rate limit status
   * @returns {Object} Rate limit info
   */
  getRateLimit() {
    return { ...this.rateLimit };
  }

  /**
   * Get health status
   * @returns {Object} Health information
   */
  getHealth() {
    return {
      service: 'peeringdb',
      rateLimit: this.getRateLimit(),
      circuitState: this.client.getCircuitState()
    };
  }
}

export default PeeringDBAPI;
