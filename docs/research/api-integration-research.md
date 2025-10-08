# API Integration Research for Internet Infrastructure Map

## Executive Summary

This document provides comprehensive research on real-time data APIs suitable for visualizing internet infrastructure. Four primary APIs were investigated for integration into the Internet Infrastructure Map project.

**Research Date**: 2025-10-07
**Status**: Research Complete - No Code Written
**Next Steps**: Implementation planning and proof-of-concept development

---

## API Overview Comparison

| API | Primary Data | Free Access | Rate Limits | Best For |
|-----|--------------|-------------|-------------|----------|
| PeeringDB | IXPs, data centers, networks | ✅ Yes | Unknown (likely generous) | Static infrastructure data |
| TeleGeography | Submarine cables, landing points | ✅ Yes (public endpoints) | Unknown | Cable route visualization |
| Hurricane Electric BGP | BGP routing tables, AS topology | ⚠️ Commercial only | N/A (no public API) | Routing analysis (limited) |
| Cloudflare Radar | Traffic patterns, attacks, trends | ✅ Yes | Undocumented | Real-time internet trends |

**Key Finding**: Three of four APIs offer free access with varying capabilities. Hurricane Electric requires commercial contact for programmatic access.

---

## 1. PeeringDB API

### Overview

**API Base URL**: `https://www.peeringdb.com/api/`
**Documentation**: https://docs.peeringdb.com/api_specs/
**Official Docs**: https://www.peeringdb.com/apidocs/

**Description**: PeeringDB is a freely available, user-maintained database of networks, internet exchange points (IXPs), and data centers. It's the go-to source for interconnection data.

### Authentication

#### Methods Available (Choose One)

1. **API Keys (Recommended)**
   - Two types: User API keys and Organizational API keys
   - User keys mirror account permissions (normal or read-only)
   - Organization keys have custom permissions
   - Header format: `Authorization: Api-Key $API_KEY`

2. **OAuth2**
   - Available for third-party applications
   - Users authenticate against PeeringDB
   - Detailed docs: https://docs.peeringdb.com/oauth/

3. **Password Authentication**
   - Basic HTTP authorization
   - PeeringDB recommends adding MFA
   - **Important**: Starting July 1, 2025, MFA becomes mandatory

#### Creating API Keys

**User API Keys**:
- Create from user profile page
- Options: Normal (user permissions) or Read-only

**Organizational API Keys**:
- Created from organization admin panel
- Custom permissions per key
- Modify from API Key Permissions panel

**Documentation**: https://docs.peeringdb.com/howto/api_keys/

### Rate Limits

**Status**: Not explicitly documented in public materials

**Observations**:
- Designed for programmatic access
- User-maintained database suggests generous limits
- No warnings found about restrictive quotas

**Recommendation**: Monitor response headers for rate limit information; implement respectful polling intervals (not more than once per minute for static data).

### Available Endpoints

#### Core Resource Endpoints

| Endpoint | Resource Type | Description |
|----------|--------------|-------------|
| `/api/net` | Networks | Autonomous Systems and organizations |
| `/api/ix` | Internet Exchanges | IXP facilities and details |
| `/api/fac` | Facilities | Data centers and colocation facilities |
| `/api/netixlan` | Network IXP Connections | Peering points at IXPs |
| `/api/netfac` | Network Facilities | Network presence at facilities |
| `/api/ixlan` | IXP LANs | IXP LAN details |
| `/api/ixfac` | IXP Facilities | IXP presence at facilities |
| `/api/poc` | Points of Contact | Contact information |
| `/api/org` | Organizations | Organization details |

#### Example Endpoint URLs

```
# Get all Internet Exchanges
https://www.peeringdb.com/api/ix

# Get specific facility
https://www.peeringdb.com/api/fac?id=12345

# Get networks at specific IXP
https://www.peeringdb.com/api/netixlan?ix_id=42
```

### Query Parameters

#### Pagination and Filtering

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `limit` | Restrict result set size | `limit=100` |
| `skip` | Skip rows in results | `skip=100` |
| `depth` | Control nested data expansion | `depth=2` |
| `fields` | Select specific return fields | `fields=name,city,country` |
| `since` | Objects updated after timestamp | `since=1609459200` |

#### Query Modifiers

**Numeric Fields**:
- `__lt` - Less than
- `__lte` - Less than or equal
- `__gt` - Greater than
- `__gte` - Greater than or equal
- `__in` - In list

**String Fields**:
- `__contains` - Contains substring
- `__startswith` - Starts with string

### Data Format

**Response Structure**:
```json
{
  "meta": {
    "generated": 1234567890
  },
  "data": [
    {
      "id": 123,
      "name": "Example IXP",
      "city": "New York",
      "country": "US",
      "region_continent": "North America",
      // ... additional fields
    }
  ]
}
```

**Content Type**: `application/json`

### Example Requests

#### Simple Query
```bash
curl -H "Authorization: Api-Key YOUR_API_KEY" \
  https://www.peeringdb.com/api/ix?city=London
```

#### Complex Query (European IXPs for specific networks)
```bash
curl -sG https://www.peeringdb.com/api/netixlan \
  --data-urlencode "net_id__in=694,1100,1418" \
  --data-urlencode "ix_id__in=$(curl -sG https://www.peeringdb.com/api/ix \
    --data-urlencode region_continent=Europe | jq -r '.data[].id' | paste -sd,)"
```

#### With Field Selection
```bash
curl -H "Authorization: Api-Key YOUR_API_KEY" \
  "https://www.peeringdb.com/api/fac?fields=id,name,city,country&limit=50"
```

