import axios from 'axios';

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
    
    console.log('🔐 [AXIOS INTERCEPTOR] Request config:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [AXIOS INTERCEPTOR] Token agregado al header:', {
        header: config.headers.Authorization,
        tokenPreview: `${token.substring(0, 20)}...`
      });
    } else {
      console.log('⚠️ [AXIOS INTERCEPTOR] No hay token disponible');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [AXIOS INTERCEPTOR] Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ [AXIOS INTERCEPTOR] Response exitosa:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    console.error('❌ [AXIOS INTERCEPTOR] Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message
    });
    
    // Si el token expiró (401), limpiar localStorage
    if (error.response?.status === 401) {
      console.log('🚨 [AXIOS INTERCEPTOR] Token expirado o inválido, limpiando localStorage');
      localStorage.removeItem('token');
      
      // Solo redirigir si no estamos ya en la página de login
      if (window.location.pathname !== '/login') {
        console.log('🔄 [AXIOS INTERCEPTOR] Redirigiendo a login');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
