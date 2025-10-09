# Quick Reference Card

**Live Internet Infrastructure Map v2.0** | One-page reference for common tasks

---

## 🚀 Getting Started (5 min)

```bash
git clone https://github.com/bjpl/Internet-Infrastructure-Map.git
cd Internet-Infrastructure-Map
npm install
npm run dev  # Opens http://localhost:5173
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Pause/Resume globe rotation |
| `+` / `-` | Zoom in/out |
| `R` | Reset camera to default view |
| `/` | Focus search (Knowledge Base) |
| `?` | Show keyboard shortcuts help |
| `ESC` | Close overlays/modals |
| `← →` | Navigate tour steps |
| `F` | Toggle fullscreen mode |

---

## 🔧 npm Commands

```bash
npm run dev        # Start development server (with Vite proxy)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm test           # Run test suite
npm run fetch-data # Fetch latest data from APIs (requires keys)
```

---

## 📊 Data Sources

| API | Purpose | Accuracy | Requires Key? |
|-----|---------|----------|---------------|
| **TeleGeography** | Submarine cables | 85% | No |
| **PeeringDB** | IXPs, Data Centers | 90% | Optional |
| **Cloudflare Radar** | Real-time attacks | 95% | **Yes** |
| **Fallback** | Hardcoded data | 60% | No |

---

## 🎯 Quick Tasks

### Get API Keys (2 min)

**Cloudflare Radar:**
1. Sign up: https://dash.cloudflare.com/sign-up
2. Create token: https://dash.cloudflare.com/profile/api-tokens
3. Select "Cloudflare Radar Read" template

**PeeringDB (Optional):**
1. Register: https://www.peeringdb.com/register
2. Get key: https://www.peeringdb.com/account/api_keys

### Configure Environment (1 min)

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### Test APIs (Browser Console)

```javascript
// Check service health
const health = orchestrator.getHealth();
console.log('Services:', health.services);

// Get data
const cables = await orchestrator.getCables();
console.log('Cables:', cables.data.length);

// Check quality
const stats = orchestrator.getStatistics();
console.log('Data quality:', stats.cacheHitRate);
```

---

## 🎓 Knowledge Base

### Search Articles

```javascript
// Search knowledge base
const results = await window.kbIntegration.search('submarine cables');

// Show article
window.kbIntegration.showArticle('internet-architecture/00-index', 'sidebar');