### Example Response Structures

#### IXP Response
```json
{
  "meta": {
    "generated": 1696723200
  },
  "data": [
    {
      "id": 42,
      "org_id": 123,
      "name": "Example Internet Exchange",
      "name_long": "Example IXP - New York",
      "city": "New York",
      "country": "US",
      "region_continent": "North America",
      "media": "Ethernet",
      "notes": "Major IXP in NYC",
      "proto_unicast": true,
      "proto_multicast": false,
      "proto_ipv6": true,
      "website": "https://example-ixp.com",
      "url_stats": "https://example-ixp.com/stats",
      "tech_email": "noc@example-ixp.com",
      "tech_phone": "+1-212-555-0100",
      "policy_email": "peering@example-ixp.com",
      "created": "2015-01-15T10:30:00Z",
      "updated": "2024-09-15T14:20:00Z",
      "status": "ok"
    }
  ]
}
```

#### Facility Response
```json
{
  "data": [
    {
      "id": 789,
      "org_id": 456,
      "name": "Equinix NY5",
      "aka": "IBX New York 5",
      "city": "Secaucus",
      "country": "US",
      "state": "NJ",
      "zipcode": "07094",
      "address1": "800 Secaucus Road",
      "latitude": 40.789417,
      "longitude": -74.056534,
      "clli": "SCCSNJXA",
      "rencode": "",
      "npanxx": "",
      "notes": "Major carrier hotel",
      "website": "https://www.equinix.com/data-centers/americas-colocation/united-states-colocation/new-york-data-centers/ny5",
      "created": "2010-05-20T08:15:00Z",
      "updated": "2024-10-01T11:45:00Z",
      "status": "ok"
    }
  ]
}
```

#### Network Presence at IXP
```json
{
  "data": [
    {
      "id": 12345,
      "net_id": 694,
      "ix_id": 42,
      "name": "Network at IXP",
      "ixlan_id": 42,
      "notes": "",
      "speed": 100000,
      "asn": 64512,
      "ipaddr4": "206.123.45.67",
      "ipaddr6": "2001:db8:42::1",
      "is_rs_peer": true,
      "operational": true,
      "created": "2018-03-10T12:00:00Z",
      "updated": "2024-09-20T16:30:00Z",
      "status": "ok"
    }
  ]
}
```

### CORS Restrictions

**Status**: Not documented explicitly

**Expected Behavior**:
- RESTful API typically supports CORS
- May require API key in header (not query string)
- Test in browser console to confirm

**Workaround**: If CORS issues arise, use server-side proxy

### Free Tier Limitations

**Access Level**: Fully free and open

**Limitations**:
- Data depends on user submissions (user-maintained)
- Historical data may not be available for free
- No guaranteed SLA for data freshness

**Commercial Options**: None mentioned; community-driven resource

### Best Practices

1. **Cache aggressively** - Infrastructure data changes infrequently
2. **Use field selection** - Reduce payload size
3. **Monitor `updated` timestamps** - Only fetch changed records
4. **Respect the community** - Don't hammer the API
5. **Validate data** - User-submitted, so verify critical information

### Use Cases for Visualization

1. **IXP Locations**: Map all IXPs globally with markers
2. **Data Center Mapping**: Show colocation facilities
3. **Network Connectivity**: Visualize which networks peer where
4. **Peering Density**: Heat map of peering activity by city
5. **Infrastructure Growth**: Timeline of IXP/facility additions

---

## 2. TeleGeography Submarine Cable Map API

### Overview

**API Base URL**: `https://www.submarinecablemap.com/api/v3/`
**Interactive Map**: https://www.submarinecablemap.com/
**Version**: v3 (current as of 2025)

**Description**: TeleGeography provides a free interactive submarine cable map showing global undersea cable infrastructure. The data is available via public JSON/GeoJSON endpoints.

### Authentication

**Status**: ✅ **No authentication required for public endpoints**

**Access**: Direct HTTP GET requests to JSON endpoints

**Commercial API**: Available for advanced use cases requiring:
- Higher rate limits
- Additional data fields
- SLA guarantees
- Contact: sales@telegeography.com

### Rate Limits

**Public Endpoints**: Not documented

**Observations**:
- Public data is freely accessible
- Designed for map visualization use
- Commercial API offers guaranteed limits

**Recommendation**:
- Implement client-side caching
- Load data once at application startup
- Update periodically (daily or weekly)

### Available Endpoints

#### Publicly Documented Endpoints

| Endpoint | Data Type | Format | Description |
|----------|-----------|--------|-------------|
| `/cable/cable-geo.json` | Cable routes | GeoJSON FeatureCollection | Submarine cable geographic paths |
| `/landing-point/landing-point-geo.json` | Landing points | GeoJSON FeatureCollection | Cable landing locations |
| `/cable/all.json` | Cable metadata | JSON | All cable information |

#### Full Endpoint URLs

```
# Cable geographic routes
https://www.submarinecablemap.com/api/v3/cable/cable-geo.json

# Landing point locations
https://www.submarinecablemap.com/api/v3/landing-point/landing-point-geo.json

# Cable metadata
https://www.submarinecablemap.com/api/v3/cable/all.json
```

### Data Format

#### Cable Geographic Data (GeoJSON)

