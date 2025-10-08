# Integration Architecture: Real-time API & Knowledge Base Integration

## Executive Summary

This document defines the technical architecture for integrating real-time API data sources and the comprehensive knowledge base into the Live Internet Infrastructure Map visualization. The architecture emphasizes resilience, performance, data accuracy transparency, and educational value through a layered approach that gracefully handles data availability variations.

**Key Design Principles:**
- **Data Accuracy First**: Clear tiering and transparency about data confidence levels
- **Graceful Degradation**: Seamless fallback from live → estimated → cached data
- **Performance Optimized**: Multi-layer caching with smart invalidation strategies
- **Educational Focus**: Deep knowledge base integration for learning and exploration
- **User Context Aware**: Adapt UI/UX based on data freshness and user interactions

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   3D Globe   │  │  Knowledge   │  │   Educational         │  │
│  │ Visualization│  │  Base UI     │  │   Overlays            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT LAYER                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Unified State Store (Zustand/Redux)                          │  │
│  │  - Infrastructure State    - Data Freshness State             │  │
│  │  - Knowledge Base State   - User Context State                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ API Service  │  │  Knowledge   │  │   Data Transformation   │  │
│  │   Manager    │  │  Base Service│  │      Pipeline           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                        CACHING LAYER                                │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  L1: Memory│  │ L2: IndexedDB│  │  L3: Service Worker      │   │
│  │  Cache     │  │  Persistent  │  │  Background Sync         │   │
│  └────────────┘  └──────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL DATA SOURCES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Live APIs│  │ Estimated│  │ Knowledge│  │  Fallback Static │   │
│  │(Tier 1)  │  │Data(Tier2)│  │Base(Local)│  │    Data(Tier 3)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Architecture

```
User Interaction → State Manager → Data Orchestrator
                                         ↓
                          ┌──────────────┴────────────────┐
                          ↓                               ↓
                   Check L1 Cache                  Check KB Service
                          ↓                               ↓
                    Cache Hit? ←─────┐              KB Article?
                      Yes ↓    No    │                    ↓
                          ↓          ↓              Render Overlay
                   Return Data   Check L2/L3
                                     ↓
                              Cache Hit? ←─────┐
                                Yes ↓    No    │
                                    ↓          ↓
                             Return Data   Call API Service
                                                 ↓
                                          ┌──────┴───────┐
                                          ↓              ↓
                                    API Success?    API Failure?
                                          ↓              ↓
                                     Store &        Load Estimated
                                     Return          or Fallback
                                                         ↓
                                                  Mark Data Quality
                                                         ↓
                                    ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                                    Update All Caches
                                           ↓
                                    Update UI State
                                           ↓
                                    Render Visualization
```

---

## 2. Component Architecture

### 2.1 API Service Layer

**Purpose**: Manages all external API interactions with resilience, rate limiting, and data quality tracking.

#### 2.1.1 API Service Manager Interface

```typescript
interface APIServiceManager {
  // Core methods
  fetchInfrastructure(type: InfraType, options?: FetchOptions): Promise<APIResponse>;
  fetchRealTimeMetrics(metric: MetricType): Promise<APIResponse>;
  getDataFreshness(dataId: string): DataFreshness;

  // Health & monitoring
  getServiceHealth(service: string): ServiceHealth;
  getAPIQuota(service: string): QuotaStatus;

  // Fallback handling
  enableFallbackMode(reason: string): void;
  getFallbackData(type: InfraType): FallbackData;
}

interface APIResponse {
  data: any;
  metadata: {
    source: DataSource;
    timestamp: number;
    confidence: 'high' | 'medium' | 'low';
    freshness: 'realtime' | 'cached' | 'estimated' | 'historical';
  };
  cacheControl: {
    ttl: number;
    staleWhileRevalidate: boolean;
  };
}

type DataSource =
  | 'peeringdb'      // IXPs, interconnections
  | 'hurricane-electric' // BGP data
  | 'telegeography'  // Submarine cables
  | 'ripe-atlas'     // Measurements
  | 'cloudflare-radar' // Traffic patterns
  | 'estimated'      // Calculated/inferred
  | 'fallback'       // Offline cache
  | 'knowledge-base'; // Local KB
```

#### 2.1.2 Service Health Monitoring

```typescript
interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  errorRate: number;
  lastSuccess: number;
  consecutiveFailures: number;
  nextRetry?: number;
}

class APIHealthMonitor {
  // Circuit breaker pattern
  private circuitBreakers: Map<string, CircuitBreaker>;

  checkServiceHealth(service: string): ServiceHealth;
  recordSuccess(service: string, latency: number): void;
  recordFailure(service: string, error: Error): void;
  shouldAttemptCall(service: string): boolean;
}

class CircuitBreaker {
  state: 'closed' | 'open' | 'half-open';
  failureThreshold: number = 5;
  timeout: number = 60000; // 60s

  call<T>(fn: () => Promise<T>): Promise<T>;
  onSuccess(): void;
  onFailure(): void;
}
```

#### 2.1.3 Rate Limiting & Quota Management

