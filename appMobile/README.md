# Vitrina Mobile App - Cliente

App móvil Expo con diseño iOS moderno para clientes de Vitrina.

## Estado del Proyecto

### ✅ COMPLETADO - FASE 1 (Parcial)

**Configuración Base:**
- ✅ Proyecto Expo inicializado con TypeScript
- ✅ Expo Router configurado para navegación file-based
- ✅ Dependencias instaladas (axios, socket.io-client, expo-notifications, etc.)
- ✅ Estructura de carpetas creada

**Tema iOS Moderno:**
- ✅ Sistema de colores neutros ([colors.ts](src/theme/colors.ts))
- ✅ Tipografía basada en SF Pro ([typography.ts](src/theme/typography.ts))
- ✅ Sistema de spacing 8px grid ([spacing.ts](src/theme/spacing.ts))
- ✅ Shadows y border radius

**TypeScript Types:**
- ✅ [auth.ts](src/types/auth.ts) - User, AuthResponse, Login/Register
- ✅ [company.ts](src/types/company.ts) - Company, Product, Ubicacion, Preferencias
- ✅ [order.ts](src/types/order.ts) - Pedido, ItemPedido, OrderStatus, CreateOrderRequest
- ✅ [cart.ts](src/types/cart.ts) - CartItem, Cart
- ✅ [notification.ts](src/types/notification.ts) - Notification, NotificationType

**Servicios API:**
- ✅ [axios.config.ts](src/config/axios.config.ts) - Interceptores de request/response
- ✅ [auth.service.ts](src/services/auth.service.ts) - login, register, googleLogin
- ✅ [company.service.ts](src/services/company.service.ts) - getAllCompanies, getCompanyById
- ✅ [order.service.ts](src/services/order.service.ts) - createOrder, getMyOrders, calculateShipping
- ✅ [notification.service.ts](src/services/notification.service.ts) - getNotifications, markAsRead

**Contexts:**
- ✅ [AuthContext.tsx](src/contexts/AuthContext.tsx) - Manejo de autenticación y navegación protegida

**Utils:**
- ✅ [storage.ts](src/utils/storage.ts) - AsyncStorage wrapper
- ✅ [constants.ts](src/utils/constants.ts) - API_URL, STORAGE_KEYS, ROUTES

**Layouts:**
- ✅ [app/_layout.tsx](app/_layout.tsx) - Root layout con AuthProvider

### 🚧 PENDIENTE - FASE 1

- ⏳ Screen de Login ([app/auth/login.tsx](app/auth/login.tsx))
- ⏳ Screen de Register ([app/auth/register.tsx](app/auth/register.tsx))
- ⏳ Google Sign-In integration
- ⏳ Auth layout ([app/auth/_layout.tsx](app/auth/_layout.tsx))

### 📋 PENDIENTE - FASE 2

- Tab Navigation
- Screen Inicio (lista de empresas)
- CompanyCard component
- Búsqueda y filtros
- Company Store page
- ProductCard component
- Google Maps integration

### 📋 PENDIENTE - FASE 3

- CartContext
- FloatingCartButton
- Cart modal
- Checkout flow
- Delivery location selector
- Image picker para comprobantes

### 📋 PENDIENTE - FASE 4

- Expo Notifications setup
- WebSocket con Socket.io
- Push + WebSocket híbrido
- Screen Mis Pedidos
- OrderCard component
- Order detail timeline

### 📋 PENDIENTE - FASE 5

- Screen Perfil
- Configuración de notificaciones
- Animaciones con Reanimated
- Skeleton loaders
- Error states

## Estructura del Proyecto

