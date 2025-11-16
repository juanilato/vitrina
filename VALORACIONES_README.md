# Sistema de Valoraciones - Vitrina

## Descripción

Se ha implementado un sistema completo de valoraciones que permite a los clientes calificar sus pedidos entregados, incluyendo:

- ⭐ **Valoración de empresa** (1-5 estrellas)
- 🍔 **Valoración de productos individuales** con comentarios opcionales
- 🚚 **Valoración de repartidor** (solo para delivery)
- 💬 **Comentarios** para empresa, productos y repartidor
- 🏷️ **Aspectos destacables** predefinidos (chips seleccionables)
- ⏰ **Solicitud automática** después de 10 minutos de entregado el pedido

---

## 📋 Cambios Realizados

### Backend

#### 1. **Schema de Prisma** (`backend/prisma/schema.prisma`)
Se agregaron:
- **Modelo `Valoracion`**: Con relaciones a Pedido, Cliente, Empresa y Repartidor
- **Enums `AspectosEmpresa`** y **`AspectosRepartidor`**: Para aspectos destacables
- **Campo `entregadoAt`** en modelo `Pedido`: Para registrar timestamp de entrega

#### 2. **Módulo de Valoraciones** (`backend/src/valoraciones/`)
- **`valoraciones.service.ts`**: Lógica de negocio completa
  - Crear valoración
  - Verificar si un pedido puede ser valorado
  - Obtener valoraciones por empresa/cliente/pedido
  - Calcular promedios

- **`valoraciones.controller.ts`**: Endpoints REST
  - `POST /valoraciones` - Crear valoración
  - `GET /valoraciones/can-rate/:pedidoId` - Verificar si puede valorar
  - `GET /valoraciones/empresa/:empresaId` - Obtener valoraciones de empresa
  - `GET /valoraciones/empresa/:empresaId/promedio` - Obtener promedio
  - `GET /valoraciones/pedido/:pedidoId` - Obtener valoración de pedido
  - `GET /valoraciones/mis-valoraciones` - Obtener valoraciones del cliente
  - `PATCH /valoraciones/:id` - Actualizar valoración

- **DTOs**:
  - `create-valoracion.dto.ts` - Con validaciones
  - `update-valoracion.dto.ts`

#### 3. **Integración con Pedidos**
- **`pedidos.service.ts`**: Se modificó para guardar `entregadoAt` cuando el estado cambia a "entregado"

---

### Frontend (appMobile)

#### 1. **Tipos TypeScript** (`appMobile/src/types/rating.ts`)
- Enums: `AspectosEmpresa`, `AspectosRepartidor`
- Interfaces: `Valoracion`, `CreateValoracionData`, `ValoracionProducto`, etc.

#### 2. **Constantes** (`appMobile/src/utils/constants.ts`)
- `RATING_REQUEST_DELAY`: 10 minutos en milisegundos
- `ASPECTOS_EMPRESA_LABELS`: Etiquetas legibles para chips
- `ASPECTOS_REPARTIDOR_LABELS`: Etiquetas legibles para chips

#### 3. **Servicio** (`appMobile/src/services/rating.service.ts`)
Métodos:
- `createRating(data)` - Crear valoración
- `canRateOrder(pedidoId)` - Verificar si puede valorar
- `getRatingByOrder(pedidoId)` - Obtener valoración
- `getMyRatings()` - Obtener mis valoraciones
- `getCompanyRatings(empresaId)` - Obtener valoraciones de empresa
- `getCompanyAverage(empresaId)` - Obtener promedio
- `updateRating(id, data)` - Actualizar valoración

#### 4. **Componentes**

##### **RatingStars** (`appMobile/src/components/common/RatingStars.tsx`)
Componente reutilizable para mostrar y seleccionar estrellas.

**Props:**
- `rating: number` - Calificación actual (1-5)
- `onRatingChange?: (rating: number) => void` - Callback cuando cambia
- `size?: 'sm' | 'md' | 'lg'` - Tamaño
- `readonly?: boolean` - Solo lectura
- `showLabel?: boolean` - Mostrar texto descriptivo
- `color?: string` - Color de estrellas activas (default: naranja)

**Ejemplo:**
```tsx
import { RatingStars } from '@/components/common/RatingStars';

<RatingStars
  rating={rating}
  onRatingChange={setRating}
  size="lg"
  showLabel
/>
```

##### **RatingModal** (`appMobile/src/components/ratings/RatingModal.tsx`)
Modal completo para solicitar valoraciones, con 3 pasos:
1. **Valoración de empresa** (obligatorio)
2. **Valoración de productos** (opcional)
3. **Valoración de repartidor** (obligatorio solo para delivery)

