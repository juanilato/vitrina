import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './NavigationHeader.css';

const NavigationHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/empresa/')) {
      const companyName = location.pathname.split('/')[2];
      return `Dashboard - ${companyName.charAt(0).toUpperCase() + companyName.slice(1)}`;
    }
    if (location.pathname === '/empresas') {
      return 'Selector de Empresas';
    }
    if (location.pathname === '/dashboard') {
      return 'Dashboard Principal';
    }
    return 'VITRINA';
  };

  return (
    <header className="navigation-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-section" onClick={() => navigate('/dashboard')}>
            <img 
              src="/vitrina-logo.png" 
              alt="VITRINA" 
              className="header-logo"
            />
            <span className="header-title">VITRINA</span>
          </div>
          
          <nav className="main-nav">
            <button 
              onClick={() => navigate('/dashboard')}
              className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/empresas')}
              className={`nav-link ${isActiveRoute('/empresas') ? 'active' : ''}`}
            >
              Empresas
            </button>
            {location.pathname.startsWith('/empresa/') && (
              <button 
                onClick={() => navigate('/empresas')}
                className="nav-link back-link"
              >
                ← Volver a Empresas
              </button>
            )}
          </nav>
        </div>
        
        <div className="header-right">
          <div className="user-section">
            <div className="user-avatar">
              <span className="avatar-text">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-role">
                {user?.type === 'empresa' ? 'Empresa' : 'Cliente'}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">→</span>
              Salir
            </button>
          </div>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <div className="breadcrumb">
          <button 
            onClick={() => navigate('/dashboard')}
            className="breadcrumb-item"
          >
            Inicio
          </button>
          {location.pathname === '/empresas' && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item current">Empresas</span>
            </>
          )}
          {location.pathname.startsWith('/empresa/') && (
            <>
              <span className="breadcrumb-separator">/</span>
              <button 
                onClick={() => navigate('/empresas')}
                className="breadcrumb-item"
              >
                Empresas
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item current">
                {location.pathname.split('/')[2]}
              </span>
            </>
          )}
        </div>
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>
    </header>
  );
};

export default NavigationHeader;
