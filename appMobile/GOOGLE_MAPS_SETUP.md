# Configuración de Google Maps API

Esta guía te ayudará a configurar Google Maps en la aplicación móvil de Vitrina.

## 1. Obtener API Keys de Google Maps

### Paso 1: Ir a Google Cloud Console
1. Visita [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente

### Paso 2: Habilitar APIs necesarias
1. En el menú lateral, ve a **APIs y servicios > Biblioteca**
2. Busca y habilita las siguientes APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Geocoding API**
   - **Places API** (opcional, para autocompletado de direcciones)

### Paso 3: Crear credenciales
1. Ve a **APIs y servicios > Credenciales**
2. Haz clic en **Crear credenciales > Clave de API**
3. Se creará una nueva API Key

### Paso 4: Restringir las API Keys (Recomendado para producción)

#### Para Android:
1. Haz clic en la API Key creada
2. En **Restricciones de aplicación**, selecciona **Aplicaciones de Android**
3. Agrega el nombre del paquete: `com.vitrina.cliente`
4. Agrega la huella digital SHA-1 de tu certificado de firma
   - Para obtenerla en desarrollo: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
5. En **Restricciones de API**, selecciona:
   - Maps SDK for Android
   - Geocoding API

#### Para iOS:
1. Crea otra API Key (o usa la misma si no vas a restringir)
2. En **Restricciones de aplicación**, selecciona **Aplicaciones de iOS**
3. Agrega el Bundle ID: `com.vitrina.cliente`
4. En **Restricciones de API**, selecciona:
   - Maps SDK for iOS
   - Geocoding API

## 2. Configurar las API Keys en la aplicación

### Paso 1: Crear archivo .env
1. Copia el archivo `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` y reemplaza los valores:
   ```env
   # API Configuration
   API_URL=http://TU_IP_LOCAL:3001/api

   # Google Maps API Key
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=TU_GOOGLE_MAPS_API_KEY_AQUI

   # Expo Configuration
   EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3001/api
   ```

### Paso 2: Actualizar app.json
1. Abre el archivo `app.json`
2. Reemplaza las API Keys en las configuraciones de iOS y Android:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "TU_GOOGLE_MAPS_IOS_API_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "TU_GOOGLE_MAPS_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

## 3. Instalar dependencias

Si aún no lo has hecho, instala las dependencias necesarias:

```bash
npm install
```

Las dependencias ya incluidas son:
- `react-native-maps`: Para mostrar mapas
- `expo-location`: Para obtener la ubicación del usuario

## 4. Ejecutar la aplicación

### En Android:
```bash
npm run android
```

### En iOS:
```bash
npm run ios
```

### En Web (desarrollo):
```bash
npm start
```

## 5. Permisos necesarios

La aplicación solicitará automáticamente los siguientes permisos:

### Android:
- `ACCESS_FINE_LOCATION`: Para obtener la ubicación precisa
- `ACCESS_COARSE_LOCATION`: Para obtener la ubicación aproximada
- `READ_EXTERNAL_STORAGE`: Para leer imágenes de la galería
- `CAMERA`: Para tomar fotos de comprobantes

### iOS:
- `NSLocationWhenInUseUsageDescription`: Para usar la ubicación mientras se usa la app
- `NSPhotoLibraryUsageDescription`: Para acceder a la galería de fotos
- `NSCameraUsageDescription`: Para usar la cámara

## 6. Uso de las funcionalidades

### Selección de ubicación con mapa:
1. En la pantalla de checkout, selecciona **Delivery**
2. Haz clic en **Seleccionar en el mapa**
3. Se abrirá un mapa interactivo
4. Puedes:
   - Tocar en el mapa para seleccionar una ubicación
   - Usar el botón de ubicación actual para obtener tu posición
   - Arrastrar el marcador para ajustar la posición
5. Confirma la ubicación seleccionada

### Cálculo automático de precio de envío:
1. Una vez seleccionada la ubicación, el sistema:
   - Encuentra la sucursal más cercana de la empresa
   - Calcula la distancia entre tu ubicación y la sucursal
   - Consulta el precio de envío configurado por la empresa
   - Muestra el precio exacto o estimado en el resumen del pedido

### Subida de comprobantes de pago:
1. Selecciona **Transferencia** como método de pago
2. Haz clic en **Subir comprobante**
3. Selecciona una imagen de tu galería
4. La imagen se convertirá a base64 y se enviará con el pedido

## 7. Solución de problemas

### El mapa no se muestra:
- Verifica que las API Keys estén correctamente configuradas
- Asegúrate de que las APIs estén habilitadas en Google Cloud Console
- Verifica que las restricciones de la API Key permitan el uso desde tu aplicación

### Error de permisos:
- Verifica que los permisos estén declarados en `app.json`
- En dispositivos físicos, asegúrate de aceptar los permisos cuando se soliciten
- En iOS, verifica las descripciones de permisos en `infoPlist`

### El precio de envío no se calcula:
- Verifica que el backend esté corriendo
- Asegúrate de que la empresa tenga ubicaciones configuradas
- Verifica que la empresa tenga zonas de precio configuradas
- Revisa los logs del servidor para ver errores

### Error de ImagePicker:
- Asegúrate de usar `launchImageLibraryAsync` en lugar de `launchImagePickerAsync`
- Verifica que `expo-image-picker` esté instalado correctamente
- Acepta los permisos de galería cuando se soliciten

## 8. Recursos adicionales

- [Documentación de Google Maps Platform](https://developers.google.com/maps)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

## 9. Notas importantes

- **Seguridad**: En producción, siempre restringe tus API Keys por aplicación y por API
- **Costos**: Google Maps tiene un nivel gratuito, pero revisa los precios si esperas alto tráfico
- **Billing**: Debes habilitar la facturación en Google Cloud, aunque uses el nivel gratuito
- **Límites**: Revisa los límites de uso de las APIs para evitar cargos inesperados
- **.env**: Nunca subas el archivo `.env` a un repositorio público (está en `.gitignore`)

## 10. Variables de entorno

Archivo `.env`:
```env
# Backend API
API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Recuerda reemplazar:
- `192.168.1.100` con la IP de tu servidor backend
- `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` con tu API Key real de Google Maps
