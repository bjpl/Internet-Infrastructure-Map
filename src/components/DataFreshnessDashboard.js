/**
 * @fileoverview Data Freshness Dashboard Component
 *
 * Displays comprehensive data freshness monitoring including:
 * - Real-time freshness indicators for each infrastructure type
 * - Confidence levels with color-coded visual feedback
 * - Cache statistics and API connection status
 * - Manual and automatic refresh controls
 * - Data quality metrics and historical tracking
 *
 * @requires react
 * @requires ../styles/dataFreshness.css
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/dataFreshness.css';

/**
 * Confidence level thresholds and configurations
 */
const CONFIDENCE_LEVELS = {
  LIVE: { threshold: 95, color: '#00ff88', label: 'Live', icon: '🟢' },
  CACHED: { threshold: 75, color: '#ffd700', label: 'Cached', icon: '🟡' },
  ESTIMATED: { threshold: 50, color: '#ff9500', label: 'Estimated', icon: '🟠' },
  FALLBACK: { threshold: 0, color: '#ff3b30', label: 'Fallback', icon: '🔴' }
};

/**
 * Refresh interval options in milliseconds
 */
const REFRESH_INTERVALS = {
  '1min': 60000,
  '5min': 300000,
  '15min': 900000,
  '30min': 1800000,
  '1hr': 3600000
};

/**
 * Data Freshness Dashboard Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.dataStatus - Current data status for all infrastructure types
 * @param {Function} props.onRefresh - Callback to trigger data refresh
 * @param {Function} props.onSettingsChange - Callback when refresh settings change
 * @returns {React.Component} Data freshness dashboard
 */
const DataFreshnessDashboard = ({
  dataStatus = {},
  onRefresh = () => {},
  onSettingsChange = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5min');
  const [preferAccuracy, setPreferAccuracy] = useState(true);
  const [countdown, setCountdown] = useState(REFRESH_INTERVALS['5min'] / 1000);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Calculate overall data quality score
   *
   * @returns {number} Quality score 0-100
   */
  const calculateQualityScore = useCallback(() => {
    const types = Object.keys(dataStatus);
    if (types.length === 0) return 0;

    const totalConfidence = types.reduce((sum, type) => {
      return sum + (dataStatus[type]?.confidence || 0);
    }, 0);

    return Math.round(totalConfidence / types.length);
  }, [dataStatus]);

  /**
   * Get confidence level configuration based on score
   *
   * @param {number} confidence - Confidence score 0-100
   * @returns {Object} Confidence level config
   */
  const getConfidenceLevel = (confidence) => {
    if (confidence >= CONFIDENCE_LEVELS.LIVE.threshold) return CONFIDENCE_LEVELS.LIVE;
    if (confidence >= CONFIDENCE_LEVELS.CACHED.threshold) return CONFIDENCE_LEVELS.CACHED;
    if (confidence >= CONFIDENCE_LEVELS.ESTIMATED.threshold) return CONFIDENCE_LEVELS.ESTIMATED;
    return CONFIDENCE_LEVELS.FALLBACK;
  };

  /**
   * Format timestamp to relative time
   *
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted relative time
   */
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCountdown(REFRESH_INTERVALS[refreshInterval] / 1000);

    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Handle auto-refresh toggle
   */
  const handleAutoRefreshToggle = () => {
    const newValue = !autoRefresh;
    setAutoRefresh(newValue);
    onSettingsChange({ autoRefresh: newValue, refreshInterval, preferAccuracy });
  };

  /**
   * Handle refresh interval change
   */
  const handleIntervalChange = (interval) => {
    setRefreshInterval(interval);
    setCountdown(REFRESH_INTERVALS[interval] / 1000);
    onSettingsChange({ autoRefresh, refreshInterval: interval, preferAccuracy });
  };

  /**
   * Handle accuracy/speed preference toggle
   */
  const handlePreferenceToggle = () => {
    const newValue = !preferAccuracy;
    setPreferAccuracy(newValue);
    onSettingsChange({ autoRefresh, refreshInterval, preferAccuracy: newValue });
  };

  /**
   * Auto-refresh countdown timer
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh();
          return REFRESH_INTERVALS[refreshInterval] / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval]);

  /**
   * Format countdown display
   */
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const qualityScore = calculateQualityScore();
  const qualityLevel = getConfidenceLevel(qualityScore);

  return (
    <div
      className={`data-freshness-dashboard ${isExpanded ? 'expanded' : 'collapsed'}`}
      role="region"
      aria-label="Data Freshness Dashboard"
    >
      {/* Header Bar */}
      <div className="dashboard-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <span className="quality-indicator" style={{ color: qualityLevel.color }}>
            {qualityLevel.icon}
          </span>
          <h3>Data Quality</h3>
          <span className="quality-score" style={{ color: qualityLevel.color }}>
            {qualityScore}%
          </span>
        </div>
        <div className="header-right">
          {autoRefresh && (
            <span className="countdown" aria-live="polite">
              Next refresh: {formatCountdown()}
            </span>
          )}
          <button
            className="expand-toggle"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse dashboard' : 'Expand dashboard'}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="dashboard-content">
          {/* Control Panel */}
          <div className="control-panel">
            <div className="control-group">
              <button
                className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh data manually"
              >
                <span className="refresh-icon">↻</span>
                {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>

              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={handleAutoRefreshToggle}
                  aria-label="Toggle automatic refresh"
                />
                <span className="toggle-label">Auto-refresh</span>
              </label>
            </div>

            <div className="control-group">
              <label htmlFor="refresh-interval">Interval:</label>
              <select
                id="refresh-interval"
                value={refreshInterval}
                onChange={(e) => handleIntervalChange(e.target.value)}
                disabled={!autoRefresh}
                aria-label="Select refresh interval"
              >
                <option value="1min">1 minute</option>
                <option value="5min">5 minutes</option>
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hr">1 hour</option>
              </select>
            </div>

            <div className="control-group">
              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={preferAccuracy}
                  onChange={handlePreferenceToggle}
                  aria-label="Toggle between accuracy and speed preference"
                />
                <span className="toggle-label">
                  {preferAccuracy ? 'Prefer Accuracy' : 'Prefer Speed'}
                </span>
              </label>
            </div>
          </div>

          {/* Infrastructure Status Grid */}
          <div className="status-grid">
            {Object.entries(dataStatus).map(([type, status]) => {
              const level = getConfidenceLevel(status.confidence || 0);
              return (
                <div key={type} className="status-card">
                  <div className="status-header">
                    <span className="status-icon" style={{ color: level.color }}>
                      {level.icon}
                    </span>
                    <h4>{type}</h4>
                  </div>
                  <div className="status-details">
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value" style={{ color: level.color }}>
                        {level.label}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Confidence:</span>
                      <span className="detail-value">{status.confidence}%</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Update:</span>
                      <span className="detail-value">
                        {formatRelativeTime(status.lastUpdate)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Source:</span>
                      <span className="detail-value">{status.source || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${status.confidence}%`,
                        backgroundColor: level.color
                      }}
                      role="progressbar"
                      aria-valuenow={status.confidence}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`${type} confidence level`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cache Statistics */}
          <div className="cache-stats">
            <h4>Cache Performance</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Hit Rate:</span>
                <span className="stat-value">
                  {dataStatus.cacheHitRate || 0}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active APIs:</span>
                <span className="stat-value">
                  {dataStatus.activeAPIs || 0}/{dataStatus.totalAPIs || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Fallback Count:</span>
                <span className="stat-value">{dataStatus.fallbackCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataFreshnessDashboard;
