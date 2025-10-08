# Implementation Guide: Integration Architecture

## Quick Start Implementation

This guide provides practical, step-by-step instructions for implementing the integration architecture.

## 1. Project Setup

### 1.1 Install Dependencies

```bash
# Core dependencies
npm install three globe.gl d3 gsap

# State management
npm install zustand  # or redux @reduxjs/toolkit

# Caching & offline
npm install idb workbox-webpack-plugin

# API & networking
npm install axios ky

# Development
npm install -D @types/three @types/d3 vite
```

### 1.2 Environment Configuration

Create `.env` file:

```bash
# API Keys
VITE_PEERINGDB_API_KEY=optional  # Public API, no key needed
VITE_RIPE_ATLAS_API_KEY=your_key_here
VITE_CLOUDFLARE_RADAR_API_KEY=your_key_here

# API Endpoints
VITE_PEERINGDB_API=https://api.peeringdb.com/api
VITE_HE_BGP_API=https://bgp.he.net
VITE_RIPE_ATLAS_API=https://atlas.ripe.net/api/v2
VITE_CLOUDFLARE_RADAR_API=https://api.cloudflare.com/client/v4/radar

# Feature Flags
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_AUTO_REFRESH=true
VITE_ENABLE_KB_OVERLAYS=true

# Performance
VITE_MAX_CONCURRENT_REQUESTS=6
VITE_REQUEST_TIMEOUT=10000
VITE_CACHE_L1_SIZE=52428800  # 50MB
VITE_CACHE_L2_SIZE=104857600 # 100MB
```

### 1.3 Project Structure

```
src/
├── services/
│   ├── api/
│   │   ├── index.ts              # API service manager
│   │   ├── peeringdb.ts          # PeeringDB integration
│   │   ├── bgp.ts                # BGP data service
│   │   ├── ripe-atlas.ts         # RIPE Atlas service
│   │   ├── cloudflare-radar.ts   # Cloudflare Radar
│   │   └── circuit-breaker.ts    # Circuit breaker pattern
│   ├── cache/
│   │   ├── index.ts              # Cache manager
│   │   ├── memory-cache.ts       # L1: Memory cache
│   │   ├── indexeddb-cache.ts    # L2: IndexedDB cache
│   │   └── sw-cache.ts           # L3: Service Worker cache
│   ├── kb/
│   │   ├── index.ts              # KB service
│   │   ├── search.ts             # Search engine
│   │   ├── navigator.ts          # KB navigation
│   │   └── contextual.ts         # Context-aware content
│   ├── transform/
│   │   ├── index.ts              # Transformation pipeline
│   │   ├── cable.ts              # Cable transformers
│   │   ├── ixp.ts                # IXP transformers
│   │   └── route.ts              # Route transformers
│   └── websocket/
│       ├── index.ts              # WebSocket manager
│       └── reconnect.ts          # Reconnection logic
├── state/
│   ├── store.ts                  # State store
│   ├── slices/
│   │   ├── infrastructure.ts     # Infrastructure state
│   │   ├── kb.ts                 # KB state
│   │   └── freshness.ts          # Freshness state
│   └── middleware/
│       ├── cache.ts              # Cache middleware
│       └── logger.ts             # Logger middleware
├── components/
│   ├── visualization/
│   │   ├── Globe.tsx             # Main globe component
│   │   ├── Cables.tsx            # Cable rendering
│   │   └── DataCenters.tsx       # Data center rendering
│   └── overlays/
│       ├── Tooltip.tsx           # Tooltip overlay
│       ├── SidePanel.tsx         # Side panel overlay
│       └── Modal.tsx             # Modal overlay
├── utils/
│   ├── geo.ts                    # Geographic calculations
│   ├── performance.ts            # Performance utilities
│   └── retry.ts                  # Retry logic
└── types/
    ├── api.ts                    # API types
    ├── data.ts                   # Data types
    └── visualization.ts          # Visualization types
```

## 2. Core Implementation Steps

### Step 1: API Service Layer (Week 1)

#### Create API Service Manager

`src/services/api/index.ts`:

