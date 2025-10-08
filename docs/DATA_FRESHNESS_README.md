# Data Freshness Indicator System

A comprehensive, production-ready data freshness monitoring and visualization system for real-time infrastructure data quality tracking.

## 🎯 Features

### ✅ Complete Dashboard UI
- **Real-time monitoring** of data quality across all infrastructure types
- **Color-coded confidence levels** (Live/Cached/Estimated/Fallback)
- **Auto-refresh system** with configurable intervals (1min to 1hr)
- **Manual refresh controls** with visual feedback
- **Cache performance statistics** and API health monitoring
- **Preference toggle** between accuracy and speed

### 📊 Advanced Analytics
- **Quality metrics panel** with detailed breakdowns
- **Source distribution visualization** (pie chart)
- **Historical tracking** with trend graphs
- **Confidence meter** (0-100% accuracy score)
- **Infrastructure-specific analytics**

### 🎨 Visual Indicators
- **Map element overlays** showing data freshness
- **Smart tooltips** with detailed information
- **Color-coded feedback** matching confidence levels
- **Pulsing animations** during active refresh
- **Glow effects** for live data sources

### 🔔 Notification System
- **Toast notifications** for all events
- **Auto-dismissing** with progress bars
- **Success/Warning/Error/Info** types
- **Stack management** for multiple notifications
- **Accessible** with ARIA live regions

## 📁 File Structure

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
    ├── DATA_FRESHNESS_GUIDE.md        # Complete documentation
    └── DATA_FRESHNESS_README.md       # This file
```

## 🚀 Quick Start

### 1. Import Components

```javascript
import DataFreshnessDashboard from './components/DataFreshnessDashboard';
import DataQualityPanel from './components/DataQualityPanel';
import DataFreshnessIndicator from './components/DataFreshnessIndicator';
import NotificationSystem, { useNotifications } from './components/NotificationSystem';
import './styles/dataFreshness.css';
```

### 2. Add Notification System (Root Component)

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

### 3. Add Dashboard

```javascript
function MyComponent() {
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
    // ... other infrastructure types
  });

  const handleRefresh = async () => {
    // Fetch fresh data
    const freshData = await fetchData();
    setDataStatus(freshData);
  };

  return (
    <DataFreshnessDashboard
      dataStatus={dataStatus}
      onRefresh={handleRefresh}
      onSettingsChange={(settings) => console.log(settings)}
    />
  );
}
```

### 4. Add Indicators to Map Elements

```javascript
<MapElement>
  <DataFreshnessIndicator
    dataSource="live"
    lastUpdate={Date.now() - 60000}
    confidence={95}
    position="top-right"
    elementType="Submarine Cable"
  />
</MapElement>
```

### 5. Use Notifications

```javascript
const notifications = useNotifications();

notifications.success('Data loaded successfully');
notifications.warning('API rate limit approaching');
notifications.error('Connection failed');
notifications.info('Cache updated');
```

## 🎨 Confidence Levels

The system automatically color-codes data based on confidence scores:

| Level | Range | Color | Visual |
|-------|-------|-------|--------|
| **Live** | ≥95% | Green (#00ff88) | 🟢 Glowing |
| **Cached** | 75-94% | Yellow (#ffd700) | 🟡 Solid |
| **Estimated** | 50-74% | Orange (#ff9500) | 🟠 Solid |
| **Fallback** | <50% | Red (#ff3b30) | 🔴 Warning |

## 🔧 Configuration

### Refresh Intervals

```javascript
const intervals = {
  '1min': 60000,      // High frequency
  '5min': 300000,     // Default
  '15min': 900000,    // Moderate
  '30min': 1800000,   // Conservative
  '1hr': 3600000      // Minimal
};
```

### Notification Options

```javascript
notifications.success('Message', {
  duration: 5000,      // Custom duration (ms)
  persistent: false    // Auto-dismiss (default)
});

