# Análisis del Flujo del Token - Sistema de Autenticación

## Resumen del Sistema

Este documento describe cómo funciona el sistema de autenticación basado en JWT en la aplicación Vitrina, incluyendo el flujo del token, almacenamiento y monitoreo.

## Arquitectura del Sistema

### Backend (NestJS + JWT)
- **Puerto**: 3001
- **Configuración JWT**: 
  - Access Token: 15 minutos
  - Refresh Token: 7 días
  - Secret: Configurado en variables de entorno
- **Endpoints de autenticación**: `/auth/*`

### Frontend (React + Axios)
- **Puerto**: 3000 (con proxy a 3001)
- **Almacenamiento**: localStorage
- **Interceptores**: Axios configurado con interceptores automáticos

## Flujo del Token

### 1. Login
```
Usuario → Frontend → Backend → JWT Service → Token Response → Frontend → localStorage
```

**Detalles del proceso:**
1. Usuario ingresa credenciales en `/login`
2. Frontend envía POST a `/auth/login`
3. Backend valida credenciales y genera JWT
4. Backend retorna `accessToken` y `refreshToken`
5. Frontend guarda `accessToken` en localStorage
6. Frontend configura axios con el token

### 2. Almacenamiento del Token
- **Ubicación**: `localStorage.getItem('token')`
- **Formato**: `Bearer {token}`
- **Configuración**: Automática a través de interceptores de Axios

### 3. Uso del Token
- **Interceptores**: Se agregan automáticamente a todas las peticiones HTTP
- **Headers**: `Authorization: Bearer {token}`
- **Validación**: Backend verifica token en cada petición protegida

### 4. Expiración y Renovación
- **Access Token**: Expira en 15 minutos
- **Refresh Token**: Disponible para renovación (implementación pendiente)
- **Manejo de expiración**: Interceptor detecta 401 y redirige a login

## Archivos Clave

### Frontend
- `src/config/axios.config.ts` - Configuración de Axios con interceptores
- `src/contexts/AuthContext.tsx` - Contexto de autenticación
- `src/utils/tokenMonitor.ts` - Utilidades de monitoreo del token
- `src/components/Login.tsx` - Componente de login
- `src/components/Dashboard.tsx` - Dashboard principal
- `src/components/PrivateRoute.tsx` - Protección de rutas

### Backend
- `src/auth/auth.service.ts` - Servicio de autenticación
- `src/auth/auth.controller.ts` - Controlador de autenticación
- `src/config/jwt.config.ts` - Configuración JWT
- `src/main.ts` - Configuración del servidor

## Console Logs Implementados

### Niveles de Logging
- 🚀 **Inicialización**: Configuración y setup
- 🔐 **Autenticación**: Login, logout, registro
- 🔍 **Monitoreo**: Estado del token y debugging
- ✅ **Éxito**: Operaciones completadas
- ❌ **Errores**: Fallos y excepciones
- ⚠️ **Advertencias**: Situaciones de atención
- 🚨 **Crítico**: Token expirado, errores de seguridad

### Ejemplos de Logs
```javascript
// Inicialización
🚀 [AUTH CONTEXT] Inicializando AuthProvider
🔍 [AUTH CONTEXT] Token encontrado en localStorage: { hasToken: true, tokenLength: 1234 }

// Login
🔐 [LOGIN COMPONENT] Iniciando submit del formulario
✅ [AUTH CONTEXT] Login exitoso, respuesta del servidor: { hasUser: true, hasToken: true }

// Monitoreo
🔍 [TOKEN MONITOR] Información del token: { exists: true, isExpired: false }
⏰ [TOKEN MONITOR] Tiempo restante: { minutes: 12, seconds: 30 }

// Interceptores
🔐 [AXIOS INTERCEPTOR] Request config: { url: '/auth/profile', hasToken: true }
✅ [AXIOS INTERCEPTOR] Token agregado al header: { tokenPreview: 'eyJhbGciOiJIUzI1NiIs...' }
```

## Funcionalidades de Debug

### Botón de Debug en Dashboard
- Ubicación: Header del dashboard (ícono 🔍)
- Función: Muestra información completa del token y estado del contexto
- Acceso: Solo para usuarios autenticados

### Monitoreo Automático
- **Frecuencia**: Cada 30 segundos
- **Funciones**:
  - Verificación de expiración
  - Alertas de expiración próxima
  - Logs periódicos del estado
  - Limpieza automática de tokens expirados

### Utilidades de Token
```javascript
// Obtener información del token
import { getTokenInfo, logTokenInfo } from '../utils/tokenMonitor';

const tokenInfo = getTokenInfo();
logTokenInfo();

// Monitoreo continuo
const stopMonitoring = startTokenMonitoring(30000);
// ... cleanup
stopMonitoring();
```

## Configuración de Axios

### Interceptores Implementados
1. **Request Interceptor**: Agrega token automáticamente
2. **Response Interceptor**: Maneja errores de autenticación
3. **Error Handling**: Redirección automática en 401

### Configuración Base
```typescript
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});
```

## Seguridad

### Medidas Implementadas
- **HTTPS**: Recomendado para producción
- **JWT Secret**: Configurado en variables de entorno
- **Expiración**: Tokens de corta duración (15 min)
- **Refresh Tokens**: Disponible para renovación
- **Validación**: Backend valida cada petición

### Consideraciones
- **localStorage**: Vulnerable a XSS (considerar httpOnly cookies)
- **Token Expiration**: Implementar renovación automática
- **Logout**: Limpiar tokens del cliente
- **CORS**: Configurado en backend

## Troubleshooting

### Problemas Comunes
1. **Token no se envía**: Verificar localStorage y interceptores
2. **401 Unauthorized**: Token expirado o inválido
3. **CORS errors**: Verificar configuración del backend
4. **Token no se guarda**: Verificar respuesta del login

### Debugging
1. Abrir DevTools Console
2. Buscar logs con emojis específicos
3. Usar botón de debug en dashboard
4. Verificar Network tab para peticiones HTTP
5. Revisar localStorage en Application tab

## Mejoras Futuras

### Implementaciones Pendientes
- [ ] Renovación automática de tokens
- [ ] Refresh token rotation
- [ ] Logout en múltiples dispositivos
- [ ] Auditoría de sesiones
- [ ] Rate limiting en endpoints de auth

### Optimizaciones
- [ ] Cache de usuario en memoria
- [ ] Lazy loading de componentes protegidos
- [ ] Prefetch de datos de usuario
- [ ] Offline support con tokens válidos

## Comandos de Desarrollo

### Backend
```bash
cd backend
npm run start:dev  # Puerto 3001
```

### Frontend
```bash
cd frontend
npm start          # Puerto 3000
```

### Monitoreo
- Console del navegador para logs detallados
- Network tab para peticiones HTTP
- Application tab para localStorage
- Botón de debug en dashboard para estado del token