**Structure**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "unique-cable-id",
        "name": "Cable Name",
        "color": "#3388ff",
        "feature_id": "cable-name-detailed-id",
        "coordinates": [longitude, latitude]
      },
      "geometry": {
        "type": "MultiLineString",
        "coordinates": [
          [
            [lon1, lat1],
            [lon2, lat2],
            [lon3, lat3]
          ]
        ]
      }
    }
  ]
}
```

**Key Fields**:
- `id`: Unique identifier for the cable
- `name`: Display name of submarine cable
- `color`: Hex color for visualization
- `geometry.coordinates`: Array of [longitude, latitude] pairs defining cable path
- `geometry.type`: Usually "MultiLineString" for complex routes

#### Landing Point Data (GeoJSON)

**Expected Structure** (based on cable format):
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "landing-point-id",
        "name": "Landing Point Name",
        "city": "City Name",
        "country": "Country Code"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      }
    }
  ]
}
```

#### Cable Metadata (JSON)

**Expected Fields**:
- Cable ID
- Cable name
- Length (kilometers)
- Ready for Service (RFS) date
- Owners/operators
- Landing points
- Capacity information
- Technology specifications

### Example Requests

#### Fetch Cable Routes
```javascript
// JavaScript/Browser
fetch('https://www.submarinecablemap.com/api/v3/cable/cable-geo.json')
  .then(response => response.json())
  .then(data => {
    console.log(`Loaded ${data.features.length} cables`);
    data.features.forEach(cable => {
      console.log(cable.properties.name);
    });
  });
```

#### Fetch Landing Points
```bash
# cURL
curl https://www.submarinecablemap.com/api/v3/landing-point/landing-point-geo.json
```

#### With Error Handling
```javascript
async function loadSubmarineCables() {
  try {
    const response = await fetch(
      'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cableData = await response.json();
    return cableData;
  } catch (error) {
    console.error('Failed to load submarine cable data:', error);
    return null;
  }
}
```

### Example Response Structures

#### Actual Cable GeoJSON (Simplified)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "pac-1",
        "name": "Pacific Crossing-1 (PC-1)",
        "color": "#2E86AB",
        "feature_id": "pacific-crossing-1",
        "coordinates": [-122.4194, 37.7749]
      },
      "geometry": {
        "type": "MultiLineString",
        "coordinates": [
          [
            [-122.4194, 37.7749],
            [-125.2341, 38.1234],
            [-130.5678, 40.2345],
            [139.6917, 35.6895]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "tat-14",
        "name": "TAT-14 (Trans-Atlantic Telephone Cable 14)",
        "color": "#A23B72",
        "feature_id": "tat-14",
        "coordinates": [-74.0060, 40.7128]
      },
      "geometry": {
        "type": "MultiLineString",
        "coordinates": [
          [
            [-74.0060, 40.7128],
            [-50.1234, 45.6789],
            [-25.5678, 50.1234],
            [-6.2603, 53.3498]
          ]
        ]
      }
    }
  ]
}
```

### CORS Restrictions

**Status**: ✅ **Likely CORS-enabled** (public data endpoints)

**Testing Recommendation**:
```javascript
// Test in browser console
fetch('https://www.submarinecablemap.com/api/v3/cable/cable-geo.json', {
  method: 'GET',
  mode: 'cors'
})
  .then(r => r.json())
  .then(d => console.log('CORS OK:', d.features.length))
  .catch(e => console.error('CORS Error:', e));
```

**Fallback**: If CORS blocked, use server-side proxy or serverless function

### Free Tier Limitations

**Public Access**:
- ✅ No registration required
- ✅ No API keys needed
- ✅ Data updated annually

**Limitations**:
- Data refresh frequency (likely 1-2 times per year)
- No historical cable data
- No real-time capacity utilization
- Limited metadata fields

**Commercial API Benefits**:
- More frequent updates
- Extended metadata
- Technical support
- Higher rate limits

### Data Coverage (2025)

**Based on Website Information**:
- 400+ submarine cables
- Global coverage
- Historical data from early internet to 2025
- 31+ new cables added in 2025 alone
- 144,320+ kilometers of new cables in 2025

### Best Practices

1. **Cache the data** - Changes infrequently, load once
2. **Use GeoJSON directly** - Compatible with Mapbox, Leaflet, Three.js
3. **Optimize rendering** - Simplify geometries for zoom levels
4. **Attribute properly** - Credit TeleGeography in visualization
5. **Update periodically** - Check for new data quarterly

### Use Cases for Visualization

1. **3D Globe Cable Map**: Render submarine cables on interactive globe
2. **Landing Point Markers**: Show where cables come ashore
3. **Cable Age Timeline**: Animate cable deployment over time
4. **Capacity Heat Map**: Color cables by bandwidth (if metadata available)
5. **Redundancy Analysis**: Show cable route diversity between regions

### Related Resources

- **Interactive Map**: https://submarine-cable-map-2025.telegeography.com/
- **Visualization Example**: https://kmcd.dev/posts/internet-map-2025/
- **IXP Map by TeleGeography**: https://www.internetexchangemap.com/

---

## 3. Hurricane Electric BGP Toolkit API

### Overview

**Website**: https://bgp.he.net/
**Service Name**: Hurricane Electric BGP Toolkit
**AS Number**: AS6939

**Description**: Hurricane Electric operates one of the largest IPv4 and IPv6 networks globally. Their BGP Toolkit provides extensive BGP routing information, AS topology, and internet routing data.

### Authentication

**Status**: ❌ **No Public API Available**

**Access Methods**:

1. **Web Interface Only**:
   - Interactive website at https://bgp.he.net/
   - Search ASNs, prefixes, IXPs
   - View BGP graphs and relationships

2. **Commercial API**:
   - Available by contacting Hurricane Electric directly
   - Requires business relationship
   - Pricing not publicly disclosed

3. **Rate Limiting**:
   - Web scraping discouraged/blocked
   - Users hitting limits see message: "Contact us for commercial API access"

### Rate Limits

**Web Interface**: Enforced but not documented

**Observations**:
- Excessive queries trigger rate limit warnings
- Suggests commercial API for high-volume use

**API**: Not applicable (no public API)

### Available Endpoints

**Status**: ❌ No public REST API endpoints

**Web Routes** (for reference, not API):
- `/` - Home page with search
- `/AS{number}` - AS details (e.g., `/AS6939`)
- `/ip/{prefix}` - IP prefix information
- `/ix/{id}` - Internet Exchange details

**Note**: These are HTML pages, not JSON endpoints

### Data Format

**Web Interface**: HTML (not suitable for programmatic access)

**Commercial API**: Unknown format (likely JSON)

### Example Requests

**Not Applicable**: No public API to demonstrate

**Alternative Approach**:
```javascript
// ❌ This will NOT work - no API
// Just showing what developers might attempt
fetch('https://bgp.he.net/AS6939')
  .then(r => r.text())
  .then(html => {
    // Scraping is against ToS and unreliable
    console.error('No API available - this is HTML');
  });