```typescript
interface RateLimiter {
  // Token bucket algorithm
  consume(service: string, tokens: number): Promise<boolean>;
  getQuota(service: string): QuotaStatus;
  scheduleRequest(service: string, request: Request): Promise<void>;
}

interface QuotaStatus {
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

class APIRateLimiter implements RateLimiter {
  private buckets: Map<string, TokenBucket>;
  private queue: PriorityQueue<ScheduledRequest>;

  // Service-specific limits
  private limits = {
    'peeringdb': { requests: 100, window: 3600000 }, // 100/hour
    'ripe-atlas': { requests: 1000, window: 86400000 }, // 1000/day
    'cloudflare-radar': { requests: 50, window: 60000 }, // 50/min
  };
}
```

### 2.2 Data Transformation Layer

**Purpose**: Normalize data from various sources into a unified format for visualization.

#### 2.2.1 Data Transformer Pipeline

```typescript
interface DataTransformer {
  transform(rawData: any, source: DataSource): TransformedData;
  validate(data: TransformedData): ValidationResult;
  enrich(data: TransformedData): EnrichedData;
}

interface TransformedData {
  type: 'cable' | 'datacenter' | 'ixp' | 'route' | 'metric';
  id: string;
  properties: Record<string, any>;
  geometry?: GeoJSON.Geometry;
  metadata: {
    source: DataSource;
    confidence: number; // 0-1
    lastUpdated: number;
  };
}

class TransformationPipeline {
  private transformers: Map<DataSource, DataTransformer>;

  async process(rawData: any, source: DataSource): Promise<TransformedData> {
    const transformer = this.transformers.get(source);

    // 1. Transform to unified format
    const transformed = await transformer.transform(rawData, source);

    // 2. Validate against schema
    const validation = await transformer.validate(transformed);
    if (!validation.valid) {
      throw new TransformationError(validation.errors);
    }

    // 3. Enrich with KB data and computed values
    const enriched = await transformer.enrich(transformed);

    // 4. Calculate confidence score
    enriched.metadata.confidence = this.calculateConfidence(enriched);

    return enriched;
  }

  private calculateConfidence(data: TransformedData): number {
    // Factors: source reliability, data freshness, validation score
    const sourceScore = this.getSourceReliability(data.metadata.source);
    const freshnessScore = this.getFreshnessScore(data.metadata.lastUpdated);
    const completenessScore = this.getCompletenessScore(data.properties);

    return (sourceScore * 0.4) + (freshnessScore * 0.3) + (completenessScore * 0.3);
  }
}
```

#### 2.2.2 Data Enrichment

```typescript
class DataEnricher {
  async enrichCableData(cable: CableData): Promise<EnrichedCableData> {
    return {
      ...cable,
      // Calculate estimated path if not provided
      estimatedPath: cable.path || this.calculateCablePath(cable),

      // Add KB article references
      relatedArticles: await this.findRelatedKBArticles(cable),

      // Calculate derived metrics
      estimatedLatency: this.calculateLatency(cable.distance, cable.type),
      capacityUtilization: this.estimateUtilization(cable),

      // Historical context
      ageYears: new Date().getFullYear() - cable.yearLaid,
      maintenanceHistory: await this.getMaintenanceHistory(cable.id),
    };
  }

  private calculateCablePath(cable: CableData): GeoJSON.LineString {
    // Great circle route between landing points
    const [point1, point2] = cable.landingPoints;
    return greatCircle(point1, point2, { npoints: 100 });
  }

  private async findRelatedKBArticles(cable: CableData): Promise<KBArticle[]> {
    const keywords = [cable.type, cable.owner, ...cable.technologies];
    return await knowledgeBaseService.search({ keywords, type: 'cable' });
  }
}
```

### 2.3 Caching Strategy

**Purpose**: Multi-layer caching for performance and offline resilience.

#### 2.3.1 Three-Tier Cache Architecture

```typescript
interface CacheLayer {
  get(key: string): Promise<CachedData | null>;
  set(key: string, data: any, ttl: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface CachedData {
  value: any;
  metadata: {
    cachedAt: number;
    expiresAt: number;
    source: DataSource;
    version: string;
  };
}

class LayeredCacheManager {
  private l1: MemoryCache;     // L1: In-memory (fast, volatile)
  private l2: IndexedDBCache;  // L2: IndexedDB (persistent)
  private l3: ServiceWorkerCache; // L3: Service Worker (offline)

  async get(key: string): Promise<CachedData | null> {
    // Try L1 first
    let data = await this.l1.get(key);
    if (data && !this.isStale(data)) return data;

    // Try L2
    data = await this.l2.get(key);
    if (data) {
      // Promote to L1
      await this.l1.set(key, data.value, this.getTTL(data));
      if (!this.isStale(data)) return data;
    }

    // Try L3
    data = await this.l3.get(key);
    if (data) {
      // Promote to L1 and L2
      await this.l1.set(key, data.value, this.getTTL(data));
      await this.l2.set(key, data.value, this.getTTL(data));
      return data;
    }

    return null;
  }

  async set(key: string, value: any, options: CacheOptions): Promise<void> {
    const { ttl, persist, offline } = options;

    // Always set in L1
    await this.l1.set(key, value, ttl);

    // Conditionally persist to L2
    if (persist) {
      await this.l2.set(key, value, ttl);
    }

    // Conditionally cache for offline in L3
    if (offline) {
      await this.l3.set(key, value, ttl);
    }
  }

  private isStale(data: CachedData): boolean {
    return Date.now() > data.metadata.expiresAt;
  }

  private getTTL(data: CachedData): number {
    return Math.max(0, data.metadata.expiresAt - Date.now());
  }
}
```

