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

export type DeliveryType = 'delivery' | 'retiro';

export type PaymentMethod = 'transferencia' | 'efectivo';

export interface DeliveryTimeEstimation {
  preparacionMinutos: number; // Tiempo de preparación del comercio
  asignacionMinutos: number; // Tiempo de asignación de repartidor
  recojoMinutos: number; // Tiempo de llegada del repartidor al comercio
  entregaMinutos: number; // Tiempo de entrega al cliente
  totalMinutos: number; // Tiempo total estimado
  fechaEntregaEstimada: Date; // Fecha y hora estimada de entrega
  rangoMinimo: number; // Rango mínimo de tiempo (ej: 25 min)
  rangoMaximo: number; // Rango máximo de tiempo (ej: 35 min)
}

export interface CheckoutData {
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  paymentMethod: PaymentMethod;
  transferReceipt?: string; // Base64 image or URL
  notes?: string;
  estimatedDeliveryTime?: DeliveryTimeEstimation; // Tiempo estimado de entrega
}
