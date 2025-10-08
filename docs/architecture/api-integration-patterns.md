# API Integration Patterns

## 1. Supported Data Sources

### Tier 1: Live APIs (High Accuracy, Real-time)

#### 1.1 PeeringDB API
**Purpose**: Internet Exchange Points (IXPs) and interconnection data

```typescript
// Configuration
const PEERINGDB_CONFIG = {
  baseUrl: 'https://api.peeringdb.com/api',
  rateLimit: { requests: 100, window: 3600000 }, // 100/hour
  auth: { type: 'none' }, // Public API
  cache: { ttl: 86400000 } // 24 hours
};

// Example endpoints
interface PeeringDBEndpoints {
  // Get all IXPs
  getIXPs: () => Promise<IXP[]>;
  // GET /ix?depth=2

  // Get specific IXP
  getIXP: (id: number) => Promise<IXP>;
  // GET /ix/{id}

  // Get networks at IXP
  getIXPNetworks: (ixId: number) => Promise<Network[]>;
  // GET /netixlan?ix_id={ixId}

  // Get data centers (facilities)
  getDataCenters: () => Promise<Facility[]>;
  // GET /fac?depth=2
}

// Usage example
async function fetchIXPData(): Promise<EnrichedIXP[]> {
  const ixps = await peeringDB.getIXPs();

  return Promise.all(ixps.map(async (ixp) => {
    const networks = await peeringDB.getIXPNetworks(ixp.id);

    return {
      ...ixp,
      networks,
      metadata: {
        source: 'peeringdb',
        confidence: 0.98,
        freshness: 'realtime',
        lastUpdated: Date.now()
      }
    };
  }));
}
```

#### 1.2 Hurricane Electric BGP Toolkit
**Purpose**: BGP routing data, AS relationships

```typescript
const HE_BGP_CONFIG = {
  baseUrl: 'https://bgp.he.net',
  rateLimit: { requests: 60, window: 60000 }, // 60/min
  auth: { type: 'none' },
  cache: { ttl: 300000 } // 5 minutes
};

interface BGPEndpoints {
  // Get AS information
  getAS: (asn: number) => Promise<ASInfo>;
  // GET /AS{asn}

  // Get AS prefixes
  getASPrefixes: (asn: number) => Promise<Prefix[]>;
  // GET /AS{asn}/prefixes

  // Get peering relationships
  getPeers: (asn: number) => Promise<Peer[]>;
  // GET /AS{asn}/peers

  // Get AS path
  getASPath: (prefix: string) => Promise<ASPath>;
  // GET /prefix/{prefix}
}

// Usage with transformation
async function fetchBGPRoutes(asn: number): Promise<TransformedRoute[]> {
  try {
    const [asInfo, prefixes, peers] = await Promise.all([
      bgpToolkit.getAS(asn),
      bgpToolkit.getASPrefixes(asn),
      bgpToolkit.getPeers(asn)
    ]);

    return transformBGPData({
      asInfo,
      prefixes,
      peers,
      metadata: {
        source: 'hurricane-electric',
        confidence: 1.0,
        freshness: 'realtime'
      }
    });
  } catch (error) {
    // Fallback to cached or estimated data
    return fallbackBGPData(asn, error);
  }
}
```

#### 1.3 RIPE Atlas Measurements
**Purpose**: Real-time latency, traceroute, and network measurements

```typescript
const RIPE_ATLAS_CONFIG = {
  baseUrl: 'https://atlas.ripe.net/api/v2',
  apiKey: process.env.RIPE_ATLAS_KEY,
  rateLimit: { requests: 1000, window: 86400000 }, // 1000/day
  cache: { ttl: 60000 } // 1 minute
};

interface RIPEAtlasEndpoints {
  // Get measurement results
  getMeasurement: (id: number) => Promise<Measurement>;
  // GET /measurements/{id}

  // Get latest results
  getLatestResults: (id: number) => Promise<MeasurementResult[]>;
  // GET /measurements/{id}/results

  // Create new measurement
  createMeasurement: (spec: MeasurementSpec) => Promise<Measurement>;
  // POST /measurements

  // Get probes
  getProbes: (filters?: ProbeFilters) => Promise<Probe[]>;
  // GET /probes
}

// Real-time latency measurement
async function measureLatency(
  target: string,
  probeIds: number[]
): Promise<LatencyData[]> {
  // Create ping measurement
  const measurement = await ripeAtlas.createMeasurement({
    type: 'ping',
    target,
    probes: probeIds,
    packets: 3
  });

  // Wait for results
  await delay(5000);

  const results = await ripeAtlas.getLatestResults(measurement.id);

  return results.map(result => ({
    probeId: result.prb_id,
    target,
    latency: result.avg,
    timestamp: result.timestamp,
    metadata: {
      source: 'ripe-atlas',
      confidence: 0.95,
      freshness: 'realtime'
    }
  }));
}
```

