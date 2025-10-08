# Data Freshness System - Complete Guide

## Overview

The Data Freshness System provides comprehensive monitoring and visualization of data quality, source freshness, and API health across all infrastructure visualization components. This system ensures users always know the reliability and recency of displayed data.

## Components

### 1. DataFreshnessDashboard

The main dashboard component that displays real-time data quality metrics and refresh controls.

**Features:**
- Real-time freshness indicators for each infrastructure type
- Confidence levels with color-coded feedback (Live/Cached/Estimated/Fallback)
- Manual and automatic refresh controls
- Cache performance statistics
- Customizable refresh intervals
- Accuracy vs. Speed preference toggle

**Usage:**

```javascript
import DataFreshnessDashboard from './components/DataFreshnessDashboard';

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
    },
    // ... other infrastructure types
  }}
  onRefresh={handleRefresh}
  onSettingsChange={handleSettingsChange}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `dataStatus` | Object | Data status for each infrastructure type |
| `onRefresh` | Function | Callback when manual refresh triggered |
| `onSettingsChange` | Function | Callback when settings change |

### 2. DataQualityPanel

Detailed analytics panel with visualizations and historical tracking.

**Features:**
- Overall accuracy confidence meter (0-100%)
- Source distribution pie chart
- Historical quality trend graph
- Quality breakdown by infrastructure type
- Real-time updates and animations

**Usage:**

```javascript
import DataQualityPanel from './components/DataQualityPanel';

<DataQualityPanel
  qualityData={{
    cables: {
      confidence: 85,
      liveCount: 150,
      cachedCount: 80,
      estimatedCount: 20
    },
    // ... other types
  }}
  historicalData={[
    { timestamp: 1234567890, quality: 85 },
    // ... more points
  ]}
  sourceDistribution={{
    live: 45,
    cached: 35,
    estimated: 15,
    fallback: 5
  }}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `qualityData` | Object | Quality metrics by infrastructure type |
| `historicalData` | Array | Historical quality data points |
| `sourceDistribution` | Object | Distribution of data sources |

### 3. DataFreshnessIndicator

Visual indicator overlays for individual map elements.

**Features:**
- Small icons showing data source
- Tooltips with detailed information
- Color-coded visual feedback
- Pulsing animation during refresh
- Glow effect for live data

**Usage:**

```javascript
import DataFreshnessIndicator from './components/DataFreshnessIndicator';

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

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `dataSource` | String | Source type (live/cached/estimated/fallback) |
| `lastUpdate` | Number | Unix timestamp of last update |
| `confidence` | Number | Confidence level 0-100 |
| `isRefreshing` | Boolean | Whether data is refreshing |
| `position` | String | Position (top-left/top-right/bottom-left/bottom-right) |
| `elementType` | String | Type of element (e.g., "Submarine Cable") |
| `additionalInfo` | Object | Additional information for tooltip |

### 4. NotificationSystem

Toast notification system for real-time alerts and updates.

**Features:**
- Success, warning, error, and info notifications
- Auto-dismissing with progress bar
- Stack management for multiple notifications
- Accessible with ARIA live regions
- Customizable duration and persistence

**Usage:**

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

**Methods:**

| Method | Parameters | Description |
|--------|------------|-------------|
| `success()` | message, options | Show success notification |
| `warning()` | message, options | Show warning notification |
| `error()` | message, options | Show error notification |
| `info()` | message, options | Show info notification |
| `clear()` | - | Clear all notifications |

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `duration` | Number | Custom duration in milliseconds |
| `persistent` | Boolean | Don't auto-dismiss |

## Data Status Structure

The `dataStatus` object should follow this structure:

```javascript
{
  infrastructureType: {
    confidence: 85,           // 0-100 confidence score
    lastUpdate: 1234567890,   // Unix timestamp
    source: 'API Name',       // Data source name
    cacheHitRate: 78,         // Percentage of cache hits
    activeAPIs: 2,            // Number of active API connections
    totalAPIs: 3,             // Total number of configured APIs
    fallbackCount: 1          // Number of fallback instances
  }
}
```

## Confidence Levels

The system uses four confidence levels with automatic color coding:

| Level | Threshold | Color | Icon | Description |
|-------|-----------|-------|------|-------------|
| **Live** | ≥95% | Green (#00ff88) | 🟢 | Fresh data from active API |
| **Cached** | ≥75% | Yellow (#ffd700) | 🟡 | Recently cached data |
| **Estimated** | ≥50% | Orange (#ff9500) | 🟠 | Estimated or interpolated |
| **Fallback** | <50% | Red (#ff3b30) | 🔴 | Fallback or outdated data |

## Refresh Settings

### Auto-Refresh Intervals

- **1 minute** - High frequency, best for critical monitoring
- **5 minutes** - Default, balanced approach
- **15 minutes** - Reduced API calls
- **30 minutes** - Conservative usage
- **1 hour** - Minimal API usage

### Preference Modes

**Prefer Accuracy:**
- Prioritizes data freshness
- Makes more API calls
- Uses live data when available
- Higher accuracy, more resource usage

**Prefer Speed:**
- Prioritizes performance
- Uses cached data more often
- Reduces API calls
- Faster response, potentially stale data

## Integration Example

Complete integration with all components:

```javascript
import React, { useState, useCallback } from 'react';
import DataFreshnessDashboard from './components/DataFreshnessDashboard';
import DataQualityPanel from './components/DataQualityPanel';
import DataFreshnessIndicator from './components/DataFreshnessIndicator';
import NotificationSystem, { useNotifications } from './components/NotificationSystem';

