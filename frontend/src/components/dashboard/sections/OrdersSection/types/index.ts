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
  estado: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'esperando_delivery' | 'en_camino' | 'entregado' | 'esperando_retiro' | 'no_confirmado' | 'cancelado';
  tipoEntrega: 'delivery' | 'retiro';
  formaPago: 'transferencia' | 'efectivo';
  motivoRechazo?: string;
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
  estado?: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'esperando_delivery' | 'en_camino' | 'entregado' | 'esperando_retiro' | 'cancelado';
}

export interface OrdersStats {
  total: number;
  pendientesConfirmacion: number;
  confirmados: number;
  noConfirmados: number;
  enProceso: number;
  esperandoDelivery: number;
  enCamino: number;
  entregados: number;
  esperandoRetiro: number;
}

export interface OrderCardProps {
  pedido: PedidoWithDetails;
  onUpdateStatus: (pedidoId: string, newStatus: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'esperando_delivery' | 'en_camino' | 'entregado' | 'esperando_retiro') => void;
  onViewDetails: (pedido: PedidoWithDetails) => void;
  onReject?: (pedidoId: string, motivo?: string) => void;
  onDelete?: (pedidoId: string) => void;
}

export interface OrderModalProps {
  pedido: PedidoWithDetails | null;
  onClose: () => void;
  onUpdateStatus?: (pedidoId: string, newStatus: 'pendiente_confirmacion' | 'confirmado' | 'en_proceso' | 'esperando_delivery' | 'en_camino' | 'entregado' | 'esperando_retiro') => void;
}
