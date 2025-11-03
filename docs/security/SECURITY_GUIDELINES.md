# Security Guidelines for Developers

> **Comprehensive security practices for Internet Infrastructure Map development**

**Last Updated:** November 3, 2025
**Version:** 2.0
**Audience:** Developers, Contributors, Maintainers

---

## Table of Contents

- [Overview](#overview)
- [Secure Coding Standards](#secure-coding-standards)
- [API Key Management](#api-key-management)
- [Input Validation](#input-validation)
- [Output Sanitization](#output-sanitization)
- [Dependency Security](#dependency-security)
- [Error Handling](#error-handling)
- [Logging & Monitoring](#logging--monitoring)
- [Testing Security](#testing-security)
- [Code Review Checklist](#code-review-checklist)

---

## Overview

This guide establishes mandatory security practices for all developers contributing to the Internet Infrastructure Map project. Following these guidelines ensures we maintain a secure, reliable, and trustworthy application.

### Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimal access rights
3. **Fail Securely** - Graceful degradation with security intact
4. **Never Trust Input** - Validate and sanitize everything
5. **Security by Design** - Build security in from the start

---

## Secure Coding Standards

### Environment Variables

**RULE:** Never hardcode secrets, API keys, or sensitive configuration.

**✅ CORRECT:**
```javascript
// Use environment variables via Vite
const apiKey = import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN;

// Check if key exists before using
if (!apiKey) {
  console.warn('Cloudflare API key not configured, using fallback data');
  return fallbackData;
}
```

**❌ WRONG:**
```javascript
// NEVER do this!
const apiKey = 'sk-abc123def456';
const token = '8a7b6c5d4e3f2g1h';
```

### File Organization

**RULE:** Keep environment files secure and documented.

```bash
# Repository structure
.env.example        # Template with documentation (COMMIT THIS)
.env               # Your actual keys (NEVER COMMIT)
.gitignore         # Must include .env
```

**Required .gitignore entries:**
```gitignore
# Environment files
.env
.env.local
.env.production
.env.development
*.env

# Never commit these
config/secrets.json
keys/
*.key
*.pem
```

### Configuration Management

**RULE:** Separate configuration from code.

```javascript
// config/apiConfig.js
export const API_CONFIG = {
  peeringdb: {
    baseURL: 'https://api.peeringdb.com/api',
    timeout: 10000,
    retries: 3,
    // API key loaded from environment
    apiKey: import.meta.env.VITE_PEERINGDB_API_KEY
  },
  cloudflare: {
    baseURL: 'https://api.cloudflare.com/client/v4/radar',
    timeout: 5000,
    retries: 2,
    // Token loaded from environment
    token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN
  }
};

// Validate configuration on startup
export function validateConfig() {
  const warnings = [];

  if (!API_CONFIG.cloudflare.token) {
    warnings.push('Cloudflare Radar token not configured');
  }

  if (!API_CONFIG.peeringdb.apiKey) {
    warnings.push('PeeringDB API key not configured (using public API)');
  }

  return warnings;
}
```

---

## API Key Management

### Storage Best Practices

**Development:**
```bash
# .env file (local only)
VITE_PEERINGDB_API_KEY=your_dev_key_here
VITE_CLOUDFLARE_RADAR_TOKEN=your_dev_token_here
```

**Production (GitHub Pages):**
```yaml
# .github/workflows/deploy.yml
env:
  VITE_PEERINGDB_API_KEY: ${{ secrets.PEERINGDB_API_KEY }}
  VITE_CLOUDFLARE_RADAR_TOKEN: ${{ secrets.CLOUDFLARE_RADAR_TOKEN }}
```

### Key Rotation

**RULE:** Rotate API keys every 90 days.

```javascript
// Add key metadata tracking
const API_KEY_METADATA = {
  lastRotated: '2025-11-03',
  rotationInterval: 90, // days
  nextRotation: '2026-02-01'
};

// Warn when rotation is due
function checkKeyRotation() {
  const daysSinceRotation = calculateDaysSince(API_KEY_METADATA.lastRotated);

  if (daysSinceRotation > API_KEY_METADATA.rotationInterval) {
    console.warn('⚠️ API keys should be rotated!');
    console.warn(`Last rotation: ${daysSinceRotation} days ago`);
  }
}
```

### Rate Limiting

**RULE:** Implement client-side rate limiting to respect API quotas.

```javascript
// services/rateLimiter.js
export class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests; // e.g., 100
    this.timeWindow = timeWindow;   // e.g., 60000ms (1 minute)
    this.requests = [];
  }

  async checkLimit() {
    const now = Date.now();
    const windowStart = now - this.timeWindow;

    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);

    // Check if under limit
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Retry in ${Math.ceil(waitTime / 1000)}s`);
    }

    // Record this request
    this.requests.push(now);
  }

  async execute(fn) {
    await this.checkLimit();
    return fn();
  }
}

// Usage
const peeringdbLimiter = new RateLimiter(100, 60000); // 100/minute

async function fetchFromPeeringDB(endpoint) {
  return peeringdbLimiter.execute(async () => {
    const response = await fetch(`https://api.peeringdb.com${endpoint}`);
    return response.json();
  });
}
```

---

## Input Validation

### User Input

**RULE:** Validate and sanitize all user input before processing.

```javascript
// validators/inputValidator.js
export class InputValidator {
  /**
   * Validate search query
   */
  static validateSearchQuery(query) {
    if (typeof query !== 'string') {
      throw new Error('Query must be a string');
    }

    // Trim whitespace
    query = query.trim();

    // Check length
    if (query.length === 0) {
      throw new Error('Query cannot be empty');
    }

    if (query.length > 100) {
      throw new Error('Query too long (max 100 characters)');
    }

    // Check for malicious patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /expression\(/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        throw new Error('Invalid characters in query');
      }
    }

    return query;
  }

  /**
   * Validate numeric input
   */
  static validateNumber(value, min = -Infinity, max = Infinity) {
    const num = Number(value);

    if (isNaN(num)) {
      throw new Error('Value must be a number');
    }

    if (num < min || num > max) {
      throw new Error(`Value must be between ${min} and ${max}`);
    }

    return num;
  }

  /**
   * Validate URL
   */
  static validateURL(url) {
    try {
      const parsed = new URL(url);

      // Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }

      return parsed.href;
    } catch (e) {
      throw new Error('Invalid URL');
    }
  }
}

// Usage
try {
  const safeQuery = InputValidator.validateSearchQuery(userInput);
  performSearch(safeQuery);
} catch (error) {
  console.error('Invalid input:', error.message);
  showErrorToUser('Please enter a valid search query');
}
```

### API Response Validation

**RULE:** Never trust API responses - validate structure and types.

```javascript
// validators/apiResponseValidator.js
export class APIResponseValidator {
  /**
   * Validate submarine cable data
   */
  static validateCableData(data) {
    if (!Array.isArray(data)) {
      throw new Error('Cable data must be an array');
    }

    return data.map((cable, index) => {
      // Check required fields
      const required = ['id', 'name', 'coordinates'];
      for (const field of required) {
        if (!(field in cable)) {
          console.warn(`Cable ${index} missing required field: ${field}`);
          return null;
        }
      }

      // Validate coordinates
      if (!Array.isArray(cable.coordinates)) {
        console.warn(`Cable ${cable.id} has invalid coordinates`);
        return null;
      }

      // Sanitize and normalize
      return {
        id: String(cable.id),
        name: String(cable.name).substring(0, 200), // Limit length
        coordinates: cable.coordinates.map(coord => ({
          lat: this.validateLatitude(coord.lat),
          lng: this.validateLongitude(coord.lng)
        })),
        capacity: cable.capacity ? Number(cable.capacity) : null,
        ready: cable.ready ? Number(cable.ready) : null
      };
    }).filter(Boolean); // Remove invalid entries
  }

  static validateLatitude(lat) {
    const num = Number(lat);
    if (isNaN(num) || num < -90 || num > 90) {
      throw new Error(`Invalid latitude: ${lat}`);
    }
    return num;
  }

  static validateLongitude(lng) {
    const num = Number(lng);
    if (isNaN(num) || num < -180 || num > 180) {
      throw new Error(`Invalid longitude: ${lng}`);
    }
    return num;
  }
}
```

---

## Output Sanitization

### HTML Content

**RULE:** Sanitize all dynamic HTML to prevent XSS attacks.

```javascript
// utils/sanitizer.js
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content
 */
export function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^https?:\/\//
  });
}

/**
 * Sanitize text (remove all HTML)
 */
export function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    return parsed.href;
  } catch {
    return '#';
  }
}

