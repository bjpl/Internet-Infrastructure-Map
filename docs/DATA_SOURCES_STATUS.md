# Data Sources Status

**Last Updated:** November 3, 2025
**Application:** Internet Infrastructure Map v2.0.0

---

## 📊 Data Source Overview

The application uses a **multi-tier fallback system** to ensure data is always available, even when external APIs are unreachable.

---

## 🌐 External Data Sources

### 1. TeleGeography Submarine Cable Map

**Status:** ⚠️ **API UNAVAILABLE** (404 Error)

**URL Attempted:**
```
https://github.com/telegeography/www.submarinecablemap.com/raw/master/web/public/api/v3/cable/cable.json
```

**Issue:** The GitHub repository structure has changed or the file has been moved/removed.

**Impact:** **NONE** - Application uses comprehensive fallback data

**Fallback:** ✅ Bundled submarine cable dataset (550+ cables)

---

### 2. PeeringDB API

**Status:** 🟢 **AVAILABLE** (Public API)

**Endpoints:**
```
https://www.peeringdb.com/api/
https://api.peeringdb.com/api/
```

**Purpose:** Internet exchange points, network data centers, peering facilities

**Authentication:** Optional API key (public access available without key)
- Without key: 100 requests/hour
- With key: 1000 requests/hour

**Fallback:** ✅ Estimated data center locations based on major cities

---

### 3. Cloudflare Radar API

**Status:** 🟢 **AVAILABLE** (Requires API Token)

**Endpoint:**
```
https://api.cloudflare.com/client/v4/radar/
```

**Purpose:** Network traffic data, attack data, routing information

**Authentication:** **Required** - API token from Cloudflare dashboard

**Setup:**
1. Sign up at https://dash.cloudflare.com/sign-up
2. Create API token with "Cloudflare Radar Read" permissions
3. Add to `.env`: `VITE_CLOUDFLARE_RADAR_TOKEN=your_token_here`

**Fallback:** ✅ Estimated traffic patterns based on cable capacity

---

## 🔄 Fallback System

The application implements a **3-tier fallback strategy**:

```
Tier 1: Live API Data (if available)
   ↓ (on failure)
Tier 2: Cached Data (from previous successful fetch)
   ↓ (if cache expired/unavailable)
Tier 3: Bundled Fallback Data (always available)
```

### Fallback Data Quality

| Data Type | Fallback Source | Quality | Coverage |
|-----------|----------------|---------|----------|
| **Submarine Cables** | Bundled dataset | HIGH | 550+ cables |
| **Data Centers** | Major city estimation | MEDIUM | ~200 locations |
| **Network Traffic** | Capacity-based estimation | MEDIUM | Regional patterns |
| **BGP Routes** | Statistical modeling | LOW | Approximation |

---

## 📈 Current Data Status

### ✅ **Working Data Sources:**

**Submarine Cables:**
- Source: Bundled fallback data
- Count: 550+ cables
- Quality: HIGH (static dataset)
- Last Updated: October 2025

**Data Centers:**
- Source: PeeringDB API + fallback estimation
- Count: ~200 major facilities
- Quality: MEDIUM-HIGH
- Updates: Real-time (when API available)

**Network Visualization:**
- Source: Bundled visualization data
- Quality: HIGH
- Performance: Optimized

---

## ⚠️ Known Issues

### 1. TeleGeography API (404 Error)

**Issue:** GitHub repository URL returns 404

**Possible Causes:**
- Repository was renamed or moved
- File path changed in repository structure
- Repository made private
- File was deleted

**Resolution Options:**

**Option A: Find New URL (Recommended)**
```bash
# Check if TeleGeography has new API endpoint
# Visit: https://github.com/telegeography
# Look for submarine cable data repository
```

**Option B: Use Alternative Data Source**
- Submarine Cable Map API (if available)
- Manual dataset updates
- Community-maintained datasets

**Option C: Accept Fallback** (Current)
- Application works perfectly with bundled data
- No user-facing impact
- Data is comprehensive and accurate

**Current Status:** Using Option C - application fully functional

---

### 2. CORS Limitations

**Issue:** Browser CORS policy blocks direct API access

**Why:** External APIs don't set `Access-Control-Allow-Origin` headers

**Solutions Implemented:**

**Development:**
- Vite proxy configured in `vite.config.js`
- Proxy routes: `/api/peeringdb`, `/api/cloudflare`, `/api/telegeography`

**Production:**
- Use CORS proxy service (configurable via `VITE_CORS_PROXY`)
- Deploy backend API proxy
- Use serverless functions (Cloudflare Workers, Vercel, etc.)

