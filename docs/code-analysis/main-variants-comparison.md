# Main.js Variants Comparison Report

**Analysis Date:** October 7, 2025
**Project:** Internet Infrastructure Map
**Analyzed Files:**
- `src/main.js` (16KB)
- `src/main-clean.js` (65KB) - **Currently Active**
- `src/main-beautiful.js` (21KB)
- `src/main-improved.js` (30KB)

---

## Executive Summary

This report analyzes four variants of the main visualization engine for the Internet Infrastructure Map. Each variant represents a different design philosophy and feature set. **main-clean.js** is currently the active version and is significantly larger than the others due to its comprehensive filtering system and data table functionality.

### Key Findings

1. **main-clean.js** is the most feature-complete variant with extensive filtering, data tables, and tooltip systems
2. **main-improved.js** focuses on robust error handling and progressive data loading
3. **main-beautiful.js** emphasizes visual aesthetics with categorized cables and particle effects
4. **main.js** serves as the original baseline implementation

---

## Feature Matrix

| Feature | main.js (16KB) | main-clean.js (65KB) | main-beautiful.js (21KB) | main-improved.js (30KB) |
|---------|----------------|----------------------|--------------------------|-------------------------|
| **Core Visualization** |
| Basic globe rendering | ✅ | ✅ | ✅ | ✅ |
| Submarine cables | ✅ | ✅ | ✅ | ✅ |
| Data centers | ✅ | ✅ | ✅ | ✅ |
| BGP routes | ✅ | ⚠️ Minimal | ⚠️ Minimal | ✅ Particle-based |
| DDoS attack visualization | ✅ | ❌ | ✅ Multi-layer | ✅ Multi-layer |
| **Cable Rendering** |
| Arc-based rendering | ✅ | ✅ | ✅ | ✅ |
| Custom line rendering | ❌ | ✅ Experimental | ❌ | ❌ |
| Cable categorization | ❌ | ❌ | ✅ (4 types) | ❌ |
| Capacity-based styling | ✅ | ✅ | ✅ | ✅ |
| Arc altitude calculation | ✅ Basic | ✅ Distance-based | ✅ Category-based | ✅ Basic |
| Date line handling | ❌ | ✅ Advanced | ❌ | ❌ |
| **Data Filtering** |
| Accuracy filter | ❌ | ✅ | ❌ | ❌ |
| Region filter | ❌ | ✅ (7 regions) | ❌ | ❌ |
| Capacity filter | ❌ | ✅ (3 levels) | ❌ | ❌ |
| Major cables only | ❌ | ✅ | ❌ | ❌ |
| Tier filter (DCs) | ✅ Basic | ✅ Advanced | ❌ | ✅ Basic |
| **UI Components** |
| Cable data table | ❌ | ✅ Sortable | ❌ | ❌ |
| DC data table | ❌ | ✅ Sortable | ❌ | ❌ |
| CSV export | ❌ | ✅ Both datasets | ❌ | ❌ |
| Info tooltips | ❌ | ✅ Smart-positioned | ❌ | ❌ |
| Filter counts display | ❌ | ✅ Dynamic | ❌ | ❌ |
| Panel collapse | ❌ | ✅ | ❌ | ❌ |
| Rotation control | ❌ | ✅ Play/Pause | ❌ | ❌ |
| **Performance** |
| Progressive loading | ❌ | ❌ | ❌ | ✅ Batched |
| Data clustering | ❌ | ❌ | ❌ | ✅ DC clustering |
| Cable limit (initial) | All | All (~550) | Limited selection | 100 then progressive |
| **Visual Effects** |
| Star field | ✅ 10,000 stars | ✅ 2,000 subtle | ✅ 5,000 stars | ✅ 10,000 stars |
| Atmosphere | ✅ | ✅ Subtle | ✅ Enhanced | ✅ |
| Lighting system | ✅ 4 lights | ✅ 2 minimal | ✅ 6 lights | ✅ 5 lights |
| Cable glow effects | ❌ | ❌ | ✅ Particle-based | ❌ |
| Data center pulses | ✅ GSAP | ❌ | ❌ | ✅ GSAP |
| Traffic particles | ❌ | ❌ | ❌ | ✅ BGP flows |
| **Error Handling** |
| Init error handling | ❌ | ❌ | ⚠️ Basic | ✅ Comprehensive |
| Data error recovery | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic | ✅ Partial data |
| Loading progress | ✅ | ✅ Custom | ✅ | ✅ With percentage |
| Error notifications | ❌ | ❌ | ❌ | ✅ Auto-dismiss |
| **Developer Features** |
| State tracking | ❌ | ❌ | ❌ | ✅ Detailed |
| Grid helper | ❌ | ❌ | ❌ | ✅ Toggle-able |
| Performance stats | ✅ | ✅ | ✅ | ✅ Enhanced |
| Keyboard shortcuts | ✅ (R) | ✅ (R) | ✅ (R) | ✅ (R, P, H) |
| Destroy/cleanup | ✅ | ❌ | ❌ | ✅ Complete |

