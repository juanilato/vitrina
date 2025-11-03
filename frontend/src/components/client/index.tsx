import React, { useEffect, useState } from 'react';
import { useClientDashboard } from './hooks/useClientDashboard';
import {
  CompanyExplorer,
  CartSummary,
  MyOrders,
  BottomNav,
  HomeView,
  CategoryView,
  SubcategoryCompaniesView,
  TopNavbar,
  LocationsDropdown
} from './components';
import ProfileSettings from './components/ProfileSettings';
import { CheckoutFormData, Company } from './types';
import NotificationsDropdown from '../common/NotificationsDropdown';
import { ThemeProvider } from '../../colors';
import './ClientDashboard.css';
import './ClientDashboardMobile.css';

type TabView = 'home' | 'cart' | 'orders' | 'notifications' | 'profile';
type NavigationView = 'home' | 'category' | 'subcategory' | 'companies';

interface NavigationState {
  view: NavigationView;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
}

const ClientDashboard: React.FC = () => {
  const {
    state,
    companies,
    cart,
    loading,
    error,
    user,
    loadCompanyDetails,
    navigateToCompanyStore,
    updateCartQuantity,
    removeFromCart,
    createOrder,
    navigateToCart: oldNavigateToCart,
    navigateToMyOrders: oldNavigateToMyOrders,
  } = useClientDashboard();

  const [activeTab, setActiveTab] = useState<TabView>('home');
  const [navigationState, setNavigationState] = useState<NavigationState>({
    view: 'home',
  });
  const [cartCompanyData, setCartCompanyData] = useState<Company | null>(null);

  // Locations state
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  // Load company details for cart items
  useEffect(() => {
    const loadCartCompanyData = async () => {
      if (cart.items.length > 0) {
        const companyId = cart.items[0].companyId;
        const companyData = await loadCompanyDetails(companyId);
        if (companyData) {
          setCartCompanyData(companyData);
        }
      } else {
        setCartCompanyData(null);
      }
    };

    loadCartCompanyData();
  }, [cart.items, loadCompanyDetails]);

  const handleCheckout = async (companyId: string, formData: CheckoutFormData): Promise<void> => {
    const success = await createOrder(companyId, formData);
    if (success) {
      alert('¡Pedido creado exitosamente! La empresa será notificada.');
      setActiveTab('orders');
    }
  };

  // Navigation handlers
  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setNavigationState({ view: 'home' });
    } else if (tab === 'cart') {
      oldNavigateToCart();
    } else if (tab === 'orders') {
      oldNavigateToMyOrders();
    }
  };

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    setNavigationState({
      view: 'category',
      categoryId,
      categoryName,
    });
  };

  const handleSubcategoryClick = (subcategoryId: string, subcategoryName: string) => {
    setNavigationState({
      ...navigationState,
      view: 'subcategory',
      subcategoryId,
      subcategoryName,
    });
  };

  const handleBackToHome = () => {
    setNavigationState({ view: 'home' });
  };

  const handleBackToCategory = () => {
    setNavigationState({
      view: 'category',
      categoryId: navigationState.categoryId,
      categoryName: navigationState.categoryName,
    });
  };

  // Location handlers
  const handleLocationClick = () => {
    setShowLocationsDropdown(!showLocationsDropdown);
  };

  const handleSelectLocation = (location: any) => {
    setSelectedLocation(location);
    setShowLocationsDropdown(false);
  };

  const handleAddLocation = () => {
    setShowLocationsDropdown(false);
    alert('Funcionalidad de agregar ubicación próximamente');
  };

  // Load user locations (mock data for now)
  useEffect(() => {
    if (user) {
      // TODO: Replace with actual API call
      const mockLocations = [
        {
          id: 1,
          nombre: 'Casa',
          direccion: 'Av. Principal 123, Ciudad',
          referencia: 'Edificio azul',
          esPrincipal: true,
        },
        {
          id: 2,
          nombre: 'Trabajo',
          direccion: 'Calle Secundaria 456, Ciudad',
          referencia: 'Oficina 301',
          esPrincipal: false,
        },
      ];
      setLocations(mockLocations);
      setSelectedLocation(mockLocations.find(loc => loc.esPrincipal) || mockLocations[0]);
    }
  }, [user]);

  // Early return if user is not loaded
  if (!user) {
    return (
      <div className="client-dashboard-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando su dashboard...</p>
        </div>
      </div>
    );
  }

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        if (navigationState.view === 'home') {
          return <HomeView onCategoryClick={handleCategoryClick} />;
        } else if (navigationState.view === 'category') {
          return (
            <CategoryView
              categoryId={navigationState.categoryId!}
              categoryName={navigationState.categoryName!}
              onSubcategoryClick={handleSubcategoryClick}
              onBack={handleBackToHome}
            />
          );
        } else if (navigationState.view === 'subcategory') {
          return (
            <SubcategoryCompaniesView
              subcategoryId={navigationState.subcategoryId!}
              subcategoryName={navigationState.subcategoryName!}
              onBack={handleBackToCategory}
            />
          );
        }
        break;

      case 'cart':
        return (
          <div className="tab-content">
            <CartSummary
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
              companyData={cartCompanyData ? {
                id: cartCompanyData.id,
                name: cartCompanyData.name,
                ubicaciones: cartCompanyData.ubicaciones || []
              } : undefined}
            />
          </div>
        );

      case 'orders':
        return (
          <div className="tab-content">
            <MyOrders />
          </div>
        );

      case 'notifications':
        return (
          <div className="tab-content">
            <div className="notifications-view">
              <div className="view-header">
                <h1 className="view-title">Notificaciones</h1>
              </div>
              <div className="notifications-content">
                <NotificationsDropdown />
                <p className="coming-soon">Vista de notificaciones completa próximamente</p>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="tab-content">
            <ProfileSettings />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider companySlug="default">
      <div className="client-dashboard client-dashboard-mobile">
        {/* Top Navigation */}
        <TopNavbar
          onLocationClick={handleLocationClick}
          selectedLocation={selectedLocation?.nombre}
          onSearchClick={() => console.log('Search clicked')}
          onMenuClick={() => setActiveTab('profile')}
        />

        {/* Locations Dropdown */}
        <LocationsDropdown
          isOpen={showLocationsDropdown}
          onClose={() => setShowLocationsDropdown(false)}
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onAddLocation={handleAddLocation}
        />

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button
              className="error-close"
              onClick={() => window.location.reload()}
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="client-main-mobile">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          cartItemsCount={cart.totalItems}
          unreadNotifications={0}
        />
      </div>
    </ThemeProvider>
  );
};

export default ClientDashboard;
