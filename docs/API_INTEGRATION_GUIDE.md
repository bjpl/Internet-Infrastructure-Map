# API Integration Guide

This guide explains how to set up and use the live API integrations for the Internet Infrastructure Visualization.

## Table of Contents

- [Quick Start](#quick-start)
- [API Providers](#api-providers)
- [Configuration](#configuration)
- [Rate Limits](#rate-limits)
- [CORS Issues](#cors-issues)
- [Data Confidence Levels](#data-confidence-levels)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Get API Keys (Optional but Recommended)

#### Cloudflare Radar (Required for attack/traffic data)

1. Sign up at https://dash.cloudflare.com/sign-up
2. Navigate to https://dash.cloudflare.com/profile/api-tokens
3. Click "Create Token"
4. Select "Cloudflare Radar Read" template
5. Copy token to `VITE_CLOUDFLARE_RADAR_TOKEN` in `.env`

#### PeeringDB (Optional - increases rate limits)

1. Register at https://www.peeringdb.com/register
2. Navigate to https://www.peeringdb.com/account/api_keys
3. Create new API key
4. Copy key to `VITE_PEERINGDB_API_KEY` in `.env`

### 3. Start Development Server

```bash
npm run dev
```

The application will automatically:
- Try live APIs first
- Fall back to cached data if APIs fail
- Fall back to estimated data if cache is stale
- Display confidence levels for all data

---

## API Providers

### 1. PeeringDB API

**Purpose:** Internet Exchange Points (IXPs) and data centers

**Endpoints Used:**
- `/api/ix` - Internet Exchange Points
- `/api/fac` - Facilities (data centers)
- `/api/netfac` - Network-to-facility relationships

**Rate Limits:**
- Public API: 100 requests/hour
- With API key: 1000 requests/hour

**Documentation:** https://docs.peeringdb.com/api/

**Data Confidence:** 0.98 (highly reliable, community-maintained)

### 2. TeleGeography Submarine Cable Map

**Purpose:** Submarine cable infrastructure

**Data Source:**
```
https://github.com/telegeography/www.submarinecablemap.com/raw/master/web/public/api/v3/cable/cable.json
```

**Rate Limits:** None (public GitHub repo)

**Update Frequency:** Monthly

**Documentation:** https://github.com/telegeography/www.submarinecablemap.com

**Data Confidence:** 0.85 (industry standard, static data)

### 3. Cloudflare Radar API

**Purpose:** Real-time attack data and traffic patterns

**Endpoints Used:**
- `/radar/attacks/layer3/timeseries_groups` - DDoS attacks
- `/radar/traffic` - Traffic patterns
- `/radar/bgp/routes` - BGP route changes

**Rate Limits:**
- Free tier: 300 requests/5 minutes
- Pro tier: 1000 requests/5 minutes

**Documentation:** https://developers.cloudflare.com/radar/

**Data Confidence:** 0.95 (real-time, from Cloudflare's network)

---

## Configuration

### Environment Variables

Edit `.env` file:

```bash
# Minimum configuration (uses public APIs)
VITE_AUTO_REFRESH=true
VITE_ENABLE_CACHE=true

# Recommended configuration (with API keys)
VITE_PEERINGDB_API_KEY=your_key_here
VITE_CLOUDFLARE_RADAR_TOKEN=your_token_here
VITE_REFRESH_INTERVAL=300000  # 5 minutes
```

### Programmatic Configuration

```javascript
import { DataOrchestrator } from './services/dataOrchestrator.js';

const orchestrator = new DataOrchestrator({
  enableAutoRefresh: true,
  refreshInterval: 300000, // 5 minutes
  enableCache: true,

  // API-specific configuration
  peeringdb: {
    apiKey: import.meta.env.VITE_PEERINGDB_API_KEY
  },
  cloudflareRadar: {
    token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN
  },

  // CORS proxy (if needed)
  corsProxy: import.meta.env.VITE_CORS_PROXY
});
```

---

## Rate Limits

### PeeringDB

**Public API:**
- 100 requests per hour
- Resets every hour

**With API Key:**
- 1000 requests per hour
- Resets every hour

**Headers:**
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit resets

**Strategy:**
- Cache aggressively (7-30 days)
- Batch requests when possible
- Implement exponential backoff on 429 errors

### Cloudflare Radar

**Free Tier:**
- 300 requests per 5 minutes
- No daily limit

**Rate Limit Headers:**
- `cf-ray`: Request ID
- `x-ratelimit-limit`: Maximum requests
- `x-ratelimit-remaining`: Remaining requests

**Strategy:**
- Poll real-time data every 60 seconds
- Cache static data indefinitely
- Implement request throttling

### TeleGeography

**No Authentication Required**

**Limits:**
- Subject to GitHub raw content limits
- Approximately 1000 requests/hour

**Strategy:**
- Cache for 30 days (data updates monthly)
- Use conditional requests (If-Modified-Since)

---

## CORS Issues

### Problem

Browser security prevents direct API calls to some domains.

### Solutions

#### Option 1: Vite Proxy (Development Only)

Edit `vite.config.js`:

```javascript
export default {
  server: {
    proxy: {
      '/api/peeringdb': {
        target: 'https://api.peeringdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/peeringdb/, '/api')
      },
      '/api/cloudflare': {
        target: 'https://api.cloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cloudflare/, '')
      }
    }
  }
};
```

#### Option 2: Public CORS Proxy (Testing Only)

```javascript
const corsProxy = 'https://corsproxy.io/?';
const url = corsProxy + encodeURIComponent('https://api.peeringdb.com/api/ix');
```

**Warning:** Public proxies are rate-limited and unreliable.

#### Option 3: Serverless Function (Recommended for Production)

Create `/api/proxy.js` (Vercel/Netlify):

```javascript
export default async function handler(req, res) {
  const { url, headers } = req.body;

  const response = await fetch(url, {
    headers: {
      'Authorization': headers.authorization,
      'User-Agent': 'Internet-Infrastructure-Map/1.0'
    }
  });

  const data = await response.json();
  res.json(data);
}
```

#### Option 4: Backend Service

Run a simple Node.js proxy:

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});

app.listen(3001);
```

---

## Data Confidence Levels

The system tracks confidence levels for all data:

### Confidence Scale (0.0 - 1.0)

- **0.98 - 1.0**: Real-time, verified data (PeeringDB live)
- **0.90 - 0.97**: Real-time, estimated (Cloudflare Radar)
- **0.80 - 0.89**: Recent cached data (< 24 hours)
- **0.60 - 0.79**: Stale cached data (< 7 days)
- **0.40 - 0.59**: Static reference data (TeleGeography)
- **0.20 - 0.39**: Estimated/interpolated data
- **0.00 - 0.19**: Placeholder/mock data

### Freshness Indicators

- **realtime**: Live API data (< 5 minutes)
- **live**: Recent API data (< 1 hour)
- **cache**: Cached data within TTL
- **stale**: Cached data past TTL
- **static**: Reference data (updated monthly/yearly)
- **estimated**: Algorithmically generated

### Visual Indicators

The UI displays confidence through:

1. **Color intensity**: Higher confidence = brighter colors
2. **Glow effects**: Real-time data glows
3. **Opacity**: Lower confidence = more transparent
4. **Info badges**: Hover to see confidence score

---

## Troubleshooting

### API Key Not Working

**PeeringDB:**
```bash
# Test API key
curl -H "Authorization: Api-Key YOUR_KEY" https://api.peeringdb.com/api/ix

# Check for error response
```

**Cloudflare:**
```bash
# Test token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.cloudflare.com/client/v4/radar/attacks/layer3/timeseries_groups
```

### Rate Limit Exceeded

**Symptoms:**
- HTTP 429 errors
- "Rate limit exceeded" messages

**Solutions:**
1. Increase `VITE_REFRESH_INTERVAL`
2. Enable caching: `VITE_ENABLE_CACHE=true`
3. Reduce concurrent requests
4. Get API keys for higher limits

### CORS Errors

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- "blocked by CORS policy" messages

**Solutions:**
1. Use Vite proxy in development
2. Deploy serverless function for production
3. Enable CORS proxy (temporary fix)

### No Data Displayed

**Check Console:**
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Check orchestrator health
const health = orchestrator.getHealth();
console.log('Health:', health);

// Check statistics
const stats = orchestrator.getStatistics();
console.log('Stats:', stats);
```

**Verify:**
1. API keys are set correctly
2. Network requests aren't blocked
3. Browser console for errors
4. Fallback data is working

### Stale Data

**Force Refresh:**
```javascript
// In browser console
await orchestrator.refreshData('cables');
await orchestrator.refreshData('ixps');
await orchestrator.refreshData('datacenters');
```

**Clear Cache:**
```javascript
// Clear all cached data
localStorage.clear();
sessionStorage.clear();
```

### Circuit Breaker Triggered

**Symptoms:**
- "Circuit breaker OPEN" errors
- No API calls being made

**Solution:**
```javascript
// Reset circuit breaker
orchestrator.peeringdb.client.resetCircuit();
orchestrator.cloudflareRadar.client.resetCircuit();
```

---

## Performance Optimization

### Caching Strategy

```javascript
// Aggressive caching for static data
cables: 30 days TTL
ixps: 7 days TTL
datacenters: 7 days TTL

// Minimal caching for real-time data
attacks: 60 seconds TTL
traffic: 5 minutes TTL
```

### Request Batching

The system automatically batches requests:

```javascript
// These 3 requests execute as 1
const [cables, ixps, dcs] = await Promise.all([
  orchestrator.getCables(),
  orchestrator.getIXPs(),
  orchestrator.getDataCenters()
]);
```

### Lazy Loading

Load data on-demand:

```javascript
// Only load when user zooms to region
globe.onZoom(async (region) => {
  if (region.zoomLevel > 3) {
    const localData = await orchestrator.getIXPs({
      country: region.country
    });
  }
});
```

---

## API Response Examples

### PeeringDB IXP Response

```json
{
  "data": [{
    "id": 1,
    "name": "DE-CIX Frankfurt",
    "name_long": "Deutscher Commercial Internet Exchange",
    "city": "Frankfurt",
    "country": "DE",
    "latitude": 50.1109,
    "longitude": 8.6821,
    "net_count": 1030,
    "website": "https://www.de-cix.net",
    "updated": "2024-01-15T10:30:00Z"
  }]
}
```

### TeleGeography Cable Response

```json
{
  "cable_id": "sea-us",
  "name": "SEA-US",
  "owners": ["AT&T", "Antel", "Claro"],
  "ready_for_service": "2017",
  "length": 10556,
  "design_capacity": "64 Tbps",
  "landing_points": [
    {
      "id": 1,
      "name": "Hermosa Beach, California",
      "latitude": 33.8622,
      "longitude": -118.3956,
      "country": "US"
    }
  ]
}
```

### Cloudflare Radar Attack Response

```json
{
  "success": true,
  "result": {
    "meta": {
      "dateRange": {
        "startTime": "2024-01-15T00:00:00Z",
        "endTime": "2024-01-15T01:00:00Z"
      }
    },
    "timeseries": [{
      "timestamp": "2024-01-15T00:00:00Z",
      "values": {
        "udp": 12500,
        "tcp": 8300,
        "syn": 5200
      }
    }]
  }
}
```

---

## Support

For issues with:
- **PeeringDB API**: support@peeringdb.com
- **TeleGeography Data**: https://github.com/telegeography/www.submarinecablemap.com/issues
- **Cloudflare Radar**: https://developers.cloudflare.com/radar/get-started/
- **This Application**: [Your GitHub Issues Page]

---

## License Compliance

### PeeringDB
- License: CC0 1.0 Universal
- Attribution appreciated but not required
- Data may be used freely

### TeleGeography
- License: CC BY-SA 4.0
- Attribution required
- Share-alike requirement

### Cloudflare Radar
- API terms: https://www.cloudflare.com/terms/
- Free tier for non-commercial use
- Attribution appreciated

**Attribution Example:**

```html
<footer>
  Data sources:
  <a href="https://www.peeringdb.com">PeeringDB</a>,
  <a href="https://www.submarinecablemap.com">TeleGeography</a>,
  <a href="https://radar.cloudflare.com">Cloudflare Radar</a>
</footer>
```
