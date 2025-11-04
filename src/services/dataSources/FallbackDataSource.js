/**
 * Fallback Data Source
 *
 * Provides estimated and synthetic data when live APIs are unavailable
 * Implements graceful degradation strategy
 *
 * @module services/dataSources/FallbackDataSource
 */

import { DataManager } from '../../dataManager.js';

/**
 * Fallback Data Source
 * Generates estimated data and provides static fallback datasets
 */
export class FallbackDataSource {
  constructor() {
    this.dataManager = new DataManager();
    this.staticData = this.loadStaticData();
    this.estimationModels = this.initializeEstimationModels();
  }

  /**
   * Get fallback data for cables
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array>} Estimated cable data
   *
   * @example
   * const fallback = new FallbackDataSource();
   * const cables = await fallback.getCables();
   */
  async getCables(options = {}) {
    const staticCables = this.staticData.cables || [];

    return staticCables.map(cable => ({
      ...cable,
      metadata: {
        source: 'fallback',
        confidence: 0.5,
        freshness: 'static',
        lastUpdated: Date.now(),
        estimated: true
      }
    }));
  }

  /**
   * Get fallback data for IXPs
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array>} Estimated IXP data
   */
  async getIXPs(options = {}) {
    const staticIXPs = this.staticData.ixps || [];

    return staticIXPs.map(ixp => ({
      ...ixp,
      metadata: {
        source: 'fallback',
        confidence: 0.5,
        freshness: 'static',
        lastUpdated: Date.now(),
        estimated: true
      }
    }));
  }

  /**
   * Get fallback data for data centers
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array>} Estimated datacenter data
   */
  async getDataCenters(options = {}) {
    const staticFacilities = this.staticData.datacenters || [];

    return staticFacilities.map(dc => ({
      ...dc,
      metadata: {
        source: 'fallback',
        confidence: 0.5,
        freshness: 'static',
        lastUpdated: Date.now(),
        estimated: true
      }
    }));
  }

  /**
   * Estimate cable data based on landing points
   * @param {Object} params - Cable parameters
   * @returns {Promise<Object>} Estimated cable
   */
  async estimateCable(params) {
    const { start, end, name } = params;

    return {
      id: `cable-estimated-${Date.now()}`,
      type: 'submarine-cable',
      name: name || `Estimated Cable ${start.city} - ${end.city}`,
      owner: 'Unknown',

      landingPoints: [start, end],
      coordinates: this.estimateCablePath(start, end),

      specs: {
        length: this.calculateDistance(start.location, end.location),
        readyForService: null,
        capacity: this.estimateCapacity(start.location, end.location),
        fiberPairs: null
      },

      derived: {
        estimatedLatency: this.estimateLatency(start.location, end.location),
        estimatedUtilization: 0.6,
        ageYears: null,
        status: 'estimated'
      },

      metadata: {
        source: 'estimated',
        confidence: 0.3,
        freshness: 'estimated',
        lastUpdated: Date.now(),
        estimated: true,
        estimationMethod: 'geographic-inference'
      }
    };
  }

  /**
   * Estimate route between two points
   * @param {Object} source - Source location
   * @param {Object} destination - Destination location
   * @returns {Promise<Object>} Estimated route
   */
  async estimateRoute(source, destination) {
    const distance = this.calculateDistance(source, destination);
    const hopCount = Math.ceil(distance / 500); // Estimate hop every 500km

    return {
      id: `route-estimated-${Date.now()}`,
      type: 'route',
      source,
      destination,

      path: {
        hops: this.generateHops(source, destination, hopCount),
        distance,
        estimatedLatency: this.estimateLatency(source, destination)
      },

      metadata: {
        source: 'estimated',
        confidence: 0.4,
        freshness: 'estimated',
        lastUpdated: Date.now(),
        estimated: true
      }
    };
  }

