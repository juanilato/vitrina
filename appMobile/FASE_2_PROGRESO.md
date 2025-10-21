# 🎉 FASE 2 - Progreso 85% Completado

## ✅ Estado: FUNCIONANDO

La app ahora tiene navegación completa con autenticación + lista de empresas con búsqueda y filtros.

---

## 🚀 CÓMO EJECUTAR LA APP

### 1. Configurar API URL (IMPORTANTE)

Edita `src/utils/constants.ts`:

```typescript
export const API_URL = __DEV__
  ? 'http://10.0.2.2:3001'  // ← Android emulator
  // ? 'http://localhost:3001'  // ← iOS simulator
  : 'https://tu-api.com';
```

**Nota importante:**
- **Android Emulator:** Usa `http://10.0.2.2:3001` (localhost del host)
- **iOS Simulator:** Usa `http://localhost:3001`
- **Dispositivo físico:** Usa la IP de tu computadora (ej: `http://192.168.1.100:3001`)

### 2. Asegúrate que tu backend esté corriendo

```bash
cd vitrina/backend
npm run start:dev
```

### 3. Ejecutar la app

```bash
cd vitrina/appMobile

# Limpiar cache y ejecutar
npx expo start -c

# O específicamente:
npm run android  # Android
npm run ios      # iOS
```

---

## ✅ LO QUE YA FUNCIONA

### FASE 1 - Autenticación (100%)

✅ **Login completo**
- Email/password
- Google Sign-In (requiere configurar Client IDs)
- Validación de formularios
- Manejo de errores

✅ **Registro completo**
- Solo para clientes
- Confirmación de contraseña
- Google Sign-In
- Validación

✅ **Navegación protegida**
- Redirect automático según estado de auth
- Persistencia de sesión
- Logout funcional

### FASE 2 - Browse Empresas (85%)

✅ **Tab Navigation con iconos**
- 3 tabs: Inicio, Pedidos, Perfil
- Iconos iOS style (home, receipt, person)
- Diseño iOS moderno

✅ **Screen Inicio COMPLETO**
- Lista de empresas desde API
- SearchBar funcional
- Filtros por categoría
- Ordenamiento (nombre, valoración, nuevas)
- Pull to refresh
- Loading states
- Empty states
- Error states con retry

✅ **CompanyCard Component**
- Logo/placeholder de empresa
- Nombre y descripción
- Badge de verificado
- Rating con estrellas
- Ubicación
- Categoría
- Navegación a tienda

✅ **Componentes creados:**
- `SearchBar` - Búsqueda con icono y botón clear
- `CompanyCard` - Tarjeta de empresa iOS style
- `ProductCard` - Tarjeta de producto (listo para FASE 3)
- `Button`, `Input`, `Card` - UI components

✅ **Hooks creados:**
- `useCompanies` - Fetch y filtrado de empresas
- `useCompanyStore` - Fetch empresa + productos
- `useGoogleSignIn` - Google Sign-In
- `useAuth` - Autenticación

---

## 📱 FLUJO DE LA APP ACTUAL

### Primera vez abriendo la app:

1. **Abres la app** → Ves el **Login screen**
2. **Click "Regístrate"**
3. **Completas formulario**
4. **Click "Crear Cuenta"**
5. ✅ Ves las **3 tabs** (Inicio, Pedidos, Perfil)

### Tab Inicio (Home):

1. **Ves lista de empresas** desde tu backend
2. **Puedes buscar** por nombre/descripción
3. **Puedes filtrar:**
   - Ordenar por: Nombre, Valoración, Más nuevas
   - Categoría: Todas, Restaurante, Comida, etc.
4. **Pull down** para actualizar
5. **Click en una empresa** → Debería ir a Company Store (próximamente)

### Tab Pedidos:

- Placeholder (FASE 4)

### Tab Perfil:

- Muestra tu nombre y email
- Botón "Cerrar Sesión" funcional

---

## 🎨 DISEÑO iOS MODERNO IMPLEMENTADO

