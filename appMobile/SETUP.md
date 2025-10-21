# Setup Guide - Vitrina Mobile App

## ✅ FASE 1 COMPLETADA

La FASE 1 está 100% completa. La app tiene autenticación funcional con diseño iOS moderno.

### Lo que funciona:

1. **Autenticación completa:**
   - Login con email/password
   - Registro de clientes
   - Google Sign-In (requiere configuración)
   - Navegación protegida automática
   - Persistencia de sesión con AsyncStorage

2. **Diseño iOS Moderno:**
   - Sistema de colores neutros y minimalistas
   - Tipografía SF Pro
   - Componentes Button, Input, Card reutilizables
   - Animaciones sutiles

3. **Navegación:**
   - Expo Router (file-based)
   - Tab navigation (Inicio, Pedidos, Perfil)
   - Redirección automática según estado de auth

## 📋 Configuración Necesaria

### 1. Configurar API URL

Edita `src/utils/constants.ts`:

```typescript
export const API_URL = __DEV__
  ? 'http://localhost:3001'  // ← Cambia esto a tu backend local
  : 'https://tu-api-produccion.com';
```

### 2. Configurar Google Sign-In (Opcional)

Para habilitar Google Sign-In, necesitas:

#### a) Obtener credenciales OAuth 2.0

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Google+ API
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth 2.0"
5. Crea IDs para:
   - Android (tipo: Android)
   - iOS (tipo: iOS)
   - Web (tipo: Aplicación web)

#### b) Configurar IDs en la app

Edita `src/hooks/useGoogleSignIn.ts`:

```typescript
const GOOGLE_CLIENT_ID = {
  android: 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  ios: 'TU_IOS_CLIENT_ID.apps.googleusercontent.com',
  web: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com',
};
```

#### c) Android SHA-1 (solo para Android)

```bash
cd android
./gradlew signingReport
# Copia el SHA-1 y agrégalo en Google Cloud Console
```

#### d) iOS URL Scheme (solo para iOS)

Ya está configurado en `app.json` con scheme `vitrina`.

### 3. Probar la App

```bash
cd vitrina/appMobile

# Expo Go (escanea QR)
npm start

# iOS Simulator (requiere Mac)
npm run ios

# Android Emulator
npm run android

# Web (para testing rápido)
npm run web
```

## 🔧 Adaptar Backend

Para que la autenticación funcione correctamente, asegúrate de:

### 1. Registro de Clientes

El endpoint `POST /auth/register` debe:
- Aceptar el campo `role: 'cliente'`
- Crear usuarios con rol cliente
- Retornar `{ access_token, user }`

```typescript
// Ejemplo de request desde la app
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "role": "cliente"  // ← Forzado desde la app
}
```

### 2. Google Login

El endpoint `POST /auth/google` debe:
- Aceptar `{ idToken, role: 'cliente' }`
- Verificar el idToken con Google
- Crear o encontrar el usuario
- Retornar `{ access_token, user }`

```typescript
// Ejemplo de request
{
  "idToken": "eyJhbGciOiJSUzI1...",
  "role": "cliente"  // ← Forzado desde la app
}
```

### 3. Verificar Token

El endpoint `GET /auth/profile` debe:
- Recibir header `Authorization: Bearer ${token}`
- Retornar el usuario actual

## 🎨 Estructura de Archivos

