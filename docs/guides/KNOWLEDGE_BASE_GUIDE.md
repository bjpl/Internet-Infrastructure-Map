# Knowledge Base Integration Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Overview](#overview)
3. [Basic Usage](#basic-usage)
4. [Content Structure](#content-structure)
5. [Search Functionality](#search-functionality)
6. [Integration Examples](#integration-examples)
7. [Display Modes](#display-modes)
8. [Learning Tours](#learning-tours)
9. [Troubleshooting](#troubleshooting)
10. [Browser Support](#browser-support)

---

## Quick Start

### 5-Minute Setup

#### Step 1: Verify Installation

All files should be in these locations:
```
internet/
├── src/
│   ├── services/
│   │   └── knowledgeBaseService.js ✓
│   ├── components/
│   │   ├── EducationalOverlay.js ✓
│   │   ├── LearningTour.js ✓
│   │   └── KnowledgeSearch.js ✓
│   ├── integrations/
│   │   └── knowledgeBaseIntegration.js ✓
│   └── styles/
│       └── knowledgeBase.css ✓
├── tests/
│   └── components/
│       └── knowledgeBase.test.js ✓
└── knowledge-base/ (16 markdown files) ✓
```

#### Step 2: Install Dependencies

```bash
npm install marked highlight.js fuse.js
```

**Dependencies:**
- `marked` (^16.4.0) - Markdown parsing
- `highlight.js` (^11.11.1) - Syntax highlighting
- `fuse.js` (^7.1.0) - Fuzzy search

#### Step 3: Add to index.html

```html
<!-- In <head> section -->
<link rel="stylesheet" href="./src/styles/knowledgeBase.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
```

#### Step 4: Integrate with main-clean.js

Add this to your `CleanInfrastructureMap` class:

```javascript
// At the top of main-clean.js
import KnowledgeBaseIntegration from './integrations/knowledgeBaseIntegration.js';

class CleanInfrastructureMap {
  constructor() {
    // ... existing code ...
    this.kbIntegration = null;
  }

  async init() {
    this.setupLoadingScreen();
    await this.createCleanGlobe();
    await this.loadCleanData();
    this.setupMinimalControls();

    // ADD THIS: Initialize KB Integration
    await this.initializeKnowledgeBase();

    this.hideLoadingScreen();
  }

  async initializeKnowledgeBase() {
    try {
      this.updateLoadingStatus('Loading knowledge base...');
      this.kbIntegration = new KnowledgeBaseIntegration(this.globe);
      await this.kbIntegration.initialize();
      console.log('Knowledge Base initialized');
    } catch (error) {
      console.error('KB initialization failed:', error);
    }
  }
}
```

#### Step 5: Add Event Dispatchers

Enable click/hover interactions on cables and datacenters:

```javascript
// In main-clean.js, modify the globe setup

// For cable clicks
this.globe.onArcClick(arc => {
  if (!arc) return;

  const event = new CustomEvent('arc-click', {
    detail: {
      id: arc.label,
      name: arc.label,
      capacity: arc.capacity,
      status: arc.status,
      accuracy: arc.accuracy
    }
  });
  document.dispatchEvent(event);
});

// For cable hovers
this.globe.onArcHover(arc => {
  if (arc) {
    const event = new CustomEvent('arc-hover', {
      detail: {
        cableData: {
          id: arc.label,
          name: arc.label,
          capacity: arc.capacity,
          status: arc.status,
          accuracy: arc.accuracy
        },
        position: {
          x: window.innerWidth / 2,
          y: 200
        }
      }
    });
    document.dispatchEvent(event);
  } else {
    // Hide tooltip when not hovering
    if (this.kbIntegration?.overlay) {
      this.kbIntegration.overlay.hide('tooltip');
    }
  }
});

// For datacenter clicks
this.globe.onPointClick(point => {
  if (!point) return;

  const event = new CustomEvent('point-click', {
    detail: {
      id: point.city,
      name: point.name,
      city: point.city,
      country: point.country,
      tier: point.tier
    }
  });
  document.dispatchEvent(event);
});
```

---

## Overview

The Knowledge Base Integration provides a comprehensive educational layer for the Live Internet Infrastructure Map, seamlessly integrating 16+ markdown articles across 8 categories with multiple display modes, full-text search, guided tours, and interactive learning features.

### Architecture

The system is built with five core components:

```
knowledge-base-integration/
├── services/
│   └── knowledgeBaseService.js        # Core service: loading, indexing, search
├── components/
│   ├── EducationalOverlay.js          # Multi-mode display
│   ├── LearningTour.js                # Guided tours
│   └── KnowledgeSearch.js             # Search UI
├── integrations/
│   └── knowledgeBaseIntegration.js    # Main integration
├── styles/
│   └── knowledgeBase.css              # Complete styling
└── tests/
    └── components/
        └── knowledgeBase.test.js      # Test suite
```

### Key Features

- **16+ Articles** across 8 categories
- **Full-text Search** with fuzzy matching and filters
- **4 Display Modes** (tooltip, sidebar, modal, fullscreen)
- **4 Guided Tours** with step-by-step navigation
- **Related Articles** via intelligent recommendations
- **Bookmarks** and navigation history
- **Syntax Highlighting** for code snippets
- **Responsive Design** for all devices
- **Accessibility** compliant (WCAG 2.1 AA)

---

## Basic Usage

### Showing Articles

```javascript
// From anywhere in your code
if (window.kbIntegration) {
  // Show in sidebar
  window.kbIntegration.showArticle('internet-architecture/00-index', 'sidebar');

  // Show in fullscreen
  window.kbIntegration.showArticle('data/routing-protocols', 'fullscreen');

  // Show in modal
  window.kbIntegration.showArticle('security/cryptographic-reference', 'modal');
}
```

### Starting Tours

```javascript
if (window.kbIntegration) {
  // Start submarine cables tour
  window.kbIntegration.startTour('submarine-cables');

  // Start data centers tour
  window.kbIntegration.startTour('data-centers');
}
```

### Searching Content

```javascript
// Simple search
const results = await window.kbIntegration.search('BGP routing');

// Search with filters
const results = await window.kbIntegration.search('submarine cable', {
  category: 'internet-architecture',
  difficulty: 'beginner',
  limit: 10
});

console.log(`Found ${results.length} articles`);
```

### Using the Service Directly

```javascript
import knowledgeBaseService from './services/knowledgeBaseService.js';

// Initialize (done automatically by integration)
await knowledgeBaseService.initialize();

// Get specific article
const article = knowledgeBaseService.getArticle('internet-architecture/00-index');

// Search
const results = knowledgeBaseService.search('submarine cable', {
  category: 'internet-architecture',
  difficulty: 'beginner'
});

// Get related articles
const related = knowledgeBaseService.getRelatedArticles(articleId, 5);

// Get articles for visualization elements
const articles = knowledgeBaseService.getArticlesForVisualization('cable', cableData);
```

---

## Content Structure

### Knowledge Base Organization

```
knowledge-base/
├── concepts/              # Conceptual frameworks
│   └── cross-reference.md
├── data/                  # Technical data references
│   ├── cdn-technologies.md
│   ├── dns-records.md
│   ├── encryption-algorithms.md
│   ├── network-layers.md
│   ├── performance-metrics.md
│   └── routing-protocols.md
├── frameworks/            # Decision frameworks
│   └── routing-decision-framework.md
├── internet-architecture/ # Core architecture
│   ├── 00-index.md
│   └── core-concepts.md
├── performance/           # Optimization guides
│   └── optimization-strategies.md
├── practical/             # Practical guides
│   └── troubleshooting-guide.md
├── quick-ref/             # Quick references
│   ├── http-status.md
│   ├── ports.md
│   └── protocol-stack.md
└── security/              # Security references
    └── cryptographic-reference.md
```

**Total:** 16 articles across 8 categories

### Article Format

All articles use markdown with optional frontmatter:

```markdown
---
title: Article Title
category: internet-architecture
difficulty: beginner
tags: [submarine-cables, infrastructure]
reading_time: 5
---

# Article Title

Content here...
```

**Metadata Fields:**
- `title` - Article title
- `category` - One of 8 categories
- `difficulty` - beginner | intermediate | advanced
- `tags` - Array of keywords for search
- `reading_time` - Estimated minutes

### Cross-References

Articles can reference each other:

```markdown
See also: [Routing Protocols](../data/routing-protocols.md)
```

The service automatically builds relationships between articles based on:
- Shared tags
- Same category
- Explicit cross-references
- Related topics

---

## Search Functionality

### Full-Text Search

The Knowledge Base uses Fuse.js for powerful fuzzy search:

**Features:**
- **Full-text indexing** of all article content
- **Fuzzy matching** - finds results even with typos
- **Relevance ranking** - best matches first
- **Threshold tuning** - configurable sensitivity
- **Multi-field search** - searches title, content, tags

### Search Options

```javascript
const results = knowledgeBaseService.search('query', {
  // Filter by category
  category: 'internet-architecture',

  // Filter by difficulty
  difficulty: 'beginner',

  // Limit results
  limit: 10,

  // Search threshold (0.0 = exact, 1.0 = anything)
  threshold: 0.3
});
```

### Search Configuration

The search engine uses these settings:

```javascript
{
  // Fields to search
  keys: [
    { name: 'title', weight: 3 },      // Title most important
    { name: 'summary', weight: 2 },    // Summary next
    { name: 'content', weight: 1 },    // Full content
    { name: 'tags', weight: 2.5 }      // Tags highly weighted
  ],

  // Search behavior
  threshold: 0.3,        // Fuzzy matching sensitivity
  distance: 100,         // Character distance for matches
  minMatchCharLength: 2, // Minimum search term length

  // Performance
  includeScore: true,    // Return relevance scores
  includeMatches: true,  // Highlight matched text
  findAllMatches: true   // Find all occurrences
}
```

### Search Result Format

```javascript
{
  item: {
    id: 'internet-architecture/00-index',
    title: 'Internet Architecture Overview',
    category: 'internet-architecture',
    difficulty: 'beginner',
    tags: ['overview', 'infrastructure'],
    content: '...',
    summary: '...',
    readingTime: 5
  },
  score: 0.15,           // Lower is better (0 = perfect match)
  matches: [             // Highlighted matches
    {
      key: 'title',
      value: 'Internet Architecture Overview',
      indices: [[0, 8]]  // Match positions
    }
  ]
}
```

### Recent Searches

The search UI tracks recent searches:

```javascript
// Stored in localStorage
localStorage.getItem('kb-recent-searches')
// Returns: ["submarine cable", "routing", "BGP"]

// Maximum 10 recent searches
// Automatically cleared on browser storage clear
```

### Search UI Features

When using the `KnowledgeSearch` component:

**Interactive Features:**
- Real-time search with 300ms debouncing
- Category dropdown filter (8 categories)
- Difficulty dropdown filter (3 levels)
- Sort options (relevance, title, reading time, recency)
- Search result highlighting
- Click to open article
- Recent searches dropdown
- Clear button

**API:**

```javascript
const search = new KnowledgeSearch({
  container: searchContainer,
  onResultClick: (article) => {
    overlay.showSidebar(article.id);
  }
});

// Programmatic search
await search.performSearch('internet');

// Clear search
search.clear();

// Get search history
const history = search.getRecentSearches();
```

### Advanced Search Patterns

**Exact phrase:**
```javascript
search('"submarine cable"')  // Must match exact phrase
```

**Multiple terms:**
```javascript
search('cable routing protocol')  // Finds articles with any term
```

**Category-specific:**
```javascript
search('security', { category: 'security' })
```

**By difficulty:**
```javascript
search('', { difficulty: 'beginner' })  // All beginner articles
```

---

## Integration Examples

### Basic Integration

```javascript
// 1. Import modules
import knowledgeBaseService from './services/knowledgeBaseService.js';
import KnowledgeBaseIntegration from './integrations/knowledgeBaseIntegration.js';

// 2. Initialize (in main-clean.js)
async init() {
  // ... existing globe setup ...

  // Initialize KB
  this.kbIntegration = new KnowledgeBaseIntegration(this.globe);
  await this.kbIntegration.initialize();
}

// 3. That's it! The integration handles the rest.
```

### Custom Integration

```javascript
// Show specific article on cable click
this.globe.onArcClick(arc => {
  if (arc.label.includes('MAREA')) {
    kbIntegration.showArticle('internet-architecture/00-index', 'fullscreen');
  }
});

// Start tour on button click
document.getElementById('tour-btn').addEventListener('click', () => {
  kbIntegration.startTour('submarine-cables');
});

// Search from custom UI
const results = await kbIntegration.search('BGP routing');
console.log(`Found ${results.length} articles`);
```

### Visualization Integration

```javascript
// Cable clicks
globe.onArcClick(arc => {
  const event = new CustomEvent('arc-click', {
    detail: {
      name: arc.label,
      capacity: arc.capacity,
      accuracy: arc.accuracy
    }
  });
  document.dispatchEvent(event);
});

// Cable hovers
globe.onArcHover(arc => {
  if (arc) {
    const event = new CustomEvent('arc-hover', {
      detail: {
        cableData: arc,
        position: { x: event.clientX, y: event.clientY }
      }
    });
    document.dispatchEvent(event);
  } else {
    overlay.hide('tooltip');
  }
});

// Tour highlights
document.addEventListener('tour-highlight', (e) => {
  const { type, filter } = e.detail;

  if (type === 'cables') {
    renderCleanCables(allCables, filter);
  } else if (type === 'clear') {
    renderCleanCables(allCables, {});
  }
});
```

---

## Display Modes

The Educational Overlay supports four display modes:

### 1. Tooltip Mode

Quick facts on hover:

```javascript
const overlay = new EducationalOverlay();

// Show tooltip
await overlay.showTooltip('cable', cableData, { x: 100, y: 100 });
```

**Features:**
- Quick facts on hover
- "Learn More" button
- Smart positioning (viewport-aware)
- Auto-hides on mouse leave
- Minimal distraction

**Use Case:** Quick information lookup while exploring the visualization

### 2. Sidebar Mode

Persistent side panel:

```javascript
// Show sidebar
await overlay.showSidebar('internet-architecture/00-index');
```

**Features:**
- Persistent side panel (450px width)
- Three tabs: Article | Search | Related
- Full article rendering with syntax highlighting
- Bookmark support
- Navigation history
- Collapsible on mobile

**Use Case:** Reading while maintaining visualization context

### 3. Modal Mode

Focused reading:

```javascript
// Show modal
await overlay.showModal('data/routing-protocols');
```

**Features:**
- Centered overlay
- Backdrop blur
- Focused reading experience
- Click outside to close
- ESC to close

**Use Case:** Quick focused reading without leaving visualization

### 4. Fullscreen Mode

Immersive reading:

```javascript
// Show fullscreen
await overlay.showFullscreen('data/routing-protocols');
```

**Features:**
- Immersive reading experience
- Auto-generated table of contents
- Related articles sidebar
- Distraction-free layout
- Print-friendly

**Use Case:** Deep reading and study

### Switching Between Modes

```javascript
// Change display mode
overlay.changeMode('fullscreen');

// Switch tabs (sidebar only)
overlay.switchTab('search');
overlay.switchTab('related');
overlay.switchTab('article');

// Hide any mode
overlay.hide();
```

### Bookmarks

Available in sidebar and fullscreen modes:

```javascript
// Toggle bookmark for current article
overlay.toggleBookmark();

// Get all bookmarks
const bookmarks = overlay.getBookmarks();

// Stored in localStorage
localStorage.getItem('kb-bookmarks')
```

### Navigation History

Track reading history:

```javascript
// Go back
overlay.navigateBack();

// Get history
const history = overlay.getHistory();
```

---

## Learning Tours

### Available Tours

Four pre-defined learning tours:

**1. Submarine Cables Tour**
- Duration: 8 minutes
- Difficulty: Beginner
- Steps: 6
- Topics: Atlantic cables, Pacific connections, landing points, redundancy

**2. Data Centers Tour**
- Duration: 6 minutes
- Difficulty: Beginner
- Steps: 5
- Topics: Tier classifications, geographic distribution, IXPs, energy

**3. Routing Tour**
- Duration: 10 minutes
- Difficulty: Intermediate
- Steps: 5
- Topics: Autonomous systems, BGP peering, path selection, convergence

**4. Performance Tour**
- Duration: 7 minutes
- Difficulty: Intermediate
- Steps: 5
- Topics: Speed of light, CDN edge locations, caching, optimization

### Using Tours

```javascript
const tour = new LearningTour(globe, overlay);

// Start a tour
tour.start('submarine-cables');

// Navigation
tour.nextStep();
tour.previousStep();
tour.stop();

// Get all available tours
const tours = tour.getAllTours();
```

### Tour Features

- **Step-by-step narration** with educational content
- **Camera movements** synchronized with content
- **Element highlighting** during tour steps
- **Progress tracking** (1 of 6, 2 of 6, etc.)
- **Keyboard navigation** (arrow keys, ESC)
- **Pause/resume** capability
- **"Learn More"** links to KB articles

### Tour Structure

Each tour step includes:

```javascript
{
  title: "Step Title",
  content: "Educational content...",
  duration: 5000,  // milliseconds

  // Camera movement
  camera: {
    lat: 40.7128,
    lng: -74.0060,
    altitude: 2.5
  },

  // Highlight elements
  highlight: {
    type: 'cables',
    filter: { region: 'atlantic' }
  },

  // Optional KB article link
  learnMore: 'internet-architecture/00-index'
}
```

### Keyboard Shortcuts

When tours are active:
- `→` - Next step
- `←` - Previous step
- `ESC` - Stop tour
- `Space` - Pause/Resume

---

## Troubleshooting

### KB Doesn't Load

**Symptoms:** Articles not appearing, search returning no results

**Check console for errors:**
```javascript
await knowledgeBaseService.initialize();
console.log('Articles loaded:', knowledgeBaseService.articles.size);
```

**Expected output:** `Articles loaded: 16`

**Solutions:**
- Verify all markdown files exist in `/knowledge-base/` directory
- Check for markdown parsing errors in console
- Ensure dependencies are installed: `npm install marked highlight.js fuse.js`
- Verify file paths are correct

### Tooltips Don't Show

**Symptoms:** Hovering over cables/datacenters shows nothing

**Verify events are dispatched:**
```javascript
document.addEventListener('arc-hover', (e) => {
  console.log('Arc hover:', e.detail);
});
```

**Solutions:**
- Add event dispatchers in `main-clean.js` (see Integration section)
- Verify `kbIntegration` is initialized
- Check for JavaScript errors in console
- Ensure overlay component is created

### Tours Don't Work

**Symptoms:** Tours don't start or steps don't advance

**Check globe integration:**
```javascript
const tour = window.kbIntegration?.tour;
console.log('Available tours:', tour?.getAllTours());
```

**Solutions:**
- Verify globe instance is passed to LearningTour
- Check camera control methods exist on globe
- Ensure tour definition files are loaded
- Test with keyboard shortcuts (arrow keys)

### Styles Not Applying

**Symptoms:** Components appear unstyled or broken layout

**Verify CSS is loaded:**
```html
<!-- Should be in <head> of index.html -->
<link rel="stylesheet" href="./src/styles/knowledgeBase.css">
```

**Solutions:**
- Check CSS file path is correct
- Verify no CSS conflicts with existing styles
- Clear browser cache
- Check for CSP (Content Security Policy) blocking styles

### Search Not Working

**Symptoms:** Search returns no results or errors

**Debug search:**
```javascript
const service = knowledgeBaseService;
console.log('Initialized:', service.initialized);
console.log('Articles:', service.articles.size);
console.log('Search index:', service.fuse);
```

**Solutions:**
- Ensure service is initialized
- Check Fuse.js is loaded
- Verify article content is indexed
- Test with simple queries first

### Performance Issues

**Symptoms:** Slow loading, laggy interactions

**Check performance:**
```javascript
console.time('KB Init');
await kbIntegration.initialize();
console.timeEnd('KB Init');
// Should be < 200ms
```

**Solutions:**
- Enable lazy loading for articles
- Reduce number of articles loaded at once
- Check for memory leaks in console
- Optimize search debounce timing

### Mobile Display Issues

**Symptoms:** Layout broken on mobile devices

**Solutions:**
- Verify responsive CSS is loaded
- Test with browser dev tools mobile emulation
- Check viewport meta tag: `<meta name="viewport" content="width=device-width">`
- Reduce sidebar width on small screens

---

## Browser Support

### Tested Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Required Features

- ES6 modules
- CSS Grid and Flexbox
- Fetch API
- LocalStorage
- Custom Events
- Intersection Observer

### Polyfills

Not required for modern browsers. For legacy support, add:

```html
<!-- For older browsers -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
```

### Accessibility Features

**WCAG 2.1 AA Compliant:**
- ✅ Keyboard navigation
- ✅ Screen reader support (ARIA labels)
- ✅ Focus indicators
- ✅ Color contrast ratios > 4.5:1
- ✅ Reduced motion support (`prefers-reduced-motion`)
- ✅ High contrast mode
- ✅ Semantic HTML

### Testing

Run the test suite:

```bash
# All tests
npm test

# KB tests only
npm test knowledgeBase

# Test demo page
npm run dev
# Open http://localhost:5173/docs/kb-demo.html
```

**Expected Results:**
- ✅ 75+ tests passing
- ✅ 16 articles loaded
- ✅ 8 categories available
- ✅ 4 tours functional
- ✅ Search working with filters
- ✅ All display modes operational

---

## Next Steps

1. **Review Demo:** Open `docs/kb-demo.html` to see all features in action
2. **Read Advanced Guide:** See `KB_ADVANCED_GUIDE.md` for customization and extension
3. **Add Content:** Create new articles in `/knowledge-base/` directory
4. **Customize Styling:** Modify `src/styles/knowledgeBase.css`
5. **Create Tours:** Add custom tours in `src/components/LearningTour.js`

---

**File Locations (Absolute Paths):**
- Services: `C:\Users\brand\Development\Project_Workspace\active-development\internet\src\services\knowledgeBaseService.js`
- Components: `C:\Users\brand\Development\Project_Workspace\active-development\internet\src\components\`
- Integration: `C:\Users\brand\Development\Project_Workspace\active-development\internet\src\integrations\knowledgeBaseIntegration.js`
- Styles: `C:\Users\brand\Development\Project_Workspace\active-development\internet\src\styles\knowledgeBase.css`
- Tests: `C:\Users\brand\Development\Project_Workspace\active-development\internet\tests\components\knowledgeBase.test.js`

**Ready to use!** 🚀
