// Types for Client Dashboard

export interface Company {
  id: string;
  name: string;
  email: string;
  description?: string;
  logo?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  ubicaciones?: Array<{
    id: number;
    direccion: string;
    lat: number;
    lng: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  fotoUrl?: string;
  empresaId: string;
  empresa?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  companyId: string;
  companyName: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  companiesCount: number;
}

export interface CompanyWithProducts extends Company {
  products: Product[];
  productsCount: number;
  activeProductsCount: number;
}

export interface OrderRequest {
  empresaId: string;
  items: {
    productoId: string;
    cantidad: number;
    precio: number;
  }[];
  tipoEntrega: 'delivery' | 'retiro';
  formaPago: 'transferencia' | 'efectivo';
  transferenciaFoto?: string; // Base64 temporal
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

// UI State types
export interface ClientDashboardState {
  view: 'companies' | 'cart' | 'my-orders';
  searchTerm: string;
  categoryFilter: string;
  sortBy: 'name' | 'rating' | 'newest' | 'popular';
}

export interface CompanyCardProps {
  company: Company;
  onViewCompany: (companyId: string) => void;
  onViewProducts: (companyId: string) => void;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  isInCart?: boolean;
  cartQuantity?: number;
}

export interface CheckoutFormData {
  tipoEntrega: 'delivery' | 'retiro';
  formaPago: 'transferencia' | 'efectivo';
  transferenciaFoto?: string; // Base64 temporal
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

export interface ShippingPriceResponse {
  price: number | null;
  isEstimated: boolean;
  message: string;
}

export interface DeliveryLocation {
  direccion: string;
  lat: number;
  lng: number;
}

export interface CartSummaryProps {
  cart: Cart;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (companyId: string, formData: CheckoutFormData) => void;
  companyData?: {
    id: string;
    name: string;
    logo?: string;
    ubicaciones: Array<{
      id: number;
      direccion: string;
      lat: number;
      lng: number;
    }>;
  };
}
