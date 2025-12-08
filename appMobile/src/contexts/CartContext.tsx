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
import { promotionsService, Promocion } from '../services/promotions.service';
import { isPromocionActiveNow } from '../utils/promotions';

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryFee, setDeliveryFeeState] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [promotions, setPromotions] = useState<Record<string, Promocion[]>>({});

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!loading) {
      saveCart();
    }
  }, [cartItems, deliveryFee, loading]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      if (cartData) {
        const savedCart: Cart = JSON.parse(cartData);
        setCartItems(savedCart.items || []);
        setDeliveryFeeState(savedCart.deliveryFee || 0);

        // Fetch promotions for companies in the cart
        const companies = new Set(savedCart.items.map(item => item.companyId));
        companies.forEach(companyId => fetchPromotions(companyId));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate derived cart state
  const cart = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    const itemsWithDiscounts = cartItems.map(item => {
      // Calculate item subtotal
      const priceRaw = item.product.precio || item.product.price || 0;
      const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;

      const agregadosPrice = item.agregados?.reduce(
        (sum, agregado) => {
          const agregadoPrecio = typeof agregado.precio === 'string'
            ? parseFloat(agregado.precio)
            : agregado.precio;
          return sum + agregadoPrecio;
        },
        0
      ) || 0;

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

      const itemSubtotal = (price + agregadosPrice + ingredientesExtrasPrice) * item.quantity;
      subtotal += itemSubtotal;
      totalItems += item.quantity;

      // Calculate Discount
      const companyPromotions = promotions[item.companyId] || [];
      const { discount, promotionName } = calculateItemDiscount(item, companyPromotions);

      totalDiscount += discount;

      return {
        ...item,
        discount,
        appliedPromotion: promotionName
      };
    });

    const total = subtotal - totalDiscount + deliveryFee;

    return {
      items: itemsWithDiscounts,
      totalItems,
      subtotal,
      totalDiscount,
      deliveryFee,
      total: Math.max(0, total),
      companyId: undefined,
    };
  }, [cartItems, deliveryFee, promotions]);

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const fetchPromotions = async (companyId: string) => {
    if (promotions[companyId]) return; // Already loaded

    try {
      const data = await promotionsService.getByEmpresa(companyId);
      setPromotions(prev => ({ ...prev, [companyId]: data }));
    } catch (error) {
      console.error('Error fetching promotions for company:', companyId, error);
    }
  };

  // Helper function for discount calculation with time-aware validation
  function calculateItemDiscount(item: CartItem, companyPromotions: Promocion[]): { discount: number; promotionName?: string } {
    const now = new Date();

    // Filter applicable promotions using the new time-aware validation
    const applicablePromos = companyPromotions.filter(p => {
      if (!p.activo) return false;

      // Check day and time (supports schedules that cross midnight)
      if (!isPromocionActiveNow(p.configuracion, now)) return false;

      // Check scope (alcance)
      if (p.alcance === 'SELECCIONADOS') {
        const productInPromo = p.productos?.some(pp => pp.producto.id === item.product.id);
        if (!productInPromo) return false;
      }

      return true;
    });

    let bestDiscount = 0;
    let bestPromoName = undefined;

    // Calculate price per unit (including extras)
    const priceRaw = item.product.precio || item.product.price || 0;
    const basePrice = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;

    const agregadosPrice = item.agregados?.reduce((sum, agg) => sum + (typeof agg.precio === 'string' ? parseFloat(agg.precio) : agg.precio), 0) || 0;

    const extrasPrice = item.ingredientesExtras?.reduce((sum, extra) => {
      const pExtra = extra.productoIngrediente.precioExtra;
      return sum + (typeof pExtra === 'string' ? parseFloat(pExtra) : (pExtra || 0)) * extra.cantidad;
    }, 0) || 0;

    const unitPrice = basePrice + agregadosPrice + extrasPrice;
    const totalItemPrice = unitPrice * item.quantity;

    for (const promo of applicablePromos) {
      let currentDiscount = 0;

      if (promo.tipo === 'CANTIDAD') {
        const minQty = promo.configuracion.cantidadCompra || 1;
        if (item.quantity >= minQty) {
          const percentage = promo.configuracion.porcentajeDescuento || 0;
          currentDiscount = totalItemPrice * (percentage / 100);
        }
      } else if (promo.tipo === 'BXPY') {
        const lleva = promo.configuracion.cantidadLleva || 2;
        const paga = promo.configuracion.cantidadPaga || 1;

        if (item.quantity >= lleva) {
          const sets = Math.floor(item.quantity / lleva);
          const remainder = item.quantity % lleva;
          const payableQty = (sets * paga) + remainder;
          const freeQty = item.quantity - payableQty;

          currentDiscount = freeQty * unitPrice;
        }
      }

      if (currentDiscount > bestDiscount) {
        bestDiscount = currentDiscount;
        bestPromoName = promo.nombre;
      }
    }

    return { discount: bestDiscount, promotionName: bestPromoName };
  }

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
      // Fetch promotions for this company if not present
      fetchPromotions(companyId);

      setCartItems((prevItems) => {
        // Con agregados, ingredientes extras o notas, siempre agregar como item nuevo (no combinar)
        if ((agregados && agregados.length > 0) || (ingredientesExtras && ingredientesExtras.length > 0)) {
          return [
            ...prevItems,
            {
              product,
              quantity,
              companyId,
              companyName,
              agregados,
              ingredientesExtras,
              notes,
            },
          ];
        }

        // Check if product already exists in cart (sin agregados ni ingredientes extras)
        const existingItemIndex = prevItems.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.companyId === companyId &&
            (!item.agregados || item.agregados.length === 0) &&
            (!item.ingredientesExtras || item.ingredientesExtras.length === 0)
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const newItems = [...prevItems];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
          };
          return newItems;
        }

        // Add new item
        return [
          ...prevItems,
          {
            product,
            quantity,
            companyId,
            companyName,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  }, []);

  const removeItemsByCompany = useCallback((companyId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.companyId !== companyId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => item.product.id === productId);
      if (itemIndex === -1) return prevItems;

      const newItems = [...prevItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        quantity,
      };
      return newItems;
    });
  }, [removeItem]);

  const updateItemNotes = useCallback((productId: string, notes: string) => {
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => item.product.id === productId);
      if (itemIndex === -1) return prevItems;

      const newItems = [...prevItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        notes,
      };
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
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
