// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/CompanySitePage.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../../../colors';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import { useCompanySite } from './hooks/useCompanySite';
import { SiteHeader } from './components/SiteHeader';
import { Hero } from './components/Hero';
import { Highlights } from './components/Highlights';
import { HomeSection } from './components/HomeSection';
import { MenuSection } from './components/MenuSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { FloatingCartButton } from './components/FloatingCartButton';
import { CartModal } from './components/CartModal';
import { ProductModal } from './components/ProductModal';
import '../ClientDashboard.css';
import './CompanyStorePage.css';
import { BusinessHours } from './components/HorasApertura';
import { normalizeSlots } from './components/normalizeSlots';
import { applyCompanyTheme } from './utils/theme'
export type SiteTab = 'home' | 'menu' | 'about' | 'contact';

const CompanySitePage: React.FC = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const navigate = useNavigate();
  const { user } = useAuthOptimized();

  const {
    state: {
      company,
      cart,
      loading,
      error,
      view,
      selectedProduct,
      activeTab,
    },
    actions: {
      setActiveTab,
      setView,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      handleCheckout,
      setSelectedProduct,
    },
  } = useCompanySite({ companyName, navigate });



useEffect(() => {
  const pref = company?.preferenciasWeb;
  if (pref) {
    applyCompanyTheme(pref.colorBotones, pref.colorFondo);
  }
}, [company?.preferenciasWeb, company?.preferenciasWeb?.colorBotones, company?.preferenciasWeb?.colorFondo]);
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

  const firstUbic = (company.ubicaciones || [])[0];
  const lat = firstUbic?.lat;
  const lng = firstUbic?.lng;



  console.log("EMPRESA", company);
  return (
    <ThemeProvider companySlug={companyName || 'default'}>
      <div className="company-site">
        <SiteHeader
          activeTab={activeTab}
          onBack={() => navigate('/dashboard')}
          onChangeTab={setActiveTab}
          onCta={() => setActiveTab('menu')}
        />

<Hero
  coverImage={company.preferenciasWeb?.dashboardFoto ?? company.coverImage}
  logo={company.logo}
  name={company.name}
  description={company.description}
  website={company.website}
  onCta={() => setActiveTab('menu')}
/>

        <Highlights
          highlights={company.highlights}
          fallback={[
            { icon: '🚚', title: 'Envíos en la zona', desc: 'Calculamos automáticamente el costo' },
            { icon: '⏰', title: 'Horarios amplios', desc: 'Consultá nuestra disponibilidad' },
            { icon: '💳', title: 'Pagá como quieras', desc: 'Efectivo / Transferencia' },
          ]}
        />

        <main className="site-main">
          {activeTab === 'home' && (
            <HomeSection
              companyName={company.name}
              products={company.products}
              getCartItem={(id) => cart.items.find((it) => it.product.id === id)}
              onAddToCart={addToCart}
              onProductClick={setSelectedProduct}
            />
          )}

          {activeTab === 'menu' && (
            <MenuSection
              products={company.products}
              getCartItem={(id) => cart.items.find((it) => it.product.id === id)}
              onAddToCart={addToCart}
              onProductClick={setSelectedProduct}
            />
          )}

          {activeTab === 'about' && (
            <AboutSection
              name={company.name}
              description={company.description}
              gallery={company.gallery}
            />
          )}

          {activeTab === 'contact' && (
            <ContactSection
              phone={company.phone}
              instagram={company.instagram}
              facebook={company.facebook}
              website={company.website}
              horarios={company.horarios}
              lat={lat}
              lng={lng}
            />
          )}
        <BusinessHours slots={normalizeSlots(company.preferenciasWeb?.horarios as any)} />
        </main>

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

        {cart.totalItems > 0 && (
          <FloatingCartButton totalItems={cart.totalItems} onClick={() => setView('cart')} />
        )}

        {view === 'cart' && (
            <CartModal
              companyName={company.name}
              cart={cart}
              onClose={() => setView('products')}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}  
              companyData={{ id: company.id, name: company.name, ubicaciones: company.ubicaciones || [] }}
            />
        )}

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            getCartItem={(id) => cart.items.find((it) => it.product.id === id)}
            onAddToCart={(p) => addToCart(p, 1)}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default CompanySitePage;






// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/company/site/types.ts (re-export from your existing types OR keep local)
// ─────────────────────────────────────────────────────────────────────────────
export type { Company, Product, Cart, CartItem } from '../types';