```
appMobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (tabs)/                  # Tab navigation group
│   │   ├── index.tsx            # Home (Empresas)
│   │   ├── orders.tsx           # Mis Pedidos
│   │   ├── profile.tsx          # Perfil
│   │   └── _layout.tsx          # Tabs layout
│   ├── auth/
│   │   ├── login.tsx            # Login screen
│   │   ├── register.tsx         # Register screen
│   │   └── _layout.tsx          # Auth layout
│   ├── company/
│   │   └── [id].tsx             # Company store page
│   └── _layout.tsx              # ✅ Root layout
├── src/
│   ├── components/              # React components
│   │   └── common/              # Shared components
│   ├── services/                # ✅ API services
│   │   ├── auth.service.ts
│   │   ├── company.service.ts
│   │   ├── order.service.ts
│   │   └── notification.service.ts
│   ├── hooks/                   # Custom hooks
│   ├── contexts/                # ✅ React contexts
│   │   └── AuthContext.tsx
│   ├── types/                   # ✅ TypeScript types
│   │   ├── auth.ts
│   │   ├── company.ts
│   │   ├── order.ts
│   │   ├── cart.ts
│   │   ├── notification.ts
│   │   └── index.ts
│   ├── utils/                   # ✅ Utilities
│   │   ├── storage.ts
│   │   └── constants.ts
│   ├── theme/                   # ✅ Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── config/                  # ✅ Configuration
│       └── axios.config.ts
├── assets/                      # Images, fonts, etc.
├── app.json                     # ✅ Expo config
├── package.json                 # ✅ Dependencies
└── tsconfig.json                # TypeScript config
```

## Instalación y Setup

### 1. Instalar dependencias

```bash
cd vitrina/appMobile
npm install
```

### 2. Configurar variables de entorno

Edita [src/utils/constants.ts](src/utils/constants.ts):

```typescript
export const API_URL = __DEV__
  ? 'http://localhost:3001'  // Tu backend local
  : 'https://your-production-api.com';

export const GOOGLE_MAPS_API_KEY = 'TU_API_KEY_DE_GOOGLE_MAPS';
```

### 3. Ejecutar la app

```bash
# iOS (requiere Mac)
npm run ios

# Android
npm run android

# Web (para testing)
npm run web

# Expo Go (escanea QR code)
npm start
```

## Dependencias Instaladas

**Core:**
- expo ~54.0.14
- react 19.1.0
- react-native 0.81.4

**Navigation:**
- expo-router ~6.0.13
- react-native-screens ~4.16.0
- react-native-safe-area-context ~5.6.0

**API & State:**
- axios ^1.12.2
- socket.io-client ^4.8.1
- @react-native-async-storage/async-storage ^2.2.0

**UI & Animations:**
- react-native-reanimated ^4.1.3
- @gorhom/bottom-sheet ^5.2.6

**Features:**
- expo-notifications ^0.32.12
- expo-image-picker ^17.0.8
- react-native-maps ^1.26.17
- expo-auth-session ^7.0.8
- expo-web-browser ^15.0.8
- @react-native-community/netinfo ^11.4.1

## Próximos Pasos

1. **Completar FASE 1:**
   - Crear screens de Login y Register con diseño iOS moderno
   - Implementar Google Sign-In
   - Testear flujo de autenticación completo

2. **Iniciar FASE 2:**
   - Crear tab navigation
   - Implementar screen de inicio con lista de empresas
   - Diseñar CompanyCard component

3. **Backend adaptations needed:**
   - Endpoint para registro debe aceptar `role: 'cliente'`
   - Endpoint para Google login debe crear usuarios tipo cliente
   - Endpoint para registrar FCM tokens: `POST /notifications/register-device`

## Diseño iOS Moderno

**Paleta de Colores:**
- Neutros: Grises del sistema iOS (#FAFAFA a #171717)
- Primary: #2C2C2E (Dark gray)
- Accent: #5856D6 (Purple iOS)
- Semantic: Success (#34C759), Error (#FF3B30), Warning (#FF9500)

**Tipografía:**
- System fonts (SF Pro en iOS, Roboto en Android)
- Text styles predefinidos: largeTitle, title1-3, headline, body, callout, etc.

**Espaciado:**
- Grid de 8px (xs:4, sm:8, md:16, lg:24, xl:32...)
- Border radius: sm:4, md:8, lg:12, xl:16

**Shadows:**
- Sutiles y elevadas (iOS style)
- sm, md, lg, xl con opacidades bajas

## Notas Importantes

- La app está configurada solo para **clientes**
- El registro fuerza `role: 'cliente'`
- Google login también crea usuarios cliente
- Diseño minimalista sin colores llamativos
- Animaciones sutiles y fluidas
- Compatible con iOS y Android

## Contacto y Soporte

Si tienes preguntas o necesitas ayuda, consulta la documentación de:
- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
