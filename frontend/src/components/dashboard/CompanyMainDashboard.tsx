// CompanyMainDashboard.tsx (solo cambios relevantes)
import React, { useState } from 'react';
import { useAuthOptimized } from '../../hooks/useAuthOptimized';
import CompanyNavbar from './shared/CompanyNavbar';

import ProductsSection from './sections/ProductsSection';
import OrdersSection from './sections/OrdersSection';
import NotificationsSection from './sections/NotificationsSection';
import AccountConfigSection from './sections/AccountConfigSection';

import './CompanyMainDashboard.css';

const CompanyMainDashboard: React.FC = () => {
  const { user, logout } = useAuthOptimized();
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'productos' | 'pedidos' | 'notificacionesDropdown' | 'notificaciones' | 'estadisticas' | 'config'
  >('dashboard');

  // ⬇️ NUEVO: control de visibilidad del sidebar
  const [isSideOpen, setIsSideOpen] = useState(true);

  if (!user) return null;

  const handleLogout = () => logout();

  const handleSectionChange = (section: string) => {
    setActiveSection(section as any);
    // cuando seleccionás algo, ocultamos el sidebar
    setIsSideOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'productos': return <ProductsSection />;
      case 'pedidos': return <OrdersSection />;
      case 'notificacionesDropdown':
      case 'notificaciones': return <NotificationsSection />;
      case 'estadisticas': return <div className="section-placeholder">📈 Sección de Estadísticas (próximamente)</div>;
      case 'config': return <div className="tab-content"><AccountConfigSection /></div>;
      default:
        return (
          <main className="dashboard-main">
            <div className="dashboard-container">
              <div className="content-card">
                <div className="card-header">
                  <h3 className="card-title">Bienvenido, {user?.name || 'Empresa'}</h3>
                  <span className="card-badge">Panel</span>
                </div>
                <div className="card-content">
                  <p className="muted">Usá el menú lateral para gestionar productos, pedidos, notificaciones y tu configuración.</p>
                </div>
              </div>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="desktop-shell">
      <div className="app-window">
        {/* HEADER EXISTENTE — no se toca */}
        <div className="titlebar" data-tauri-drag-region>
          <div className="titlebar-left">
            <img src="/vitrina-logo.png" alt="Vitrina" className="cnav-logo"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
            <span className="app-title">Vitrina • Panel de Empresa</span>
          </div>
          <div className="titlebar-right">
            <button className="toolbar-btn" onClick={handleLogout} title="Cerrar sesión">Cerrar sesión</button>
          </div>
        </div>

        {/* HOT-EDGE: al acercar el mouse reabre el sidebar */}
        <div
          className="hot-edge"
          onMouseEnter={() => setIsSideOpen(true)}
          aria-hidden
        />

        {/* CUERPO */}
        <div className={`app-body ${!isSideOpen ? 'is-collapsed' : ''}`}>
          {/* Sidebar (con animación) */}
          <aside
            className="sidebar"
            onMouseLeave={() => setIsSideOpen(false)}
            onMouseEnter={() => setIsSideOpen(true)}
          >
            {/* Podés dejar este hint o sacarlo */}
            <div className="cnav-userhint" title={user.email}>
              <div className="cnav-avatar">{(user?.name || 'E')[0]?.toUpperCase()}</div>
              <div className="cnav-user-meta">
                <div className="cnav-user-name">{user.name}</div>
                <div className="cnav-user-role">Empresa</div>
              </div>
            </div>

            <nav className="sidebar-nav">
              <CompanyNavbar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                onLogout={handleLogout}
              />
            </nav>
          </aside>

          {/* Área de trabajo */}
          <section className="workspace">
            <div className="workspace-toolbar">
              <div className="breadcrumbs">
                <span className="crumb">Inicio</span><span className="crumb-sep">/</span>
                <span className="crumb active">
                  {activeSection === 'dashboard' ? 'Panel'
                    : activeSection === 'productos' ? 'Productos'
                    : activeSection === 'pedidos' ? 'Pedidos'
                    : activeSection === 'notificaciones' || activeSection === 'notificacionesDropdown' ? 'Notificaciones'
                    : activeSection === 'estadisticas' ? 'Estadísticas'
                    : activeSection === 'config' ? 'Configuración' : activeSection}
                </span>
              </div>
              <div className="toolbar-actions" />
            </div>

            <div className="workspace-content">{renderContent()}</div>
          </section>
        </div>

        {/* Status bar */}
        <div className="statusbar">
          <div className="status-left" />
          <div className="status-right">Usuario: {user?.email}</div>
        </div>
      </div>
    </div>
  );
};

export default CompanyMainDashboard;
