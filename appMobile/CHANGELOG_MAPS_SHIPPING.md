# Changelog - Integración de Google Maps y Cálculo de Envío

## Fecha: 2025-10-21

### Resumen
Integración completa de Google Maps para selección de ubicación y cálculo automático de precios de envío basado en distancia y configuración de la empresa. También se corrigió el error de ImagePicker.

---

## Cambios Realizados

### 1. Nuevos Archivos Creados

#### `src/services/shipping.service.ts`
Servicio para el cálculo de precios de envío que incluye:
- `calculateShippingPrice()`: Calcula el precio de envío consultando el backend
- `calculateDistance()`: Calcula distancia usando la fórmula de Haversine
- `findClosestLocation()`: Encuentra la sucursal más cercana a la ubicación del cliente

#### `src/components/common/LocationPicker.tsx`
Componente modal con mapa interactivo que permite:
- Seleccionar ubicación tocando el mapa
- Usar ubicación actual del dispositivo
- Arrastrar el marcador para ajustar la posición
- Ver la dirección aproximada usando geocodificación inversa
- Interfaz moderna con iOS design

#### `.env.example`
Plantilla para variables de entorno que incluye:
- URL del API backend
- Google Maps API Key
- Configuraciones de Expo

#### `GOOGLE_MAPS_SETUP.md`
Documentación completa para:
- Obtener API Keys de Google Cloud Console
- Configurar restricciones de seguridad
- Instalar y configurar la aplicación
- Solucionar problemas comunes
- Recursos adicionales

### 2. Archivos Modificados

#### `app/checkout.tsx`
**Correcciones:**
- ✅ **FIX ImagePicker**: Cambiado de `launchImagePickerAsync` (que no existe) a `launchImageLibraryAsync`

**Nuevas funcionalidades:**
- Integración del componente `LocationPicker`
- Cálculo automático de precio de envío basado en ubicación
- Visualización de precio estimado vs precio exacto
- Estados de carga mientras se calcula el envío
- Almacenamiento de ubicación seleccionada con coordenadas
- Integración con el servicio de shipping

**Nuevos estados:**
```typescript
const [showLocationPicker, setShowLocationPicker] = useState(false);
const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
const [shippingPrice, setShippingPrice] = useState<ShippingPriceResponse | null>(null);
const [calculatingShipping, setCalculatingShipping] = useState(false);
```

**Función mejorada:**
```typescript
const calculateDeliveryFee = async (location?: DeliveryLocation)
```
Ahora:
1. Obtiene las ubicaciones de la empresa
2. Encuentra la sucursal más cercana
3. Calcula el precio exacto usando el backend
4. Muestra precio estimado si falla el cálculo

**UI mejorada:**
- Badge "Estimado" cuando el precio no es exacto
- Mensaje explicativo sobre el precio
- Indicador de carga "Calculando..."

#### `src/services/order.service.ts`
**Nuevo método:**
```typescript
async getCompanyDetails(empresaId: string): Promise<CompanyWithProducts>
```
Obtiene los detalles de la empresa incluyendo sus ubicaciones para el cálculo de envío.

#### `src/components/common/index.ts`
Agregada exportación del nuevo componente:
```typescript
export { LocationPicker } from './LocationPicker';
```

#### `app.json`
**Configuración de Google Maps:**
- Agregada API Key para iOS en `ios.config.googleMapsApiKey`
- Agregada API Key para Android en `android.config.googleMaps.apiKey`
- Marcadores de posición que deben ser reemplazados con las keys reales

#### `package.json`
**Nueva dependencia instalada:**
- `expo-location@^19.0.1`: Para manejo de ubicación y geocodificación

**Dependencias ya existentes utilizadas:**
- `react-native-maps@^1.26.17`: Para visualización de mapas
- `expo-image-picker@^17.0.8`: Para subida de comprobantes

### 3. Tipos Actualizados

Los siguientes tipos del backend ya estaban definidos en `src/types/order.ts`:
```typescript
interface DeliveryLocation {
  direccion: string;
  lat: number;
  lng: number;
}

interface ShippingPriceResponse {
  price: number | null;
  isEstimated: boolean;
  message: string;
}
```

---

## Flujo de Usuario

### 1. Selección de Ubicación
```
Usuario en Checkout
  → Selecciona "Delivery"
  → Click en "Seleccionar en el mapa"
  → Se abre modal con mapa
  → Usuario puede:
     - Tocar el mapa
     - Usar ubicación actual
     - Arrastrar marcador
  → Confirma ubicación
  → Se cierra el modal
```

