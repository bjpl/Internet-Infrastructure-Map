# Main Unified Implementation Guide

## Overview

The `main-unified.js` implementation consolidates the best features from all four main.js variants into a single, optimized, and modular codebase.

**Created:** October 7, 2025
**Based On:** Analysis in `docs/code-analysis/main-variants-comparison.md`

---

## Architecture

### Modular Component Structure

```
src/
├── main-unified.js               # Main orchestrator
├── components/
│   ├── GlobeRenderer.js          # Three.js globe setup
│   ├── FilterControls.js         # Advanced filtering system
│   ├── DataTableManager.js       # Data tables with export
│   └── EducationalOverlay.js     # Smart tooltips
└── dataManager.js                # Data loading (existing)

tests/
└── components/
    ├── FilterControls.test.js
    ├── DataTableManager.test.js
    └── GlobeRenderer.test.js
```

---

## Feature Consolidation

### From main-clean.js (65KB)
✅ **Advanced Filtering System**
- Accuracy filtering (live vs estimated)
- Regional filtering (7 regions)
- Capacity filtering (high/medium/low)
- Major cables only toggle
- Tier-based datacenter filtering

✅ **Data Tables**
- Sortable cable table
- Sortable datacenter table
- CSV export for both datasets
- Filter integration
- Responsive design

✅ **Smart Tooltips**
- Viewport-aware positioning
- Centered display
- Mobile responsive
- Semi-transparent overlay

✅ **Distance-Based Arc Altitude**
- Prevents cutoff on long cables
- Graduated altitude scaling
- Great circle calculations

### From main-improved.js (30KB)
✅ **Progressive Loading**
- Initial batch: 100 cables
- Remaining batches: 50 cables per batch
- 500ms delay between batches
- Prevents UI blocking

✅ **State Management**
- Application state tracking
- Layer visibility states
- Error states
- Loading states

✅ **Error Handling**
- Comprehensive try-catch
- User-friendly error messages
- Partial data loading on failure
- Graceful degradation

✅ **Cleanup & Resource Management**
- Proper destroy method
- GSAP animation cleanup
- Event listener removal
- Memory leak prevention

### From main-beautiful.js (21KB)
✅ **Particle Glow Effects**
- 20 particles per major cable
- Additive blending
- Pulsing animations
- Color-coded by importance

✅ **Multi-Layer Attack Visualization**
- 3 concentric rings
- Staggered animations
- Color gradients (red → orange → yellow)
- Smooth GSAP transitions

✅ **Enhanced Visual Effects**
- 5,000 star field
- Atmospheric lighting (5 lights)
- Color-coded cables by capacity
- Visual importance indicators

### From main.js (16KB)
✅ **Simple Initialization Flow**
- Clean async/await pattern
- Straightforward setup
- Minimal complexity
- Easy to understand

---

## Component API

### GlobeRenderer

**Purpose:** Manages Three.js globe initialization and scene setup

```javascript
import { GlobeRenderer } from './components/GlobeRenderer.js';

const renderer = new GlobeRenderer(container, {
  globeImage: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  initialView: { lat: 20, lng: -40, altitude: 2.8 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
  starCount: 5000
});

await renderer.init();

// Access Three.js objects
const globe = renderer.getGlobe();
const scene = renderer.getScene();
const camera = renderer.getCamera();

// Control visibility
renderer.toggleAtmosphere(true);
renderer.toggleStars(false);
renderer.toggleAutoRotate(true);

// Reset view
renderer.resetView(1000);

// Cleanup
renderer.destroy();
```

**Key Methods:**
- `init()` - Initialize globe and scene
- `setupScene()` - Configure renderer and lighting
- `setupLights()` - Add ambient, directional, and accent lights
- `createStarField()` - Generate star particles
- `toggleAtmosphere(visible)` - Show/hide atmosphere
- `toggleStars(visible)` - Show/hide star field
- `toggleAutoRotate(enabled)` - Enable/disable rotation
- `resetView(duration)` - Reset camera position
- `onResize()` - Handle window resize
- `destroy()` - Cleanup resources

---

### FilterControls

**Purpose:** Advanced filtering for cables and data centers

```javascript
import { FilterControls } from './components/FilterControls.js';

const filterControls = new FilterControls((filters) => {
  // Handle filter change
  console.log('Filters changed:', filters);
});

filterControls.init();

// Apply filters to dataset
const filtered = filterControls.applyFilters(cables);

// Get current filters
const currentFilters = filterControls.getFilters();
// { accuracy: 'live', region: 'transatlantic', capacity: 'high', majorOnly: true }

// Reset filters
filterControls.resetFilters();
```

**Filter Types:**

1. **Accuracy Filter**
   - `all` - Show all cables
   - `live` - Only live data
   - `estimated` - Only estimated data