**Legend:**
✅ Fully implemented
⚠️ Partially implemented
❌ Not implemented

---

## Detailed Analysis by Variant

### 1. main.js (16KB) - Original Baseline

**Class:** `InternetInfrastructureMap`
**Lines of Code:** ~500
**Dependencies:** Globe.gl, THREE.js, d3, gsap, DataManager

#### Architecture
- Clean, straightforward implementation
- Traditional promise-based initialization
- Direct globe.gl arc rendering
- Simple tooltip system

#### Strengths
- Simplest codebase, easiest to understand
- Fast initial load
- Stable, well-tested approach
- Good starting point for learning the codebase

#### Weaknesses
- No data filtering capabilities
- Limited user interaction
- Basic error handling
- No export functionality
- Fixed cable selection (no dynamic filtering)

#### Unique Features
- Original tooltip design
- Basic DDoS simulation with simple ripples
- Standard GSAP animations for data centers

#### Code Quality: 7/10
- **Readability:** Excellent (simple structure)
- **Maintainability:** Good (but feature-limited)
- **Performance:** Good (minimal overhead)
- **Scalability:** Limited (no filtering means all data loads)

---

### 2. main-clean.js (65KB) - Feature-Complete Production

**Class:** `CleanInfrastructureMap`
**Lines of Code:** ~1,828
**Dependencies:** Globe.gl, THREE.js, d3, DataManager

#### Architecture
- Comprehensive filtering system
- Multi-modal UI with data tables
- Smart tooltip positioning
- Extensive cable selection logic
- Alternative rendering paths (experimental custom lines)

#### Strengths
- **Most feature-complete variant**
- Advanced filtering (accuracy, region, capacity, major-only)
- Data table views with sorting and export
- Smart-positioned tooltips that avoid viewport edges
- Region-based cable filtering (7 regions)
- Distance-based arc altitude calculation
- Professional CSV export
- Responsive design considerations
- Panel collapse functionality

#### Weaknesses
- **Largest file size** (65KB)
- Complex codebase harder to maintain
- No progressive loading (loads all 550+ cables at once)
- Missing DDoS visualization
- No GSAP dependency (custom animations less smooth)
- Experimental features (custom line rendering) partially implemented
- Some code duplication in filtering logic

#### Unique Features
1. **Advanced Cable Filtering:**
   - Accuracy: live vs estimated
   - Region: transatlantic, transpacific, europe-asia, americas-internal, europe-internal, asia-internal, africa-connected
   - Capacity: high (>150 Tbps), medium (50-150), low (<50)
   - Major-only toggle

2. **Data Tables:**
   - Sortable columns
   - Filtered counts
   - CSV export for both cables and data centers
   - Modal dialogs with overlay

3. **Smart Tooltips:**
   - Viewport-aware positioning
   - Centered display
   - Semi-transparent overlay
   - Mobile responsive

4. **Arc Rendering Improvements:**
   - Distance-based altitude (prevents cutoff on long cables)
   - Date line normalization
   - Higher curve resolution (64 segments)
   - Proper great circle calculations

5. **Color Legend System:**
   - Capacity-based colors (cyan, gold, magenta)
   - Tier-based data center colors
   - Info icons with detailed explanations

#### Code Quality: 6/10
- **Readability:** Fair (complex filtering logic)
- **Maintainability:** Challenging (needs refactoring)
- **Performance:** Good (but no optimization for large datasets)
- **Scalability:** Good (comprehensive filtering helps)

