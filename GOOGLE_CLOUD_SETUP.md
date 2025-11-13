# Configuración de Google Cloud Console para OAuth (ID Token)

## Problema que soluciona
El backend de Vitrina espera recibir un **ID Token** (JWT con formato `eyJhbGciOi...`) pero Google estaba devolviendo un **Access Token** (formato `ya29.A0AT...`).

Los Access Tokens NO son JWT y no pueden ser verificados por Nest → Error: "Wrong number of segments in token"

## ✅ Solución implementada en el código

### 1. Cambio en `useGoogleSignIn.ts`
- ❌ Antes: `useIdTokenAuthRequest` (fallback a access_token)
- ✅ Ahora: `useAuthRequest` con `responseType: 'id_token'`

### 2. Validación estricta
- Solo se acepta `idToken` (JWT)
- Se rechaza `accessToken` con mensaje de error claro

## 🚨 CONFIGURACIÓN OBLIGATORIA EN GOOGLE CLOUD CONSOLE

### Paso 1: Crear un Client ID exclusivo para vitrina.com.ar

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Click en **CREATE CREDENTIALS** → **OAuth Client ID**
5. Selecciona **Web application**

### Paso 2: Configurar el Client ID WEB

**Nombre sugerido:**
```
Vitrina Mobile App (vitrina.com.ar)
```

**Authorized JavaScript origins:**
```
https://vitrina.com.ar
https://www.vitrina.com.ar
```

**Authorized redirect URIs:**
```
https://vitrina.com.ar/auth/google/callback
https://www.vitrina.com.ar/auth/google/callback
```

### Paso 3: Copiar el Client ID

Una vez creado, copia el **Client ID** que se genera (tiene formato: `xxxxx.apps.googleusercontent.com`)

### Paso 4: Actualizar variables de entorno

En tu archivo `.env` de appMobile:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

## 🔍 Verificación

### ¿Cómo saber si está funcionando?

#### ✅ CORRECTO - ID Token (JWT)
En los logs deberías ver:
```
✅ [useGoogleSignIn] ID Token received (JWT format)
🔵 [useGoogleSignIn] Token starts with: eyJhbGciOiJSUzI1NiIs...
```

El token debe tener **3 segmentos** separados por puntos:
```
eyJhbGci...   .   eyJpc3Mi...   .   SflKxwRJ...
 header          payload          signature
```

#### ❌ INCORRECTO - Access Token
Si ves esto en los logs:
```
❌ [useGoogleSignIn] No ID token received from Google
❌ Received: { hasAccessToken: true, hasIdToken: false }
```

Y el token empieza con `ya29.A0AT...` → **REVISAR CONFIGURACIÓN DE GOOGLE CLOUD**

## ⚠️ Errores comunes

### Error: "No se recibió un ID token válido de Google"

**Causas posibles:**

1. **Client ID incorrecto o no configurado**
   - Verifica que `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` esté en `.env`
   - Verifica que el Client ID sea de tipo "Web application"

2. **Redirect URIs no coinciden**
   - Los URIs en Google Cloud deben ser **EXACTAMENTE** iguales a los de tu app
   - Incluye `https://` al inicio
   - Incluye tanto `vitrina.com.ar` como `www.vitrina.com.ar`

3. **JavaScript origins no configurados**
   - Deben incluir solo el dominio base: `https://vitrina.com.ar`
   - NO incluir paths o callbacks en origins

4. **Usando el mismo Client ID que otra aplicación**
   - Si `company.vitrina.com.ar` usa el mismo Client ID → crear uno nuevo
   - Cada dominio debe tener su propio Client ID

### Error: "Wrong number of segments in token"

Este error viene del backend cuando recibe un Access Token en lugar de un ID Token.

**Solución:** Seguir los pasos de configuración arriba.

## 📝 Checklist de configuración

- [ ] Crear nuevo OAuth Client ID de tipo "Web application"
- [ ] Configurar Authorized JavaScript origins
- [ ] Configurar Authorized redirect URIs
- [ ] Copiar el Client ID generado
- [ ] Actualizar `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` en `.env`
- [ ] Reiniciar el servidor de desarrollo (`npm run web`)
- [ ] Probar el login y verificar logs
- [ ] Confirmar que el token empieza con `eyJ...`

## 🆘 Si sigue sin funcionar

1. Verifica que estás usando el Client ID correcto en `.env`
2. Borra el caché de Expo: `npx expo start -c`
3. Abre la consola del navegador y busca errores de CORS
4. Verifica que el dominio coincide con el configurado en Google Cloud
5. Prueba en modo incógnito para evitar cookies/sesiones antiguas
