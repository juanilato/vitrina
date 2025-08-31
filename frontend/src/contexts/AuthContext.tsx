import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../config/axios.config';
import { logTokenInfo, startTokenMonitoring, getTokenInfo } from '../utils/tokenMonitor';

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
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  debugToken: () => void;
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para restaurar usuario del token almacenado
  const restoreUserFromToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ [AUTH CONTEXT] No hay token para restaurar usuario');
        return null;
      }

      console.log('🔍 [AUTH CONTEXT] Intentando restaurar usuario del token almacenado');
      
      // Verificar si el token es válido haciendo una petición al backend
      const response = await axiosInstance.get('/auth/profile');
      
      if (response.data?.user) {
        const userData = response.data.user;
        console.log('✅ [AUTH CONTEXT] Usuario restaurado exitosamente:', {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          type: userData.type
        });
        return userData;
      }
    } catch (error) {
      console.warn('⚠️ [AUTH CONTEXT] Error al restaurar usuario del token:', error);
      // Si hay error, limpiar token inválido
      localStorage.removeItem('token');
    }
    return null;
  };

  useEffect(() => {
    console.log('🚀 [AUTH CONTEXT] Inicializando AuthProvider');
    
    const initializeAuth = async () => {
      try {
        // Check if user is logged in on app start
        const token = localStorage.getItem('token');
        console.log('🔍 [AUTH CONTEXT] Token encontrado en localStorage:', {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
        });
        
        if (token) {
          console.log('✅ [AUTH CONTEXT] Token válido encontrado, configurando axios');
          // El token se configurará automáticamente a través del interceptor
          
          // Mostrar información detallada del token
          logTokenInfo();
          
          // Intentar restaurar el usuario del token
          const restoredUser = await restoreUserFromToken();
          if (restoredUser) {
            setUser(restoredUser);
            console.log('👤 [AUTH CONTEXT] Usuario restaurado en el estado');
          } else {
            console.log('⚠️ [AUTH CONTEXT] No se pudo restaurar el usuario, limpiando token');
            localStorage.removeItem('token');
          }
          
          // Iniciar monitoreo del token
          const stopMonitoring = startTokenMonitoring(30000); // Cada 30 segundos
          
          // Cleanup function
          return () => {
            stopMonitoring();
          };
        } else {
          console.log('⚠️ [AUTH CONTEXT] No hay token, usuario no autenticado');
        }
      } catch (error) {
        console.error('❌ [AUTH CONTEXT] Error en inicialización:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH CONTEXT] Iniciando proceso de login para:', email);
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post('/auth/login', { email, password });
      console.log('✅ [AUTH CONTEXT] Login exitoso, respuesta del servidor:', {
        hasUser: !!response.data.user,
        hasToken: !!response.data.accessToken,
        userType: response.data.user?.type,
        tokenLength: response.data.accessToken?.length || 0
      });
      
      const { user: userData, accessToken } = response.data;
      
      console.log('💾 [AUTH CONTEXT] Guardando token en localStorage');
      localStorage.setItem('token', accessToken);
      
      // Mostrar información del nuevo token
      console.log('🔍 [AUTH CONTEXT] Información del nuevo token:');
      logTokenInfo();
      
      console.log('👤 [AUTH CONTEXT] Configurando usuario en estado:', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        type: userData.type
      });
      
      setUser(userData);
      
      console.log('🎉 [AUTH CONTEXT] Login completado exitosamente');
    } catch (err: any) {
      console.error('❌ [AUTH CONTEXT] Error en login:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log('📝 [AUTH CONTEXT] Iniciando registro para:', {
        email: userData.email,
        type: userData.type,
        name: userData.name
      });
      
      setLoading(true);
      setError(null);
      
      const endpoint = userData.type === 'cliente' ? '/auth/register/cliente' : '/auth/register/empresa';
      const logo = userData.type === 'cliente' ? undefined : userData.logo;
      
      console.log('🌐 [AUTH CONTEXT] Enviando petición a endpoint:', endpoint);
      const response = await axiosInstance.post(endpoint, { ...userData, logo });
      
      console.log('✅ [AUTH CONTEXT] Registro exitoso:', {
        message: response.data.message,
        email: response.data.email,
        userType: response.data.userType
      });
      
      // No hacer login automático - la cuenta necesita verificación
      // await login(userData.email, userData.password);
      
      // Solo retornar éxito para que el componente maneje la verificación
      return response.data;
    } catch (err: any) {
      console.error('❌ [AUTH CONTEXT] Error en registro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || 'Error al registrar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 [AUTH CONTEXT] Iniciando logout');
    
    console.log('🗑️ [AUTH CONTEXT] Limpiando token del localStorage');
    localStorage.removeItem('token');
    
    console.log('👤 [AUTH CONTEXT] Limpiando usuario del estado');
    setUser(null);
    
    console.log('✅ [AUTH CONTEXT] Logout completado');
  };

  const debugToken = () => {
    console.log('🔍 [AUTH CONTEXT] Debug del token solicitado');
    logTokenInfo();
    
    // También mostrar información del estado actual
    console.log('📊 [AUTH CONTEXT] Estado actual del contexto:', {
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
    debugToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
