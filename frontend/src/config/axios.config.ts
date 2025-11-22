import axios from 'axios';
import { authEvents } from '../utils/authEvents';

// Configuración base de axios
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró (401), limpiar localStorage y forzar logout
    if (error.response?.status === 401) {
      console.log('🔴 Token expired or invalid, forcing logout');
      localStorage.removeItem('token');

      // Emitir evento para que AuthContext haga logout
      authEvents.emitForceLogout();

      // Redirigir si no estamos ya en la página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