**Props:**
- `visible: boolean` - Mostrar/ocultar modal
- `onClose: () => void` - Callback al cerrar
- `pedidoId: string` - ID del pedido a valorar
- `empresaNombre: string` - Nombre de la empresa
- `tipoEntrega: 'delivery' | 'retiro'` - Tipo de entrega
- `productos: OrderItem[]` - Productos del pedido
- `onSuccess?: () => void` - Callback después de enviar valoración

**Características:**
- Diseño paso a paso con indicador de progreso
- Chips seleccionables para aspectos destacables
- TextInput para comentarios opcionales
- Validaciones antes de continuar/enviar
- Loading state durante envío
- Estilos consistentes con el brandbook de Vitrina

#### 5. **Hook Personalizado** (`appMobile/src/hooks/useRatingRequest.ts`)
Hook para manejar la solicitud automática de valoración.

**Uso:**
```tsx
import { useRatingRequest } from '@/hooks/useRatingRequest';
import { RatingModal } from '@/components/ratings/RatingModal';

function OrdersScreen() {
  const { orders } = useOrders();

  const {
    shouldShowRatingModal,
    orderToRate,
    dismissRatingRequest,
    markAsRated,
  } = useRatingRequest(orders);

  return (
    <>
      {/* Tu contenido */}

      {shouldShowRatingModal && orderToRate && (
        <RatingModal
          visible={shouldShowRatingModal}
          onClose={dismissRatingRequest}
          pedidoId={orderToRate.id}
          empresaNombre={orderToRate.empresa.name}
          tipoEntrega={orderToRate.tipoEntrega}
          productos={orderToRate.ItemPedido || []}
          onSuccess={markAsRated}
        />
      )}
    </>
  );
}
```

**Funcionalidad:**
- Detecta pedidos entregados
- Espera 10 minutos después de la entrega
- Verifica si el pedido puede ser valorado
- Muestra el modal automáticamente
- Previene mostrar el mismo pedido múltiples veces

---

## 🎨 Diseño y Estilos

El sistema sigue fielmente el brandbook de Vitrina:

### Colores
- **Primary (Azul oscuro)**: `#0A2A43` - Títulos y textos importantes
- **Orange (Naranja)**: `#F26B1D` - Estrellas activas, botones CTAs, chips seleccionados
- **Secondary (Verde)**: `#2E9D66` - Indicadores de progreso completados
- **Gray**: Varios tonos para textos secundarios, bordes, backgrounds

### Tipografía
- **Títulos**: Bold/Semibold
- **Labels**: Medium
- **Textos**: Regular
- **Tamaños**: xs (12px) a xl (24px)

### Espaciado
- Sistema consistente: `xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`

### Componentes
- **Bordes redondeados**: 8px (md), 12px (lg), 999px (full para chips)
- **Sombras**: Sutiles con shadowOpacity: 0.08
- **Chips**: Con bordes y estados hover/selected claros

---

## 🔧 Integración en tu App

### Paso 1: Actualizar types de Order
Ya está hecho en `appMobile/src/types/order.ts`. Asegúrate de que tu servicio de pedidos incluya `entregadoAt` en las respuestas.

### Paso 2: Agregar el hook en pantalla de pedidos
```tsx
// En app/(tabs)/orders.tsx o donde manejes los pedidos

import { useRatingRequest, RatingModal } from '@/components/ratings';

function OrdersScreen() {
  const { orders, refetch } = useOrders(); // Tu hook actual

  const {
    shouldShowRatingModal,
    orderToRate,
    dismissRatingRequest,
    markAsRated,
  } = useRatingRequest(orders);

  const handleRatingSuccess = () => {
    markAsRated();
    refetch(); // Actualizar lista de pedidos
  };

  return (
    <View>
      {/* Tu UI actual */}

      {/* Modal de valoración */}
      {shouldShowRatingModal && orderToRate && (
        <RatingModal
          visible={shouldShowRatingModal}
          onClose={dismissRatingRequest}
          pedidoId={orderToRate.id}
          empresaNombre={orderToRate.empresa.name}
          tipoEntrega={orderToRate.tipoEntrega}
          productos={orderToRate.ItemPedido || []}
          onSuccess={handleRatingSuccess}
        />
      )}
    </View>
  );
}
```