#### 1.4 Cloudflare Radar API
**Purpose**: Internet traffic patterns, routing, security events

```typescript
const CLOUDFLARE_RADAR_CONFIG = {
  baseUrl: 'https://api.cloudflare.com/client/v4/radar',
  apiKey: process.env.CLOUDFLARE_API_KEY,
  rateLimit: { requests: 1200, window: 300000 }, // 1200/5min
  cache: { ttl: 300000 } // 5 minutes
};

interface CloudflareRadarEndpoints {
  // Get BGP updates
  getBGPUpdates: (asn?: number) => Promise<BGPUpdate[]>;
  // GET /bgp/updates

  // Get routing leaks
  getRoutingLeaks: () => Promise<RoutingLeak[]>;
  // GET /bgp/leaks

  // Get DDoS attacks
  getDDoSAttacks: (filters?: AttackFilters) => Promise<Attack[]>;
  // GET /attacks/layer3

  // Get traffic trends
  getTrafficTrends: (location?: string) => Promise<TrafficTrend[]>;
  // GET /http/timeseries
}

// WebSocket for real-time updates
class CloudflareRadarStream {
  private ws: WebSocket;

  async subscribe(topics: string[]): Promise<void> {
    this.ws = new WebSocket('wss://radar.cloudflare.com/stream');

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        topics,
        apiKey: CLOUDFLARE_RADAR_CONFIG.apiKey
      }));
    };

    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleUpdate(update);
    };
  }

  private handleUpdate(update: RadarUpdate): void {
    switch (update.type) {
      case 'bgp-update':
        eventBus.emit('bgp-update', update.data);
        break;
      case 'attack':
        eventBus.emit('ddos-attack', update.data);
        break;
      case 'traffic':
        eventBus.emit('traffic-update', update.data);
        break;
    }
  }
}
```

### Tier 2: Estimated/Calculated Data

#### 2.1 Submarine Cable Map
**Purpose**: Cable locations and specifications

```typescript
// Static dataset with periodic updates
const SUBMARINE_CABLE_CONFIG = {
  dataUrl: 'https://github.com/telegeography/www.submarinecablemap.com/raw/master/web/public/api/v3/cable/cable.json',
  updateFrequency: 2592000000, // 30 days
  cache: { ttl: 2592000000 }
};

async function fetchCableData(): Promise<EnrichedCable[]> {
  const cables = await fetch(SUBMARINE_CABLE_CONFIG.dataUrl).then(r => r.json());

  return cables.map(cable => ({
    ...cable,
    // Calculate estimated path if not provided
    estimatedPath: cable.coordinates || calculateCablePath(cable.landing_points),
    // Estimate latency based on distance
    estimatedLatency: calculateLatency(cable.length, cable.fiber_type),
    // Estimate current utilization
    estimatedUtilization: estimateUtilization(cable),
    metadata: {
      source: 'telegeography',
      confidence: cable.coordinates ? 0.9 : 0.6,
      freshness: 'estimated',
      lastUpdated: cable.updated_at
    }
  }));
}

function calculateCablePath(landingPoints: LandingPoint[]): GeoJSON.LineString {
  // Great circle route with waypoints to avoid land
  const points = landingPoints.map(lp => [lp.longitude, lp.latitude]);
  return {
    type: 'LineString',
    coordinates: greatCircleRoute(points[0], points[1], {
      avoidLand: true,
      npoints: 100
    })
  };
}
```

#### 2.2 MaxMind GeoIP
**Purpose**: IP geolocation for data centers and infrastructure

```typescript
const MAXMIND_CONFIG = {
  dataPath: './data/GeoIP2-City.mmdb',
  updateFrequency: 604800000, // 7 days
};

async function geolocateInfrastructure(
  ipAddress: string
): Promise<GeoLocation> {
  const reader = await maxmind.open(MAXMIND_CONFIG.dataPath);
  const result = reader.get(ipAddress);

  return {
    city: result.city?.names.en,
    country: result.country?.iso_code,
    location: {
      lat: result.location?.latitude,
      lng: result.location?.longitude,
      accuracy: result.location?.accuracy_radius
    },
    metadata: {
      source: 'maxmind',
      confidence: 0.75,
      freshness: 'estimated'
    }
  };
}
```

