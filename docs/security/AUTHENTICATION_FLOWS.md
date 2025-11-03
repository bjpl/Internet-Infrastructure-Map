# Authentication Flows & Access Control

> **Comprehensive documentation of authentication patterns and access control in Internet Infrastructure Map**

**Last Updated:** November 3, 2025
**Version:** 2.0
**Audience:** Developers, Security Teams, Architects

---

## Table of Contents

- [Overview](#overview)
- [Current Architecture](#current-architecture)
- [API Authentication](#api-authentication)
- [Environment-Based Security](#environment-based-security)
- [Access Control Patterns](#access-control-patterns)
- [Future User Authentication](#future-user-authentication)
- [Security Best Practices](#security-best-practices)

---

## Overview

The Internet Infrastructure Map currently operates as a client-side application without user authentication. This document covers:

1. **Current State (v2.0):** API authentication and environment-based security
2. **Future Considerations:** User authentication patterns for potential multi-user features

### Security Model

**Current (v2.0):**
- Public read-only application
- No user accounts
- No personal data collection
- API authentication for data sources
- Environment-based access control

**Future Considerations:**
- Optional user accounts
- Saved preferences
- Custom visualizations
- Social features

---

## Current Architecture

### Authentication Layers

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                        │
│  ┌────────────────────────────────────────────────┐    │
│  │       Application (No User Auth Required)       │    │
│  └───────────────────┬────────────────────────────┘    │
└────────────────────┬─┴──────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌───────────────┐          ┌──────────────┐
│  Environment  │          │  API Keys    │
│  Variables    │          │  (Hidden)    │
│  (Build Time) │          └──────┬───────┘
└───────────────┘                 │
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
            ┌───────────────┐          ┌──────────────┐
            │  PeeringDB    │          │  Cloudflare  │
            │  API (Auth)   │          │  Radar (Auth)│
            └───────────────┘          └──────────────┘
```

### No User Authentication

**Current Implementation:**
- Application is fully public
- No login required
- No user sessions
- No cookies (except necessary technical cookies)
- No personal data collected

**Privacy by Design:**
- GDPR/CCPA compliant
- No user tracking
- No analytics cookies
- Minimal data collection

---

## API Authentication

### Authentication Methods

#### 1. API Key Authentication (PeeringDB)

**Flow:**
```
1. Build Time:
   - Read API key from environment variable
   - Embed in application bundle (Vite replaces import.meta.env.*)

2. Runtime:
   - Application includes API key in requests
   - Key sent in Authorization header

3. API Provider:
   - Validates API key
   - Returns data or error
```

**Implementation:**
```javascript
// src/services/dataSources/PeeringDBAPI.js
export class PeeringDBAPI {
  constructor(config = {}) {
    // Load API key from environment
    this.apiKey = import.meta.env.VITE_PEERINGDB_API_KEY || config.apiKey;

    // Validate key format (without exposing it)
    if (this.apiKey && !this.isValidKeyFormat(this.apiKey)) {
      console.warn('PeeringDB API key format invalid');
      this.apiKey = null;
    }
  }

  isValidKeyFormat(key) {
    // Basic format validation
    return typeof key === 'string' && key.length >= 20;
  }

  async fetch(endpoint) {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add authentication if key available
    if (this.apiKey) {
      headers['Authorization'] = `Api-Key ${this.apiKey}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      });

      // Handle authentication errors
      if (response.status === 401) {
        console.error('PeeringDB authentication failed - invalid API key');
        this.apiKey = null; // Disable key for subsequent requests
        throw new AuthenticationError('Invalid API key');
      }

      if (response.status === 403) {
        console.error('PeeringDB authorization failed - insufficient permissions');
        throw new AuthorizationError('Insufficient permissions');
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Log without exposing API key
      console.error('PeeringDB API request failed:', {
        endpoint,
        error: error.message,
        // DO NOT log: headers, apiKey
      });
      throw error;
    }
  }
}
```

#### 2. Bearer Token Authentication (Cloudflare Radar)

**Flow:**
```
1. Token Generation:
   - User creates token in Cloudflare dashboard
   - Token has specific permissions (Radar Read)

2. Build Time:
   - Token loaded from environment
   - Embedded in application

3. Runtime:
   - Token sent in Authorization header
   - Cloudflare validates token and permissions
```

**Implementation:**
```javascript
// src/services/dataSources/CloudflareRadarAPI.js
export class CloudflareRadarAPI {
  constructor(config = {}) {
    this.token = import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN || config.token;

    if (this.token && !this.isValidTokenFormat(this.token)) {
      console.warn('Cloudflare Radar token format invalid');
      this.token = null;
    }
  }

  isValidTokenFormat(token) {
    // Validate token format
    return typeof token === 'string' && token.length >= 40;
  }

  async fetch(endpoint) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      throw new Error('Cloudflare Radar token required');
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers,
        signal: AbortSignal.timeout(5000)
      });

      // Handle token errors
      if (response.status === 401) {
        console.error('Cloudflare authentication failed - invalid token');
        this.token = null;
        throw new AuthenticationError('Invalid API token');
      }

      if (response.status === 403) {
        console.error('Cloudflare authorization failed - check token permissions');
        throw new AuthorizationError('Token lacks required permissions');
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError('Rate limit exceeded', retryAfter);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudflare Radar API request failed:', {
        endpoint,
        error: error.message,
      });
      throw error;
    }
  }
}
```

#### 3. Public Access (TeleGeography)

**Flow:**
```
1. No Authentication Required:
   - Data hosted on public GitHub
   - No API keys needed
   - Rate limited by GitHub

2. Runtime:
   - Direct fetch to GitHub raw content
   - No authentication headers
```

**Implementation:**
```javascript
// src/services/dataSources/TeleGeographyAPI.js
export class TeleGeographyAPI {
  constructor(config = {}) {
    this.baseURL = 'https://raw.githubusercontent.com/telegeography/www.submarinecablemap.com/master/web/public/api/v3';
    // No authentication required
  }

  async fetch(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      // GitHub rate limiting
      if (response.status === 429) {
        throw new RateLimitError('GitHub rate limit exceeded');
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TeleGeography API request failed:', {
        endpoint,
        error: error.message
      });
      throw error;
    }
  }
}
```

---

## Environment-Based Security

### Environment Variables

**Security through Configuration:**

```javascript
// Environment variable naming
VITE_PEERINGDB_API_KEY      // PeeringDB authentication
VITE_CLOUDFLARE_RADAR_TOKEN  // Cloudflare authentication
VITE_ENABLE_CACHE            // Feature flag
VITE_AUTO_REFRESH            // Feature flag
VITE_REFRESH_INTERVAL        // Configuration value
```

### Build-Time vs Runtime

**Build-Time Security (Current):**
```javascript
// Vite replaces import.meta.env.* at build time
const apiKey = import.meta.env.VITE_PEERINGDB_API_KEY;

// After build, this becomes:
const apiKey = "actual_key_value";

// ⚠️ Key is in the bundle
// ✅ But: Only works if build has the secret
// ✅ GitHub Actions injects secrets during build
```

**Security Implications:**
- API keys embedded in JavaScript bundle
- Keys visible to anyone who inspects the code
- Acceptable for client-side apps with read-only access
- Keys should have minimal permissions

**Runtime Security (Future Enhancement):**
```javascript
// Backend proxy handles authentication
const response = await fetch('/api/proxy/peeringdb/data-centers', {
  // No API key needed client-side
  // Server adds authentication
});

// Backend (future):
app.get('/api/proxy/peeringdb/*', async (req, res) => {
  const apiKey = process.env.PEERINGDB_API_KEY; // Server-side only
  const response = await fetch(`https://api.peeringdb.com${req.path}`, {
    headers: { 'Authorization': `Api-Key ${apiKey}` }
  });
  res.json(await response.json());
});
```

### Environment Separation

**Development:**
```bash
# .env (local development)
VITE_PEERINGDB_API_KEY=dev_key_read_only
VITE_CLOUDFLARE_RADAR_TOKEN=dev_token_low_limit
VITE_ENABLE_CACHE=true
VITE_AUTO_REFRESH=true
```

**Production:**
```yaml
# GitHub Actions (production)
env:
  VITE_PEERINGDB_API_KEY: ${{ secrets.PEERINGDB_PROD_KEY }}
  VITE_CLOUDFLARE_RADAR_TOKEN: ${{ secrets.CLOUDFLARE_PROD_TOKEN }}
  VITE_ENABLE_CACHE: true
  VITE_AUTO_REFRESH: true
```

**Security Benefits:**
- Different keys per environment
- Production keys have higher rate limits
- Compromised dev key doesn't affect production
- Keys rotated independently

---

## Access Control Patterns

### API Permission Levels

#### PeeringDB Permissions

```javascript
// API key permissions (configured at provider)
const permissions = {
  read: {
    datacenters: true,   // ✅ Enabled
    networks: true,       // ✅ Enabled
    facilities: true      // ✅ Enabled
  },
  write: {
    datacenters: false,  // ❌ Disabled (not needed)
    networks: false,      // ❌ Disabled
    facilities: false     // ❌ Disabled
  },
  admin: false           // ❌ Disabled
};
```

**Principle of Least Privilege:**
- Only request read permissions
- No write access needed
- No admin access needed
- Minimize attack surface if key compromised

#### Cloudflare Radar Permissions

```javascript
// Token permissions (configured in Cloudflare dashboard)
const permissions = {
  radar: {
    read: true,          // ✅ Enabled
    write: false         // ❌ Disabled
  },
  account: false,        // ❌ Disabled
  zones: false           // ❌ Disabled
};
```

### Rate Limiting as Access Control

**Client-Side Rate Limiting:**

```javascript
// services/rateLimiter.js
export class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async checkAccess() {
    const now = Date.now();
    const windowStart = now - this.timeWindow;

    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);

    // Check if over limit
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);

      throw new AccessDeniedError(
        `Rate limit exceeded. Access denied for ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    // Grant access
    this.requests.push(now);
    return true;
  }
}

// Usage
const peeringdbLimiter = new RateLimiter(100, 3600000); // 100/hour

async function fetchDataCenter(id) {
  // Check access before making request
  await peeringdbLimiter.checkAccess();

  // Proceed with request
  return await api.fetch(`/datacenters/${id}`);
}
```

### Feature Flags

**Environment-Based Feature Control:**

```javascript
// config/features.js
export const FEATURES = {
  // Cache control
  enableCache: import.meta.env.VITE_ENABLE_CACHE === 'true',

  // Auto-refresh
  enableAutoRefresh: import.meta.env.VITE_AUTO_REFRESH === 'true',

  // Refresh interval
  refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '300000'),

  // Debug mode (development only)
  debug: import.meta.env.DEV,

  // Future features (disabled for now)
  enableUserAccounts: false,
  enableSocialSharing: false,
  enableCustomThemes: false
};

// Usage
if (FEATURES.enableCache) {
  // Use cached data
} else {
  // Always fetch fresh data
}
```

---

## Future User Authentication

### Potential User Authentication Patterns

**If user accounts are added in future versions:**

#### 1. OAuth 2.0 / OpenID Connect

**Recommended approach for user authentication:**

```javascript
// Future implementation example
import { OAuth2Client } from '@auth/core';

class UserAuth {
  constructor() {
    this.client = new OAuth2Client({
      clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
      redirectUri: `${window.location.origin}/auth/callback`,
      scopes: ['openid', 'email', 'profile']
    });
  }

  async login() {
    // Redirect to OAuth provider
    const authUrl = await this.client.generateAuthUrl();
    window.location.href = authUrl;
  }

  async handleCallback(code) {
    // Exchange code for token
    const tokens = await this.client.exchangeCode(code);

    // Store tokens securely
    this.storeTokens(tokens);

    return tokens;
  }

  storeTokens(tokens) {
    // Store in memory or httpOnly cookies
    // NEVER localStorage for sensitive tokens
    sessionStorage.setItem('access_token', tokens.access_token);
  }

  async getUser() {
    const token = sessionStorage.getItem('access_token');
    if (!token) return null;

    // Verify token and get user info
    return await this.client.getUserInfo(token);
  }

  logout() {
    sessionStorage.removeItem('access_token');
    // Redirect to logout URL
  }
}
```

#### 2. JWT-Based Authentication

**For custom user management:**

```javascript
// Future implementation example
class JWTAuth {
  constructor(apiURL) {
    this.apiURL = apiURL;
  }

  async login(email, password) {
    // MUST be over HTTPS
    const response = await fetch(`${this.apiURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // For httpOnly cookies
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    // Token stored in httpOnly cookie by server
    // Client receives user data only
    return await response.json();
  }

  async refreshToken() {
    // Refresh token stored in httpOnly cookie
    const response = await fetch(`${this.apiURL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  }

  async getCurrentUser() {
    const response = await fetch(`${this.apiURL}/auth/me`, {
      credentials: 'include'
    });

    if (response.status === 401) {
      return null; // Not authenticated
    }

    return await response.json();
  }

  async logout() {
    await fetch(`${this.apiURL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }
}
```

#### 3. Role-Based Access Control (RBAC)

**Future permission system:**

```javascript
// Future implementation
const ROLES = {
  VIEWER: 'viewer',
  CONTRIBUTOR: 'contributor',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

const PERMISSIONS = {
  // Viewing
  VIEW_PUBLIC_DATA: 'view:public',
  VIEW_ANALYTICS: 'view:analytics',

  // Contributing
  SUBMIT_SUGGESTIONS: 'submit:suggestions',
  CREATE_CUSTOM_VIEWS: 'create:views',

  // Moderation
  APPROVE_CONTRIBUTIONS: 'approve:contributions',
  MODERATE_COMMENTS: 'moderate:comments',

  // Administration
  MANAGE_USERS: 'manage:users',
  MANAGE_API_KEYS: 'manage:api_keys',
  VIEW_AUDIT_LOGS: 'view:audit_logs'
};

class AccessControl {
  constructor(user) {
    this.user = user;
    this.rolePermissions = {
      [ROLES.VIEWER]: [
        PERMISSIONS.VIEW_PUBLIC_DATA
      ],
      [ROLES.CONTRIBUTOR]: [
        PERMISSIONS.VIEW_PUBLIC_DATA,
        PERMISSIONS.SUBMIT_SUGGESTIONS,
        PERMISSIONS.CREATE_CUSTOM_VIEWS
      ],
      [ROLES.MODERATOR]: [
        PERMISSIONS.VIEW_PUBLIC_DATA,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.APPROVE_CONTRIBUTIONS,
        PERMISSIONS.MODERATE_COMMENTS
      ],
      [ROLES.ADMIN]: Object.values(PERMISSIONS) // All permissions
    };
  }

  hasPermission(permission) {
    if (!this.user) return false;

    const rolePermissions = this.rolePermissions[this.user.role] || [];
    return rolePermissions.includes(permission);
  }

  requirePermission(permission) {
    if (!this.hasPermission(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }
}

// Usage
const acl = new AccessControl(currentUser);

if (acl.hasPermission(PERMISSIONS.CREATE_CUSTOM_VIEWS)) {
  // Show custom view editor
}

// Or throw error if permission required
acl.requirePermission(PERMISSIONS.MANAGE_USERS);
doAdminAction();
```

---

## Security Best Practices

### Current Implementation

#### 1. API Key Security

**✅ DO:**
- Store keys in environment variables
- Use different keys for dev/prod
- Rotate keys every 90 days
- Use read-only keys
- Implement rate limiting
- Log key usage (without exposing keys)

**❌ DON'T:**
- Hardcode keys in source code
- Commit `.env` files
- Log API keys
- Use production keys in development
- Share keys publicly
- Give keys unnecessary permissions

#### 2. HTTPS Enforcement

```javascript
// Redirect HTTP to HTTPS (production)
if (import.meta.env.PROD && window.location.protocol === 'http:') {
  window.location.protocol = 'https:';
}

// Use HTTPS for all API requests
const API_BASE_URL = 'https://api.example.com'; // Never http://
```

#### 3. Secure Headers

```javascript
// Content Security Policy
// Prevents XSS and other injection attacks
const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self'
    https://api.cloudflare.com
    https://api.peeringdb.com
    https://raw.githubusercontent.com;
  font-src 'self';
`.replace(/\s+/g, ' ').trim();
```

### Future User Authentication

#### 1. Token Storage

**✅ RECOMMENDED:**
- HttpOnly cookies (best for web)
- Session storage (acceptable for short sessions)
- Memory only (most secure, lost on refresh)

**❌ AVOID:**
- localStorage (vulnerable to XSS)
- Cookies without HttpOnly flag
- URL parameters
- Hidden form fields

#### 2. Password Security

```javascript
// Future implementation (backend)
import bcrypt from 'bcrypt';

async function hashPassword(password) {
  // Use bcrypt with high cost factor
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Password requirements
const PASSWORD_POLICY = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true
};
```

#### 3. Session Management

```javascript
// Future implementation
class SessionManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.lastActivity = Date.now();
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  isExpired() {
    return Date.now() - this.lastActivity > this.sessionTimeout;
  }

  async refreshSession() {
    if (this.isExpired()) {
      await this.logout();
      throw new Error('Session expired');
    }

    this.updateActivity();
  }
}
```

---

## Related Documentation

- **[SECURITY.md](../../SECURITY.md)** - Security policy
- **[SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)** - Developer guidelines
- **[API_SECURITY.md](./API_SECURITY.md)** - API security details
- **[DEPLOYMENT_SECURITY.md](./DEPLOYMENT_SECURITY.md)** - Production security

---

**Questions?** Contact security@internet-infrastructure-map.dev
