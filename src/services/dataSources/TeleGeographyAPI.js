/**
 * TeleGeography Submarine Cable Map API
 *
 * Data source for submarine cable infrastructure
 * Provides cable locations, specifications, and landing points
 *
 * @module services/dataSources/TeleGeographyAPI
 */

import { APIClient } from '../apiService.js';

/**
 * TeleGeography API Client
 * Fetches and transforms submarine cable data
 */
export class TeleGeographyAPI {
  /**
   * @param {Object} [config={}] - Configuration options
   */
  constructor(config = {}) {
    this.dataUrl = config.dataUrl || 'https://github.com/telegeography/www.submarinecablemap.com/raw/master/web/public/api/v3/cable/cable.json';
    this.updateFrequency = config.updateFrequency || 2592000000; // 30 days
    this.lastUpdate = null;
    this.corsProxy = config.corsProxy || import.meta.env.VITE_CORS_PROXY;

    // Use CORS proxy if configured
    const effectiveUrl = this.corsProxy
      ? `${this.corsProxy}${encodeURIComponent(this.dataUrl)}`
      : this.dataUrl;

    this.client = new APIClient({
      baseUrl: effectiveUrl,
      timeout: 15000,
      circuitBreaker: {
        failureThreshold: 3,
        timeout: 120000
      },
      retry: {
        maxAttempts: 3,
        baseDelay: 2000
      }
    });

    // Register transformer
    this.client.registerTransformer('telegeography', this.transformCableData.bind(this));
  }

  /**
   * Fetch all submarine cables
   * @param {Object} [options={}] - Fetch options
   * @returns {Promise<Array>} Array of enriched cable data
   *
   * @example
   * const telegeography = new TeleGeographyAPI();
   * const cables = await telegeography.getCables();
   */
  async getCables(options = {}) {
    try {
      const response = await this.client.get('', {
        source: 'telegeography',
        transform: true,
        ...options
      });

      this.lastUpdate = Date.now();
      return response.data;
    } catch (error) {
      console.error('[TeleGeographyAPI] Failed to fetch cables:', error);
      throw error;
    }
  }

  /**
   * Get specific cable by ID
   * @param {string} cableId - Cable identifier
   * @returns {Promise<Object>} Cable data
   */
  async getCable(cableId) {
    const cables = await this.getCables();
    return cables.find(cable => cable.cable_id === cableId);
  }

  /**
   * Get cables by region
   * @param {string} region - Region name (e.g., 'Atlantic', 'Pacific')
   * @returns {Promise<Array>} Filtered cables
   */
  async getCablesByRegion(region) {
    const cables = await this.getCables();
    return cables.filter(cable =>
      cable.name.toLowerCase().includes(region.toLowerCase()) ||
      cable.landing_points?.some(lp => lp.name.toLowerCase().includes(region.toLowerCase()))
    );
  }

  /**
   * Transform raw cable data to visualization format
   * @private
   * @param {Object} rawData - Raw API response
   * @returns {Object} Transformed data
   */
  async transformCableData(rawData) {
    const cables = Array.isArray(rawData) ? rawData : rawData.features || [];

    const transformed = cables.map(cable => {
      return {
        id: `cable-${cable.cable_id || cable.id}`,
        type: 'submarine-cable',
        name: cable.name,
        owner: cable.owners || cable.owner,

        // Geographic data
        landingPoints: this.extractLandingPoints(cable),
        coordinates: cable.coordinates || this.estimateCablePath(cable),

        // Technical specifications
        specs: {
          length: cable.length,
          readyForService: cable.ready_for_service || cable.rfs,
          capacity: this.parseCableCapacity(cable.design_capacity),
          fiberPairs: cable.fiber_pairs,
          url: cable.url
        },

        // Derived metrics
        derived: {
          estimatedLatency: this.calculateLatency(cable.length, cable.cable_type),
          estimatedUtilization: 0.65, // Default estimate
          ageYears: new Date().getFullYear() - (cable.ready_for_service || new Date().getFullYear()),
          status: this.determineStatus(cable)
        },

        // Data quality metadata
        metadata: {
          source: 'telegeography',
          confidence: cable.coordinates ? 0.9 : 0.6,
          freshness: 'static',
          lastUpdated: cable.updated_at || Date.now(),
          dataQuality: this.assessDataQuality(cable)
        }
      };
    });

    return {
      data: transformed,
      metadata: {
        source: 'telegeography',
        timestamp: Date.now(),
        confidence: 0.85,
        freshness: 'static',
        count: transformed.length
      }
    };
  }

