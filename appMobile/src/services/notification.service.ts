/**
 * Notification Service
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/axios.config';
import { Notification } from '../types/notification';
import { STORAGE_KEYS } from '../utils/constants';

// Configurar comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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

  /**
   * Registrar el dispositivo para notificaciones push con Expo
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Solo funciona en dispositivos físicos
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Pedir permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return null;
      }

      // Obtener token de Expo
      // NOTA: Comentado temporalmente - requiere configurar projectId en app.json
      // Para habilitar, configura "extra.eas.projectId" en app.json
      // const token = await Notifications.getExpoPushTokenAsync({
      //   projectId: 'your-project-id',
      // });

      // Por ahora, retornar null para no bloquear la app
      console.log('⚠️ Push notifications deshabilitadas - requiere configurar Expo projectId');
      return null;

      /* CÓDIGO ORIGINAL (descomentar cuando configures projectId):
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id',
      });

      // Configurar canal para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Guardar token localmente
      await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token.data);

      // Enviar token al backend
      await this.registerDeviceToken(token.data);

      return token.data;
      */
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  },

  /**
   * Agregar listener para notificaciones recibidas (cuando la app está abierta)
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Agregar listener para cuando el usuario toca una notificación
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Obtener badge count actual
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  },

  /**
   * Actualizar badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  },

  /**
   * Limpiar badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  },

  /**
   * Mostrar notificación local (para testing)
   */
  async showLocalNotification(title: string, body: string, data?: any): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Mostrar inmediatamente
    });
  },

  /**
   * Cancelar todas las notificaciones programadas
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
