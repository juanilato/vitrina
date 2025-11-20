import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { preferencesService } from '../services/preferences.service';
import { storage } from '../utils/storage';
import type {
  UserPreferences,
  UpdatePreferencesDto,
  NotificationPreferences,
  PrivacyPreferences,
} from '../types/preferences';
import { useAuth } from './AuthContext';

interface PreferencesContextType {
  preferences: UserPreferences | null;
  theme: 'light' | 'dark';
  loading: boolean;
  error: string | null;
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: UpdatePreferencesDto) => Promise<void>;
  toggleTheme: () => Promise<void>;
  updateNotifications: (notifications: NotificationPreferences) => Promise<void>;
  updatePrivacy: (privacy: PrivacyPreferences) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

const STORAGE_KEY = '@vitrina_preferences';

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const theme: 'light' | 'dark' = preferences?.temaOscuro ? 'dark' : 'light';

  const saveToStorage = useCallback(async (prefs: UserPreferences) => {
    try {
      await storage.setObject(STORAGE_KEY, prefs);
    } catch (error) {
      console.error('Error saving preferences to storage:', error);
    }
  }, []);

  const loadFromStorage = useCallback(async () => {
    try {
      const stored = await storage.getObject<UserPreferences>(STORAGE_KEY);
      if (stored) {
        setPreferences(stored);
      }
    } catch (error) {
      console.error('Error loading preferences from storage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const prefs = await preferencesService.getPreferences();
      setPreferences(prefs);
      await saveToStorage(prefs);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar preferencias';
      setError(errorMessage);
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [user, saveToStorage]);

  // Cargar preferencias desde AsyncStorage al iniciar
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Cargar preferencias desde backend cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user, loadPreferences]);

  const updatePreferences = async (updates: UpdatePreferencesDto) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await preferencesService.updatePreferences(updates);
      setPreferences(updated);
      await saveToStorage(updated);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al actualizar preferencias';
      setError(errorMessage);
      console.error('Error updating preferences:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await preferencesService.toggleTheme();
      setPreferences(updated);
      await saveToStorage(updated);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cambiar tema';
      setError(errorMessage);
      console.error('Error toggling theme:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = async (notifications: NotificationPreferences) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);
      const updated =
        await preferencesService.updateNotifications(notifications);
      setPreferences(updated);
      await saveToStorage(updated);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al actualizar notificaciones';
      setError(errorMessage);
      console.error('Error updating notifications:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacy = async (privacy: PrivacyPreferences) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await preferencesService.updatePrivacy(privacy);
      setPreferences(updated);
      await saveToStorage(updated);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar privacidad';
      setError(errorMessage);
      console.error('Error updating privacy:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        theme,
        loading,
        error,
        loadPreferences,
        updatePreferences,
        toggleTheme,
        updateNotifications,
        updatePrivacy,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error(
      'usePreferences debe ser usado dentro de un PreferencesProvider',
    );
  }
  return context;
};