// Start tour
window.kbIntegration.startTour('submarine-cables');
```

### Display Modes
- **Tooltip** - Quick facts on hover
- **Sidebar** - Full article with tabs
- **Modal** - Centered overlay
- **Fullscreen** - Immersive reading

### Available Tours
1. Submarine Cables (8 min)
2. Data Centers (6 min)
3. Routing & BGP (10 min)
4. Performance (7 min)

---

## 🐛 Common Issues

### CORS Errors
**Dev:** Already handled by Vite proxy
**Production:** Deploy serverless proxy (see API guide)

### Rate Limit Exceeded
```bash
# Increase refresh interval
VITE_REFRESH_INTERVAL=600000  # 10 minutes
```

### No Attack Data
**Check:** Cloudflare token configured?
```javascript
console.log(import.meta.env.VITE_CLOUDFLARE_RADAR_TOKEN);
```

### Cache Corrupted
```javascript
// Clear all caches
await orchestrator.cache.clear();
localStorage.clear();
```

### Circuit Breaker Triggered
```javascript
// Reset circuit
orchestrator.peeringdb.client.resetCircuit();
```

---

## 📂 Project Structure

```
internet/
├── src/
│   ├── main-integrated.js          # Entry point (recommended)
│   ├── services/                   # API & data services
│   │   ├── dataOrchestrator.js    # Central coordinator
│   │   ├── apiService.js           # HTTP client
│   │   ├── cacheService.js         # Multi-layer cache
│   │   ├── knowledgeBaseService.js # KB search
│   │   └── dataSources/            # API implementations
│   ├── components/                 # UI components
│   └── styles/                     # CSS files
├── knowledge-base/                 # Educational content
├── docs/                           # Documentation
│   ├── guides/                     # Consolidated guides
│   ├── architecture/               # System design
│   ├── api/                        # API reference
│   └── reference/                  # Quick refs
├── tests/                          # Test files
└── dist/                           # Build output
```

---

## 🔗 Documentation Links

**Getting Started:**
- [Getting Started Guide](../GETTING_STARTED.md)
- [Quick Start](../guides/API_COMPLETE_GUIDE.md#quick-start-5-minutes)

**Comprehensive Guides:**
- [API Complete Guide](../guides/API_COMPLETE_GUIDE.md)
- [Knowledge Base Guide](../guides/KNOWLEDGE_BASE_GUIDE.md)
- [Data Quality Guide](../guides/DATA_QUALITY_GUIDE.md)

**Advanced:**
- [KB Advanced Guide](../guides/KB_ADVANCED_GUIDE.md)
- [Architecture](../architecture/README.md)
- [Error Handling](../api/ERROR_HANDLING.md)

**Contributing:**
- [Contributing Guide](../../CONTRIBUTING.md)
- [Code of Conduct](../../CODE_OF_CONDUCT.md)
- [Security Policy](../../SECURITY.md)

---

## 💡 Quick Tips

**Improve Performance:**
```bash
# Increase cache TTL
VITE_REFRESH_INTERVAL=600000
VITE_CACHE_TTL=86400000  # 24 hours
```

**Debug Mode:**
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

**Force Refresh:**
```javascript
await orchestrator.refreshData('cables');
await orchestrator.refreshData('ixps');
```

**Check Data Quality:**
```javascript
const quality = orchestrator.getQualityMetrics();
console.log('Average confidence:', quality.averageConfidence);
```

---

## 🎨 Data Quality Indicators

```
🟢 Green (0.9-1.0)   - Live/Verified (highest confidence)
🟡 Yellow (0.7-0.9)  - Cached/Estimated (good confidence)
🟠 Orange (0.5-0.7)  - Stale Cache (moderate confidence)
⚪ Gray (0.0-0.5)    - Historical/Fallback (low confidence)
```

---

## 📊 Monitoring

```javascript
// Service health
const health = orchestrator.getHealth();

// Cache statistics
const cache = health.cache;
console.log(`Cache: ${cache.l1.hitRate} hit rate, ${cache.l1.entries} entries`);

// API statistics
const stats = health.statistics;
console.log(`APIs: ${stats.cacheHitRate} cache, ${stats.fallbackRate} fallback`);
```

---

## 🆘 Need Help?

**Documentation:**
- [Documentation Index](../INDEX.md) - All docs
- [Navigation Guide](../NAVIGATION.md) - Find anything
- [Troubleshooting](../api/ERROR_HANDLING.md) - Common issues

**Support:**
- [GitHub Issues](https://github.com/bjpl/Internet-Infrastructure-Map/issues)
- [Discussions](https://github.com/bjpl/Internet-Infrastructure-Map/discussions)

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 3s | 2.1s ✓ |
| FPS | 60 | 60 ✓ |
| Memory | < 200MB | 175MB ✓ |
| Cache Hit Rate | > 75% | 78% ✓ |
| Data Accuracy | > 80% | 85% ✓ |

---

## 🎯 Feature Matrix

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Submarine Cables | 5 | 100+ |
| Data Centers | 15 | 500+ |
| Live APIs | 0 | 3 |
| Knowledge Base | ✗ | ✓ (200+ articles) |
| Data Quality Dashboard | ✗ | ✓ |
| Learning Tours | ✗ | ✓ (4 tours) |
| Intelligent Fallback | ✗ | ✓ |
| Caching | ✗ | ✓ (78% hit rate) |

---

**Print this page for quick reference while developing!**

**Last Updated:** October 8, 2025 | **Version:** 2.0.0
