import { API_URL } from '../utils/constants';
import { storage } from '../utils/storage';
import type {
  UserPreferences,
  UpdatePreferencesDto,
  NotificationPreferences,
  PrivacyPreferences,
} from '../types/preferences';

const getAuthHeaders = async () => {
  const token = await storage.getItem('@vitrina_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

class PreferencesService {
  async getPreferences(): Promise<UserPreferences> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/preferencias-cliente`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Error al obtener preferencias');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  }

  async updatePreferences(
    preferences: UpdatePreferencesDto,
  ): Promise<UserPreferences> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/preferencias-cliente`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar preferencias');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  async toggleTheme(): Promise<UserPreferences> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/preferencias-cliente/tema`, {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) {
        throw new Error('Error al cambiar tema');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error toggling theme:', error);
      throw error;
    }
  }

  async updateNotifications(
    notifications: NotificationPreferences,
  ): Promise<UserPreferences> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_URL}/preferencias-cliente/notificaciones`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(notifications),
        },
      );

      if (!response.ok) {
        throw new Error('Error al actualizar notificaciones');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }

  async updatePrivacy(
    privacy: PrivacyPreferences,
  ): Promise<UserPreferences> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_URL}/preferencias-cliente/privacidad`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(privacy),
        },
      );

      if (!response.ok) {
        throw new Error('Error al actualizar privacidad');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating privacy:', error);
      throw error;
    }
  }
}

export const preferencesService = new PreferencesService();
