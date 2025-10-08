/**
 * @fileoverview Data Freshness Indicator Component
 *
 * Visual indicator overlays for map elements showing data source and freshness:
 * - Small icons showing data source (live/cached/estimated/fallback)
 * - Tooltips with detailed freshness information
 * - Color-coded visual feedback
 * - Pulsing animations for active refreshes
 * - Glow effects for live data
 *
 * @requires react
 * @requires ../styles/dataFreshness.css
 */

import React, { useState, useEffect } from 'react';
import '../styles/dataFreshness.css';

/**
 * Data source types and their visual properties
 */
const DATA_SOURCES = {
  live: {
    icon: '●',
    color: '#00ff88',
    label: 'Live Data',
    glow: true
  },
  cached: {
    icon: '◐',
    color: '#ffd700',
    label: 'Cached Data',
    glow: false
  },
  estimated: {
    icon: '◯',
    color: '#ff9500',
    label: 'Estimated Data',
    glow: false
  },
  fallback: {
    icon: '◌',
    color: '#ff3b30',
    label: 'Fallback Data',
    glow: false
  }
};

/**
 * Data Freshness Indicator Component
 *
 * @param {Object} props - Component props
 * @param {string} props.dataSource - Source type (live/cached/estimated/fallback)
 * @param {number} props.lastUpdate - Timestamp of last update
 * @param {number} props.confidence - Confidence level 0-100
 * @param {boolean} props.isRefreshing - Whether data is currently refreshing
 * @param {string} props.position - Position of indicator (top-left/top-right/bottom-left/bottom-right)
 * @param {string} props.elementType - Type of element this indicator is for
 * @param {Object} props.additionalInfo - Additional information to show in tooltip
 * @returns {React.Component} Freshness indicator overlay
 */
const DataFreshnessIndicator = ({
  dataSource = 'cached',
  lastUpdate = null,
  confidence = 0,
  isRefreshing = false,
  position = 'top-right',
  elementType = 'Unknown',
  additionalInfo = {}
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  /**
   * Format timestamp to readable relative time
   *
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted relative time
   */
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never updated';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Updated ${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `Updated ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (seconds > 5) return `Updated ${seconds} seconds ago`;
    return 'Just updated';
  };

  /**
   * Handle mouse enter for tooltip
   */
  const handleMouseEnter = (e) => {
    setShowTooltip(true);
    updateTooltipPosition(e);
  };

  /**
   * Handle mouse leave for tooltip
   */
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  /**
   * Update tooltip position based on mouse position
   */
  const updateTooltipPosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const source = DATA_SOURCES[dataSource] || DATA_SOURCES.cached;

  return (
    <>
      <div
        className={`freshness-indicator ${position} ${isRefreshing ? 'refreshing' : ''} ${source.glow ? 'glowing' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={updateTooltipPosition}
        role="status"
        aria-label={`${elementType} data status: ${source.label}`}
        style={{ color: source.color }}
      >
        <span className="indicator-icon">{source.icon}</span>
        {isRefreshing && <span className="refresh-pulse">↻</span>}
      </div>

      {showTooltip && (
        <div
          className="freshness-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          role="tooltip"
        >
          <div className="tooltip-header">
            <span className="tooltip-icon" style={{ color: source.color }}>
              {source.icon}
            </span>
            <strong>{elementType}</strong>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="tooltip-label">Status:</span>
              <span className="tooltip-value" style={{ color: source.color }}>
                {source.label}
              </span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Confidence:</span>
              <span className="tooltip-value">{confidence}%</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Last Update:</span>
              <span className="tooltip-value">{formatLastUpdate(lastUpdate)}</span>
            </div>
            {additionalInfo.source && (
              <div className="tooltip-row">
                <span className="tooltip-label">Source:</span>
                <span className="tooltip-value">{additionalInfo.source}</span>
              </div>
            )}
            {additionalInfo.cacheAge && (
              <div className="tooltip-row">
                <span className="tooltip-label">Cache Age:</span>
                <span className="tooltip-value">{additionalInfo.cacheAge}</span>
              </div>
            )}
          </div>
          {isRefreshing && (
            <div className="tooltip-footer">
              <span className="refreshing-text">Refreshing data...</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DataFreshnessIndicator;
