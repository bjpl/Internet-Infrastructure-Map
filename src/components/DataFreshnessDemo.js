/**
 * @fileoverview Data Freshness System Demo
 *
 * Interactive demonstration of the complete data freshness monitoring system.
 * Shows all features, animations, and interactions in a standalone component.
 *
 * This demo can be used for:
 * - Testing the system functionality
 * - Visual verification of all features
 * - Documentation and training
 * - Development and debugging
 *
 * @requires react
 * @requires ./DataFreshnessDashboard
 * @requires ./DataQualityPanel
 * @requires ./DataFreshnessIndicator
 * @requires ./NotificationSystem
 */

import React, { useState, useEffect, useCallback } from 'react';
import DataFreshnessDashboard from './DataFreshnessDashboard';
import DataQualityPanel from './DataQualityPanel';
import DataFreshnessIndicator from './DataFreshnessIndicator';
import NotificationSystem, { useNotifications } from './NotificationSystem';
import '../styles/dataFreshness.css';

/**
 * Data Freshness System Demo Component
 *
 * @returns {React.Component} Interactive demo
 */
const DataFreshnessDemo = () => {
  const notifications = useNotifications();

  // State management
  const [dataStatus, setDataStatus] = useState(getInitialDataStatus());
  const [qualityData, setQualityData] = useState(getInitialQualityData());
  const [historicalData, setHistoricalData] = useState([]);
  const [sourceDistribution, setSourceDistribution] = useState({
    live: 45,
    cached: 35,
    estimated: 15,
    fallback: 5
  });
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [mapElements, setMapElements] = useState(getInitialMapElements());

  /**
   * Get initial data status
   */
  function getInitialDataStatus() {
    return {
      cables: {
        confidence: 85,
        lastUpdate: Date.now() - 300000,
        source: 'TeleGeography API',
        cacheHitRate: 78,
        activeAPIs: 2,
        totalAPIs: 3,
        fallbackCount: 1
      },
      dataCenters: {
        confidence: 95,
        lastUpdate: Date.now() - 120000,
        source: 'Data Center Map API',
        cacheHitRate: 92,
        activeAPIs: 3,
        totalAPIs: 3,
        fallbackCount: 0
      },
      ixps: {
        confidence: 70,
        lastUpdate: Date.now() - 900000,
        source: 'PeeringDB (Cached)',
        cacheHitRate: 65,
        activeAPIs: 1,
        totalAPIs: 2,
        fallbackCount: 1
      },
      bgp: {
        confidence: 60,
        lastUpdate: Date.now() - 1800000,
        source: 'RIPEstat (Estimated)',
        cacheHitRate: 45,
        activeAPIs: 1,
        totalAPIs: 2,
        fallbackCount: 1
      }
    };
  }

  /**
   * Get initial quality data
   */
  function getInitialQualityData() {
    return {
      cables: {
        confidence: 85,
        liveCount: 150,
        cachedCount: 80,
        estimatedCount: 20
      },
      dataCenters: {
        confidence: 95,
        liveCount: 200,
        cachedCount: 50,
        estimatedCount: 10
      },
      ixps: {
        confidence: 70,
        liveCount: 80,
        cachedCount: 100,
        estimatedCount: 30
      },
      bgp: {
        confidence: 60,
        liveCount: 50,
        cachedCount: 120,
        estimatedCount: 80
      }
    };
  }

  /**
   * Get initial map elements
   */
  function getInitialMapElements() {
    return [
      {
        id: 'cable-1',
        type: 'Submarine Cable',
        name: 'TAT-14',
        dataSource: 'live',
        confidence: 95,
        lastUpdate: Date.now() - 60000,
        position: { top: '20%', left: '20%' }
      },
      {
        id: 'dc-1',
        type: 'Data Center',
        name: 'Equinix NY5',
        dataSource: 'cached',
        confidence: 85,
        lastUpdate: Date.now() - 300000,
        position: { top: '20%', right: '20%' }
      },
      {
        id: 'ixp-1',
        type: 'IXP',
        name: 'DE-CIX Frankfurt',
        dataSource: 'estimated',
        confidence: 65,
        lastUpdate: Date.now() - 900000,
        position: { bottom: '20%', left: '20%' }
      },
      {
        id: 'bgp-1',
        type: 'BGP Route',
        name: 'AS15169',
        dataSource: 'fallback',
        confidence: 50,
        lastUpdate: Date.now() - 1800000,
        position: { bottom: '20%', right: '20%' }
      }
    ];
  }

  /**
   * Generate historical data
   */
  useEffect(() => {
    const points = [];
    const now = Date.now();

    for (let i = 60; i >= 0; i--) {
      points.push({
        timestamp: now - (i * 60000),
        quality: 70 + Math.random() * 25
      });
    }

    setHistoricalData(points);
  }, []);

  /**
   * Simulate real-time data updates
   */
  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      // Update historical data
      setHistoricalData(prev => {
        const newPoint = {
          timestamp: Date.now(),
          quality: 70 + Math.random() * 25
        };
        return [...prev.slice(1), newPoint];
      });

      // Randomly update confidence levels
      setDataStatus(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(type => {
          const change = (Math.random() - 0.5) * 10;
          updated[type] = {
            ...updated[type],
            confidence: Math.max(50, Math.min(100, updated[type].confidence + change))
          };
        });
        return updated;
      });

      // Update source distribution
      setSourceDistribution({
        live: Math.round(40 + Math.random() * 20),
        cached: Math.round(30 + Math.random() * 20),
        estimated: Math.round(10 + Math.random() * 15),
        fallback: Math.round(0 + Math.random() * 10)
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [simulationRunning]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(async () => {
    notifications.info('Refreshing data from all sources...');

    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update all data
    const newDataStatus = {};
    Object.keys(dataStatus).forEach(type => {
      newDataStatus[type] = {
        ...dataStatus[type],
        confidence: Math.round(80 + Math.random() * 20),
        lastUpdate: Date.now(),
        cacheHitRate: Math.round(70 + Math.random() * 30)
      };
    });

    setDataStatus(newDataStatus);

    // Update map elements
    setMapElements(prev => prev.map(element => ({
      ...element,
      confidence: Math.round(80 + Math.random() * 20),
      lastUpdate: Date.now()
    })));

    notifications.success('All data refreshed successfully!');
  }, [dataStatus, notifications]);

  /**
   * Handle settings change
   */
  const handleSettingsChange = useCallback((settings) => {
    console.log('Settings changed:', settings);

    if (settings.preferAccuracy) {
      notifications.info('Prioritizing data accuracy');
    } else {
      notifications.info('Prioritizing speed');
    }
  }, [notifications]);

  /**
   * Demo control functions
   */
  const triggerSuccessNotification = () => {
    notifications.success('Data successfully loaded from API');
  };

  const triggerWarningNotification = () => {
    notifications.warning('API rate limit at 80% - consider caching');
  };

  const triggerErrorNotification = () => {
    notifications.error('Failed to connect to BGP data source');
  };

  const triggerInfoNotification = () => {
    notifications.info('Cache updated with fresh data');
  };

  const degradeDataQuality = () => {
    setDataStatus(prev => {
      const updated = {};
      Object.keys(prev).forEach(type => {
        updated[type] = {
          ...prev[type],
          confidence: Math.max(50, prev[type].confidence - 20),
          fallbackCount: prev[type].fallbackCount + 1
        };
      });
      return updated;
    });

    notifications.warning('Some data sources unavailable, using fallbacks');
  };

  const improveDataQuality = () => {
    setDataStatus(prev => {
      const updated = {};
      Object.keys(prev).forEach(type => {
        updated[type] = {
          ...prev[type],
          confidence: Math.min(100, prev[type].confidence + 20),
          lastUpdate: Date.now()
        };
      });
      return updated;
    });

    notifications.success('All data sources restored to optimal state');
  };

  return (
    <div className="data-freshness-demo" style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: 'white',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Notification System */}
      <NotificationSystem maxNotifications={5} />

      {/* Data Freshness Dashboard */}
      <DataFreshnessDashboard
        dataStatus={dataStatus}
        onRefresh={handleRefresh}
        onSettingsChange={handleSettingsChange}
      />

      {/* Demo Controls */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(26, 26, 26, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '300px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Demo Controls</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setSimulationRunning(!simulationRunning)}
            style={{
              padding: '10px',
              background: simulationRunning ? '#ff3b30' : '#00ff88',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {simulationRunning ? '⏸ Pause Simulation' : '▶ Start Simulation'}
          </button>

          <div style={{ margin: '8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            Notifications:
          </div>

          <button onClick={triggerSuccessNotification} style={demoButtonStyle}>
            Show Success
          </button>
          <button onClick={triggerWarningNotification} style={demoButtonStyle}>
            Show Warning
          </button>
          <button onClick={triggerErrorNotification} style={demoButtonStyle}>
            Show Error
          </button>
          <button onClick={triggerInfoNotification} style={demoButtonStyle}>
            Show Info
          </button>

          <div style={{ margin: '8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            Data Quality:
          </div>

          <button onClick={degradeDataQuality} style={demoButtonStyle}>
            Degrade Quality
          </button>
          <button onClick={improveDataQuality} style={demoButtonStyle}>
            Improve Quality
          </button>
        </div>
      </div>

      {/* Map Elements Simulation */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '400px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', background: 'rgba(26, 26, 26, 0.9)' }}>
          <h4 style={{ margin: 0, fontSize: '14px' }}>
            Map Elements with Freshness Indicators
          </h4>
        </div>

        {mapElements.map(element => (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              ...element.position,
              width: '120px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '12px'
            }}
          >
            <div style={{ fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>
              {element.name}
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)' }}>
              {element.type}
            </div>

            <DataFreshnessIndicator
              dataSource={element.dataSource}
              lastUpdate={element.lastUpdate}
              confidence={element.confidence}
              isRefreshing={simulationRunning}
              position="top-right"
              elementType={element.type}
              additionalInfo={{
                source: dataStatus[Object.keys(dataStatus)[mapElements.indexOf(element)]]?.source,
                cacheAge: formatCacheAge(element.lastUpdate)
              }}
            />
          </div>
        ))}
      </div>

      {/* Data Quality Panel */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '640px',
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
        <DataQualityPanel
          qualityData={qualityData}
          historicalData={historicalData}
          sourceDistribution={sourceDistribution}
        />
      </div>
    </div>
  );
};

/**
 * Format cache age
 */
function formatCacheAge(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes === 0) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h`;
}

/**
 * Demo button style
 */
const demoButtonStyle = {
  padding: '8px 12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

export default DataFreshnessDemo;
