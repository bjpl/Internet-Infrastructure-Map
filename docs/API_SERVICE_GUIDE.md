# API Service Layer Guide

Complete guide to using the Internet Infrastructure Map API services.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Services](#core-services)
3. [Data Sources](#data-sources)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)
6. [Performance Optimization](#performance-optimization)

## Quick Start

### Installation

```javascript
import { DataOrchestrator } from './src/services/dataOrchestrator.js';

// Create orchestrator with default config
const orchestrator = new DataOrchestrator({
  enableAutoRefresh: true,
  refreshInterval: 300000, // 5 minutes
  enableCache: true
});

// Get infrastructure data
const cables = await orchestrator.getCables();
const ixps = await orchestrator.getIXPs();
const datacenters = await orchestrator.getDataCenters();
```

## Core Services

### 1. APIClient

Production-ready HTTP client with resilience patterns.

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

**Features:**
- Circuit breaker pattern prevents cascading failures
- Exponential backoff retry logic
- Request deduplication
- Response transformation pipeline
- Configurable timeouts

### 2. CacheService

Multi-layer caching with L1 (Memory) and L2 (IndexedDB).

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
    // Fetch fresh data
    return await api.getIXPs();
  }
);
```

**Features:**
- LRU eviction for memory cache
- Persistent storage with IndexedDB
- Stale-while-revalidate pattern
- Smart invalidation strategies
- Cache statistics tracking

### 3. DataOrchestrator

Central coordinator for all data sources.

```javascript
import { DataOrchestrator } from './src/services/dataOrchestrator.js';

const orchestrator = new DataOrchestrator({
  enableAutoRefresh: true,
  refreshInterval: 300000,
  enableCache: true,
  cache: {
    l1MaxSize: 50 * 1024 * 1024
  }
});

// Get all infrastructure
const infrastructure = await orchestrator.getAllInfrastructure();

// Force refresh
await orchestrator.refreshData('cables');

// Get health status
const health = orchestrator.getHealth();
console.log('Cache hit rate:', health.statistics.cacheHitRate);
```

## Data Sources

### 1. TeleGeographyAPI

Submarine cable data.

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

**Data Returned:**
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

### 2. PeeringDBAPI

IXP and data center data.

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

**Data Returned:**
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

### 3. FallbackDataSource

Estimated and static fallback data.

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
const metric = await fallback.estimateMetric('latency', { context: 'trans-atlantic' });
```

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

### Example 2: Manual Refresh with User Feedback

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

### Example 3: Regional Filtering

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

### Example 4: Monitoring and Health Checks

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

## Error Handling

### Graceful Degradation

The orchestrator automatically falls back through these levels:

1. **Live API** → confidence: 1.0
2. **Recent Cache** → confidence: 0.9
3. **Stale Cache** → confidence: 0.7
4. **Estimated Data** → confidence: 0.5
5. **Fallback Static** → confidence: 0.5

```javascript
try {
  const result = await orchestrator.getCables();

  // Check data quality
  if (result.metadata.source === 'fallback') {
    console.warn('Using fallback data:', result.metadata.fallbackReason);
    showDataQualityWarning(result.metadata.confidence);
  }

  return result.data;

} catch (error) {
  // All fallbacks exhausted
  console.error('Complete failure:', error);
  showErrorState();
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

## Performance Optimization

### Request Batching

```javascript
// These requests will be automatically batched
const promises = [
  orchestrator.getCables({ region: 'Atlantic' }),
  orchestrator.getCables({ region: 'Pacific' }),
  orchestrator.getCables({ region: 'Indian' })
];

const [atlantic, pacific, indian] = await Promise.all(promises);
```

### Lazy Loading

```javascript
// Only load visible data
async function loadVisibleInfrastructure(viewport) {
  // Get bounding box
  const bounds = viewport.getBounds();

  // Load data for visible region only
  const cables = await orchestrator.getCables({
    bounds: {
      north: bounds.north,
      south: bounds.south,
      east: bounds.east,
      west: bounds.west
    }
  });

  return cables;
}
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

## Best Practices

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

## Troubleshooting

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

---

**Complete API documentation**: See JSDoc comments in source files
**Architecture details**: See `docs/architecture/integration-architecture.md`
**Test examples**: See `tests/services/` directory