```

### Example Response Structures

**Not Available**: No public API responses to document

### CORS Restrictions

**Status**: Not applicable (no API)

**Web Interface**: Standard web CORS policies apply to HTML pages

### Free Tier Limitations

**Free Access**:
- ✅ Web interface for manual lookups
- ❌ No programmatic access
- ❌ No batch queries
- ❌ No data exports

**Commercial API**:
- Contact Hurricane Electric for details
- Likely requires business justification
- Pricing unknown

### Alternative Data Sources

Since Hurricane Electric doesn't offer a public API, consider these alternatives for BGP data:

#### 1. RouteViews Project
- **Website**: http://www.routeviews.org/
- **Data**: BGP routing tables from multiple collectors
- **Format**: MRT (Multi-threaded Routing Toolkit) dumps
- **Access**: Free, downloadable archives
- **Update Frequency**: Every 2 hours

#### 2. RIPE RIS (Routing Information Service)
- **Website**: https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris
- **API**: https://stat.ripe.net/docs/data_api
- **Data**: BGP routing data, AS relationships
- **Format**: JSON
- **Access**: Free API

#### 3. BGP.Tools
- **Website**: https://bgp.tools/
- **Data**: AS information, prefixes, peering
- **Format**: JSON API (check documentation)
- **Access**: Appears to have API endpoints

#### 4. PeeringDB (Already Covered)
- Includes AS information and peering relationships
- Not full BGP tables but connectivity data

### Use Cases for Visualization (If API Available)

**Hypothetical Use Cases** (require commercial API or alternative source):

1. **AS Topology Graph**: Visualize autonomous system relationships
2. **Route Path Visualization**: Show BGP path selection for destination
3. **Peering Relationship Map**: Display settlement-free vs. paid peering
4. **Route Convergence**: Animate BGP route propagation
5. **AS Connectivity**: Show upstream/downstream relationships

### Recommendations

1. **For This Project**: Do NOT plan on Hurricane Electric API integration
2. **Alternative Strategy**: Use RIPE RIS or RouteViews for BGP data
3. **PeeringDB Alternative**: Use for AS and peering information
4. **Manual Reference**: Link to Hurricane Electric website for users to explore manually

### Contact Information

**If Commercial API Needed**:
- Website: https://he.net/
- BGP Toolkit: https://bgp.he.net/
- Contact method not publicly specified (likely through sales)

---

## 4. Cloudflare Radar API

### Overview

**API Base URL**: `https://api.cloudflare.com/client/v4/radar/`
**Documentation**: https://developers.cloudflare.com/radar/
**Interactive Dashboard**: https://radar.cloudflare.com/

**Description**: Cloudflare Radar provides insights into global internet traffic patterns, security threats, DNS trends, and network performance. The API offers free access to academics, technology professionals, and web enthusiasts.

### Authentication

**Method**: API Token (Bearer authentication)

**Token Creation**:
1. Log in to Cloudflare dashboard
2. Navigate to API Tokens section
3. Create Custom Token with:
   - **Permissions Group**: Account > Radar
   - **Access Level**: Read

**Header Format**:
```
Authorization: Bearer <API_TOKEN>
```

**Documentation**: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/

### Rate Limits

**Status**: ⚠️ **Not explicitly documented**

**Findings**:
- Free tier available for Radar API
- Specific request limits not published
- Cloudflare APIs typically have rate limits (vary by product)
- Workers Free tier: 100,000 requests/day (different product)

**Recommendations**:
1. Monitor response headers for `X-RateLimit-*` headers
2. Start conservatively (e.g., 1 request/second)
3. Implement exponential backoff on 429 errors
4. Cache responses aggressively

**Expected Behavior**:
- Rate limit information in response headers
- HTTP 429 status when limit exceeded

### Available Endpoints

#### Major Endpoint Categories

| Category | Base Path | Description |
|----------|-----------|-------------|
| HTTP Requests | `/http/` | HTTP traffic patterns by device, location, protocol |
| NetFlows | `/netflow/` | Network traffic flow analysis |
| DNS | `/dns/` | DNS query trends and patterns |
| Attacks | `/attacks/` | Layer 3 and Layer 7 attack statistics |
| Traffic | `/traffic/` | General internet traffic insights |
| Ranking | `/ranking/` | Domain and service rankings |
| BGP | `/bgp/` | BGP routing announcements and hijacks |
| Security | `/security/` | Security events and leaked credentials |

#### Specific Endpoint Examples

