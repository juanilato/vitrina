

// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/hooks/useCompanySite.ts
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../../config/axios.config';
import { findCompanyByUrlSlug } from '../../../../utils/urlHelpers';
import { Cart, CartItem, Company, Product } from '../../types';
import { useAuthOptimized } from '../../../../hooks/useAuthOptimized';
import type { SiteTab } from '../CompanyStorePage';

export interface CompanyWithProducts extends Company {
  products: Product[];
  productsCount: number;
  activeProductsCount: number;
   coverImage?: string | null;
  highlights?: { icon?: string; title: string; desc?: string }[];
  gallery?: string[];
  phone?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  horarios?: { dia: string; abre: string; cierra: string }[];
}

export function useCompanySite({ companyName, navigate }: { companyName?: string; navigate: (path: string) => void }) {
  const { user } = useAuthOptimized();
  const [company, setCompany] = useState<CompanyWithProducts | null>(null);
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalAmount: 0, companiesCount: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'products' | 'cart'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<SiteTab>('home');

  useEffect(() => {
    const load = async () => {
      if (!companyName) return;
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ obtener lista y buscar slug
        const companiesResp = await axiosInstance.get('/auth/companies');
        const companies = companiesResp.data || [];
        const target = findCompanyByUrlSlug(companies, companyName);
        if (!target) throw new Error('Empresa no encontrada');

        // 2️⃣ traer empresa completa con preferencias y productos
        const [companyResp, productsResp] = await Promise.all([
          axiosInstance.get(`/auth/companies/${target.id}/locations`),
          axiosInstance.get(`/productos/empresa/${target.id}`),
        ]);

        const cData = companyResp.data;
        const prods: Product[] = productsResp.data || [];

        // 3️⃣ guardar empresa con preferencias
        setCompany({
          ...cData,
          products: prods,
          productsCount: prods.length,
          activeProductsCount: prods.filter((p) => p.activo).length,
        });
      } catch (e: any) {
        setError(e.response?.data?.message || e.message || 'Error al cargar la empresa');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [companyName]);


  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const i = prev.items.findIndex((it) => it.product.id === product.id);
      let newItems: CartItem[];
      if (i >= 0) newItems = prev.items.map((it, idx) => (idx === i ? { ...it, quantity: it.quantity + quantity } : it));
      else newItems = [...prev.items, { id: `${product.id}-${Date.now()}`, product, quantity, companyId: company?.id || '', companyName: company?.name || '' }];
      const totalItems = newItems.reduce((s, it) => s + it.quantity, 0);
      const totalAmount = newItems.reduce((s, it) => s + it.product.precio * it.quantity, 0);
      return { items: newItems, totalItems, totalAmount, companiesCount: 1 };
    });
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return removeFromCart(itemId);
    setCart((prev) => {
      const newItems = prev.items.map((it) => (it.id === itemId ? { ...it, quantity: newQuantity } : it));
      const totalItems = newItems.reduce((s, it) => s + it.quantity, 0);
      const totalAmount = newItems.reduce((s, it) => s + it.product.precio * it.quantity, 0);
      return { items: newItems, totalItems, totalAmount, companiesCount: 1 };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((it) => it.id !== itemId);
      const totalItems = newItems.reduce((s, it) => s + it.quantity, 0);
      const totalAmount = newItems.reduce((s, it) => s + it.product.precio * it.quantity, 0);
      return { items: newItems, totalItems, totalAmount, companiesCount: newItems.length > 0 ? 1 : 0 };
    });
  };

  const createOrder = async (formData: {
    tipoEntrega: string;
    formaPago: string;
    transferenciaFoto?: string;
    deliveryLocation?: { direccion: string; lat: number; lng: number };
    shippingPrice?: { price: number | null; isEstimated: boolean; message: string };
  }): Promise<boolean> => {
    if (!user || cart.items.length === 0) return false;
    try {
      setLoading(true);
      setError(null);
      const payload = {
        empresaId: company?.id,
        items: cart.items.map((it) => ({ productoId: it.product.id, cantidad: it.quantity, precio: Number(it.product.precio) })),
        tipoEntrega: formData.tipoEntrega,
        formaPago: formData.formaPago,
        transferenciaFoto: formData.transferenciaFoto,
        deliveryLocation: formData.deliveryLocation
          ? { direccion: formData.deliveryLocation.direccion, lat: formData.deliveryLocation.lat, lng: formData.deliveryLocation.lng }
          : undefined,
        shippingPrice: formData.shippingPrice,
      };
      await axiosInstance.post('/pedidos', payload);
      setCart({ items: [], totalItems: 0, totalAmount: 0, companiesCount: 0 });
      return true;
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al crear pedido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (_companyId: string, formData: { tipoEntrega: string; formaPago: string; transferenciaFoto?: string }) => {
    const ok = await createOrder(formData);
    if (ok) {
      alert('¡Pedido creado exitosamente! La empresa será notificada.');
      setView('products');
    }
  };

  return {
    state: { company, cart, loading, error, view, selectedProduct, activeTab },
    actions: { setActiveTab, setView, addToCart, updateCartQuantity, removeFromCart, handleCheckout, setSelectedProduct },
  } as const;
}