// Usage examples
const userHTML = '<p>Hello <script>alert("XSS")</script></p>';
const safe = sanitizeHTML(userHTML); // '<p>Hello </p>'

const userName = '<img src=x onerror=alert(1)>';
const safeText = sanitizeText(userName); // '&lt;img src=x onerror=alert(1)&gt;'
```

### Dynamic Content Rendering

**RULE:** Use textContent, not innerHTML, for untrusted data.

```javascript
// ✅ CORRECT - Safe
function displayCableName(cable) {
  const element = document.getElementById('cable-name');
  element.textContent = cable.name; // Automatically escaped
}

// ✅ CORRECT - Sanitized HTML
function displayCableDescription(cable) {
  const element = document.getElementById('cable-description');
  element.innerHTML = sanitizeHTML(cable.description);
}

// ❌ WRONG - Vulnerable to XSS
function displayCableData(cable) {
  const element = document.getElementById('cable-info');
  element.innerHTML = cable.name; // DANGEROUS!
}
```

---

## Dependency Security

### Regular Audits

**RULE:** Run security audits before every commit.

```bash
# Check for vulnerabilities
npm audit

# Fix automatically when possible
npm audit fix

# Review details of all vulnerabilities
npm audit --json | jq '.vulnerabilities'

# Check for outdated packages
npm outdated
```

### Automated Scanning

**RULE:** Enable Dependabot and GitHub security alerts.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
```

