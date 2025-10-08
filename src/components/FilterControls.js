/**
 * FilterControls - Advanced filtering system for submarine cables and data centers
 *
 * Features:
 * - Accuracy filtering (live vs estimated data)
 * - Regional filtering (7 geographic regions)
 * - Capacity filtering (high/medium/low)
 * - Major cables only toggle
 * - Data center tier filtering
 */

export class FilterControls {
  /**
   * @param {Function} onFilterChange - Callback when filters change
   */
  constructor(onFilterChange) {
    this.onFilterChange = onFilterChange;
    this.filters = {
      accuracy: 'all',
      region: 'all',
      capacity: 'all',
      majorOnly: false,
      datacenterTier: 'all'
    };

    this.regions = {
      transatlantic: 'Transatlantic',
      transpacific: 'Transpacific',
      'europe-asia': 'Europe-Asia',
      'americas-internal': 'Americas Internal',
      'europe-internal': 'Europe Internal',
      'asia-internal': 'Asia Internal',
      'africa-connected': 'Africa Connected'
    };
  }

  /**
   * Initialize filter controls with event listeners
   */
  init() {
    // Accuracy filter
    const accuracyFilter = document.getElementById('cable-filter');
    accuracyFilter?.addEventListener('change', (e) => {
      this.filters.accuracy = e.target.value;
      this.onFilterChange(this.filters);
    });

    // Region filter
    const regionFilter = document.getElementById('region-filter');
    regionFilter?.addEventListener('change', (e) => {
      this.filters.region = e.target.value;
      this.onFilterChange(this.filters);
    });

    // Capacity filter
    const capacityFilter = document.getElementById('capacity-filter');
    capacityFilter?.addEventListener('change', (e) => {
      this.filters.capacity = e.target.value;
      this.onFilterChange(this.filters);
    });

    // Major only toggle
    const majorOnlyToggle = document.getElementById('show-major-only');
    majorOnlyToggle?.addEventListener('change', (e) => {
      this.filters.majorOnly = e.target.checked;
      this.onFilterChange(this.filters);
    });

    // Datacenter tier filter
    const datacenterFilter = document.getElementById('datacenter-filter');
    datacenterFilter?.addEventListener('change', (e) => {
      this.filters.datacenterTier = e.target.value;
      this.onFilterChange(this.filters);
    });
  }

  /**
   * Apply all filters to cable dataset
   * @param {Array} cables - Array of cable objects
   * @returns {Array} Filtered cables
   */
  applyFilters(cables) {
    let filtered = [...cables];

    // Major cables only
    if (this.filters.majorOnly) {
      filtered = this.filterMajorCables(filtered);
    }

    // Accuracy filter
    if (this.filters.accuracy !== 'all') {
      filtered = this.filterByAccuracy(filtered, this.filters.accuracy);
    }

    // Region filter
    if (this.filters.region !== 'all') {
      filtered = this.filterByRegion(filtered, this.filters.region);
    }

    // Capacity filter
    if (this.filters.capacity !== 'all') {
      filtered = this.filterByCapacity(filtered, this.filters.capacity);
    }

    return filtered;
  }

  /**
   * Filter for major cables only
   * @param {Array} cables
   * @returns {Array}
   */
  filterMajorCables(cables) {
    return cables.filter(cable =>
      cable.capacity_tbps > 100 ||
      cable.name?.includes('MAREA') ||
      cable.name?.includes('Grace') ||
      cable.name?.includes('2Africa') ||
      cable.name?.includes('Dunant') ||
      cable.name?.includes('FASTER')
    );
  }

  /**
   * Filter cables by data accuracy
   * @param {Array} cables
   * @param {string} accuracy - 'live' or 'estimated'
   * @returns {Array}
   */
  filterByAccuracy(cables, accuracy) {
    if (accuracy === 'live') {
      return cables.filter(cable => cable.data_accuracy === 'live');
    } else if (accuracy === 'estimated') {
      return cables.filter(cable => cable.data_accuracy !== 'live');
    }
    return cables;
  }

