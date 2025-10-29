import React from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';

import './CompanyNavbar.css';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

interface RepartidorNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

const RepartidorNavbar: React.FC<RepartidorNavbarProps> = ({
  activeSection,
  onSectionChange,
  onLogout,
}) => {
  const { user } = useAuthOptimized();

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
    { id: 'vinculacion', label: 'Vinculación', icon: <BusinessOutlinedIcon fontSize="small" /> },
    { id: 'pedidos_disponibles', label: 'Pedidos Disponibles', icon: <LocalShippingOutlinedIcon fontSize="small" /> },
    { id: 'mis_pedidos', label: 'Mis Pedidos', icon: <AssignmentOutlinedIcon fontSize="small" /> },
    { id: 'config', label: 'Configuración', icon: <SettingsOutlinedIcon fontSize="small" /> },
  ];

  return (
    <div className="cnav-root">
      <nav className="cnav-list" aria-label="Navegación principal">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`cnav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="cnav-icon">{item.icon}</span>
            <span className="cnav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {onLogout && (
        <div className="cnav-footer">
          <button className="cnav-item cnav-logout" onClick={onLogout}>
            <span className="cnav-icon"><LogoutOutlinedIcon fontSize="small" /></span>
            <span className="cnav-label">Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RepartidorNavbar;
