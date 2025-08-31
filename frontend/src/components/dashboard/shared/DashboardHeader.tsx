import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  onLogout: () => void;
  onDebugToken?: () => void;
  showDebug?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onLogout, 
  onDebugToken, 
  showDebug = false 
}) => {
  const { user, isCompany } = useAuthOptimized();
  const location = useLocation();

  if (!user) return null;

  return (
    <header className="dashboard-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-section">
            <img 
              src="/vitrina-logo.png" 
              alt="VITRINA" 
              className="header-logo"
            />
            <span className="header-title">VITRINA</span>
          </div>
        </div>
        
        <div className="header-center">
          <nav className="main-nav">
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              Dashboard
            </Link>
            <Link to="/empresas" className={`nav-link ${location.pathname === '/empresas' ? 'active' : ''}`}>
              Empresas
            </Link>
            {isCompany && (
              <>
                <Link to="/dashboard/products" className={`nav-link ${location.pathname === '/dashboard/products' ? 'active' : ''}`}>
                  Productos
                </Link>
                <Link to="/dashboard/analytics" className={`nav-link ${location.pathname === '/dashboard/analytics' ? 'active' : ''}`}>
                  Analíticas
                </Link>
                <Link to="/dashboard/settings" className={`nav-link ${location.pathname === '/dashboard/settings' ? 'active' : ''}`}>
                  Configuración
                </Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="header-right">
          <div className="user-section">
            <div className="user-avatar">
              <span className="avatar-text">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{isCompany ? 'Empresa' : 'Cliente'}</span>
            </div>
            {showDebug && onDebugToken && (
              <button onClick={onDebugToken} className="debug-btn" title="Debug Token">
                🔍
              </button>
            )}
            <button onClick={onLogout} className="logout-btn">
              <span className="logout-icon">→</span>
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
