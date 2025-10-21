# 🚀 CÓMO EJECUTAR LA APP - Guía Rápida

## ⚡ Setup en 3 Pasos

### 1️⃣ Configurar API URL

Abre `src/utils/constants.ts` y cambia:

```typescript
export const API_URL = __DEV__
  ? 'http://10.0.2.2:3001'  // ← Para Android emulator
  // ? 'http://localhost:3001'  // ← Para iOS simulator
  : 'https://tu-api.com';
```

**Importante:**
- **Android Emulator:** `http://10.0.2.2:3001`
- **iOS Simulator:** `http://localhost:3001`
- **Dispositivo físico:** `http://TU_IP:3001` (ej: `http://192.168.1.100:3001`)

### 2️⃣ Iniciar Backend

```bash
cd vitrina/backend
npm run start:dev
```

Verifica que esté corriendo:
```bash
curl http://localhost:3001/auth/companies
```

### 3️⃣ Ejecutar App Móvil

```bash
cd vitrina/appMobile

# Limpiar cache y ejecutar
npx expo start -c

# Opciones:
# - Escanea QR con Expo Go
# - Presiona 'a' para Android
# - Presiona 'i' para iOS
```

---

## ✅ Lo que deberías ver

### 1. Primera pantalla: Login

- Input de email
- Input de password (con botón mostrar/ocultar)
- Botón "Iniciar Sesión"
- Botón "Continuar con Google"
- Link "Regístrate"

### 2. Después de registrarte/login: Tabs

**Tab Inicio:**
- Lista de empresas desde tu backend
- Barra de búsqueda
- Botón de filtros
- Cards de empresas con:
  - Logo
  - Nombre
  - Descripción
  - Categoría
  - Rating
  - Ubicación

**Tab Pedidos:**
- Placeholder (FASE 4)

**Tab Perfil:**
- Tu nombre
- Tu email
- Botón "Cerrar Sesión"

---

## 🎯 Pruebas Rápidas

### Test de Autenticación

```
1. Abre app → Login
2. Click "Regístrate"
3. Completa formulario
4. ✅ Ves las 3 tabs
5. Ve a Perfil → Logout
6. ✅ Vuelves a Login
```

### Test de Empresas

```
1. Tab Inicio
2. ✅ Ves lista de empresas
3. Escribe en búsqueda
4. ✅ Se filtra en tiempo real
5. Click en filtros
6. ✅ Puedes ordenar y filtrar por categoría
7. Pull down para refrescar
8. ✅ Lista se actualiza
```

---

## 🐛 Si algo no funciona

### No veo empresas

```bash
# 1. Verifica backend
curl http://localhost:3001/auth/companies

# 2. Verifica API_URL en constants.ts
# Android: http://10.0.2.2:3001
# iOS: http://localhost:3001

# 3. Reinicia con cache limpio
npx expo start -c
```

### Error de conexión

```bash
# Verifica que el backend esté en el puerto correcto
netstat -an | grep 3001

# Si usas Android, DEBE ser 10.0.2.2
# No uses localhost en Android
```

### Pantalla blanca / App no carga

```bash
# Limpia todo
rm -rf node_modules
npm install
npx expo start -c
```

---

## 📁 Archivos Clave

- **`src/utils/constants.ts`** ← Configura API_URL aquí
- **`package.json`** ← main debe ser "expo-router/entry"
- **`app/_layout.tsx`** ← Entry point de la app
- **`app/index.tsx`** ← Redirección inicial

---

## 🎉 Estado Actual

### ✅ Funciona:
- Login / Register
- Google Sign-In (requiere setup)
- Lista de empresas
- Búsqueda
- Filtros (categoría, ordenamiento)
- Logout
- Persistencia de sesión

### 🔜 Próximamente:
- Company Store (ver productos)
- Carrito de compras
- Checkout
- Mis Pedidos
- Notificaciones

---

## 💡 Tips

1. **Usa Expo Go** para testing rápido (escanea QR)
2. **Android Studio** para emulador Android
3. **Xcode** para simulator iOS (solo Mac)
4. **Logs útiles:** Presiona `j` en la terminal de Expo

---

**¡Listo! Ejecuta `npx expo start -c` y deberías ver la app funcionando! 🚀**