## 2. Integration Patterns

### 2.1 Request Batching Pattern

```typescript
class RequestBatcher {
  private queue: Map<string, APIRequest[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  async add<T>(
    service: string,
    request: APIRequest
  ): Promise<T> {
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

    // Group by endpoint
    const grouped = this.groupByEndpoint(batch);

    // Execute in parallel
    await Promise.all(
      Array.from(grouped.entries()).map(([endpoint, requests]) =>
        this.executeGroupedRequest(service, endpoint, requests)
      )
    );
  }

  private async executeGroupedRequest(
    service: string,
    endpoint: string,
    requests: APIRequest[]
  ): Promise<void> {
    try {
      // Single API call for multiple requests if supported
      const ids = requests.map(r => r.params.id);
      const results = await apiService.batchGet(service, endpoint, ids);

      // Resolve individual promises
      requests.forEach((req, i) => {
        req.resolve(results[i]);
      });
    } catch (error) {
      // Reject all
      requests.forEach(req => {
        req.reject(error);
      });
    }
  }
}
```

### 2.2 Stale-While-Revalidate Pattern

```typescript
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

### 2.3 Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = 0;

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private monitorWindow: number = 120000
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

### 2.4 Exponential Backoff Retry Pattern

```typescript
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

### 2.5 Request Deduplication Pattern

```typescript
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
```

## 3. Data Transformation Examples

### 3.1 PeeringDB to Visualization Format

```typescript
async function transformPeeringDBData(
  ixp: PeeringDBIXP
): Promise<VisualIXP> {
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
    },
    kbLinks: await findRelatedKBArticles(ixp)
  };
}

function calculateIXPSize(networkCount: number): number {
  // Logarithmic scale: 1-10 networks = size 1, 100+ = size 3
  return 1 + Math.log10(Math.max(networkCount, 1));
}
```

### 3.2 BGP Routes to Flow Visualization

```typescript
async function transformBGPToFlows(
  routes: BGPRoute[]
): Promise<TrafficFlow[]> {
  const flows: TrafficFlow[] = [];

  for (const route of routes) {
    const asPath = route.path.split(' ').map(Number);

    for (let i = 0; i < asPath.length - 1; i++) {
      const srcAS = asPath[i];
      const dstAS = asPath[i + 1];

      // Get geographic locations
      const [srcLoc, dstLoc] = await Promise.all([
        getASLocation(srcAS),
        getASLocation(dstAS)
      ]);

      flows.push({
        id: `flow-${srcAS}-${dstAS}`,
        type: 'bgp-flow',
        source: srcLoc,
        destination: dstLoc,
        properties: {
          asPath: asPath.slice(i, i + 2),
          prefix: route.prefix,
          communities: route.communities
        },
        visual: {
          arcHeight: 0.3,
          color: getRouteColor(route.type),
          speed: calculateFlowSpeed(route),
          particleCount: 20
        },
        metadata: {
          source: 'bgp',
          confidence: 0.95,
          freshness: 'realtime',
          lastUpdated: route.timestamp
        }
      });
    }
  }

  return flows;
}
```

### 3.3 Cable Data Enhancement

```typescript
async function enhanceCableData(
  cable: SubmarineCable
): Promise<EnhancedCable> {
  // Find related KB articles
  const kbArticles = await kbService.search({
    keywords: [cable.name, 'submarine cable', cable.cable_type],
    type: 'infrastructure'
  });

  // Calculate derived metrics
  const latency = calculateCableLatency(cable.length, cable.fiber_type);
  const capacity = parseCableCapacity(cable.design_capacity);

  // Estimate current utilization
  const utilization = await estimateCableUtilization(cable.id);

  return {
    ...cable,
    derived: {
      estimatedLatency: latency,
      capacityGbps: capacity,
      estimatedUtilization: utilization,
      ageYears: new Date().getFullYear() - cable.ready_for_service
    },
    kbLinks: kbArticles.map(a => a.id),
    tooltipContent: generateCableTooltip(cable),
    metadata: {
      source: 'telegeography',
      confidence: 0.8,
      freshness: 'estimated',
      lastUpdated: cable.updated_at
    }
  };
}

function calculateCableLatency(
  lengthKm: number,
  fiberType: string
): number {
  // Speed of light in fiber: ~200,000 km/s
  const speedFactor = fiberType === 'SMF' ? 0.67 : 0.64; // Single-mode vs multi-mode
  const propagationDelay = lengthKm / (300000 * speedFactor);

  // Add equipment delays (repeaters every ~100km)
  const repeaters = Math.floor(lengthKm / 100);
  const equipmentDelay = repeaters * 0.1; // 0.1ms per repeater

  return propagationDelay + equipmentDelay;
}
```

