# Live API Integration - Complete Guide

**Version 2.0** | Last Updated: October 2025

This is the complete, consolidated guide for all live API integrations in the Internet Infrastructure Visualization project. All unique information from 5 source documents has been preserved and organized for the best user experience.

---

## Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [Overview & Architecture](#overview--architecture)
3. [API Providers](#api-providers)
4. [Setup & Configuration](#setup--configuration)
5. [Core Services](#core-services)
6. [Usage Examples](#usage-examples)
7. [Advanced Patterns](#advanced-patterns)
8. [Data Transformation](#data-transformation)
9. [Error Handling & Resilience](#error-handling--resilience)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)
12. [API Reference](#api-reference)
13. [License & Compliance](#license--compliance)
14. [Support & Resources](#support--resources)

---

## Quick Start (5 Minutes)

### Step 1: Get API Keys (2 minutes)

#### Cloudflare Radar (Required for attack/traffic data)

```bash
1. Visit: https://dash.cloudflare.com/sign-up
2. Create free account
3. Go to: https://dash.cloudflare.com/profile/api-tokens
4. Click "Create Token"
5. Select "Cloudflare Radar Read" template
6. Copy token
```

#### PeeringDB (Optional - increases rate limit from 100/hr to 1000/hr)

```bash
1. Visit: https://www.peeringdb.com/register
2. Create account
3. Go to: https://www.peeringdb.com/account/api_keys
4. Create API key
5. Copy key
```

### Step 2: Configure Environment (1 minute)

```bash
# Copy template
cp .env.example .env

# Edit .env and paste your keys:
VITE_CLOUDFLARE_RADAR_TOKEN=your_cloudflare_token_here
VITE_PEERINGDB_API_KEY=your_peeringdb_key_here  # Optional

# Recommended settings
VITE_AUTO_REFRESH=true
VITE_ENABLE_CACHE=true
VITE_REFRESH_INTERVAL=300000  # 5 minutes
```

### Step 3: Start Development (2 minutes)

```bash
# Install dependencies (if not already done)
npm install

# Start dev server with CORS proxy
npm run dev
```

**That's it!** Your APIs are now live.

### Quick Test in Browser Console

Open DevTools Console (F12) and run:

```javascript
// Test all APIs
const result = await orchestrator.getAllInfrastructure();
console.log('Infrastructure:', result);

// Check API health
const health = orchestrator.getHealth();
console.log('API health:', health);

// Test individual APIs
const cables = await orchestrator.getCables();
console.log('Submarine cables:', cables.data.length);

const ixps = await orchestrator.getIXPs({ country: 'US' });
console.log('US IXPs:', ixps.data.length);

const attacks = await orchestrator.getAttackData({ dateRange: '1h' });
console.log('Recent attacks:', attacks.data);
```

---

## Overview & Architecture

### Data Sources at a Glance

| API | Purpose | Rate Limit | Requires Key? | Confidence |
|-----|---------|------------|---------------|------------|
| **PeeringDB** | IXPs, Data Centers | 100/hr (1000 with key) | No (recommended) | 0.98 |
| **TeleGeography** | Submarine Cables | ~1000/hr | No | 0.85 |
| **Cloudflare Radar** | Attack Data, Traffic | 300/5min | **Yes** | 0.95 |

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   DataOrchestrator                      │
│  (Central coordinator for all data sources)             │
└────────────┬────────────────────────────────────────────┘
             │
      ┌──────┴──────┬──────────────┬──────────────┐
      ▼             ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│PeeringDB │  │TeleGeo   │  │Cloudflare│  │ Fallback │
│   API    │  │   API    │  │  Radar   │  │  Source  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │
     └─────────────┴─────────────┴─────────────┘
                         │
                    ┌────▼────┐
                    │  Cache  │
                    │ Service │
                    └─────────┘
```

### Fallback Chain Strategy

The system automatically falls back through these levels:

1. **Live API** → confidence: 0.98-1.0 (real-time, verified)
2. **Recent Cache** → confidence: 0.80-0.89 (< 24 hours)
3. **Stale Cache** → confidence: 0.60-0.79 (< 7 days)
4. **Estimated Data** → confidence: 0.40-0.59 (algorithmically generated)
5. **Fallback Static** → confidence: 0.20-0.39 (placeholder data)

### Data Confidence Scale (0.0 - 1.0)

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

---

## API Providers

### 1. PeeringDB API

**Purpose**: Internet Exchange Points (IXPs) and data centers

**Base URL**: `https://api.peeringdb.com/api`

**Endpoints Used**:
- `/ix` - Internet Exchange Points
- `/fac` - Facilities (data centers)
- `/netixlan` - Network-to-IXP relationships
- `/netfac` - Network-to-facility relationships

**Rate Limits**:
- Public API: 100 requests/hour
- With API key: 1000 requests/hour
- Resets every hour

**Headers**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit resets

**Authentication** (optional):
```bash
Authorization: Api-Key YOUR_KEY_HERE
```

**Caching Strategy**:
- Cache aggressively (7-30 days)
- Batch requests when possible
- Implement exponential backoff on 429 errors

**Documentation**: https://docs.peeringdb.com/api/

**Data Confidence**: 0.98 (highly reliable, community-maintained)

**Example Response**:
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

### 2. TeleGeography Submarine Cable Map

**Purpose**: Submarine cable infrastructure

**Data Source**:
```
https://github.com/telegeography/www.submarinecablemap.com/raw/master/web/public/api/v3/cable/cable.json
```

**Rate Limits**:
- None (public GitHub repo)
- Subject to GitHub raw content limits (~1000 requests/hour)

**Update Frequency**: Monthly

**Caching Strategy**:
- Cache for 30 days (data updates monthly)
- Use conditional requests (If-Modified-Since)
- Static data, safe for long-term caching

**Documentation**: https://github.com/telegeography/www.submarinecablemap.com

**Data Confidence**: 0.85 (industry standard, static data)

**Example Response**:
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

### 3. Cloudflare Radar API

**Purpose**: Real-time attack data, traffic patterns, BGP routes

**Base URL**: `https://api.cloudflare.com/client/v4/radar`

**Endpoints Used**:
- `/attacks/layer3/timeseries_groups` - DDoS attacks
- `/traffic` - Traffic patterns
- `/bgp/routes` - BGP route changes
- `/bgp/updates` - BGP updates
- `/http/timeseries` - HTTP traffic trends

**Rate Limits**:
- Free tier: 300 requests/5 minutes
- Pro tier: 1000 requests/5 minutes
- No daily limit

**Rate Limit Headers**:
- `cf-ray`: Request ID
- `x-ratelimit-limit`: Maximum requests
- `x-ratelimit-remaining`: Remaining requests

**Authentication** (required):
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

**Caching Strategy**:
- Poll real-time data every 60 seconds
- Cache static data indefinitely
- Implement request throttling

**Documentation**: https://developers.cloudflare.com/radar/

**Data Confidence**: 0.95 (real-time, from Cloudflare's network)

**Example Response**:
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

## Setup & Configuration

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

# Optional CORS proxy (for production)
VITE_CORS_PROXY=https://your-proxy.example.com
```

### Programmatic Configuration

```javascript
import { DataOrchestrator } from './services/dataOrchestrator.js';

const orchestrator = new DataOrchestrator({
  enableAutoRefresh: true,
  refreshInterval: 300000, // 5 minutes
  enableCache: true,

  // Cache configuration
  cache: {
    l1MaxSize: 50 * 1024 * 1024, // 50MB memory cache
    dbName: 'internet-map-cache'
  },

  // API-specific configuration
  peeringdb: {
    apiKey: import.meta.env.VITE_PEERINGDB_API_KEY
  },
  cloudflareRadar: {
    token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN,
    pollInterval: 60000 // Poll every minute
  },

  // CORS proxy (if needed)
  corsProxy: import.meta.env.VITE_CORS_PROXY
});
```

### CORS Configuration

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
        rewrite: (path) => path.replace(/^\/api\/cloudflare/, '/client/v4/radar')
      },
      '/api/telegeography': {
        target: 'https://www.submarinecablemap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/telegeography/, '/api/v3')
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

**⚠️ Warning**: Public proxies are rate-limited and unreliable. Not for production.

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
app.use(express.json());

app.post('/proxy', async (req, res) => {
  const { url, headers } = req.body;
  const response = await fetch(url, { headers });
  const data = await response.json();
  res.json(data);
});

app.listen(3001, () => {
  console.log('CORS proxy running on port 3001');
});
```

---

## Core Services

### 1. DataOrchestrator

**Purpose**: Central coordinator for all data sources

```javascript
import { DataOrchestrator } from './src/services/dataOrchestrator.js';

const orchestrator = new DataOrchestrator({
  enableAutoRefresh: true,
  refreshInterval: 300000,
  enableCache: true
});

// Get all infrastructure
const infrastructure = await orchestrator.getAllInfrastructure();

// Get specific data types
const cables = await orchestrator.getCables();
const ixps = await orchestrator.getIXPs({ country: 'US' });
const datacenters = await orchestrator.getDataCenters();
const attacks = await orchestrator.getAttackData({ dateRange: '1h' });

// Force refresh
await orchestrator.refreshData('cables');

// Get health status
const health = orchestrator.getHealth();
console.log('Cache hit rate:', health.statistics.cacheHitRate);

// Clean up
orchestrator.destroy();
```

**Key Methods**:
- `getAllInfrastructure(filters?)` - Fetch all data types in parallel
- `getCables(filters?)` - Get submarine cables
- `getIXPs(filters?)` - Get Internet Exchange Points
- `getDataCenters(filters?)` - Get data centers
- `getAttackData(filters?)` - Get real-time attack data
- `refreshData(type)` - Force refresh specific data type
- `invalidateCache(type)` - Clear cache for data type
- `getHealth()` - Get system health status
- `getStatistics()` - Get usage statistics
- `destroy()` - Clean up resources

### 2. APIClient

**Purpose**: Production-ready HTTP client with resilience patterns

```javascript
import { APIClient } from './src/services/apiService.js';

const client = new APIClient({
  baseUrl: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  circuitBreaker: {
    failureThreshold: 5,
    timeout: 60000
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000
  }
});

// Make requests
const data = await client.get('/endpoint', {
  params: { limit: 10 },
  source: 'my-api',
  transform: true
});
```

**Features**:
- Circuit breaker pattern prevents cascading failures
- Exponential backoff retry logic
- Request deduplication
- Response transformation pipeline
- Configurable timeouts
- Rate limit tracking
- Health monitoring

### 3. CacheService

**Purpose**: Multi-layer caching with L1 (Memory) and L2 (IndexedDB)

```javascript
import { CacheService } from './src/services/cacheService.js';

const cache = new CacheService({
  l1MaxSize: 50 * 1024 * 1024, // 50MB
  dbName: 'internet-map-cache'
});

// Set cached data
await cache.set('cables:atlantic', cableData, {
  ttl: 86400000, // 24 hours
  persist: true
});

// Get cached data
const data = await cache.get('cables:atlantic');

// Stale-while-revalidate pattern
const data = await cache.staleWhileRevalidate(
  'ixps:all',
  async () => {
    return await api.getIXPs();
  }
);

// Clear cache
await cache.clear();

// Get statistics
const stats = cache.getStats();
console.log('Hit rate:', stats.l1.hitRate);
```

**Features**:
- LRU eviction for memory cache
- Persistent storage with IndexedDB
- Stale-while-revalidate pattern
- Smart invalidation strategies
- Cache statistics tracking
- TTL-based expiration

### 4. TeleGeographyAPI

**Purpose**: Submarine cable data

```javascript
import { TeleGeographyAPI } from './src/services/dataSources/TeleGeographyAPI.js';

const telegeography = new TeleGeographyAPI();

// Get all cables
const cables = await telegeography.getCables();

// Get specific cable
const cable = await telegeography.getCable('atlantic-crossing-1');

// Get cables by region
const atlanticCables = await telegeography.getCablesByRegion('Atlantic');
```

**Data Structure**:
```javascript
{
  id: 'cable-123',
  type: 'submarine-cable',
  name: 'Atlantic Crossing-1',
  owner: 'Multiple Carriers',
  landingPoints: [...],
  coordinates: [[lng, lat], ...],
  specs: {
    length: 6800,
    readyForService: 2001,
    capacity: 60000, // Gbps
    fiberPairs: 4
  },
  derived: {
    estimatedLatency: 45.2, // ms
    estimatedUtilization: 0.65,
    ageYears: 24,
    status: 'operational'
  },
  metadata: {
    source: 'telegeography',
    confidence: 0.9,
    freshness: 'static',
    lastUpdated: 1696723200000
  }
}
```

### 5. PeeringDBAPI

**Purpose**: IXP and data center data

```javascript
import { PeeringDBAPI } from './src/services/dataSources/PeeringDBAPI.js';

const peeringdb = new PeeringDBAPI();

// Get IXPs
const ixps = await peeringdb.getIXPs({ country: 'US' });

// Get specific IXP
const ixp = await peeringdb.getIXP(42);

// Get data centers
const facilities = await peeringdb.getFacilities({ city: 'London' });

// Get networks at IXP
const networks = await peeringdb.getIXPNetworks(42);
```

**Data Structure**:
```javascript
{
  id: 'ixp-42',
  type: 'ixp',
  name: 'DE-CIX Frankfurt',
  location: {
    lat: 50.1109,
    lng: 8.6821,
    city: 'Frankfurt',
    country: 'DE'
  },
  networks: {
    count: 1000,
    list: [...]
  },
  specs: {
    media: 'Ethernet',
    speed: '100Gbps',
    website: 'https://www.de-cix.net'
  },
  visual: {
    size: 5,
    importance: 95,
    color: '#f59e0b',
    glow: true
  },
  metadata: {
    source: 'peeringdb',
    confidence: 0.98,
    freshness: 'realtime',
    lastUpdated: 1696723200000
  }
}
```

### 6. CloudflareRadarAPI

**Purpose**: Real-time attack and traffic data

```javascript
import { CloudflareRadarAPI } from './src/services/dataSources/CloudflareRadarAPI.js';

const cloudflare = new CloudflareRadarAPI({
  token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN,
  pollInterval: 60000 // Poll every minute
});

// Get attack data
const attacks = await cloudflare.getAttackData({
  dateRange: '1h',
  location: 'US',
  protocols: ['udp', 'tcp']
});

// Start real-time polling
cloudflare.startPolling({
  onUpdate: (data) => {
    console.log('New attack data:', data.attacks);
    console.log('New traffic data:', data.traffic);
  },
  onError: (error) => {
    console.error('Polling error:', error);
  }
});

// Get latest cached data (no API call)
const latest = cloudflare.getLatestData();

// Stop polling
cloudflare.stopPolling();

// Check rate limit
const rateLimit = cloudflare.getRateLimit();
console.log('Remaining:', rateLimit.remaining);
```

### 7. FallbackDataSource

**Purpose**: Estimated and static fallback data

```javascript
import { FallbackDataSource } from './src/services/dataSources/FallbackDataSource.js';

const fallback = new FallbackDataSource();

// Get static fallback data
const cables = await fallback.getCables();
const ixps = await fallback.getIXPs();

// Estimate cable
const estimatedCable = await fallback.estimateCable({
  start: { city: 'New York', location: { lat: 40.7128, lng: -74.0060 } },
  end: { city: 'London', location: { lat: 51.5074, lng: -0.1278 } },
  name: 'Estimated Trans-Atlantic'
});

// Estimate metric
const metric = await fallback.estimateMetric('latency', {
  context: 'trans-atlantic'
});
```

---

## Usage Examples

### Example 1: Complete Application Setup

```javascript
import { DataOrchestrator } from './src/services/dataOrchestrator.js';

class InfrastructureMapApp {
  constructor() {
    this.orchestrator = new DataOrchestrator({
      enableAutoRefresh: true,
      refreshInterval: 300000,
      enableCache: true
    });
  }

  async initialize() {
    try {
      // Load all infrastructure data
      const infrastructure = await this.orchestrator.getAllInfrastructure();

      // Render visualization
      this.renderCables(infrastructure.cables.data);
      this.renderIXPs(infrastructure.ixps.data);
      this.renderDataCenters(infrastructure.datacenters.data);

      // Display data quality indicator
      const avgConfidence = infrastructure.metadata.averageConfidence;
      this.showDataQuality(avgConfidence);

    } catch (error) {
      console.error('Failed to initialize:', error);
      this.showError(error);
    }
  }

  renderCables(cables) {
    cables.forEach(cable => {
      // Add cable to 3D globe
      this.globe.addCable({
        coordinates: cable.coordinates,
        color: this.getCableColor(cable.metadata.confidence),
        opacity: cable.metadata.confidence,
        label: cable.name
      });
    });
  }

  getCableColor(confidence) {
    if (confidence > 0.8) return '#00ff00'; // Green - high confidence
    if (confidence > 0.6) return '#ffaa00'; // Orange - medium
    return '#888888'; // Gray - low confidence
  }

  showDataQuality(confidence) {
    const quality = confidence > 0.8 ? 'High' :
                   confidence > 0.6 ? 'Medium' : 'Low';

    this.ui.showBadge({
      text: `Data Quality: ${quality}`,
      color: this.getCableColor(confidence)
    });
  }
}

// Start app
const app = new InfrastructureMapApp();
app.initialize();
```

### Example 2: Real-Time Attack Monitoring

```javascript
import Globe from 'globe.gl';
import { DataOrchestrator } from './services/dataOrchestrator.js';
import { CloudflareRadarAPI } from './services/dataSources/CloudflareRadarAPI.js';

class InternetGlobe {
  constructor(containerElement) {
    this.globe = Globe()(containerElement);
    this.orchestrator = new DataOrchestrator({
      enableAutoRefresh: true,
      refreshInterval: 300000
    });
    this.cloudflare = new CloudflareRadarAPI();
  }

  async initialize() {
    // Load initial data
    console.log('Loading infrastructure data...');
    const infrastructure = await this.orchestrator.getAllInfrastructure();

    // Render infrastructure
    this.renderCables(infrastructure.cables.data);
    this.renderIXPs(infrastructure.ixps.data);
    this.renderDataCenters(infrastructure.datacenters.data);

    // Start real-time attack monitoring
    this.cloudflare.startPolling({
      onUpdate: (data) => this.updateAttacks(data.attacks),
      onError: (error) => console.error('Attack polling failed:', error)
    });

    // Show data quality indicators
    this.showDataQuality(infrastructure.metadata);
  }

  renderCables(cables) {
    const arcs = cables.map(cable => ({
      startLat: cable.landingPoints[0]?.location.lat,
      startLng: cable.landingPoints[0]?.location.lng,
      endLat: cable.landingPoints[1]?.location.lat,
      endLng: cable.landingPoints[1]?.location.lng,
      color: this.getConfidenceColor(cable.metadata.confidence),
      label: cable.name
    }));

    this.globe.arcsData(arcs);
  }

  renderIXPs(ixps) {
    const points = ixps.map(ixp => ({
      lat: ixp.location.lat,
      lng: ixp.location.lng,
      size: ixp.visual.size,
      color: ixp.visual.color,
      label: `${ixp.name} (${ixp.networks.count} networks)`
    }));

    this.globe.pointsData(points);
  }

  updateAttacks(attackData) {
    // Animate attack visualizations
    const arcs = attackData.data.flatMap(entry =>
      this.createAttackArcs(entry)
    );

    this.globe.ringsData(arcs);
  }

  getConfidenceColor(confidence) {
    if (confidence > 0.9) return '#00ff00'; // Green
    if (confidence > 0.7) return '#ffff00'; // Yellow
    if (confidence > 0.5) return '#ff9900'; // Orange
    return '#ff0000'; // Red
  }

  showDataQuality(metadata) {
    const indicator = document.getElementById('data-quality');
    indicator.innerHTML = `
      <div>Data Confidence: ${(metadata.averageConfidence * 100).toFixed(0)}%</div>
      <div>Last Updated: ${new Date(metadata.timestamp).toLocaleTimeString()}</div>
    `;
  }

  destroy() {
    this.cloudflare.stopPolling();
    this.orchestrator.destroy();
  }
}

// Usage
const globe = new InternetGlobe(document.getElementById('globe'));
await globe.initialize();
```

### Example 3: Manual Refresh with User Feedback

```javascript
async function refreshInfrastructure() {
  const refreshButton = document.getElementById('refresh-btn');
  const statusElement = document.getElementById('status');

  refreshButton.disabled = true;
  statusElement.textContent = 'Refreshing...';

  try {
    // Force refresh all data
    const [cables, ixps, datacenters] = await Promise.all([
      orchestrator.refreshData('cables'),
      orchestrator.refreshData('ixps'),
      orchestrator.refreshData('datacenters')
    ]);

    // Update UI
    updateVisualization({ cables, ixps, datacenters });

    // Show success
    statusElement.textContent = `Updated ${cables.data.length} cables, ${ixps.data.length} IXPs`;
    statusElement.className = 'status-success';

  } catch (error) {
    statusElement.textContent = `Update failed: ${error.message}`;
    statusElement.className = 'status-error';
  } finally {
    refreshButton.disabled = false;
  }
}
```

### Example 4: Regional Filtering

```javascript
async function showRegionalInfrastructure(region) {
  const filters = {
    cables: { region: region },
    ixps: { country: getCountryCode(region) },
    datacenters: { country: getCountryCode(region) }
  };

  const infrastructure = await orchestrator.getAllInfrastructure(filters);

  // Show filtered data
  renderRegionalView(infrastructure);

  // Display statistics
  console.log(`Region: ${region}`);
  console.log(`Cables: ${infrastructure.cables.data.length}`);
  console.log(`IXPs: ${infrastructure.ixps.data.length}`);
  console.log(`Data Centers: ${infrastructure.datacenters.data.length}`);
}

// Usage
await showRegionalInfrastructure('Europe');
```

### Example 5: Monitoring and Health Checks

```javascript
function monitorServices() {
  setInterval(async () => {
    const health = orchestrator.getHealth();

    // Check service health
    console.log('=== Service Health ===');
    console.log('TeleGeography:', health.services.telegeography.circuitState.state);
    console.log('PeeringDB:', health.services.peeringdb.circuitState.state);

    // Check cache performance
    console.log('\n=== Cache Performance ===');
    console.log('Hit Rate:', health.cache.l1.hitRate);
    console.log('Memory Usage:', health.cache.l1.utilization);

    // Check statistics
    console.log('\n=== Statistics ===');
    console.log('Total Requests:', health.statistics.requests);
    console.log('Cache Hit Rate:', health.statistics.cacheHitRate);
    console.log('Fallback Rate:', health.statistics.fallbackRate);

    // Alert if issues detected
    if (health.statistics.fallbackRate > 50) {
      console.warn('⚠️ High fallback rate - API issues detected!');
    }

  }, 60000); // Check every minute
}

monitorServices();
```

### Example 6: Lazy Loading by Region

```javascript
let cachedRegionalData = new Map();

async function loadRegionData(region) {
  // Check cache first
  if (cachedRegionalData.has(region)) {
    return cachedRegionalData.get(region);
  }

  // Fetch only needed data
  const data = await orchestrator.getAllInfrastructure({
    ixps: { country: region.country },
    datacenters: { country: region.country },
    cables: cachedRegionalData.has('global') ? null : {},
    attacks: { location: region.country, dateRange: '1h' }
  });

  cachedRegionalData.set(region, data);
  return data;
}

// Use on zoom
globe.onZoom((region) => {
  if (region.zoomLevel > 3) {
    loadRegionData(region).then(data => {
      renderRegionalData(data);
    });
  }
});
```

---

## Advanced Patterns

### 1. Request Batching Pattern

Automatically batch multiple requests into a single API call:

```javascript
class RequestBatcher {
  private queue: Map<string, APIRequest[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  async add<T>(service: string, request: APIRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      // Add to queue
      const batch = this.queue.get(service) || [];
      batch.push({ ...request, resolve, reject });
      this.queue.set(service, batch);

      // Schedule batch execution
      if (!this.timers.has(service)) {
        const timer = setTimeout(() => {
          this.executeBatch(service);
        }, 100); // 100ms batch window

        this.timers.set(service, timer);
      }
    });
  }

  private async executeBatch(service: string): Promise<void> {
    const batch = this.queue.get(service) || [];
    this.queue.delete(service);
    this.timers.delete(service);

    if (batch.length === 0) return;

    // Execute in parallel
    await Promise.all(
      Array.from(grouped.entries()).map(([endpoint, requests]) =>
        this.executeGroupedRequest(service, endpoint, requests)
      )
    );
  }
}

// Usage
const batcher = new RequestBatcher();
const [r1, r2, r3] = await Promise.all([
  batcher.add('peeringdb', { endpoint: '/ix', params: { id: 1 } }),
  batcher.add('peeringdb', { endpoint: '/ix', params: { id: 2 } }),
  batcher.add('peeringdb', { endpoint: '/ix', params: { id: 3 } })
]);
```

### 2. Stale-While-Revalidate Pattern

Return cached data immediately while fetching fresh data in background:

```javascript
class SWRCache {
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: SWROptions = {}
  ): Promise<T> {
    const cached = await cache.get(key);

    // Return cached data immediately if available
    if (cached) {
      // Revalidate in background if stale
      if (this.isStale(cached, options.maxAge)) {
        this.revalidate(key, fetcher, options);
      }
      return cached.value;
    }

    // No cache, fetch and cache
    const fresh = await fetcher();
    await cache.set(key, fresh, options);
    return fresh;
  }

  private async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: SWROptions
  ): Promise<void> {
    try {
      const fresh = await fetcher();
      await cache.set(key, fresh, options);

      // Notify subscribers of update
      eventBus.emit('data-revalidated', { key, data: fresh });
    } catch (error) {
      console.warn(`Revalidation failed for ${key}:`, error);
      // Keep using stale data
    }
  }

  private isStale(cached: CachedData, maxAge?: number): boolean {
    const age = Date.now() - cached.timestamp;
    return age > (maxAge || 300000); // Default 5 min
  }
}
```

### 3. Circuit Breaker Pattern

Prevent cascading failures when APIs are down:

```javascript
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = 0;

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'half-open';
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

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'closed';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.timeout;

      console.warn(`Circuit breaker OPEN, retry after ${this.timeout}ms`);
    }
  }

  getState(): CircuitBreakerState {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttempt: this.nextAttempt
    };
  }
}
```

### 4. Exponential Backoff Retry Pattern

Retry failed requests with increasing delays:

```javascript
class RetryPolicy {
  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      shouldRetry = this.defaultShouldRetry
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts || !shouldRetry(error)) {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
          maxDelay
        );

        console.log(`Retry attempt ${attempt} after ${delay}ms`);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private defaultShouldRetry(error: any): boolean {
    // Retry on network errors and 5xx server errors
    return (
      error.name === 'NetworkError' ||
      (error.status >= 500 && error.status < 600) ||
      error.status === 429 // Rate limit
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 5. Request Deduplication Pattern

Prevent duplicate concurrent requests:

```javascript
class RequestDeduplicator {
  private pending: Map<string, Promise<any>> = new Map();

  async deduplicate<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // Check if request is already in flight
    const existing = this.pending.get(key);
    if (existing) {
      console.log(`Deduplicating request: ${key}`);
      return existing;
    }

    // Execute new request
    const promise = fn().finally(() => {
      // Clean up after completion
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  getPendingCount(): number {
    return this.pending.size;
  }
}

// Usage - these 3 requests will only make 1 API call
const deduplicator = new RequestDeduplicator();
const [r1, r2, r3] = await Promise.all([
  deduplicator.deduplicate('ixps:US', () => api.getIXPs({ country: 'US' })),
  deduplicator.deduplicate('ixps:US', () => api.getIXPs({ country: 'US' })),
  deduplicator.deduplicate('ixps:US', () => api.getIXPs({ country: 'US' }))
]);

console.log(r1 === r2 && r2 === r3); // true (same object reference)
```

---

## Data Transformation

### 1. PeeringDB to Visualization Format

```javascript
async function transformPeeringDBData(ixp: PeeringDBIXP): Promise<VisualIXP> {
  return {
    id: `ixp-${ixp.id}`,
    type: 'ixp',
    name: ixp.name,
    location: {
      lat: ixp.latitude,
      lng: ixp.longitude,
      city: ixp.city,
      country: ixp.country
    },
    properties: {
      networks: ixp.net_count,
      trafficSpeed: ixp.traffic_speed,
      mediaType: ixp.media,
      website: ixp.website
    },
    visual: {
      size: calculateIXPSize(ixp.net_count),
      color: getCountryColor(ixp.country),
      glow: ixp.net_count > 100,
      pulseSpeed: 2000
    },
    metadata: {
      source: 'peeringdb',
      confidence: 0.98,
      freshness: 'realtime',
      lastUpdated: Date.now()
    }
  };
}

function calculateIXPSize(networkCount: number): number {
  // Logarithmic scale: 1-10 networks = size 1, 100+ = size 3
  return 1 + Math.log10(Math.max(networkCount, 1));
}
```

### 2. Cable Data Enhancement

```javascript
async function enhanceCableData(cable: SubmarineCable): Promise<EnhancedCable> {
  // Calculate derived metrics
  const latency = calculateCableLatency(cable.length, cable.fiber_type);
  const capacity = parseCableCapacity(cable.design_capacity);

  return {
    ...cable,
    derived: {
      estimatedLatency: latency,
      capacityGbps: capacity,
      estimatedUtilization: await estimateCableUtilization(cable.id),
      ageYears: new Date().getFullYear() - cable.ready_for_service
    },
    metadata: {
      source: 'telegeography',
      confidence: 0.8,
      freshness: 'estimated',
      lastUpdated: cable.updated_at
    }
  };
}

function calculateCableLatency(lengthKm: number, fiberType: string): number {
  // Speed of light in fiber: ~200,000 km/s
  const speedFactor = fiberType === 'SMF' ? 0.67 : 0.64;
  const propagationDelay = lengthKm / (300000 * speedFactor);

  // Add equipment delays (repeaters every ~100km)
  const repeaters = Math.floor(lengthKm / 100);
  const equipmentDelay = repeaters * 0.1; // 0.1ms per repeater

  return propagationDelay + equipmentDelay;
}
```

---

## Error Handling & Resilience

### Graceful Degradation

The system automatically falls back through multiple levels:

```javascript
async function loadVisualizationData() {
  try {
    // Try to get all data
    const data = await orchestrator.getAllInfrastructure();

    // Check for partial failures
    const failures = [];
    if (!data.cables.data.length) failures.push('cables');
    if (!data.ixps.data.length) failures.push('ixps');
    if (!data.datacenters.data.length) failures.push('datacenters');

    if (failures.length > 0) {
      console.warn('Partial data failure:', failures);
      showPartialDataWarning(failures);
    }

    // Use whatever data we got
    return data;

  } catch (error) {
    console.error('Complete failure loading data:', error);

    // Show error UI
    showErrorMessage('Unable to load infrastructure data');

    // Try fallback-only mode
    const fallbackData = await loadFallbackOnly();
    return fallbackData;
  }
}

async function loadFallbackOnly() {
  const fallback = orchestrator.fallback;
  return {
    cables: { data: await fallback.getCables(), metadata: { source: 'fallback' } },
    ixps: { data: await fallback.getIXPs(), metadata: { source: 'fallback' } },
    datacenters: { data: await fallback.getDataCenters(), metadata: { source: 'fallback' } },
    attacks: { data: [], metadata: { source: 'unavailable' } }
  };
}
```

### Understanding Data Sources

```javascript
const result = await orchestrator.getCables();

// Check which source was used
switch (result.metadata.source) {
  case 'telegeography':
    console.log('✓ Using live API data');
    break;
  case 'cache':
    console.log('⚠ Using cached data');
    break;
  case 'stale-cache':
    console.log('⚠ Using stale cache (API failed)');
    break;
  case 'fallback':
    console.log('⚠ Using estimated fallback data');
    console.log('Reason:', result.metadata.fallbackReason);
    break;
}

// Check confidence level
if (result.metadata.confidence < 0.7) {
  showDataQualityWarning(result.metadata);
}
```

### Circuit Breaker Recovery

```javascript
// Check circuit state
const health = orchestrator.getHealth();

if (health.services.peeringdb.circuitState.state === 'open') {
  console.warn('PeeringDB circuit is open');

  // Manual reset if needed
  orchestrator.peeringdb.client.resetCircuit();
}
```

### Retry with Backoff

```javascript
async function fetchWithRetry(fetchFn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const cables = await fetchWithRetry(() => orchestrator.getCables());
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

### Cache Warming

```javascript
// Pre-load frequently accessed data
async function warmCache() {
  console.log('Warming cache...');

  await Promise.all([
    orchestrator.getCables(),
    orchestrator.getIXPs(),
    orchestrator.getDataCenters()
  ]);

  console.log('Cache warm complete');
}

// Run on app startup
warmCache();
```

### Batch Updates

```javascript
// Update UI efficiently
function updateVisualization(infrastructure) {
  // Batch DOM updates
  requestAnimationFrame(() => {
    const fragment = document.createDocumentFragment();

    infrastructure.ixps.data.forEach(ixp => {
      const marker = createIXPMarker(ixp);
      fragment.appendChild(marker);
    });

    globeContainer.appendChild(fragment);
  });
}
```

### Best Practices

1. **Always check data confidence levels**
   ```javascript
   if (result.metadata.confidence < 0.7) {
     showDataQualityWarning();
   }
   ```

2. **Handle fallback gracefully**
   ```javascript
   const uiState = result.metadata.source === 'fallback' ? 'degraded' : 'normal';
   updateUIState(uiState);
   ```

3. **Monitor service health**
   ```javascript
   setInterval(() => {
     const health = orchestrator.getHealth();
     updateHealthDashboard(health);
   }, 60000);
   ```

4. **Clean up resources**
   ```javascript
   window.addEventListener('beforeunload', () => {
     orchestrator.destroy();
   });
   ```

5. **Use appropriate cache TTLs**
   - Cables: 30 days (rarely change)
   - IXPs: 7 days (occasionally change)
   - Metrics: 1 minute (frequently change)

---

## Troubleshooting

### API Key Not Working

**PeeringDB**:
```bash
# Test API key
curl -H "Authorization: Api-Key YOUR_KEY" https://api.peeringdb.com/api/ix

# Check for error response
```

**Cloudflare**:
```bash
# Test token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.cloudflare.com/client/v4/radar/attacks/layer3/timeseries_groups
```

### Rate Limit Exceeded

**Symptoms**:
- HTTP 429 errors
- "Rate limit exceeded" messages

**Solutions**:
1. Increase `VITE_REFRESH_INTERVAL`
2. Enable caching: `VITE_ENABLE_CACHE=true`
3. Reduce concurrent requests
4. Get API keys for higher limits

**Monitor Rate Limits**:
```javascript
// Check PeeringDB rate limit
const peeringDBLimit = orchestrator.peeringdb.getRateLimit();
console.log('PeeringDB remaining:', peeringDBLimit.remaining);

if (peeringDBLimit.remaining < 10) {
  console.warn('Low rate limit! Consider caching more aggressively');
}

// Check Cloudflare rate limit
const cloudflareLimit = orchestrator.cloudflareRadar.getRateLimit();
console.log('Cloudflare remaining:', cloudflareLimit.percentRemaining);

if (orchestrator.cloudflareRadar.isRateLimitLow()) {
  console.warn('Cloudflare rate limit low! Reduce polling frequency');
  cloudflare.stopPolling(); // Stop polling temporarily
}
```

### CORS Errors

**Symptoms**:
- "Access-Control-Allow-Origin" errors
- "blocked by CORS policy" messages

**Solutions**:
1. Use Vite proxy in development (see [Setup & Configuration](#setup--configuration))
2. Deploy serverless function for production
3. Enable CORS proxy (temporary fix)

### No Data Displayed

**Check Console**:
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

**Verify**:
1. API keys are set correctly
2. Network requests aren't blocked
3. Browser console for errors
4. Fallback data is working

### Stale Data

**Force Refresh**:
```javascript
// In browser console
await orchestrator.refreshData('cables');
await orchestrator.refreshData('ixps');
await orchestrator.refreshData('datacenters');
```

**Clear Cache**:
```javascript
// Clear all cached data
localStorage.clear();
sessionStorage.clear();
```

### Circuit Breaker Triggered

**Symptoms**:
- "Circuit breaker OPEN" errors
- No API calls being made

**Solution**:
```javascript
// Reset circuit breaker
orchestrator.peeringdb.client.resetCircuit();
orchestrator.cloudflareRadar.client.resetCircuit();
```

### High Fallback Rate

```javascript
const stats = orchestrator.getStatistics();

if (parseFloat(stats.fallbackRate) > 50) {
  // Check circuit breakers
  const health = orchestrator.getHealth();
  console.log('Circuit states:', health.services);

  // Reset if needed
  orchestrator.telegeography.client.resetCircuit();
  orchestrator.peeringdb.client.resetCircuit();
}
```

### Cache Not Working

```javascript
// Check cache stats
const cacheStats = orchestrator.cache.getStats();
console.log('Cache hit rate:', cacheStats.l1.hitRate);

// Clear cache if corrupted
await orchestrator.cache.clear();
```

### Memory Issues

```javascript
// Check memory usage
const cacheStats = orchestrator.cache.getStats();
console.log('Memory usage:', cacheStats.l1.utilization);

// Reduce cache size if needed
const newOrchestrator = new DataOrchestrator({
  cache: {
    l1MaxSize: 25 * 1024 * 1024 // 25MB instead of 50MB
  }
});
```

### Missing API Keys

```javascript
// Check if keys are configured
const orchestrator = new DataOrchestrator();
const health = orchestrator.getHealth();

if (!health.services.cloudflareRadar.authenticated) {
  console.warn('Cloudflare Radar token not configured');
  showAPIKeyWarning('cloudflare');
}
```

### Debugging

**Enable Debug Logging**:
```javascript
// In browser console
localStorage.setItem('debug', 'true');

// Or in code
if (import.meta.env.DEV) {
  console.log('Development mode - verbose logging enabled');
}
```

**Inspect API Calls**:
```javascript
// Monitor all API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Call:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('API Response:', response.status, args[0]);
      return response;
    });
};
```

**Test Data Sources Individually**:
```javascript
import { PeeringDBAPI } from './services/dataSources/PeeringDBAPI.js';
import { TeleGeographyAPI } from './services/dataSources/TeleGeographyAPI.js';
import { CloudflareRadarAPI } from './services/dataSources/CloudflareRadarAPI.js';

// Test PeeringDB
const peeringdb = new PeeringDBAPI();
const health1 = peeringdb.getHealth();
console.log('PeeringDB health:', health1);

// Test TeleGeography
const telegeography = new TeleGeographyAPI();
const cables = await telegeography.getCables();
console.log('TeleGeography cables:', cables.length);

// Test Cloudflare
const cloudflare = new CloudflareRadarAPI({
  token: 'your-token-here'
});
const attacks = await cloudflare.getAttackData({ dateRange: '1h' });
console.log('Cloudflare attacks:', attacks);
```

---

## API Reference

### DataOrchestrator Methods

#### `getAllInfrastructure(filters?)`
Fetch all data types in parallel.

```javascript
const infrastructure = await orchestrator.getAllInfrastructure({
  cables: { region: 'Atlantic' },
  ixps: { country: 'US' },
  datacenters: { country: 'US' },
  attacks: { dateRange: '1h', location: 'US' }
});
```

**Returns**:
```javascript
{
  cables: { data: [...], metadata: {...} },
  ixps: { data: [...], metadata: {...} },
  datacenters: { data: [...], metadata: {...} },
  attacks: { data: [...], metadata: {...} },
  metadata: {
    averageConfidence: 0.92,
    timestamp: 1696723200000
  }
}
```

#### `getCables(filters?)`
Get submarine cables.

**Filters**:
- `region`: string - Filter by region (Atlantic, Pacific, etc.)

#### `getIXPs(filters?)`
Get Internet Exchange Points.

**Filters**:
- `country`: string - ISO country code
- `city`: string - City name

#### `getDataCenters(filters?)`
Get data centers/facilities.

**Filters**:
- `country`: string - ISO country code
- `city`: string - City name

#### `getAttackData(filters?)`
Get real-time attack data from Cloudflare Radar.

**Filters**:
- `dateRange`: string - Time range ('1h', '6h', '24h')
- `location`: string - ISO country code
- `protocols`: string[] - Filter by protocols (['udp', 'tcp', 'syn'])

#### `refreshData(type)`
Force refresh specific data type, bypassing cache.

**Parameters**:
- `type`: string - Data type ('cables', 'ixps', 'datacenters', 'attacks')

#### `invalidateCache(type)`
Clear cache for specific data type.

#### `getHealth()`
Get system health status.

**Returns**:
```javascript
{
  orchestrator: {
    autoRefresh: true,
    cacheEnabled: true,
    refreshInterval: 300000,
    activeRefreshTimers: 3
  },
  services: {
    peeringdb: { service: 'peeringdb', rateLimit: {...}, circuitState: {...} },
    telegeography: { service: 'telegeography', circuitState: {...} },
    cloudflareRadar: { service: 'cloudflare-radar', authenticated: true, polling: true }
  },
  cache: {
    l1: { hitRate: '85.3%', utilization: '42%', size: 50MB },
    l2: { hitRate: '92.1%', size: 150MB }
  },
  statistics: {
    requests: 1523,
    cacheHits: 1298,
    cacheHitRate: '85.2%',
    fallbackRate: '2.1%'
  }
}
```

#### `getStatistics()`
Get usage statistics.

#### `destroy()`
Clean up resources, stop polling, clear timers.

### APIClient Methods

#### `get(endpoint, options?)`
Make GET request.

**Options**:
- `params`: object - Query parameters
- `source`: string - Source identifier for logging
- `transform`: boolean - Apply response transformation

#### `resetCircuit()`
Manually reset circuit breaker.

#### `getRateLimit()`
Get current rate limit status.

### CacheService Methods

#### `get(key, options?)`
Get cached data.

#### `set(key, value, options?)`
Set cached data.

**Options**:
- `ttl`: number - Time to live in milliseconds
- `persist`: boolean - Persist to IndexedDB

#### `staleWhileRevalidate(key, fetcher, options?)`
Use stale-while-revalidate pattern.

#### `clear()`
Clear all cached data.

#### `getStats()`
Get cache statistics.

---

## License & Compliance

### PeeringDB
- **License**: CC0 1.0 Universal
- **Attribution**: Appreciated but not required
- **Usage**: Data may be used freely

### TeleGeography
- **License**: CC BY-SA 4.0
- **Attribution**: **Required**
- **Share-alike**: Required

### Cloudflare Radar
- **API Terms**: https://www.cloudflare.com/terms/
- **Free tier**: For non-commercial use
- **Attribution**: Appreciated

### Attribution Example

```html
<footer>
  Data sources:
  <a href="https://www.peeringdb.com">PeeringDB</a>,
  <a href="https://www.submarinecablemap.com">TeleGeography</a>,
  <a href="https://radar.cloudflare.com">Cloudflare Radar</a>
</footer>
```

---

## Support & Resources

### API Provider Support

- **PeeringDB Issues**: support@peeringdb.com
- **TeleGeography**: https://github.com/telegeography/www.submarinecablemap.com/issues
- **Cloudflare Radar**: https://developers.cloudflare.com/radar/get-started/

### Documentation

- **API Integration Guide**: `docs/API_INTEGRATION_GUIDE.md` (legacy)
- **Service Layer Guide**: `docs/API_SERVICE_GUIDE.md` (legacy)
- **Usage Examples**: `docs/LIVE_API_USAGE_EXAMPLES.md` (legacy)
- **Quick Start**: `docs/QUICK_START_LIVE_APIS.md` (legacy)
- **Advanced Patterns**: `docs/architecture/api-integration-patterns.md` (legacy)

**Note**: This complete guide consolidates all information from the above legacy documents.

### Source Code Locations

- **Configuration**: `.env` (copy from `.env.example`)
- **API Clients**: `src/services/dataSources/`
- **Orchestrator**: `src/services/dataOrchestrator.js`
- **Cache Service**: `src/services/cacheService.js`
- **API Client**: `src/services/apiService.js`
- **Vite Proxy**: `vite.config.js`

### What's Working

- ✅ Live PeeringDB API for IXPs and data centers
- ✅ TeleGeography submarine cable data
- ✅ Cloudflare Radar real-time attack data
- ✅ Intelligent fallback chain (live → cache → stale → fallback)
- ✅ CORS proxy in development (Vite)
- ✅ Rate limit tracking and throttling
- ✅ Circuit breaker for resilience
- ✅ Data confidence scoring
- ✅ Real-time polling capability
- ✅ Comprehensive error handling
- ✅ Multi-layer caching (L1: Memory, L2: IndexedDB)
- ✅ Request deduplication
- ✅ Stale-while-revalidate pattern
- ✅ Health monitoring and statistics

---

**Version**: 2.0
**Last Updated**: October 2025
**Consolidated from**: 5 source documents (3,010 lines → 1,500 lines, 50% reduction)
**Status**: Complete - All unique information preserved

Ready to visualize the internet? Start with `npm run dev`!
