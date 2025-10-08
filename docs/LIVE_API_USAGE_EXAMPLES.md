# Live API Usage Examples

This document provides practical examples of using the live API integrations.

## Basic Setup

```javascript
import { DataOrchestrator } from './services/dataOrchestrator.js';

// Initialize with default configuration
const orchestrator = new DataOrchestrator({
  enableAutoRefresh: true,
  refreshInterval: 300000, // 5 minutes
  enableCache: true
});
```

## Fetching Infrastructure Data

### Get Submarine Cables

```javascript
// Get all cables
const cablesResult = await orchestrator.getCables();
console.log('Cables:', cablesResult);
// {
//   data: [...cable objects...],
//   metadata: {
//     source: 'telegeography',
//     confidence: 0.85,
//     freshness: 'live',
//     count: 532
//   }
// }

// Get cables by region (if supported)
const atlanticCables = await orchestrator.getCables({ region: 'Atlantic' });
```

### Get Internet Exchange Points (IXPs)

```javascript
// Get all IXPs
const ixpsResult = await orchestrator.getIXPs();
console.log('IXPs:', ixpsResult);

// Filter by country
const usIXPs = await orchestrator.getIXPs({ country: 'US' });

// Filter by city
const londonIXPs = await orchestrator.getIXPs({ city: 'London' });

// Multiple filters
const frankfurtIXPs = await orchestrator.getIXPs({
  country: 'DE',
  city: 'Frankfurt'
});
```

### Get Data Centers

```javascript
// Get all data centers
const datacenters = await orchestrator.getDataCenters();

// Filter by location
const singaporeDCs = await orchestrator.getDataCenters({
  country: 'SG',
  city: 'Singapore'
});
```

### Get Real-Time Attack Data (Cloudflare Radar)

```javascript
// Get last hour of attacks
const attacks = await orchestrator.getAttackData({
  dateRange: '1h'
});
console.log('Recent attacks:', attacks);

// Get attacks for specific country
const usAttacks = await orchestrator.getAttackData({
  dateRange: '24h',
  location: 'US'
});

// Get attacks filtered by protocol
const udpAttacks = await orchestrator.getAttackData({
  dateRange: '6h',
  protocols: ['udp', 'tcp']
});
```

## Real-Time Polling

### Start Continuous Attack Monitoring

```javascript
import { CloudflareRadarAPI } from './services/dataSources/CloudflareRadarAPI.js';

const cloudflare = new CloudflareRadarAPI({
  token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN,
  pollInterval: 60000 // Poll every minute
});

// Start polling with callback
cloudflare.startPolling({
  onUpdate: (latestData) => {
    console.log('New attack data:', latestData.attacks);
    console.log('New traffic data:', latestData.traffic);

    // Update your visualization
    updateGlobeAttacks(latestData.attacks);
  },
  onError: (error) => {
    console.error('Polling error:', error);
    // Show error UI
  }
});

// Stop polling when done
// cloudflare.stopPolling();
```

### Get Latest Data Without New API Call

```javascript
// After polling is started, get cached latest data
const latest = cloudflare.getLatestData();
console.log('Latest attacks:', latest.attacks);
console.log('Latest traffic:', latest.traffic);
```

## Combining Multiple Data Sources

### Get Complete Infrastructure Picture

```javascript
// Fetch everything in parallel
const infrastructure = await orchestrator.getAllInfrastructure();

console.log('All infrastructure:', {
  cables: infrastructure.cables.data.length,
  ixps: infrastructure.ixps.data.length,
  datacenters: infrastructure.datacenters.data.length,
  attacks: infrastructure.attacks.data.length,
  confidence: infrastructure.metadata.averageConfidence
});

// Use the data
renderCables(infrastructure.cables.data);
renderIXPs(infrastructure.ixps.data);
renderDataCenters(infrastructure.datacenters.data);
animateAttacks(infrastructure.attacks.data);
```

### Fetch Specific Regions

```javascript
const asianInfrastructure = await orchestrator.getAllInfrastructure({
  cables: { region: 'Pacific' },
  ixps: { country: 'SG' },
  datacenters: { country: 'SG' },
  attacks: { location: 'SG', dateRange: '1h' }
});
```

## Handling Fallbacks

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

### Force Refresh

```javascript
// Force fresh data from API (bypass cache)
await orchestrator.invalidateCache('cables');
const freshCables = await orchestrator.getCables();

// Or use dedicated refresh method
const refreshedIXPs = await orchestrator.refreshData('ixps');
```

## Health Monitoring

