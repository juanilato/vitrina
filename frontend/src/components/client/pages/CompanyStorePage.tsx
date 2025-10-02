import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import CompanyStoreProductCard from './CompanyStoreProductCard';
import CartSummary from '../components/CartSummary';
import { Company, Product, Cart, CartItem } from '../types';
import axiosInstance from '../../../config/axios.config';
import { findCompanyByUrlSlug } from '../../../utils/urlHelpers';
import { ThemeProvider } from '../../../colors';
import '../ClientDashboard.css';
import './CompanyStorePage.css';

interface CompanyWithProducts extends Company {
  products: Product[];
  productsCount: number;
  activeProductsCount: number;
  // opcionales sugeridos
  coverImage?: string | null;
  highlights?: { icon?: string; title: string; desc?: string }[];
  gallery?: string[];
  phone?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  horarios?: { dia: string; abre: string; cierra: string }[];
}

type SiteTab = 'home' | 'menu' | 'about' | 'contact';

const CompanySitePage: React.FC = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const navigate = useNavigate();
  const { user } = useAuthOptimized();

  // State
  const [company, setCompany] = useState<CompanyWithProducts | null>(null);
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    companiesCount: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'products' | 'cart'>('products'); // reutilizado para el modal del carrito
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<SiteTab>('home');

  // Load company data and products
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!companyName) return;
      try {
        setLoading(true);
        setError(null);

        const companiesResponse = await axiosInstance.get('/auth/companies');
        const companies = companiesResponse.data || [];
        const targetCompany = findCompanyByUrlSlug(companies, companyName);
        if (!targetCompany) throw new Error('Empresa no encontrada');

        const [companyResponse, productsResponse] = await Promise.all([
          axiosInstance.get(`/auth/companies/${targetCompany.id}/locations`),
          axiosInstance.get(`/productos/empresa/${targetCompany.id}`)
        ]);

        const companyData = companyResponse.data;
        const products = productsResponse.data || [];

        const companyWithProducts: CompanyWithProducts = {
          ...companyData,
          products,
          productsCount: products.length,
          activeProductsCount: products.filter((p: Product) => p.activo).length
        };

        setCompany(companyWithProducts);
      } catch (err: any) {
        console.error('Error loading company data:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar la empresa');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [companyName]);

  // Cart management
  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const i = prev.items.findIndex(it => it.product.id === product.id);
      let newItems: CartItem[];
      if (i >= 0) {
        newItems = prev.items.map((it, idx) =>
          idx === i ? { ...it, quantity: it.quantity + quantity } : it
        );
      } else {
        newItems = [
          ...prev.items,
          {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
            companyId: company?.id || '',
            companyName: company?.name || ''
          }
        ];
      }
      const totalItems = newItems.reduce((s, it) => s + it.quantity, 0);
      const totalAmount = newItems.reduce((s, it) => s + it.product.precio * it.quantity, 0);
      return { items: newItems, totalItems, totalAmount, companiesCount: 1 };
    });
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return removeFromCart(itemId);
    setCart(prev => {
      const newItems = prev.items.map(it => (it.id === itemId ? { ...it, quantity: newQuantity } : it));
      const totalItems = newItems.reduce((s, it) => s + it.quantity, 0);
      const totalAmount = newItems.reduce((s, it) => s + it.product.precio * it.quantity, 0);
      return { items: newItems, totalItems, totalAmount, companiesCount: 1 };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(it => it.id !== itemId);
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

      const orderRequest = {
        empresaId: company?.id,
        items: cart.items.map(it => ({
          productoId: it.product.id,
          cantidad: it.quantity,
          precio: Number(it.product.precio)
        })),
        tipoEntrega: formData.tipoEntrega,
        formaPago: formData.formaPago,
        transferenciaFoto: formData.transferenciaFoto,
        deliveryLocation: formData.deliveryLocation
          ? {
              direccion: formData.deliveryLocation.direccion,
              lat: formData.deliveryLocation.lat,
              lng: formData.deliveryLocation.lng
            }
          : undefined,
        shippingPrice: formData.shippingPrice
      };

      await axiosInstance.post('/pedidos', orderRequest);
      setCart({ items: [], totalItems: 0, totalAmount: 0, companiesCount: 0 });
      return true;
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Error al crear pedido');
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

  const getCartItem = (productId: string) => cart.items.find(it => it.product.id === productId);
  const handleProductClick = (p: Product) => setSelectedProduct(p);
  const handleCloseProductModal = () => setSelectedProduct(null);

  // Early returns
  if (!user) {
    return (
      <div className="company-store-loading">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Cargando...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="company-store-page">
        <div className="company-store-loading">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Cargando sitio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-store-page">
        <div className="company-store-error">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error || 'Empresa no encontrada'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ubicación p/Mapa
  const firstUbic = (company.ubicaciones || [])[0];
  const lat = firstUbic?.lat;
  const lng = firstUbic?.lng;

  return (
    <ThemeProvider companySlug={companyName || 'default'}>
      <div className="company-site">

        {/* Top Bar / Navbar */}
        <header className="site-header">
          <div className="site-header-inner">
            <button className="back-btn-clean" onClick={() => navigate('/dashboard')}>← Volver</button>

            <nav className="site-nav">
              {[
                { key: 'home', label: 'Inicio' },
                { key: 'menu', label: 'Menú / Catálogo' },
                { key: 'about', label: 'Sobre' },
                { key: 'contact', label: 'Contacto' }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`site-nav-btn ${activeTab === (tab.key as SiteTab) ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key as SiteTab)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <button className="cta-header" onClick={() => setActiveTab('menu')}>Hacer pedido</button>
          </div>
        </header>

        {/* Hero corporativo */}
        <section className="hero">
          <div className="hero-media">
            {company.coverImage ? (
              <img src={company.coverImage} alt={company.name} />
            ) : (
              <div className="hero-placeholder" />
            )}
            <div className="hero-overlay" />
          </div>

          <div className="hero-content">
            <div className="hero-brand">
              <div className="hero-logo">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} />
                ) : (
                  <div className="company-logo-placeholder-clean">
                    {company.name?.charAt(0)?.toUpperCase() || 'E'}
                  </div>
                )}
              </div>
              <div>
                <h1 className="hero-title">{company.name}</h1>
                {company.description && <p className="hero-subtitle">{company.description}</p>}
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => setActiveTab('menu')}>Ver Menú</button>
              <a className="btn outline" href={company.website || '#'} target="_blank" rel="noreferrer">Sitio Web</a>
            </div>
          </div>
        </section>

        {/* Highlights (beneficios/servicios) */}
        <section className="highlights">
          {(company.highlights?.length ? company.highlights : [
            { icon: '🚚', title: 'Envíos en la zona', desc: 'Calculamos automáticamente el costo' },
            { icon: '⏰', title: 'Horarios amplios', desc: 'Consultá nuestra disponibilidad' },
            { icon: '💳', title: 'Pagá como quieras', desc: 'Efectivo / Transferencia' }
          ]).slice(0, 4).map((h, idx) => (
            <div className="highlight-card" key={idx}>
              <div className="highlight-icon">{h.icon || '⭐'}</div>
              <div className="highlight-body">
                <h4>{h.title}</h4>
                {h.desc && <p>{h.desc}</p>}
              </div>
            </div>
          ))}
        </section>

        {/* Contenido principal segun tab */}
        <main className="site-main">

          {/* INICIO */}
          {activeTab === 'home' && (
            <div className="home-grid">
              <div className="home-panel">
                <h3>Novedades</h3>
                <p>Promociones, lanzamientos y avisos importantes de {company.name}.</p>
              </div>

              <div className="home-panel">
                <h3>Destacados</h3>
                <div className="products-grid-clean">
                  {company.products.filter(p => p.activo).slice(0, 4).map(p => {
                    const cartItem = getCartItem(p.id);
                    return (
                      <CompanyStoreProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={addToCart}
                        onProductClick={handleProductClick}
                        cartItem={cartItem}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MENÚ / CATÁLOGO */}
          {activeTab === 'menu' && (
            <section className="products-section-clean">
              <h2 className="section-title">Menú / Catálogo</h2>
              <div className="products-grid-clean">
                {company.products.filter(p => p.activo).length === 0 ? (
                  <div className="no-products-clean">
                    <div className="empty-icon">📦</div>
                    <h3 className="empty-title">No hay productos disponibles</h3>
                    <p className="empty-description">Esta empresa aún no ha publicado productos activos.</p>
                  </div>
                ) : (
                  company.products.filter(p => p.activo).map(p => {
                    const cartItem = getCartItem(p.id);
                    return (
                      <CompanyStoreProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={addToCart}
                        onProductClick={handleProductClick}
                        cartItem={cartItem}
                      />
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* SOBRE */}
          {activeTab === 'about' && (
            <section className="about">
              <div className="about-text">
                <h2>Sobre {company.name}</h2>
                <p>{company.description || 'Somos una empresa comprometida con la calidad y la atención a nuestros clientes.'}</p>
              </div>

              {!!company.gallery?.length && (
                <div className="about-gallery">
                  {company.gallery.map((src, i) => (
                    <img key={i} src={src} alt={`galería-${i}`} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* CONTACTO */}
          {activeTab === 'contact' && (
            <section className="contact">
              <div className="contact-info">
                <h2>Contacto</h2>
                <ul className="contact-list">
                  {company.phone && <li>📞 {company.phone}</li>}
                  {company.instagram && <li>📷 <a href={company.instagram} target="_blank" rel="noreferrer">Instagram</a></li>}
                  {company.facebook && <li>📘 <a href={company.facebook} target="_blank" rel="noreferrer">Facebook</a></li>}
                  {company.website && <li>🌐 <a href={company.website} target="_blank" rel="noreferrer">Website</a></li>}
                </ul>

                {!!company.horarios?.length && (
                  <>
                    <h3>Horarios</h3>
                    <ul className="hours-list">
                      {company.horarios.map((h, i) => (
                        <li key={i}><span>{h.dia}</span><span>{h.abre} — {h.cierra}</span></li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="contact-map">
                {lat && lng ? (
                  <iframe
                    title="mapa"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${lat},${lng}&hl=es&z=15&output=embed`}
                  />
                ) : (
                  <div className="map-placeholder">Mapa no disponible</div>
                )}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="site-footer-inner">
            <div>© {new Date().getFullYear()} {company.name}. Todos los derechos reservados.</div>
            <div className="footer-links">
              {company.instagram && <a href={company.instagram} target="_blank" rel="noreferrer">Instagram</a>}
              {company.facebook && <a href={company.facebook} target="_blank" rel="noreferrer">Facebook</a>}
              {company.website && <a href={company.website} target="_blank" rel="noreferrer">Website</a>}
            </div>
          </div>
        </footer>

        {/* Floating Cart Button */}
        {cart.totalItems > 0 && (
          <button className="floating-cart-btn-clean" onClick={() => setView('cart')}>
            <span className="cart-icon">🛒</span>
            <span className="cart-text">Tu pedido</span>
            <span className="cart-total">{cart.totalItems}</span>
          </button>
        )}

        {/* Cart Modal */}
        {view === 'cart' && (
          <div className="cart-modal-overlay-fullscreen">
            <div className="cart-modal-fullscreen">
              <div className="cart-modal-header-fullscreen">
                <h3 className="cart-modal-title-fullscreen">Pedido de {company.name}</h3>
                <button className="close-cart-btn-fullscreen" onClick={() => setView('products')}>✕</button>
              </div>
              <div className="cart-modal-content-fullscreen">
                <CartSummary
                  cart={cart}
                  onUpdateQuantity={updateCartQuantity}
                  onRemoveItem={removeFromCart}
                  onCheckout={handleCheckout}
                  companyData={company ? { id: company.id, name: company.name, ubicaciones: company.ubicaciones || [] } : undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="product-modal-overlay">
            <div className="product-modal">
              <div className="product-modal-header">
                <h3 className="product-modal-title">Detalles del Producto</h3>
                <button className="close-product-btn" onClick={handleCloseProductModal}>✕</button>
              </div>
              <div className="product-modal-content">
                <div className="product-image-large">
                  {selectedProduct.fotoUrl ? (
                    <img src={selectedProduct.fotoUrl} alt={selectedProduct.nombre} className="product-large-image" />
                  ) : (
                    <div className="product-image-placeholder-large"><span className="placeholder-icon-large">📦</span></div>
                  )}
                </div>
                <div className="product-details-large">
                  <h2 className="product-name-large">{selectedProduct.nombre}</h2>
                  {selectedProduct.descripcion && <p className="product-description-large">{selectedProduct.descripcion}</p>}
                  <div className="product-price-large">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(selectedProduct.precio)}
                  </div>
                  <div className="product-actions-large">
                    {getCartItem(selectedProduct.id) ? (
                      <div className="cart-info-large">
                        <span className="cart-icon-large">✅</span>
                        <span>En carrito: {getCartItem(selectedProduct.id)?.quantity} unidad{getCartItem(selectedProduct.id)?.quantity !== 1 ? 'es' : ''}</span>
                      </div>
                    ) : (
                      <button className="add-to-cart-btn-large" onClick={() => { addToCart(selectedProduct, 1); handleCloseProductModal(); }}>
                        <span className="cart-icon-large">🛒</span>
                        Agregar al Carrito
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ThemeProvider>
  );
};

export default CompanySitePage;
