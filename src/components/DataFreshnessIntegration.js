/**
 * @fileoverview Data Freshness Integration Example
 *
 * Demonstrates how to integrate the data freshness system with your application:
 * - Setting up the complete freshness monitoring system
 * - Managing data status updates
 * - Handling refresh operations
 * - Displaying quality metrics
 * - Notification management
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

/**
 * Example integration component showing how to use the data freshness system
 *
 * @returns {React.Component} Integrated data freshness system
 */
const DataFreshnessIntegration = () => {
  const notifications = useNotifications();

  // Data status for each infrastructure type
  const [dataStatus, setDataStatus] = useState({
    cables: {
      confidence: 85,
      lastUpdate: Date.now() - 300000, // 5 minutes ago
      source: 'TeleGeography API',
      cacheHitRate: 78,
      activeAPIs: 2,
      totalAPIs: 3,
      fallbackCount: 1
    },
    dataCenters: {
      confidence: 95,
      lastUpdate: Date.now() - 120000, // 2 minutes ago
      source: 'Data Center Map API',
      cacheHitRate: 92,
      activeAPIs: 3,
      totalAPIs: 3,
      fallbackCount: 0
    },
    ixps: {
      confidence: 70,
      lastUpdate: Date.now() - 900000, // 15 minutes ago
      source: 'PeeringDB (Cached)',
      cacheHitRate: 65,
      activeAPIs: 1,
      totalAPIs: 2,
      fallbackCount: 1
    },
    bgp: {
      confidence: 60,
      lastUpdate: Date.now() - 1800000, // 30 minutes ago
      source: 'RIPEstat (Estimated)',
      cacheHitRate: 45,
      activeAPIs: 1,
      totalAPIs: 2,
      fallbackCount: 1
    }
  });

  // Historical quality data
  const [historicalData, setHistoricalData] = useState([]);

  // Source distribution
  const [sourceDistribution, setSourceDistribution] = useState({
    live: 45,
    cached: 35,
    estimated: 15,
    fallback: 5
  });

  // Quality data by type
  const [qualityData, setQualityData] = useState({
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
  });

  /**
   * Generate historical data points
   */
  useEffect(() => {
    const generateHistory = () => {
      const now = Date.now();
      const points = [];

      for (let i = 60; i >= 0; i--) {
        points.push({
          timestamp: now - (i * 60000), // One point per minute
          quality: 70 + Math.random() * 25 // Random between 70-95
        });
      }

      setHistoricalData(points);
    };

    generateHistory();

    // Update historical data every minute
    const interval = setInterval(() => {
      setHistoricalData(prev => {
        const newPoint = {
          timestamp: Date.now(),
          quality: 70 + Math.random() * 25
        };
        return [...prev.slice(1), newPoint];
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle data refresh
   */
  const handleRefresh = useCallback(async () => {
    notifications.info('Refreshing data from all sources...');

    try {
      // Simulate API calls with random delays
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Update data status with fresh data
      const newDataStatus = {};
      Object.keys(dataStatus).forEach(type => {
        const confidence = 75 + Math.random() * 25;
        newDataStatus[type] = {
          ...dataStatus[type],
          confidence: Math.round(confidence),
          lastUpdate: Date.now(),
          cacheHitRate: Math.round(60 + Math.random() * 40)
        };
      });

      setDataStatus(newDataStatus);

      // Update source distribution
      setSourceDistribution({
        live: Math.round(40 + Math.random() * 20),
        cached: Math.round(30 + Math.random() * 20),
        estimated: Math.round(10 + Math.random() * 15),
        fallback: Math.round(0 + Math.random() * 10)
      });

      notifications.success('Data refreshed successfully from all sources');
    } catch (error) {
      notifications.error('Failed to refresh data: ' + error.message);
    }
  }, [dataStatus, notifications]);

  /**
   * Handle refresh settings change
   */
  const handleSettingsChange = useCallback((settings) => {
    console.log('Refresh settings updated:', settings);

    if (settings.preferAccuracy) {
      notifications.info('Prioritizing data accuracy over speed');
    } else {
      notifications.info('Prioritizing speed over accuracy');
    }
  }, [notifications]);

  /**
   * Simulate API rate limit warning
   */
  useEffect(() => {
    const warnAboutRateLimit = () => {
      const random = Math.random();
      if (random < 0.1) { // 10% chance
        notifications.warning('Approaching API rate limit for TeleGeography (80% used)');
      }
    };

    const interval = setInterval(warnAboutRateLimit, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [notifications]);

  /**
   * Simulate fallback to estimated data
   */
  useEffect(() => {
    const checkFallbacks = () => {
      const random = Math.random();
      if (random < 0.05) { // 5% chance
        notifications.warning('BGP data API unavailable, using estimated data');

        setDataStatus(prev => ({
          ...prev,
          bgp: {
            ...prev.bgp,
            confidence: 50,
            source: 'Estimated (API unavailable)',
            fallbackCount: prev.bgp.fallbackCount + 1
          }
        }));
      }
    };

    const interval = setInterval(checkFallbacks, 180000); // Check every 3 minutes
    return () => clearInterval(interval);
  }, [notifications]);

  return (
    <div className="data-freshness-integration">
      {/* Notification System - Always include at the root */}
      <NotificationSystem maxNotifications={5} />

      {/* Data Freshness Dashboard - Top right corner */}
      <DataFreshnessDashboard
        dataStatus={dataStatus}
        onRefresh={handleRefresh}
        onSettingsChange={handleSettingsChange}
      />

      {/* Example: Data Quality Panel - Can be shown in a modal or separate panel */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        maxWidth: '600px',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        <DataQualityPanel
          qualityData={qualityData}
          historicalData={historicalData}
          sourceDistribution={sourceDistribution}
        />
      </div>

      {/* Example: Freshness Indicators on map elements */}
      <div style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h4 style={{ padding: '10px', margin: 0 }}>Example Map Element</h4>

        {/* Live data cable */}
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

        {/* Cached data center */}
        <DataFreshnessIndicator
          dataSource="cached"
          lastUpdate={Date.now() - 300000}
          confidence={80}
          isRefreshing={false}
          position="bottom-left"
          elementType="Data Center"
          additionalInfo={{
            source: 'Data Center Map',
            cacheAge: '5 minutes'
          }}
        />

        {/* Estimated IXP */}
        <DataFreshnessIndicator
          dataSource="estimated"
          lastUpdate={Date.now() - 900000}
          confidence={65}
          isRefreshing={false}
          position="bottom-right"
          elementType="IXP"
          additionalInfo={{
            source: 'PeeringDB (Estimated)',
            cacheAge: '15 minutes'
          }}
        />
      </div>
    </div>
  );
};

export default DataFreshnessIntegration;