const MyApp = () => {
  const notifications = useNotifications();
  const [dataStatus, setDataStatus] = useState({ /* ... */ });

  const handleRefresh = useCallback(async () => {
    notifications.info('Refreshing data...');

    try {
      // Fetch fresh data from APIs
      const freshData = await fetchDataFromAPIs();

      setDataStatus(freshData);
      notifications.success('Data refreshed successfully');
    } catch (error) {
      notifications.error('Failed to refresh: ' + error.message);
    }
  }, [notifications]);

  const handleSettingsChange = useCallback((settings) => {
    console.log('Settings updated:', settings);
    // Apply new refresh settings
  }, []);

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

## Best Practices

### 1. Update Frequency

- Update `dataStatus` whenever data is fetched or refreshed
- Update `historicalData` at regular intervals (every 1-5 minutes)
- Recalculate `sourceDistribution` when data sources change

### 2. Performance

- Use `React.memo()` for components that don't change frequently
- Debounce rapid updates to avoid excessive re-renders
- Keep historical data limited to relevant time ranges

### 3. Accessibility

- All components include ARIA labels and roles
- Keyboard navigation supported throughout
- Screen reader friendly with live regions
- High contrast mode compatible

### 4. Error Handling

- Always show notifications for errors
- Provide clear error messages with context
- Allow users to retry failed operations
- Track and display fallback instances

### 5. User Experience

- Show loading states during refresh
- Provide visual feedback for all actions
- Keep notifications concise and actionable
- Allow users to dismiss notifications manually

## Styling and Theming

The system uses CSS variables for easy theming:

```css
/* Customize colors */
.data-freshness-dashboard {
  --live-color: #00ff88;
  --cached-color: #ffd700;
  --estimated-color: #ff9500;
  --fallback-color: #ff3b30;
  --background: rgba(26, 26, 26, 0.95);
  --border: rgba(255, 255, 255, 0.1);
}
```

## Responsive Design

All components are fully responsive:

- **Desktop**: Full feature set, optimal layout
- **Tablet**: Adapted layouts, maintained functionality
- **Mobile**: Streamlined UI, essential features prioritized

## Browser Support

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Canvas API**: Required for charts and visualizations
- **ES6+**: Modern JavaScript features used throughout

## Troubleshooting

### Indicators not showing

Check that:
1. `dataSource` prop is valid (live/cached/estimated/fallback)
2. Parent element has `position: relative`
3. CSS file is properly imported

### Notifications not appearing

Ensure:
1. `NotificationSystem` is rendered in root component
2. Component is mounted before calling notification methods
3. No z-index conflicts with other components

### Dashboard not updating

Verify:
1. `dataStatus` prop is being updated correctly
2. Object references are changing (not mutating)
3. No console errors preventing renders

### Chart rendering issues

Confirm:
1. Canvas element is properly sized
2. Historical data is in correct format
3. Browser supports Canvas API

## Performance Considerations

- Historical data limited to 1000 points maximum
- Animations use CSS transforms for GPU acceleration
- Debounced updates prevent excessive re-renders
- Virtual scrolling for large notification lists

## Security Notes

- Never expose API keys in data status objects
- Sanitize all user-provided data before display
- Use HTTPS for all API communications
- Implement rate limiting on client side

## Future Enhancements

Potential improvements for future versions:

- Export quality reports as PDF/CSV
- Customizable alert thresholds
- Integration with monitoring services (DataDog, New Relic)
- Advanced filtering and search
- Historical data export
- Custom chart types and metrics

## Support

For issues, questions, or feature requests:

1. Check this documentation first
2. Review example integration code
3. Inspect browser console for errors
4. Submit detailed bug reports with reproducible examples

## License

This data freshness system is part of the Internet Infrastructure Visualization project.
