# API Security Documentation

> **Comprehensive security guide for API integration and usage**

**Last Updated:** November 3, 2025
**Version:** 2.0
**Audience:** Developers, Security Teams, API Integrators

---

## Table of Contents

- [Overview](#overview)
- [API Authentication](#api-authentication)
- [API Key Management](#api-key-management)
- [Rate Limiting](#rate-limiting)
- [Request Security](#request-security)
- [Response Validation](#response-validation)
- [Error Handling](#error-handling)
- [Monitoring & Logging](#monitoring--logging)
- [API Provider Specifics](#api-provider-specifics)

---

## Overview

The Internet Infrastructure Map integrates with multiple third-party APIs. This document covers security best practices for API integration, authentication, and data handling.

### API Providers

| Provider | Purpose | Auth Type | Rate Limit |
|----------|---------|-----------|------------|
| PeeringDB | Data center locations | API Key (optional) | 100/hr (public), 1000/hr (authenticated) |
| Cloudflare Radar | Traffic insights | API Token | 600/min |
| TeleGeography | Submarine cables | None | Public GitHub data |

### Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend App                        │
│  ┌─────────────┐     ┌──────────────┐                  │
│  │  API Keys   │────▶│ Environment  │                  │
│  │  (Hidden)   │     │  Variables   │                  │
│  └─────────────┘     └──────────────┘                  │
└──────────────┬────────────────────────────────────────┬─┘
               │                                        │
               ▼                                        ▼
        ┌──────────────┐                        ┌──────────────┐
        │ Rate Limiter │                        │  Validator   │
        │   (Client)   │                        │  (Response)  │
        └──────┬───────┘                        └──────┬───────┘
               │                                        │
               ▼                                        ▼
        ┌─────────────────────────────────────────────────────┐
        │              External API Providers                  │
        │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
        │  │PeeringDB │  │Cloudflare│  │TeleGeo   │         │
        │  └──────────┘  └──────────┘  └──────────┘         │
        └─────────────────────────────────────────────────────┘
```

---

## API Authentication

### Authentication Flow

#### 1. Environment Variable Configuration

**Development (.env):**
```bash
# .env file (NEVER commit this)
VITE_PEERINGDB_API_KEY=your_dev_key_here
VITE_CLOUDFLARE_RADAR_TOKEN=your_dev_token_here
```

**Production (GitHub Secrets):**
- Repository Settings → Secrets and variables → Actions
- Add each secret individually
- Secrets are encrypted and never exposed in logs

#### 2. Loading Credentials

```javascript
// src/services/dataSources/PeeringDBAPI.js
export class PeeringDBAPI {
  constructor(config = {}) {
    this.apiKey = import.meta.env.VITE_PEERINGDB_API_KEY || config.apiKey;

    // Validate key format (without exposing actual key)
    if (this.apiKey && !this.validateKeyFormat(this.apiKey)) {
      console.warn('PeeringDB API key format invalid');
      this.apiKey = null;
    }
  }

  validateKeyFormat(key) {
    // Check key format without logging actual key
    return typeof key === 'string' && key.length >= 20;
  }
}
```

#### 3. Adding Authentication to Requests

```javascript
async fetchData(endpoint) {
  const headers = {};

  // Add authentication if available
  if (this.apiKey) {
    headers['Authorization'] = `Api-Key ${this.apiKey}`;
  }

  try {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'User-Agent': 'Internet-Infrastructure-Map/2.0'
      },
      // Security timeouts
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Log error without exposing API key
    console.error('API request failed:', {
      endpoint,
      status: error.status,
      // DO NOT log headers or API key
    });
    throw error;
  }
}
```

### Authentication Best Practices

#### ✅ DO

- Store API keys in environment variables
- Use different keys for dev/staging/prod
- Validate key format before use
- Implement graceful fallback when keys unavailable
- Use HTTPS for all API requests
- Set request timeouts
- Implement retry logic with exponential backoff

#### ❌ DON'T

- Hardcode API keys in source code
- Log API keys (even in development)
- Commit `.env` files to repository
- Share API keys via insecure channels
- Use production keys in development
- Expose keys in client-side error messages
- Store keys in localStorage or sessionStorage

---

## API Key Management

### Key Lifecycle

#### 1. Key Generation

**PeeringDB:**
```bash
# 1. Register at https://www.peeringdb.com/register
# 2. Go to https://www.peeringdb.com/account/api_keys
# 3. Click "Create new API key"
# 4. Set permissions: Read-only access
# 5. Copy key immediately (shown only once)
# 6. Store securely in .env file
```

**Cloudflare Radar:**
```bash
# 1. Sign up at https://dash.cloudflare.com/sign-up
# 2. Go to https://dash.cloudflare.com/profile/api-tokens
# 3. Click "Create Token"
# 4. Use template: "Cloudflare Radar Read"
# 5. Set permissions: Cloudflare Radar (Read)
# 6. Copy token and store in .env
```

#### 2. Key Storage

**Local Development:**
```bash
# .env file structure
# API Keys - Store securely, never commit
VITE_PEERINGDB_API_KEY=pk_live_abc123def456
VITE_CLOUDFLARE_RADAR_TOKEN=token_xyz789uvw012

# Optional configuration
VITE_ENABLE_CACHE=true
VITE_AUTO_REFRESH=true
VITE_REFRESH_INTERVAL=300000
```

**Production (GitHub Actions):**
```yaml
# .github/workflows/deploy.yml
jobs:
  build:
    steps:
      - name: Build with secrets
        env:
          VITE_PEERINGDB_API_KEY: ${{ secrets.VITE_PEERINGDB_API_KEY }}
          VITE_CLOUDFLARE_RADAR_TOKEN: ${{ secrets.VITE_CLOUDFLARE_RADAR_TOKEN }}
        run: npm run build
```

#### 3. Key Rotation

**Schedule:** Every 90 days

**Rotation Process:**
1. Generate new key at API provider
2. Test new key in development
3. Update production secrets
4. Deploy with new keys
5. Verify functionality
6. Wait 24 hours for full propagation
7. Delete old key

**Automation:**
```bash
#!/bin/bash
# scripts/rotate-api-keys.sh

echo "🔄 API Key Rotation Reminder"
echo "Last rotation: $(cat .last-key-rotation)"
LAST_ROTATION=$(cat .last-key-rotation)
DAYS_AGO=$(( ( $(date +%s) - $(date -d "$LAST_ROTATION" +%s) ) / 86400 ))

if [ $DAYS_AGO -gt 90 ]; then
  echo "⚠️  API keys should be rotated!"
  echo "   Days since last rotation: $DAYS_AGO"
  echo ""
  echo "Steps to rotate:"
  echo "1. Generate new keys at API providers"
  echo "2. Update GitHub Secrets"
  echo "3. Deploy and verify"
  echo "4. Update .last-key-rotation file"
fi
```

#### 4. Key Revocation

**When to revoke immediately:**
- Key committed to public repository
- Key found in logs or error messages
- Suspicious API usage detected
- Team member with access leaves
- Security incident involving keys
- 90-day rotation schedule reached

**Revocation Process:**
```bash
# 1. Revoke at API provider immediately
# PeeringDB: https://www.peeringdb.com/account/api_keys → Delete
# Cloudflare: https://dash.cloudflare.com/profile/api-tokens → Revoke

# 2. Remove from environment
unset VITE_PEERINGDB_API_KEY
unset VITE_CLOUDFLARE_RADAR_TOKEN

# 3. Deploy without keys (fallback mode)
npm run build

# 4. Generate new keys
# 5. Update deployment
# 6. Document incident
```

---

## Rate Limiting

### Client-Side Rate Limiting

**Implementation:**

```javascript
// services/rateLimiter.js
export class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow; // in milliseconds
    this.requests = [];
  }

  async checkLimit() {
    const now = Date.now();
    const windowStart = now - this.timeWindow;

    // Remove requests outside the time window
    this.requests = this.requests.filter(time => time > windowStart);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);

      throw new RateLimitError(
        `Rate limit exceeded. Please retry in ${Math.ceil(waitTime / 1000)} seconds.`,
        waitTime
      );
    }

    this.requests.push(now);
  }

  async execute(fn) {
    await this.checkLimit();
    return fn();
  }
}

// Custom error class
export class RateLimitError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
```

**Usage:**

```javascript
// src/services/dataSources/CloudflareRadarAPI.js
export class CloudflareRadarAPI {
  constructor(config = {}) {
    // Cloudflare Radar: 600 requests/minute
    this.rateLimiter = new RateLimiter(600, 60000);
  }

  async fetchAttackData() {
    try {
      return await this.rateLimiter.execute(async () => {
        const response = await fetch(this.endpoint);
        return response.json();
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn('Rate limit hit, using cached data');
        return this.getCachedData();
      }
      throw error;
    }
  }
}
```

### Rate Limit Handling

**Exponential Backoff:**

```javascript
export class APIClient {
  async fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Check for rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.pow(2, attempt) * 1000; // Exponential backoff

          console.warn(`Rate limited, waiting ${waitTime}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (error.name === 'AbortError' || error.status === 401) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError;
  }
}
```

### Rate Limit Monitoring

```javascript
// services/rateLimitMonitor.js
export class RateLimitMonitor {
  constructor() {
    this.stats = {
      peeringdb: { requests: 0, limited: 0 },
      cloudflare: { requests: 0, limited: 0 }
    };
  }

  recordRequest(provider) {
    this.stats[provider].requests++;
  }

  recordLimited(provider) {
    this.stats[provider].limited++;
  }

  getStats() {
    return {
      ...this.stats,
      peeringdb: {
        ...this.stats.peeringdb,
        limitedPercentage: this.calculatePercentage('peeringdb')
      },
      cloudflare: {
        ...this.stats.cloudflare,
        limitedPercentage: this.calculatePercentage('cloudflare')
      }
    };
  }

  calculatePercentage(provider) {
    const { requests, limited } = this.stats[provider];
    return requests > 0 ? (limited / requests * 100).toFixed(2) : 0;
  }

  shouldAlert(provider) {
    // Alert if > 10% of requests are being rate limited
    return this.calculatePercentage(provider) > 10;
  }
}
```

---

## Request Security

### Secure Request Configuration

```javascript
export class SecureAPIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || 10000; // 10 seconds
    this.maxRetries = options.maxRetries || 3;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Security-focused configuration
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Internet-Infrastructure-Map/2.0',
        ...this.getAuthHeaders(),
        ...options.headers
      },
      // Security timeout
      signal: AbortSignal.timeout(this.timeout),
      // Credential policy
      credentials: 'omit', // Don't send cookies
      // Referrer policy
      referrerPolicy: 'no-referrer',
      ...options
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error, url);
    }
  }

  getAuthHeaders() {
    const headers = {};

    if (this.apiKey) {
      headers['Authorization'] = `Api-Key ${this.apiKey}`;
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async handleResponse(response) {
    // Log response (without sensitive data)
    console.log('[API]', {
      url: response.url,
      status: response.status,
      // DO NOT log headers (may contain auth tokens)
    });

    if (!response.ok) {
      throw new APIError(
        `API request failed: ${response.status}`,
        response.status
      );
    }

    return await response.json();
  }

  handleError(error, url) {
    // Log error safely (without exposing sensitive data)
    console.error('[API] Request failed:', {
      url: url.replace(/[?&]api[_-]?key=[^&]+/gi, '?api_key=[REDACTED]'),
      error: error.message,
      // DO NOT log full error (may contain sensitive data)
    });

    throw error;
  }
}
```

### Request Sanitization

```javascript
export class RequestSanitizer {
  /**
   * Sanitize URL parameters
   */
  static sanitizeParams(params) {
    const sanitized = {};

    for (const [key, value] of Object.entries(params)) {
      // Remove dangerous characters
      if (typeof value === 'string') {
        sanitized[key] = value
          .replace(/[<>'"]/g, '') // Remove HTML/JS characters
          .substring(0, 100); // Limit length
      } else if (typeof value === 'number') {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Build safe query string
   */
  static buildQueryString(params) {
    const sanitized = this.sanitizeParams(params);
    return new URLSearchParams(sanitized).toString();
  }

  /**
   * Validate endpoint
   */
  static validateEndpoint(endpoint) {
    // Only allow alphanumeric, dash, underscore, slash
    const validPattern = /^[a-zA-Z0-9\-_\/]+$/;

    if (!validPattern.test(endpoint)) {
      throw new Error('Invalid endpoint format');
    }

    return endpoint;
  }
}

// Usage
const params = { search: userInput };
const safe = RequestSanitizer.sanitizeParams(params);
const query = RequestSanitizer.buildQueryString(safe);
```

---

## Response Validation

### Schema Validation

```javascript
// validators/apiResponseValidator.js
export class APIResponseValidator {
  /**
   * Validate PeeringDB data center response
   */
  static validateDataCenter(data) {
    const schema = {
      id: 'number',
      name: 'string',
      latitude: 'number',
      longitude: 'number'
    };

    return this.validate(data, schema);
  }

  /**
   * Validate Cloudflare Radar response
   */
  static validateRadarData(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid response structure');
    }

    if (!Array.isArray(data.series)) {
      throw new ValidationError('Missing series data');
    }

    return data;
  }

  /**
   * Generic validation helper
   */
  static validate(data, schema) {
    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in data)) {
        throw new ValidationError(`Missing required field: ${key}`);
      }

      const actualType = typeof data[key];
      if (actualType !== expectedType) {
        throw new ValidationError(
          `Invalid type for ${key}: expected ${expectedType}, got ${actualType}`
        );
      }
    }

    return data;
  }
}

// Usage
try {
  const response = await fetch(url);
  const data = await response.json();
  const validated = APIResponseValidator.validateDataCenter(data);
  // Use validated data
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid API response:', error.message);
    // Use fallback data
  }
}
```

### Data Sanitization

```javascript
export class ResponseSanitizer {
  /**
   * Sanitize cable data from API
   */
  static sanitizeCable(cable) {
    return {
      id: this.sanitizeNumber(cable.id),
      name: this.sanitizeString(cable.name, 200),
      coordinates: this.sanitizeCoordinates(cable.coordinates),
      capacity: cable.capacity ? this.sanitizeNumber(cable.capacity) : null,
      ready: cable.ready ? this.sanitizeNumber(cable.ready) : null
    };
  }

  static sanitizeString(str, maxLength = 255) {
    if (typeof str !== 'string') {
      return '';
    }

    // Remove potential XSS
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .substring(0, maxLength)
      .trim();
  }

  static sanitizeNumber(num) {
    const parsed = Number(num);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number: ${num}`);
    }
    return parsed;
  }

  static sanitizeCoordinates(coords) {
    if (!Array.isArray(coords)) {
      throw new Error('Coordinates must be an array');
    }

    return coords.map(coord => ({
      lat: this.validateLatitude(coord.lat),
      lng: this.validateLongitude(coord.lng)
    }));
  }

  static validateLatitude(lat) {
    const num = this.sanitizeNumber(lat);
    if (num < -90 || num > 90) {
      throw new Error(`Invalid latitude: ${lat}`);
    }
    return num;
  }

  static validateLongitude(lng) {
    const num = this.sanitizeNumber(lng);
    if (num < -180 || num > 180) {
      throw new Error(`Invalid longitude: ${lng}`);
    }
    return num;
  }
}
```

---

## Error Handling

### Secure Error Handling

```javascript
export class APIErrorHandler {
  static handle(error, context = {}) {
    // Determine error type
    if (error.name === 'AbortError') {
      return this.handleTimeout(error, context);
    } else if (error.status === 429) {
      return this.handleRateLimit(error, context);
    } else if (error.status === 401 || error.status === 403) {
      return this.handleAuthError(error, context);
    } else if (error.status >= 500) {
      return this.handleServerError(error, context);
    } else {
      return this.handleGenericError(error, context);
    }
  }

  static handleTimeout(error, context) {
    // Log detailed error (secure)
    console.error('[API] Request timeout:', {
      endpoint: context.endpoint,
      timeout: context.timeout,
      // Don't log sensitive data
    });

    // Return user-friendly message
    return {
      success: false,
      error: 'Request timed out. Please try again.',
      canRetry: true
    };
  }

  static handleRateLimit(error, context) {
    console.warn('[API] Rate limit exceeded:', {
      endpoint: context.endpoint,
      // Don't expose API keys or tokens
    });

    return {
      success: false,
      error: 'Too many requests. Please wait a moment and try again.',
      canRetry: true,
      retryAfter: error.retryAfter
    };
  }

  static handleAuthError(error, context) {
    console.error('[API] Authentication error:', {
      endpoint: context.endpoint,
      status: error.status,
      // Don't log API keys or detailed auth info
    });

    // Generic message to user
    return {
      success: false,
      error: 'Unable to authenticate. Please check your API configuration.',
      canRetry: false
    };
  }

  static handleServerError(error, context) {
    console.error('[API] Server error:', {
      endpoint: context.endpoint,
      status: error.status,
    });

    return {
      success: false,
      error: 'Service temporarily unavailable. Please try again later.',
      canRetry: true
    };
  }

  static handleGenericError(error, context) {
    console.error('[API] Request failed:', {
      endpoint: context.endpoint,
      message: error.message,
    });

    return {
      success: false,
      error: 'An error occurred. Please try again.',
      canRetry: true
    };
  }
}
```

---

## Monitoring & Logging

### Secure Logging

```javascript
export class SecureAPILogger {
  static log(level, message, data = {}) {
    // Redact sensitive information
    const safeData = this.redactSensitiveData(data);

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: safeData
    };

    console[level](message, safeData);

    // Send to logging service (production only)
    if (import.meta.env.PROD) {
      this.sendToLogService(logEntry);
    }
  }

  static redactSensitiveData(data) {
    const SENSITIVE_KEYS = [
      'api_key', 'apikey', 'api-key',
      'token', 'auth', 'authorization',
      'password', 'secret', 'credential'
    ];

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const redacted = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some(sk => lowerKey.includes(sk));

      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        redacted[key] = this.redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  static info(message, data) {
    this.log('info', message, data);
  }

  static warn(message, data) {
    this.log('warn', message, data);
  }

  static error(message, data) {
    this.log('error', message, data);
  }
}

// Usage
SecureAPILogger.info('API request', {
  endpoint: '/api/datacenters',
  apiKey: 'secret', // Will be redacted
  status: 200
});
// Output: { endpoint: '/api/datacenters', apiKey: '[REDACTED]', status: 200 }
```

### Performance Monitoring

```javascript
export class APIPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startRequest(requestId, endpoint) {
    this.metrics.set(requestId, {
      endpoint,
      startTime: Date.now()
    });
  }

  endRequest(requestId, status) {
    const metric = this.metrics.get(requestId);
    if (!metric) return;

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.status = status;

    // Log performance
    SecureAPILogger.info('API request completed', {
      endpoint: metric.endpoint,
      duration: metric.duration,
      status: metric.status
    });

    // Alert on slow requests
    if (metric.duration > 5000) {
      SecureAPILogger.warn('Slow API request', {
        endpoint: metric.endpoint,
        duration: metric.duration
      });
    }

    this.metrics.delete(requestId);
  }

  getStats() {
    // Return aggregated statistics
    const stats = {
      totalRequests: 0,
      averageDuration: 0,
      slowRequests: 0
    };

    // Calculate from stored metrics
    return stats;
  }
}
```

---

## API Provider Specifics

### PeeringDB API

**Endpoint:** `https://api.peeringdb.com/api`

**Authentication:**
```javascript
headers: {
  'Authorization': `Api-Key ${apiKey}`
}
```

**Rate Limits:**
- Public: 100 requests/hour
- Authenticated: 1000 requests/hour

**Security Notes:**
- API key optional (public access available)
- Use authenticated access for production
- Implement client-side rate limiting
- Cache responses (data updates infrequently)

### Cloudflare Radar API

**Endpoint:** `https://api.cloudflare.com/client/v4/radar`

**Authentication:**
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

**Rate Limits:**
- 600 requests/minute

**Security Notes:**
- API token required
- Use specific token permissions (read-only)
- Implement aggressive caching
- Monitor rate limit headers

### TeleGeography API

**Endpoint:** `https://raw.githubusercontent.com/telegeography/www.submarinecablemap.com/master/web/public/api/v3`

**Authentication:**
- None required (public GitHub data)

**Rate Limits:**
- GitHub rate limits apply
- Cache aggressively

**Security Notes:**
- Public data (no authentication)
- Data rarely changes (cache for 24+ hours)
- No sensitive information

---

## Additional Resources

### Security Tools
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [API Security Checklist](https://github.com/shieldfy/API-Security-Checklist)

### Related Documentation
- [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md) - Comprehensive security guidelines
- [DEPLOYMENT_SECURITY.md](./DEPLOYMENT_SECURITY.md) - Production security
- [SECURITY_CHECKLISTS.md](./SECURITY_CHECKLISTS.md) - Quick reference checklists

---

**Questions?** Contact security@internet-infrastructure-map.dev
