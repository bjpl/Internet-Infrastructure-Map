/**
 * Tests for DataTableManager component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataTableManager } from '../../src/components/DataTableManager.js';

describe('DataTableManager', () => {
  let tableManager;
  let mockGetFilteredData;
  let mockCalculateDistance;
  let mockCables;
  let mockDatacenters;

  beforeEach(() => {
    mockCables = [
      {
        name: 'Cable A',
        capacity_tbps: 200,
        status: 'active',
        data_accuracy: 'live',
        owner: 'Consortium A',
        landing_point_1: { latitude: 40.7, longitude: -74.0, location: 'New York' },
        landing_point_2: { latitude: 51.5, longitude: -0.1, location: 'London' }
      },
      {
        name: 'Cable B',
        capacity_tbps: 150,
        status: 'planned',
        data_accuracy: 'estimated',
        owner: 'Consortium B',
        landing_point_1: { latitude: 1.3, longitude: 103.8, location: 'Singapore' },
        landing_point_2: { latitude: 22.3, longitude: 114.2, location: 'Hong Kong' }
      }
    ];

    mockDatacenters = [
      {
        name: 'DC1',
        city: 'New York',
        country: 'USA',
        tier: 1,
        provider: 'Provider A',
        latitude: 40.7,
        longitude: -74.0
      },
      {
        name: 'DC2',
        city: 'London',
        country: 'UK',
        tier: 2,
        provider: 'Provider B',
        latitude: 51.5,
        longitude: -0.1
      }
    ];

    mockGetFilteredData = vi.fn((type) => {
      if (type === 'cables') return mockCables;
      if (type === 'cablesTotal') return 100;
      if (type === 'datacenters') return mockDatacenters;
      if (type === 'datacentersTotal') return 500;
      return [];
    });

    mockCalculateDistance = vi.fn((lat1, lon1, lat2, lon2) => {
      // Mock distance calculation (simplified)
      return 5570; // Approximate NY to London distance
    });

    tableManager = new DataTableManager(mockGetFilteredData, mockCalculateDistance);
  });

  describe('generateCSV', () => {
    it('should generate CSV with headers and rows', () => {
      const headers = ['Name', 'Capacity', 'Status'];
      const rows = [
        ['Cable A', '200', 'Active'],
        ['Cable B', '150', 'Planned']
      ];

      const csv = tableManager.generateCSV(headers, rows);

      expect(csv).toContain('"Name","Capacity","Status"');
      expect(csv).toContain('"Cable A","200","Active"');
      expect(csv).toContain('"Cable B","150","Planned"');
    });

    it('should escape quotes in CSV data', () => {
      const headers = ['Name'];
      const rows = [['Cable with "quotes"']];

      const csv = tableManager.generateCSV(headers, rows);

      expect(csv).toContain('Cable with ""quotes""');
    });

    it('should handle empty rows', () => {
      const headers = ['Name', 'Value'];
      const rows = [];

      const csv = tableManager.generateCSV(headers, rows);

      expect(csv).toBe('"Name","Value"');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const escaped = tableManager.escapeHtml('<script>alert("XSS")</script>');
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('should handle normal text without changes', () => {
      const escaped = tableManager.escapeHtml('Normal text');
      expect(escaped).toBe('Normal text');
    });

    it('should escape ampersands', () => {
      const escaped = tableManager.escapeHtml('AT&T Cable');
      expect(escaped).toContain('&amp;');
    });
  });

  describe('sortTable', () => {
    it('should sort by text column ascending', () => {
      const mockTbody = {
        querySelectorAll: vi.fn(() => [
          { children: [{ textContent: 'Cable B' }] },
          { children: [{ textContent: 'Cable A' }] }
        ]),
        innerHTML: '',
        appendChild: vi.fn()
      };

      const mockTable = {
        querySelector: vi.fn(() => mockTbody),
        querySelectorAll: vi.fn(() => [])
      };

      document.getElementById = vi.fn(() => mockTable);

      tableManager.sortTable('test-table', 0, 'text');

      expect(tableManager.sortState.column).toBe(0);
      expect(tableManager.sortState.ascending).toBe(true);
    });

    it('should reverse sort direction on second click', () => {
      tableManager.sortState = { column: 0, ascending: true };

      const mockTbody = {
        querySelectorAll: vi.fn(() => [
          { children: [{ textContent: 'Cable A' }] },
          { children: [{ textContent: 'Cable B' }] }
        ]),
        innerHTML: '',
        appendChild: vi.fn()
      };

      const mockTable = {
        querySelector: vi.fn(() => mockTbody),
        querySelectorAll: vi.fn(() => [])
      };

      document.getElementById = vi.fn(() => mockTable);

      tableManager.sortTable('test-table', 0, 'text');

      expect(tableManager.sortState.ascending).toBe(false);
    });

    it('should sort numeric columns correctly', () => {
      const mockTbody = {
        querySelectorAll: vi.fn(() => [
          { children: [null, { textContent: '150 Tbps' }] },
          { children: [null, { textContent: '200 Tbps' }] }
        ]),
        innerHTML: '',
        appendChild: vi.fn()
      };

      const mockTable = {
        querySelector: vi.fn(() => mockTbody),
        querySelectorAll: vi.fn(() => [])
      };

      document.getElementById = vi.fn(() => mockTable);

      tableManager.sortTable('test-table', 1, 'number');

      expect(mockTbody.appendChild).toHaveBeenCalled();
    });
  });

  describe('CSV Export', () => {
    it('should export cables with correct format', () => {
      const csv = tableManager.generateCSV(
        ['Name', 'Capacity (Tbps)', 'Distance (km)', 'From', 'To', 'Status', 'Data Accuracy'],
        [
          ['Cable A', '200', '5570', 'New York', 'London', 'Active', 'Live'],
          ['Cable B', '150', '5570', 'Singapore', 'Hong Kong', 'Planned', 'Estimated']
        ]
      );

      expect(csv).toContain('Name');
      expect(csv).toContain('Cable A');
      expect(csv).toContain('200');
      expect(csv).toContain('Live');
    });

    it('should export data centers with correct format', () => {
      const csv = tableManager.generateCSV(
        ['City', 'Country', 'Tier', 'Provider', 'Latitude', 'Longitude', 'Name'],
        [
          ['New York', 'USA', 'Tier 1', 'Provider A', '40.7', '-74.0', 'DC1'],
          ['London', 'UK', 'Tier 2', 'Provider B', '51.5', '-0.1', 'DC2']
        ]
      );

      expect(csv).toContain('City');
      expect(csv).toContain('New York');
      expect(csv).toContain('Tier 1');
      expect(csv).toContain('Provider A');
    });
  });

  describe('Table Population', () => {
    it('should call getFilteredData when populating cable table', () => {
      // Mock DOM elements
      document.getElementById = vi.fn((id) => {
        if (id === 'cable-tbody') return { innerHTML: '', appendChild: vi.fn() };
        if (id === 'filtered-count') return { textContent: '' };
        if (id === 'total-count') return { textContent: '' };
        return null;
      });

      tableManager.populateCableTable();

      expect(mockGetFilteredData).toHaveBeenCalledWith('cables');
      expect(mockGetFilteredData).toHaveBeenCalledWith('cablesTotal');
    });

    it('should call getFilteredData when populating datacenter table', () => {
      document.getElementById = vi.fn((id) => {
        if (id === 'datacenter-tbody') return { innerHTML: '', appendChild: vi.fn() };
        if (id === 'datacenter-filtered-count') return { textContent: '' };
        if (id === 'datacenter-total-count') return { textContent: '' };
        return null;
      });

      tableManager.populateDataCenterTable();

      expect(mockGetFilteredData).toHaveBeenCalledWith('datacenters');
      expect(mockGetFilteredData).toHaveBeenCalledWith('datacentersTotal');
    });

    it('should calculate distance for each cable in table', () => {
      document.getElementById = vi.fn((id) => {
        if (id === 'cable-tbody') return { innerHTML: '', appendChild: vi.fn() };
        return { textContent: '' };
      });

      tableManager.populateCableTable();

      // Should be called once for each cable
      expect(mockCalculateDistance).toHaveBeenCalledTimes(mockCables.length);
    });
  });

  describe('Initialization', () => {
    it('should store getFilteredData callback', () => {
      expect(tableManager.getFilteredData).toBe(mockGetFilteredData);
    });

    it('should store calculateDistance callback', () => {
      expect(tableManager.calculateDistance).toBe(mockCalculateDistance);
    });

    it('should initialize sortState', () => {
      expect(tableManager.sortState).toEqual({
        column: null,
        ascending: true
      });
    });
  });
});
