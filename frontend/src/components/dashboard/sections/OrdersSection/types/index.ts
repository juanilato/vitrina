export interface ItemPedido {
  id: string;
  pedidoId: string;
  productoId: string;
  cantidad: number;
  precio: number;
  producto?: {
    id: string;
    nombre: string;
    precio: number;
  };
}

export interface Pedido {
  id: string;
  clienteId: string;
  empresaId: string;
  estado: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'listo' | 'cancelado';
  createdAt: string;
  updatedAt: string;
}

export interface PedidoWithDetails extends Pedido {
  items?: ItemPedido[];
  cliente?: {
    id: string;
    name: string;
    email: string;
  };
  total?: number;
}

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
  estado?: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'listo' | 'cancelado';
}

export interface OrdersStats {
  total: number;
  pendientesConfirmacion: number;
  confirmados: number;
  enProceso: number;
  listos: number;
}

export interface OrderCardProps {
  pedido: PedidoWithDetails;
  onUpdateStatus: (pedidoId: string, newStatus: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'listo') => void;
  onViewDetails: (pedido: PedidoWithDetails) => void;
  onDelete?: (pedidoId: string) => void;
}

export interface OrderModalProps {
  pedido: PedidoWithDetails | null;
  onClose: () => void;
  onUpdateStatus?: (pedidoId: string, newStatus: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'listo') => void;
}
