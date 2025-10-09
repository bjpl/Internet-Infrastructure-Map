# Developer Cheat Sheet

**Quick reference for developers working on the Live Internet Infrastructure Map**

---

## 🏗️ Architecture Overview

```
UI Layer
  ↓
Components (15+)
  ↓
DataOrchestrator (Central Coordinator)
  ↓
┌─────────────┬──────────────┬─────────────┬──────────────┐
│             │              │             │              │
API Service   Cache Service  KB Service    Fallback
│             │              │             │
├─TeleGeo     L1: Memory     Search       Hardcoded Data
├─PeeringDB   L2: IndexedDB  Tours
└─Cloudflare                 Articles
```

---

## 🎯 Key Services

### DataOrchestrator
```javascript
import { DataOrchestrator } from './services/dataOrchestrator.js';

const orch = new DataOrchestrator({
  enableAutoRefresh: true,
  refreshInterval: 300000, // 5 min
  enableCache: true
});

// Get data
const cables = await orch.getCables();
const ixps = await orch.getIXPs();
const dcs = await orch.getDataCenters();

// Get all at once
const all = await orch.getAllInfrastructure();

// Health check
const health = orch.getHealth();

// Force refresh
await orch.refreshData('cables');
```

### Cache Service
```javascript
import { CacheService } from './services/cacheService.js';

const cache = new CacheService();

// Set with TTL
await cache.set('key', data, 300000); // 5 min

// Get
const data = await cache.get('key');

// Clear
await cache.clear();

// Stats
const stats = cache.getStats();
console.log('Hit rate:', stats.l1.hitRate);
```

### Knowledge Base
```javascript
import knowledgeBaseService from './services/knowledgeBaseService.js';

await knowledgeBaseService.initialize();

// Search
const results = knowledgeBaseService.search('BGP');

// Get article
const article = knowledgeBaseService.getArticle('internet-architecture/00-index');

// Related
const related = knowledgeBaseService.getRelatedArticles(id, 5);
```

---

## 🔌 API Clients

### TeleGeography
```javascript
import { TeleGeographyAPI } from './services/dataSources/TeleGeographyAPI.js';

const tg = new TeleGeographyAPI();
const cables = await tg.getCables();
const cable = await tg.getCable('sea-us');
```

### PeeringDB
```javascript
import { PeeringDBAPI } from './services/dataSources/PeeringDBAPI.js';

const pdb = new PeeringDBAPI({
  apiKey: import.meta.env.VITE_PEERINGDB_API_KEY
});

const ixps = await pdb.getIXPs({ country: 'US' });
const facilities = await pdb.getFacilities({ city: 'London' });
```

### Cloudflare Radar
```javascript
import { CloudflareRadarAPI } from './services/dataSources/CloudflareRadarAPI.js';

const cf = new CloudflareRadarAPI({
  token: import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN
});

const attacks = await cf.getAttackData({ dateRange: '1h' });

// Real-time polling
cf.startPolling({
  onUpdate: (data) => console.log('New attacks:', data),
  onError: (err) => console.error(err)
});
```

---

## 🧪 Testing

### Run Tests
```bash
npm test                    # All tests
npm test -- DataOrchestrator # Specific file
npm test -- --coverage      # With coverage
```

### Test Structure
```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ComponentName', () => {
  let component;

  beforeEach(() => {
    component = new ComponentName();
  });

  it('should do something', () => {
    const result = component.method();
    expect(result).toBe(expected);
  });
});
```

---

## 🎨 UI Components

### DataFreshnessDashboard
```javascript
import DataFreshnessDashboard from './components/DataFreshnessDashboard.js';

const dashboard = new DataFreshnessDashboard(containerEl);
dashboard.updateMetrics(orchestrator.getQualityMetrics());
```

### EducationalOverlay
```javascript
import EducationalOverlay from './components/EducationalOverlay.js';

const overlay = new EducationalOverlay();

// Show modes
await overlay.showTooltip('cable', data, { x: 100, y: 100 });
await overlay.showSidebar('article-id');
await overlay.showModal('article-id');
await overlay.showFullscreen('article-id');

// Navigation
overlay.switchTab('search');
overlay.navigateBack();
overlay.toggleBookmark();
```

### LearningTour
```javascript
import LearningTour from './components/LearningTour.js';

const tour = new LearningTour(globe, overlay);

// Start tour
tour.start('submarine-cables');

// Controls
tour.nextStep();
tour.previousStep();
tour.stop();

// Get tours
const tours = tour.getAllTours();
```

---

## 🔍 Debugging

### Enable Debug Mode
```javascript
// Browser console
localStorage.setItem('debug', 'true');
location.reload();
```

### Check Service Health
```javascript
const health = orchestrator.getHealth();
console.log('TeleGeography:', health.services.telegeography);
console.log('PeeringDB:', health.services.peeringdb);
console.log('Cloudflare:', health.services.cloudflareRadar);
console.log('Cache:', health.cache);
console.log('Stats:', health.statistics);
```

### Monitor Network
```javascript
// In browser DevTools
// Network tab > Filter by 'api'
// Watch for:
// - 200 OK (success)
// - 429 (rate limit)
// - 401 (auth error)
// - 500+ (server error)
```