#### 2.3.2 Cache Invalidation Strategy

```typescript
interface InvalidationStrategy {
  shouldInvalidate(key: string, data: CachedData): boolean;
  onInvalidate(key: string): Promise<void>;
}

class SmartInvalidation implements InvalidationStrategy {
  private strategies: Map<DataType, InvalidationRule>;

  constructor() {
    // Different invalidation rules per data type
    this.strategies.set('cables', {
      ttl: 86400000 * 30, // 30 days (cables change rarely)
      staleWhileRevalidate: true,
      revalidateOn: ['user-interaction', 'manual-refresh']
    });

    this.strategies.set('bgp-routes', {
      ttl: 300000, // 5 minutes (routes change frequently)
      staleWhileRevalidate: true,
      revalidateOn: ['time-based', 'websocket-update']
    });

    this.strategies.set('metrics', {
      ttl: 60000, // 1 minute
      staleWhileRevalidate: false,
      revalidateOn: ['time-based']
    });
  }

  shouldInvalidate(key: string, data: CachedData): boolean {
    const dataType = this.extractDataType(key);
    const rule = this.strategies.get(dataType);

    // Time-based invalidation
    if (Date.now() > data.metadata.expiresAt) {
      return !rule.staleWhileRevalidate;
    }

    // Event-based invalidation
    return false; // Handled by event system
  }

  async onInvalidate(key: string): Promise<void> {
    // Trigger background revalidation if stale-while-revalidate
    const dataType = this.extractDataType(key);
    const rule = this.strategies.get(dataType);

    if (rule.staleWhileRevalidate) {
      // Non-blocking refresh
      this.backgroundRevalidate(key);
    }
  }

  private async backgroundRevalidate(key: string): Promise<void> {
    // Fetch fresh data in background
    const freshData = await apiService.fetch(key);
    await cache.set(key, freshData);

    // Notify UI of updated data
    eventBus.emit('data-refreshed', { key, data: freshData });
  }
}
```

### 2.4 Knowledge Base Integration

**Purpose**: Deep integration of educational content with visual elements.

#### 2.4.1 Knowledge Base Service

```typescript
interface KnowledgeBaseService {
  // Search and retrieval
  search(query: SearchQuery): Promise<KBArticle[]>;
  getArticle(id: string): Promise<KBArticle>;
  getRelatedArticles(context: Context): Promise<KBArticle[]>;

  // Contextual integration
  getTooltipContent(elementType: string, elementId: string): Promise<TooltipContent>;
  getEducationalOverlay(topic: string): Promise<OverlayContent>;

  // Navigation
  getNavigationPath(from: string, to: string): NavigationPath;
  getSuggestedLearning(userContext: UserContext): LearningPath[];
}

interface KBArticle {
  id: string;
  title: string;
  category: KBCategory;
  content: {
    summary: string;
    detailed: string;
    interactive?: InteractiveContent;
  };
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    readingTime: number;
    lastUpdated: number;
    relatedTopics: string[];
    visualizations?: string[]; // IDs of related vis elements
  };
  data?: any; // Structured data (CSV/JSON from KB)
}

type KBCategory =
  | 'protocols'
  | 'infrastructure'
  | 'security'
  | 'performance'
  | 'routing'
  | 'dns'
  | 'cdn'
  | 'concepts';
```

#### 2.4.2 Context-Aware Documentation Display

```typescript
class ContextualKBRenderer {
  private visToKBMapping: Map<string, string[]>; // vis element ID → KB article IDs

  async renderContextualHelp(element: VisElement, userIntent: UserIntent): Promise<void> {
    // Determine what the user needs
    const context = this.buildContext(element, userIntent);

    // Get relevant KB content
    const content = await this.getContextualContent(context);

    // Render appropriate UI
    switch (userIntent) {
      case 'quick-info':
        this.renderTooltip(element, content.summary);
        break;

      case 'learn-more':
        this.renderSidePanel(content.detailed);
        break;

      case 'deep-dive':
        this.renderFullArticle(content);
        break;

      case 'compare':
        this.renderComparison(element, content);
        break;
    }
  }

  private async getContextualContent(context: Context): Promise<ContextualContent> {
    const { elementType, elementId, userLevel, previousInteractions } = context;

    // Find relevant articles
    const articles = await kbService.search({
      type: elementType,
      id: elementId,
      difficulty: userLevel
    });

    // Personalize based on user history
    const personalizedContent = this.personalize(articles, previousInteractions);

    // Add interactive elements
    return {
      summary: personalizedContent.summary,
      detailed: personalizedContent.detailed,
      interactive: this.createInteractiveElements(personalizedContent),
      relatedTopics: personalizedContent.relatedTopics
    };
  }

  private createInteractiveElements(content: KBArticle): InteractiveContent {
    // Create interactive diagrams, quizzes, etc.
    return {
      diagrams: this.generateDiagrams(content),
      quiz: this.generateQuiz(content),
      playground: this.createSandbox(content),
      relatedVis: this.linkToVisElements(content)
    };
  }
}
```

#### 2.4.3 Knowledge Base Search & Navigation

