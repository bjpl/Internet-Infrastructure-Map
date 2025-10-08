# Quick Start: Live API Integration

## 5-Minute Setup

### 1. Get API Keys (2 minutes)

#### Cloudflare Radar (Required for attack data)
```
1. Visit: https://dash.cloudflare.com/sign-up
2. Create free account
3. Go to: https://dash.cloudflare.com/profile/api-tokens
4. Click "Create Token"
5. Select "Cloudflare Radar Read" template
6. Copy token
```

#### PeeringDB (Optional - increases rate limit)
```
1. Visit: https://www.peeringdb.com/register
2. Create account
3. Go to: https://www.peeringdb.com/account/api_keys
4. Create API key
5. Copy key
```

### 2. Configure Environment (1 minute)

```bash
# Copy template
cp .env.example .env

# Edit .env and paste your keys:
VITE_CLOUDFLARE_RADAR_TOKEN=your_cloudflare_token_here
VITE_PEERINGDB_API_KEY=your_peeringdb_key_here  # Optional
```

### 3. Start Development (2 minutes)

```bash
# Install dependencies (if not already done)
npm install

# Start dev server with CORS proxy
npm run dev
```

That's it! Your APIs are now live.

---

## Test in Browser Console

Open DevTools Console (F12) and run:

```javascript
// Test all APIs
const result = await orchestrator.getAllInfrastructure();
console.log('Complete infrastructure data:', result);

// Check health status
const health = orchestrator.getHealth();
console.log('API health:', health);

// Test each API individually
const cables = await orchestrator.getCables();
console.log('Submarine cables:', cables);

const ixps = await orchestrator.getIXPs({ country: 'US' });
console.log('US Internet Exchange Points:', ixps);

const attacks = await orchestrator.getAttackData({ dateRange: '1h' });
console.log('Recent attacks:', attacks);
```

---

## Real-Time Attack Monitoring

```javascript
// Start real-time polling
orchestrator.cloudflareRadar.startPolling({
  onUpdate: (data) => {
    console.log('New attack data:', data.attacks);
    // Update your visualization here
  }
});

// Stop polling
orchestrator.cloudflareRadar.stopPolling();
```

---

## Data Sources Overview

| API | Purpose | Rate Limit | Requires Key? |
|-----|---------|------------|---------------|
| **PeeringDB** | IXPs, Data Centers | 100/hr (1000 with key) | No (recommended) |
| **TeleGeography** | Submarine Cables | ~1000/hr | No |
| **Cloudflare Radar** | Attack Data, Traffic | 300/5min | **Yes** |

---

## Confidence Levels

Your data will have confidence scores:

- **0.98**: Live PeeringDB data - most accurate
- **0.95**: Real-time Cloudflare - very reliable
- **0.85**: TeleGeography cables - industry standard
- **0.70**: Cached data - slightly outdated
- **0.50**: Fallback data - estimated

Lower confidence = use with caution.

---

## Common Issues

### CORS Errors in Production?

**Solution:** Deploy a serverless proxy function (see API_INTEGRATION_GUIDE.md)

Development already works via Vite proxy.

### Rate Limit Exceeded?

**Solution 1:** Get API keys for higher limits
**Solution 2:** Increase cache TTL in `.env`:
```bash
VITE_REFRESH_INTERVAL=600000  # 10 minutes
```

### No Attack Data?

**Check:** Do you have a Cloudflare Radar token?
```javascript
const health = orchestrator.getHealth();
console.log(health.services.cloudflareRadar.authenticated); // Should be true
```

---

## What's Working

- ✅ Live PeeringDB API for IXPs and data centers
- ✅ TeleGeography submarine cable data
- ✅ Cloudflare Radar real-time attack data
- ✅ Intelligent fallback chain (live → cache → stale → fallback)
- ✅ CORS proxy in development (Vite)
- ✅ Rate limit tracking and throttling
- ✅ Circuit breaker for resilience
- ✅ Data confidence scoring
- ✅ Real-time polling capability
- ✅ Comprehensive error handling

---

## Next Steps

1. **Get API keys** (especially Cloudflare Radar)
2. **Test APIs** using browser console commands above
3. **Integrate with visualization** (see LIVE_API_USAGE_EXAMPLES.md)
4. **Monitor performance** using health checks
5. **Deploy to production** with serverless proxy

---

## File Locations

- **Configuration:** `.env` (copy from `.env.example`)
- **API Clients:** `src/services/dataSources/`
- **Orchestrator:** `src/services/dataOrchestrator.js`
- **Vite Proxy:** `vite.config.js`

---

## Documentation

- **Full Integration Guide:** `docs/API_INTEGRATION_GUIDE.md`
- **Usage Examples:** `docs/LIVE_API_USAGE_EXAMPLES.md`
- **Implementation Summary:** `docs/LIVE_API_IMPLEMENTATION_SUMMARY.md`

---

## Support

**PeeringDB Issues:** support@peeringdb.com
**Cloudflare Radar:** https://developers.cloudflare.com/radar/
**TeleGeography:** https://github.com/telegeography/www.submarinecablemap.com/issues

---

**Ready to visualize the internet? Start with `npm run dev`!**