```typescript
import { CircuitBreaker } from './circuit-breaker';
import { RateLimiter } from './rate-limiter';

export class APIServiceManager {
  private services: Map<string, APIService>;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private rateLimiters: Map<string, RateLimiter>;

  constructor() {
    this.services = new Map();
    this.circuitBreakers = new Map();
    this.rateLimiters = new Map();

    this.initializeServices();
  }

  private initializeServices() {
    // PeeringDB
    this.registerService('peeringdb', {
      baseUrl: import.meta.env.VITE_PEERINGDB_API,
      rateLimit: { requests: 100, window: 3600000 }
    });

    // RIPE Atlas
    this.registerService('ripe-atlas', {
      baseUrl: import.meta.env.VITE_RIPE_ATLAS_API,
      apiKey: import.meta.env.VITE_RIPE_ATLAS_API_KEY,
      rateLimit: { requests: 1000, window: 86400000 }
    });

    // Add other services...
  }

  async fetch<T>(
    service: string,
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    const circuitBreaker = this.circuitBreakers.get(service);
    const rateLimiter = this.rateLimiters.get(service);

    // Check rate limit
    await rateLimiter.consume(1);

    // Execute with circuit breaker protection
    return circuitBreaker.call(async () => {
      const response = await this.services.get(service).fetch(endpoint, options);
      return this.transformResponse<T>(response, service);
    });
  }
}
```

#### Implement Circuit Breaker

`src/services/api/circuit-breaker.ts`:

```typescript
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private nextAttempt = 0;

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

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
    }
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= 5) {
      this.state = 'open';
      this.nextAttempt = Date.now() + 60000; // 60s timeout
    }
  }
}
```

### Step 2: Caching Layer (Week 1)

#### Create Cache Manager

`src/services/cache/index.ts`:

```typescript
import { MemoryCache } from './memory-cache';
import { IndexedDBCache } from './indexeddb-cache';
import { ServiceWorkerCache } from './sw-cache';

export class CacheManager {
  private l1: MemoryCache;
  private l2: IndexedDBCache;
  private l3: ServiceWorkerCache;

  constructor() {
    this.l1 = new MemoryCache(50 * 1024 * 1024); // 50MB
    this.l2 = new IndexedDBCache('internet-map-cache');
    this.l3 = new ServiceWorkerCache();
  }

  async get(key: string): Promise<any> {
    // Try L1
    let data = await this.l1.get(key);
    if (data) return data;

    // Try L2
    data = await this.l2.get(key);
    if (data) {
      await this.l1.set(key, data);
      return data;
    }

    // Try L3
    data = await this.l3.get(key);
    if (data) {
      await this.l1.set(key, data);
      await this.l2.set(key, data);
      return data;
    }

    return null;
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const { ttl = 300000, persist = true, offline = true } = options || {};

    // Always set in L1
    await this.l1.set(key, value, ttl);

    // Conditionally persist
    if (persist) {
      await this.l2.set(key, value, ttl);
    }

    if (offline) {
      await this.l3.set(key, value);
    }
  }
}
```

#### Implement Memory Cache

`src/services/cache/memory-cache.ts`:

```typescript
export class MemoryCache {
  private cache: Map<string, CachedItem> = new Map();
  private size = 0;

  constructor(private maxSize: number) {}

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.size -= item.size;
      return null;
    }

    return item.value;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    const size = this.estimateSize(value);

    // Evict if needed
    while (this.size + size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      size,
      expiresAt: Date.now() + ttl,
      accessedAt: Date.now()
    });

    this.size += size;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.accessedAt < oldestTime) {
        oldestTime = item.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const item = this.cache.get(oldestKey)!;
      this.cache.delete(oldestKey);
      this.size -= item.size;
    }
  }
}
```

### Step 3: Knowledge Base Service (Week 2)

#### Create KB Service

`src/services/kb/index.ts`:

```typescript
import { SearchEngine } from './search';
import { KBNavigator } from './navigator';

export class KnowledgeBaseService {
  private search: SearchEngine;
  private navigator: KBNavigator;
  private articles: Map<string, KBArticle> = new Map();

  constructor() {
    this.search = new SearchEngine();
    this.navigator = new KBNavigator();
    this.loadKnowledgeBase();
  }

  private async loadKnowledgeBase(): Promise<void> {
    // Load all KB articles
    const articles = await this.loadArticles();

    articles.forEach(article => {
      this.articles.set(article.id, article);
    });

    // Index for search
    await this.search.indexArticles(articles);
  }

  async getArticle(id: string): Promise<KBArticle> {
    return this.articles.get(id);
  }

  async searchArticles(query: string): Promise<KBArticle[]> {
    return this.search.search(query);
  }

  async getRelatedArticles(context: Context): Promise<KBArticle[]> {
    const { elementType, elementId, userLevel } = context;

    // Find articles related to element
    const candidates = Array.from(this.articles.values())
      .filter(article =>
        article.metadata.visualizations?.includes(elementId) ||
        article.category === elementType
      );

    // Rank by relevance
    const ranked = this.rankArticles(candidates, context);

    return ranked.slice(0, 5);
  }

  async getTooltipContent(
    elementType: string,
    elementId: string
  ): Promise<TooltipContent> {
    const articles = await this.getRelatedArticles({
      elementType,
      elementId,
      userLevel: 'beginner'
    });

    const primary = articles[0];

    return {
      title: primary.title,
      summary: primary.content.summary,
      actions: [
        { label: 'Learn More', action: () => this.openArticle(primary.id) },
        { label: 'Related Topics', action: () => this.showRelated(primary.id) }
      ]
    };
  }
}
```

