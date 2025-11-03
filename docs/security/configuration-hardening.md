# Configuration Security Hardening Report

**Date:** 2025-11-03
**Project:** Live Internet Infrastructure Map
**Severity:** MEDIUM to HIGH
**Status:** Recommendations Provided

---

## Executive Summary

This report analyzes the security posture of configuration files across the Internet Infrastructure Map project. Several critical security improvements are needed to protect against common web application vulnerabilities, information disclosure, and deployment security issues.

**Key Findings:**
- ✅ Good: No credentials found in `.env.example`
- ⚠️ Medium Risk: Source maps exposed in production builds
- ⚠️ Medium Risk: No Content Security Policy (CSP) implemented
- ⚠️ Medium Risk: Missing security headers
- ⚠️ Low Risk: Dev server proxy lacks rate limiting
- ✅ Good: Environment variables properly prefixed with `VITE_`

---

## Detailed Findings

### 1. Vite Configuration (vite.config.js)

#### 1.1 Source Map Exposure (MEDIUM RISK)

**Current Configuration:**
```javascript
build: {
  sourcemap: true  // ⚠️ Exposes source code in production
}
```

**Risk:** Source maps in production expose your complete source code, including:
- Business logic and algorithms
- API endpoint structures
- Client-side validation logic
- Comments that may contain sensitive information
- File structure and architecture

**Recommendation:**
```javascript
build: {
  sourcemap: process.env.NODE_ENV !== 'production'  // Only in development
  // OR use hidden source maps for error tracking:
  // sourcemap: 'hidden'  // For services like Sentry
}
```

#### 1.2 Development Server Proxy Security (LOW-MEDIUM RISK)

**Current Configuration:**
```javascript
proxy: {
  '/api/peeringdb': {
    target: 'https://api.peeringdb.com',
    changeOrigin: true,
    // ⚠️ No rate limiting, request validation, or error handling
  }
}
```

**Risks:**
- Proxy can be abused for API rate limit exhaustion
- No request validation or sanitization
- Console logging in production may expose sensitive data
- No timeout configuration

**Recommendations:**
```javascript
proxy: {
  '/api/peeringdb': {
    target: 'https://api.peeringdb.com',
    changeOrigin: true,
    timeout: 30000,  // 30 second timeout
    rewrite: (path) => path.replace(/^\/api\/peeringdb/, '/api'),
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, res) => {
        // Don't log full error in production
        if (process.env.NODE_ENV === 'development') {
          console.error('PeeringDB proxy error:', err);
        }
        res.status(502).json({ error: 'Proxy error' });
      });
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        // Sanitize headers
        proxyReq.removeHeader('cookie');
        proxyReq.removeHeader('authorization');

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Proxying:', req.method, req.url);
        }
      });
    }
  }
}
```

#### 1.3 Build Configuration Hardening

**Additional Recommendations:**

```javascript
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: process.env.NODE_ENV !== 'production',

  // Minification and obfuscation
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,  // Remove console.* in production
      drop_debugger: true   // Remove debugger statements
    },
    format: {
      comments: false  // Remove all comments
    }
  },

  // Rollup security options
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-three': ['three'],
        'vendor-d3': ['d3'],
        'vendor-globe': ['globe.gl']
      },
      // Randomize chunk names for security through obscurity
      chunkFileNames: 'assets/[name]-[hash].js',
      entryFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash].[ext]'
    }
  }
}
```

---

### 2. Environment Configuration (.env.example)

#### 2.1 Current Status: GOOD ✅

The `.env.example` file correctly:
- Contains no real credentials
- Provides clear documentation
- Uses proper VITE_ prefix for client-side variables
- Includes helpful comments and links

#### 2.2 Recommended Additions

Add security-related environment variables:

```bash
# =============================================================================
# Security Configuration
# =============================================================================

# Content Security Policy (CSP) Nonce
# Generated per-request for inline scripts (server-side only)
VITE_CSP_NONCE=

# Enable/disable security headers in production
VITE_SECURITY_HEADERS_ENABLED=true

# Allowed origins for CORS (production)
VITE_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API rate limiting (requests per minute)
VITE_RATE_LIMIT_RPM=60

# Enable/disable logging (disable in production)
VITE_ENABLE_LOGGING=false

# Sentry DSN for error tracking (optional)
VITE_SENTRY_DSN=

# Session timeout (milliseconds)
VITE_SESSION_TIMEOUT=1800000

# =============================================================================
# Security Headers Configuration
# =============================================================================

# Enable HTTPS-only mode
VITE_FORCE_HTTPS=true

# Enable Subresource Integrity (SRI) checks
VITE_ENABLE_SRI=true
```

---

### 3. HTML Security Headers (index.html)

#### 3.1 Missing Security Headers (HIGH RISK)

**Current Status:** No security headers or meta tags present in HTML

**Risks:**
- Clickjacking attacks (no X-Frame-Options)
- XSS attacks (no Content Security Policy)
- MIME-type confusion attacks (no X-Content-Type-Options)
- Mixed content issues (no upgrade-insecure-requests)

**Recommendations:**