2. **Region Filter**
   - `all` - All regions
   - `transatlantic` - Americas ↔ Europe/Africa
   - `transpacific` - Americas ↔ Asia/Oceania
   - `europe-asia` - Europe ↔ Asia
   - `americas-internal` - Within Americas
   - `europe-internal` - Within Europe
   - `asia-internal` - Within Asia-Pacific
   - `africa-connected` - To/from Africa

3. **Capacity Filter**
   - `all` - All capacities
   - `high` - > 150 Tbps
   - `medium` - 50-150 Tbps
   - `low` - < 50 Tbps

4. **Major Only Toggle**
   - Filters for high-capacity and named cables

**Key Methods:**
- `applyFilters(cables)` - Apply all filters
- `filterByAccuracy(cables, accuracy)` - Filter by data accuracy
- `filterByRegion(cables, region)` - Filter by geographic region
- `filterByCapacity(cables, capacity)` - Filter by capacity tier
- `filterMajorCables(cables)` - Filter for major cables only
- `calculateDistance(lat1, lon1, lat2, lon2)` - Great circle distance
- `getFilters()` - Get current filter state
- `resetFilters()` - Reset to defaults

---

### DataTableManager

**Purpose:** Sortable data tables with CSV export

```javascript
import { DataTableManager } from './components/DataTableManager.js';

const tableManager = new DataTableManager(
  (type) => getFilteredData(type),  // Callback for data
  (lat1, lon1, lat2, lon2) => calculateDistance(...)  // Distance calculator
);

tableManager.init();

// Tables auto-populate when modals are opened
// Export is triggered by export buttons
```

**Features:**
- Sortable columns (click headers)
- Filtered row counts
- CSV export for cables and data centers
- Modal dialog management
- XSS protection (HTML escaping)

**Key Methods:**
- `init()` - Initialize table controls
- `populateCableTable()` - Populate cable table
- `populateDataCenterTable()` - Populate datacenter table
- `sortTable(tableId, columnIndex, dataType)` - Sort by column
- `exportCablesToCSV()` - Export cables to CSV
- `exportDataCentersToCSV()` - Export datacenters to CSV
- `generateCSV(headers, rows)` - Generate CSV string
- `downloadCSV(csv, filename)` - Trigger download
- `escapeHtml(text)` - Prevent XSS

---

### EducationalOverlay

**Purpose:** Smart tooltips with viewport-aware positioning

```javascript
import { EducationalOverlay } from './components/EducationalOverlay.js';

const overlay = new EducationalOverlay();
overlay.init();

// Create tooltips (used by globe arcs/points)
const cableTooltip = overlay.createCableTooltip(cableData, calculateDistance);
const dcTooltip = overlay.createDataCenterTooltip(datacenterData);
```

**Features:**
- Smart positioning (centered, viewport-aware)
- Mobile responsive
- Semi-transparent overlay
- Click-outside-to-close
- Multiple tooltip management

**Key Methods:**
- `init()` - Initialize tooltip system
- `setupInfoTooltips()` - Setup info icon tooltips
- `toggleTooltip(tooltipId, triggerElement)` - Show/hide tooltip
- `positionTooltip(tooltip, triggerElement)` - Smart positioning
- `createCableTooltip(cable, calculateDistance)` - Generate cable tooltip HTML
- `createDataCenterTooltip(dc)` - Generate datacenter tooltip HTML
- `hideAllTooltips()` - Close all open tooltips

---

## Performance Optimizations

### Progressive Loading
```javascript
// Initial render: 100 cables (fast)
const initialBatch = cables.slice(0, 100);
globe.arcsData(formatCableArcs(initialBatch));

// Then load remaining in batches of 50
loadRemainingCables(cables.slice(100));
```

**Benefits:**
- Fast initial render
- No UI blocking
- Smooth user experience
- Better perceived performance

### Distance-Based Arc Altitude
```javascript
// Prevents long cables from being cut off
if (distance > 15000) {
  altitude = 0.5 + ((distance - 15000) / 5000) * 0.2; // 0.5-0.7
} else if (distance > 10000) {
  altitude = 0.35;  // Transoceanic
} else if (distance > 5000) {
  altitude = 0.25;  // Long distance
} else {
  // ... graduated scaling
}
```

**Benefits:**
- No arc clipping
- Natural appearance
- Better visibility
- Proper great circle representation

### Particle Glow Optimization
```javascript
// Only add glow to important cables
const majorCables = cableArcs.filter(c => c.importance > 0.7);
addCableGlowEffects(majorCables);
```

**Benefits:**
- Reduced particle count
- Better performance
- Focused visual emphasis
- 60fps target maintained

---

## Usage Guide

### Basic Initialization