### Dependency Evaluation

**RULE:** Evaluate dependencies before adding them.

**Checklist before adding a dependency:**
- [ ] Is it actively maintained? (commits in last 6 months)
- [ ] Does it have good security track record?
- [ ] How many dependencies does it have?
- [ ] Is there a smaller/simpler alternative?
- [ ] Can we implement it ourselves?
- [ ] Does it have TypeScript definitions?
- [ ] What's the license? (MIT, Apache 2.0, etc.)

```bash
# Check dependency info
npm info package-name

# Check package size
npm install --dry-run package-name

# View dependency tree
npm ls package-name
```

---

## Error Handling

### Secure Error Messages

**RULE:** Never expose sensitive information in error messages.

```javascript
// ✅ CORRECT - Safe error handling
async function fetchDataCenter(id) {
  try {
    const response = await fetch(`/api/datacenters/${id}`);

    if (!response.ok) {
      // Generic error to user
      throw new Error('Failed to load data center information');
    }

    return await response.json();
  } catch (error) {
    // Detailed logging (server/console only)
    console.error('Data center fetch failed:', {
      id,
      status: error.status,
      message: error.message,
      timestamp: new Date().toISOString()
    });

    // Generic message to user
    throw new Error('Unable to load data center. Please try again.');
  }
}

// ❌ WRONG - Exposes internal details
async function fetchDataCenterWrong(id) {
  try {
    const response = await fetch(`/api/datacenters/${id}`);
    return await response.json();
  } catch (error) {
    // DANGEROUS: Exposes API details, file paths, stack traces
    alert(`Error: ${error.stack}`);
    throw error;
  }
}
```

### Error Boundaries

**RULE:** Implement error boundaries to prevent information leakage.

```javascript
// components/ErrorBoundary.js
export class ErrorBoundary {
  constructor(element) {
    this.element = element;
    this.originalContent = element.innerHTML;
  }

  wrap(fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error);
      }
    };
  }

  handleError(error) {
    // Log detailed error (development only)
    if (import.meta.env.DEV) {
      console.error('Error boundary caught:', error);
    }

    // Show generic error to user
    this.element.innerHTML = `
      <div class="error-container">
        <h3>Something went wrong</h3>
        <p>We're working to fix this issue.</p>
        <button onclick="location.reload()">Refresh Page</button>
      </div>
    `;

    // Report to error tracking service (production)
    if (import.meta.env.PROD) {
      this.reportError(error);
    }
  }

  reportError(error) {
    // Send to error tracking service
    // (Sentry, Rollbar, etc.)
  }
}
```

---

## Logging & Monitoring

### Secure Logging

**RULE:** Never log sensitive data (API keys, user data, passwords).