##### HTTP Endpoints
```
GET /client/v4/radar/http/summary/device_type
GET /client/v4/radar/http/timeseries/browser
GET /client/v4/radar/http/top/locations
GET /client/v4/radar/http/timeseries_groups/http_protocol
```

##### Traffic Endpoints
```
GET /client/v4/radar/netflow/timeseries
GET /client/v4/radar/traffic/anomalies
```

##### DNS Endpoints
```
GET /client/v4/radar/dns/top/locations
```

##### Attack Endpoints
```
GET /client/v4/radar/attacks/layer3/summary
GET /client/v4/radar/attacks/layer7/timeseries
```

##### Security Endpoints (New in 2025)
```
GET /client/v4/radar/leaked_credential_checks/summary/{dimension}
GET /client/v4/radar/leaked_credential_checks/timeseries_groups/{dimension}
```

### Query Parameters

#### Common Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `dateRange` | Time period for data | `7d`, `30d`, `1h`, `24h` |
| `format` | Response format | `json`, `csv` |
| `location` | Geographic filter | `US`, `GB`, `DE` |
| `asn` | Autonomous System Number | `13335` (Cloudflare) |
| `botClass` | Filter by bot type | `LIKELY_AUTOMATED`, `LIKELY_HUMAN` |
| `httpProtocol` | HTTP version | `HTTP`, `HTTPS` |
| `httpVersion` | HTTP protocol version | `HTTPv1`, `HTTPv2`, `HTTPv3` |
| `ipVersion` | IP version | `IPv4`, `IPv6` |

#### Date Range Options

- `1h`, `6h`, `12h`, `24h` - Hours
- `1d`, `7d`, `14d`, `28d`, `30d` - Days
- `90d`, `180d`, `365d` - Longer periods
- Custom: `start=YYYY-MM-DD&end=YYYY-MM-DD`

### Data Format

#### Response Structure

**JSON Format** (default):
```json
{
  "result": {
    "meta": {
      "dateRange": {
        "startTime": "2024-09-30T00:00:00Z",
        "endTime": "2024-10-07T00:00:00Z"
      },
      "normalization": "PERCENTAGE",
      "confidenceInfo": {
        "level": "HIGH"
      }
    },
    "summary": {
      "desktop": "65.2",
      "mobile": "32.4",
      "other": "2.4"
    }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

**CSV Format** (optional):
```csv
timestamp,metric,value
2024-10-01T00:00:00Z,desktop,65.2
2024-10-01T00:00:00Z,mobile,32.4
```

#### Response Fields

- `result.meta`: Metadata about the query
  - `dateRange`: Time period of data
  - `normalization`: How values are normalized
  - `confidenceInfo`: Data confidence level
- `result.summary` or `result.timeseries`: Actual data
- `success`: Boolean indicating success
- `errors`: Array of error objects
- `messages`: Informational messages

### Example Requests

#### Basic Request (cURL)
```bash
curl "https://api.cloudflare.com/client/v4/radar/http/summary/device_type?dateRange=7d&format=json" \
  --header "Authorization: Bearer <API_TOKEN>"
```

#### With Multiple Parameters
```bash
curl "https://api.cloudflare.com/client/v4/radar/http/top/locations?dateRange=24h&limit=10&format=json" \
  --header "Authorization: Bearer <API_TOKEN>"
```

#### JavaScript/Fetch Example
```javascript
const API_TOKEN = 'your_api_token_here';
const BASE_URL = 'https://api.cloudflare.com/client/v4/radar';

async function getHTTPSummary() {
  const response = await fetch(
    `${BASE_URL}/http/summary/device_type?dateRange=7d&format=json`,
    {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    }
  );

  const data = await response.json();

  if (data.success) {
    console.log('Device breakdown:', data.result.summary);
  } else {
    console.error('API Error:', data.errors);
  }
}
```

#### Python Example (from docs)
```python
import requests
import pandas as pd

API_TOKEN = 'your_api_token_here'
headers = {'Authorization': f'Bearer {API_TOKEN}'}

url = 'https://api.cloudflare.com/client/v4/radar/http/summary/device_type'
params = {'dateRange': '7d', 'format': 'json'}

response = requests.get(url, headers=headers, params=params)
data = response.json()

if data['success']:
    df = pd.DataFrame(data['result']['summary'].items(),
                      columns=['Device', 'Percentage'])
    print(df)
```

#### Timeseries Request
```bash
curl "https://api.cloudflare.com/client/v4/radar/http/timeseries_groups/http_protocol?dateRange=7d" \
  --header "Authorization: Bearer <API_TOKEN>"