```javascript
import UnifiedInfrastructureMap from './src/main-unified.js';

// Auto-initializes on DOMContentLoaded
window.app = new UnifiedInfrastructureMap();
```

### Accessing Components

```javascript
// Get globe renderer
const globeRenderer = window.app.globeRenderer;
globeRenderer.resetView();

// Get filter controls
const filters = window.app.filterControls.getFilters();

// Get filtered data
const cables = window.app.getFilteredData('cables');
```

### Event Handling

```javascript
// Layer toggles
document.getElementById('toggle-cables').addEventListener('change', (e) => {
  window.app.state.layers.cables = e.target.checked;
});

// Filter changes
window.app.filterControls.onFilterChange = (filters) => {
  console.log('Filters updated:', filters);
};
```

### Cleanup

```javascript
// Before page unload
window.addEventListener('beforeunload', () => {
  if (window.app) {
    window.app.destroy();
  }
});
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run component tests
npm test tests/components

# Run specific test file
npm test tests/components/FilterControls.test.js

# Watch mode
npm test -- --watch
```

### Test Coverage

```bash
npm run test:coverage
```

**Target Coverage:**
- FilterControls: >90%
- DataTableManager: >85%
- GlobeRenderer: >80%
- EducationalOverlay: >75%

---

## Migration from Old Versions

### From main-clean.js

**Changes:**
- Filter logic moved to `FilterControls` component
- Table logic moved to `DataTableManager` component
- Globe setup moved to `GlobeRenderer` component

**Benefits:**
- Smaller main file (from 65KB → ~30KB)
- Testable components
- Reusable modules

### From main-improved.js

**Changes:**
- Retained progressive loading
- Retained error handling
- Added advanced filtering
- Added data tables

**Benefits:**
- All features from both variants
- Better organization
- No feature loss

### From main-beautiful.js

**Changes:**
- Retained particle glow effects
- Retained multi-layer attacks
- Added filtering capabilities
- Added data tables

**Benefits:**
- Beautiful + functional
- No visual quality loss
- Enhanced features

---

## Troubleshooting

### Issue: Cables Not Rendering

**Symptoms:** Globe loads but no cables appear

**Solutions:**
1. Check filter settings - may be too restrictive
2. Open browser console for errors
3. Verify data loaded successfully
4. Check `toggle-cables` checkbox is enabled

```javascript
// Debug
console.log('All cables:', window.app.data.allCables.length);
console.log('Filtered cables:', window.app.data.filteredCables.length);
console.log('Globe arcs:', window.app.globeRenderer.getGlobe().arcsData().length);
```

### Issue: Performance Degradation

**Symptoms:** Low FPS, laggy interactions

**Solutions:**
1. Reduce number of data centers (tier filter)
2. Disable particle glow effects
3. Disable auto-rotation
4. Use major cables only filter

```javascript
// Optimize performance
window.app.filterControls.filters.majorOnly = true;
window.app.globeRenderer.toggleAutoRotate(false);
```

### Issue: Table Not Populating

**Symptoms:** Empty table when modal opens

**Solutions:**
1. Check `getFilteredData` callback
2. Verify data is loaded
3. Check filter state
4. Inspect browser console

```javascript
// Debug
console.log('Cables for table:', window.app.getFilteredData('cables'));
```

---

## Performance Metrics

### Target Performance
- **FPS:** >30 (mobile), >55 (desktop)
- **Initial Load:** <3 seconds
- **Filter Response:** <200ms
- **Table Population:** <500ms

### Monitoring

```javascript
// Check FPS
console.log('FPS:', window.app.stats.fps);

// Check scene stats
console.log('Objects:', window.app.stats.objects);
console.log('Particles:', window.app.stats.particles);

// Check data counts
console.log('Cables:', window.app.stats.cables);
console.log('Data Centers:', window.app.stats.datacenters);
```

---

## Future Enhancements

### Planned Features
1. **TypeScript Migration** - Add type safety
2. **WebWorkers** - Offload filtering to background thread
3. **Virtual Scrolling** - Handle 10,000+ datacenter table rows
4. **Indexed DB** - Cache data locally
5. **Service Worker** - Offline support

### Considered But Not Implemented
- Custom line rendering (too complex, globe.gl arcs sufficient)
- BGP traffic particles (clutters visualization)
- Real-time data updates (out of scope)

---

## Credits

**Created By:** Internet Infrastructure Map Team
**Date:** October 7, 2025
**Based On:** Analysis of 4 main.js variants
**Contributors:**
- main-clean.js - Advanced filtering and tables
- main-improved.js - Progressive loading and error handling
- main-beautiful.js - Visual effects and particle systems
- main.js - Clean baseline architecture

---

## License

Same as parent project

---

## Related Documentation

- [Main Variants Comparison](./code-analysis/main-variants-comparison.md)
- [Component API Reference](./API_REFERENCE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
