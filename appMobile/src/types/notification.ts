/**
 * Notification Types
 */

export type NotificationType =
  | 'pedido_creado'
  | 'pedido_actualizado'
  | 'pedido_rechazado'
  | 'order_created'
  | 'order_updated'
  | 'order_cancelled'
  | 'order_delivered'
  | 'general';

export interface Notification {
  id: string;
  titulo: string;           // Backend usa español
  mensaje: string;          // Backend usa español
  tipo: NotificationType;   // Backend usa español
  leida: boolean;           // Backend usa español
  createdAt: string;
  metadata?: {              // Metadata con información del pedido
    pedidoId?: string;
    clienteId?: string;
    empresaId?: string;
    clienteName?: string;
    empresaName?: string;
    totalAmount?: number;
    oldStatus?: string;
    newStatus?: string;
    icono?: string;
    deliveryLocation?: {
      direccion: string;
      lat: number;
      lng: number;
    };
    shippingPrice?: {
      price: number | null;
      isEstimated: boolean;
      message: string;
    };
    [key: string]: any;
  };
}