#### Implement Search Engine

`src/services/kb/search.ts`:

```typescript
export class SearchEngine {
  private index: Map<string, Set<string>> = new Map();
  private articles: KBArticle[] = [];

  async indexArticles(articles: KBArticle[]): Promise<void> {
    this.articles = articles;

    for (const article of articles) {
      const tokens = this.tokenize(
        article.title + ' ' + article.content.summary
      );

      for (const token of tokens) {
        const docs = this.index.get(token) || new Set();
        docs.add(article.id);
        this.index.set(token, docs);
      }
    }
  }

  async search(query: string): Promise<KBArticle[]> {
    const tokens = this.tokenize(query);
    const scores: Map<string, number> = new Map();

    // Calculate relevance scores
    for (const token of tokens) {
      const docs = this.index.get(token);
      if (!docs) continue;

      for (const docId of docs) {
        const score = scores.get(docId) || 0;
        scores.set(docId, score + 1);
      }
    }

    // Sort by score
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.articles.find(a => a.id === id)!);

    return sorted;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(token => token.length > 2);
  }
}
```

### Step 4: Data Transformation (Week 2)

#### Create Transformation Pipeline

`src/services/transform/index.ts`:

```typescript
export class TransformationPipeline {
  private transformers: Map<DataSource, DataTransformer> = new Map();

  constructor() {
    this.registerTransformers();
  }

  async transform(
    rawData: any,
    source: DataSource
  ): Promise<TransformedData> {
    const transformer = this.transformers.get(source);

    if (!transformer) {
      throw new Error(`No transformer for source: ${source}`);
    }

    // Transform
    const transformed = await transformer.transform(rawData, source);

    // Validate
    const validation = await transformer.validate(transformed);
    if (!validation.valid) {
      throw new TransformationError(validation.errors);
    }

    // Enrich
    const enriched = await transformer.enrich(transformed);

    // Add confidence score
    enriched.metadata.confidence = this.calculateConfidence(enriched);

    return enriched;
  }

  private calculateConfidence(data: TransformedData): number {
    const sourceReliability = {
      'peeringdb': 0.98,
      'ripe-atlas': 0.95,
      'bgp': 1.0,
      'telegeography': 0.8,
      'estimated': 0.5
    };

    const baseScore = sourceReliability[data.metadata.source] || 0.5;

    // Adjust for freshness
    const age = Date.now() - data.metadata.lastUpdated;
    const freshnessScore = Math.max(0, 1 - (age / 86400000)); // Decay over 24h

    // Adjust for completeness
    const completeness = Object.keys(data.properties).length / 10;

    return (baseScore * 0.5) + (freshnessScore * 0.3) + (completeness * 0.2);
  }
}
```

### Step 5: WebSocket Integration (Week 3)

#### Create WebSocket Manager

`src/services/websocket/index.ts`:

```typescript
export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<Callback>> = new Map();

  async subscribe(topic: string, callback: Callback): Promise<void> {
    const source = this.getSourceForTopic(topic);

    if (!this.connections.has(source)) {
      await this.connect(source);
    }

    const subs = this.subscriptions.get(topic) || new Set();
    subs.add(callback);
    this.subscriptions.set(topic, subs);
  }

  private async connect(source: string): Promise<void> {
    const url = this.getWebSocketURL(source);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log(`WebSocket connected: ${source}`);
      this.connections.set(source, ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error: ${source}`, error);
    };

    ws.onclose = () => {
      this.connections.delete(source);
      this.reconnect(source);
    };
  }

  private handleMessage(message: WSMessage): void {
    const { topic, data } = message;

    // Update cache
    cache.set(topic, data, { ttl: 300000 });

    // Notify subscribers
    const subs = this.subscriptions.get(topic);
    if (subs) {
      subs.forEach(callback => callback(data));
    }
  }

  private async reconnect(source: string, attempt = 1): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);

    setTimeout(async () => {
      try {
        await this.connect(source);
      } catch (error) {
        if (attempt < 5) {
          await this.reconnect(source, attempt + 1);
        }
      }
    }, delay);
  }
}
```

### Step 6: State Management (Week 3)

#### Create State Store

`src/state/store.ts`:

```typescript
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // Infrastructure state
  cables: Cable[];
  dataCenters: DataCenter[];
  ixps: IXP[];

  // UI state
  activeOverlay: Overlay | null;
  selectedElement: VisElement | null;

  // Data freshness
  freshness: Map<string, DataFreshness>;

  // Actions
  setCables: (cables: Cable[]) => void;
  setDataCenters: (centers: DataCenter[]) => void;
  updateFreshness: (id: string, freshness: DataFreshness) => void;
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
}

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        cables: [],
        dataCenters: [],
        ixps: [],
        activeOverlay: null,
        selectedElement: null,
        freshness: new Map(),

        setCables: (cables) => set({ cables }),
        setDataCenters: (dataCenters) => set({ dataCenters }),

        updateFreshness: (id, freshness) =>
          set((state) => {
            const newFreshness = new Map(state.freshness);
            newFreshness.set(id, freshness);
            return { freshness: newFreshness };
          }),

        openOverlay: (overlay) => set({ activeOverlay: overlay }),
        closeOverlay: () => set({ activeOverlay: null }),
      }),
      { name: 'internet-map-storage' }
    )
  )
);
```

## 3. Testing Implementation

### Unit Tests

```typescript
// src/services/api/__tests__/circuit-breaker.test.ts
import { CircuitBreaker } from '../circuit-breaker';

