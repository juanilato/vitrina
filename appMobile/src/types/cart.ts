/**
 * Cart Types
 */

import { Product } from './company';

export interface CartItem {
  product: Product;
  quantity: number;
  companyId: string;
  companyName: string;
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