  /**
   * Estimate metric value based on historical patterns
   * @param {string} metricType - Type of metric
   * @param {Object} context - Context for estimation
   * @returns {Promise<number>} Estimated value
   */
  async estimateMetric(metricType, context = {}) {
    const model = this.estimationModels[metricType];

    if (!model) {
      throw new Error(`No estimation model for metric type: ${metricType}`);
    }

    const baseValue = model.baseline;
    const variance = model.variance || 0.1;

    // Add random variance
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    const estimatedValue = baseValue * randomFactor;

    return {
      value: estimatedValue,
      unit: model.unit,
      metadata: {
        source: 'estimated',
        confidence: 0.4,
        estimationMethod: 'statistical-baseline',
        variance: variance * 100 + '%'
      }
    };
  }

  /**
   * Load static fallback data
   * @private
   * @returns {Object} Static datasets
   */
  loadStaticData() {
    return {
      cables: this.generateStaticCables(),
      ixps: this.generateStaticIXPs(),
      datacenters: this.generateStaticDataCenters()
    };
  }

  /**
   * Generate static cable dataset
   * Uses comprehensive 552-cable dataset from DataManager
   * @private
   * @returns {Array} Static cables (552 cables: 62 major + 490 estimated)
   */
  generateStaticCables() {
    // Get the comprehensive cable dataset from DataManager
    const cableData = this.dataManager.generateSubmarineCables();

    return cableData.map((cable, index) => ({
      id: `cable-${index}`,
      type: 'submarine-cable',
      name: cable.name,
      owner: cable.owner || 'Unknown Operator',
      status: cable.status || 'active',

      // Format matching main-integrated.js expectations
      landing_point_1: {
        location: cable.landing_point_1.location,
        latitude: cable.landing_point_1.latitude,
        longitude: cable.landing_point_1.longitude
      },
      landing_point_2: {
        location: cable.landing_point_2.location,
        latitude: cable.landing_point_2.latitude,
        longitude: cable.landing_point_2.longitude
      },

      // Legacy format for compatibility
      landingPoints: [
        {
          name: cable.landing_point_1.location,
          location: { lat: cable.landing_point_1.latitude, lng: cable.landing_point_1.longitude }
        },
        {
          name: cable.landing_point_2.location,
          location: { lat: cable.landing_point_2.latitude, lng: cable.landing_point_2.longitude }
        }
      ],

      coordinates: this.estimateCablePath(
        { location: { lat: cable.landing_point_1.latitude, lng: cable.landing_point_1.longitude } },
        { location: { lat: cable.landing_point_2.latitude, lng: cable.landing_point_2.longitude } }
      ),

      length_km: this.calculateDistance(
        { lat: cable.landing_point_1.latitude, lng: cable.landing_point_1.longitude },
        { lat: cable.landing_point_2.latitude, lng: cable.landing_point_2.longitude }
      ),
      capacity_tbps: cable.capacity_tbps || 60,

      specs: {
        length: this.calculateDistance(
          { lat: cable.landing_point_1.latitude, lng: cable.landing_point_1.longitude },
          { lat: cable.landing_point_2.latitude, lng: cable.landing_point_2.longitude }
        ),
        capacity: (cable.capacity_tbps || 60) * 1000 // Convert Tbps to Gbps
      },

      year: cable.year || null,
      data_accuracy: cable.data_accuracy || 'estimated'
    }));
  }

  /**
   * Generate static IXP dataset
   * @private
   * @returns {Array} Static IXPs
   */
  generateStaticIXPs() {
    const majorIXPs = [
      { name: 'DE-CIX Frankfurt', city: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821, networks: 1000 },
      { name: 'AMS-IX', city: 'Amsterdam', country: 'NL', lat: 52.3676, lng: 4.9041, networks: 900 },
      { name: 'LINX', city: 'London', country: 'GB', lat: 51.5074, lng: -0.1278, networks: 800 }
    ];

    return majorIXPs.map((ixp, index) => ({
      id: `ixp-static-${index}`,
      type: 'ixp',
      name: ixp.name,
      location: {
        lat: ixp.lat,
        lng: ixp.lng,
        city: ixp.city,
        country: ixp.country
      },
      networks: {
        count: ixp.networks
      }
    }));
  }