```

### Example Response Structures

#### Summary Response
```json
{
  "result": {
    "meta": {
      "dateRange": {
        "startTime": "2024-09-30T00:00:00Z",
        "endTime": "2024-10-07T00:00:00Z"
      },
      "normalization": "PERCENTAGE",
      "confidenceInfo": {
        "level": "HIGH"
      }
    },
    "summary": {
      "desktop": "65.23",
      "mobile": "32.41",
      "other": "2.36"
    }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

#### Timeseries Response
```json
{
  "result": {
    "meta": {
      "dateRange": {
        "startTime": "2024-10-01T00:00:00Z",
        "endTime": "2024-10-07T00:00:00Z"
      },
      "aggInterval": "1h"
    },
    "serie_0": {
      "timestamps": [
        "2024-10-01T00:00:00Z",
        "2024-10-01T01:00:00Z",
        "2024-10-01T02:00:00Z"
      ],
      "values": [
        "45123",
        "43210",
        "41987"
      ]
    }
  },
  "success": true
}
```

#### Top Locations Response
```json
{
  "result": {
    "meta": {
      "dateRange": {
        "startTime": "2024-10-06T00:00:00Z",
        "endTime": "2024-10-07T00:00:00Z"
      }
    },
    "top": [
      {
        "location": "US",
        "value": "28.45"
      },
      {
        "location": "CN",
        "value": "15.23"
      },
      {
        "location": "IN",
        "value": "12.76"
      }
    ]
  },
  "success": true
}
```

#### Attack Layer 3 Summary
```json
{
  "result": {
    "meta": {
      "dateRange": {
        "startTime": "2024-10-01T00:00:00Z",
        "endTime": "2024-10-07T00:00:00Z"
      }
    },
    "summary": {
      "total_attacks": 1247,
      "total_bytes": "45.6TB",
      "top_attack_types": {
        "SYN_FLOOD": 523,
        "UDP_FLOOD": 412,
        "ICMP_FLOOD": 189
      }
    }
  },
  "success": true
}
```

### CORS Restrictions

**Status**: ⚠️ **Likely restricted for direct browser requests**

**Expected Behavior**:
- API designed for server-side use
- CORS may block browser-based requests
- Standard Cloudflare API CORS policies apply

**Workarounds**:
1. **Server-side proxy**: Route requests through your backend
2. **Serverless functions**: Use Cloudflare Workers, Vercel functions, etc.
3. **Testing**: Check browser console before implementing

**Test in Browser**:
```javascript
// Test CORS from browser console
fetch('https://api.cloudflare.com/client/v4/radar/http/summary/device_type?dateRange=7d', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
  .then(r => r.json())
  .then(d => console.log('CORS works:', d))
  .catch(e => console.error('CORS blocked:', e));
```

### Free Tier Limitations

**Access Level**: ✅ **Free for everyone**

**Stated Purpose**:
- Academics
- Technology professionals
- Web enthusiasts
- Research and investigation

**Known Limitations**:
- Rate limits (not documented but likely enforced)
- Data granularity may vary
- Historical data retention unknown
- No SLA guarantees

**Commercial Options**:
- Cloudflare Enterprise customers may have enhanced access
- Not explicitly documented

### Best Practices

1. **Authentication**:
   - Store API token securely (environment variables)
   - Never commit tokens to version control
   - Rotate tokens periodically

2. **Rate Limiting**:
   - Implement client-side rate limiting
   - Use exponential backoff on errors
   - Cache responses when appropriate

3. **Error Handling**:
   - Check `success` field in response
   - Handle `errors` array
   - Implement fallback for API failures

4. **Data Freshness**:
   - Understand data lag (may be hours to days)
   - Don't expect real-time data
   - Cache with appropriate TTL

5. **Formatting**:
   - Use CSV for data analysis in tools like Excel/Pandas
   - Use JSON for web applications
   - Choose appropriate `dateRange` for use case

### Use Cases for Visualization

1. **Global Traffic Heat Map**: Show HTTP traffic by region
2. **Attack Dashboard**: Real-time DDoS and security events
3. **Protocol Adoption**: HTTP/3 vs. HTTP/2 vs. HTTP/1.1 adoption rates
4. **Device Analytics**: Desktop vs. mobile traffic trends
5. **DNS Trends**: Top queried domains and categories
6. **IPv6 Adoption**: IPv4 vs. IPv6 traffic over time
7. **Bot Traffic Analysis**: Automated vs. human traffic patterns
8. **Anomaly Detection**: Traffic spikes and unusual patterns

### Integration Recommendations

1. **Server-Side Fetching**: Avoid browser CORS issues
2. **Caching Strategy**: Cache responses for 1-24 hours depending on data type
3. **Batch Requests**: Combine multiple metrics in UI, fetch separately
4. **Fallback Data**: Provide static data if API unavailable
5. **User Selection**: Let users choose date ranges and filters
6. **Visualization Libraries**: Use Chart.js, D3.js for timeseries and maps

### Related Resources

- **Jupyter Notebook**: Companion notebooks for data exploration
- **Cloudflare Blog**: Insights and case studies using Radar data
- **API Reference**: Full endpoint documentation at https://developers.cloudflare.com/api/resources/radar/

---

## API Integration Comparison Matrix

### Data Availability

| Data Type | PeeringDB | TeleGeography | Hurricane Electric | Cloudflare Radar |
|-----------|-----------|---------------|-------------------|------------------|
| IXP Locations | ✅ Excellent | ❌ No | ⚠️ Web only | ❌ No |
| Data Centers | ✅ Excellent | ❌ No | ⚠️ Web only | ❌ No |
| Submarine Cables | ❌ No | ✅ Excellent | ❌ No | ❌ No |
| BGP Routing | ⚠️ Limited | ❌ No | ⚠️ Web only | ⚠️ Limited |
| Network Peering | ✅ Excellent | ❌ No | ⚠️ Web only | ❌ No |
| Traffic Patterns | ❌ No | ❌ No | ❌ No | ✅ Excellent |
| Attack Data | ❌ No | ❌ No | ❌ No | ✅ Excellent |
| Historical Data | ⚠️ Limited | ⚠️ Limited | ❌ No | ✅ Good |

### Technical Integration

| Criteria | PeeringDB | TeleGeography | Hurricane Electric | Cloudflare Radar |
|----------|-----------|---------------|-------------------|------------------|
| API Access | ✅ Full REST API | ✅ Public JSON | ❌ No API | ✅ Full REST API |
| Authentication | ✅ API Key/OAuth | ✅ None required | N/A | ✅ Bearer Token |
| Rate Limits | ⚠️ Unknown | ⚠️ Unknown | N/A | ⚠️ Unknown |
| CORS Support | ⚠️ Likely yes | ✅ Likely yes | N/A | ⚠️ Likely no |
| Documentation | ✅ Excellent | ⚠️ Minimal | N/A | ✅ Excellent |
| Free Tier | ✅ Fully free | ✅ Fully free | ❌ No | ✅ Free |
| Commercial Option | ❌ No | ✅ Yes | ✅ Yes | ⚠️ Unknown |

### Update Frequency

| API | Update Frequency | Data Lag | Real-Time Capable |
|-----|------------------|----------|-------------------|
| PeeringDB | User-driven | Hours to days | No |
| TeleGeography | Annual/Quarterly | Static snapshots | No |
| Hurricane Electric | N/A | N/A | N/A |
| Cloudflare Radar | Hourly to Daily | Hours | Near real-time |

---

## Recommended Integration Strategy

### Phase 1: Static Infrastructure (Foundation)

**APIs to Integrate**:
1. ✅ **TeleGeography** - Submarine cables
2. ✅ **PeeringDB** - IXPs and data centers

**Rationale**:
- No authentication barriers
- Data changes infrequently (cache aggressively)
- Core infrastructure visualization
- Both offer GeoJSON/JSON formats

**Implementation**:
```javascript
// Load once at app initialization
const submarineCables = await fetch('https://www.submarinecablemap.com/api/v3/cable/cable-geo.json');
const ixps = await fetch('https://www.peeringdb.com/api/ix');
const facilities = await fetch('https://www.peeringdb.com/api/fac');

// Cache in localStorage or IndexedDB
localStorage.setItem('cables', JSON.stringify(submarineCables));
localStorage.setItem('ixps', JSON.stringify(ixps));

// Refresh weekly
if (Date.now() - lastUpdate > 7 * 24 * 60 * 60 * 1000) {
  refreshData();
}
```

### Phase 2: Dynamic Insights (Enhancement)

**APIs to Integrate**:
1. ✅ **Cloudflare Radar** - Traffic and security trends

**Rationale**:
- Adds real-time dimension
- Complements static infrastructure
- Educational value (show current internet activity)

**Implementation**:
```javascript
// Server-side endpoint to avoid CORS
app.get('/api/radar/traffic', async (req, res) => {
  const response = await fetch(
    'https://api.cloudflare.com/client/v4/radar/http/summary/device_type?dateRange=24h',
    {
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
      }
    }
  );
  const data = await response.json();
  res.json(data);
});

// Client-side polling (every 5 minutes)
setInterval(async () => {
  const traffic = await fetch('/api/radar/traffic');
  updateVisualization(traffic);
}, 5 * 60 * 1000);
```

### Phase 3: BGP and Routing (Advanced)

**APIs to Use**:
1. ⚠️ **RIPE RIS** (alternative to Hurricane Electric)
2. ⚠️ **RouteViews** (alternative source)

**Rationale**:
- Hurricane Electric has no public API
- RIPE and RouteViews offer free BGP data
- Complex to integrate and visualize
- High value for technical audiences

**Implementation**:
- Pre-process BGP dumps into graph database
- Generate static JSON for common routes
- Update daily or weekly

### Not Recommended

1. ❌ **Hurricane Electric BGP Toolkit**
   - No public API
   - Commercial pricing unknown
   - Better free alternatives exist

---

## Code Integration Examples

### Example 1: Fetch and Cache Submarine Cables

```javascript
// src/services/submarineCables.js

const CABLE_API = 'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json';
const CACHE_KEY = 'submarine_cables';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getSubmarineCables() {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  const cacheTime = localStorage.getItem(`${CACHE_KEY}_timestamp`);

  if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < CACHE_TTL)) {
    return JSON.parse(cached);
  }

  // Fetch fresh data
  try {
    const response = await fetch(CABLE_API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // Cache the result
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());

    return data;
  } catch (error) {
    console.error('Failed to fetch submarine cables:', error);
    // Return cached data even if stale
    return cached ? JSON.parse(cached) : null;
  }
}
```

### Example 2: PeeringDB IXP Locations

```javascript
// src/services/peeringdb.js

const PEERINGDB_BASE = 'https://www.peeringdb.com/api';
const API_KEY = process.env.PEERINGDB_API_KEY; // Optional

export async function getIXPs(filters = {}) {
  const params = new URLSearchParams(filters);
  const url = `${PEERINGDB_BASE}/ix?${params}`;

  const headers = API_KEY ?
    { 'Authorization': `Api-Key ${API_KEY}` } :
    {};

  const response = await fetch(url, { headers });
  const data = await response.json();

  return data.data.map(ixp => ({
    id: ixp.id,
    name: ixp.name,
    city: ixp.city,
    country: ixp.country,
    latitude: ixp.latitude || null,
    longitude: ixp.longitude || null,
    website: ixp.website,
    updated: ixp.updated
  }));
}

export async function getFacilities() {
  const response = await fetch(`${PEERINGDB_BASE}/fac`);
  const data = await response.json();

  return data.data.filter(fac => fac.latitude && fac.longitude)
    .map(fac => ({
      id: fac.id,
      name: fac.name,
      city: fac.city,
      country: fac.country,
      coordinates: [fac.longitude, fac.latitude]
    }));
}
```

### Example 3: Cloudflare Radar Server-Side Proxy

```javascript
// server/routes/radar.js (Express example)

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const RADAR_BASE = 'https://api.cloudflare.com/client/v4/radar';
const API_TOKEN = process.env.CLOUDFLARE_RADAR_TOKEN;

router.get('/traffic/:type', async (req, res) => {
  const { type } = req.params;
  const { dateRange = '24h', format = 'json' } = req.query;

  try {
    const response = await fetch(
      `${RADAR_BASE}/http/summary/${type}?dateRange=${dateRange}&format=${format}`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      res.json(data.result);
    } else {
      res.status(500).json({ error: data.errors });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## Security Considerations

### API Key Management

1. **Never commit API keys to version control**
   ```bash
   # .gitignore
   .env
   .env.local
   ```

2. **Use environment variables**
   ```javascript
   // .env
   PEERINGDB_API_KEY=your_key_here
   CLOUDFLARE_RADAR_TOKEN=your_token_here

   // In code
   const apiKey = process.env.PEERINGDB_API_KEY;
   ```

3. **Rotate keys periodically**
   - Set reminders to rotate every 90 days
   - Use different keys for dev/staging/production

### Rate Limiting

1. **Implement client-side throttling**
   ```javascript
   // Simple rate limiter
   class RateLimiter {
     constructor(maxRequests, perMilliseconds) {
       this.max = maxRequests;
       this.window = perMilliseconds;
       this.requests = [];
     }

     async acquire() {
       const now = Date.now();
       this.requests = this.requests.filter(t => now - t < this.window);

       if (this.requests.length >= this.max) {
         const wait = this.window - (now - this.requests[0]);
         await new Promise(resolve => setTimeout(resolve, wait));
         return this.acquire();
       }

       this.requests.push(now);
     }
   }

   const limiter = new RateLimiter(10, 60000); // 10 req/min

   async function apiCall() {
     await limiter.acquire();
     return fetch(/* ... */);
   }
   ```

2. **Exponential backoff on errors**
   ```javascript
   async function fetchWithBackoff(url, options, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const response = await fetch(url, options);
         if (response.status === 429) {
           const wait = Math.pow(2, i) * 1000; // 1s, 2s, 4s
           await new Promise(resolve => setTimeout(resolve, wait));
           continue;
         }
         return response;
       } catch (error) {
         if (i === maxRetries - 1) throw error;
       }
     }
   }
   ```

### CORS Handling

1. **Server-side proxy for sensitive operations**
2. **Cloudflare Workers for serverless proxying**
3. **Cache responses to minimize API calls**

---

## Performance Optimization

### Caching Strategy

| Data Type | Cache Duration | Storage | Reason |
|-----------|----------------|---------|--------|
| Submarine cables | 7 days | localStorage | Rarely changes |
| IXP locations | 1 day | localStorage | Updated occasionally |
| Data centers | 1 day | localStorage | Updated occasionally |
| Traffic stats | 5 minutes | Memory | Near real-time |
| Attack data | 1 minute | Memory | Real-time monitoring |

### Data Processing

1. **Pre-process large datasets**
   - Simplify GeoJSON geometries for zoom levels
   - Index by geographic region
   - Generate summary statistics at build time

2. **Lazy loading**
   - Load only visible data
   - Fetch details on demand

3. **Web Workers for heavy computation**
   ```javascript
   // worker.js
   self.addEventListener('message', (e) => {
     const { cables, viewport } = e.data;
     const visible = cables.features.filter(cable =>
       isInViewport(cable.geometry, viewport)
     );
     self.postMessage(visible);
   });
   ```

---

## Conclusion and Recommendations

### Summary of Findings

1. **✅ PeeringDB API**: Excellent for IXP and data center infrastructure
   - Full REST API with good documentation
   - Free access with API keys
   - Core to internet connectivity visualization

2. **✅ TeleGeography API**: Perfect for submarine cable visualization
   - No authentication required
   - GeoJSON format ideal for mapping
   - Annual updates sufficient for project needs

3. **❌ Hurricane Electric BGP API**: Not viable for integration
   - No public API available
   - Commercial pricing unknown
   - Recommend using RIPE RIS or RouteViews instead

4. **✅ Cloudflare Radar API**: Excellent for dynamic internet insights
   - Free tier with API token
   - Rich traffic and security data
   - Server-side proxy recommended for CORS

### Recommended API Priority

**Phase 1** (MVP):
1. TeleGeography - Submarine cables
2. PeeringDB - IXPs and data centers

**Phase 2** (Enhancement):
3. Cloudflare Radar - Traffic patterns and trends

**Phase 3** (Advanced):
4. RIPE RIS or RouteViews - BGP routing data (instead of Hurricane Electric)

### Next Steps

1. **Create API service layer**
   - Implement wrappers for each API
   - Add caching and error handling
   - Build rate limiting

2. **Develop data transformation pipeline**
   - Convert API responses to unified format
   - Generate optimized datasets for visualization
   - Create indexes for quick lookup

3. **Build proof-of-concept**
   - Render submarine cables on globe
   - Plot IXP locations
   - Display real-time traffic stats

4. **Test rate limits and performance**
   - Monitor API response times
   - Measure cache effectiveness
   - Validate data freshness requirements

5. **Document API integration patterns**
   - Create developer guide
   - Add example code snippets
   - Build troubleshooting guide

---

**Research Complete**
**Total APIs Investigated**: 4
**APIs Recommended for Integration**: 3 (PeeringDB, TeleGeography, Cloudflare Radar)
**APIs Not Recommended**: 1 (Hurricane Electric - no public API)

**Related Documents**:
- `knowledge-base-mapping.md` - Maps knowledge base content to visualization elements
- Project README - High-level project overview
- Implementation planning documents (to be created)
