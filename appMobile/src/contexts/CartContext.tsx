/**
 * Cart Context
 * Manages shopping cart state and operations
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Product, Agregado } from '../types/company';
import { CartItem, Cart, CheckoutData, DeliveryType, PaymentMethod, CartIngredienteExtra } from '../types/cart';
import { STORAGE_KEYS } from '../utils/constants';

interface CartContextData {
  cart: Cart;
  loading: boolean;

  // Cart operations
  addItem: (
    product: Product,
    companyId: string,
    companyName: string,
    quantity?: number,
    agregados?: Agregado[],
    notes?: string,
    ingredientesExtras?: CartIngredienteExtra[]
  ) => void;
  removeItem: (productId: string) => void;
  removeItemsByCompany: (companyId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;

  // Checkout data
  checkoutData: CheckoutData | null;
  setDeliveryType: (type: DeliveryType) => void;
  setDeliveryAddress: (address: CheckoutData['deliveryAddress']) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setTransferReceipt: (receipt: string) => void;
  setCheckoutNotes: (notes: string) => void;
  clearCheckoutData: () => void;

  // Delivery fee
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    companyId: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [deliveryFee, setDeliveryFeeState] = useState(0);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!loading) {
      saveCart();
    }
  }, [cart, loading]);

  // Recalculate totals whenever items or delivery fee change
  useEffect(() => {
    recalculateTotals();
  }, [cart.items, deliveryFee]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      if (cartData) {
        const savedCart: Cart = JSON.parse(cartData);
        setCart(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const recalculateTotals = () => {
    setCart((prev) => {
      const totalItems = prev.items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = prev.items.reduce(
        (sum, item) => {
          // Convertir precio a número (puede venir como string del backend)
          const priceRaw = item.product.precio || item.product.price || 0;
          const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;

          // Calcular precio con agregados (sistema antiguo)
          const agregadosPrice = item.agregados?.reduce(
            (sum, agregado) => {
              const agregadoPrecio = typeof agregado.precio === 'string'
                ? parseFloat(agregado.precio)
                : agregado.precio;
              return sum + agregadoPrecio;
            },
            0
          ) || 0;

          // Calcular precio con ingredientes extras (sistema nuevo)
          const ingredientesExtrasPrice = item.ingredientesExtras?.reduce(
            (sum, ingredienteExtra) => {
              const precioExtra = ingredienteExtra.productoIngrediente.precioExtra;
              const precio = typeof precioExtra === 'string'
                ? parseFloat(precioExtra)
                : (precioExtra || 0);
              return sum + (precio * ingredienteExtra.cantidad);
            },
            0
          ) || 0;

          return sum + (price + agregadosPrice + ingredientesExtrasPrice) * item.quantity;
        },
        0
      );
      const total = subtotal + deliveryFee;

      return {
        ...prev,
        totalItems,
        subtotal,
        deliveryFee,
        total,
      };
    });
  };

  const addItem = useCallback(
    (
      product: Product,
      companyId: string,
      companyName: string,
      quantity: number = 1,
      agregados?: Agregado[],
      notes?: string,
      ingredientesExtras?: CartIngredienteExtra[]
    ) => {
      setCart((prev) => {
        // Ahora permitimos múltiples empresas en el carrito
        // Con agregados, ingredientes extras o notas, siempre agregar como item nuevo (no combinar)
        if ((agregados && agregados.length > 0) || (ingredientesExtras && ingredientesExtras.length > 0)) {
          return {
            ...prev,
            items: [
              ...prev.items,
              {
                product,
                quantity,
                companyId,
                companyName,
                agregados,
                ingredientesExtras,
                notes,
              },
            ],
            companyId: undefined, // Ya no usamos un solo companyId
          };
        }

        // Check if product already exists in cart (sin agregados ni ingredientes extras)
        const existingItemIndex = prev.items.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.companyId === companyId &&
            (!item.agregados || item.agregados.length === 0) &&
            (!item.ingredientesExtras || item.ingredientesExtras.length === 0)
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const newItems = [...prev.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
          };

          return {
            ...prev,
            items: newItems,
          };
        }

        // Add new item
        return {
          ...prev,
          items: [
            ...prev.items,
            {
              product,
              quantity,
              companyId,
              companyName,
            },
          ],
          companyId: undefined, // Ya no usamos un solo companyId
        };
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.product.id !== productId);

      return {
        ...prev,
        items: newItems,
        companyId: newItems.length === 0 ? undefined : prev.companyId,
      };
    });
  }, []);

  const removeItemsByCompany = useCallback((companyId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.companyId !== companyId);

      return {
        ...prev,
        items: newItems,
        companyId: newItems.length === 0 ? undefined : prev.companyId,
      };
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCart((prev) => {
      const itemIndex = prev.items.findIndex((item) => item.product.id === productId);
      if (itemIndex === -1) return prev;

      const newItems = [...prev.items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        quantity,
      };

      return {
        ...prev,
        items: newItems,
      };
    });
  }, [removeItem]);

  const updateItemNotes = useCallback((productId: string, notes: string) => {
    setCart((prev) => {
      const itemIndex = prev.items.findIndex((item) => item.product.id === productId);
      if (itemIndex === -1) return prev;

      const newItems = [...prev.items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        notes,
      };

      return {
        ...prev,
        items: newItems,
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      totalItems: 0,
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      companyId: undefined,
    });
    setDeliveryFeeState(0);
    setCheckoutData(null);
  }, []);

  const setDeliveryFee = useCallback((fee: number) => {
    setDeliveryFeeState(fee);
  }, []);

  const setDeliveryType = useCallback((type: DeliveryType) => {
    setCheckoutData((prev) => ({
      ...prev,
      deliveryType: type,
      deliveryAddress: type === 'retiro' ? undefined : prev?.deliveryAddress,
    } as CheckoutData));

    // Reset delivery fee if retiro
    if (type === 'retiro') {
      setDeliveryFeeState(0);
    }
  }, []);

  const setDeliveryAddress = useCallback((address: CheckoutData['deliveryAddress']) => {
    setCheckoutData((prev) => ({
      ...prev,
      deliveryAddress: address,
    } as CheckoutData));
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setCheckoutData((prev) => ({
      ...prev,
      paymentMethod: method,
      transferReceipt: method === 'efectivo' ? undefined : prev?.transferReceipt,
    } as CheckoutData));
  }, []);

  const setTransferReceipt = useCallback((receipt: string) => {
    setCheckoutData((prev) => ({
      ...prev,
      transferReceipt: receipt,
    } as CheckoutData));
  }, []);

  const setCheckoutNotes = useCallback((notes: string) => {
    setCheckoutData((prev) => ({
      ...prev,
      notes,
    } as CheckoutData));
  }, []);

  const clearCheckoutData = useCallback(() => {
    setCheckoutData(null);
    setDeliveryFeeState(0);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItem,
        removeItem,
        removeItemsByCompany,
        updateQuantity,
        updateItemNotes,
        clearCart,
        checkoutData,
        setDeliveryType,
        setDeliveryAddress,
        setPaymentMethod,
        setTransferReceipt,
        setCheckoutNotes,
        clearCheckoutData,
        deliveryFee,
        setDeliveryFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
