import React, { useState } from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import NotificationsDropdown from '../../common/NotificationsDropdown';
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'pedidos', label: 'Pedidos', icon: '🛒' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '🔔' },
    { id: 'estadisticas', label: 'Estadísticas', icon: '📈' },
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
          <NotificationsDropdown />

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
