# Data Freshness System - Quick Reference

## 🚀 Installation

```javascript
// Import all components
import DataFreshnessDashboard from './components/DataFreshnessDashboard';
import DataQualityPanel from './components/DataQualityPanel';
import DataFreshnessIndicator from './components/DataFreshnessIndicator';
import NotificationSystem, { useNotifications } from './components/NotificationSystem';
import './styles/dataFreshness.css';
```

## 📦 Components

### NotificationSystem (Required in Root)

```jsx
<NotificationSystem maxNotifications={5} />
```

### DataFreshnessDashboard

```jsx
<DataFreshnessDashboard
  dataStatus={{
    cables: {
      confidence: 85,
      lastUpdate: Date.now() - 300000,
      source: 'API Name',
      cacheHitRate: 78,
      activeAPIs: 2,
      totalAPIs: 3,
      fallbackCount: 1
    }
  }}
  onRefresh={async () => { /* fetch data */ }}
  onSettingsChange={(settings) => { /* handle settings */ }}
/>
```

### DataQualityPanel

```jsx
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
    { timestamp: 1234567890, quality: 85 }
  ]}
  sourceDistribution={{
    live: 45,
    cached: 35,
    estimated: 15,
    fallback: 5
  }}
/>
```

### DataFreshnessIndicator

```jsx
<DataFreshnessIndicator
  dataSource="live"           // live|cached|estimated|fallback
  lastUpdate={Date.now()}
  confidence={95}
  isRefreshing={false}
  position="top-right"        // top-left|top-right|bottom-left|bottom-right
  elementType="Submarine Cable"
  additionalInfo={{
    source: 'API Name',
    cacheAge: '5 minutes'
  }}
/>
```

## 🔔 Notifications

```javascript
const notifications = useNotifications();

// Show notifications
notifications.success('Success message');
notifications.warning('Warning message');
notifications.error('Error message');
notifications.info('Info message');

// With options
notifications.success('Message', {
  duration: 5000,      // ms
  persistent: false    // auto-dismiss
});

// Clear all
notifications.clear();
```

## 🎨 Confidence Levels

| Level | Threshold | Color | Icon |
|-------|-----------|-------|------|
| Live | ≥95% | #00ff88 | 🟢 |
| Cached | 75-94% | #ffd700 | 🟡 |
| Estimated | 50-74% | #ff9500 | 🟠 |
| Fallback | <50% | #ff3b30 | 🔴 |

## ⚙️ Refresh Intervals

```javascript
'1min'   // 60000ms
'5min'   // 300000ms (default)
'15min'  // 900000ms
'30min'  // 1800000ms
'1hr'    // 3600000ms
```

## 📊 Data Structures

### Data Status
```javascript
{
  confidence: 85,           // 0-100
  lastUpdate: 1234567890,   // Unix timestamp
  source: 'API Name',       // String
  cacheHitRate: 78,         // 0-100
  activeAPIs: 2,            // Number
  totalAPIs: 3,             // Number
  fallbackCount: 1          // Number
}
```

### Quality Data
```javascript
{
  confidence: 85,
  liveCount: 150,
  cachedCount: 80,
  estimatedCount: 20
}
```

### Historical Point
```javascript
{
  timestamp: 1234567890,    // Unix timestamp
  quality: 85               // 0-100
}
```

## 🎯 Common Patterns

### Basic Setup
```jsx
function App() {
  return (
    <>
      <NotificationSystem />
      <DataFreshnessDashboard {...props} />
      <YourComponents />
    </>
  );
}
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
    />
  </MapElement>
))}
```

### Refresh Handler
```jsx
const handleRefresh = async () => {
  try {
    const data = await fetchData();
    setDataStatus(data);
    notifications.success('Refreshed');
  } catch (error) {
    notifications.error('Failed: ' + error.message);
  }
};
```

### Settings Handler
```jsx
const handleSettings = (settings) => {
  const { autoRefresh, refreshInterval, preferAccuracy } = settings;
  // Update your application settings
  if (preferAccuracy) {
    // Use live data
  } else {
    // Use cached data
  }
};
```

## 🎨 CSS Classes

```css
.data-freshness-dashboard { }
.dashboard-header { }
.dashboard-content { }
.control-panel { }
.status-grid { }
.status-card { }
.freshness-indicator { }
.freshness-tooltip { }
.notification { }
.data-quality-panel { }
```

## 🔧 Customization

### Override Colors
```css
.data-freshness-dashboard {
  --live-color: #00ff88;
  --cached-color: #ffd700;
  --estimated-color: #ff9500;
  --fallback-color: #ff3b30;
}
```

### Custom Positioning
```css
.data-freshness-dashboard {
  top: 20px;
  right: 20px;
  width: 400px;
}
```

## ⌨️ Keyboard Shortcuts

- `Tab` - Navigate controls
- `Enter/Space` - Activate buttons
- `Esc` - Dismiss notifications
- Click outside - Close tooltips

## 📱 Responsive Breakpoints

```css
@media (max-width: 768px) { }  /* Tablet */
@media (max-width: 480px) { }  /* Mobile */
```

## 🐛 Debugging

### Check Notification System
```javascript
console.log(window.notificationSystem);
```

### Verify Data Status
```javascript
console.log('Data Status:', dataStatus);
console.log('Quality Score:', calculateQualityScore());
```

### Monitor Updates
```javascript
useEffect(() => {
  console.log('Data updated:', dataStatus);
}, [dataStatus]);
```

## ✅ Checklist

- [ ] Import CSS file
- [ ] Add NotificationSystem to root
- [ ] Set up dataStatus state
- [ ] Implement refresh handler
- [ ] Add indicators to map elements
- [ ] Test all notification types
- [ ] Verify accessibility
- [ ] Test responsive layouts

## 🔗 Resources

- Complete Guide: `DATA_FRESHNESS_GUIDE.md`
- Examples: `DataFreshnessIntegration.js`
- Demo: `DataFreshnessDemo.js`
- Styles: `dataFreshness.css`

## 💡 Tips

1. Always include NotificationSystem in root component
2. Update dataStatus whenever data changes
3. Use notifications for all user feedback
4. Keep historical data limited (max 1000 points)
5. Test with different confidence levels
6. Verify tooltip positioning on all elements
7. Check keyboard navigation
8. Test with screen readers

## ⚠️ Common Issues

**Notifications not showing:**
- Ensure NotificationSystem is mounted
- Check no z-index conflicts

**Indicators not visible:**
- Verify parent has position: relative
- Check dataSource is valid value

**Dashboard not updating:**
- Ensure dataStatus reference changes
- Don't mutate state directly

**Charts not rendering:**
- Check Canvas API support
- Verify data format is correct

## 🎓 Examples

### Minimal Setup
```jsx
import React, { useState } from 'react';
import DataFreshnessDashboard from './components/DataFreshnessDashboard';
import NotificationSystem from './components/NotificationSystem';

function App() {
  const [dataStatus, setDataStatus] = useState({ /* ... */ });

  return (
    <>
      <NotificationSystem />
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

### Full Integration
See `DataFreshnessIntegration.js` for complete example.

---

**Quick, Simple, Complete** | **Copy, Paste, Code**