```typescript
class KBSearchEngine {
  private index: SearchIndex;

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const { text, filters, context } = query;

    // Full-text search
    const textResults = await this.index.search(text);

    // Filter by category, difficulty, etc.
    const filtered = this.applyFilters(textResults, filters);

    // Rank by relevance to current context
    const ranked = this.rankByContext(filtered, context);

    // Add snippets and highlights
    return this.enrichResults(ranked, text);
  }

  private rankByContext(results: KBArticle[], context: Context): KBArticle[] {
    return results.sort((a, b) => {
      const scoreA = this.calculateRelevance(a, context);
      const scoreB = this.calculateRelevance(b, context);
      return scoreB - scoreA;
    });
  }

  private calculateRelevance(article: KBArticle, context: Context): number {
    let score = 0;

    // Boost if directly related to current vis element
    if (context.elementId && article.metadata.visualizations?.includes(context.elementId)) {
      score += 10;
    }

    // Boost if matches user's skill level
    if (article.metadata.difficulty === context.userLevel) {
      score += 5;
    }

    // Boost if related to recent topics
    const topicOverlap = this.countOverlap(
      article.metadata.relatedTopics,
      context.recentTopics
    );
    score += topicOverlap * 2;

    return score;
  }
}

class KBNavigator {
  async getNavigationPath(from: string, to: string): Promise<NavigationPath> {
    // Find learning path between topics
    const graph = await this.buildKnowledgeGraph();
    const path = this.findShortestPath(graph, from, to);

    return {
      steps: path.map(nodeId => ({
        article: this.getArticle(nodeId),
        reason: this.getTransitionReason(nodeId),
        estimatedTime: this.getReadingTime(nodeId)
      })),
      totalTime: path.reduce((sum, id) => sum + this.getReadingTime(id), 0),
      difficulty: this.getPathDifficulty(path)
    };
  }

  private async buildKnowledgeGraph(): Promise<Graph> {
    // Build graph of article relationships
    const articles = await kbService.getAllArticles();
    const graph = new Graph();

    articles.forEach(article => {
      graph.addNode(article.id);
      article.metadata.relatedTopics.forEach(relatedId => {
        graph.addEdge(article.id, relatedId, this.getEdgeWeight(article, relatedId));
      });
    });

    return graph;
  }
}
```

### 2.5 Data Freshness & Quality Indicators

**Purpose**: Transparent communication of data confidence and freshness to users.

#### 2.5.1 Freshness Tracking

```typescript
interface DataFreshness {
  status: 'realtime' | 'recent' | 'stale' | 'estimated' | 'offline';
  timestamp: number;
  source: DataSource;
  confidence: number; // 0-1
  autoRefresh: boolean;
  nextUpdate?: number;
}

class FreshnessTracker {
  private freshness: Map<string, DataFreshness>;

  getFreshness(dataId: string): DataFreshness {
    const f = this.freshness.get(dataId);
    if (!f) return this.getDefaultFreshness();

    // Update status based on age
    const age = Date.now() - f.timestamp;
    f.status = this.calculateStatus(age, f.source);

    return f;
  }

  private calculateStatus(age: number, source: DataSource): FreshnessStatus {
    const thresholds = this.getThresholds(source);

    if (age < thresholds.realtime) return 'realtime';
    if (age < thresholds.recent) return 'recent';
    if (age < thresholds.stale) return 'stale';
    if (source === 'estimated') return 'estimated';
    return 'offline';
  }

  private getThresholds(source: DataSource) {
    // Different sources have different freshness requirements
    const thresholdMap = {
      'ripe-atlas': { realtime: 60000, recent: 300000, stale: 3600000 },
      'bgp': { realtime: 300000, recent: 1800000, stale: 7200000 },
      'cables': { realtime: 86400000, recent: 604800000, stale: 2592000000 },
      'estimated': { realtime: Infinity, recent: Infinity, stale: Infinity }
    };

    return thresholdMap[source] || { realtime: 300000, recent: 1800000, stale: 3600000 };
  }
}
```

#### 2.5.2 Quality Indicators UI

```typescript
class QualityIndicatorRenderer {
  renderFreshnessIndicator(element: VisElement, freshness: DataFreshness): void {
    const indicator = {
      'realtime': { icon: '🟢', label: 'Live', color: '#00ff00' },
      'recent': { icon: '🟢', label: 'Recent', color: '#88ff00' },
      'stale': { icon: '🟡', label: 'Cached', color: '#ffaa00' },
      'estimated': { icon: '🟡', label: 'Estimated', color: '#ffaa00' },
      'offline': { icon: '⚪', label: 'Offline', color: '#888888' }
    }[freshness.status];

    // Render badge on visualization element
    this.renderBadge(element, indicator);

    // Tooltip with details
    this.renderTooltip(element, {
      status: indicator.label,
      source: this.formatSource(freshness.source),
      age: this.formatAge(freshness.timestamp),
      confidence: `${Math.round(freshness.confidence * 100)}%`,
      nextUpdate: freshness.nextUpdate ? this.formatTime(freshness.nextUpdate) : 'Manual'
    });
  }

  renderConfidenceVisualization(element: VisElement, confidence: number): void {
    // Visual representation of confidence
    const opacity = 0.3 + (confidence * 0.7); // 30-100% opacity
    const pulseSpeed = 3000 - (confidence * 2000); // Faster pulse = lower confidence

    element.style.opacity = opacity;
    if (confidence < 0.7) {
      this.addPulseAnimation(element, pulseSpeed);
    }
  }
}
```

