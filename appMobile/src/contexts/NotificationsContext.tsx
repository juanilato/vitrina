/**
 * Notifications Context
 * Manages notifications state, WebSocket updates, and popup display
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { notificationService } from '../services/notification.service';
import { websocketService } from '../services/websocket.service';
import { Notification } from '../types/notification';
import { useAuth } from './AuthContext';

interface NotificationsContextData {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  showPopup: boolean;
  currentPopupNotification: Notification | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  dismissPopup: () => void;
}

const NotificationsContext = createContext<NotificationsContextData>(
  {} as NotificationsContextData
);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopupNotification, setCurrentPopupNotification] = useState<Notification | null>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, leida: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, leida: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      // Recalcular unread count
      const wasUnread = notifications.find(n => n.id === notificationId && !n.leida);
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  /**
   * Show popup notification
   */
  const showNotificationPopup = useCallback((notification: Notification) => {
    // Clear existing timeout
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }

    setCurrentPopupNotification(notification);
    setShowPopup(true);

    // Auto-dismiss after 5 seconds
    popupTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
      setCurrentPopupNotification(null);
    }, 5000);
  }, []);

  /**
   * Dismiss popup manually
   */
  const dismissPopup = useCallback(() => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    setShowPopup(false);
    setCurrentPopupNotification(null);
  }, []);

  /**
   * Load notifications on mount
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  /**
   * Listen to WebSocket notifications
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewNotification = (notification: any) => {
      console.log('🔔 New notification received:', notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Update unread count
      if (!notification.leida) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show popup
      showNotificationPopup(notification);
    };

    const handleNotificationCountUpdate = (data: { count: number }) => {
      console.log('🔔 Notification count updated:', data.count);
      setUnreadCount(data.count);
    };

    // Subscribe to WebSocket events
    websocketService.on('new-notification', handleNewNotification);
    websocketService.on('notification-count-update', handleNotificationCountUpdate);

    // Cleanup
    return () => {
      websocketService.off('new-notification', handleNewNotification);
      websocketService.off('notification-count-update', handleNotificationCountUpdate);
    };
  }, [isAuthenticated, showNotificationPopup]);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        showPopup,
        currentPopupNotification,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        dismissPopup,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
