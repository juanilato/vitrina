export class Pedido {
  id: string;
  clienteId: string;
  empresaId: string;
  estado: string;
  tipoEntrega: string;
  formaPago: string;
  motivoRechazo?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  subtotal?: number;
  costoEnvio?: number;
  total?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ItemPedido {
  id: string;
  pedidoId: string;
  productoId: string;
  cantidad: number;
  precio: number;
  notas?: string;
  ingredientesExtras?: Array<{
    productoIngredienteId: number;
    cantidad: number;
  }>;
  producto?: {
    id: string;
    nombre: string;
    precio: number;
  };
}

export class PedidoWithItems extends Pedido {
  items?: ItemPedido[];
  cliente?: {
    id: string;
    name: string;
    email: string;
  };
}
