/**
 * Order domain models
 * Tipos compartidos para pedidos en toda la aplicación
 */

export interface IngredienteExtra {
  productoIngredienteId: number;
  cantidad: number;
  ingrediente?: {
    id: string;
    nombre: string;
  };
  precioExtra?: number;
}

export interface ItemPedido {
  id: string;
  pedidoId: string;
  productoId: string;
  cantidad: number;
  precio: number;
  descuento?: number;
  promocionAplicada?: string;
  notas?: string;
  ingredientesExtras?: IngredienteExtra[];
  producto?: {
    id: string;
    nombre: string;
    precio: number;
  };
}

export interface PromocionAplicada {
  nombre: string;
  tipo: string;
  descuentoAplicado: number;
}

export type EstadoPedido =
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
export type OrigenPedido = 'app' | 'local';

export interface Pedido {
  id: string;
  origenPedido: OrigenPedido;
  clienteId?: string;
  nombreClienteLocal?: string;
  mesaNumero?: string;
  empresaId: string;
  repartidorId?: string;
  estado: EstadoPedido;
  tipoEntrega: TipoEntrega;
  formaPago: FormaPago;
  motivoRechazo?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  subtotal?: number;
  descuento?: number;
  costoEnvio?: number;
  total?: number;
  promocionesAplicadas?: PromocionAplicada[];
  createdAt: string;
  updatedAt: string;
}

export interface Valoracion {
  id: string;
  pedidoId: string;
  clienteId: string;
  empresaId: string;
  repartidorId?: string;
  calificacionEmpresa: number;
  comentarioEmpresa?: string;
  aspectosEmpresa?: string[];
  valoracionProductos?: any;
  calificacionRepartidor?: number;
  comentarioRepartidor?: string;
  aspectosRepartidor?: string[];
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
  Valoracion?: Valoracion;
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