### Colores
- Paleta neutra (grises, blancos, negro)
- Accent color: Purple (#5856D6)
- Sin colores llamativos

### Componentes
- Cards con shadows sutiles
- Border radius redondeados (12-16px)
- Botones con estados (active, disabled, loading)
- Inputs con focus states

### Interacciones
- Pull to refresh
- Tap opacity en botones
- Loading spinners
- Error states con retry

---

## 🧪 TESTING GUIDE

### Test 1: Autenticación completa

```
1. Abre la app → Deberías ver Login
2. Click "Regístrate"
3. Completa: Nombre, Email, Password
4. Click "Crear Cuenta"
✅ Deberías ver las tabs

5. Ve a Perfil → Click "Cerrar Sesión"
✅ Deberías volver a Login

6. Login con tus credenciales
✅ Deberías ver las tabs nuevamente
```

### Test 2: Persistencia

```
1. Cierra la app completamente
2. Vuelve a abrirla
✅ Deberías seguir autenticado
```

### Test 3: Lista de empresas

```
1. Ve al tab Inicio
✅ Deberías ver empresas desde tu backend

2. Si no ves empresas:
   - Verifica que tu backend esté corriendo
   - Verifica la API_URL en constants.ts
   - Mira los logs de Expo (deberías ver errores de red)
```

### Test 4: Búsqueda

```
1. En Inicio, escribe en el SearchBar
✅ La lista se filtra en tiempo real

2. Click en la X para limpiar
✅ Vuelve a mostrar todas
```

### Test 5: Filtros

```
1. Click en el icono de filtros (☰)
✅ Se muestran opciones de ordenamiento y categorías

2. Click en "Valoración"
✅ Las empresas se ordenan por rating

3. Click en una categoría
✅ Solo muestra empresas de esa categoría

4. Click en la X del botón filtros
✅ Se ocultan los filtros
```

### Test 6: Pull to Refresh

```
1. En la lista de empresas, pull down
✅ Spinner de actualización
✅ Lista se recarga desde API
```

---

## 🐛 TROUBLESHOOTING

### Problema: No veo empresas

**Solución:**
1. Verifica que tu backend esté corriendo en `http://localhost:3001`
2. Verifica `API_URL` en `src/utils/constants.ts`
3. Si usas Android emulator: `http://10.0.2.2:3001`
4. Si usas dispositivo físico: IP de tu PC (ej: `http://192.168.1.100:3001`)
5. Revisa logs de Expo: `npx expo start -c`

### Problema: Error "Cannot connect to backend"

**Solución:**
```bash
# 1. Asegúrate que el backend esté corriendo
cd vitrina/backend
npm run start:dev

# 2. Verifica que responda
curl http://localhost:3001/auth/companies

# 3. Si usas Android, cambia a 10.0.2.2
# Edita src/utils/constants.ts
```

### Problema: La app no arranca / pantalla blanca

**Solución:**
```bash
# Limpia cache
npx expo start -c

# Si persiste, reinstala node_modules
rm -rf node_modules
npm install

# Reinicia metro bundler
npx expo start -c
```

### Problema: Error en Login/Register

**Verifica:**
1. Backend tenga endpoint `/auth/register` que acepte `role: 'cliente'`
2. Backend retorne `{ access_token, user }`
3. Revisa logs del backend

### Problema: Google Sign-In no funciona

**Esto es normal:**
- Google Sign-In requiere configurar Client IDs
- Ver `SETUP.md` para instrucciones completas
- Por ahora usa email/password

---

## 📂 ARCHIVOS IMPORTANTES

### Configuración
```
package.json          ← main: "expo-router/entry"
app.json             ← Expo config
src/utils/constants.ts ← API_URL AQUÍ
```

### Navegación
```
app/_layout.tsx           ← Root layout
app/index.tsx            ← Redirect
app/(tabs)/_layout.tsx   ← Tab navigation
app/(tabs)/index.tsx     ← Home screen
app/(tabs)/profile.tsx   ← Profile
app/auth/login.tsx       ← Login
app/auth/register.tsx    ← Register
```

### Componentes
```
src/components/common/
  ├── Button.tsx
  ├── Input.tsx
  ├── Card.tsx
  └── SearchBar.tsx

src/components/companies/
  └── CompanyCard.tsx

src/components/products/
  └── ProductCard.tsx
```

### Hooks
```
src/hooks/
  ├── useCompanies.ts        ← Fetch + filtros
  ├── useCompanyStore.ts     ← Fetch empresa
  ├── useGoogleSignIn.ts     ← Google auth
```

### Servicios
```
src/services/
  ├── auth.service.ts
  ├── company.service.ts
  ├── order.service.ts
  └── notification.service.ts
```

### Contexts
```
src/contexts/
  └── AuthContext.tsx    ← Estado de auth + navegación
```

---

## 🔜 PRÓXIMOS PASOS

### Para completar FASE 2 (15% restante):

1. **Company Store Screen**
   - Crear `app/company/[id].tsx`
   - Mostrar productos de la empresa
   - Header con logo y nombre
   - Lista de productos con ProductCard
   - (Esto ya tiene todos los componentes listos)

### FASE 3 - Carrito y Checkout:

1. CartContext para estado del carrito
2. FloatingCartButton con badge
3. Cart modal/screen
4. Selección delivery/retiro
5. Google Maps para ubicación
6. Cálculo de envío
7. Forma de pago + foto transferencia
8. Checkout

### FASE 4 - Pedidos y Notificaciones:

1. Screen Mis Pedidos
2. WebSocket para notificaciones en tiempo real
3. Push notifications con FCM
4. Order detail con timeline

### FASE 5 - Perfil y Pulido:

1. Mejorar screen de perfil
2. Animaciones con Reanimated
3. Skeleton loaders
4. Error states mejorados

---

## 📊 PROGRESO TOTAL

| Fase | Estado | Tareas Completadas |
|------|--------|-------------------|
| FASE 1 | ✅ 100% | 10/10 |
| FASE 2 | 🔄 85% | 6/7 |
| FASE 3 | ⏳ 0% | 0/8 |
| FASE 4 | ⏳ 0% | 0/6 |
| FASE 5 | ⏳ 0% | 0/6 |

**Total: ~43% del proyecto (16/37 tareas)**

---

## 🎯 DEMO RÁPIDO

**Para ver la app funcionando YA:**

```bash
# Terminal 1: Backend
cd vitrina/backend
npm run start:dev

# Terminal 2: App móvil
cd vitrina/appMobile
npx expo start -c

# Escanea el QR con Expo Go
# O presiona 'a' para Android / 'i' para iOS
```

**Flujo demo:**
1. Registro → Login
2. Ver lista de empresas
3. Buscar "pizza"
4. Filtrar por categoría
5. Ordenar por valoración
6. Ver perfil
7. Logout

---

## 💡 NOTAS IMPORTANTES

1. **Solo Clientes:** La app solo crea usuarios tipo `cliente`
2. **Backend sin cambios:** Usa las APIs existentes
3. **Diseño minimalista:** Colores neutros, sin distracciones
4. **Performance:** Pull to refresh, loading states, error handling
5. **TypeScript:** Todo tipado correctamente

---

## 🆘 AYUDA

Si algo no funciona:

1. **Revisa logs de Expo:**
   ```bash
   npx expo start -c
   # Presiona 'j' para abrir debugger
   ```

2. **Revisa logs del backend:**
   ```bash
   # Deberías ver las requests llegando
   ```

3. **Verifica network:**
   ```bash
   # Desde tu dispositivo/emulator
   ping 10.0.2.2  # Android
   ping localhost  # iOS
   ```

4. **Reinstala dependencias:**
   ```bash
   rm -rf node_modules
   npm install
   npx expo start -c
   ```

---

**¡La app está lista para testing! 🚀**

Configura el `API_URL`, ejecuta `npx expo start -c`, y deberías ver la app funcionando con login + lista de empresas.