#### Recommended Refactoring
```javascript
// Current: Inline filtering logic (lines 218-336)
// Should be: Separate FilterManager class

class FilterManager {
  applyAccuracyFilter(cables, accuracy) { }
  applyRegionFilter(cables, region) { }
  applyCapacityFilter(cables, capacity) { }
  applyMajorOnlyFilter(cables) { }
}
```

---

### 3. main-beautiful.js (21KB) - Visual Excellence

**Class:** `InternetInfrastructureMap`
**Lines of Code:** ~673
**Dependencies:** Globe.gl, THREE.js, d3, gsap, DataManager

#### Architecture
- Cable categorization system (4 types)
- Visual styling based on cable importance
- Enhanced lighting and particle effects
- GSAP-based smooth animations

#### Strengths
- **Best visual presentation**
- Intelligent cable categorization (transatlantic, transpacific, regional, domestic)
- Category-specific styling and colors
- Particle glow effects on major cables
- Multi-layered DDoS ripples (3 layers with stagger)
- Enhanced lighting (6 light sources)
- Color-coded tooltips by category
- Night sky earth texture

#### Weaknesses
- No data filtering
- No export functionality
- Limited cable selection (importance-based)
- Complex categorization logic
- Higher rendering overhead from particle systems
- No data tables

#### Unique Features
1. **Cable Categorization System:**
   ```javascript
   transatlantic: { color: '#00ffcc', glow: '#00ffcc', intensity: 1.0 }
   transpacific: { color: '#ff00ff', glow: '#ff00ff', intensity: 0.9 }
   regional: { color: '#ffcc00', glow: '#ffcc00', intensity: 0.7 }
   domestic: { color: '#00ccff', glow: '#00ccff', intensity: 0.5 }
   ```

2. **Intelligent Ocean Detection:**
   - `crossesAtlantic()` - Americas ↔ Europe/Africa
   - `crossesPacific()` - Americas ↔ Asia/Oceania
   - Distance-based fallback

3. **Capacity-Based Gradients:**
   - Ultra-high (>200 Tbps): Gradient to white
   - High (>100): Solid bright color
   - Medium (>50): Color gradient
   - Low: Darker shade

4. **Cable Glow Effects:**
   - 20 particles per major cable
   - Additive blending
   - Pulsing opacity animation
   - Interpolated along arc path

5. **Multi-Layer Attack Visualization:**
   - 3 concentric rings
   - Staggered animations (0.2s delay)
   - Color gradient (red → orange → yellow)

#### Code Quality: 8/10
- **Readability:** Good (well-structured)
- **Maintainability:** Good (modular categorization)
- **Performance:** Fair (particle overhead)
- **Scalability:** Limited (no filtering)

---

### 4. main-improved.js (30KB) - Robust Engineering

**Class:** `InternetInfrastructureMap`
**Lines of Code:** ~961
**Dependencies:** Globe.gl, THREE.js, d3, gsap, DataManager

#### Architecture
- State management system
- Progressive data loading
- Comprehensive error handling
- Data center clustering
- Traffic visualization with particles

#### Strengths
- **Best error handling**
- Progressive loading (100 initial cables, then batched)
- Comprehensive state tracking
- Data center clustering for performance
- BGP traffic particle visualization
- Error notifications with auto-dismiss
- Keyboard shortcuts (R, P, H)
- Complete cleanup on destroy
- Loading progress percentage
- Debounced window resize

#### Weaknesses
- No data filtering
- No export functionality
- No data tables
- Clustering may hide detail
- More complex initialization

#### Unique Features
1. **State Management:**
   ```javascript
   this.state = {
     loaded: false,
     error: null,
     dataLoaded: { cables: false, datacenters: false, bgp: false }
   }
   ```

2. **Progressive Cable Loading:**
   - Initial: 100 cables (fast render)
   - Remaining: Loaded in batches of 50 with 500ms delay
   - Prevents initial render blocking

3. **Data Center Clustering:**
   - Clusters DCs within 2° lat/lng
   - Displays count in tooltip
   - Reduces point count for performance
   - Threshold: 2 degrees

4. **BGP Traffic Particles:**
   - Creates particle system per route
   - Particle count based on traffic volume
   - Animated flow along route
   - Additive blending for glow

5. **Error Handling:**
   - Try-catch at initialization
   - Partial data loading on failure
   - User-friendly error screen with retry
   - Floating error notifications
   - GSAP fade-out after 5 seconds