```javascript
// utils/logger.js
export class SecureLogger {
  static SENSITIVE_PATTERNS = [
    /api[_-]?key/i,
    /token/i,
    /password/i,
    /secret/i,
    /authorization/i
  ];

  /**
   * Redact sensitive information
   */
  static redact(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const redacted = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      // Check if key is sensitive
      const isSensitive = this.SENSITIVE_PATTERNS.some(pattern =>
        pattern.test(key)
      );

      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        redacted[key] = this.redact(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Safe logging with automatic redaction
   */
  static log(level, message, data = {}) {
    const safeData = this.redact(data);

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: safeData
    };

    console[level](message, safeData);

    // Send to logging service if in production
    if (import.meta.env.PROD) {
      this.sendToLogService(logEntry);
    }
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
SecureLogger.info('Fetching cable data', {
  apiKey: 'sk-abc123', // Will be redacted
  endpoint: '/api/cables',
  cableId: 'cable-123' // Will be logged
});
// Output: { apiKey: '[REDACTED]', endpoint: '/api/cables', cableId: 'cable-123' }
```

---

## Testing Security

### Security Test Cases

**RULE:** Include security tests in your test suite.

```javascript
// tests/security/xss.test.js
import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizeText } from '../../src/utils/sanitizer';

describe('XSS Protection', () => {
  it('should remove script tags', () => {
    const dirty = '<p>Hello</p><script>alert("XSS")</script>';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toBe('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const dirty = '<img src=x onerror=alert(1)>';
    const clean = sanitizeHTML(dirty);
    expect(clean).not.toContain('onerror');
  });

  it('should escape text content', () => {
    const dirty = '<script>alert(1)</script>';
    const clean = sanitizeText(dirty);
    expect(clean).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});

// tests/security/apiKeys.test.js
describe('API Key Protection', () => {
  it('should not expose API keys in client code', () => {
    const sourceCode = fs.readFileSync('src/main.js', 'utf-8');

    // Check for hardcoded keys
    expect(sourceCode).not.toMatch(/sk-[a-zA-Z0-9]{32}/);
    expect(sourceCode).not.toMatch(/VITE_.*KEY.*=.*['"][^'"]+['"]/);
  });

  it('should load API keys from environment', () => {
    const apiKey = import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN;
    expect(apiKey).toBeDefined();
  });
});

// tests/security/inputValidation.test.js
describe('Input Validation', () => {
  it('should reject invalid search queries', () => {
    const validator = InputValidator;

    expect(() => validator.validateSearchQuery('<script>')).toThrow();
    expect(() => validator.validateSearchQuery('javascript:alert(1)')).toThrow();
    expect(() => validator.validateSearchQuery('a'.repeat(101))).toThrow();
  });

  it('should accept valid queries', () => {
    const validator = InputValidator;

    expect(validator.validateSearchQuery('submarine cable')).toBe('submarine cable');
    expect(validator.validateSearchQuery('  data center  ')).toBe('data center');
  });
});
```

---

## Code Review Checklist

### Security Review Checklist

Use this checklist for every pull request:

#### Authentication & Authorization
- [ ] No hardcoded credentials or API keys
- [ ] Secrets loaded from environment variables
- [ ] API keys not logged or exposed in errors
- [ ] Proper access control for sensitive operations

#### Input Validation
- [ ] All user input validated before use
- [ ] Numeric inputs checked for range
- [ ] URLs validated and sanitized
- [ ] File uploads restricted (if applicable)

#### Output Encoding
- [ ] Dynamic HTML sanitized with DOMPurify
- [ ] Use `textContent` for user data, not `innerHTML`
- [ ] URLs sanitized before use in href/src
- [ ] No eval() or Function() with user data

#### Data Protection
- [ ] No sensitive data in localStorage/sessionStorage
- [ ] HTTPS used for all API calls (production)
- [ ] No sensitive data in URL parameters
- [ ] Personal data handling complies with GDPR

#### Error Handling
- [ ] Errors don't expose sensitive information
- [ ] Generic error messages shown to users
- [ ] Detailed errors logged securely
- [ ] No stack traces shown to users (production)

#### Dependencies
- [ ] `npm audit` passes with no high/critical issues
- [ ] New dependencies evaluated for security
- [ ] Dependencies up to date
- [ ] License compatibility checked

#### API Security
- [ ] Rate limiting implemented
- [ ] API responses validated
- [ ] Timeouts configured
- [ ] Retry logic has exponential backoff

#### Testing
- [ ] Security test cases included
- [ ] XSS prevention tested
- [ ] Input validation tested
- [ ] Error handling tested

---

## Resources

### Security Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency scanning
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
- [Snyk](https://snyk.io/) - Continuous security monitoring

### References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**Questions?** Contact security@internet-infrastructure-map.dev
