# Data Quality & Freshness Guide

A comprehensive, production-ready data freshness monitoring and visualization system for real-time infrastructure data quality tracking.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Overview](#overview)
3. [Getting Started](#getting-started)
4. [Components](#components)
5. [Dashboard Usage](#dashboard-usage)
6. [Quality Indicators](#quality-indicators)
7. [Technical Implementation](#technical-implementation)
8. [Cache Management](#cache-management)
9. [Monitoring & Alerts](#monitoring--alerts)
10. [Integration Examples](#integration-examples)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)
13. [API Reference](#api-reference)
14. [Accessibility](#accessibility)
15. [Performance](#performance)
16. [Security](#security)

---

## Quick Reference

### Installation

```javascript
// Import all components
import DataFreshnessDashboard from './components/DataFreshnessDashboard';
import DataQualityPanel from './components/DataQualityPanel';
import DataFreshnessIndicator from './components/DataFreshnessIndicator';
import NotificationSystem, { useNotifications } from './components/NotificationSystem';
import './styles/dataFreshness.css';
```

### Minimal Setup

```jsx
import React, { useState } from 'react';
import DataFreshnessDashboard from './components/DataFreshnessDashboard';
import NotificationSystem from './components/NotificationSystem';

function App() {
  const [dataStatus, setDataStatus] = useState({ /* ... */ });

  return (
    <>
      <NotificationSystem maxNotifications={5} />
      <DataFreshnessDashboard
        dataStatus={dataStatus}
        onRefresh={async () => {
          const data = await fetch('/api/refresh');
          setDataStatus(await data.json());
        }}
      />
    </>
  );
}
```

### Confidence Levels

| Level | Threshold | Color | Icon | Description |
|-------|-----------|-------|------|-------------|
| **Live** | ≥95% | Green (#00ff88) | 🟢 | Fresh data from active API, glowing effect |
| **Cached** | 75-94% | Yellow (#ffd700) | 🟡 | Recently cached data, solid color |
| **Estimated** | 50-74% | Orange (#ff9500) | 🟠 | Estimated or interpolated data |
| **Fallback** | <50% | Red (#ff3b30) | 🔴 | Fallback or outdated data, warning state |

### Refresh Intervals

```javascript
'1min'   // 60000ms - High frequency, best for critical monitoring
'5min'   // 300000ms - Default, balanced approach
'15min'  // 900000ms - Moderate, reduced API calls
'30min'  // 1800000ms - Conservative usage
'1hr'    // 3600000ms - Minimal API usage
```

### Notification Quick Start

```javascript
const notifications = useNotifications();

// Show notifications
notifications.success('Success message');
notifications.warning('Warning message');
notifications.error('Error message');
notifications.info('Info message');

// With custom options
notifications.success('Message', {
  duration: 5000,      // ms
  persistent: false    // auto-dismiss
});

// Clear all notifications
notifications.clear();
```

---

## Overview

### What is the Data Freshness System?

The Data Freshness System provides comprehensive monitoring and visualization of data quality, source freshness, and API health across all infrastructure visualization components. This system ensures users always know the reliability and recency of displayed data.

### Why It Matters

- **Transparency**: Users see exactly how fresh and reliable the displayed data is
- **Trust**: Clear confidence indicators build user confidence in the system
- **Debugging**: Quickly identify data source issues and quality degradation
- **Optimization**: Monitor cache performance and API health in real-time
- **Decision Making**: Make informed decisions based on data quality metrics

### Key Features

#### ✅ Complete Dashboard UI
- Real-time monitoring of data quality across all infrastructure types
- Color-coded confidence levels (Live/Cached/Estimated/Fallback)
- Auto-refresh system with configurable intervals (1min to 1hr)
- Manual refresh controls with visual feedback
- Cache performance statistics and API health monitoring
- Preference toggle between accuracy and speed

#### 📊 Advanced Analytics
- Quality metrics panel with detailed breakdowns
- Source distribution visualization (pie chart)
- Historical tracking with trend graphs
- Confidence meter (0-100% accuracy score)
- Infrastructure-specific analytics

#### 🎨 Visual Indicators
- Map element overlays showing data freshness
- Smart tooltips with detailed information
- Color-coded feedback matching confidence levels
- Pulsing animations during active refresh
- Glow effects for live data sources

#### 🔔 Notification System
- Toast notifications for all events
- Auto-dismissing with progress bars
- Success/Warning/Error/Info types
- Stack management for multiple notifications
- Accessible with ARIA live regions

---

## Getting Started

### File Structure

```
src/
├── components/
│   ├── DataFreshnessDashboard.js      # Main dashboard component
│   ├── DataQualityPanel.js            # Analytics and charts
│   ├── DataFreshnessIndicator.js      # Map element indicators
│   ├── NotificationSystem.js          # Toast notification system
│   ├── DataFreshnessIntegration.js    # Integration example
│   └── DataFreshnessDemo.js           # Interactive demo
├── styles/
│   └── dataFreshness.css              # Complete styling
└── docs/
    └── guides/
        └── DATA_QUALITY_GUIDE.md      # This file
```

### Step-by-Step Setup

#### Step 1: Add Notification System (Root Component)

```javascript
function App() {
  return (
    <>
      <NotificationSystem maxNotifications={5} />
      {/* Your app components */}
    </>
  );
}
```

#### Step 2: Set Up Data Status State

```javascript
const [dataStatus, setDataStatus] = useState({
  cables: {
    confidence: 85,
    lastUpdate: Date.now() - 300000,
    source: 'TeleGeography API',
    cacheHitRate: 78,
    activeAPIs: 2,
    totalAPIs: 3,
    fallbackCount: 1
  },
  ixps: {
    confidence: 92,
    lastUpdate: Date.now() - 120000,
    source: 'PeeringDB API',
    cacheHitRate: 85,
    activeAPIs: 1,
    totalAPIs: 1,
    fallbackCount: 0
  }
  // ... other infrastructure types
});
```

#### Step 3: Implement Refresh Handler

```javascript
const handleRefresh = async () => {
  try {
    // Fetch fresh data from APIs
    const freshData = await fetchDataFromAPIs();
    setDataStatus(freshData);
    notifications.success('Data refreshed successfully');
  } catch (error) {
    notifications.error('Failed to refresh: ' + error.message);
  }
};
```

#### Step 4: Add Dashboard Component

```javascript
<DataFreshnessDashboard
  dataStatus={dataStatus}
  onRefresh={handleRefresh}
  onSettingsChange={(settings) => console.log(settings)}
/>
```

#### Step 5: Add Indicators to Map Elements

```jsx
<MapElement>
  <DataFreshnessIndicator
    dataSource="live"
    lastUpdate={Date.now() - 60000}
    confidence={95}
    position="top-right"
    elementType="Submarine Cable"
    additionalInfo={{
      source: 'TeleGeography API',
      cacheAge: 'N/A'
    }}
  />
</MapElement>
```

---

## Components

### 1. DataFreshnessDashboard

The main dashboard component that displays real-time data quality metrics and refresh controls.

#### Features
- Real-time freshness indicators for each infrastructure type
- Confidence levels with color-coded feedback
- Manual and automatic refresh controls
- Cache performance statistics
- Customizable refresh intervals
- Accuracy vs. Speed preference toggle

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `dataStatus` | Object | Yes | Data status for each infrastructure type |
| `onRefresh` | Function | Yes | Callback when manual refresh triggered |
| `onSettingsChange` | Function | No | Callback when settings change |

#### Usage Example

```javascript
<DataFreshnessDashboard
  dataStatus={{
    cables: {
      confidence: 85,
      lastUpdate: Date.now() - 300000,
      source: 'TeleGeography API',
      cacheHitRate: 78,
      activeAPIs: 2,
      totalAPIs: 3,
      fallbackCount: 1
    }
  }}
  onRefresh={handleRefresh}
  onSettingsChange={handleSettingsChange}
/>
```

### 2. DataQualityPanel

Detailed analytics panel with visualizations and historical tracking.

#### Features
- Overall accuracy confidence meter (0-100%)
- Source distribution pie chart
- Historical quality trend graph
- Quality breakdown by infrastructure type
- Real-time updates and animations

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `qualityData` | Object | Yes | Quality metrics by infrastructure type |
| `historicalData` | Array | Yes | Historical quality data points |
| `sourceDistribution` | Object | Yes | Distribution of data sources |

#### Usage Example

```javascript
<DataQualityPanel
  qualityData={{
    cables: {
      confidence: 85,
      liveCount: 150,
      cachedCount: 80,
      estimatedCount: 20
    }
  }}
  historicalData={[
    { timestamp: 1234567890, quality: 85 },
    { timestamp: 1234567950, quality: 87 }
  ]}
  sourceDistribution={{
    live: 45,
    cached: 35,
    estimated: 15,
    fallback: 5
  }}
/>
```

### 3. DataFreshnessIndicator

Visual indicator overlays for individual map elements.

#### Features
- Small icons showing data source
- Tooltips with detailed information
- Color-coded visual feedback
- Pulsing animation during refresh
- Glow effect for live data

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `dataSource` | String | Yes | Source type (live/cached/estimated/fallback) |
| `lastUpdate` | Number | Yes | Unix timestamp of last update |
| `confidence` | Number | Yes | Confidence level 0-100 |
| `isRefreshing` | Boolean | No | Whether data is refreshing |
| `position` | String | No | Position (top-left/top-right/bottom-left/bottom-right) |
| `elementType` | String | No | Type of element (e.g., "Submarine Cable") |
| `additionalInfo` | Object | No | Additional information for tooltip |

#### Usage Example

```javascript
<DataFreshnessIndicator
  dataSource="live"
  lastUpdate={Date.now() - 60000}
  confidence={95}
  isRefreshing={false}
  position="top-right"
  elementType="Submarine Cable"
  additionalInfo={{
    source: 'TeleGeography API',
    cacheAge: 'N/A'
  }}
/>
```

### 4. NotificationSystem

Toast notification system for real-time alerts and updates.

#### Features
- Success, warning, error, and info notifications
- Auto-dismissing with progress bar
- Stack management for multiple notifications
- Accessible with ARIA live regions
- Customizable duration and persistence

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `success()` | message, options | Show success notification |
| `warning()` | message, options | Show warning notification |
| `error()` | message, options | Show error notification |
| `info()` | message, options | Show info notification |
| `clear()` | - | Clear all notifications |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | Number | 3000 | Custom duration in milliseconds |
| `persistent` | Boolean | false | Don't auto-dismiss |

#### Usage Example

```javascript
import NotificationSystem, { useNotifications } from './components/NotificationSystem';

// In root component
<NotificationSystem maxNotifications={5} />

// In any component
const notifications = useNotifications();

notifications.success('Data refreshed successfully');
notifications.warning('Approaching API rate limit');
notifications.error('Failed to load data');
notifications.info('Updating cache...');
```

---

## Dashboard Usage

### Interpreting Metrics

#### Confidence Score
- **0-100%**: Overall confidence in data accuracy
- Color-coded based on threshold levels
- Calculated from data source, age, and API health

#### Last Update
- Shows time since last data refresh
- Formats automatically (e.g., "5 minutes ago")
- Red warning if data is too old

#### Cache Hit Rate
- **0-100%**: Percentage of requests served from cache
- Higher is better for performance
- Monitor for optimal cache configuration

#### Active APIs
- Shows "X/Y" format (active out of total)
- Green when all APIs active
- Yellow/Red when APIs are down

#### Fallback Count
- Number of times fallback data was used
- Should be minimized
- Indicates API reliability issues

### Using Refresh Controls

#### Manual Refresh
1. Click the "Refresh Data" button
2. System fetches fresh data from all APIs
3. Notification confirms success or failure
4. Dashboard updates with new metrics

#### Auto-Refresh
1. Toggle "Auto-refresh" switch
2. Select refresh interval from dropdown
3. System automatically refreshes at set intervals
4. Visual indicator shows countdown to next refresh

#### Preference Modes

**Prefer Accuracy:**
- Prioritizes data freshness
- Makes more API calls
- Uses live data when available
- Higher accuracy, more resource usage
- Best for: Critical monitoring, real-time dashboards

**Prefer Speed:**
- Prioritizes performance
- Uses cached data more often
- Reduces API calls
- Faster response, potentially stale data
- Best for: General browsing, reduced API costs

### Reading the Quality Panel

#### Confidence Meter
- Circular gauge showing overall quality (0-100%)
- Color changes based on confidence level
- Animation when value updates

#### Source Distribution Chart
- Pie chart showing data source breakdown
- Hover for exact percentages
- Segments color-coded by source type

#### Historical Trend Graph
- Line chart showing quality over time
- X-axis: Time (last 60 minutes)
- Y-axis: Quality score (0-100%)
- Helps identify quality degradation patterns

---

## Quality Indicators

### Confidence Scoring Algorithm

```javascript
function calculateConfidence(dataPoint) {
  let score = 100;

  // Age penalty
  const ageMinutes = (Date.now() - dataPoint.lastUpdate) / 60000;
  if (ageMinutes > 60) score -= 50;
  else if (ageMinutes > 30) score -= 30;
  else if (ageMinutes > 15) score -= 15;
  else if (ageMinutes > 5) score -= 5;

  // Source quality
  if (dataPoint.source === 'fallback') score -= 30;
  else if (dataPoint.source === 'estimated') score -= 20;
  else if (dataPoint.source === 'cached') score -= 10;

  // API health
  const apiHealth = dataPoint.activeAPIs / dataPoint.totalAPIs;
  score *= apiHealth;

  return Math.max(0, Math.min(100, score));
}
```

### Freshness Levels

#### Level 1: Live Data (≥95%)
- **Source**: Active API connection
- **Age**: Less than 5 minutes
- **Reliability**: Highest
- **Visual**: Green glow effect
- **Use Case**: Real-time monitoring, critical operations

#### Level 2: Cached Data (75-94%)
- **Source**: Recent cache
- **Age**: 5-30 minutes
- **Reliability**: High
- **Visual**: Yellow solid color
- **Use Case**: General browsing, performance optimization

#### Level 3: Estimated Data (50-74%)
- **Source**: Interpolated or estimated
- **Age**: 30-60 minutes
- **Reliability**: Moderate
- **Visual**: Orange solid color
- **Use Case**: Approximations, non-critical display

#### Level 4: Fallback Data (<50%)
- **Source**: Fallback datasets
- **Age**: Over 60 minutes
- **Reliability**: Low
- **Visual**: Red warning indicator
- **Use Case**: Emergency fallback, better than nothing

### Visual Feedback System

#### Colors
```css
--live-color: #00ff88;      /* Green */
--cached-color: #ffd700;    /* Yellow */
--estimated-color: #ff9500; /* Orange */
--fallback-color: #ff3b30;  /* Red */
```

#### Icons
- 🟢 Live: Solid green circle with glow
- 🟡 Cached: Solid yellow circle
- 🟠 Estimated: Solid orange circle
- 🔴 Fallback: Solid red circle with warning

#### Animations
- **Pulsing**: During data refresh (all levels)
- **Glowing**: Live data only (subtle breathing effect)
- **Fade-in**: New data appears
- **Fade-out**: Old data removed

---

## Technical Implementation

### Data Flow Architecture

```
┌─────────────┐
│   API Call  │
└─────┬───────┘
      │
      ▼
┌─────────────────┐     ┌──────────────┐
│  Cache Check    │────>│ Cache Hit    │
└─────┬───────────┘     └──────┬───────┘
      │ miss                   │ return cached
      ▼                        ▼
┌─────────────────┐     ┌──────────────┐
│  Live API Fetch │────>│ Update Cache │
└─────┬───────────┘     └──────┬───────┘
      │ fail                   │ success
      ▼                        ▼
┌─────────────────┐     ┌──────────────┐
│ Fallback Data   │     │ Return Fresh │
└─────────────────┘     └──────────────┘
```

### Fallback Chain

1. **Primary**: Live API call
2. **Secondary**: Fresh cache (< 5 min)
3. **Tertiary**: Stale cache (< 30 min)
4. **Quaternary**: Estimated/interpolated data
5. **Final**: Static fallback dataset

### State Management

```javascript
const [dataStatus, setDataStatus] = useState({
  infrastructureType: {
    confidence: 85,           // Calculated score
    lastUpdate: 1234567890,   // Unix timestamp
    source: 'API Name',       // Data source identifier
    cacheHitRate: 78,         // Cache efficiency
    activeAPIs: 2,            // Healthy connections
    totalAPIs: 3,             // Total configured
    fallbackCount: 1          // Fallback usage count
  }
});
```

### Update Cycle

```javascript
const updateDataStatus = async () => {
  const newStatus = {};

  for (const type of infrastructureTypes) {
    try {
      // Try live API
      const liveData = await fetchLive(type);
      newStatus[type] = {
        confidence: 95,
        lastUpdate: Date.now(),
        source: liveData.source,
        ...calculateMetrics(liveData)
      };
    } catch (error) {
      // Fall back to cache
      const cached = getCachedData(type);
      if (cached) {
        newStatus[type] = {
          confidence: 75,
          lastUpdate: cached.timestamp,
          source: 'cache',
          ...calculateMetrics(cached)
        };
      } else {
        // Final fallback
        newStatus[type] = getFallbackData(type);
      }
    }
  }

  setDataStatus(newStatus);
};
```

---

## Cache Management

### Cache Strategy

#### Cache Levels

1. **Memory Cache** (Fastest)
   - In-memory JavaScript objects
   - Cleared on page refresh
   - 0ms latency

2. **LocalStorage Cache** (Fast)
   - Browser localStorage
   - Persists across sessions
   - ~1ms latency

3. **IndexedDB Cache** (Persistent)
   - Large dataset storage
   - Advanced querying
   - ~5ms latency

#### Time-To-Live (TTL)

```javascript
const cacheTTL = {
  live: 5 * 60 * 1000,      // 5 minutes
  cached: 30 * 60 * 1000,   // 30 minutes
  estimated: 60 * 60 * 1000 // 1 hour
};
```

### Cache Invalidation

#### Automatic Invalidation
- Data exceeds TTL
- API returns newer data
- Manual refresh triggered
- Cache corruption detected

#### Manual Invalidation
```javascript
// Clear specific cache
clearCache('cables');

// Clear all caches
clearAllCaches();

// Force fresh fetch
fetchData({ bypassCache: true });
```

### Cache Performance Monitoring

```javascript
const cacheMetrics = {
  hitRate: (hits / (hits + misses)) * 100,
  avgLatency: totalLatency / requests,
  size: getCurrentCacheSize(),
  evictions: evictionCount
};
```

---

## Monitoring & Alerts

### Health Checks

#### System Health
```javascript
const healthCheck = {
  overall: 'healthy',  // healthy|degraded|critical
  apis: {
    primary: 'up',     // up|down|slow
    secondary: 'up',
    fallback: 'up'
  },
  cache: {
    status: 'optimal',  // optimal|degraded|full
    hitRate: 85,
    size: '2.3MB'
  },
  quality: {
    average: 87,
    trending: 'stable'  // improving|stable|degrading
  }
};
```

#### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Confidence | <75% | <50% | Show notification |
| API Health | <80% | <50% | Alert user |
| Cache Hit Rate | <60% | <40% | Optimize cache |
| Fallback Usage | >5% | >20% | Check APIs |

### Notification Triggers

```javascript
// Quality degradation
if (confidence < 75) {
  notifications.warning('Data quality degraded');
}

// API failure
if (activeAPIs === 0) {
  notifications.error('All APIs unavailable');
}

// Cache issues
if (cacheHitRate < 40) {
  notifications.info('Cache performance low');
}

// Successful refresh
notifications.success('Data updated successfully');
```

### Performance Metrics

```javascript
const metrics = {
  apiLatency: {
    avg: 250,      // ms
    p95: 500,
    p99: 1000
  },
  refreshDuration: 1200,  // ms
  cacheLatency: 15,       // ms
  renderTime: 45          // ms
};
```

---

## Integration Examples

### Basic Integration

```javascript
import React, { useState, useCallback } from 'react';
import DataFreshnessDashboard from './components/DataFreshnessDashboard';
import NotificationSystem, { useNotifications } from './components/NotificationSystem';

const MyApp = () => {
  const notifications = useNotifications();
  const [dataStatus, setDataStatus] = useState({});

  const handleRefresh = useCallback(async () => {
    notifications.info('Refreshing data...');

    try {
      const freshData = await fetchDataFromAPIs();
      setDataStatus(freshData);
      notifications.success('Data refreshed successfully');
    } catch (error) {
      notifications.error('Failed to refresh: ' + error.message);
    }
  }, [notifications]);

  return (
    <div>
      <NotificationSystem maxNotifications={5} />
      <DataFreshnessDashboard
        dataStatus={dataStatus}
        onRefresh={handleRefresh}
      />
    </div>
  );
};
```

### Complete Integration with All Components

```javascript
import React, { useState, useCallback, useEffect } from 'react';
import DataFreshnessDashboard from './components/DataFreshnessDashboard';
import DataQualityPanel from './components/DataQualityPanel';
import DataFreshnessIndicator from './components/DataFreshnessIndicator';
import NotificationSystem, { useNotifications } from './components/NotificationSystem';

const FullIntegration = () => {
  const notifications = useNotifications();
  const [dataStatus, setDataStatus] = useState({});
  const [qualityData, setQualityData] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [sourceDistribution, setSourceDistribution] = useState({});

  const handleRefresh = useCallback(async () => {
    notifications.info('Refreshing data...');

    try {
      // Fetch fresh data from APIs
      const freshData = await fetchDataFromAPIs();

      setDataStatus(freshData);
      updateQualityMetrics(freshData);
      notifications.success('Data refreshed successfully');
    } catch (error) {
      notifications.error('Failed to refresh: ' + error.message);
    }
  }, [notifications]);

  const handleSettingsChange = useCallback((settings) => {
    console.log('Settings updated:', settings);
    // Apply new refresh settings
    if (settings.preferAccuracy) {
      // Use live data preference
    } else {
      // Use cached data preference
    }
  }, []);

  // Update quality metrics
  const updateQualityMetrics = (data) => {
    const quality = calculateQualityData(data);
    setQualityData(quality);

    // Add to historical data
    setHistoricalData(prev => [
      ...prev,
      { timestamp: Date.now(), quality: quality.average }
    ].slice(-100)); // Keep last 100 points

    // Update source distribution
    setSourceDistribution(calculateSourceDistribution(data));
  };

  return (
    <div>
      <NotificationSystem maxNotifications={5} />

      <DataFreshnessDashboard
        dataStatus={dataStatus}
        onRefresh={handleRefresh}
        onSettingsChange={handleSettingsChange}
      />

      {/* Your map visualization */}
      <MapVisualization>
        {cables.map(cable => (
          <CableElement key={cable.id}>
            <DataFreshnessIndicator
              dataSource={cable.dataSource}
              lastUpdate={cable.lastUpdate}
              confidence={cable.confidence}
              elementType="Submarine Cable"
              additionalInfo={{
                source: cable.source,
                cacheAge: cable.cacheAge
              }}
            />
          </CableElement>
        ))}
      </MapVisualization>

      <DataQualityPanel
        qualityData={qualityData}
        historicalData={historicalData}
        sourceDistribution={sourceDistribution}
      />
    </div>
  );
};
```

### With Map Elements

```jsx
{elements.map(element => (
  <MapElement key={element.id}>
    <DataFreshnessIndicator
      dataSource={element.source}
      lastUpdate={element.updated}
      confidence={element.confidence}
      elementType={element.type}
      position="top-right"
    />
  </MapElement>
))}
```

### Settings Handler

```jsx
const handleSettings = (settings) => {
  const { autoRefresh, refreshInterval, preferAccuracy } = settings;

  // Update application settings
  if (preferAccuracy) {
    // Use live data, bypass cache when possible
    setFetchStrategy('live-first');
  } else {
    // Use cached data, reduce API calls
    setFetchStrategy('cache-first');
  }

  // Update auto-refresh
  if (autoRefresh) {
    startAutoRefresh(refreshInterval);
  } else {
    stopAutoRefresh();
  }
};
```

---

## Best Practices

### 1. Update Frequency

**DO:**
- Update `dataStatus` whenever data is fetched or refreshed
- Update `historicalData` at regular intervals (every 1-5 minutes)
- Recalculate `sourceDistribution` when data sources change
- Batch updates to avoid excessive re-renders

**DON'T:**
- Update on every render
- Mutate state objects directly
- Forget to update timestamps
- Keep unlimited historical data

### 2. Performance Optimization

**DO:**
- Use `React.memo()` for components that don't change frequently
- Debounce rapid updates to avoid excessive re-renders
- Keep historical data limited to relevant time ranges (max 1000 points)
- Use virtual scrolling for large notification lists
- Implement request batching for multiple API calls

**DON'T:**
- Re-render entire dashboard on every metric change
- Store large datasets in state
- Make synchronous API calls
- Block the UI thread with heavy calculations

### 3. Error Handling

**DO:**
- Always show notifications for errors
- Provide clear error messages with context
- Allow users to retry failed operations
- Track and display fallback instances
- Log errors for debugging
- Implement graceful degradation

**DON'T:**
- Fail silently
- Show technical error messages to users
- Leave the UI in a broken state
- Retry infinitely without backoff

### 4. User Experience

**DO:**
- Show loading states during refresh
- Provide visual feedback for all actions
- Keep notifications concise and actionable
- Allow users to dismiss notifications manually
- Maintain context during navigation
- Provide keyboard shortcuts

**DON'T:**
- Block user interaction during updates
- Show too many notifications at once
- Use jargon in user-facing messages
- Hide important status information

### 5. Data Management

**DO:**
- Validate data before display
- Sanitize user inputs
- Implement proper caching strategies
- Use appropriate TTL values
- Monitor cache performance

**DON'T:**
- Trust external data without validation
- Cache indefinitely
- Ignore cache invalidation
- Store sensitive data in cache

---

## Troubleshooting

### Indicators Not Showing

**Symptoms:**
- Indicators not visible on map elements
- Tooltips not appearing

**Solutions:**
1. Check that `dataSource` prop is valid (live/cached/estimated/fallback)
2. Verify parent element has `position: relative`
3. Ensure CSS file is properly imported
4. Check z-index conflicts
5. Verify component is receiving props

```jsx
// Correct parent positioning
<div style={{ position: 'relative' }}>
  <DataFreshnessIndicator {...props} />
</div>
```

### Notifications Not Appearing

**Symptoms:**
- Notifications not showing
- Notification methods not working

**Solutions:**
1. Ensure `NotificationSystem` is rendered in root component
2. Verify component is mounted before calling notification methods
3. Check for z-index conflicts with other components
4. Confirm no console errors
5. Verify notification context is available

```jsx
// Ensure NotificationSystem is at root level
function App() {
  return (
    <>
      <NotificationSystem />  {/* Must be here */}
      <YourComponents />
    </>
  );
}
```

### Dashboard Not Updating

**Symptoms:**
- Dashboard shows stale data
- Metrics not refreshing

**Solutions:**
1. Verify `dataStatus` prop is being updated correctly
2. Ensure object references are changing (not mutating)
3. Check for console errors preventing renders
4. Confirm auto-refresh is enabled if expected
5. Verify event handlers are properly connected

```javascript
// WRONG - Mutating state
dataStatus.cables.confidence = 90;
setDataStatus(dataStatus);

// CORRECT - Creating new object
setDataStatus({
  ...dataStatus,
  cables: {
    ...dataStatus.cables,
    confidence: 90
  }
});
```

### Chart Rendering Issues

**Symptoms:**
- Charts not displaying
- Visual glitches in graphs

**Solutions:**
1. Confirm Canvas element is properly sized
2. Verify historical data is in correct format
3. Check browser supports Canvas API
4. Ensure data points are valid numbers
5. Check for data array length limits

```javascript
// Correct data format
const historicalData = [
  { timestamp: 1234567890, quality: 85 },  // ✓
  { timestamp: 1234567950, quality: 87 }   // ✓
];

// Incorrect formats
const badData = [
  { time: '2023-01-01', value: 85 },      // ✗ Wrong keys
  { timestamp: 'now', quality: 'high' }    // ✗ Wrong types
];
```

### Performance Issues

**Symptoms:**
- Slow rendering
- UI lag during updates
- High memory usage

**Solutions:**
1. Limit historical data points (max 1000)
2. Debounce rapid updates
3. Use React.memo() for expensive components
4. Implement virtual scrolling
5. Optimize re-render triggers

```javascript
// Debounce updates
import { debounce } from 'lodash';

const debouncedUpdate = debounce((data) => {
  setDataStatus(data);
}, 300);
```

### API Connection Failures

**Symptoms:**
- All indicators showing red
- Constant fallback usage
- Error notifications

**Solutions:**
1. Check API endpoint URLs
2. Verify API keys/credentials
3. Check CORS settings
4. Monitor API rate limits
5. Implement exponential backoff

```javascript
// Retry with exponential backoff
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

---

## API Reference

### Data Structures

#### Data Status Object
```typescript
interface DataStatus {
  confidence: number;        // 0-100
  lastUpdate: number;        // Unix timestamp (ms)
  source: string;            // Data source name
  cacheHitRate: number;      // 0-100 percentage
  activeAPIs: number;        // Count of active APIs
  totalAPIs: number;         // Count of total APIs
  fallbackCount: number;     // Count of fallback instances
}
```

#### Quality Data Object
```typescript
interface QualityData {
  confidence: number;        // 0-100
  liveCount: number;         // Count of live data points
  cachedCount: number;       // Count of cached data points
  estimatedCount: number;    // Count of estimated data points
}
```

#### Historical Data Point
```typescript
interface HistoricalPoint {
  timestamp: number;         // Unix timestamp (ms)
  quality: number;           // Quality score 0-100
}
```

#### Source Distribution
```typescript
interface SourceDistribution {
  live: number;              // Percentage
  cached: number;            // Percentage
  estimated: number;         // Percentage
  fallback: number;          // Percentage
}
```

### Component Props Reference

#### DataFreshnessDashboard Props
```typescript
interface DashboardProps {
  dataStatus: Record<string, DataStatus>;
  onRefresh: () => Promise<void>;
  onSettingsChange?: (settings: RefreshSettings) => void;
}
```

#### DataQualityPanel Props
```typescript
interface QualityPanelProps {
  qualityData: Record<string, QualityData>;
  historicalData: HistoricalPoint[];
  sourceDistribution: SourceDistribution;
}
```

#### DataFreshnessIndicator Props
```typescript
interface IndicatorProps {
  dataSource: 'live' | 'cached' | 'estimated' | 'fallback';
  lastUpdate: number;
  confidence: number;
  isRefreshing?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  elementType?: string;
  additionalInfo?: Record<string, any>;
}
```

#### Notification Options
```typescript
interface NotificationOptions {
  duration?: number;         // Milliseconds (default: 3000)
  persistent?: boolean;      // Don't auto-dismiss (default: false)
}
```

### CSS Classes Reference

```css
/* Dashboard */
.data-freshness-dashboard { }
.dashboard-header { }
.dashboard-content { }
.control-panel { }
.status-grid { }
.status-card { }

/* Indicators */
.freshness-indicator { }
.freshness-tooltip { }
.indicator-icon { }

/* Notifications */
.notification { }
.notification-success { }
.notification-warning { }
.notification-error { }
.notification-info { }

/* Quality Panel */
.data-quality-panel { }
.confidence-meter { }
.source-chart { }
.historical-chart { }
```

---

## Accessibility

### ARIA Support

All components implement comprehensive ARIA attributes:

```jsx
<div
  role="alert"
  aria-live="polite"
  aria-label="Data quality dashboard"
>
  {/* Dashboard content */}
</div>

<button
  aria-label="Refresh data manually"
  aria-pressed={isRefreshing}
>
  Refresh
</button>
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate through controls |
| `Enter` | Activate button |
| `Space` | Toggle switch/checkbox |
| `Esc` | Dismiss notification/tooltip |
| `Arrow Keys` | Navigate within components |

### Screen Reader Support

- All interactive elements have descriptive labels
- Live regions announce dynamic updates
- Status changes are announced
- Error messages are clearly communicated

```jsx
<div aria-live="polite" aria-atomic="true">
  {`Data quality: ${confidence}%, Last updated ${timeAgo}`}
</div>
```

### Color Contrast

All color combinations meet WCAG AA standards:
- Text contrast ratio: ≥4.5:1
- Large text: ≥3:1
- Interactive elements: ≥3:1

### Focus Indicators

All interactive elements have visible focus indicators:

```css
button:focus-visible {
  outline: 2px solid #00ff88;
  outline-offset: 2px;
}
```

---

## Performance

### Optimizations

#### GPU-Accelerated Animations
```css
.indicator-icon {
  transform: translateZ(0);  /* Force GPU acceleration */
  will-change: opacity, transform;
}
```

#### Debounced Updates
```javascript
const debouncedUpdate = debounce((data) => {
  setDataStatus(data);
}, 300);
```

#### Memoization
```javascript
const MemoizedDashboard = React.memo(DataFreshnessDashboard, (prev, next) => {
  return JSON.stringify(prev.dataStatus) === JSON.stringify(next.dataStatus);
});
```

#### Virtual Scrolling
```javascript
// For large notification lists
<VirtualList
  items={notifications}
  itemHeight={60}
  renderItem={(item) => <Notification {...item} />}
/>
```

### Resource Usage

**Memory:**
- Dashboard: ~2MB
- Historical data (100 points): ~5KB
- Cached data: Variable

**Network:**
- Initial load: ~50KB (components + styles)
- Per API call: Variable
- WebSocket (optional): Minimal

**CPU:**
- Idle: <1%
- Refreshing: 5-10%
- Chart rendering: 10-15%

### Performance Metrics

```javascript
const performanceMetrics = {
  // Target metrics
  initialRender: '<100ms',
  updateRender: '<50ms',
  apiLatency: '<500ms',
  cacheLatency: '<20ms',

  // Actual monitoring
  measureRender: () => {
    const start = performance.now();
    // Render logic
    const duration = performance.now() - start;
    console.log(`Render time: ${duration}ms`);
  }
};
```

---

## Security

### Best Practices

#### Never Expose Secrets
```javascript
// ✗ WRONG
const apiKey = 'sk_live_123456789';

// ✓ CORRECT
const apiKey = process.env.REACT_APP_API_KEY;
```

#### Sanitize Data
```javascript
// Sanitize before display
const sanitizeHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};
```

#### Use HTTPS
```javascript
// Always use HTTPS for API calls
const API_BASE = 'https://api.example.com';
```

#### Implement Rate Limiting
```javascript
const rateLimiter = {
  calls: 0,
  resetTime: Date.now() + 60000,

  canMakeRequest() {
    if (Date.now() > this.resetTime) {
      this.calls = 0;
      this.resetTime = Date.now() + 60000;
    }
    return this.calls < 100; // Max 100 calls per minute
  },

  recordRequest() {
    this.calls++;
  }
};
```

#### Validate Inputs
```javascript
function validateDataStatus(data) {
  if (typeof data.confidence !== 'number' ||
      data.confidence < 0 ||
      data.confidence > 100) {
    throw new Error('Invalid confidence score');
  }
  // More validation...
  return true;
}
```

### Security Checklist

- [ ] API keys stored in environment variables
- [ ] All API calls use HTTPS
- [ ] User inputs are sanitized
- [ ] Rate limiting implemented
- [ ] Data validation on all inputs
- [ ] No sensitive data in localStorage
- [ ] CORS properly configured
- [ ] Content Security Policy set

---

## Styling and Theming

### CSS Variables

```css
.data-freshness-dashboard {
  /* Colors */
  --live-color: #00ff88;
  --cached-color: #ffd700;
  --estimated-color: #ff9500;
  --fallback-color: #ff3b30;

  /* Background */
  --background: rgba(26, 26, 26, 0.95);
  --border: rgba(255, 255, 255, 0.1);

  /* Text */
  --text-primary: rgba(255, 255, 255, 0.9);
  --text-secondary: rgba(255, 255, 255, 0.6);

  /* Effects */
  --backdrop-blur: blur(10px);
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
```

### Dark Theme (Default)

The system uses a dark theme optimized for infrastructure visualization:

```css
/* Primary background */
background: rgba(26, 26, 26, 0.95);

/* Borders */
border: 1px solid rgba(255, 255, 255, 0.1);

/* Text */
color: rgba(255, 255, 255, 0.9);

/* Backdrop */
backdrop-filter: blur(10px);
```

### Custom Theme

```css
/* Override in your styles */
.data-freshness-dashboard {
  --live-color: #4CAF50;
  --cached-color: #FFC107;
  --estimated-color: #FF9800;
  --fallback-color: #F44336;
  --background: #1e1e1e;
}
```

---

## Responsive Design

### Breakpoints

```css
/* Desktop: Full features (>768px) */
@media (min-width: 769px) {
  .data-freshness-dashboard {
    width: 400px;
  }
}

/* Tablet: Adapted layout (481-768px) */
@media (max-width: 768px) {
  .data-freshness-dashboard {
    width: 100%;
    max-width: 500px;
  }
}

/* Mobile: Streamlined UI (<480px) */
@media (max-width: 480px) {
  .data-freshness-dashboard {
    width: 100%;
    padding: 10px;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
```

### Mobile Optimizations

- Touch-friendly controls (min 44x44px)
- Simplified layouts
- Full-width notifications
- Collapsible panels
- Reduced animations

---

## Browser Support

### Fully Supported

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements

- ES6+ JavaScript support
- Canvas API (for charts)
- CSS Grid and Flexbox
- CSS Animations and Transitions
- LocalStorage API

### Polyfills

```javascript
// If supporting older browsers
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

---

## Future Enhancements

### Planned Features

- [ ] Export quality reports (PDF/CSV)
- [ ] Custom alert thresholds
- [ ] Integration with monitoring services (DataDog, New Relic)
- [ ] Advanced filtering and search
- [ ] Custom chart configurations
- [ ] Webhook support for alerts
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Customizable dashboard layouts
- [ ] Real-time collaborative monitoring

---

## Support and Resources

### Documentation
- Complete Guide: This file
- Examples: `DataFreshnessIntegration.js`
- Demo: `DataFreshnessDemo.js`
- Styles: `dataFreshness.css`

### Getting Help

For issues or questions:
1. Check this complete guide
2. Review example code
3. Run the interactive demo
4. Check browser console for errors
5. Submit detailed bug reports with reproducible examples

### Contributing

When contributing:
1. Follow existing code style
2. Add comprehensive JSDoc comments
3. Update documentation
4. Test all features thoroughly
5. Ensure accessibility compliance

---

## License

This data quality and freshness system is part of the Internet Infrastructure Visualization project.

---

**Built with React** | **Styled with CSS** | **Accessible by Design** | **Production Ready**