### Paso 3: (Opcional) Mostrar promedio de empresa
```tsx
import { useEffect, useState } from 'react';
import ratingService from '@/services/rating.service';
import { RatingStars } from '@/components/common/RatingStars';

function CompanyProfile({ empresaId }) {
  const [promedio, setPromedio] = useState(null);

  useEffect(() => {
    ratingService.getCompanyAverage(empresaId).then(setPromedio);
  }, [empresaId]);

  return (
    <View>
      {promedio && (
        <View>
          <RatingStars rating={Math.round(promedio.promedio)} readonly size="md" />
          <Text>{promedio.promedio.toFixed(1)} ({promedio.totalValoraciones} valoraciones)</Text>
        </View>
      )}
    </View>
  );
}
```

---

## 📊 Base de Datos

### Migración
La migración `20251116195329_add_valoraciones_system` ya fue aplicada.

Incluye:
- Tabla `Valoracion`
- Enums `AspectosEmpresa` y `AspectosRepartidor`
- Campo `entregadoAt` en tabla `Pedido`
- Índices para búsquedas optimizadas

### Consultas Útiles

```sql
-- Obtener promedio de empresa
SELECT AVG("calificacionEmpresa") as promedio, COUNT(*) as total
FROM "Valoracion"
WHERE "empresaId" = 'xxx';

-- Obtener valoraciones recientes
SELECT * FROM "Valoracion"
WHERE "empresaId" = 'xxx'
ORDER BY "createdAt" DESC
LIMIT 10;

-- Pedidos sin valorar (entregados hace más de 10 minutos)
SELECT * FROM "Pedido"
WHERE estado = 'entregado'
  AND "entregadoAt" < NOW() - INTERVAL '10 minutes'
  AND id NOT IN (SELECT "pedidoId" FROM "Valoracion");
```

---

## ✅ Testing

### Backend
```bash
# Crear valoración
curl -X POST http://localhost:3001/valoraciones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pedidoId": "xxx",
    "calificacionEmpresa": 5,
    "comentarioEmpresa": "Excelente!",
    "aspectosEmpresa": ["MUY_RICO", "RAPIDO"]
  }'

# Verificar si puede valorar
curl http://localhost:3001/valoraciones/can-rate/PEDIDO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obtener promedio de empresa
curl http://localhost:3001/valoraciones/empresa/EMPRESA_ID/promedio
```

### Frontend
1. Realizar un pedido de prueba
2. Marcar como entregado desde el dashboard de empresa
3. Esperar 10 minutos (o modificar `RATING_REQUEST_DELAY` a 10 segundos para testing)
4. El modal debería aparecer automáticamente en la app mobile

---

## 🚀 Próximos Pasos Sugeridos

1. **Mostrar valoraciones en perfil de empresa**
   - Lista de valoraciones con paginación
   - Filtros por calificación
   - Ordenar por fecha

2. **Notificaciones push**
   - Notificar a empresa cuando recibe nueva valoración
   - Notificar a cliente para recordar valorar (si no lo hizo en 24hs)

3. **Estadísticas para empresas**
   - Dashboard con gráficos de valoraciones
   - Tendencias de calificación
   - Productos mejor/peor valorados

4. **Moderación**
   - Sistema para reportar valoraciones inapropiadas
   - Panel de administración para revisar

---

## 📝 Notas Importantes

- **Solo clientes pueden valorar**: El sistema verifica que el usuario sea un cliente
- **Un pedido = una valoración**: No se pueden crear múltiples valoraciones para el mismo pedido
- **Solo pedidos entregados**: No se pueden valorar pedidos en otros estados
- **Valoración de repartidor**: Solo se solicita si `tipoEntrega === 'delivery'`
- **Aspectos destacables**: Son opcionales pero mejoran la experiencia
- **Comentarios**: Todos los comentarios son opcionales

---

## 🐛 Troubleshooting

### El modal no aparece automáticamente
1. Verificar que el pedido tenga `entregadoAt` en la respuesta
2. Verificar que hayan pasado 10 minutos desde `entregadoAt`
3. Verificar que el pedido no haya sido valorado ya
4. Revisar consola para errores del hook

### Error al enviar valoración
1. Verificar que el token JWT sea válido
2. Verificar que el pedido pertenezca al cliente
3. Verificar que la calificación de empresa sea > 0
4. Si es delivery, verificar que la calificación de repartidor sea > 0

### Estilos no se ven correctos
1. Verificar que se estén usando los colores de `@/theme/colors`
2. Verificar que el spacing sea del sistema `@/theme/spacing`
3. Asegurarse de que los borderRadius sean consistentes

---

## 📚 Documentación de Referencia

- **Brandbook Vitrina**: Colores y tipografía oficial
- **Prisma Docs**: https://www.prisma.io/docs
- **NestJS Docs**: https://docs.nestjs.com
- **React Native**: https://reactnative.dev
- **Expo**: https://docs.expo.dev

---

¡Sistema de valoraciones completamente funcional y listo para usar! 🎉
