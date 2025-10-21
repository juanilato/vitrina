/**
 * Notification Types
 */

export type NotificationType =
  | 'pedido_creado'
  | 'pedido_actualizado'
  | 'pedido_rechazado'
  | 'general';

export interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  leida: boolean;
  createdAt: string;
  metadata?: any;
}
