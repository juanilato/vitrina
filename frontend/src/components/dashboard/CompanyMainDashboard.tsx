import React, { useState } from 'react';
import { useAuthOptimized } from '../../hooks/useAuthOptimized';
import CompanyNavbar from './shared/CompanyNavbar';

import ProductsSection from './sections/ProductsSection';
import OrdersSection from './sections/OrdersSection';
import NotificationsSection from './sections/NotificationsSection';
import './CompanyMainDashboard.css';

/**
 * CompanyMainDashboard - Dashboard principal para usuarios tipo empresa
 */
const CompanyMainDashboard: React.FC = () => {
  const { user, logout } = useAuthOptimized();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };


  const renderContent = () => {
    switch (activeSection) {
      case 'productos':
        return <ProductsSection />;
      case 'pedidos':
        return <OrdersSection />;
      case 'notificaciones':
        return <NotificationsSection />;
      case 'estadisticas':
        return <div className="section-placeholder">📈 Sección de Estadísticas (próximamente)</div>;
      case 'dashboard':
      default:
        return (
          <main className="dashboard-main">
            <div className="dashboard-container">
              <iframe src={`/tienda/${user.name}`} title="Dashboard" />
              </div>
          </main>
        );
    }
  };

  return (
    <div className="company-main-dashboard">
      <CompanyNavbar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />
      
      {renderContent()}
    </div>
  );
};

export default CompanyMainDashboard;