  /**
   * Filter cables by geographic region
   * @param {Array} cables
   * @param {string} region
   * @returns {Array}
   */
  filterByRegion(cables, region) {
    return cables.filter(cable => {
      const lng1 = cable.landing_point_1.longitude;
      const lng2 = cable.landing_point_2.longitude;
      const lat1 = cable.landing_point_1.latitude;
      const lat2 = cable.landing_point_2.latitude;
      const avgLng = (lng1 + lng2) / 2;
      const avgLat = (lat1 + lat2) / 2;

      const distance = this.calculateDistance(lat1, lng1, lat2, lng2);

      switch(region) {
        case 'transatlantic':
          // Americas to Europe/Africa
          return ((lng1 < -40 && lng2 > -20 && lng2 < 30) ||
                  (lng2 < -40 && lng1 > -20 && lng1 < 30)) &&
                 distance > 2000;

        case 'transpacific':
          // Crosses the Pacific Ocean
          return (Math.abs(lng1 - lng2) > 120) &&
                 ((lng1 > 100 || lng1 < -100) || (lng2 > 100 || lng2 < -100)) &&
                 distance > 3000;

        case 'europe-asia':
          // Europe to Asia
          return ((lng1 > -10 && lng1 < 50 && lng2 > 50) ||
                  (lng2 > -10 && lng2 < 50 && lng1 > 50)) &&
                 distance > 1000;

        case 'americas-internal':
          // Within the Americas
          return lng1 < -30 && lng2 < -30 && distance < 8000;

        case 'europe-internal':
          // Within Europe
          return lng1 > -15 && lng1 < 50 && lng2 > -15 && lng2 < 50 &&
                 lat1 > 35 && lat2 > 35 && distance < 4000;

        case 'asia-internal':
          // Within Asia-Pacific
          return lng1 > 60 && lng2 > 60 && distance < 6000;

        case 'africa-connected':
          // Connecting to/from Africa
          const loc1 = cable.landing_point_1.location || '';
          const loc2 = cable.landing_point_2.location || '';
          return loc1.includes('Africa') || loc2.includes('Africa') ||
                 (avgLng > -20 && avgLng < 55 && avgLat < 35 && avgLat > -35);

        default:
          return true;
      }
    });
  }

  /**
   * Filter cables by capacity tier
   * @param {Array} cables
   * @param {string} capacity - 'high', 'medium', or 'low'
   * @returns {Array}
   */
  filterByCapacity(cables, capacity) {
    return cables.filter(cable => {
      const cap = cable.capacity_tbps || 0;

      switch(capacity) {
        case 'high':
          return cap > 150;
        case 'medium':
          return cap >= 50 && cap <= 150;
        case 'low':
          return cap < 50;
        default:
          return true;
      }
    });
  }

  /**
   * Calculate great circle distance between two points
   * @param {number} lat1
   * @param {number} lon1
   * @param {number} lat2
   * @param {number} lon2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get current filter state
   * @returns {Object}
   */
  getFilters() {
    return { ...this.filters };
  }

  /**
   * Reset all filters to default
   */
  resetFilters() {
    this.filters = {
      accuracy: 'all',
      region: 'all',
      capacity: 'all',
      majorOnly: false,
      datacenterTier: 'all'
    };

    // Update UI elements
    const accuracyFilter = document.getElementById('cable-filter');
    if (accuracyFilter) accuracyFilter.value = 'all';

    const regionFilter = document.getElementById('region-filter');
    if (regionFilter) regionFilter.value = 'all';

    const capacityFilter = document.getElementById('capacity-filter');
    if (capacityFilter) capacityFilter.value = 'all';

    const majorOnlyToggle = document.getElementById('show-major-only');
    if (majorOnlyToggle) majorOnlyToggle.checked = false;

    this.onFilterChange(this.filters);
  }
}