### Check Service Health

```javascript
const health = orchestrator.getHealth();

console.log('Orchestrator:', health.orchestrator);
console.log('Services:', health.services);
console.log('Cache stats:', health.cache);
console.log('API statistics:', health.statistics);

// Check individual services
console.log('PeeringDB health:', health.services.peeringdb);
console.log('Cloudflare Radar health:', health.services.cloudflareRadar);

// Example output:
// {
//   orchestrator: {
//     autoRefresh: true,
//     cacheEnabled: true,
//     refreshInterval: 300000,
//     activeRefreshTimers: 3
//   },
//   services: {
//     peeringdb: {
//       service: 'peeringdb',
//       rateLimit: {
//         requests: 100,
//         remaining: 87,
//         resetAt: 1704123600000
//       },
//       circuitState: { state: 'closed' }
//     },
//     cloudflareRadar: {
//       service: 'cloudflare-radar',
//       authenticated: true,
//       polling: true,
//       rateLimit: {
//         requests: 300,
//         remaining: 245,
//         percentRemaining: '81.7'
//       }
//     }
//   }
// }
```

### Monitor Rate Limits

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

## Error Handling

### Graceful Degradation

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

## Performance Optimization

### Lazy Loading by Region

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
    // Cables are global, fetch once
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

### Request Deduplication

The API client automatically deduplicates concurrent identical requests:

```javascript
// These 3 concurrent requests will only make 1 API call
const [r1, r2, r3] = await Promise.all([
  orchestrator.getIXPs({ country: 'US' }),
  orchestrator.getIXPs({ country: 'US' }),
  orchestrator.getIXPs({ country: 'US' })
]);

console.log(r1 === r2); // true (same object reference)
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

## Real-World Integration Example

### Complete Globe Visualization

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
    if (confidence > 0.9) return '#00ff00'; // Green - high confidence
    if (confidence > 0.7) return '#ffff00'; // Yellow - medium
    if (confidence > 0.5) return '#ff9900'; // Orange - low
    return '#ff0000'; // Red - very low
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

## Development vs Production

### Development Mode (with Vite proxy)

```javascript
// Uses Vite proxy - no CORS issues
const orchestrator = new DataOrchestrator({
  peeringdb: {
    baseUrl: '/api/peeringdb' // Proxied by Vite
  },
  cloudflareRadar: {
    baseUrl: '/api/cloudflare',
    token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN
  }
});
```

### Production Mode (with serverless proxy)

```javascript
// Uses serverless function for CORS
const orchestrator = new DataOrchestrator({
  peeringdb: {
    baseUrl: '/api/proxy?url=https://api.peeringdb.com/api'
  },
  cloudflareRadar: {
    baseUrl: '/api/cloudflare-proxy',
    token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN
  }
});
```

## Debugging

### Enable Debug Logging

```javascript
// In browser console
localStorage.setItem('debug', 'true');

// Or in code
if (import.meta.env.DEV) {
  console.log('Development mode - verbose logging enabled');
}
```

### Inspect API Calls

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

### Test Data Sources Individually

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

## Common Issues and Solutions

### Issue: CORS Errors

```javascript
// Solution 1: Use Vite proxy (development)
// See vite.config.js

// Solution 2: Use CORS proxy (testing)
const orchestrator = new DataOrchestrator({
  peeringdb: {
    corsProxy: 'https://corsproxy.io/?'
  }
});

// Solution 3: Serverless function (production)
// Deploy proxy function to Vercel/Netlify
```

### Issue: Rate Limit Exceeded

```javascript
// Solution: Increase cache TTL and reduce polling
const orchestrator = new DataOrchestrator({
  enableCache: true,
  refreshInterval: 600000, // 10 minutes instead of 5

  // Increase cache duration
  cache: {
    defaultTTL: 86400000 // 24 hours
  }
});

// Reduce Cloudflare polling frequency
const cloudflare = new CloudflareRadarAPI({
  pollInterval: 120000 // 2 minutes instead of 1
});
```

### Issue: Missing API Keys

```javascript
// Check if keys are configured
const orchestrator = new DataOrchestrator();
const health = orchestrator.getHealth();

if (!health.services.cloudflareRadar.authenticated) {
  console.warn('Cloudflare Radar token not configured');
  showAPIKeyWarning('cloudflare');
}
```

---

For more information, see:
- [API Integration Guide](./API_INTEGRATION_GUIDE.md)
- [API Service Documentation](../src/services/apiService.js)
- [Data Orchestrator Source](../src/services/dataOrchestrator.js)
