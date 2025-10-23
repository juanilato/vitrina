/**
 * Cart Types
 */

import { Product, Agregado, ProductoIngrediente } from './company';

export interface CartIngredienteExtra {
  productoIngrediente: ProductoIngrediente;
  cantidad: number; // Cantidad de este ingrediente extra añadido
}

export interface CartItem {
  product: Product;
  quantity: number;
  companyId: string;
  companyName: string;
  agregados?: Agregado[]; // Deprecated - mantener por compatibilidad
  ingredientesExtras?: CartIngredienteExtra[]; // Nuevo sistema de ingredientes
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  companyId?: string; // Cart can only have items from one company
}

export interface DeliveryAddress {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  reference?: string;
}

export type DeliveryType = 'delivery' | 'pickup';

export type PaymentMethod = 'transferencia' | 'efectivo';

export interface CheckoutData {
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  paymentMethod: PaymentMethod;
  transferReceipt?: string; // Base64 image or URL
  notes?: string;
}