### 2.6 Auto-Refresh Mechanisms

**Purpose**: Intelligent background data updates without disrupting user experience.

#### 2.6.1 Refresh Orchestrator

```typescript
class RefreshOrchestrator {
  private refreshSchedules: Map<DataType, RefreshSchedule>;
  private activeRefreshes: Set<string>;

  constructor() {
    this.initializeSchedules();
    this.startRefreshLoop();
  }

  private initializeSchedules() {
    // Different refresh strategies per data type
    this.refreshSchedules.set('bgp-routes', {
      interval: 60000, // 1 minute
      strategy: 'time-based',
      priority: 'high',
      throttle: true
    });

    this.refreshSchedules.set('cables', {
      interval: 86400000, // 24 hours
      strategy: 'on-interaction',
      priority: 'low',
      throttle: false
    });

    this.refreshSchedules.set('metrics', {
      interval: 30000, // 30 seconds
      strategy: 'websocket-preferred',
      priority: 'high',
      throttle: true
    });
  }

  async refresh(dataId: string, options?: RefreshOptions): Promise<void> {
    // Prevent duplicate refreshes
    if (this.activeRefreshes.has(dataId)) {
      return;
    }

    this.activeRefreshes.add(dataId);

    try {
      const dataType = this.extractDataType(dataId);
      const schedule = this.refreshSchedules.get(dataType);

      // Check if refresh is needed
      if (!this.shouldRefresh(dataId, schedule, options)) {
        return;
      }

      // Perform refresh based on strategy
      const freshData = await this.executeRefresh(dataId, schedule);

      // Update caches
      await this.updateCaches(dataId, freshData);

      // Notify UI (non-disruptive)
      this.notifyUpdate(dataId, freshData, options?.disruptive);

    } finally {
      this.activeRefreshes.delete(dataId);
    }
  }

  private shouldRefresh(
    dataId: string,
    schedule: RefreshSchedule,
    options?: RefreshOptions
  ): boolean {
    // User-initiated refresh always proceeds
    if (options?.force) return true;

    // Check freshness
    const freshness = freshnessTracker.getFreshness(dataId);
    const age = Date.now() - freshness.timestamp;

    // Don't refresh if recent
    if (age < schedule.interval) return false;

    // Check priority and visibility
    if (schedule.priority === 'low' && !this.isVisible(dataId)) {
      return false;
    }

    // Check user activity (don't refresh during interaction)
    if (schedule.throttle && userActivityMonitor.isActive()) {
      this.scheduleForLater(dataId);
      return false;
    }

    return true;
  }

  private async executeRefresh(
    dataId: string,
    schedule: RefreshSchedule
  ): Promise<any> {
    switch (schedule.strategy) {
      case 'websocket-preferred':
        // Try WebSocket first, fall back to polling
        return await this.websocketRefresh(dataId)
          || await this.pollingRefresh(dataId);

      case 'time-based':
        return await this.pollingRefresh(dataId);

      case 'on-interaction':
        // Only refresh when user interacts with element
        return await this.onDemandRefresh(dataId);

      default:
        return await this.pollingRefresh(dataId);
    }
  }

  private notifyUpdate(dataId: string, data: any, disruptive: boolean = false): void {
    if (disruptive) {
      // Immediate UI update
      eventBus.emit('data-updated-immediate', { dataId, data });
    } else {
      // Gentle notification, update in background
      eventBus.emit('data-updated-background', { dataId, data });
      this.showSubtleNotification(`Updated: ${this.formatDataId(dataId)}`);
    }
  }
}
```

#### 2.6.2 WebSocket Integration

```typescript
class WebSocketManager {
  private connections: Map<DataSource, WebSocket>;
  private subscriptions: Map<string, Set<SubscriptionCallback>>;

  async subscribe(topic: string, callback: SubscriptionCallback): Promise<void> {
    const source = this.getSourceForTopic(topic);

    // Establish connection if needed
    if (!this.connections.has(source)) {
      await this.connect(source);
    }

    // Add subscription
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(callback);

    // Send subscription message
    this.send(source, { action: 'subscribe', topic });
  }

  private async connect(source: DataSource): Promise<void> {
    const wsUrl = this.getWebSocketURL(source);
    const ws = new WebSocket(wsUrl);

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
      this.handleError(source, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed: ${source}`);
      this.connections.delete(source);
      this.reconnect(source);
    };
  }

  private handleMessage(message: WSMessage): void {
    const { topic, data, metadata } = message;

    // Update cache immediately
    cache.set(topic, data, { ttl: 300000, persist: true });

    // Notify all subscribers
    const subscribers = this.subscriptions.get(topic);
    if (subscribers) {
      subscribers.forEach(callback => {
        callback({ data, metadata, realtime: true });
      });
    }
  }

  private async reconnect(source: DataSource, attempt: number = 1): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff

    setTimeout(async () => {
      try {
        await this.connect(source);
      } catch (error) {
        if (attempt < 5) {
          await this.reconnect(source, attempt + 1);
        } else {
          // Fall back to polling
          this.fallbackToPolling(source);
        }
      }
    }, delay);
  }
}
```

---

## 3. Educational Overlay System

### 3.1 Overlay Architecture

```typescript
interface EducationalOverlay {
  type: 'tooltip' | 'sidepanel' | 'modal' | 'fullscreen' | 'inline';
  content: OverlayContent;
  position: OverlayPosition;
  trigger: TriggerConfig;
  interactive: boolean;
}

