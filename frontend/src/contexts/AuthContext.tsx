import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../config/axios.config';
import { logTokenInfo, startTokenMonitoring } from '../utils/tokenMonitor';
import { authEvents } from '../utils/authEvents';

// 🔹 Solo estos tipos pueden usar esta app (ajustá según cuál sea esta app)
const ALLOWED_USER_TYPE = ['empresa', 'repartidor'];

interface User {
  id: string;
  email: string;
  name: string;
  type: 'cliente' | 'empresa' | 'repartidor';
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
  googleRegister: (idToken: string, type: 'cliente' | 'empresa' | 'repartidor') => Promise<void>;
}

interface RegisterData {
  email: string;
  name: string;
  password: string;
  type: 'cliente' | 'empresa' | 'repartidor';
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

  // 🔹 Función global de redirección
const redirectIfNotAllowed = (userType?: string) => {
  if (!userType) return;

  if (!ALLOWED_USER_TYPE.includes(userType)) {
    console.warn(`🚫 Usuario tipo "${userType}" no permitido. Cerrando sesión y redirigiendo...`);

    // 🧹 1. Limpiar token y estado local
    localStorage.removeItem('token');
    setUser(null);

    // 🕓 2. Pequeño delay opcional para que se ejecute el state update antes de salir
    setTimeout(() => {
      window.location.href = 'https://vitrina.com.ar';
    }, 100);
  }
};

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
          if (restoredUser) {
            setUser(restoredUser);
            redirectIfNotAllowed(restoredUser.type); // 👈 chequea acá
          } else {
            localStorage.removeItem('token');
          }
          const stop = startTokenMonitoring(30000);
          return () => stop();
        }
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Escuchar eventos de logout forzado (token inválido/expirado)
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      console.log('🔴 [AuthContext] Recibido evento de logout forzado');
      setUser(null);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      const token = data.accessToken || data.jwt;
      saveToken(token);
      setUser(data.user);
      redirectIfNotAllowed(data.user.type); // 👈 chequea después de login
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
      redirectIfNotAllowed(data.user.type); // 👈 chequea después de Google login
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error con Google';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const googleRegister = async (idToken: string, type: 'cliente' | 'empresa' | 'repartidor') => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.post('/auth/google/register', { idToken, type });
      const token = data.accessToken || data.jwt;
      if (!token) throw new Error('Respuesta sin token');
      saveToken(token);
      setUser(data.user);
      redirectIfNotAllowed(data.user.type); // 👈 chequea después de Google register
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
      const endpoint = `auth/register/${userData.type}`;
      const logo = (userData.type === 'cliente' || userData.type === 'repartidor') ? undefined : userData.logo;
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
    googleRegister,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
