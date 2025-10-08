/**
 * @fileoverview Data Quality Panel Component
 *
 * Provides detailed analytics and visualization of data quality metrics:
 * - Breakdown by infrastructure type (cables, data centers, IXPs, BGP)
 * - Source distribution visualization (pie chart)
 * - Historical quality tracking with trend analysis
 * - Accuracy confidence meter with real-time updates
 * - Data freshness timeline
 *
 * @requires react
 * @requires ../styles/dataFreshness.css
 */

import React, { useState, useEffect, useRef } from 'react';
import '../styles/dataFreshness.css';

/**
 * Data Quality Panel Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.qualityData - Quality metrics by infrastructure type
 * @param {Array} props.historicalData - Historical quality data points
 * @param {Object} props.sourceDistribution - Distribution of data sources
 * @returns {React.Component} Data quality analysis panel
 */
const DataQualityPanel = ({
  qualityData = {},
  historicalData = [],
  sourceDistribution = { live: 0, cached: 0, estimated: 0, fallback: 0 }
}) => {
  const [selectedType, setSelectedType] = useState('all');
  const [timeRange, setTimeRange] = useState('1h');
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);

  /**
   * Calculate overall accuracy confidence
   *
   * @returns {number} Confidence score 0-100
   */
  const calculateConfidence = () => {
    const types = Object.keys(qualityData);
    if (types.length === 0) return 0;

    const totalConfidence = types.reduce((sum, type) => {
      return sum + (qualityData[type]?.confidence || 0);
    }, 0);

    return Math.round(totalConfidence / types.length);
  };

  /**
   * Get filtered historical data based on time range
   *
   * @returns {Array} Filtered historical data points
   */
  const getFilteredHistory = () => {
    const now = Date.now();
    const ranges = {
      '1h': 3600000,
      '6h': 21600000,
      '24h': 86400000,
      '7d': 604800000
    };

    const cutoff = now - ranges[timeRange];
    return historicalData.filter(point => point.timestamp >= cutoff);
  };

  /**
   * Draw historical quality trend chart
   */
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const history = getFilteredHistory();
    if (history.length === 0) return;

    // Set up drawing style
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';

    // Calculate points
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const xStep = chartWidth / (history.length - 1 || 1);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${100 - i * 25}%`, padding - 5, y + 4);
    }

    // Draw quality line and area
    ctx.beginPath();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;

    history.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = padding + chartHeight - (point.quality / 100) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Fill area under curve
    ctx.lineTo(padding + (history.length - 1) * xStep, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Stroke the line
    ctx.beginPath();
    history.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = padding + chartHeight - (point.quality / 100) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#00ff88';
    history.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = padding + chartHeight - (point.quality / 100) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // X-axis labels (time)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    const labelCount = 5;
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((history.length - 1) * (i / (labelCount - 1)));
      const point = history[index];
      if (point) {
        const x = padding + index * xStep;
        const time = new Date(point.timestamp);
        const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ctx.fillText(label, x, height - padding + 20);
      }
    }
  }, [historicalData, timeRange]);

  /**
   * Draw source distribution pie chart
   */
  useEffect(() => {
    const canvas = pieChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const total = sourceDistribution.live + sourceDistribution.cached +
                  sourceDistribution.estimated + sourceDistribution.fallback;

    if (total === 0) return;

    const slices = [
      { value: sourceDistribution.live, color: '#00ff88', label: 'Live' },
      { value: sourceDistribution.cached, color: '#ffd700', label: 'Cached' },
      { value: sourceDistribution.estimated, color: '#ff9500', label: 'Estimated' },
      { value: sourceDistribution.fallback, color: '#ff3b30', label: 'Fallback' }
    ];

    let currentAngle = -Math.PI / 2; // Start at top

    slices.forEach(slice => {
      if (slice.value === 0) return;

      const sliceAngle = (slice.value / total) * Math.PI * 2;

      // Draw slice
      ctx.fillStyle = slice.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const percentage = Math.round((slice.value / total) * 100);
      ctx.fillText(`${percentage}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });
  }, [sourceDistribution]);

  const confidence = calculateConfidence();

  return (
    <div className="data-quality-panel" role="region" aria-label="Data Quality Panel">
      {/* Header */}
      <div className="panel-header">
        <h3>Data Quality Analytics</h3>
        <div className="header-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            aria-label="Select time range"
            className="time-range-selector"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="confidence-meter">
        <h4>Overall Accuracy Confidence</h4>
        <div className="meter-container">
          <svg viewBox="0 0 200 120" className="meter-svg">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Confidence arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={confidence >= 75 ? '#00ff88' : confidence >= 50 ? '#ffd700' : '#ff9500'}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${(confidence / 100) * 251.2} 251.2`}
              className="confidence-arc"
            />
            {/* Center text */}
            <text
              x="100"
              y="85"
              textAnchor="middle"
              fontSize="32"
              fontWeight="bold"
              fill={confidence >= 75 ? '#00ff88' : confidence >= 50 ? '#ffd700' : '#ff9500'}
            >
              {confidence}%
            </text>
            <text
              x="100"
              y="105"
              textAnchor="middle"
              fontSize="12"
              fill="rgba(255, 255, 255, 0.6)"
            >
              Confidence
            </text>
          </svg>
        </div>
      </div>

      {/* Source Distribution */}
      <div className="source-distribution">
        <h4>Data Source Distribution</h4>
        <div className="pie-chart-container">
          <canvas
            ref={pieChartRef}
            width={300}
            height={200}
            aria-label="Source distribution pie chart"
          />
        </div>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#00ff88' }}></span>
            <span className="legend-label">Live Data</span>
            <span className="legend-value">{sourceDistribution.live}</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ffd700' }}></span>
            <span className="legend-label">Cached Data</span>
            <span className="legend-value">{sourceDistribution.cached}</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ff9500' }}></span>
            <span className="legend-label">Estimated Data</span>
            <span className="legend-value">{sourceDistribution.estimated}</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ff3b30' }}></span>
            <span className="legend-label">Fallback Data</span>
            <span className="legend-value">{sourceDistribution.fallback}</span>
          </div>
        </div>
      </div>

      {/* Historical Quality Tracking */}
      <div className="historical-tracking">
        <h4>Quality Trend</h4>
        <div className="chart-container">
          <canvas
            ref={chartRef}
            width={600}
            height={300}
            aria-label="Historical quality tracking chart"
          />
        </div>
      </div>

      {/* Infrastructure Type Breakdown */}
      <div className="type-breakdown">
        <h4>Quality by Infrastructure Type</h4>
        <div className="breakdown-grid">
          {Object.entries(qualityData).map(([type, data]) => (
            <div
              key={type}
              className={`breakdown-item ${selectedType === type ? 'selected' : ''}`}
              onClick={() => setSelectedType(type)}
              role="button"
              tabIndex={0}
              aria-label={`View ${type} quality details`}
            >
              <div className="breakdown-header">
                <span className="type-name">{type}</span>
                <span className="type-confidence">{data.confidence}%</span>
              </div>
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill"
                  style={{
                    width: `${data.confidence}%`,
                    backgroundColor: data.confidence >= 75 ? '#00ff88' :
                                   data.confidence >= 50 ? '#ffd700' : '#ff9500'
                  }}
                />
              </div>
              <div className="breakdown-stats">
                <span className="stat-small">
                  {data.liveCount || 0} live
                </span>
                <span className="stat-small">
                  {data.cachedCount || 0} cached
                </span>
                <span className="stat-small">
                  {data.estimatedCount || 0} estimated
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataQualityPanel;