6. **Enhanced Tooltips:**
   - Smooth number animations
   - Scene object counting
   - Particle count tracking
   - GSAP-based transitions

7. **Performance Monitoring:**
   - FPS calculation
   - Frame counting
   - Stats update every 30 frames
   - Scene object traversal
   - Particle count aggregation

#### Code Quality: 9/10
- **Readability:** Very Good (well-commented)
- **Maintainability:** Excellent (modular design)
- **Performance:** Very Good (optimized loading)
- **Scalability:** Excellent (progressive loading)

#### Best Practices Demonstrated
- Async/await error handling
- Debounced event handlers
- Resource cleanup
- State encapsulation
- Separation of concerns

---

## Performance Comparison

### Initial Load Performance

| Variant | Initial Cables | Initial DCs | Load Strategy | Estimated FPS |
|---------|----------------|-------------|---------------|---------------|
| main.js | All (~550) | All (~500) | Synchronous | 50-55 |
| main-clean.js | All (~550) | 100 (tier-limited) | Synchronous | 50-55 |
| main-beautiful.js | Selected (~200) | 500 | Synchronous + Particles | 45-50 |
| main-improved.js | 100 → Progressive | Clustered | Async batched | 55-60 |

### Memory Footprint

| Variant | Scene Objects | Particles | Estimated Memory |
|---------|---------------|-----------|------------------|
| main.js | ~600 | 10,000 (stars) | ~25MB |
| main-clean.js | ~650 | 2,000 (stars) | ~22MB |
| main-beautiful.js | ~750 | ~14,000 (stars + cable glow) | ~30MB |
| main-improved.js | ~700 | ~15,000 (stars + traffic) | ~28MB |

### Render Complexity

**Arcs Rendered:**
- main.js: ~550 arcs (all cables)
- main-clean.js: ~550 arcs (filterable)
- main-beautiful.js: ~200 arcs (selected important)
- main-improved.js: 100 → 550 (progressive)

**Animation Overhead:**
- main.js: Low (basic GSAP)
- main-clean.js: Minimal (no GSAP)
- main-beautiful.js: High (GSAP + particles)
- main-improved.js: Medium (GSAP + selective)

---

## Code Quality Assessment

### Metrics Summary

| Variant | Cyclomatic Complexity | Code Duplication | Documentation | Test Coverage |
|---------|----------------------|------------------|---------------|---------------|
| main.js | Low (Simple) | Low | Minimal | None |
| main-clean.js | High (Many filters) | Medium | Good | None |
| main-beautiful.js | Medium | Low | Fair | None |
| main-improved.js | Medium | Low | Excellent | None |

### Technical Debt Analysis

#### main.js
- **Debt Level:** Low
- **Issues:** Limited features mean future expansion requires rewrites
- **Refactoring Needed:** None currently

#### main-clean.js
- **Debt Level:** High
- **Issues:**
  - Filtering logic duplicated across functions (lines 218-336, 1396-1439)
  - Experimental features partially implemented
  - Large monolithic file (1,828 lines)
  - Tooltip positioning logic could be extracted
- **Refactoring Needed:**
  ```javascript
  // Extract to separate modules:
  - FilterManager (cable/DC filtering)
  - TableManager (data tables)
  - TooltipManager (smart positioning)
  - ExportManager (CSV generation)
  ```

#### main-beautiful.js
- **Debt Level:** Low-Medium
- **Issues:**
  - Cable categorization could be data-driven
  - Particle systems might impact performance at scale
- **Refactoring Needed:**
  ```javascript
  // Potential improvements:
  - Extract CableCategorizationService
  - Make particle count configurable
  - Add performance degradation fallback
  ```

#### main-improved.js
- **Debt Level:** Low
- **Issues:** Minimal, well-structured
- **Refactoring Needed:** None critical

### Security Considerations

All variants are safe from common vulnerabilities:
- ✅ No direct DOM manipulation with user input
- ✅ No eval() or Function() constructors
- ✅ Sanitized tooltip content
- ✅ No external data sources without validation

---

## Rendering Approaches Comparison

### Arc Rendering