interface OverlayContent {
  title: string;
  summary: string;
  sections: ContentSection[];
  media?: MediaContent[];
  actions?: OverlayAction[];
}

class OverlayRenderer {
  private activeOverlays: Map<string, EducationalOverlay>;

  async render(element: VisElement, context: InteractionContext): Promise<void> {
    // Determine overlay type based on context
    const overlayType = this.selectOverlayType(context);

    // Get content from KB
    const content = await kbService.getTooltipContent(
      element.type,
      element.id
    );

    // Position overlay
    const position = this.calculatePosition(element, overlayType);

    // Render
    const overlay = {
      type: overlayType,
      content: this.formatContent(content, context.userLevel),
      position,
      trigger: context.trigger,
      interactive: overlayType !== 'tooltip'
    };

    this.display(overlay);
    this.activeOverlays.set(element.id, overlay);
  }

  private selectOverlayType(context: InteractionContext): OverlayType {
    // Hover → Tooltip
    if (context.trigger === 'hover') return 'tooltip';

    // Click → Side panel
    if (context.trigger === 'click') return 'sidepanel';

    // Double-click → Modal
    if (context.trigger === 'doubleclick') return 'modal';

    // Context menu → Fullscreen
    if (context.trigger === 'contextmenu') return 'fullscreen';

    return 'tooltip';
  }

  private formatContent(content: KBArticle, userLevel: UserLevel): OverlayContent {
    const sections: ContentSection[] = [];

    // Basic info (always shown)
    sections.push({
      title: 'Overview',
      content: content.content.summary,
      collapsible: false
    });

    // Technical details (intermediate+)
    if (userLevel !== 'beginner') {
      sections.push({
        title: 'Technical Details',
        content: content.content.detailed,
        collapsible: true,
        defaultExpanded: userLevel === 'advanced'
      });
    }

    // Interactive elements
    if (content.content.interactive) {
      sections.push({
        title: 'Interactive',
        content: content.content.interactive,
        collapsible: false
      });
    }

    // Related topics
    sections.push({
      title: 'Related Topics',
      content: this.renderRelatedTopics(content.metadata.relatedTopics),
      collapsible: true,
      defaultExpanded: false
    });

    return {
      title: content.title,
      summary: content.content.summary,
      sections,
      media: this.getRelatedMedia(content),
      actions: this.getActions(content)
    };
  }
}
```

### 3.2 Contextual Help System

```typescript
class ContextualHelpSystem {
  private helpContext: HelpContext;

  async provideHelp(userAction: UserAction): Promise<HelpResponse> {
    // Analyze what user is trying to do
    const intent = await this.analyzeIntent(userAction);

    // Get relevant help content
    const helpContent = await this.getHelpForIntent(intent);

    // Determine best delivery method
    const deliveryMethod = this.selectDeliveryMethod(intent, helpContent);

    // Provide help
    return this.deliverHelp(helpContent, deliveryMethod);
  }

  private async analyzeIntent(action: UserAction): Promise<UserIntent> {
    const { type, element, context } = action;

    // Pattern matching for common intents
    if (type === 'hover' && context.duration < 1000) {
      return { type: 'quick-info', confidence: 0.9 };
    }

    if (type === 'click' && element.type === 'cable') {
      return { type: 'learn-about-cable', confidence: 0.95 };
    }

    if (type === 'search') {
      return { type: 'find-information', query: context.query, confidence: 1.0 };
    }

    // ML-based intent classification (if available)
    return await this.mlIntentClassifier.classify(action);
  }

  private selectDeliveryMethod(
    intent: UserIntent,
    content: HelpContent
  ): DeliveryMethod {
    // Quick info → Tooltip
    if (intent.type === 'quick-info') {
      return { type: 'tooltip', duration: 3000 };
    }

    // Learn more → Side panel with related articles
    if (intent.type.startsWith('learn-')) {
      return { type: 'sidepanel', showRelated: true };
    }

    // Search → Search results overlay
    if (intent.type === 'find-information') {
      return { type: 'search-overlay', ranked: true };
    }

    // Default → Modal
    return { type: 'modal' };
  }
}
```

---

## 4. Performance Considerations

### 4.1 Optimization Strategies

```typescript
class PerformanceOptimizer {
  // Request batching
  private batchRequests(requests: APIRequest[]): BatchedRequest[] {
    // Group requests by service and timing
    const batches = new Map<DataSource, APIRequest[]>();

    requests.forEach(req => {
      const batch = batches.get(req.source) || [];
      batch.push(req);
      batches.set(req.source, batch);
    });

    return Array.from(batches.entries()).map(([source, reqs]) => ({
      source,
      requests: reqs,
      priority: Math.max(...reqs.map(r => r.priority || 0))
    }));
  }

