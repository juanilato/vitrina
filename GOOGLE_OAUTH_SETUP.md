# Configuración de Google OAuth 2.0

## Error actual
```
No puedes acceder a esta app porque no cumple con la política OAuth 2.0 de Google.
Request details: redirect_uri=https://vitrina.com.ar
```

## Solución

### 1. Acceder a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo

### 2. Configurar OAuth 2.0

#### A. Ir a Credenciales
1. En el menú lateral, navega a: **APIs y servicios** > **Credenciales**
2. Busca tu **ID de cliente de OAuth 2.0**

#### B. Agregar URIs de redireccionamiento autorizados

Debes agregar las siguientes URIs según tus plataformas:

##### Para Frontend Web (vitrina.com.ar):
```
https://vitrina.com.ar
https://vitrina.com.ar/login
https://vitrina.com.ar/register
http://localhost:5173
http://localhost:5173/login
http://localhost:5173/register
```

##### Para appMobile (Expo):
```
https://auth.expo.io/@tu-username/vitrina
exp://localhost:19000
```

### 3. Configurar Pantalla de Consentimiento OAuth

1. Ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**
2. Configura:
   - **Tipo de usuario**: Externo
   - **Nombre de la aplicación**: Vitrina
   - **Correo electrónico de asistencia**: tu-email@vitrina.com.ar
   - **Dominios autorizados**:
     - `vitrina.com.ar`
     - `expo.io` (si usas Expo)
   - **Alcances**:
     - `email`
     - `profile`
     - `openid`

### 4. Orígenes de JavaScript autorizados

Agrega estos orígenes:
```
http://localhost:5173
https://vitrina.com.ar
```

### 5. Variables de entorno

#### Backend (.env):
```env
GOOGLE_CLIENT_IDS=CLIENT_ID_WEB,CLIENT_ID_ANDROID,CLIENT_ID_IOS
```

#### Frontend (.env):
```env
VITE_GOOGLE_CLIENT_ID=tu-web-client-id.apps.googleusercontent.com
```

#### AppMobile (.env):
```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu-android-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=tu-ios-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu-web-client-id
```

## Verificación

Después de configurar:
1. Guarda los cambios en Google Cloud Console
2. Espera 5-10 minutos para que los cambios se propaguen
3. Prueba nuevamente el login con Google

## Notas importantes

- **Frontend (Web)**: Muestra selector de tipo de cuenta (Empresa/Repartidor) al hacer login/registro con Google
- **AppMobile**: Solo permite registro/login de clientes con Google
- El backend valida automáticamente el tipo de usuario según la plataforma

## Troubleshooting

### Si aún recibes el error:
1. Verifica que el Client ID en tu código coincida con el de Google Cloud Console
2. Asegúrate de que los redirect URIs estén exactamente como se muestran arriba
3. Limpia la caché del navegador
4. Revisa que el proyecto de Google Cloud tenga habilitada la API de Google+ o Google Identity

### Modo desarrollo vs producción:
- **Desarrollo**: Usa `http://localhost:5173`
- **Producción**: Usa `https://vitrina.com.ar`
- Ambos deben estar configurados en Google Cloud Console
