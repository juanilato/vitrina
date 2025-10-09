import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../config/axios.config';
import { logTokenInfo, startTokenMonitoring } from '../utils/tokenMonitor';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'cliente' | 'empresa';
  logo?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  debugToken: () => void;
  googleLogin: (idToken: string) => Promise<void>;
  googleRegister: (idToken: string, type: 'cliente' | 'empresa') => Promise<void>; // 👉 NUEVO
}

interface RegisterData {
  email: string;
  name: string;
  password: string;
  type: 'cliente' | 'empresa';
  logo?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveToken = (token?: string) => {
    if (!token) return;
    localStorage.setItem('token', token);
    logTokenInfo();
  };

  const restoreUserFromToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await axiosInstance.get('/auth/profile');
      if (response.data?.user) return response.data.user as User;
    } catch {
      localStorage.removeItem('token');
    }
    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          logTokenInfo();
          const restoredUser = await restoreUserFromToken();
          if (restoredUser) setUser(restoredUser);
          else localStorage.removeItem('token');
          const stop = startTokenMonitoring(30000);
          return () => stop();
        }
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      const token = data.accessToken || data.jwt;
      saveToken(token);
      setUser(data.user);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al iniciar sesión';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.post('/auth/google', { idToken });
      const token = data.accessToken || data.jwt;
      if (!token) throw new Error('Respuesta sin token');
      saveToken(token);
      setUser(data.user);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error con Google';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const googleRegister = async (idToken: string, type: 'cliente' | 'empresa') => { // 👉 NUEVO
    try {
      setLoading(true);
      setError(null);
      // Backend: POST /auth/google/register { idToken, type }
      const { data } = await axiosInstance.post('/auth/google/register', { idToken, type });
      const token = data.accessToken || data.jwt;
      if (!token) throw new Error('Respuesta sin token');
      saveToken(token);
      setUser(data.user);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al registrar con Google';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint =
        userData.type === 'cliente' ? '/auth/register/cliente' : '/auth/register/empresa';
      const logo = userData.type === 'cliente' ? undefined : userData.logo;
      const { data } = await axiosInstance.post(endpoint, { ...userData, logo });
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al registrar usuario';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const debugToken = () => {
    logTokenInfo();
    console.log('Auth state:', {
      hasUser: !!user,
      userType: user?.type,
      userName: user?.name,
      userEmail: user?.email,
      isLoading: loading,
      hasError: !!error
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    debugToken,
    googleLogin,
    googleRegister, // 👉 NUEVO
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
