/**
 * Tipos para la integración de MercadoPago Subscriptions
 */

// Datos del suscriptor
export interface SubscriberData {
  email: string;
  first_name?: string;
  last_name?: string;
  identification?: {
    type: 'DNI' | 'CI' | 'LC' | 'LE' | 'CUIL' | 'CUIT' | 'OTRO';
    number: string;
  };
  phone?: {
    area_code: string;
    number: string;
  };
  address?: {
    zip_code: string;
    street_name: string;
    street_number: number;
  };
}

// Datos del plan de suscripción para MercadoPago
export interface MercadoPagoPreapprovalPlan {
  id?: string;
  reason: string; // Descripción del plan
  auto_recurring: {
    frequency: number; // 1 para mensual, 12 para anual
    frequency_type: 'months' | 'years' | 'days';
    transaction_amount: number; // Precio en pesos argentinos
    currency_id: 'ARS';
    // Período de prueba (opcional)
    free_trial?: {
      frequency: number;
      frequency_type: 'months' | 'days';
    };
  };
  back_url: string; // URL de retorno después del pago
  payer_email?: string;
  external_reference?: string; // ID interno de tu sistema
  status?: 'pending' | 'active' | 'paused' | 'cancelled';
}

// Respuesta de MercadoPago al crear una suscripción
export interface MercadoPagoPreapprovalResponse {
  id: string;
  payer_id: number;
  payer_email: string;
  back_url: string;
  collector_id: number;
  application_id: number;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
  reason: string;
  external_reference: string;
  date_created: string;
  last_modified: string;
  init_point: string; // URL para redirigir al usuario al checkout
  sandbox_init_point?: string; // URL para pruebas
  auto_recurring: {
    frequency: number;
    frequency_type: 'months' | 'years' | 'days';
    transaction_amount: number;
    currency_id: 'ARS';
    start_date?: string;
    end_date?: string;
  };
  summarized: {
    charged_amount: number;
    charged_quantity: number;
    pending_charge_amount: number;
    pending_charge_quantity: number;
    semaphore: string;
    last_charged_date: string | null;
    last_charged_amount: number | null;
  };
  next_payment_date: string | null;
  payment_method_id: string | null;
  first_invoice_offset: number | null;
}

// Webhook de MercadoPago para notificaciones de pago
export interface MercadoPagoWebhook {
  id: string;
  live_mode: boolean;
  type: 'subscription_preapproval' | 'subscription_authorized_payment';
  date_created: string;
  application_id: string;
  user_id: string;
  version: string;
  api_version: string;
  action: 'created' | 'updated';
  data: {
    id: string;
  };
}

// Datos necesarios para crear una suscripción en tu backend
export interface CreateSubscriptionPayload {
  planId: string; // ID del plan en tu base de datos
  empresaId: string;
  metodoPagoData?: {
    tipo: string;
    procesador: 'mercadopago';
    metadata?: any;
  };
  mercadoPagoData?: {
    preapprovalId: string; // ID de la suscripción en MercadoPago
    payerId: number;
    payerEmail: string;
    externalReference: string;
  };
}

// Estado del proceso de checkout
export interface CheckoutState {
  loading: boolean;
  error: string | null;
  success: boolean;
  preapprovalId: string | null;
  initPoint: string | null; // URL del checkout de MercadoPago
}

// Configuración para el componente de checkout
export interface CheckoutConfig {
  planId: string;
  empresaId: string;
  subscriberData: SubscriberData;
  onSuccess?: (preapprovalId: string) => void;
  onError?: (error: string) => void;
  onPending?: () => void;
}

// Tipos de estado de la suscripción en MercadoPago
export type MercadoPagoSubscriptionStatus =
  | 'pending' // Pendiente de autorización
  | 'authorized' // Autorizada y activa
  | 'paused' // Pausada por el usuario o falta de pago
  | 'cancelled'; // Cancelada

// Mapeo de estados de MercadoPago a estados internos
export const MP_STATUS_MAP: Record<MercadoPagoSubscriptionStatus, string> = {
  pending: 'PENDIENTE_PAGO',
  authorized: 'ACTIVA',
  paused: 'SUSPENDIDA',
  cancelled: 'CANCELADA',
};

// Note: TypeScript interfaces cannot be used as values in export default
// If you need to export types as a namespace, use a different pattern or just rely on named exports
