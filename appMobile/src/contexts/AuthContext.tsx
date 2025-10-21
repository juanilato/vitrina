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
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { User, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
   * Handle navigation based on auth state
   */
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
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
    } catch (error) {
      console.error('Error saving auth:', error);
      throw error;
    }
  };

  const clearAuth = async () => {
    try {
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
      await saveAuth(response.accessToken, response.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }, []);

  const googleLogin = useCallback(async (idToken: string) => {
    try {
      const response = await authService.googleLogin(idToken);
      await saveAuth(response.accessToken, response.user);
    } catch (error) {
      console.error('Google login error:', error);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
