/**
 * @fileoverview Notification System Component
 *
 * Toast notification system for data freshness events:
 * - Success notifications for fresh data loaded
 * - Warning notifications for fallback data
 * - Alert notifications for API rate limits
 * - Info notifications for data updates
 * - Auto-dismissing with configurable duration
 * - Stack management for multiple notifications
 * - Accessible with ARIA live regions
 *
 * @requires react
 * @requires ../styles/dataFreshness.css
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/dataFreshness.css';

/**
 * Notification types and their configurations
 */
const NOTIFICATION_TYPES = {
  success: {
    icon: '✓',
    color: '#00ff88',
    duration: 4000
  },
  warning: {
    icon: '⚠',
    color: '#ffd700',
    duration: 6000
  },
  error: {
    icon: '✕',
    color: '#ff3b30',
    duration: 8000
  },
  info: {
    icon: 'ℹ',
    color: '#0a84ff',
    duration: 5000
  }
};

/**
 * Notification System Component
 *
 * @param {Object} props - Component props
 * @param {number} props.maxNotifications - Maximum notifications to show at once
 * @returns {React.Component} Notification system
 */
const NotificationSystem = ({ maxNotifications = 5 }) => {
  const [notifications, setNotifications] = useState([]);
  const [nextId, setNextId] = useState(0);

  /**
   * Add a new notification
   *
   * @param {string} type - Notification type (success/warning/error/info)
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   * @param {number} options.duration - Custom duration in ms
   * @param {boolean} options.persistent - Don't auto-dismiss
   */
  const addNotification = useCallback((type, message, options = {}) => {
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
    const id = nextId;

    const notification = {
      id,
      type,
      message,
      icon: config.icon,
      color: config.color,
      duration: options.duration || config.duration,
      persistent: options.persistent || false,
      timestamp: Date.now()
    };

    setNotifications(prev => {
      const updated = [...prev, notification];
      // Keep only the most recent notifications
      return updated.slice(-maxNotifications);
    });

    setNextId(id + 1);

    // Auto-dismiss if not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, [nextId, maxNotifications]);

  /**
   * Remove a notification
   *
   * @param {number} id - Notification ID
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Expose methods globally for external use
  useEffect(() => {
    window.notificationSystem = {
      success: (message, options) => addNotification('success', message, options),
      warning: (message, options) => addNotification('warning', message, options),
      error: (message, options) => addNotification('error', message, options),
      info: (message, options) => addNotification('info', message, options),
      clear: clearAll
    };

    return () => {
      delete window.notificationSystem;
    };
  }, [addNotification, clearAll]);

  return (
    <div
      className="notification-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map((notification, index) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          index={index}
        />
      ))}
    </div>
  );
};

/**
 * Individual Notification Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.notification - Notification data
 * @param {Function} props.onClose - Close callback
 * @param {number} props.index - Index in notification stack
 * @returns {React.Component} Individual notification
 */
const Notification = ({ notification, onClose, index }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  /**
   * Handle close animation
   */
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  /**
   * Update progress bar
   */
  useEffect(() => {
    if (notification.persistent) return;

    const startTime = notification.timestamp;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, notification.duration - elapsed);
      const percentage = (remaining / notification.duration) * 100;
      setProgress(percentage);

      if (percentage === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [notification]);

  return (
    <div
      className={`notification notification-${notification.type} ${isExiting ? 'exiting' : ''}`}
      style={{
        '--notification-index': index,
        '--notification-color': notification.color
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="notification-content">
        <span className="notification-icon" style={{ color: notification.color }}>
          {notification.icon}
        </span>
        <span className="notification-message">{notification.message}</span>
        <button
          className="notification-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      {!notification.persistent && (
        <div className="notification-progress">
          <div
            className="notification-progress-bar"
            style={{
              width: `${progress}%`,
              backgroundColor: notification.color
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Hook for using the notification system
 *
 * @returns {Object} Notification methods
 */
export const useNotifications = () => {
  return {
    success: (message, options) => {
      if (window.notificationSystem) {
        window.notificationSystem.success(message, options);
      }
    },
    warning: (message, options) => {
      if (window.notificationSystem) {
        window.notificationSystem.warning(message, options);
      }
    },
    error: (message, options) => {
      if (window.notificationSystem) {
        window.notificationSystem.error(message, options);
      }
    },
    info: (message, options) => {
      if (window.notificationSystem) {
        window.notificationSystem.info(message, options);
      }
    },
    clear: () => {
      if (window.notificationSystem) {
        window.notificationSystem.clear();
      }
    }
  };
};

export default NotificationSystem;
