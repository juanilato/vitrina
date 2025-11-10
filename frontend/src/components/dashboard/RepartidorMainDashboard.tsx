// RepartidorMainDashboard.tsx
import React, { useState } from 'react';
import { useAuthOptimized } from '../../hooks/useAuthOptimized';
import { RepartidorSocketProvider } from '../../contexts/RepartidorSocketContext';
import RepartidorNavbar from './shared/RepartidorNavbar';
import VinculacionSection from './sections/VinculacionSection';
import TomaPedidosSection from './sections/TomaPedidosSection';
import RepartidorOrdersSection from './sections/RepartidorOrdersSection';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

import './CompanyMainDashboard.css';
import NotificationPeek from './shared/NotificationPeek';
import NotificationsDropdown from '../common/NotificationsDropdown';

const RepartidorMainDashboard: React.FC = () => {
  const { user, logout } = useAuthOptimized();
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'vinculacion' | 'pedidos_disponibles' | 'mis_pedidos' | 'notificacionesDropdown' | 'notificaciones' | 'config'
  >('dashboard');

  const [showNotificationsPeek, setShowNotificationsPeek] = useState(false);
  
  // Sidebar control manual
  const [isSideOpen, setIsSideOpen] = useState(true);

  if (!user) return null;

  const handleLogout = () => logout();

  const handleSectionChange = (section: string) => {
    setIsSideOpen(false);
    setActiveSection(section as any);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'vinculacion': return <VinculacionSection />;
      case 'pedidos_disponibles': return <TomaPedidosSection />;
      case 'mis_pedidos': return <RepartidorOrdersSection />;
      case 'notificaciones': return <div className="section-placeholder">🔔 Notificaciones</div>;
      case 'config': return <div className="section-placeholder">⚙️ Configuración (próximamente)</div>;
      default:
        return (
          <main className="dashboard-main">
            <div className="dashboard-container">
              <div className="content-card">
                <div className="card-header">
                  <h3 className="card-title">Bienvenido, {user?.name || 'Repartidor'}</h3>
                  <span className="card-badge">Panel</span>
                </div>
                <div className="card-content">
                  <p className="muted">Usá el menú lateral para gestionar tus vinculaciones con empresas, tomar pedidos y ver tus entregas.</p>
                </div>
              </div>
            </div>
          </main>
        );
    }
  };

  return (
    <RepartidorSocketProvider>
      <div className="desktop-shell">
        <div className="app-window">
          {/* HEADER */}
          <div className="titlebar" data-tauri-drag-region>
            <div className="titlebar-left">
              <img src="/vitrina-logo.png" alt="Vitrina" className="cnav-logo"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
              <span className="app-title">Vitrina • Panel de Repartidor</span>
            </div>
            <div className="titlebar-right">
              <button className="toolbar-btn" onClick={handleLogout} title="Cerrar sesión">Cerrar sesión</button>
            </div>
          </div>

          <div className={`app-body ${!isSideOpen ? 'is-collapsed' : ''}`}>
            {/* Overlay para cerrar sidebar en mobile */}
            {!isSideOpen && (
              <div
                className="sidebar-overlay"
                onClick={() => setIsSideOpen(true)}
                aria-hidden="true"
              />
            )}

            {/* Sidebar */}
            <aside className="sidebar">
              <div className="cnav-userhint" title={user.email}>
                <div className="cnav-avatar">{(user?.name || 'R')[0]?.toUpperCase()}</div>
                <div className="cnav-user-meta">
                  <div className="cnav-user-name">{user.name}</div>
                  <div className="cnav-user-role">Repartidor</div>
                </div>
              </div>

              <nav className="sidebar-nav">
                <RepartidorNavbar
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
                      : activeSection === 'vinculacion' ? 'Vinculación'
                      : activeSection === 'pedidos_disponibles' ? 'Pedidos Disponibles'
                      : activeSection === 'mis_pedidos' ? 'Mis Pedidos'
                      : activeSection === 'notificaciones' || activeSection === 'notificacionesDropdown' ? 'Notificaciones'
                      : activeSection === 'config' ? 'Configuración' : activeSection}
                  </span>
                </div>

                <div className="toolbar-actions">
                  <button
                    className={`notif-icon-btn ${showNotificationsPeek ? 'is-active' : ''}`}
                    onClick={() => setShowNotificationsPeek(s => !s)}
                    aria-expanded={showNotificationsPeek}
                    aria-controls="notif-peek"
                    title="Notificaciones"
                  >
                    🔔
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
    </RepartidorSocketProvider>
  );
};

export default RepartidorMainDashboard;