```
vitrina/appMobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          ✅ Home (placeholder)
│   │   ├── orders.tsx         ✅ Mis Pedidos (placeholder)
│   │   ├── profile.tsx        ✅ Perfil (con logout)
│   │   └── _layout.tsx        ✅ Tab navigation
│   ├── auth/
│   │   ├── login.tsx          ✅ Login completo
│   │   ├── register.tsx       ✅ Registro completo
│   │   └── _layout.tsx        ✅ Auth layout
│   ├── index.tsx              ✅ Redirect root
│   └── _layout.tsx            ✅ Root layout con providers
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── Button.tsx     ✅ Componente Button iOS
│   │       ├── Input.tsx      ✅ Componente Input iOS
│   │       ├── Card.tsx       ✅ Componente Card iOS
│   │       └── index.ts       ✅ Exports
│   ├── contexts/
│   │   └── AuthContext.tsx    ✅ Auth state & navigation
│   ├── hooks/
│   │   └── useGoogleSignIn.ts ✅ Google Sign-In hook
│   ├── services/
│   │   ├── auth.service.ts    ✅ Auth API
│   │   ├── company.service.ts ✅ Companies API
│   │   ├── order.service.ts   ✅ Orders API
│   │   └── notification.service.ts ✅ Notifications API
│   ├── types/                 ✅ TypeScript types
│   ├── theme/                 ✅ Design system
│   ├── utils/                 ✅ Storage, constants
│   └── config/
│       └── axios.config.ts    ✅ Axios interceptors
├── app.json                   ✅ Expo config
├── package.json               ✅ Dependencies
├── README.md                  ✅ Documentación
└── SETUP.md                   ✅ Esta guía
```

## 🧪 Testing FASE 1

### Test 1: Registro

1. Abre la app
2. Click "Regístrate"
3. Completa el formulario
4. Click "Crear Cuenta"
5. ✅ Deberías ver la tab navigation

### Test 2: Login

1. Cierra sesión desde Perfil
2. Ingresa email/password
3. Click "Iniciar Sesión"
4. ✅ Deberías ver la tab navigation

### Test 3: Google Sign-In (si configuraste)

1. Click "Continuar con Google"
2. Selecciona tu cuenta Google
3. ✅ Deberías ver la tab navigation

### Test 4: Persistencia

1. Cierra la app completamente
2. Vuelve a abrirla
3. ✅ Deberías seguir autenticado

### Test 5: Navegación Protegida

1. Cierra sesión
2. ✅ Deberías ser redirigido a Login automáticamente

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"

- Verifica que tu backend esté corriendo
- Verifica `API_URL` en `src/utils/constants.ts`
- Si usas Android emulator, usa `http://10.0.2.2:3001` en vez de `localhost`

### Error: Google Sign-In no funciona

- Verifica que los Client IDs estén correctos
- Verifica que el scheme `vitrina` esté configurado
- En iOS, verifica Info.plist
- En Android, verifica SHA-1 en Google Console

### Error: "Token expired"

- El AuthContext maneja esto automáticamente
- Deberías ser redirigido a Login

### Warning: expo-auth-session plugin

- Es normal, no afecta la funcionalidad
- Google Sign-In funciona sin el plugin

## 📱 Capturas de Pantalla Esperadas

### Login Screen
- Header "Bienvenido"
- Input Email
- Input Password (con botón Mostrar/Ocultar)
- Link "¿Olvidaste tu contraseña?"
- Botón "Iniciar Sesión"
- Divider
- Botón "Continuar con Google"
- Link "Regístrate"

### Register Screen
- Header "Crear Cuenta"
- Input Nombre
- Input Email
- Input Password
- Input Confirmar Password
- Texto de términos
- Botón "Crear Cuenta"
- Divider
- Botón "Continuar con Google"
- Link "Inicia Sesión"

### Tab Navigation
- 3 tabs: Inicio, Pedidos, Perfil
- Barra inferior con iconos (por ahora sin iconos)

### Profile Screen
- Muestra nombre y email del usuario
- Botón "Cerrar Sesión"

## ⏭️ Próximos Pasos (FASE 2)

1. Implementar lista de empresas en tab Inicio
2. Crear CompanyCard component
3. Agregar búsqueda y filtros
4. Crear screen de Company Store
5. Implementar ProductCard
6. Integrar Google Maps

## 📞 Soporte

Si encuentras problemas:
1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Limpia cache: `npx expo start -c`
3. Revisa los logs en la consola de Expo
4. Verifica que el backend esté respondiendo correctamente

---

**¡FASE 1 COMPLETADA! 🎉**

La autenticación está funcional y lista para usar. Ahora puedes continuar con la FASE 2 para implementar la funcionalidad de explorar empresas y productos.
