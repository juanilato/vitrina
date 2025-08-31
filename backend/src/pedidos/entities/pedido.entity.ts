export class Pedido {
  id: string;
  clienteId: string;
  empresaId: string;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ItemPedido {
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

export class PedidoWithItems extends Pedido {
  items?: ItemPedido[];
  cliente?: {
    id: string;
    name: string;
    email: string;
  };
  total?: number;
}