| Approach | Variants Using | Pros | Cons |
|----------|----------------|------|------|
| **globe.gl arcs** | All variants | - Built-in<br>- GPU accelerated<br>- Smooth animation | - Limited customization<br>- Date line issues |
| **Custom THREE.Line** | main-clean.js (experimental) | - Full control<br>- Better date line handling | - More code<br>- Manual positioning |
| **Path-based** | main-clean.js (alternative) | - Multi-segment curves<br>- Precise control | - Higher overhead<br>- Complex implementation |

### Data Center Rendering

| Approach | Variants Using | Pros | Cons |
|----------|----------------|------|------|
| **globe.gl points** | All variants | Simple, fast | Limited styling |
| **Points + GSAP rings** | main.js, main-improved.js | Visual appeal | Animation overhead |
| **Clustered points** | main-improved.js | Performance | Loss of detail |

### Special Effects

| Effect | Implementation | Performance Impact |
|--------|----------------|-------------------|
| **Cable glow** (beautiful) | THREE.Points with AddBlend | Medium (20 particles × major cables) |
| **Traffic flow** (improved) | Animated particle systems | Medium-High (per BGP route) |
| **Attack ripples** (all) | GSAP ring animations | Low (temporary, short duration) |
| **Star field** (all) | Static THREE.Points | Low (one-time creation) |

---

## Data Handling Comparison

### Cable Data Processing

#### main.js
```javascript
// Simple mapping, no filtering
const cableArcs = cablesData.map(cable => ({
  startLat, startLng, endLat, endLng,
  color: cable.status === 'active' ? '#00ffcc' : '#ffcc00',
  stroke: cable.capacity_tbps > 100 ? 3 : 2
}));
```

#### main-clean.js
```javascript
// Complex filtering pipeline
1. selectImportantCables() - Importance-based selection
2. applyAccuracyFilter() - Live vs estimated
3. applyRegionFilter() - 7 geographic regions
4. applyCapacityFilter() - 3 capacity tiers
5. calculateImportance() - Multi-factor scoring
6. calculateDistance() - Great circle distance
7. Altitude based on distance (prevents cutoff)
```

#### main-beautiful.js
```javascript
// Categorization-based
1. categorizeCable() - 4 types (transatlantic/pacific/regional/domestic)
2. getCableGradient() - Capacity-based color gradients
3. getCableStroke() - Tiered stroke widths
4. getCableAltitude() - Category-specific heights
5. Sort by category for proper layering
```

#### main-improved.js
```javascript
// Progressive loading
1. Initial: First 100 cables
2. Batched: Remaining in chunks of 50
3. Delayed: 500ms between batches
4. Clustered data centers for performance
```

### Data Accuracy Handling

All variants support the `data_accuracy` field:
- ✅ Display in tooltips
- ✅ Visual indicators (🟢 live, 🟡 estimated)
- ⚠️ Only main-clean.js allows filtering by accuracy

---

## Recommendations

### Overall Assessment

| Category | Recommended Variant | Rationale |
|----------|-------------------|-----------|
| **Production Use** | main-clean.js | Most features, best filtering |
| **Visual Demo** | main-beautiful.js | Best aesthetics, impressive |
| **Learning/Tutorial** | main.js | Simplest, easiest to understand |
| **Scalable Foundation** | main-improved.js | Best architecture, performance |

### Consolidation Strategy

#### Phase 1: Immediate Actions
1. **Keep main-clean.js active** for current production needs
2. **Archive main.js** as reference implementation
3. **Document main-beautiful.js** visual effects for potential integration

#### Phase 2: Feature Integration (Recommended)
Create a unified `main-unified.js` combining the best of all variants:

```javascript
// From main-clean.js:
+ Advanced filtering system
+ Data table views
+ CSV export
+ Smart tooltips

// From main-beautiful.js:
+ Cable categorization
+ Particle glow effects
+ Multi-layer attack visualization
+ Enhanced color schemes

// From main-improved.js:
+ Progressive loading
+ State management
+ Error handling
+ Data center clustering
+ Comprehensive cleanup

// From main.js:
+ Simple initialization flow
+ Clean baseline architecture
```

#### Phase 3: Refactoring Plan

**Extract to separate modules:**

