# Lógica de Estados de Pedidos

## Flujo de Estados por Tipo de Entrega

### Para Delivery (🚚)
```
pendiente_confirmacion → confirmado → en_proceso → esperando_delivery → en_camino → entregado
```

### Para Retiro (🏪)
```
pendiente_confirmacion → confirmado → en_proceso → esperando_retiro → entregado
```

## Descripción de Estados

### Estados Comunes
- **pendiente_confirmacion** (⏳): Pedido recibido, esperando confirmación del negocio
- **confirmado** (✅): Pedido confirmado por el negocio
- **en_proceso** (⚙️): Pedido siendo preparado
- **entregado** (✅): Pedido completado

### Estados Específicos de Delivery
- **esperando_delivery** (🚚): Pedido listo, esperando ser enviado por delivery
- **en_camino** (🚛): Pedido en camino hacia la dirección del cliente

### Estados Específicos de Retiro
- **esperando_retiro** (🏪): Pedido listo para ser retirado en el local

## Colores de Estados
- pendiente_confirmacion: #f59e0b (amber)
- confirmado: #8b5cf6 (purple)
- en_proceso: #3b82f6 (blue)
- esperando_delivery: #f97316 (orange)
- en_camino: #06b6d4 (cyan)
- entregado: #059669 (emerald)
- esperando_retiro: #84cc16 (lime)
- cancelado: #ef4444 (red)

## Implementación

La lógica está implementada en:
- `pedidosService.getNextStatus()`: Determina el siguiente estado según el tipo de entrega
- `pedidosService.getNextStatusText()`: Obtiene el texto del siguiente estado
- `OrderCard` y `OrderModal`: Muestran los botones de acción según el estado actual
- `OrdersSection`: Incluye filtros para todos los estados

## Backend

- **Schema Prisma**: Actualizado para incluir los nuevos estados
- **DTOs**: Validación actualizada para los nuevos estados
- **Servicio**: Estadísticas actualizadas para incluir contadores de nuevos estados
