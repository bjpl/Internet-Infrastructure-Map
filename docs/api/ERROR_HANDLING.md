# API Error Handling & Troubleshooting Guide

Complete reference for handling errors when working with live APIs.

---

## Table of Contents

- [Common Errors](#common-errors)
- [Error Types](#error-types)
- [Troubleshooting Workflow](#troubleshooting-workflow)
- [Error Recovery Strategies](#error-recovery-strategies)
- [Debugging Tools](#debugging-tools)

---

## Common Errors

### Rate Limiting (HTTP 429)

**Error Message:**
```
Too Many Requests
429 - Rate limit exceeded
```

**Cause:**
- Exceeded API rate limit
- Too many requests in time window
- Insufficient delay between requests

**Solutions:**

```javascript
// 1. Increase cache TTL to reduce API calls
const orchestrator = new DataOrchestrator({
  cache: {
    defaultTTL: 86400000 // 24 hours instead of 5 minutes
  }
});

// 2. Implement request throttling
import { throttle } from './utils/throttle.js';
const throttledFetch = throttle(fetchData, 2000); // Max 1 call per 2 seconds

// 3. Check rate limit headers before calling
const rateLimit = orchestrator.peeringdb.getRateLimit();
if (rateLimit.remaining < 10) {
  console.warn('Low rate limit, using cache');
  return cache.get('ixps');
}
```

**Prevention:**
- Use API keys for higher limits
- Enable aggressive caching
- Implement exponential backoff
- Monitor rate limit headers

---

### Authentication Errors (HTTP 401)

**Error Message:**
```
Unauthorized
401 - Invalid or missing API key
```

**Cause:**
- Missing API key in `.env`
- Incorrect API key format
- Expired API key
- Wrong environment variable name

**Solutions:**

```bash
# 1. Verify .env file exists
ls -la .env

# 2. Check API key format
cat .env | grep CLOUDFLARE

# 3. Test API key directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.cloudflare.com/client/v4/radar/attacks/layer3/timeseries_groups

# 4. Verify environment variable is loaded
console.log('Token:', import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN);
```

**Validation Code:**
```javascript
// Check if API keys are configured
function validateAPIKeys() {
  const keys = {
    cloudflare: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN,
    peeringdb: import.meta.env.VITE_PEERINGDB_API_KEY
  };

  const missing = [];
  if (!keys.cloudflare) missing.push('Cloudflare Radar');
  if (!keys.peeringdb) missing.push('PeeringDB');

  if (missing.length > 0) {
    console.warn(`Missing API keys for: ${missing.join(', ')}`);
    console.warn('Application will use cached/fallback data');
    return false;
  }

  return true;
}

// Run on startup
validateAPIKeys();
```

**Prevention:**
- Copy `.env.example` to `.env`
- Verify all required keys are set
- Test keys before deployment
- Use environment-specific keys

---

### CORS Errors

**Error Message:**
```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Cause:**
- Browser security restriction
- API doesn't allow cross-origin requests
- Missing CORS headers on API server

**Solutions:**

**Development (Use Vite Proxy):**
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api/cloudflare': {
        target: 'https://api.cloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cloudflare/, '/client/v4/radar')
      }
    }
  }
}

// Use proxied endpoint
fetch('/api/cloudflare/attacks/layer3/timeseries_groups')
```

**Production (Serverless Function):**
```javascript
// api/proxy.js (Vercel/Netlify function)
export default async function handler(req, res) {
  const { url } = req.query;

  // Validate URL
  const allowedDomains = [
    'api.cloudflare.com',
    'api.peeringdb.com',
    'www.submarinecablemap.com'
  ];

  const urlObj = new URL(url);
  if (!allowedDomains.includes(urlObj.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  // Proxy request
  const response = await fetch(url, {
    headers: {
      'Authorization': req.headers.authorization,
      'User-Agent': 'Internet-Infrastructure-Map/2.0'
    }
  });

  const data = await response.json();
  res.json(data);
}
```

**Prevention:**
- Always use proxy in development
- Deploy serverless proxy for production
- Test CORS before deploying

---

### Network Errors (Failed to Fetch)

**Error Message:**
```
TypeError: Failed to fetch
Network request failed
```

**Cause:**
- No internet connection
- API server down
- DNS resolution failure
- Firewall blocking request

**Solutions:**

```javascript
async function fetchWithFallback(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Network fetch failed, using fallback:', error.message);

    // Try cache first
    const cached = await cache.get(url);
    if (cached) {
      return { ...cached, metadata: { source: 'cache', confidence: 0.7 } };
    }

    // Use hardcoded fallback
    return fallbackData.getData(url);
  }
}
```

**Prevention:**
- Implement fallback chain
- Enable caching
- Test offline mode
- Show clear error messages to users

---

### Timeout Errors

**Error Message:**
```
Error: Request timeout
The request took too long to complete
```

**Cause:**
- Slow API response
- Network congestion
- Large response payload
- Server processing delay

**Solutions:**

```javascript
// 1. Increase timeout for slow endpoints
const client = new APIClient({
  timeout: 30000, // 30 seconds instead of 10
});

// 2. Implement retry with backoff
async function fetchWithRetry(fn, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`Timeout, retry ${attempt}/${maxAttempts} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 3. Use streaming for large responses
async function fetchLargeDataset(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();

  let chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return chunks;
}
```

**Prevention:**
- Set appropriate timeouts
- Implement retry logic
- Use pagination for large datasets
- Monitor API performance

---

### Circuit Breaker Triggered

**Error Message:**
```
CircuitBreakerOpenError: Circuit breaker is OPEN for service: peeringdb
Too many consecutive failures detected
```

**Cause:**
- Multiple consecutive API failures
- Circuit breaker protection activated
- Service temporarily unavailable

**Solutions:**

```javascript
// 1. Check circuit state
const health = orchestrator.getHealth();
console.log('Circuit states:', health.services);

if (health.services.peeringdb.circuitState.state === 'open') {
  console.log('Circuit opened at:', health.services.peeringdb.circuitState.openedAt);
  console.log('Will retry at:', health.services.peeringdb.circuitState.nextAttempt);
}

// 2. Manual reset (use cautiously)
orchestrator.peeringdb.client.resetCircuit();
console.log('Circuit breaker manually reset');

// 3. Wait for automatic recovery
setTimeout(() => {
  // Circuit will attempt half-open after timeout
  const health = orchestrator.getHealth();
  console.log('Circuit state after timeout:', health.services.peeringdb.circuitState.state);
}, 60000); // 1 minute
```

**Prevention:**
- Monitor service health
- Implement proper error handling
- Use fallback data sources
- Don't reset circuit too frequently

---

### Data Validation Errors

**Error Message:**
```
ValidationError: Invalid data format received from API
Expected array, got object
```

**Cause:**
- API response format changed
- Unexpected data structure
- Missing required fields
- Type mismatch

**Solutions:**

```javascript
// 1. Validate response structure
function validateCableData(data) {
  if (!Array.isArray(data)) {
    throw new ValidationError(`Expected array, got ${typeof data}`);
  }

  data.forEach((cable, index) => {
    if (!cable.id) throw new ValidationError(`Cable ${index} missing id`);
    if (!cable.coordinates) throw new ValidationError(`Cable ${index} missing coordinates`);
  });

  return true;
}

// 2. Transform with error handling
function transformCableData(rawData) {
  try {
    return rawData.map(cable => ({
      id: cable.cable_id || cable.id,
      name: cable.name || 'Unknown Cable',
      coordinates: cable.coordinates || estimateCoordinates(cable)
    }));
  } catch (error) {
    console.error('Data transformation failed:', error);
    return fallbackCableData;
  }
}

// 3. Use schema validation
import Ajv from 'ajv';
const ajv = new Ajv();

const cableSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['id', 'name', 'coordinates'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      coordinates: { type: 'array' }
    }
  }
};

const validate = ajv.compile(cableSchema);
if (!validate(data)) {
  console.error('Validation errors:', validate.errors);
}
```

**Prevention:**
- Define data schemas
- Validate all API responses
- Transform data defensively
- Log validation failures

---

### Cache Corruption

**Error Message:**
```
CacheError: Unable to parse cached data
Invalid JSON in cache
```

**Cause:**
- Corrupted cache data
- Incomplete write operation
- Browser storage quota exceeded
- Cache version mismatch

**Solutions:**

```javascript
// 1. Clear corrupted cache
async function clearCache() {
  console.log('Clearing cache...');

  // Clear memory cache
  orchestrator.cache.clear();

  // Clear localStorage
  localStorage.clear();

  // Clear IndexedDB
  const dbs = await window.indexedDB.databases();
  dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));

  console.log('Cache cleared successfully');
}

// 2. Validate before caching
async function safeCache(key, data, ttl) {
  try {
    // Validate data is serializable
    JSON.stringify(data);

    await cache.set(key, data, ttl);
  } catch (error) {
    console.error('Failed to cache data:', error);
    // Continue without caching
  }
}

// 3. Implement cache versioning
const CACHE_VERSION = '2.0.0';

async function getFromCache(key) {
  const cached = await cache.get(key);

  if (cached && cached.version !== CACHE_VERSION) {
    console.warn('Cache version mismatch, clearing');
    await cache.delete(key);
    return null;
  }

  return cached?.data;
}
```

**Prevention:**
- Implement cache versioning
- Validate before writing
- Handle quota exceeded errors
- Monitor cache health

---

## Error Types

### Client-Side Errors (4xx)

| Code | Error | Common Cause | Solution |
|------|-------|--------------|----------|
| 400 | Bad Request | Invalid parameters | Check request format |
| 401 | Unauthorized | Missing/invalid API key | Verify credentials |
| 403 | Forbidden | Insufficient permissions | Check API key scope |
| 404 | Not Found | Invalid endpoint | Verify API URL |
| 429 | Too Many Requests | Rate limit exceeded | Implement throttling |

### Server-Side Errors (5xx)

| Code | Error | Common Cause | Solution |
|------|-------|--------------|----------|
| 500 | Internal Server Error | API bug or overload | Use fallback, retry later |
| 502 | Bad Gateway | Proxy issue | Check proxy configuration |
| 503 | Service Unavailable | Maintenance or overload | Use cache, wait and retry |
| 504 | Gateway Timeout | Slow upstream | Increase timeout, use cache |

### Application Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `CircuitBreakerOpenError` | Too many failures | Wait for auto-recovery or reset |
| `ValidationError` | Invalid data format | Update transformer |
| `CacheError` | Cache corruption | Clear cache |
| `TransformError` | Data mapping failed | Check transformer logic |

---

## Troubleshooting Workflow

### Step 1: Identify the Error

```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');
location.reload();

// Check browser console for errors
// Note the error type and message
```

### Step 2: Check Service Health

```javascript
const health = orchestrator.getHealth();

console.log('=== Service Health ===');
console.log('TeleGeography:', health.services.telegeography);
console.log('PeeringDB:', health.services.peeringdb);
console.log('Cloudflare:', health.services.cloudflareRadar);

console.log('\n=== Cache Status ===');
console.log('L1 Hit Rate:', health.cache.l1.hitRate);
console.log('L1 Size:', health.cache.l1.size);

console.log('\n=== Statistics ===');
console.log('Total Requests:', health.statistics.requests);
console.log('Fallback Rate:', health.statistics.fallbackRate);
```

### Step 3: Test Individual Services

```javascript
// Test each API individually
import { PeeringDBAPI } from './services/dataSources/PeeringDBAPI.js';
import { TeleGeographyAPI } from './services/dataSources/TeleGeographyAPI.js';
import { CloudflareRadarAPI } from './services/dataSources/CloudflareRadarAPI.js';

// Test PeeringDB
try {
  const pdb = new PeeringDBAPI();
  const ixps = await pdb.getIXPs({ limit: 1 });
  console.log('✓ PeeringDB working:', ixps);
} catch (error) {
  console.error('✗ PeeringDB failed:', error.message);
}

// Test TeleGeography
try {
  const tg = new TeleGeographyAPI();
  const cables = await tg.getCables();
  console.log('✓ TeleGeography working:', cables.length, 'cables');
} catch (error) {
  console.error('✗ TeleGeography failed:', error.message);
}

// Test Cloudflare
try {
  const cf = new CloudflareRadarAPI({
    token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN
  });
  const attacks = await cf.getAttackData({ dateRange: '1h' });
  console.log('✓ Cloudflare working:', attacks);
} catch (error) {
  console.error('✗ Cloudflare failed:', error.message);
}
```

### Step 4: Verify Configuration

```javascript
// Check environment variables
console.log('Environment Check:');
console.log('- Cloudflare Token:', import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN ? '✓ Set' : '✗ Missing');
console.log('- PeeringDB Key:', import.meta.env.VITE_PEERINGDB_API_KEY ? '✓ Set' : '✗ Missing');
console.log('- Auto Refresh:', import.meta.env.VITE_AUTO_REFRESH);
console.log('- Cache Enabled:', import.meta.env.VITE_ENABLE_CACHE);

// Check proxy configuration (dev only)
console.log('\nProxy Config:', import.meta.env.DEV ? 'Vite proxy active' : 'No proxy (production)');
```

### Step 5: Clear State and Retry

```javascript
async function resetAndRetry() {
  console.log('Resetting application state...');

  // 1. Clear cache
  await orchestrator.cache.clear();
  localStorage.clear();

  // 2. Reset circuit breakers
  orchestrator.telegeography.client.resetCircuit();
  orchestrator.peeringdb.client.resetCircuit();
  orchestrator.cloudflareRadar.client.resetCircuit();

  // 3. Reload data
  console.log('Reloading data...');
  const infrastructure = await orchestrator.getAllInfrastructure();

  console.log('Reset complete:', {
    cables: infrastructure.cables.data.length,
    ixps: infrastructure.ixps.data.length,
    confidence: infrastructure.metadata.averageConfidence
  });

  return infrastructure;
}
```

---

## Error Recovery Strategies

### Strategy 1: Graceful Degradation

```javascript
async function loadDataGracefully() {
  const results = {
    cables: null,
    ixps: null,
    datacenters: null,
    attacks: null
  };

  // Try each service independently
  try {
    results.cables = await orchestrator.getCables();
  } catch (e) {
    console.warn('Cables failed, using fallback');
    results.cables = { data: fallbackData.getCables(), metadata: { source: 'fallback' } };
  }

  try {
    results.ixps = await orchestrator.getIXPs();
  } catch (e) {
    console.warn('IXPs failed, using fallback');
    results.ixps = { data: fallbackData.getIXPs(), metadata: { source: 'fallback' } };
  }

  try {
    results.datacenters = await orchestrator.getDataCenters();
  } catch (e) {
    console.warn('Data centers failed, using fallback');
    results.datacenters = { data: fallbackData.getDataCenters(), metadata: { source: 'fallback' } };
  }

  try {
    results.attacks = await orchestrator.getAttackData({ dateRange: '1h' });
  } catch (e) {
    console.warn('Attack data unavailable');
    results.attacks = { data: [], metadata: { source: 'unavailable' } };
  }

  return results;
}
```

### Strategy 2: Automatic Retry with Exponential Backoff

```javascript
async function exponentialRetry(fn, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error('All retry attempts exhausted');
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const data = await exponentialRetry(() => orchestrator.getCables());
```

### Strategy 3: Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker OPEN');
      }
      this.state = 'HALF_OPEN';
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

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.warn(`Circuit OPEN - too many failures (${this.failures})`);
    }
  }

  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    this.nextAttempt = null;
  }
}
```

---

## Debugging Tools

### Enable Debug Mode

```javascript
// In browser console
localStorage.setItem('debug', 'true');
localStorage.setItem('logLevel', 'verbose');
location.reload();
```

### Monitor Network Requests

```javascript
// Intercept all fetch calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const startTime = performance.now();
  console.log('→ Fetch:', args[0]);

  return originalFetch.apply(this, args)
    .then(response => {
      const duration = performance.now() - startTime;
      console.log(`← ${response.status} (${duration.toFixed(0)}ms):`, args[0]);
      return response;
    })
    .catch(error => {
      console.error('✗ Fetch failed:', args[0], error.message);
      throw error;
    });
};
```

### API Call Statistics

```javascript
// Track API performance
class APIMonitor {
  constructor() {
    this.calls = [];
  }

  record(url, duration, status, error = null) {
    this.calls.push({
      timestamp: Date.now(),
      url,
      duration,
      status,
      error,
      success: status >= 200 && status < 300
    });
  }

  getStats() {
    const successful = this.calls.filter(c => c.success).length;
    const failed = this.calls.length - successful;
    const avgDuration = this.calls.reduce((sum, c) => sum + c.duration, 0) / this.calls.length;

    return {
      total: this.calls.length,
      successful,
      failed,
      successRate: (successful / this.calls.length * 100).toFixed(1) + '%',
      avgDuration: avgDuration.toFixed(0) + 'ms',
      recentErrors: this.calls.filter(c => !c.success).slice(-5)
    };
  }
}

const monitor = new APIMonitor();

// Use with orchestrator
const originalGet = orchestrator.getCables.bind(orchestrator);
orchestrator.getCables = async function(...args) {
  const start = performance.now();
  try {
    const result = await originalGet(...args);
    monitor.record('getCables', performance.now() - start, 200);
    return result;
  } catch (error) {
    monitor.record('getCables', performance.now() - start, 0, error.message);
    throw error;
  }
};

// View statistics
setInterval(() => {
  console.log('API Stats:', monitor.getStats());
}, 60000); // Every minute
```

### Health Check Dashboard

```javascript
function showHealthDashboard() {
  const health = orchestrator.getHealth();

  console.log(`
╔═══════════════════════════════════════╗
║      SERVICE HEALTH DASHBOARD         ║
╚═══════════════════════════════════════╝

TeleGeography:
  Circuit: ${health.services.telegeography.circuitState.state}
  Failures: ${health.services.telegeography.circuitState.failures}

PeeringDB:
  Circuit: ${health.services.peeringdb.circuitState.state}
  Rate Limit: ${health.services.peeringdb.rateLimit.remaining}/${health.services.peeringdb.rateLimit.requests}

Cloudflare Radar:
  Circuit: ${health.services.cloudflareRadar.circuitState.state}
  Authenticated: ${health.services.cloudflareRadar.authenticated}
  Polling: ${health.services.cloudflareRadar.polling}

Cache:
  L1 Hit Rate: ${health.cache.l1.hitRate}
  L1 Size: ${(health.cache.l1.size / 1024 / 1024).toFixed(2)}MB

Statistics:
  Total Requests: ${health.statistics.requests}
  Cache Hit Rate: ${health.statistics.cacheHitRate}
  Fallback Rate: ${health.statistics.fallbackRate}
  `);
}

// Run periodically
setInterval(showHealthDashboard, 30000); // Every 30 seconds
```

---

## Best Practices for Error Handling

### 1. Always Use Try-Catch

```javascript
async function safeAPICall() {
  try {
    const data = await orchestrator.getCables();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    // Show user-friendly error
    showErrorToast('Unable to load data. Using cached version.');
    // Return fallback
    return cache.get('cables') || fallbackData.getCables();
  }
}
```

### 2. Validate API Responses

```javascript
function validateResponse(response, expectedFields) {
  if (!response) throw new Error('Empty response');

  expectedFields.forEach(field => {
    if (!(field in response)) {
      throw new Error(`Missing required field: ${field}`);
    }
  });

  return true;
}

// Usage
const data = await api.getCables();
validateResponse(data, ['data', 'metadata']);
```

### 3. Implement Timeout Protection

```javascript
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    )
  ]);
}

// Usage
const data = await withTimeout(
  orchestrator.getCables(),
  10000 // 10 second timeout
);
```

### 4. Log Errors with Context

```javascript
function logError(error, context) {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    context: {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    }
  });
}

// Usage
try {
  await orchestrator.getCables();
} catch (error) {
  logError(error, {
    service: 'TeleGeography',
    operation: 'getCables',
    userId: currentUser?.id
  });
}
```

### 5. Provide User Feedback

```javascript
async function loadDataWithFeedback() {
  const statusElement = document.getElementById('loading-status');

  try {
    statusElement.textContent = 'Loading infrastructure data...';
    statusElement.className = 'status-loading';

    const data = await orchestrator.getAllInfrastructure();

    statusElement.textContent = 'Data loaded successfully';
    statusElement.className = 'status-success';

    // Auto-hide after 3 seconds
    setTimeout(() => statusElement.style.display = 'none', 3000);

    return data;

  } catch (error) {
    statusElement.textContent = `Error: ${error.message}`;
    statusElement.className = 'status-error';

    // Show retry button
    showRetryButton();

    throw error;
  }
}
```

---

## Support & Resources

### Documentation
- [API Complete Guide](../guides/API_COMPLETE_GUIDE.md) - Full API documentation
- [Architecture](../architecture/README.md) - System architecture
- [Troubleshooting FAQ](../reference/troubleshooting.md) - Common issues

### External Resources
- [PeeringDB API Docs](https://docs.peeringdb.com/api/)
- [Cloudflare Radar API](https://developers.cloudflare.com/radar/)
- [TeleGeography GitHub](https://github.com/telegeography/www.submarinecablemap.com)

### Getting Help
- **GitHub Issues:** [Report bugs](https://github.com/bjpl/Internet-Infrastructure-Map/issues)
- **Discussions:** [Ask questions](https://github.com/bjpl/Internet-Infrastructure-Map/discussions)
- **Security:** See [SECURITY.md](../../SECURITY.md)

---

**Last Updated:** October 8, 2025
**Version:** 2.0.0