```
src/
├── visualization/
│   ├── GlobeRenderer.js         (Core globe setup)
│   ├── CableRenderer.js         (Cable visualization)
│   ├── DataCenterRenderer.js    (DC visualization)
│   └── EffectsRenderer.js       (Particles, glows, attacks)
├── data/
│   ├── FilterManager.js         (All filtering logic)
│   ├── DataLoader.js            (Progressive loading)
│   └── DataProcessor.js         (Categorization, clustering)
├── ui/
│   ├── TableManager.js          (Data tables)
│   ├── TooltipManager.js        (Smart tooltips)
│   ├── ControlPanel.js          (UI controls)
│   └── ExportManager.js         (CSV export)
└── main-unified.js              (Orchestrator)
```

**Benefits:**
- Separation of concerns
- Reusable components
- Easier testing
- Better maintainability
- Reduced code duplication

---

## Feature Preservation Checklist

### Must Keep (from main-clean.js)
- [x] Advanced filtering (accuracy, region, capacity)
- [x] Data table views with sorting
- [x] CSV export functionality
- [x] Smart tooltip positioning
- [x] Distance-based arc altitude calculation
- [x] Date line handling improvements
- [x] Filter count displays
- [x] Panel collapse functionality

### Should Integrate (from main-beautiful.js)
- [ ] Cable categorization system
- [ ] Particle glow effects on major cables
- [ ] Multi-layered attack visualization (3 rings)
- [ ] Enhanced color schemes
- [ ] Category-specific tooltips
- [ ] Visual importance indicators

### Critical Features (from main-improved.js)
- [ ] Progressive data loading
- [ ] State management system
- [ ] Comprehensive error handling
- [ ] Data center clustering
- [ ] Cleanup on destroy
- [ ] Performance monitoring
- [ ] Debounced event handlers
- [ ] Keyboard shortcuts (R, P, H)

### Keep Simple (from main.js)
- [ ] Clean initialization flow
- [ ] Basic tooltip design
- [ ] Standard GSAP animations

---

## Performance Optimization Recommendations

### For main-clean.js (Current Active)

1. **Implement Progressive Loading**
   ```javascript
   // Replace immediate all-cable render with:
   async renderCleanCables(cables, filters = {}) {
     const filtered = this.applyFilters(cables, filters);
     const initial = filtered.slice(0, 100);
     this.globe.arcsData(this.formatArcs(initial));

     // Load remaining in batches
     await this.loadRemainingCables(filtered.slice(100));
   }
   ```

2. **Extract Filter Logic**
   ```javascript
   class CableFilterService {
     static filterByAccuracy(cables, accuracy) { }
     static filterByRegion(cables, region) { }
     static filterByCapacity(cables, capacity) { }
     static filterByMajorOnly(cables) { }
   }
   ```

3. **Optimize Distance Calculations**
   ```javascript
   // Cache distance calculations
   this.distanceCache = new Map();

   calculateDistance(cable) {
     const key = `${cable.id}`;
     if (this.distanceCache.has(key)) {
       return this.distanceCache.get(key);
     }
     const distance = /* calculation */;
     this.distanceCache.set(key, distance);
     return distance;
   }
   ```

4. **Virtualize Data Tables**
   ```javascript
   // For large datasets, only render visible rows
   // Consider react-window or similar virtual scrolling
   ```

### For main-beautiful.js

1. **Make Particle Count Configurable**
   ```javascript
   this.config = {
     maxParticlesPerCable: 20,
     performanceMode: 'auto' // 'high', 'medium', 'low'
   };
   ```

2. **Add Performance Degradation**
   ```javascript
   if (this.stats.fps < 30) {
     // Reduce particle count
     // Simplify effects
     // Disable non-critical animations
   }
   ```

### For main-improved.js

1. **Add Filtering Capabilities**
   - Integrate the filter system from main-clean.js
   - Maintain progressive loading approach

2. **Optimize Clustering Algorithm**
   ```javascript
   // Use spatial indexing (quadtree/octree)
   // Instead of O(n²) comparison
   ```

---

## Testing Recommendations

### Unit Tests Needed

```javascript
// For all variants:
describe('InternetInfrastructureMap', () => {
  describe('Cable Rendering', () => {
    it('should render cables with correct colors based on capacity');
    it('should calculate arc altitude based on distance');
    it('should handle invalid coordinates gracefully');
  });

  describe('Filtering (main-clean.js)', () => {
    it('should filter cables by accuracy');
    it('should filter cables by region correctly');
    it('should filter cables by capacity tiers');
    it('should combine multiple filters correctly');
  });

  describe('Categorization (main-beautiful.js)', () => {
    it('should categorize transatlantic cables');
    it('should categorize transpacific cables');
    it('should calculate importance correctly');
  });

  describe('Progressive Loading (main-improved.js)', () => {
    it('should load initial batch of 100 cables');
    it('should load remaining cables in batches');
    it('should handle loading errors gracefully');
  });
});
```

