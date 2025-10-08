/**
 * Unit Tests for API Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  APIClient,
  CircuitBreaker,
  RequestBatcher,
  RequestDeduplicator,
  RetryPolicy
} from '../../src/services/apiService.js';

describe('CircuitBreaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      timeout: 1000,
      successThreshold: 2
    });
  });

  it('should start in closed state', () => {
    expect(breaker.getState().state).toBe('closed');
  });

  it('should open circuit after threshold failures', async () => {
    const failingFn = () => Promise.reject(new Error('fail'));

    for (let i = 0; i < 3; i++) {
      try {
        await breaker.call(failingFn);
      } catch (e) {
        // Expected to fail
      }
    }

    expect(breaker.getState().state).toBe('open');
  });

  it('should reject calls when circuit is open', async () => {
    const failingFn = () => Promise.reject(new Error('fail'));

    // Cause circuit to open
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.call(failingFn);
      } catch (e) {}
    }

    // Next call should be rejected immediately
    await expect(breaker.call(() => Promise.resolve('ok'))).rejects.toThrow('Circuit breaker OPEN');
  });

  it('should reset failure count on success', async () => {
    const successFn = () => Promise.resolve('success');

    // Fail twice
    try {
      await breaker.call(() => Promise.reject(new Error('fail')));
    } catch (e) {}

    expect(breaker.getState().failureCount).toBe(1);

    // Success should reset
    await breaker.call(successFn);
    expect(breaker.getState().failureCount).toBe(0);
  });

  it('should transition to half-open after timeout', async () => {
    vi.useFakeTimers();
    const failingFn = () => Promise.reject(new Error('fail'));

    // Open circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.call(failingFn);
      } catch (e) {}
    }

    expect(breaker.getState().state).toBe('open');

    // Fast forward time
    vi.advanceTimersByTime(1001);

    // Next call should put circuit in half-open
    try {
      await breaker.call(() => Promise.resolve('ok'));
    } catch (e) {}

    expect(breaker.getState().state).toBe('closed');

    vi.useRealTimers();
  });
});

describe('RetryPolicy', () => {
  let retryPolicy;

  beforeEach(() => {
    retryPolicy = new RetryPolicy({
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 1000
    });
  });

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryPolicy.execute(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');

    const result = await retryPolicy.execute(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    await expect(retryPolicy.execute(fn)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-retryable errors', async () => {
    const error = new Error('bad request');
    error.status = 400;
    const fn = vi.fn().mockRejectedValue(error);

    await expect(retryPolicy.execute(fn)).rejects.toThrow('bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on 5xx errors', async () => {
    const error = new Error('server error');
    error.status = 500;
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const result = await retryPolicy.execute(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('RequestDeduplicator', () => {
  let deduplicator;

  beforeEach(() => {
    deduplicator = new RequestDeduplicator();
  });

  it('should deduplicate concurrent requests with same key', async () => {
    const fn = vi.fn().mockResolvedValue('result');

    const promises = [
      deduplicator.deduplicate('key1', fn),
      deduplicator.deduplicate('key1', fn),
      deduplicator.deduplicate('key1', fn)
    ];

    await Promise.all(promises);

    // Function should only be called once
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not deduplicate requests with different keys', async () => {
    const fn = vi.fn().mockResolvedValue('result');

    const promises = [
      deduplicator.deduplicate('key1', fn),
      deduplicator.deduplicate('key2', fn),
      deduplicator.deduplicate('key3', fn)
    ];

    await Promise.all(promises);

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should allow subsequent requests after first completes', async () => {
    const fn = vi.fn().mockResolvedValue('result');

    await deduplicator.deduplicate('key1', fn);
    await deduplicator.deduplicate('key1', fn);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('APIClient', () => {
  let client;
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    client = new APIClient({
      baseUrl: 'https://api.example.com',
      timeout: 5000
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should make GET request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({ data: 'test' })
    });

    const result = await client.get('/endpoint');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoint'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual({ data: 'test' });
  });

  it('should add query parameters', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({})
    });

    await client.get('/endpoint', { params: { foo: 'bar', baz: 'qux' } });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('foo=bar'),
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('baz=qux'),
      expect.any(Object)
    );
  });

  it('should handle errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(client.get('/endpoint')).rejects.toThrow('HTTP 404');
  });

  it('should timeout long requests', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ ok: true }), 10000);
    }));

    await expect(client.get('/endpoint')).rejects.toThrow('timeout');
  });

  it('should apply circuit breaker', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error'
    });

    // Fail enough times to open circuit
    for (let i = 0; i < 5; i++) {
      try {
        await client.get('/endpoint');
      } catch (e) {}
    }

    const state = client.getCircuitState();
    expect(state.state).toBe('open');
  });
});