notifications.warning('Important!', {
  persistent: true     // Manual dismiss only
});
```

## 📊 Data Structure

### Data Status Object

```javascript
{
  infrastructureType: {
    confidence: 85,           // 0-100
    lastUpdate: 1234567890,   // Unix timestamp
    source: 'API Name',       // String
    cacheHitRate: 78,         // 0-100
    activeAPIs: 2,            // Number
    totalAPIs: 3,             // Number
    fallbackCount: 1          // Number
  }
}
```

### Quality Data Object

```javascript
{
  infrastructureType: {
    confidence: 85,
    liveCount: 150,
    cachedCount: 80,
    estimatedCount: 20
  }
}
```

### Historical Data Array

```javascript
[
  { timestamp: 1234567890, quality: 85 },
  { timestamp: 1234567950, quality: 87 },
  // ... more data points
]
```

## 🎯 Use Cases

### 1. Real-Time Monitoring Dashboard
Display live data quality metrics for infrastructure monitoring systems.

### 2. API Health Tracking
Monitor API connectivity and fallback status across multiple data sources.

### 3. Cache Performance Analysis
Track cache hit rates and optimize caching strategies.

### 4. Data Quality Assurance
Ensure users are always aware of data reliability and freshness.

### 5. Debugging and Diagnostics
Quickly identify data source issues and degraded quality.

## 🎨 Styling

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

### Customization

Override CSS variables to customize colors:

```css
.data-freshness-dashboard {
  --live-color: #00ff88;
  --cached-color: #ffd700;
  --estimated-color: #ff9500;
  --fallback-color: #ff3b30;
}
```

## ♿ Accessibility

### ARIA Support
- All interactive elements have proper ARIA labels
- Live regions for dynamic content
- Role attributes for semantic structure
- Keyboard navigation support

### Screen Reader Friendly
- Descriptive labels for all controls
- Status announcements for updates
- Progress indicators with text alternatives

### Keyboard Navigation
- Tab navigation through all controls
- Enter/Space for button activation
- Escape to dismiss notifications
- Focus indicators for all interactive elements

## 📱 Responsive Design

### Breakpoints
- **Desktop**: Full feature set (>768px)
- **Tablet**: Adapted layouts (481-768px)
- **Mobile**: Streamlined UI (<480px)

### Mobile Optimizations
- Touch-friendly controls
- Simplified layouts
- Full-width notifications
- Collapsible panels

## 🧪 Testing

### Run Demo
```bash
# Start development server
npm run dev

# Navigate to demo
http://localhost:3000/demo
```

### Interactive Demo Features
- Real-time simulation toggle
- Manual quality degradation/improvement
- Notification testing buttons
- Live data updates
- Multiple map elements

## 📚 Documentation

### Complete Guide
See `DATA_FRESHNESS_GUIDE.md` for:
- Detailed API documentation
- Integration examples
- Best practices
- Troubleshooting
- Performance tips

### Component Documentation
Each component includes comprehensive JSDoc comments with:
- Parameter descriptions
- Return types
- Usage examples
- Notes and warnings

## 🔍 Browser Support

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

## ⚡ Performance

### Optimizations
- GPU-accelerated animations (CSS transforms)
- Debounced updates
- Virtual scrolling for large lists
- Efficient re-rendering with React.memo()
- Canvas-based charts for better performance

### Resource Usage
- Minimal DOM manipulation
- Efficient state management
- Optimized event listeners
- Smart caching strategies

## 🛡️ Security

### Best Practices
- Never expose API keys in client code
- Sanitize all user inputs
- Use HTTPS for all API calls
- Implement client-side rate limiting
- Validate all data before display

## 🚧 Future Enhancements

### Planned Features
- [ ] Export quality reports (PDF/CSV)
- [ ] Custom alert thresholds
- [ ] Integration with monitoring services
- [ ] Advanced filtering and search
- [ ] Custom chart configurations
- [ ] Webhook support for alerts
- [ ] Multi-language support

## 📝 License

Part of the Internet Infrastructure Visualization project.

## 🤝 Contributing

When contributing:
1. Follow existing code style
2. Add comprehensive JSDoc comments
3. Update documentation
4. Test all features thoroughly
5. Ensure accessibility compliance

## 📞 Support

For issues or questions:
1. Check the complete guide (DATA_FRESHNESS_GUIDE.md)
2. Review example code
3. Run the interactive demo
4. Check browser console for errors

## 🎓 Examples

### Basic Integration
See `DataFreshnessIntegration.js` for a complete working example.

### Interactive Demo
See `DataFreshnessDemo.js` for a fully-featured demonstration.

### Component Usage
See `DATA_FRESHNESS_GUIDE.md` for detailed component usage examples.

---

**Built with React** | **Styled with CSS** | **Accessible by Design** | **Production Ready**