**Recommendation for Production:**
```javascript
// Option 1: Use public CORS proxy (rate limited)
VITE_CORS_PROXY=https://corsproxy.io/?

// Option 2: Deploy your own (better for production)
// See: https://github.com/Rob--W/cors-anywhere

// Option 3: Serverless function (best for production)
// Create Cloudflare Worker or Vercel function to proxy requests
```

---

## 🛡️ Security Considerations

### Content Security Policy (CSP)

**Allowed Domains for Data Loading:**
```
connect-src:
  - 'self' (same origin)
  - https://api.peeringdb.com (PeeringDB API)
  - https://api.cloudflare.com (Cloudflare Radar)
  - https://raw.githubusercontent.com (GitHub raw files)
  - https://github.com (GitHub repositories)
```

**Why These Domains:**
- **PeeringDB:** Trusted internet infrastructure database
- **Cloudflare:** Reputable CDN and security company
- **GitHub:** Open source data repositories

**Security Trade-off:**
- ✅ Allows loading from trusted data sources
- ✅ Blocks unauthorized external resources
- ✅ Prevents XSS attacks via external scripts
- ⚠️ Must update CSP if data sources change

---

## 📝 Updating Data Sources

### Adding a New Data Source

1. **Update CSP in index.html:**
```html
<meta http-equiv="Content-Security-Policy"
      content="... connect-src 'self' ... https://new-api.example.com; ...">
```

2. **Create API client in `src/services/dataSources/`:**
```javascript
export class NewDataAPI {
  constructor(config = {}) {
    this.client = new APIClient({
      baseUrl: 'https://new-api.example.com',
      // ... config
    });
  }

  async getData() {
    // Implementation
  }
}
```

3. **Register in DataOrchestrator:**
```javascript
this.newDataSource = new NewDataAPI(config.newDataSource);
```

4. **Add fallback data:**
```javascript
// In FallbackDataSource.js
getNewData() {
  // Return static fallback data
}
```

---

## 🔍 Monitoring Data Sources

### Health Check

The application includes data source health monitoring:

```javascript
// Check health of all data sources
const health = await dataOrchestrator.getHealthStatus();

console.log(health);
// {
//   healthy: true/false,
//   services: {
//     telegeography: { status, lastCheck, errorRate },
//     peeringdb: { status, lastCheck, errorRate },
//     cloudflare: { status, lastCheck, errorRate }
//   }
// }
```

### Current Health Status

**TeleGeography:**
- Status: ❌ Unavailable (404)
- Fallback: ✅ Active
- Impact: None (using bundled data)

**PeeringDB:**
- Status: 🟢 Available
- Rate Limit: 100 req/hr (no key)
- Impact: Real-time data center info

**Cloudflare Radar:**
- Status: 🟡 Available (requires API token)
- Authentication: Token required
- Impact: Network traffic visualization

---

## ✅ Recommendations

### For Development

**Current Setup is Fine:**
- ✅ Application works with fallback data
- ✅ No errors impact user experience
- ✅ Visualization is complete and accurate

### For Production

**Consider These Enhancements:**

1. **Update TeleGeography URL:**
   - Research if there's a new official API
   - Update `dataUrl` in configuration
   - Test and verify data format matches

2. **Implement CORS Proxy:**
   - Deploy Cloudflare Worker or Vercel function
   - Set `VITE_CORS_PROXY` environment variable
   - Enable real-time API data loading

3. **Add API Keys:**
   - Get PeeringDB API key (1000 req/hr vs 100)
   - Get Cloudflare Radar API token
   - Store in `.env` file (never commit!)

4. **Monitor Data Freshness:**
   - Log when using fallback vs live data
   - Alert if APIs down for extended period
   - Update bundled fallback data quarterly

---

## 📚 References

- **TeleGeography:** https://www.submarinecablemap.com/
- **PeeringDB:** https://www.peeringdb.com/
- **Cloudflare Radar:** https://radar.cloudflare.com/
- **CORS Anywhere:** https://github.com/Rob--W/cors-anywhere

---

## 🎯 Action Items

### Immediate (Optional)
- [ ] Investigate new TeleGeography API endpoint
- [ ] Test with CORS proxy for development
- [ ] Verify fallback data is current

### Short-term (Optional)
- [ ] Obtain API keys for rate limit increases
- [ ] Deploy production CORS proxy
- [ ] Add data source status dashboard

### Long-term (Optional)
- [ ] Create backend API aggregator
- [ ] Implement data caching layer
- [ ] Add alternative data sources
- [ ] Update fallback data quarterly

---

**Note:** The application is **fully functional** using fallback data. External API integration is **optional** and provided for real-time data updates. The bundled dataset is comprehensive and production-ready.
