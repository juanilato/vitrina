import React, { useState, useEffect } from 'react';
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
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Cerrar dropdown de notificaciones cuando se cambie de sección
  useEffect(() => {
    if (activeSection !== 'notificaciones') {
      setShowNotificationsDropdown(false);
    }
  }, [activeSection]);

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'pedidos', label: 'Pedidos', icon: '🛒' },
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
          
          {/* Notificaciones como menú desplegable */}
          <div className="nav-notifications-container">
            <button
              className={`nav-item nav-notifications ${showNotificationsDropdown ? 'active' : ''}`}
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
              }}
            >
              <span className="nav-icon">🔔</span>
              <span className="nav-label">Notificaciones</span>
            </button>
            
            {/* Dropdown de notificaciones */}
            {showNotificationsDropdown && (
              <div className="nav-notifications-dropdown">
                <NotificationsDropdown 
                  onViewAll={() => {
                    setShowNotificationsDropdown(false);
                    onSectionChange('notificaciones');
                  }} 
                  showTrigger={false}
                  isOpen={true}
                  onClose={() => setShowNotificationsDropdown(false)}
                />
              </div>
            )}
          </div>
        </nav>

        {/* Acciones del usuario */}
        <div className="navbar-actions">
          {/* Perfil de usuario */}
          <div className="profile-container">
            <button
              className={`profile-btn ${showProfileMenu ? 'active' : ''}`}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {user.logo ? (
                  <img 
                    src={user.logo} 
                    alt={user.name}
                    className="avatar-image"
                    onError={(e) => {
                      // Si falla la imagen, mostrar la inicial del nombre
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span className="avatar-text" style={{ display: user.logo ? 'none' : 'flex' }}>
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
                    {user.logo ? (
                      <img 
                        src={user.logo} 
                        alt={user.name}
                        className="avatar-image"
                        onError={(e) => {
                          // Si falla la imagen, mostrar la inicial del nombre
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <span className="avatar-text" style={{ display: user.logo ? 'none' : 'flex' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="profile-menu-info">
                    <span className="profile-menu-name">{user.name}</span>
                    <span className="profile-menu-email">{user.email}</span>
                  </div>
                </div>
                <div className="profile-menu-items">
                  <button 
                    className="profile-menu-item"
                    onClick={() => {
                      onSectionChange('config');
                      setShowProfileMenu(false);
                    }}
                  >
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