## 4. Error Handling Strategies

### 4.1 Fallback Data Strategy

```typescript
class FallbackStrategy {
  async getData(
    dataId: string,
    fetcher: () => Promise<any>
  ): Promise<FallbackResult> {
    try {
      // Try live API
      const data = await fetcher();
      return {
        data,
        source: 'api',
        confidence: 1.0,
        freshness: 'realtime'
      };
    } catch (error) {
      return this.handleError(dataId, error);
    }
  }

  private async handleError(
    dataId: string,
    error: Error
  ): Promise<FallbackResult> {
    // 1. Try cache (any age)
    const cached = await cache.get(dataId, { maxAge: Infinity });
    if (cached) {
      return {
        data: cached.value,
        source: 'cache',
        confidence: 0.7,
        freshness: 'stale',
        age: Date.now() - cached.timestamp
      };
    }

    // 2. Try estimated data
    const estimated = await this.generateEstimatedData(dataId);
    if (estimated) {
      return {
        data: estimated,
        source: 'estimated',
        confidence: 0.5,
        freshness: 'estimated'
      };
    }

    // 3. Use knowledge base data
    const kbData = await kbService.getData(dataId);
    if (kbData) {
      return {
        data: kbData,
        source: 'knowledge-base',
        confidence: 0.6,
        freshness: 'static'
      };
    }

    // 4. No data available
    throw new NoDataAvailableError(dataId, error);
  }

  private async generateEstimatedData(
    dataId: string
  ): Promise<any | null> {
    const type = this.extractDataType(dataId);

    switch (type) {
      case 'cable':
        return this.estimateCableData(dataId);
      case 'route':
        return this.estimateRouteData(dataId);
      case 'metric':
        return this.estimateMetricData(dataId);
      default:
        return null;
    }
  }
}
```

### 4.2 Graceful Degradation

```typescript
class GracefulDegradation {
  async loadVisualization(): Promise<void> {
    const features = {
      realtime: false,
      interactive: true,
      estimated: false,
      offline: false
    };

    try {
      // Try to enable real-time features
      await this.connectWebSocket();
      features.realtime = true;
    } catch (error) {
      console.warn('WebSocket unavailable, falling back to polling');
      this.startPolling();
    }

    try {
      // Try to load live data
      await this.loadLiveData();
    } catch (error) {
      console.warn('Live data unavailable, using estimated');
      features.estimated = true;
      await this.loadEstimatedData();
    }

    try {
      // Setup offline support
      await this.setupServiceWorker();
      features.offline = true;
    } catch (error) {
      console.warn('Offline mode unavailable');
    }

    // Render with available features
    this.render(features);

    // Show feature status to user
    this.displayFeatureStatus(features);
  }

  private displayFeatureStatus(features: Features): void {
    const indicators = {
      realtime: features.realtime ? '🟢 Live' : '🟡 Polling',
      accuracy: features.estimated ? '🟡 Estimated' : '🟢 Accurate',
      offline: features.offline ? '🟢 Available' : '⚪ Unavailable'
    };

    ui.showStatus(indicators);
  }
}
```

## 5. Performance Monitoring

```typescript
class APIPerformanceMonitor {
  private metrics: Map<string, Metric[]> = new Map();

  async track<T>(
    service: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    let success = true;
    let result: T;

    try {
      result = await fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - start;

      this.recordMetric({
        service,
        operation,
        duration,
        success,
        timestamp: Date.now()
      });
    }
  }

  private recordMetric(metric: Metric): void {
    const key = `${metric.service}:${metric.operation}`;
    const metrics = this.metrics.get(key) || [];
    metrics.push(metric);

    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.metrics.set(key, metrics);
  }

  getStats(service: string, operation: string): PerformanceStats {
    const key = `${service}:${operation}`;
    const metrics = this.metrics.get(key) || [];

    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration);
    const successRate = metrics.filter(m => m.success).length / metrics.length;

    return {
      count: metrics.length,
      avgDuration: avg(durations),
      p50: percentile(durations, 50),
      p95: percentile(durations, 95),
      p99: percentile(durations, 99),
      successRate,
      lastUpdate: Math.max(...metrics.map(m => m.timestamp))
    };
  }
}
```

This comprehensive guide covers all major API integration patterns, error handling strategies, and performance considerations for the Internet Infrastructure Map visualization.