  // Lazy loading
  async loadDataOnDemand(viewport: Viewport): Promise<void> {
    // Only load data for visible elements
    const visibleElements = this.getVisibleElements(viewport);

    // Prioritize by distance from viewport center
    const prioritized = this.prioritizeByProximity(
      visibleElements,
      viewport.center
    );

    // Load in chunks
    for (const chunk of this.chunk(prioritized, 10)) {
      await Promise.all(chunk.map(el => this.loadElementData(el)));
      await this.nextFrame(); // Don't block rendering
    }
  }

  // Progressive enhancement
  async renderProgressive(data: LargeDataset): Promise<void> {
    // 1. Render low-detail version immediately
    this.renderLOD0(data.summary);

    // 2. Enhance with medium detail
    await this.nextFrame();
    this.renderLOD1(data.medium);

    // 3. Add full detail when ready
    await this.whenIdle();
    this.renderLOD2(data.full);
  }

  // Resource prioritization
  prioritizeResources(resources: Resource[]): Resource[] {
    return resources.sort((a, b) => {
      // Priority factors:
      // 1. User-initiated > automatic
      // 2. Visible > off-screen
      // 3. Interactive > static
      // 4. Fresh > cached

      const scoreA = this.calculateResourceScore(a);
      const scoreB = this.calculateResourceScore(b);

      return scoreB - scoreA;
    });
  }

  private calculateResourceScore(resource: Resource): number {
    let score = 0;

    if (resource.userInitiated) score += 1000;
    if (resource.visible) score += 100;
    if (resource.interactive) score += 10;
    if (resource.fresh) score += 1;

    return score;
  }
}
```

### 4.2 Error Handling & Fallbacks

```typescript
class ErrorHandler {
  async handleAPIError(error: APIError, context: ErrorContext): Promise<FallbackData> {
    // Log error with context
    this.logError(error, context);

    // Determine fallback strategy
    const strategy = this.selectFallbackStrategy(error, context);

    // Execute fallback
    const fallbackData = await this.executeFallback(strategy, context);

    // Notify user (if appropriate)
    if (this.shouldNotifyUser(error)) {
      this.showUserNotification(error, fallbackData);
    }

    return fallbackData;
  }

  private selectFallbackStrategy(error: APIError, context: ErrorContext): FallbackStrategy {
    // Network error → Use cache
    if (error.type === 'network') {
      return { type: 'cache', maxAge: Infinity };
    }

    // Rate limit → Use cache and retry later
    if (error.type === 'rate-limit') {
      return { type: 'cache-and-retry', retryAfter: error.retryAfter };
    }

    // Not found → Use estimated data
    if (error.status === 404) {
      return { type: 'estimated' };
    }

    // Auth error → Degrade to public data
    if (error.status === 401 || error.status === 403) {
      return { type: 'public-only' };
    }

    // Server error → Use cache or estimated
    if (error.status >= 500) {
      return { type: 'cache-or-estimated' };
    }

    // Default → Show error state
    return { type: 'error-state' };
  }

  private async executeFallback(
    strategy: FallbackStrategy,
    context: ErrorContext
  ): Promise<FallbackData> {
    switch (strategy.type) {
      case 'cache':
        const cached = await cache.get(context.dataId, { maxAge: strategy.maxAge });
        return {
          data: cached?.value,
          metadata: { source: 'cache', stale: true }
        };

      case 'estimated':
        const estimated = await this.generateEstimatedData(context);
        return {
          data: estimated,
          metadata: { source: 'estimated', confidence: 0.5 }
        };

      case 'cache-and-retry':
        const cachedData = await cache.get(context.dataId);
        this.scheduleRetry(context, strategy.retryAfter);
        return {
          data: cachedData?.value,
          metadata: { source: 'cache', retryScheduled: true }
        };

      default:
        return { data: null, metadata: { source: 'error', error: true } };
    }
  }
}
```

---

## 5. Interface Definitions

### 5.1 API Service Interfaces

```typescript
// Core API service interface
export interface APIService {
  fetch<T>(endpoint: string, options?: FetchOptions): Promise<APIResponse<T>>;
  subscribe(topic: string, callback: SubscriptionCallback): Unsubscribe;
  getHealth(): ServiceHealth;
}

// Specific API implementations
export interface PeeringDBAPI extends APIService {
  getIXPs(filters?: IXPFilters): Promise<APIResponse<IXP[]>>;
  getDataCenters(filters?: DCFilters): Promise<APIResponse<DataCenter[]>>;
  getNetworks(asn: number): Promise<APIResponse<Network>>;
}

export interface BGPDataAPI extends APIService {
  getRoutes(prefix: string): Promise<APIResponse<BGPRoute[]>>;
  getASPath(srcAS: number, dstAS: number): Promise<APIResponse<ASPath>>;
  getPeers(asn: number): Promise<APIResponse<Peer[]>>;
}

export interface SubmarineCableAPI extends APIService {
  getCables(filters?: CableFilters): Promise<APIResponse<Cable[]>>;
  getCable(id: string): Promise<APIResponse<Cable>>;
  getCableStatus(id: string): Promise<APIResponse<CableStatus>>;
}
```

### 5.2 Data Transformation Interfaces

```typescript
export interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): Promise<TOutput>;
  validate(output: TOutput): ValidationResult;
}

export interface CableTransformer extends DataTransformer<RawCable, TransformedCable> {
  calculatePath(cable: RawCable): GeoJSON.LineString;
  estimateLatency(cable: RawCable): number;
}

