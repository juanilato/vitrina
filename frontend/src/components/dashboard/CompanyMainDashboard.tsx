// CompanyMainDashboard.tsx
import React, { useState } from 'react';
import { useAuthOptimized } from '../../hooks/useAuthOptimized';
import CompanyNavbar from './shared/CompanyNavbar';
import ProductsSection from './sections/ProductsSection';
import IngredientsSection from './sections/IngredientsSection';
import OrdersSection from './sections/OrdersSection';
import NotificationsSection from './sections/NotificationsSection';
import AccountConfigSection from './sections/AccountConfigSection';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LastPageIcon from '@mui/icons-material/LastPage';

import './CompanyMainDashboard.css';
import NotificationPeek from './shared/NotificationPeek';
import NotificationsDropdown from '../common/NotificationsDropdown';

const CompanyMainDashboard: React.FC = () => {
  const { user, logout } = useAuthOptimized();
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'productos' | 'ingredientes' | 'pedidos' | 'notificacionesDropdown' | 'notificaciones' | 'estadisticas' | 'config'
  >('dashboard');

  const [showNotificationsPeek, setShowNotificationsPeek] = useState(false);
  
  // Sidebar control manual
  const [isSideOpen, setIsSideOpen] = useState(true);

  if (!user) return null;

  const handleLogout = () => logout();

  const handleSectionChange = (section: string) => {
    setActiveSection(section as any);
    // ❌ Ya no forzamos cerrar el sidebar aquí
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'productos': return <ProductsSection />;
      case 'pedidos': return <OrdersSection />;
      case 'ingredientes': return <IngredientsSection />;
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
        {/* HEADER EXISTENTE */}
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

        {/* 🔥 Se mantiene el hot-edge si querés abrir al acercar, pero ahora es opcional */}
        {/* <div className="hot-edge" onMouseEnter={() => setIsSideOpen(true)} aria-hidden /> */}

        <div className={`app-body ${!isSideOpen ? 'is-collapsed' : ''}`}>
          {/* Sidebar SIN auto-ocultar por hover */}
          <aside className="sidebar">
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
                              <button
                  type="button"
                  className="sidebar-toggle"
                  onClick={() => setIsSideOpen(v => !v)}
                  aria-pressed={isSideOpen}
                  aria-label={isSideOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
                  title={isSideOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
                 
                >
                  {isSideOpen ? <MenuOpenOutlinedIcon fontSize="small" /> : <MenuOutlinedIcon fontSize="small" />}

                </button>
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

              {/* 👉 Botón toggle fijo arriba-derecha */}
              <div className="toolbar-actions">
<button
  className={`notif-icon-btn ${showNotificationsPeek ? 'is-active' : ''}`}
  onClick={() => setShowNotificationsPeek(s => !s)}
  aria-expanded={showNotificationsPeek}
  aria-controls="notif-peek"
  title="Notificaciones"
>
  <NotificationsNoneOutlinedIcon fontSize="small" />
</button>

              </div>
            </div>

            <div className="workspace-content">{renderContent()}</div>
          </section>
          
        </div>

        <div className="statusbar">
          <div className="status-left" />
          <div className="status-right">Usuario: {user?.email}</div>
          
        </div>
              

      </div>
            {/* Side sheet de notificaciones */}
      <NotificationPeek
        open={showNotificationsPeek}
        onClose={() => setShowNotificationsPeek(false)}
        title="Notificaciones"
      >
        <NotificationsDropdown
          onViewAll={() => {
            setShowNotificationsPeek(false);
          }}
          showTrigger={false}
          isOpen={true}
          onClose={() => setShowNotificationsPeek(false)}
        />
      </NotificationPeek>
    </div>
  );
};

export default CompanyMainDashboard;