describe('CircuitBreaker', () => {
  it('should open after threshold failures', async () => {
    const breaker = new CircuitBreaker(3, 60000);
    const failingFn = () => Promise.reject(new Error('fail'));

    for (let i = 0; i < 3; i++) {
      try {
        await breaker.call(failingFn);
      } catch {}
    }

    expect(breaker.getState().state).toBe('open');
  });

  it('should allow request after timeout', async () => {
    jest.useFakeTimers();
    const breaker = new CircuitBreaker(1, 1000);

    // Fail once to open circuit
    try {
      await breaker.call(() => Promise.reject(new Error('fail')));
    } catch {}

    // Fast forward time
    jest.advanceTimersByTime(1001);

    // Should allow next request
    const result = await breaker.call(() => Promise.resolve('success'));
    expect(result).toBe('success');
  });
});
```

### Integration Tests

```typescript
// src/services/__tests__/integration.test.ts
import { APIServiceManager } from '../api';
import { CacheManager } from '../cache';
import { TransformationPipeline } from '../transform';

describe('Integration: API → Cache → Transform', () => {
  it('should fetch, cache, and transform data', async () => {
    const api = new APIServiceManager();
    const cache = new CacheManager();
    const transform = new TransformationPipeline();

    // Fetch from API
    const raw = await api.fetch('peeringdb', '/ix');

    // Cache the response
    await cache.set('ixps', raw, { ttl: 3600000 });

    // Retrieve from cache
    const cached = await cache.get('ixps');
    expect(cached).toEqual(raw);

    // Transform
    const transformed = await transform.transform(cached, 'peeringdb');
    expect(transformed).toHaveProperty('metadata.confidence');
  });
});
```

## 4. Deployment Steps

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Check bundle size
npm run analyze
```

### Service Worker Setup

`public/sw.js`:

```javascript
const CACHE_NAME = 'internet-map-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Performance Monitoring

```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  static measureAPICall<T>(
    service: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();

    return fn().finally(() => {
      const duration = performance.now() - start;

      // Send to analytics
      analytics.track('api_call', {
        service,
        duration,
        timestamp: Date.now()
      });
    });
  }
}
```

## 5. Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Use proxy in development

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api/peeringdb': {
        target: 'https://api.peeringdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/peeringdb/, '/api')
      }
    }
  }
}
```

### Issue 2: Cache Not Persisting
**Solution**: Check IndexedDB quota

```typescript
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const { usage, quota } = await navigator.storage.estimate();
  console.log(`Using ${usage} of ${quota} bytes`);
}
```

### Issue 3: WebSocket Disconnects
**Solution**: Implement reconnection with exponential backoff

```typescript
private async reconnect(attempt = 1): Promise<void> {
  const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
  await new Promise(resolve => setTimeout(resolve, delay));

  try {
    await this.connect();
  } catch (error) {
    if (attempt < 5) {
      await this.reconnect(attempt + 1);
    }
  }
}
```

## 6. Next Steps

1. **Week 1-2**: Implement API service layer and caching
2. **Week 3-4**: Build knowledge base integration
3. **Week 5-6**: Add real-time features (WebSocket)
4. **Week 7-8**: Polish, optimize, and deploy

## Resources

- [Three.js Examples](https://threejs.org/examples/)
- [D3.js Observable](https://observablehq.com/@d3)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)
- [Service Worker Cookbook](https://serviceworke.rs/)

---

**Ready to start building!** Begin with Step 1 and work through each phase systematically.