### 2. Cálculo de Precio
```
Ubicación seleccionada
  → Sistema obtiene ubicaciones de empresa
  → Calcula distancia a cada sucursal
  → Encuentra la más cercana
  → Consulta precio al backend
  → Backend usa configuración de zonas de precio
  → Retorna precio exacto o estimado
  → Se muestra en el resumen del pedido
```

### 3. Subida de Comprobante
```
Usuario selecciona "Transferencia"
  → Click en "Subir comprobante"
  → Se solicitan permisos (si es primera vez)
  → Se abre galería de fotos
  → Usuario selecciona imagen
  → Imagen se convierte a base64
  → Se muestra preview
  → Se envía con el pedido
```

---

## Características Técnicas

### Seguridad
- API Keys separadas para iOS y Android
- Posibilidad de restringir por bundle ID / package name
- Variables de entorno no committeadas (`.env` en `.gitignore`)

### Performance
- Cálculo de distancia optimizado con Haversine
- Geocodificación inversa para mostrar dirección legible
- Carga asíncrona de datos
- Estados de loading apropiados

### UX/UI
- Diseño moderno siguiendo iOS guidelines
- Feedback visual claro (loading, estimado, confirmado)
- Manejo de errores con mensajes amigables
- Permisos solicitados en el momento adecuado

### Manejo de Errores
- Fallback a precio estimado si falla el cálculo
- Mensajes informativos para el usuario
- Logs detallados en consola para debugging
- No bloquea el flujo si algo falla

---

## Dependencias del Backend

Para que funcione correctamente, el backend debe tener:

1. **Endpoint de cálculo de precio:**
   ```
   POST /empresas/:id/calcular-precio-envio
   Body: { clienteLat, clienteLng, ubicacionId }
   ```

2. **Endpoint de empresa pública:**
   ```
   GET /public/empresas/:id
   Retorna: Empresa con ubicaciones
   ```

3. **Sistema de zonas de precio configurado:**
   - Empresa debe tener ubicaciones con lat/lng
   - Ubicaciones deben tener zonas de precio configuradas
   - Lógica de cálculo basada en distancia

---

## Testing Recomendado

### Funcionalidad de Mapas
- [ ] El mapa se muestra correctamente
- [ ] Se puede obtener ubicación actual
- [ ] Se puede seleccionar ubicación tocando el mapa
- [ ] Se puede arrastrar el marcador
- [ ] La dirección se obtiene correctamente
- [ ] La ubicación se confirma y guarda

### Cálculo de Precio
- [ ] El precio se calcula automáticamente al seleccionar ubicación
- [ ] Muestra "Estimado" cuando corresponde
- [ ] Muestra precio exacto cuando el backend lo provee
- [ ] Cambia a $0 cuando se selecciona "Retiro"
- [ ] Muestra loading mientras calcula

### ImagePicker
- [ ] Se solicitan permisos correctamente
- [ ] Se abre la galería
- [ ] Se puede seleccionar una imagen
- [ ] La imagen se muestra en preview
- [ ] Se puede remover la imagen
- [ ] La imagen se envía correctamente con el pedido

### Integración
- [ ] El pedido se crea correctamente con ubicación
- [ ] El pedido incluye el precio de envío calculado
- [ ] El comprobante se envía si es transferencia
- [ ] Los datos se persisten correctamente

---

## Próximos Pasos Sugeridos

1. **Autocompletado de direcciones**: Integrar Google Places Autocomplete
2. **Historial de direcciones**: Guardar direcciones frecuentes del usuario
3. **Múltiples direcciones**: Permitir guardar varias direcciones
4. **Tracking en tiempo real**: Mostrar ubicación del delivery en el mapa
5. **Optimización de rutas**: Sugerir mejor ruta para el delivery

---

## Notas Importantes

- **Google Maps requiere facturación habilitada** en Google Cloud, aunque uses el nivel gratuito
- **Las API Keys deben restringirse en producción** por seguridad
- **Revisar límites de uso** para evitar costos inesperados
- **El archivo .env NO debe subirse a git** (ya está en .gitignore)
- **Reemplazar las API Keys de placeholder** en app.json antes de compilar

---

## Soporte

Para más información, consulta:
- [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) - Guía completa de configuración
- [README.md](./README.md) - Documentación general del proyecto
