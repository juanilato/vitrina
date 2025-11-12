# 🚀 Configuración de MercadoPago para Suscripciones

Este documento explica cómo configurar MercadoPago para gestionar suscripciones recurrentes en tu aplicación.

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Obtener Credenciales de MercadoPago](#obtener-credenciales-de-mercadopago)
3. [Configuración del Frontend](#configuración-del-frontend)
4. [Configuración del Backend](#configuración-del-backend)
5. [Flujo de Suscripción](#flujo-de-suscripción)
6. [Testing](#testing)
7. [Producción](#producción)
8. [Webhooks](#webhooks)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

- Cuenta de MercadoPago Argentina (https://www.mercadopago.com.ar/)
- CUIT/CUIL registrado en MercadoPago
- Cuenta de vendedor activada

---

## 🔑 Obtener Credenciales de MercadoPago

### 1. Accede al Panel de Desarrolladores

Ve a: **https://www.mercadopago.com.ar/developers/panel**

### 2. Navega a la sección de Credenciales

- En el menú lateral, selecciona **"Credenciales"**
- Verás dos tipos de credenciales:
  - **TEST**: Para desarrollo y pruebas
  - **PRODUCCIÓN**: Para ambiente de producción

### 3. Copia tus credenciales

Necesitarás:

#### Para el Frontend (React):
- **Public Key** (comienza con `TEST-` o `APP_USR-`)

#### Para el Backend (NestJS):
- **Access Token** (comienza con `TEST-` o `APP_USR-`)

**⚠️ IMPORTANTE:**
- La **Public Key** es segura para usar en el frontend
- El **Access Token** NUNCA debe exponerse en el frontend, solo en el backend

---

## 🎨 Configuración del Frontend

### 1. Crear archivo `.env`

En la carpeta `frontend`, crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

### 2. Agregar la Public Key

Abre el archivo `.env` y agrega tu Public Key:

```env
# Para TEST
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# O para PRODUCCIÓN (cuando estés listo)
REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. Reiniciar el servidor de desarrollo

```bash
npm start
```

**Nota:** Las variables de entorno en React requieren reiniciar el servidor para aplicar cambios.

---

## ⚙️ Configuración del Backend

### 1. Crear archivo `.env` en el backend

En la carpeta `backend`, crea un archivo `.env` basado en `.env.example`:

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` y agrega tu Access Token de MercadoPago:

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend URL (para callbacks de pago)
FRONTEND_URL=http://localhost:3000

# Backend URL (para webhooks)
BACKEND_URL=http://localhost:3001

# Base de datos y otras configuraciones...
DATABASE_URL=postgresql://user:password@localhost:5432/vitrina
```

### 2. Instalar SDK de MercadoPago

✅ **Ya está instalado** - El SDK de MercadoPago ya fue instalado en el proyecto.

```bash
cd backend
npm install mercadopago --legacy-peer-deps
```

### 3. Servicios y Módulos creados

✅ **Ya están creados** - Los siguientes módulos ya están implementados:

- `backend/src/mercadopago/mercadopago.service.ts` - Servicio para interactuar con la API de MercadoPago
- `backend/src/mercadopago/mercadopago.module.ts` - Módulo de MercadoPago
- `backend/src/webhooks/webhooks.controller.ts` - Controlador para recibir webhooks
- `backend/src/webhooks/webhooks.service.ts` - Servicio para procesar webhooks
- `backend/src/webhooks/webhooks.module.ts` - Módulo de webhooks

### 4. Endpoints disponibles

Los siguientes endpoints ya están configurados:

- `POST /subscriptions/mercadopago/create-preference` - Crear preferencia de pago
- `GET /subscriptions/mercadopago/payment/:paymentId` - Obtener información de un pago
- `POST /webhooks/mercadopago` - Recibir notificaciones de MercadoPago

### 5. Reiniciar el servidor del backend

Después de configurar las variables de entorno, reinicia el servidor:

```bash
cd backend
npm run start:dev
```

---

## 🔄 Flujo de Suscripción

### Paso a Paso:

1. **Usuario selecciona un plan** en el frontend (SubscriptionTab)
2. **Frontend abre el diálogo de checkout** (MercadoPagoCheckout)
3. **Usuario hace clic en "Pagar con Mercado Pago"**
4. **Frontend llama al endpoint** `POST /subscriptions/mercadopago/create-preference`
5. **Backend crea una Preferencia de Pago** en MercadoPago con los datos del plan
6. **MercadoPago retorna una URL de checkout** (`init_point` o `sandbox_init_point`)
7. **Usuario es redirigido** a la página de pago de MercadoPago
8. **Usuario elige su método de pago** (tarjeta, QR, transferencia, efectivo)
9. **Usuario completa el pago** en MercadoPago
10. **MercadoPago envía un webhook** al endpoint `/webhooks/mercadopago`
11. **Backend procesa el webhook** y crea la suscripción en la base de datos
12. **MercadoPago redirige al usuario** de vuelta a tu app
13. **Usuario ve confirmación** de que la suscripción fue procesada

---

## 🧪 Testing

### Usar Tarjetas de Prueba

MercadoPago provee tarjetas de prueba para testing:

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | ✅ Aprobado |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | ✅ Aprobado |
| Visa | 4000 0000 0000 0010 | 123 | 11/25 | ❌ Rechazado |

**Más tarjetas de prueba:** https://www.mercadopago.com.ar/developers/es/docs/your-integrations/test/cards

### Ambiente de Pruebas

Cuando uses credenciales de **TEST**:
- No se cobrarán pagos reales
- Todas las transacciones son simuladas
- Puedes usar las tarjetas de prueba

---

## 🚀 Producción

### Checklist antes de ir a producción:

- [ ] Cambiar las credenciales de TEST a PRODUCCIÓN
- [ ] Configurar los webhooks en MercadoPago
- [ ] Verificar que las URLs de callback sean HTTPS
- [ ] Activar tu cuenta de vendedor en MercadoPago
- [ ] Configurar CUIT/CUIL en MercadoPago
- [ ] Probar el flujo completo en modo TEST
- [ ] Verificar que los webhooks funcionen correctamente
- [ ] Agregar manejo de errores robusto
- [ ] Configurar logs para debugging
- [ ] Revisar que las suscripciones se cancelen correctamente

### Cambiar a credenciales de PRODUCCIÓN:

**Frontend (.env):**
```env
REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Backend (.env):**
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URLs de producción (cambiar a tus dominios reales)
FRONTEND_URL=https://tu-dominio.com
BACKEND_URL=https://api.tu-dominio.com
```

### ⚠️ IMPORTANTE: Diferencias entre TEST y PRODUCCIÓN

**Con credenciales de TEST:**
- MercadoPago genera URLs de sandbox (`sandbox_init_point`)
- Los pagos son simulados (no reales)
- Puedes usar tarjetas de prueba
- Los webhooks apuntan a entornos de prueba

**Con credenciales de PRODUCCIÓN:**
- MercadoPago genera URLs de producción (`init_point`)
- Los pagos son REALES y se cobran a los clientes
- Solo funcionan tarjetas reales
- Los webhooks apuntan a tu servidor de producción
- **Necesitas tener tu cuenta de vendedor activada y verificada**

### 🔄 Cómo funciona el cambio automático:

El código ya está preparado para cambiar automáticamente entre TEST y PRODUCCIÓN:

1. **Frontend**: Usa siempre `init_point` - MercadoPago automáticamente devuelve la URL correcta según las credenciales
2. **Backend**: Según el `MERCADOPAGO_ACCESS_TOKEN` que uses:
   - Si comienza con `TEST-` → Modo prueba
   - Si comienza con `APP_USR-` → Modo producción

**No necesitas cambiar código**, solo las variables de entorno.

---

## 🔔 Webhooks

Los webhooks permiten que MercadoPago notifique a tu backend sobre cambios en las suscripciones.

### 1. Configurar URL del Webhook

Ve a: **https://www.mercadopago.com.ar/developers/panel/webhooks**

Agrega la URL de tu backend:
```
https://tu-dominio.com/api/webhooks/mercadopago
```

### 2. Crear endpoint para recibir webhooks

En `backend/src/webhooks/webhooks.controller.ts`:

```typescript
@Post('mercadopago')
async handleMercadoPagoWebhook(@Body() body: any, @Headers('x-signature') signature: string) {
  // Verificar la firma del webhook
  // Procesar el evento
  // Actualizar la base de datos

  if (body.type === 'subscription_preapproval') {
    const preapprovalId = body.data.id;
    // Obtener información de la suscripción
    const subscription = await this.mercadoPagoService.getPreapproval(preapprovalId);
    // Actualizar en base de datos
  }

  return { received: true };
}
```

### 3. Eventos importantes:

- `subscription_preapproval` - Creación de suscripción
- `subscription_authorized_payment` - Pago autorizado
- `subscription_paused` - Suscripción pausada
- `subscription_cancelled` - Suscripción cancelada

---

## 🐛 Troubleshooting

### Error: "MercadoPago no está configurado correctamente"

**Solución:**
- Verifica que hayas agregado `REACT_APP_MERCADOPAGO_PUBLIC_KEY` en el archivo `.env`
- Reinicia el servidor de desarrollo (`npm start`)
- Verifica que la clave comience con `TEST-` o `APP_USR-`

### Error: "Invalid credentials"

**Solución:**
- Verifica que hayas copiado correctamente la Public Key
- Asegúrate de usar credenciales de TEST en desarrollo
- Revisa que no haya espacios al inicio o final de la clave

### Error: "CORS error al crear suscripción"

**Solución:**
- Configura CORS en tu backend para permitir peticiones desde el frontend
- En `backend/src/main.ts`, agrega:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### La página de checkout no abre

**Solución:**
- Verifica que el `init_point` se esté generando correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que el backend esté retornando el `init_point`

---

## 📚 Recursos Adicionales

- [Documentación oficial de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs)
- [Suscripciones en MercadoPago](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/introduction)
- [SDK de React](https://github.com/mercadopago/sdk-react)
- [SDK de NodeJS](https://github.com/mercadopago/sdk-nodejs)

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa la [documentación oficial](https://www.mercadopago.com.ar/developers/es/support)
2. Contacta al soporte de MercadoPago
3. Revisa los logs del backend y frontend

---

## ✅ Checklist Final

### Backend
- [x] SDK de MercadoPago instalado (`mercadopago`)
- [ ] Access Token configurado en `backend/.env`
- [x] Servicio `MercadoPagoService` creado
- [x] Módulo `MercadoPagoModule` creado
- [x] Endpoints de MercadoPago en `SubscriptionsController`
- [x] Controlador y servicio de webhooks creados
- [x] Módulo de webhooks registrado en `AppModule`
- [ ] Variables `FRONTEND_URL` y `BACKEND_URL` configuradas

### Frontend
- [x] SDK de MercadoPago instalado (`@mercadopago/sdk-react`)
- [ ] Public Key configurada en `frontend/.env`
- [x] Componente `MercadoPagoCheckout` creado y simplificado
- [x] Hook `useSubscriptionCheckout` actualizado
- [x] `SubscriptionTab` actualizado (sin métodos de pago manuales)
- [x] Integración con botón de pago de MercadoPago

### Testing
- [ ] Flujo de pago testeado con tarjetas de prueba
- [ ] Flujo con código QR testeado
- [ ] Webhooks testeados (usar ngrok o similar para desarrollo)
- [ ] Flujo de cancelación testeado

### Producción
- [ ] Credenciales de TEST cambiadas a PRODUCCIÓN
- [ ] Webhooks configurados en panel de MercadoPago
- [ ] URLs de callback configuradas correctamente
- [ ] SSL/HTTPS configurado en producción

---

¡Listo! 🎉 Ahora puedes comenzar a recibir suscripciones con MercadoPago.
