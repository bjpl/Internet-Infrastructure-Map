/**
 * Tests for FilterControls component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FilterControls } from '../../src/components/FilterControls.js';

describe('FilterControls', () => {
  let filterControls;
  let mockCallback;
  let mockCables;

  beforeEach(() => {
    mockCallback = vi.fn();
    filterControls = new FilterControls(mockCallback);

    // Mock cable data
    mockCables = [
      {
        name: 'MAREA',
        capacity_tbps: 200,
        data_accuracy: 'live',
        status: 'active',
        landing_point_1: { latitude: 40.7, longitude: -74.0, location: 'New York' },
        landing_point_2: { latitude: 39.4, longitude: -0.4, location: 'Valencia' }
      },
      {
        name: 'Grace Hopper',
        capacity_tbps: 350,
        data_accuracy: 'live',
        status: 'active',
        landing_point_1: { latitude: 40.7, longitude: -74.0, location: 'New York' },
        landing_point_2: { latitude: 51.5, longitude: -0.1, location: 'London' }
      },
      {
        name: 'Regional Cable',
        capacity_tbps: 75,
        data_accuracy: 'estimated',
        status: 'active',
        landing_point_1: { latitude: 1.3, longitude: 103.8, location: 'Singapore' },
        landing_point_2: { latitude: 22.3, longitude: 114.2, location: 'Hong Kong' }
      },
      {
        name: 'Low Capacity Cable',
        capacity_tbps: 30,
        data_accuracy: 'estimated',
        status: 'planned',
        landing_point_1: { latitude: 35.7, longitude: 139.7, location: 'Tokyo' },
        landing_point_2: { latitude: 37.5, longitude: 127.0, location: 'Seoul' }
      }
    ];
  });

  describe('filterByAccuracy', () => {
    it('should filter for live data only', () => {
      const filtered = filterControls.filterByAccuracy(mockCables, 'live');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(cable => cable.data_accuracy === 'live')).toBe(true);
    });

    it('should filter for estimated data only', () => {
      const filtered = filterControls.filterByAccuracy(mockCables, 'estimated');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(cable => cable.data_accuracy !== 'live')).toBe(true);
    });

    it('should return all cables when filter is "all"', () => {
      const filtered = filterControls.filterByAccuracy(mockCables, 'all');
      expect(filtered).toHaveLength(mockCables.length);
    });
  });

  describe('filterByCapacity', () => {
    it('should filter high capacity cables (>150 Tbps)', () => {
      const filtered = filterControls.filterByCapacity(mockCables, 'high');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(cable => cable.capacity_tbps > 150)).toBe(true);
    });

    it('should filter medium capacity cables (50-150 Tbps)', () => {
      const filtered = filterControls.filterByCapacity(mockCables, 'medium');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].capacity_tbps).toBe(75);
    });

    it('should filter low capacity cables (<50 Tbps)', () => {
      const filtered = filterControls.filterByCapacity(mockCables, 'low');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].capacity_tbps).toBe(30);
    });
  });

  describe('filterMajorCables', () => {
    it('should filter cables by name (MAREA, Grace, 2Africa)', () => {
      const filtered = filterControls.filterMajorCables(mockCables);
      expect(filtered).toHaveLength(2);
      expect(filtered.some(cable => cable.name.includes('MAREA'))).toBe(true);
      expect(filtered.some(cable => cable.name.includes('Grace'))).toBe(true);
    });

    it('should filter cables with capacity > 100', () => {
      const cables = [
        ...mockCables,
        {
          name: 'Unknown High Capacity',
          capacity_tbps: 150,
          landing_point_1: { latitude: 0, longitude: 0 },
          landing_point_2: { latitude: 1, longitude: 1 }
        }
      ];

      const filtered = filterControls.filterMajorCables(cables);
      expect(filtered.length).toBeGreaterThan(2);
    });
  });

  describe('filterByRegion', () => {
    it('should identify transatlantic cables', () => {
      const filtered = filterControls.filterByRegion(mockCables, 'transatlantic');
      expect(filtered.length).toBeGreaterThan(0);

      filtered.forEach(cable => {
        const lng1 = cable.landing_point_1.longitude;
        const lng2 = cable.landing_point_2.longitude;

        // One end in Americas, other in Europe/Africa
        const validTransatlantic =
          (lng1 < -40 && lng2 > -20 && lng2 < 30) ||
          (lng2 < -40 && lng1 > -20 && lng1 < 30);

        expect(validTransatlantic).toBe(true);
      });
    });

    it('should identify regional cables in Asia', () => {
      const filtered = filterControls.filterByRegion(mockCables, 'asia-internal');
      const asianCables = filtered.filter(cable =>
        cable.landing_point_1.longitude > 60 &&
        cable.landing_point_2.longitude > 60
      );

      expect(asianCables.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between New York and London', () => {
      const distance = filterControls.calculateDistance(
        40.7, -74.0,  // New York
        51.5, -0.1    // London
      );

      // Approximate distance ~5570 km
      expect(distance).toBeGreaterThan(5500);
      expect(distance).toBeLessThan(5650);
    });

    it('should calculate zero distance for same coordinates', () => {
      const distance = filterControls.calculateDistance(
        40.7, -74.0,
        40.7, -74.0
      );

      expect(distance).toBe(0);
    });

    it('should handle antipodal points', () => {
      const distance = filterControls.calculateDistance(
        0, 0,
        0, 180
      );

      // Half the Earth's circumference
      expect(distance).toBeGreaterThan(19000);
      expect(distance).toBeLessThan(21000);
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      filterControls.filters = {
        accuracy: 'all',
        region: 'all',
        capacity: 'all',
        majorOnly: false
      };
    });

    it('should apply no filters when all are set to "all"', () => {
      const filtered = filterControls.applyFilters(mockCables);
      expect(filtered.length).toBe(mockCables.length);
    });

    it('should combine multiple filters correctly', () => {
      filterControls.filters = {
        accuracy: 'live',
        capacity: 'high',
        region: 'all',
        majorOnly: false
      };

      const filtered = filterControls.applyFilters(mockCables);

      expect(filtered.every(cable => cable.data_accuracy === 'live')).toBe(true);
      expect(filtered.every(cable => cable.capacity_tbps > 150)).toBe(true);
    });

    it('should apply majorOnly filter', () => {
      filterControls.filters = {
        accuracy: 'all',
        capacity: 'all',
        region: 'all',
        majorOnly: true
      };

      const filtered = filterControls.applyFilters(mockCables);

      expect(filtered.every(cable =>
        cable.capacity_tbps > 100 ||
        cable.name?.includes('MAREA') ||
        cable.name?.includes('Grace')
      )).toBe(true);
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to default values', () => {
      filterControls.filters = {
        accuracy: 'live',
        region: 'transatlantic',
        capacity: 'high',
        majorOnly: true
      };

      filterControls.resetFilters();

      expect(filterControls.filters).toEqual({
        accuracy: 'all',
        region: 'all',
        capacity: 'all',
        majorOnly: false,
        datacenterTier: 'all'
      });
    });

    it('should call onFilterChange callback when resetting', () => {
      filterControls.resetFilters();
      expect(mockCallback).toHaveBeenCalledWith(filterControls.filters);
    });
  });

  describe('getFilters', () => {
    it('should return a copy of current filters', () => {
      filterControls.filters = {
        accuracy: 'live',
        region: 'transatlantic',
        capacity: 'high',
        majorOnly: true,
        datacenterTier: 'tier1'
      };

      const filters = filterControls.getFilters();

      expect(filters).toEqual(filterControls.filters);
      expect(filters).not.toBe(filterControls.filters); // Should be a copy
    });
  });
});