export interface MetricsTransformer extends DataTransformer<RawMetric, TransformedMetric> {
  normalize(value: number, unit: string): NormalizedValue;
  aggregate(metrics: RawMetric[]): AggregatedMetric;
}
```

### 5.3 Knowledge Base Interfaces

```typescript
export interface KnowledgeBaseConnector {
  // Article retrieval
  getArticle(id: string): Promise<KBArticle>;
  searchArticles(query: SearchQuery): Promise<KBArticle[]>;

  // Data access
  getData(dataId: string): Promise<KBData>;
  query(selector: DataSelector): Promise<any[]>;

  // Relationships
  getRelated(articleId: string): Promise<KBArticle[]>;
  getVisualizationLinks(articleId: string): Promise<string[]>;
}

export interface KBData {
  id: string;
  type: 'csv' | 'json' | 'md';
  content: any;
  schema?: JSONSchema;
  metadata: {
    source: string;
    lastUpdated: number;
    version: string;
  };
}
```

### 5.4 UI Integration Interfaces

```typescript
export interface VisualizationIntegration {
  // Link vis elements to KB
  linkToKB(elementId: string, articleIds: string[]): void;
  getKBLinks(elementId: string): string[];

  // Render overlays
  showTooltip(element: VisElement, content: TooltipContent): void;
  showSidePanel(content: SidePanelContent): void;
  showModal(content: ModalContent): void;

  // Handle interactions
  onElementHover(callback: (element: VisElement) => void): Unsubscribe;
  onElementClick(callback: (element: VisElement) => void): Unsubscribe;
  onSearch(callback: (query: string) => void): Unsubscribe;
}

export interface UIStateManager {
  // State management
  getState<T>(key: string): T;
  setState<T>(key: string, value: T): void;
  subscribe<T>(key: string, callback: (value: T) => void): Unsubscribe;

  // UI state
  getActiveOverlays(): EducationalOverlay[];
  getActiveFilters(): Filter[];
  getUserContext(): UserContext;
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
1. Set up API service layer with circuit breaker pattern
2. Implement three-tier caching system
3. Create data transformation pipeline
4. Build freshness tracking system

### Phase 2: Knowledge Base Integration (Weeks 3-4)
1. Index knowledge base for search
2. Create contextual content system
3. Build overlay rendering system
4. Implement navigation between topics

### Phase 3: Real-time Features (Weeks 5-6)
1. WebSocket integration for live data
2. Auto-refresh orchestration
3. Background sync with Service Workers
4. Real-time quality indicators

### Phase 4: Polish & Optimization (Weeks 7-8)
1. Performance optimization
2. Error handling refinement
3. User experience improvements
4. Analytics and monitoring

---

## 7. Deployment Considerations

### 7.1 Environment Configuration

```typescript
export interface EnvironmentConfig {
  // API endpoints
  apis: {
    peeringdb: { url: string; apiKey?: string; rateLimit: number };
    bgp: { url: string; apiKey?: string; rateLimit: number };
    cables: { url: string; apiKey?: string; rateLimit: number };
  };

  // Caching
  cache: {
    l1MaxSize: number; // Memory cache size (bytes)
    l2MaxSize: number; // IndexedDB size (bytes)
    l3MaxSize: number; // Service Worker cache size (bytes)
    defaultTTL: number; // Default cache TTL (ms)
  };

  // Features
  features: {
    enableWebSocket: boolean;
    enableOfflineMode: boolean;
    enableAutoRefresh: boolean;
    enableEducationalOverlays: boolean;
  };

  // Performance
  performance: {
    maxConcurrentRequests: number;
    requestTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
}
```

### 7.2 Monitoring & Observability

```typescript
export interface MonitoringSystem {
  // Metrics
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  recordAPICall(service: string, duration: number, success: boolean): void;
  recordCacheHit(layer: CacheLayer, hit: boolean): void;

  // Logging
  logError(error: Error, context: any): void;
  logWarning(message: string, context: any): void;
  logInfo(message: string, context: any): void;

  // Tracing
  startTrace(name: string): Span;
  endTrace(span: Span): void;
}

// Key metrics to track
const METRICS = {
  'api.call.duration': 'histogram',
  'api.call.error_rate': 'gauge',
  'cache.hit_rate': 'gauge',
  'cache.size': 'gauge',
  'data.freshness': 'histogram',
  'ui.overlay.render_time': 'histogram',
  'websocket.connection_time': 'histogram',
  'refresh.duration': 'histogram'
};
```

---

## Summary

This architecture provides a robust, performant, and user-friendly system for integrating real-time API data and comprehensive knowledge base content into the Internet Infrastructure Map visualization. The key architectural decisions are:

1. **Layered Caching**: Three-tier cache (memory, IndexedDB, Service Worker) ensures fast access and offline capability
2. **Graceful Degradation**: Seamless fallback from live → recent → estimated → cached data
3. **Data Quality Transparency**: Clear visual indicators for data freshness and confidence
4. **Educational Integration**: Deep KB integration with context-aware overlays and navigation
5. **Performance First**: Request batching, lazy loading, and progressive enhancement
6. **Resilient Design**: Circuit breakers, retry logic, and comprehensive error handling

The architecture supports the project's goals of accuracy, education, and beautiful visualization while maintaining excellent performance and user experience.