  /**
   * Generate static datacenter dataset
   * @private
   * @returns {Array} Static datacenters
   */
  generateStaticDataCenters() {
    const majorDatacenters = [
      { name: 'Equinix NY', city: 'New York', country: 'US', lat: 40.7128, lng: -74.0060 },
      { name: 'Equinix LD', city: 'London', country: 'GB', lat: 51.5074, lng: -0.1278 },
      { name: 'Equinix SG', city: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198 }
    ];

    return majorDatacenters.map((dc, index) => ({
      id: `dc-static-${index}`,
      type: 'datacenter',
      name: dc.name,
      location: {
        lat: dc.lat,
        lng: dc.lng,
        city: dc.city,
        country: dc.country
      }
    }));
  }

  /**
   * Initialize estimation models
   * @private
   * @returns {Object} Estimation models
   */
  initializeEstimationModels() {
    return {
      'latency': {
        baseline: 50, // ms
        variance: 0.3,
        unit: 'ms'
      },
      'throughput': {
        baseline: 10000, // Mbps
        variance: 0.5,
        unit: 'Mbps'
      },
      'packet-loss': {
        baseline: 0.01, // 1%
        variance: 0.5,
        unit: '%'
      },
      'utilization': {
        baseline: 0.65, // 65%
        variance: 0.2,
        unit: 'ratio'
      }
    };
  }

  /**
   * Calculate great circle distance between two points
   * @private
   * @param {Object} point1 - { lat, lng }
   * @param {Object} point2 - { lat, lng }
   * @returns {number} Distance in kilometers
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Estimate cable path between two points
   * @private
   * @param {Object} start - Start point with location
   * @param {Object} end - End point with location
   * @returns {Array} Array of [lng, lat] coordinates
   */
  estimateCablePath(start, end) {
    const steps = 50;
    const path = [];

    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const lat = start.location.lat + (end.location.lat - start.location.lat) * fraction;
      const lng = start.location.lng + (end.location.lng - start.location.lng) * fraction;
      path.push([lng, lat]);
    }

    return path;
  }

  /**
   * Estimate latency based on distance
   * @private
   * @param {Object} point1 - Point 1
   * @param {Object} point2 - Point 2
   * @returns {number} Latency in ms
   */
  estimateLatency(point1, point2) {
    const distance = this.calculateDistance(point1, point2);
    // Speed of light in fiber: ~200,000 km/s
    const propagationDelay = (distance / 200000) * 1000; // Convert to ms
    const equipmentDelay = 5; // Base equipment delay

    return propagationDelay + equipmentDelay;
  }

  /**
   * Estimate cable capacity based on route
   * @private
   * @param {Object} point1 - Point 1
   * @param {Object} point2 - Point 2
   * @returns {number} Capacity in Gbps
   */
  estimateCapacity(point1, point2) {
    const distance = this.calculateDistance(point1, point2);

    // Trans-oceanic cables typically have higher capacity
    if (distance > 5000) {
      return 60000; // 60 Tbps
    } else if (distance > 2000) {
      return 40000; // 40 Tbps
    } else {
      return 20000; // 20 Tbps
    }
  }

  /**
   * Generate intermediate hops for route
   * @private
   * @param {Object} source - Source location
   * @param {Object} destination - Destination location
   * @param {number} hopCount - Number of hops
   * @returns {Array} Array of hop locations
   */
  generateHops(source, destination, hopCount) {
    const hops = [];

    for (let i = 1; i <= hopCount; i++) {
      const fraction = i / (hopCount + 1);
      hops.push({
        lat: source.lat + (destination.lat - source.lat) * fraction,
        lng: source.lng + (destination.lng - source.lng) * fraction,
        estimated: true
      });
    }

    return hops;
  }

  /**
   * Get health status
   * @returns {Object} Health information
   */
  getHealth() {
    return {
      service: 'fallback',
      status: 'always-available',
      staticDatasets: {
        cables: this.staticData.cables?.length || 0,
        ixps: this.staticData.ixps?.length || 0,
        datacenters: this.staticData.datacenters?.length || 0
      },
      estimationModels: Object.keys(this.estimationModels).length,
      dataSource: 'comprehensive-dataset-from-datamanager'
    };
  }
}

export default FallbackDataSource;
