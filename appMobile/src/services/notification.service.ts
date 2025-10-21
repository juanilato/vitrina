/**
 * Notification Service
 */

import api from '../config/axios.config';
import { Notification } from '../types/notification';

export const notificationService = {
  /**
   * Get all notifications
   */
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>(
      '/notifications/unread-count'
    );
    return response.data.count;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/mark-all-read');
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  /**
   * Register FCM device token
   */
  async registerDeviceToken(token: string): Promise<void> {
    await api.post('/notifications/register-device', {
      fcmToken: token,
      platform: 'mobile',
    });
  },

  /**
   * Unregister FCM device token
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    await api.post('/notifications/unregister-device', {
      fcmToken: token,
    });
  },
};
