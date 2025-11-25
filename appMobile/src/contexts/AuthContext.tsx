/**
 * Authentication Context
 * Manages user authentication state and tokens
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authService } from '../services/auth.service';
import { notificationService } from '../services/notification.service';
import { websocketService } from '../services/websocket.service';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { authEvents } from '../utils/authEvents';
import { User, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<any>;
  googleAuth: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginAfterVerification: (verificationResponse: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  /**
   * Load user and token from storage on app start
   */
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Escuchar eventos de logout forzado (token inválido/expirado)
   */
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      console.log('🔴 [AuthContext] Recibido evento de logout forzado');
      // Limpiar estado sin llamar al servidor (ya que el token es inválido)
      websocketService.disconnect();
      setToken(null);
      setUser(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Handle navigation based on auth state
   */
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inPublicRoute = segments[0] === 'company' || segments[0] === 'catalog'; // Permitir acceso público a páginas de empresa y catálogo

    if (!user && !inAuthGroup && !inPublicRoute) {
      // Redirect to login if not authenticated and not in public route
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to app if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        storage.getItem(STORAGE_KEYS.TOKEN),
        storage.getObject<User>(STORAGE_KEYS.USER),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // IMPORTANTE: Reconectar WebSocket con el token guardado
        console.log('🔄 Reconectando WebSocket con token guardado...');
        websocketService.connect(storedToken);

        // Inicializar notificaciones push
        notificationService.registerForPushNotifications().catch((error) => {
          console.error('Error registering push notifications:', error);
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuth = async (token: string, user: User) => {
    try {
      await Promise.all([
        storage.setItem(STORAGE_KEYS.TOKEN, token),
        storage.setObject(STORAGE_KEYS.USER, user),
      ]);
      setToken(token);
      setUser(user);

      // Inicializar notificaciones push
      notificationService.registerForPushNotifications().catch((error) => {
        console.error('Error registering push notifications:', error);
      });

      // Conectar WebSocket
      websocketService.connect(token);
    } catch (error) {
      console.error('Error saving auth:', error);
      throw error;
    }
  };

  const clearAuth = async () => {
    try {
      // Desconectar WebSocket
      websocketService.disconnect();

      await Promise.all([
        storage.removeItem(STORAGE_KEYS.TOKEN),
        storage.removeItem(STORAGE_KEYS.USER),
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      await saveAuth(response.accessToken, response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);

      // Si la respuesta incluye accessToken, el usuario se registró y autenticó automáticamente
      // (por ejemplo, con Google)
      if (response.accessToken && response.user) {
        await saveAuth(response.accessToken, response.user);
      }
      // Si no tiene accessToken, significa que requiere verificación por email
      // El componente manejará el flujo de verificación

      // Devolver la respuesta completa para que el componente pueda manejar la verificación
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }, []);

  const googleAuth = useCallback(async (idToken: string) => {
    console.log('🔵 [AuthContext] Iniciando Google Auth');
    try {
      const response = await authService.googleAuth(idToken);
      console.log('✅ [AuthContext] Auth exitoso, guardando tokens');
      await saveAuth(response.accessToken, response.user);
      console.log('✅ [AuthContext] Tokens guardados correctamente');
    } catch (error) {
      console.error('❌ [AuthContext] Error en Google Auth:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuth();
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
      await storage.setObject(STORAGE_KEYS.USER, updatedUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If profile fetch fails, user might be logged out
      await clearAuth();
    }
  }, []);

  const loginAfterVerification = useCallback(async (verificationResponse: any) => {
    try {
      // La respuesta de verificación debe contener accessToken y user
      if (verificationResponse.accessToken && verificationResponse.user) {
        await saveAuth(verificationResponse.accessToken, verificationResponse.user);
      } else {
        throw new Error('Respuesta de verificación inválida');
      }
    } catch (error) {
      console.error('Error en auto-login después de verificación:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleAuth,
        logout,
        refreshUser,
        loginAfterVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
