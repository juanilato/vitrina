/**
 * OrdersSection - UI-specific types
 * Usa tipos compartidos de @/types/models
 */

import { PedidoWithDetails, EstadoPedido } from '../../../../../types/models';

// DTOs para API
export interface CreatePedidoDto {
  clienteId: string;
  empresaId: string;
  items: {
    productoId: string;
    cantidad: number;
    precio: number;
  }[];
}

export interface UpdatePedidoDto {
  estado?: EstadoPedido;
}

// Props de componentes UI
export interface OrderCardProps {
  pedido: PedidoWithDetails;
  onUpdateStatus: (pedidoId: string, newStatus: EstadoPedido) => void;
  onViewDetails: (pedido: PedidoWithDetails) => void;
  onReject?: (pedidoId: string, motivo?: string) => void;
  onDelete?: (pedidoId: string) => void;
}

export interface OrderModalProps {
  pedido: PedidoWithDetails | null;
  onClose: () => void;
  onUpdateStatus?: (pedidoId: string, newStatus: EstadoPedido) => void;
}

// Re-export modelos compartidos para compatibilidad
export type {
  PedidoWithDetails,
  Pedido,
  EstadoPedido,
  ItemPedido,
  IngredienteExtra,
  PromocionAplicada,
  Valoracion,
  OrdersStats,
  TipoEntrega,
  FormaPago,
  OrigenPedido
} from '../../../../../types/models';