### Integration Tests Needed

```javascript
describe('Data Integration', () => {
  it('should load submarine cables from DataManager');
  it('should load data centers from DataManager');
  it('should handle missing data gracefully');
  it('should export correct CSV format');
});
```

### Performance Tests Needed

```javascript
describe('Performance', () => {
  it('should maintain >30 FPS with 550 cables');
  it('should handle 1000+ data centers without lag');
  it('should cluster data centers efficiently');
  it('should not leak memory over time');
});
```

---

## Migration Path

### Option 1: Incremental Enhancement (Recommended)

**Timeline: 2-3 weeks**

1. **Week 1:** Refactor main-clean.js
   - Extract FilterManager
   - Extract TableManager
   - Extract TooltipManager
   - Add unit tests

2. **Week 2:** Add features from other variants
   - Progressive loading (from main-improved.js)
   - Error handling (from main-improved.js)
   - Cable categorization (from main-beautiful.js)

3. **Week 3:** Polish and optimize
   - Performance testing
   - Visual refinements
   - Documentation
   - E2E testing

### Option 2: Clean Rewrite

**Timeline: 3-4 weeks**

1. Build new architecture from scratch
2. Cherry-pick best features from each variant
3. Modern patterns (TypeScript, modules, testing)
4. Comprehensive test suite

### Option 3: Maintain Variants

**Timeline: Ongoing**

- Keep all variants for different use cases
- Document when to use each
- Maintain separately
- **Not recommended** (maintenance burden)

---

## Conclusion

### Summary of Findings

1. **main-clean.js** is the most feature-complete but needs refactoring for maintainability
2. **main-improved.js** has the best architecture and error handling
3. **main-beautiful.js** provides the best visual experience
4. **main.js** serves as a good reference baseline

### Final Recommendation

**Consolidate to a single unified implementation** that combines:

- ✅ Advanced filtering from **main-clean.js**
- ✅ Progressive loading from **main-improved.js**
- ✅ Visual effects from **main-beautiful.js**
- ✅ Simple architecture from **main.js**

**Estimated effort:** 2-3 weeks for Option 1 (Incremental Enhancement)

**Expected benefits:**
- Single codebase to maintain
- Best features from all variants
- Improved performance
- Better code quality
- Easier testing and debugging

### Next Steps

1. ✅ Review this analysis with the team
2. ⬜ Choose consolidation approach (recommend Option 1)
3. ⬜ Create detailed refactoring plan
4. ⬜ Set up testing infrastructure
5. ⬜ Begin incremental migration
6. ⬜ Document new unified architecture

---

## Appendices

### A. File Size Breakdown

```
main.js:           16KB  (500 lines)
main-clean.js:     65KB  (1,828 lines)
main-beautiful.js: 21KB  (673 lines)
main-improved.js:  30KB  (961 lines)
```

### B. Dependency Matrix

| Dependency | main.js | main-clean.js | main-beautiful.js | main-improved.js |
|------------|---------|---------------|-------------------|------------------|
| globe.gl | ✅ | ✅ | ✅ | ✅ |
| THREE.js | ✅ | ✅ | ✅ | ✅ |
| d3 | ✅ | ✅ | ✅ | ✅ |
| gsap | ✅ | ❌ | ✅ | ✅ |
| DataManager | ✅ | ✅ | ✅ | ✅ |

### C. Browser Compatibility

All variants should work on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note:** All require WebGL support

### D. Glossary

- **Arc:** Curved line representing submarine cable on globe
- **Clustering:** Grouping nearby data centers to reduce render count
- **Progressive Loading:** Loading data in batches to improve initial render time
- **GSAP:** GreenSock Animation Platform for smooth animations
- **Tbps:** Terabits per second (cable capacity measure)

---

**Report Generated:** October 7, 2025
**Analyst:** Code Analyzer Agent
**Status:** Complete
**Recommendation:** Consolidate to unified implementation (Option 1)
