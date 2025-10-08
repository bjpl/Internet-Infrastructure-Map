/**
 * API Service Layer
 *
 * Provides robust API client with circuit breaker pattern, request batching,
 * exponential backoff retry logic, and response transformation pipeline.
 *
 * @module services/apiService
 */

/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests to failing services
 */
class CircuitBreaker {
  /**
   * @param {Object} options - Circuit breaker configuration
   * @param {number} [options.failureThreshold=5] - Number of failures before opening circuit
   * @param {number} [options.timeout=60000] - Time in ms before attempting half-open state
   * @param {number} [options.successThreshold=3] - Successes needed to close from half-open
   */
  constructor(options = {}) {
    this.state = 'closed'; // closed | open | half-open
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.successThreshold = options.successThreshold || 3;
  }

  /**
   * Execute function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @returns {Promise<*>} Result of function execution
   * @throws {Error} If circuit is open or function fails
   */
  async call(fn) {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker OPEN for service. Retry after ${new Date(this.nextAttempt).toISOString()}`);
      }
      // Attempt half-open
      this.state = 'half-open';
      this.successCount = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful request
   * @private
   */
  onSuccess() {
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed';
        this.successCount = 0;
        console.log('[CircuitBreaker] Circuit closed after successful recovery');
      }
    }
  }

  /**
   * Handle failed request
   * @private
   */
  onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.state === 'half-open') {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.timeout;
      console.warn('[CircuitBreaker] Circuit re-opened after failure in half-open state');
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.timeout;
      console.warn(`[CircuitBreaker] Circuit opened after ${this.failureCount} failures. Retry at ${new Date(this.nextAttempt).toISOString()}`);
    }
  }

  /**
   * Get current circuit breaker state
   * @returns {Object} Current state information
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt
    };
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset() {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
  }
}

/**
 * Request Batcher
 * Batches multiple requests together to optimize API calls
 */
class RequestBatcher {
  constructor() {
    this.queues = new Map(); // service -> array of pending requests
    this.timers = new Map(); // service -> timeout handle
    this.batchWindow = 100; // ms to wait before executing batch
  }

  /**
   * Add request to batch queue
   * @param {string} service - Service identifier
   * @param {Object} request - Request parameters
   * @returns {Promise<*>} Promise that resolves with request result
   */
  add(service, request) {
    return new Promise((resolve, reject) => {
      const batch = this.queues.get(service) || [];
      batch.push({ ...request, resolve, reject });
      this.queues.set(service, batch);

      // Schedule batch execution if not already scheduled
      if (!this.timers.has(service)) {
        const timer = setTimeout(() => {
          this.executeBatch(service);
        }, this.batchWindow);
        this.timers.set(service, timer);
      }
    });
  }

  /**
   * Execute batched requests
   * @private
   * @param {string} service - Service to execute batch for
   */
  async executeBatch(service) {
    const batch = this.queues.get(service) || [];
    this.queues.delete(service);

    const timer = this.timers.get(service);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(service);
    }

    if (batch.length === 0) return;

    console.log(`[RequestBatcher] Executing batch of ${batch.length} requests for ${service}`);

    // Group by endpoint
    const grouped = new Map();
    for (const req of batch) {
      const key = `${req.method || 'GET'}:${req.endpoint}`;
      const group = grouped.get(key) || [];
      group.push(req);
      grouped.set(key, group);
    }

    // Execute each group
    for (const [key, requests] of grouped.entries()) {
      await this.executeGroupedRequests(service, requests);
    }
  }

  /**
   * Execute grouped requests
   * @private
   * @param {string} service - Service name
   * @param {Array} requests - Array of requests
   */
  async executeGroupedRequests(service, requests) {
    // For now, execute individually (can be optimized with batch API endpoints)
    for (const req of requests) {
      try {
        // This would be replaced with actual API call
        const result = await req.executor();
        req.resolve(result);
      } catch (error) {
        req.reject(error);
      }
    }
  }

  /**
   * Get pending request count
   * @returns {number} Number of pending requests
   */
  getPendingCount() {
    let count = 0;
    for (const batch of this.queues.values()) {
      count += batch.length;
    }
    return count;
  }
}

/**
 * Request Deduplicator
 * Prevents duplicate in-flight requests
 */
class RequestDeduplicator {
  constructor() {
    this.pending = new Map(); // key -> Promise
  }

  /**
   * Execute function with deduplication
   * @param {string} key - Unique request key
   * @param {Function} fn - Function to execute
   * @returns {Promise<*>} Result of function
   */
  async deduplicate(key, fn) {
    // Check if request is already in flight
    const existing = this.pending.get(key);
    if (existing) {
      console.log(`[Deduplicator] Request already in flight: ${key}`);
      return existing;
    }

    // Execute new request
    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Get number of pending requests
   * @returns {number} Pending request count
   */
  getPendingCount() {
    return this.pending.size;
  }
}

/**
 * Retry Policy with Exponential Backoff
 */
class RetryPolicy {
  /**
   * @param {Object} options - Retry configuration
   * @param {number} [options.maxAttempts=3] - Maximum retry attempts
   * @param {number} [options.baseDelay=1000] - Base delay in ms
   * @param {number} [options.maxDelay=30000] - Maximum delay in ms
   * @param {Function} [options.shouldRetry] - Function to determine if error is retryable
   */
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.shouldRetry = options.shouldRetry || this.defaultShouldRetry.bind(this);
  }

  /**
   * Execute function with retry logic
   * @param {Function} fn - Async function to execute
   * @returns {Promise<*>} Result of successful execution
   * @throws {Error} Last error if all retries exhausted
   */
  async execute(fn) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === this.maxAttempts || !this.shouldRetry(error)) {
          throw error;
        }

        // Calculate delay with exponential backoff and jitter
        const exponentialDelay = this.baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000;
        const delay = Math.min(exponentialDelay + jitter, this.maxDelay);

        console.warn(`[RetryPolicy] Attempt ${attempt} failed, retrying after ${Math.round(delay)}ms`, error.message);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Default retry determination
   * @private
   * @param {Error} error - Error to check
   * @returns {boolean} Whether to retry
   */
  defaultShouldRetry(error) {
    // Retry on network errors and 5xx server errors
    if (error.name === 'NetworkError' || error.name === 'TypeError') {
      return true;
    }

    if (error.status) {
      // Retry on 5xx errors and 429 (rate limit)
      return error.status >= 500 || error.status === 429;
    }

    return false;
  }

  /**
   * Sleep utility
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Response Transformation Pipeline
 */
class ResponseTransformer {
  constructor() {
    this.transformers = new Map();
  }

  /**
   * Register transformer for a data source
   * @param {string} source - Data source identifier
   * @param {Function} transformer - Transformation function
   */
  register(source, transformer) {
    this.transformers.set(source, transformer);
  }

  /**
   * Transform response data
   * @param {*} data - Raw response data
   * @param {string} source - Data source
   * @returns {Promise<Object>} Transformed data with metadata
   */
  async transform(data, source) {
    const transformer = this.transformers.get(source);

    if (!transformer) {
      // Default transformation
      return {
        data,
        metadata: {
          source,
          timestamp: Date.now(),
          confidence: 0.5,
          freshness: 'unknown'
        }
      };
    }

    try {
      const transformed = await transformer(data);
      return {
        ...transformed,
        metadata: {
          ...transformed.metadata,
          source,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error(`[ResponseTransformer] Transformation failed for ${source}:`, error);
      throw error;
    }
  }
}

/**
 * Main API Client
 * Production-ready API client with resilience patterns
 */
export class APIClient {
  /**
   * @param {Object} config - API client configuration
   * @param {string} config.baseUrl - Base URL for API
   * @param {number} [config.timeout=10000] - Request timeout in ms
   * @param {Object} [config.headers={}] - Default headers
   * @param {Object} [config.circuitBreaker] - Circuit breaker options
   * @param {Object} [config.retry] - Retry policy options
   */
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = config.headers || {};

    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    this.retryPolicy = new RetryPolicy(config.retry);
    this.batcher = new RequestBatcher();
    this.deduplicator = new RequestDeduplicator();
    this.transformer = new ResponseTransformer();
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} [options={}] - Request options
   * @returns {Promise<Object>} Response data
   *
   * @example
   * const client = new APIClient({ baseUrl: 'https://api.example.com' });
   * const data = await client.get('/users', { params: { limit: 10 } });
   */
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {*} data - Request body
   * @param {Object} [options={}] - Request options
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, { ...options, body: data });
  }

  /**
   * Core request method with all resilience patterns
   * @private
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(method, endpoint, options = {}) {
    const { params, headers, body, batch = false, deduplicate = true, transform = true } = options;

    // Build URL
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Deduplication key
    const dedupKey = `${method}:${url.toString()}`;

    // Request executor
    const executor = async () => {
      return this.circuitBreaker.call(async () => {
        return this.retryPolicy.execute(async () => {
          return this.executeRequest(method, url.toString(), { headers, body });
        });
      });
    };

    // Execute with deduplication
    const response = deduplicate
      ? await this.deduplicator.deduplicate(dedupKey, executor)
      : await executor();

    // Transform response if requested
    if (transform && options.source) {
      return this.transformer.transform(response, options.source);
    }

    return response;
  }

  /**
   * Execute HTTP request
   * @private
   * @param {string} method - HTTP method
   * @param {string} url - Full URL
   * @param {Object} options - Request options
   * @returns {Promise<*>} Response data
   */
  async executeRequest(method, url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const requestHeaders = {
        ...this.defaultHeaders,
        ...options.headers
      };

      if (options.body && typeof options.body === 'object') {
        requestHeaders['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${this.timeout}ms`);
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }

      throw error;
    }
  }

  /**
   * Get circuit breaker state
   * @returns {Object} Circuit breaker state
   */
  getCircuitState() {
    return this.circuitBreaker.getState();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuit() {
    this.circuitBreaker.reset();
  }

  /**
   * Register response transformer
   * @param {string} source - Data source identifier
   * @param {Function} transformer - Transformation function
   */
  registerTransformer(source, transformer) {
    this.transformer.register(source, transformer);
  }
}

/**
 * Export all classes for testing and advanced usage
 */
export {
  CircuitBreaker,
  RequestBatcher,
  RequestDeduplicator,
  RetryPolicy,
  ResponseTransformer
};
