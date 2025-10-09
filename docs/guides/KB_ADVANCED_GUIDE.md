# Knowledge Base Advanced Guide

## Table of Contents

1. [Custom Tours](#custom-tours)
2. [Event System](#event-system)
3. [Theming & Customization](#theming--customization)
4. [Performance Optimization](#performance-optimization)
5. [Extending the KB](#extending-the-kb)
6. [API Reference](#api-reference)
7. [Advanced Integration Patterns](#advanced-integration-patterns)

---

## Custom Tours

### Creating Tour Definitions

Tours are defined in `src/components/LearningTour.js`:

```javascript
class LearningTour {
  constructor(globe, overlay) {
    this.tours = {
      'custom-tour': {
        id: 'custom-tour',
        title: 'Custom Learning Tour',
        description: 'Your tour description',
        duration: 12,          // minutes
        difficulty: 'intermediate',
        steps: [
          // Define steps here
        ]
      }
    };
  }
}
```

### Tour Step Configuration

Each step has this structure:

```javascript
{
  // Required fields
  title: "Step Title",
  content: "Educational content for this step. Use **markdown** for formatting.",
  duration: 5000,  // milliseconds to display

  // Camera control (optional)
  camera: {
    lat: 40.7128,      // Latitude
    lng: -74.0060,     // Longitude
    altitude: 2.5      // Altitude (1-3 typical)
  },

  // Element highlighting (optional)
  highlight: {
    type: 'cables',    // 'cables' | 'points' | 'clear'
    filter: {
      // Filter criteria
      region: 'atlantic',
      capacity: { min: 100000 }
    }
  },

  // KB article integration (optional)
  learnMore: 'internet-architecture/00-index',

  // Actions (optional)
  actions: [
    {
      type: 'highlight',
      target: 'cables',
      filter: { status: 'active' }
    },
    {
      type: 'camera',
      position: { lat: 51.5074, lng: -0.1278, altitude: 2 }
    },
    {
      type: 'article',
      articleId: 'data/routing-protocols'
    }
  ]
}
```

### Complete Tour Example

```javascript
'network-security': {
  id: 'network-security',
  title: 'Network Security Fundamentals',
  description: 'Learn about securing internet infrastructure',
  duration: 15,
  difficulty: 'advanced',
  steps: [
    {
      title: "Introduction to Network Security",
      content: `
# Network Security Overview

Network security protects data in transit across the internet infrastructure.

**Key Concepts:**
- Encryption protocols
- Authentication mechanisms
- Intrusion detection
- Firewall systems
      `,
      duration: 8000,
      learnMore: 'security/cryptographic-reference'
    },
    {
      title: "Submarine Cable Security",
      content: `
# Physical Security

Submarine cables require physical protection:
- Deep sea burial (> 1km depth)
- Shore landing security
- Monitoring systems
      `,
      duration: 10000,
      camera: {
        lat: 40.7128,
        lng: -74.0060,
        altitude: 1.5
      },
      highlight: {
        type: 'cables',
        filter: { region: 'atlantic' }
      }
    },
    {
      title: "Data Center Security",
      content: `
# Physical and Digital Security

Data centers employ multi-layer security:
1. Perimeter security
2. Access control systems
3. Network segmentation
4. Encryption at rest
      `,
      duration: 10000,
      camera: {
        lat: 51.5074,
        lng: -0.1278,
        altitude: 2
      },
      highlight: {
        type: 'points',
        filter: { tier: 3 }
      },
      learnMore: 'practical/troubleshooting-guide'
    }
  ]
}
```

### Tour Step Actions

Actions execute during tour steps:

**Camera Actions:**
```javascript
{
  type: 'camera',
  position: {
    lat: 40.7128,
    lng: -74.0060,
    altitude: 2.5
  },
  duration: 2000  // Animation duration (ms)
}
```

**Highlight Actions:**
```javascript
{
  type: 'highlight',
  target: 'cables',  // or 'points'
  filter: {
    region: 'pacific',
    status: 'active'
  }
}
```

**Article Display:**
```javascript
{
  type: 'article',
  articleId: 'data/routing-protocols',
  mode: 'sidebar'  // 'tooltip' | 'sidebar' | 'modal' | 'fullscreen'
}
```

**Custom Actions:**
```javascript
{
  type: 'custom',
  execute: (globe, overlay) => {
    // Your custom code here
    globe.pauseRotation();
    overlay.showNotification('Special message');
  }
}
```

### Interactive Elements

Add interactive elements to tour steps:

```javascript
{
  title: "Interactive Quiz",
  content: `
# Test Your Knowledge

Which protocol is used for routing between autonomous systems?

[quiz]
- OSPF
- BGP ✓
- RIP
- EIGRP
[/quiz]
  `,
  interactive: true,
  onAnswer: (correct) => {
    if (correct) {
      overlay.showNotification('Correct! BGP is the standard.');
    }
  }
}
```

### Progress Tracking

Track user progress through tours:

```javascript
// Get tour progress
const progress = tour.getProgress('submarine-cables');
// Returns: { completed: 3, total: 6, percentage: 50 }

// Mark tour complete
tour.markComplete('submarine-cables');

// Get completed tours
const completed = tour.getCompletedTours();
// Returns: ['submarine-cables', 'data-centers']

// Store in localStorage
localStorage.setItem('tour-progress', JSON.stringify(progress));
```

---

## Event System

### Available Events

The Knowledge Base dispatches custom events for integration:

**Article Events:**
```javascript
// Article opened
document.addEventListener('kb:article-open', (e) => {
  const { articleId, mode } = e.detail;
  console.log(`Opened ${articleId} in ${mode} mode`);
});

// Article closed
document.addEventListener('kb:article-close', (e) => {
  const { articleId } = e.detail;
});

// Article bookmarked
document.addEventListener('kb:bookmark-add', (e) => {
  const { articleId, title } = e.detail;
});
```

**Search Events:**
```javascript
// Search performed
document.addEventListener('kb:search', (e) => {
  const { query, results, filters } = e.detail;
  console.log(`Search: "${query}" returned ${results.length} results`);
});

// Search cleared
document.addEventListener('kb:search-clear', (e) => {
  console.log('Search cleared');
});
```

**Tour Events:**
```javascript
// Tour started
document.addEventListener('kb:tour-start', (e) => {
  const { tourId, title } = e.detail;
});

// Tour step changed
document.addEventListener('kb:tour-step', (e) => {
  const { tourId, stepIndex, total } = e.detail;
  console.log(`Tour step ${stepIndex + 1} of ${total}`);
});

// Tour completed
document.addEventListener('kb:tour-complete', (e) => {
  const { tourId, duration } = e.detail;
});

// Tour stopped
document.addEventListener('kb:tour-stop', (e) => {
  const { tourId } = e.detail;
});
```

**Visualization Events:**
```javascript
// Tour highlight request
document.addEventListener('tour-highlight', (e) => {
  const { type, filter } = e.detail;

  if (type === 'cables') {
    // Filter and highlight cables
    filterCables(filter);
  } else if (type === 'clear') {
    // Reset to default view
    resetView();
  }
});
```

### Event Handlers

Create custom event handlers:

```javascript
class CustomKBHandler {
  constructor(kbIntegration) {
    this.kb = kbIntegration;
    this.setupListeners();
  }

  setupListeners() {
    // Track article views
    document.addEventListener('kb:article-open', (e) => {
      this.trackAnalytics('article_view', e.detail);
    });

    // Auto-highlight related elements
    document.addEventListener('kb:article-open', (e) => {
      this.highlightRelatedElements(e.detail.articleId);
    });

    // Save tour progress
    document.addEventListener('kb:tour-step', (e) => {
      this.saveTourProgress(e.detail);
    });
  }

  trackAnalytics(event, data) {
    // Send to analytics service
    console.log('Analytics:', event, data);
  }

  highlightRelatedElements(articleId) {
    // Highlight visualization elements related to article
    const article = knowledgeBaseService.getArticle(articleId);
    if (article.tags.includes('submarine-cables')) {
      globe.highlightCables({ type: 'submarine' });
    }
  }

  saveTourProgress(data) {
    const key = `tour-progress-${data.tourId}`;
    localStorage.setItem(key, JSON.stringify({
      currentStep: data.stepIndex,
      timestamp: Date.now()
    }));
  }
}

// Initialize
const handler = new CustomKBHandler(kbIntegration);
```

### Custom Integrations

Integrate KB with external systems:

```javascript
// Analytics integration
document.addEventListener('kb:search', (e) => {
  gtag('event', 'kb_search', {
    search_term: e.detail.query,
    results_count: e.detail.results.length
  });
});

// User behavior tracking
document.addEventListener('kb:article-open', (e) => {
  fetch('/api/track', {
    method: 'POST',
    body: JSON.stringify({
      event: 'article_view',
      article: e.detail.articleId,
      timestamp: Date.now()
    })
  });
});

// Notification system
document.addEventListener('kb:tour-complete', (e) => {
  showNotification(`Congratulations! You completed the ${e.detail.title} tour!`);
});
```

---

## Theming & Customization

### CSS Variables

The Knowledge Base uses CSS custom properties for theming:

```css
:root {
  /* Primary colors */
  --kb-primary: #00ffcc;          /* Cyan highlights */
  --kb-secondary: #ffcc00;        /* Gold accents */
  --kb-accent: #ff00ff;           /* Magenta special */

  /* Background colors */
  --kb-bg-dark: rgba(10, 10, 20, 0.95);
  --kb-bg-light: rgba(20, 20, 40, 0.9);
  --kb-bg-card: rgba(30, 30, 50, 0.8);

  /* Border colors */
  --kb-border: rgba(255, 255, 255, 0.1);
  --kb-border-hover: rgba(0, 255, 204, 0.3);

  /* Text colors */
  --kb-text-primary: #ffffff;
  --kb-text-secondary: rgba(255, 255, 255, 0.7);
  --kb-text-muted: rgba(255, 255, 255, 0.5);

  /* Spacing */
  --kb-spacing-xs: 0.25rem;
  --kb-spacing-sm: 0.5rem;
  --kb-spacing-md: 1rem;
  --kb-spacing-lg: 1.5rem;
  --kb-spacing-xl: 2rem;

  /* Typography */
  --kb-font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  --kb-font-code: 'Fira Code', 'Consolas', monospace;
  --kb-font-size-sm: 0.875rem;
  --kb-font-size-base: 1rem;
  --kb-font-size-lg: 1.125rem;
  --kb-font-size-xl: 1.5rem;

  /* Shadows */
  --kb-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
  --kb-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
  --kb-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.4);

  /* Animations */
  --kb-transition-fast: 150ms ease;
  --kb-transition-base: 300ms ease;
  --kb-transition-slow: 500ms ease;
}
```

### Component Styling

Override component styles:

```css
/* Sidebar customization */
.kb-sidebar {
  width: 500px;  /* Default: 450px */
  background: var(--custom-bg);
}

/* Tooltip customization */
.kb-tooltip {
  max-width: 400px;
  border-radius: 12px;
  box-shadow: var(--kb-shadow-lg);
}

/* Article content */
.kb-article-content {
  font-size: 1.1rem;
  line-height: 1.8;
}

/* Code blocks */
.kb-article-content pre {
  background: rgba(0, 0, 0, 0.5);
  border-left: 3px solid var(--kb-primary);
}

/* Search results */
.kb-search-result {
  border-left: 3px solid transparent;
  transition: border-color var(--kb-transition-fast);
}

.kb-search-result:hover {
  border-left-color: var(--kb-primary);
  background: rgba(0, 255, 204, 0.05);
}
```

### Layout Customization

Modify responsive breakpoints:

```css
/* Mobile adjustments */
@media (max-width: 768px) {
  .kb-sidebar {
    width: 100vw;  /* Full width on mobile */
  }

  .kb-tour-controls {
    bottom: 20px;  /* Adjust position */
  }
}

/* Tablet adjustments */
@media (min-width: 769px) and (max-width: 1024px) {
  .kb-sidebar {
    width: 400px;
  }
}
```

### Dark/Light Theme Toggle

Create theme variants:

```css
/* Light theme override */
[data-theme="light"] {
  --kb-bg-dark: rgba(240, 240, 245, 0.95);
  --kb-bg-light: rgba(250, 250, 255, 0.9);
  --kb-text-primary: #1a1a1a;
  --kb-text-secondary: rgba(0, 0, 0, 0.7);
  --kb-border: rgba(0, 0, 0, 0.1);
}

/* High contrast theme */
[data-theme="high-contrast"] {
  --kb-primary: #ffff00;
  --kb-bg-dark: #000000;
  --kb-text-primary: #ffffff;
  --kb-border: #ffffff;
}
```

Toggle theme:

```javascript
document.documentElement.setAttribute('data-theme', 'light');
```

### Custom Syntax Highlighting

Use different highlight.js themes:

```html
<!-- Atom One Dark (default) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">

<!-- Dracula -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/dracula.min.css">

<!-- GitHub Dark -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
```

---

## Performance Optimization

### Lazy Loading

Implement lazy loading for articles:

```javascript
class KnowledgeBaseService {
  async getArticle(id) {
    // Check cache first
    if (this.articleCache.has(id)) {
      return this.articleCache.get(id);
    }

    // Load on-demand
    const article = await this.loadArticle(id);
    this.articleCache.set(id, article);
    return article;
  }

  // Preload critical articles
  async preloadCriticalArticles() {
    const critical = [
      'internet-architecture/00-index',
      'internet-architecture/core-concepts'
    ];

    await Promise.all(
      critical.map(id => this.getArticle(id))
    );
  }
}
```

### Search Indexing

Optimize search index:

```javascript
// Build index incrementally
async initializeSearch() {
  this.fuse = null;
  this.searchQueue = [];

  // Index articles as they load
  for (const [id, article] of this.articles) {
    this.addToSearchIndex(article);

    // Yield to main thread every 5 articles
    if (this.searchQueue.length % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Build final index
  this.buildSearchIndex();
}

// Incremental indexing
addToSearchIndex(article) {
  this.searchQueue.push({
    id: article.id,
    title: article.title,
    content: article.content.substring(0, 500),  // Index first 500 chars
    tags: article.tags,
    summary: article.summary
  });
}
```

### Caching Strategies

Implement multi-level caching:

```javascript
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.diskCache = localStorage;
    this.maxMemorySize = 10; // MB
    this.maxDiskSize = 50;   // MB
  }

  // Memory cache (fastest)
  getFromMemory(key) {
    return this.memoryCache.get(key);
  }

  setInMemory(key, value) {
    // Evict if over size limit
    if (this.getMemorySize() > this.maxMemorySize) {
      this.evictLRU();
    }
    this.memoryCache.set(key, value);
  }

  // Disk cache (persistent)
  getFromDisk(key) {
    const cached = localStorage.getItem(`kb-cache-${key}`);
    return cached ? JSON.parse(cached) : null;
  }

  setInDisk(key, value) {
    try {
      localStorage.setItem(`kb-cache-${key}`, JSON.stringify(value));
    } catch (e) {
      // Clear old cache if quota exceeded
      this.clearOldCache();
    }
  }

  // Get with fallback
  async get(key, loader) {
    // Try memory first
    let value = this.getFromMemory(key);
    if (value) return value;

    // Try disk second
    value = this.getFromDisk(key);
    if (value) {
      this.setInMemory(key, value);
      return value;
    }

    // Load and cache
    value = await loader();
    this.setInMemory(key, value);
    this.setInDisk(key, value);
    return value;
  }
}
```

### Virtual Scrolling

Implement for large search results:

```javascript
class VirtualList {
  constructor(container, items, rowHeight) {
    this.container = container;
    this.items = items;
    this.rowHeight = rowHeight;
    this.visibleRows = Math.ceil(container.offsetHeight / rowHeight);
    this.startIndex = 0;

    this.render();
    this.setupScrollListener();
  }

  render() {
    const endIndex = this.startIndex + this.visibleRows + 5; // +5 buffer
    const visibleItems = this.items.slice(this.startIndex, endIndex);

    this.container.innerHTML = visibleItems
      .map((item, i) => this.renderItem(item, this.startIndex + i))
      .join('');

    // Set container height for scrolling
    this.container.style.height = `${this.items.length * this.rowHeight}px`;
  }

  setupScrollListener() {
    this.container.addEventListener('scroll', () => {
      const scrollTop = this.container.scrollTop;
      const newStartIndex = Math.floor(scrollTop / this.rowHeight);

      if (newStartIndex !== this.startIndex) {
        this.startIndex = newStartIndex;
        this.render();
      }
    });
  }
}
```

### Debouncing

Optimize event handlers:

```javascript
// Search debouncing
class DebouncedSearch {
  constructor(searchFn, delay = 300) {
    this.searchFn = searchFn;
    this.delay = delay;
    this.timeout = null;
  }

  search(query) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.searchFn(query);
    }, this.delay);
  }

  cancel() {
    clearTimeout(this.timeout);
  }
}

// Usage
const debouncedSearch = new DebouncedSearch(
  (query) => knowledgeBaseService.search(query),
  300
);

searchInput.addEventListener('input', (e) => {
  debouncedSearch.search(e.target.value);
});
```

---

## Extending the KB

### Adding New Categories

Create new category directory:

```bash
mkdir knowledge-base/networking
```

Add articles:

```markdown
---
title: TCP/IP Fundamentals
category: networking
difficulty: beginner
tags: [tcp, ip, protocols]
reading_time: 8
---

# TCP/IP Fundamentals

Content here...
```

Update service to recognize new category:

```javascript
// In knowledgeBaseService.js
this.categories = [
  'concepts',
  'data',
  'frameworks',
  'internet-architecture',
  'performance',
  'practical',
  'quick-ref',
  'security',
  'networking'  // Add new category
];
```

### Custom Data Formats

Support additional formats:

```javascript
class KnowledgeBaseService {
  async loadArticle(id) {
    const path = this.getArticlePath(id);
    const response = await fetch(path);
    const content = await response.text();

    // Detect format
    if (path.endsWith('.md')) {
      return this.parseMarkdown(content);
    } else if (path.endsWith('.json')) {
      return this.parseJSON(content);
    } else if (path.endsWith('.html')) {
      return this.parseHTML(content);
    }
  }

  parseJSON(content) {
    const data = JSON.parse(content);
    return {
      id: data.id,
      title: data.title,
      content: data.sections.map(s => s.content).join('\n\n'),
      metadata: data.metadata
    };
  }
}
```

### Integration Patterns

#### Widget Integration

Create KB widget for external sites:

```javascript
class KBWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.kb = null;
  }

  async init() {
    // Load KB standalone
    await knowledgeBaseService.initialize();

    // Create minimal UI
    this.createUI();

    // Setup interactions
    this.setupHandlers();
  }

  createUI() {
    this.container.innerHTML = `
      <div class="kb-widget">
        <input type="search" placeholder="Search knowledge base...">
        <div class="kb-widget-results"></div>
      </div>
    `;
  }

  setupHandlers() {
    const input = this.container.querySelector('input');
    input.addEventListener('input', (e) => {
      this.search(e.target.value);
    });
  }

  async search(query) {
    const results = await knowledgeBaseService.search(query);
    this.displayResults(results);
  }
}

// Usage
const widget = new KBWidget('kb-container');
await widget.init();
```

#### API Integration

Expose KB as REST API:

```javascript
class KBAPIServer {
  constructor(kb) {
    this.kb = kb;
    this.routes = this.setupRoutes();
  }

  setupRoutes() {
    return {
      '/api/kb/search': this.handleSearch.bind(this),
      '/api/kb/article/:id': this.handleGetArticle.bind(this),
      '/api/kb/categories': this.handleGetCategories.bind(this),
      '/api/kb/tours': this.handleGetTours.bind(this)
    };
  }

  async handleSearch(req, res) {
    const { query, category, difficulty } = req.query;
    const results = await this.kb.search(query, { category, difficulty });
    res.json({ results });
  }

  async handleGetArticle(req, res) {
    const article = this.kb.getArticle(req.params.id);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
    } else {
      res.json({ article });
    }
  }
}
```

---

## API Reference

### KnowledgeBaseService

#### Methods

**initialize()**
```javascript
await knowledgeBaseService.initialize();
// Returns: Promise<void>
```

**search(query, options)**
```javascript
const results = knowledgeBaseService.search('submarine cable', {
  category: 'internet-architecture',
  difficulty: 'beginner',
  limit: 10,
  threshold: 0.3
});
// Returns: Array<SearchResult>
```

**getArticle(id)**
```javascript
const article = knowledgeBaseService.getArticle('internet-architecture/00-index');
// Returns: Article | null
```

**getRelatedArticles(articleId, limit)**
```javascript
const related = knowledgeBaseService.getRelatedArticles('data/routing-protocols', 5);
// Returns: Array<Article>
```

**getArticlesForVisualization(type, data)**
```javascript
const articles = knowledgeBaseService.getArticlesForVisualization('cable', cableData);
// Returns: Array<Article>
```

**getAllCategories()**
```javascript
const categories = knowledgeBaseService.getAllCategories();
// Returns: Array<string>
```

### EducationalOverlay

#### Methods

**showTooltip(type, data, position)**
```javascript
await overlay.showTooltip('cable', cableData, { x: 100, y: 100 });
// Returns: Promise<void>
```

**showSidebar(articleId)**
```javascript
await overlay.showSidebar('internet-architecture/00-index');
// Returns: Promise<void>
```

**showModal(articleId)**
```javascript
await overlay.showModal('data/routing-protocols');
// Returns: Promise<void>
```

**showFullscreen(articleId)**
```javascript
await overlay.showFullscreen('security/cryptographic-reference');
// Returns: Promise<void>
```

**hide(mode)**
```javascript
overlay.hide();          // Hide current mode
overlay.hide('tooltip'); // Hide specific mode
// Returns: void
```

**switchTab(tab)**
```javascript
overlay.switchTab('search');   // 'article' | 'search' | 'related'
// Returns: void
```

**toggleBookmark()**
```javascript
overlay.toggleBookmark();
// Returns: boolean (new bookmark state)
```

**navigateBack()**
```javascript
overlay.navigateBack();
// Returns: void
```

### LearningTour

#### Methods

**start(tourId)**
```javascript
tour.start('submarine-cables');
// Returns: void
```

**nextStep()**
```javascript
tour.nextStep();
// Returns: void
```

**previousStep()**
```javascript
tour.previousStep();
// Returns: void
```

**stop()**
```javascript
tour.stop();
// Returns: void
```

**getAllTours()**
```javascript
const tours = tour.getAllTours();
// Returns: Array<TourDefinition>
```

**getProgress(tourId)**
```javascript
const progress = tour.getProgress('submarine-cables');
// Returns: { completed: number, total: number, percentage: number }
```

### KnowledgeSearch

#### Methods

**performSearch(query)**
```javascript
await search.performSearch('internet');
// Returns: Promise<Array<SearchResult>>
```

**clear()**
```javascript
search.clear();
// Returns: void
```

**getRecentSearches()**
```javascript
const history = search.getRecentSearches();
// Returns: Array<string>
```

---

## Advanced Integration Patterns

### Multi-Globe Integration

Integrate KB with multiple globe instances:

```javascript
class MultiGlobeKB {
  constructor(globes) {
    this.globes = globes;
    this.overlays = new Map();
  }

  async init() {
    for (const [id, globe] of this.globes) {
      const overlay = new EducationalOverlay();
      const kb = new KnowledgeBaseIntegration(globe);
      await kb.initialize();

      this.overlays.set(id, { globe, overlay, kb });
    }
  }

  showArticleOnGlobe(globeId, articleId) {
    const { overlay } = this.overlays.get(globeId);
    overlay.showSidebar(articleId);
  }
}
```

### Progressive Enhancement

Add KB features progressively:

```javascript
class ProgressiveKB {
  async init() {
    // Core features always
    await this.loadCore();

    // Optional features based on capabilities
    if (this.supportsIntersectionObserver()) {
      await this.loadLazyLoading();
    }

    if (this.hasFastConnection()) {
      await this.loadAllArticles();
    }

    if (this.hasLargeScreen()) {
      await this.loadFullscreenMode();
    }
  }

  hasFastConnection() {
    return navigator.connection?.effectiveType === '4g';
  }

  hasLargeScreen() {
    return window.innerWidth > 1200;
  }
}
```

---

**For main guide, see:** `KNOWLEDGE_BASE_GUIDE.md`

**For demo, see:** `docs/kb-demo.html`

**File Locations (Absolute Paths):**
- Advanced customizations: `C:\Users\brand\Development\Project_Workspace\active-development\internet\src\`
- Tour definitions: `C:\Users\brand\Development\Project_Workspace\active-development\internet\src\components\LearningTour.js`
- Styles: `C:\Users\brand\Development\Project_Workspace\active-development\internet\src\styles\knowledgeBase.css`
