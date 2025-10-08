/**
 * Unit Tests for Data Orchestrator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataOrchestrator } from '../../src/services/dataOrchestrator.js';

describe('DataOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new DataOrchestrator({
      enableAutoRefresh: false, // Disable for tests
      enableCache: false // Simplify tests
    });
  });

  it('should initialize with correct config', () => {
    expect(orchestrator.config.enableCache).toBe(false);
    expect(orchestrator.config.enableAutoRefresh).toBe(false);
  });

  it('should have access to all data sources', () => {
    expect(orchestrator.telegeography).toBeDefined();
    expect(orchestrator.peeringdb).toBeDefined();
    expect(orchestrator.fallback).toBeDefined();
  });

  it('should track statistics', () => {
    const stats = orchestrator.getStatistics();

    expect(stats).toHaveProperty('requests');
    expect(stats).toHaveProperty('cacheHits');
    expect(stats).toHaveProperty('cacheMisses');
    expect(stats).toHaveProperty('apiCalls');
    expect(stats).toHaveProperty('fallbacks');
  });

  it('should reset statistics', () => {
    orchestrator.stats.requests = 10;
    orchestrator.stats.cacheHits = 5;

    orchestrator.resetStatistics();

    const stats = orchestrator.getStatistics();
    expect(stats.requests).toBe(0);
    expect(stats.cacheHits).toBe(0);
  });

  it('should get health status', () => {
    const health = orchestrator.getHealth();

    expect(health).toHaveProperty('orchestrator');
    expect(health).toHaveProperty('services');
    expect(health).toHaveProperty('cache');
    expect(health).toHaveProperty('statistics');
  });

  it('should calculate average confidence', () => {
    const results = [
      { metadata: { confidence: 0.9 } },
      { metadata: { confidence: 0.8 } },
      { metadata: { confidence: 0.7 } }
    ];

    const avg = orchestrator.calculateAverageConfidence(results);
    expect(avg).toBeCloseTo(0.8, 1);
  });

  it('should cleanup on destroy', () => {
    orchestrator.startAutoRefresh = vi.fn();
    orchestrator.stopAutoRefresh = vi.fn();

    orchestrator.destroy();

    expect(orchestrator.stopAutoRefresh).toHaveBeenCalled();
  });
});
