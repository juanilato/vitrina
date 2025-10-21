/**
 * Order (Pedido) Types
 */

import { Product } from './company';

export type OrderStatus =
  | 'pendiente_confirmacion'
  | 'confirmado'
  | 'en_proceso'
  | 'esperando_delivery'
  | 'en_camino'
  | 'entregado'
  | 'esperando_retiro'
  | 'no_confirmado'
  | 'cancelado';

export type TipoEntrega = 'delivery' | 'retiro';
export type FormaPago = 'transferencia' | 'efectivo';

export interface DeliveryLocation {
  direccion: string;
  lat: number;
  lng: number;
}

export interface ShippingPriceResponse {
  price: number | null;
  isEstimated: boolean;
  message: string;
}

export interface Pedido {
  id: string;
  clienteId: string;
  empresaId: string;
  estado: OrderStatus;
  tipoEntrega: TipoEntrega;
  formaPago: FormaPago;
  motivoRechazo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemPedido {
  id: string;
  pedidoId: string;
  productoId: string;
  cantidad: number;
  precio: number;
  producto?: Product;
}

export interface PedidoWithDetails extends Pedido {
  items?: ItemPedido[];
  cliente?: {
    id: string;
    name: string;
    email: string;
  };
  empresa?: {
    id: string;
    name: string;
    logo?: string;
  };
  total?: number;
  deliveryLocation?: DeliveryLocation;
  shippingPrice?: ShippingPriceResponse;
}

export interface CreateOrderRequest {
  empresaId: string;
  items: {
    productoId: string;
    cantidad: number;
    precio: number;
  }[];
  tipoEntrega: TipoEntrega;
  formaPago: FormaPago;
  transferenciaFoto?: string; // Base64
  deliveryLocation?: DeliveryLocation;
  shippingPrice?: ShippingPriceResponse;
}

export interface OrdersStats {
  total: number;
  pendienteConfirmacion: number;
  confirmado: number;
  noConfirmado: number;
  enProceso: number;
  esperandoDelivery: number;
  enCamino: number;
  entregado: number;
  esperandoRetiro: number;
}