  /**
   * Extract and normalize landing points
   * @private
   * @param {Object} cable - Raw cable data
   * @returns {Array} Landing points with coordinates
   */
  extractLandingPoints(cable) {
    const landingPoints = cable.landing_points || [];

    return landingPoints.map(lp => ({
      id: lp.id,
      name: lp.name,
      location: {
        lat: lp.latitude,
        lng: lp.longitude
      },
      country: lp.country,
      city: lp.city
    }));
  }

  /**
   * Estimate cable path using great circle route
   * @private
   * @param {Object} cable - Cable data
   * @returns {Array} Array of [lng, lat] coordinates
   */
  estimateCablePath(cable) {
    if (!cable.landing_points || cable.landing_points.length < 2) {
      return [];
    }

    const start = cable.landing_points[0];
    const end = cable.landing_points[cable.landing_points.length - 1];

    // Simple great circle approximation (can be enhanced with proper geospatial library)
    const steps = 100;
    const path = [];

    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const lat = start.latitude + (end.latitude - start.latitude) * fraction;
      const lng = start.longitude + (end.longitude - start.longitude) * fraction;
      path.push([lng, lat]);
    }

    return path;
  }

  /**
   * Parse cable capacity string to numeric value
   * @private
   * @param {string} capacity - Capacity string (e.g., "60 Tbps")
   * @returns {number} Capacity in Gbps
   */
  parseCableCapacity(capacity) {
    if (!capacity) return 0;

    const match = capacity.match(/([\d.]+)\s*(Tbps|Gbps)/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    return unit === 'tbps' ? value * 1000 : value;
  }

  /**
   * Calculate estimated latency based on cable length
   * @private
   * @param {number} lengthKm - Cable length in kilometers
   * @param {string} cableType - Type of cable
   * @returns {number} Latency in milliseconds
   */
  calculateLatency(lengthKm, cableType = 'SMF') {
    if (!lengthKm) return 0;

    // Speed of light in fiber: ~200,000 km/s
    // Single-mode fiber (SMF) is typically 67% of c
    // Multi-mode fiber (MMF) is typically 64% of c
    const speedFactor = cableType === 'SMF' ? 0.67 : 0.64;
    const propagationDelay = lengthKm / (300000 * speedFactor);

    // Add equipment delays (repeaters every ~100km)
    const repeaters = Math.floor(lengthKm / 100);
    const equipmentDelay = repeaters * 0.1; // 0.1ms per repeater

    return propagationDelay + equipmentDelay;
  }

  /**
   * Determine cable operational status
   * @private
   * @param {Object} cable - Cable data
   * @returns {string} Status
   */
  determineStatus(cable) {
    const rfs = cable.ready_for_service;
    if (!rfs) return 'unknown';

    const year = parseInt(rfs);
    const currentYear = new Date().getFullYear();

    if (year > currentYear) return 'planned';
    if (year === currentYear) return 'launching';
    if (currentYear - year > 20) return 'aging';

    return 'operational';
  }

  /**
   * Assess data quality score
   * @private
   * @param {Object} cable - Cable data
   * @returns {number} Quality score 0-1
   */
  assessDataQuality(cable) {
    let score = 0;
    let factors = 0;

    // Has coordinates
    if (cable.coordinates && cable.coordinates.length > 0) {
      score += 1;
    }
    factors++;

    // Has landing points
    if (cable.landing_points && cable.landing_points.length >= 2) {
      score += 1;
    }
    factors++;

    // Has capacity info
    if (cable.design_capacity) {
      score += 1;
    }
    factors++;

    // Has owner info
    if (cable.owners || cable.owner) {
      score += 1;
    }
    factors++;

    // Has RFS date
    if (cable.ready_for_service) {
      score += 1;
    }
    factors++;

    return score / factors;
  }

  /**
   * Check if update is needed
   * @returns {boolean} True if data should be updated
   */
  needsUpdate() {
    if (!this.lastUpdate) return true;
    return Date.now() - this.lastUpdate > this.updateFrequency;
  }

  /**
   * Get health status
   * @returns {Object} Health information
   */
  getHealth() {
    return {
      service: 'telegeography',
      lastUpdate: this.lastUpdate,
      nextUpdate: this.lastUpdate ? this.lastUpdate + this.updateFrequency : null,
      needsUpdate: this.needsUpdate(),
      circuitState: this.client.getCircuitState()
    };
  }
}

export default TeleGeographyAPI;