### Clear Everything
```javascript
// Nuclear option - reset all state
await orchestrator.cache.clear();
localStorage.clear();
sessionStorage.clear();
orchestrator.telegeography.client.resetCircuit();
orchestrator.peeringdb.client.resetCircuit();
location.reload();
```

---

## 🏷️ Data Structures

### Cable Object
```javascript
{
  id: 'cable-123',
  type: 'submarine-cable',
  name: 'MAREA',
  coordinates: [[lng, lat], ...],
  specs: {
    length: 6800,        // km
    capacity: 200000,    // Gbps
    readyForService: 2018
  },
  metadata: {
    source: 'telegeography',
    confidence: 0.85,
    freshness: 'static'
  }
}
```

### IXP Object
```javascript
{
  id: 'ixp-42',
  type: 'ixp',
  name: 'DE-CIX Frankfurt',
  location: { lat: 50.1109, lng: 8.6821 },
  networks: { count: 1000 },
  metadata: {
    source: 'peeringdb',
    confidence: 0.98,
    freshness: 'realtime'
  }
}
```

### Quality Metadata
```javascript
{
  source: 'live' | 'cache' | 'stale-cache' | 'fallback',
  confidence: 0.0 - 1.0,
  freshness: 'realtime' | 'live' | 'cache' | 'stale' | 'static',
  timestamp: 1696723200000,
  fallbackReason?: 'api-error' | 'rate-limit' | 'timeout'
}
```

---

## 🛠️ Configuration

### Environment Variables
```bash
# .env file
VITE_CLOUDFLARE_RADAR_TOKEN=xxx      # Required for attack data
VITE_PEERINGDB_API_KEY=xxx           # Optional (higher rate limit)
VITE_REFRESH_INTERVAL=300000         # 5 minutes
VITE_AUTO_REFRESH=true
VITE_ENABLE_CACHE=true
VITE_CACHE_TTL=300
```

### Vite Proxy (vite.config.js)
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
}
```

---

## 📊 Quality Metrics

### Confidence Levels
- **0.98**: Live PeeringDB - Most accurate
- **0.95**: Real-time Cloudflare - Very reliable
- **0.85**: TeleGeography - Industry standard
- **0.70**: Cached data - Slightly outdated
- **0.50**: Fallback - Estimated

### Freshness Levels
- **realtime**: < 5 minutes
- **live**: < 1 hour
- **cache**: Within TTL
- **stale**: Past TTL
- **static**: Monthly updates

---

## 🚨 Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use data |
| 304 | Not Modified | Use cache |
| 400 | Bad Request | Check params |
| 401 | Unauthorized | Check API key |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check endpoint |
| 429 | Rate Limit | Wait or cache |
| 500 | Server Error | Use fallback |
| 503 | Unavailable | Retry later |

---

## 🎨 CSS Variables

```css
/* In knowledgeBase.css */
--kb-primary: #00ffcc;
--kb-secondary: #ffcc00;
--kb-accent: #ff00ff;
--kb-bg-dark: rgba(10, 10, 20, 0.95);
--kb-text: #e0e0e0;
--kb-border: rgba(255, 255, 255, 0.1);
```

---

## 🔄 Fallback Chain

```
1. Try: Live API
   ↓ (fails)
2. Try: Cache (< 5 min)
   ↓ (miss/expired)
3. Try: Stale Cache (< 30 days)
   ↓ (miss)
4. Use: Fallback Data
   ↓
Always succeeds ✓
```

---

## 📚 Main Classes

### Imports
```javascript
// Services
import { DataOrchestrator } from './services/dataOrchestrator.js';
import { APIClient } from './services/apiService.js';
import { CacheService } from './services/cacheService.js';
import knowledgeBaseService from './services/knowledgeBaseService.js';

// Data Sources
import { TeleGeographyAPI } from './services/dataSources/TeleGeographyAPI.js';
import { PeeringDBAPI } from './services/dataSources/PeeringDBAPI.js';
import { CloudflareRadarAPI } from './services/dataSources/CloudflareRadarAPI.js';
import { FallbackDataSource } from './services/dataSources/FallbackDataSource.js';

// Components
import DataFreshnessDashboard from './components/DataFreshnessDashboard.js';
import EducationalOverlay from './components/EducationalOverlay.js';
import LearningTour from './components/LearningTour.js';
import KnowledgeSearch from './components/KnowledgeSearch.js';

// Integration
import KnowledgeBaseIntegration from './integrations/knowledgeBaseIntegration.js';
```

---

## 🔗 Useful URLs

**APIs:**
- PeeringDB: https://www.peeringdb.com/api
- Cloudflare: https://api.cloudflare.com/client/v4/radar
- TeleGeography: https://www.submarinecablemap.com/api/v3

**Docs:**
- PeeringDB API: https://docs.peeringdb.com/api/
- Cloudflare Radar: https://developers.cloudflare.com/radar/
- TeleGeography: https://github.com/telegeography/www.submarinecablemap.com

**Tools:**
- Three.js Docs: https://threejs.org/docs/
- Globe.GL: https://github.com/vasturiano/globe.gl
- Vite: https://vitejs.dev/

---

**Happy Coding!** 🚀

Print this sheet and keep it handy while developing.