Add the following meta tags to `<head>` section:

```html
<!-- Security Headers via Meta Tags -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta name="referrer" content="strict-origin-when-cross-origin">

<!-- Content Security Policy (CSP) -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.peeringdb.com https://api.cloudflare.com https://raw.githubusercontent.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
">

<!-- Permissions Policy (formerly Feature Policy) -->
<meta http-equiv="Permissions-Policy" content="
  geolocation=(),
  microphone=(),
  camera=(),
  payment=(),
  usb=(),
  magnetometer=(),
  gyroscope=(),
  accelerometer=()
">
```

#### 3.2 Subresource Integrity (SRI) Missing

**Current External Resources:**
```html
<!-- ⚠️ Missing SRI attributes -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Recommendations:**

```html
<!-- With SRI for integrity verification -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
  integrity="sha512-[GENERATE-HASH]"
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
>

<!-- Google Fonts: Consider self-hosting for better security and performance -->
<!-- If using CDN, add crossorigin attribute -->
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
  crossorigin="anonymous"
>
```

---

### 4. MCP Configuration (.mcp.json)

#### 4.1 Current Status: GOOD ✅

The `.mcp.json` file correctly:
- Contains no credentials
- Uses empty `env` objects (good practice)
- No sensitive information exposed

#### 4.2 Recommendations:

If environment variables are needed, use references:

```json
{
  "mcpServers": {
    "claude-flow": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "claude-flow@alpha", "mcp", "start"],
      "env": {
        "NODE_ENV": "${NODE_ENV}",
        "LOG_LEVEL": "${CLAUDE_FLOW_LOG_LEVEL:-info}"
      }
    }
  }
}
```

---

### 5. Claude Flow Configuration (claude-flow.config.json)

#### 5.1 Security Considerations

**Current Configuration:**
```json
{
  "performance": {
    "telemetryLevel": "detailed"  // ⚠️ May expose sensitive data
  }
}
```

**Recommendations:**

```json
{
  "features": {
    "autoTopologySelection": true,
    "parallelExecution": true,
    "neuralTraining": true,
    "bottleneckAnalysis": true,
    "smartAutoSpawning": true,
    "selfHealingWorkflows": true,
    "crossSessionMemory": true,
    "githubIntegration": true
  },
  "performance": {
    "maxAgents": 10,
    "defaultTopology": "hierarchical",
    "executionStrategy": "parallel",
    "tokenOptimization": true,
    "cacheEnabled": true,
    "telemetryLevel": "summary"  // Changed from "detailed" for production
  },
  "security": {
    "sanitizeInputs": true,
    "validateOutputs": true,
    "maxExecutionTime": 300000,
    "memoryLimit": "2GB"
  }
}
```

---

## Implementation Priority

### 🔴 Critical (Immediate Action Required)

1. **Implement Content Security Policy**
   - Add CSP meta tag to HTML
   - Configure CSP for all external resources
   - Test thoroughly in development

2. **Disable Source Maps in Production**
   - Update vite.config.js
   - Test production build

### 🟡 High Priority (Within 1 Week)

3. **Add Security Headers**
   - Implement X-Frame-Options
   - Add X-Content-Type-Options
   - Configure Referrer-Policy

4. **Implement SRI for External Resources**
   - Generate SRI hashes
   - Add integrity attributes
   - Consider self-hosting critical resources

### 🟢 Medium Priority (Within 2 Weeks)

5. **Harden Development Server**
   - Add rate limiting to proxies
   - Sanitize proxy requests
   - Remove sensitive logging

6. **Environment Variable Security**
   - Add security-related env vars
   - Document security settings
   - Create production .env template

---

## Server-Side Configuration (For Production Deployment)

If deploying behind a reverse proxy (Nginx, Apache, Cloudflare), configure security headers server-side:

### Nginx Configuration:

```nginx
# Security Headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Strict Transport Security (HSTS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.peeringdb.com https://api.cloudflare.com https://raw.githubusercontent.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;" always;

# Rate Limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req zone=api_limit burst=20 nodelay;

# Hide Server Information
server_tokens off;
more_clear_headers Server;
```

### Apache Configuration (.htaccess):

```apache
# Security Headers
Header set X-Frame-Options "DENY"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"

# HSTS
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

# CSP
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.peeringdb.com https://api.cloudflare.com https://raw.githubusercontent.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"

# Hide Server Information
ServerTokens Prod
ServerSignature Off
```

---

## Content Security Policy (CSP) Details

### Current External Resource Domains:

**Allowed in CSP:**
- `https://fonts.googleapis.com` - Google Fonts CSS
- `https://fonts.gstatic.com` - Google Fonts files
- `https://cdnjs.cloudflare.com` - Highlight.js styles
- `https://api.peeringdb.com` - PeeringDB API
- `https://api.cloudflare.com` - Cloudflare Radar API
- `https://raw.githubusercontent.com` - TeleGeography data

### CSP Violation Reporting:

Add a report-uri to monitor CSP violations:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.peeringdb.com https://api.cloudflare.com https://raw.githubusercontent.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  report-uri /csp-violation-report-endpoint;
">
```

---

## Rate Limiting Configuration

### Client-Side Rate Limiting

Create a rate limiter utility:

```javascript
// src/utils/rateLimiter.js
class RateLimiter {
  constructor(maxRequests = 60, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  canMakeRequest(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    // Remove old requests outside time window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  getRemainingRequests(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

export default RateLimiter;
```

---

## Session Security

### Session Management Configuration

```javascript
// src/utils/sessionManager.js
const SESSION_TIMEOUT = import.meta.env.VITE_SESSION_TIMEOUT || 1800000; // 30 minutes

class SessionManager {
  constructor() {
    this.lastActivity = Date.now();
    this.sessionId = this.generateSessionId();
    this.startInactivityTimer();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  isSessionExpired() {
    return Date.now() - this.lastActivity > SESSION_TIMEOUT;
  }

  startInactivityTimer() {
    setInterval(() => {
      if (this.isSessionExpired()) {
        this.handleSessionExpiry();
      }
    }, 60000); // Check every minute
  }

  handleSessionExpiry() {
    // Clear sensitive data
    sessionStorage.clear();

    // Notify user
    console.warn('Session expired due to inactivity');

    // Optionally reload or redirect
    // window.location.reload();
  }
}

export default SessionManager;
```

---

## Security Checklist for Production Deployment

### Pre-Deployment Checklist:

- [ ] Source maps disabled in production build
- [ ] Console.log statements removed from production
- [ ] Environment variables properly configured
- [ ] No credentials in code or config files
- [ ] Security headers implemented (CSP, X-Frame-Options, etc.)
- [ ] SRI attributes added to external resources
- [ ] Rate limiting configured
- [ ] HTTPS enforced (HSTS header)
- [ ] Error messages sanitized (no stack traces in production)
- [ ] Dependencies updated to latest secure versions
- [ ] Audit logs configured for API access
- [ ] CORS properly configured
- [ ] Session management implemented
- [ ] Input validation on all user inputs
- [ ] Output encoding to prevent XSS

### Post-Deployment Monitoring:

- [ ] Monitor CSP violation reports
- [ ] Track rate limiting violations
- [ ] Monitor for unusual API access patterns
- [ ] Regular security dependency audits (`npm audit`)
- [ ] Monitor error logs for security issues
- [ ] Regular penetration testing
- [ ] Security header verification with tools like Security Headers (securityheaders.com)

---

## Testing Security Configuration

### Tools for Security Testing:

1. **Security Headers Check:**
   - https://securityheaders.com/
   - https://observatory.mozilla.org/

2. **CSP Validator:**
   - https://csp-evaluator.withgoogle.com/

3. **SSL/TLS Configuration:**
   - https://www.ssllabs.com/ssltest/

4. **Dependency Vulnerabilities:**
   ```bash
   npm audit
   npm audit fix
   ```

5. **OWASP ZAP:** Free security testing tool
   - https://www.zaproxy.org/

---

## Additional Recommendations

### 1. Implement CORS Properly

If deploying an API backend, configure CORS explicitly:

```javascript
// Example for Express.js backend
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### 2. Implement Request Validation

Validate all incoming data:

```javascript
// src/utils/validator.js
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
    .slice(0, 1000); // Limit length
}

export function validateApiKey(key) {
  // Validate API key format
  return /^[A-Za-z0-9_-]{32,}$/.test(key);
}
```

### 3. Implement Error Handling

Sanitize error messages in production:

```javascript
// src/utils/errorHandler.js
export function handleError(error) {
  if (import.meta.env.PROD) {
    // Generic error for production
    return {
      message: 'An error occurred. Please try again later.',
      code: error.code || 'UNKNOWN_ERROR'
    };
  } else {
    // Detailed error for development
    return {
      message: error.message,
      stack: error.stack,
      code: error.code
    };
  }
}
```

### 4. Implement Logging

Secure logging with sensitive data redaction:

```javascript
// src/utils/logger.js
class Logger {
  static log(level, message, data = {}) {
    if (import.meta.env.VITE_ENABLE_LOGGING !== 'true' && import.meta.env.PROD) {
      return; // No logging in production unless explicitly enabled
    }

    const sanitizedData = this.sanitizeData(data);
    const timestamp = new Date().toISOString();

    console[level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, sanitizedData);
  }

  static sanitizeData(data) {
    const sanitized = { ...data };

    // Redact sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
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

export default Logger;
```

---

## Conclusion

This configuration security assessment identified several areas requiring attention to achieve production-grade security. The most critical items are:

1. **Implementing Content Security Policy** to prevent XSS attacks
2. **Disabling source maps in production** to protect intellectual property
3. **Adding security headers** to prevent common web vulnerabilities
4. **Implementing rate limiting** to prevent abuse

Following these recommendations will significantly improve the security posture of the Internet Infrastructure Map application.

---

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Content Security Policy Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- Security Headers: https://securityheaders.com/
- Vite Security: https://vitejs.dev/guide/env-and-mode.html
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework

---

**Report Generated:** 2025-11-03
**Next Review:** 2025-12-03 (or upon significant configuration changes)
