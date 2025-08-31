import React, { useState } from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import './CompanyNavbar.css';

interface CompanyNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const CompanyNavbar: React.FC<CompanyNavbarProps> = ({
  activeSection,
  onSectionChange,
  onLogout
}) => {
  const { user } = useAuthOptimized();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'pedidos', label: 'Pedidos', icon: '🛒' },
    { id: 'estadisticas', label: 'Estadísticas', icon: '📈' },
  ];

  const notifications = [
    { id: 1, message: 'Nuevo pedido recibido', time: '5 min', type: 'order' },
    { id: 2, message: 'Producto con stock bajo', time: '1 hora', type: 'warning' },
    { id: 3, message: 'Nueva reseña recibida', time: '2 horas', type: 'review' },
  ];

  return (
    <header className="company-navbar">
      <div className="navbar-container">
        {/* Logo y título */}
        <div className="navbar-brand">
          <img 
            src="/vitrina-logo.png" 
            alt="VITRINA" 
            className="navbar-logo"
          />
          <span className="navbar-title">VITRINA</span>
          <span className="navbar-subtitle">Empresa</span>
        </div>

        {/* Navegación principal */}
        <nav className="navbar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Acciones del usuario */}
        <div className="navbar-actions">
          {/* Notificaciones */}
          <div className="notification-container">
            <button
              className={`notification-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notificaciones</h3>
                  <button className="mark-all-read">Marcar todas como leídas</button>
                </div>
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`notification-item ${notification.type}`}>
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">hace {notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notification-footer">
                  <button className="view-all-notifications">Ver todas</button>
                </div>
              </div>
            )}
          </div>

          {/* Perfil de usuario */}
          <div className="profile-container">
            <button
              className={`profile-btn ${showProfileMenu ? 'active' : ''}`}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                <span className="avatar-text">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="profile-info">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role">Empresa</span>
              </div>
              <span className="profile-arrow">▼</span>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-menu-header">
                  <div className="profile-menu-avatar">
                    <span className="avatar-text">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="profile-menu-info">
                    <span className="profile-menu-name">{user.name}</span>
                    <span className="profile-menu-email">{user.email}</span>
                  </div>
                </div>
                <div className="profile-menu-items">
                  <button className="profile-menu-item">
                    <span className="menu-icon">⚙️</span>
                    Configuración de Cuenta
                  </button>
                  <button className="profile-menu-item">
                    <span className="menu-icon">🏢</span>
                    Perfil de Empresa
                  </button>
                  <button className="profile-menu-item">
                    <span className="menu-icon">💳</span>
                    Facturación
                  </button>
                  <button className="profile-menu-item">
                    <span className="menu-icon">📞</span>
                    Soporte
                  </button>
                  <div className="menu-divider"></div>
                  <button className="profile-menu-item logout" onClick={onLogout}>
                    <span className="menu-icon">🚪</span>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CompanyNavbar;
