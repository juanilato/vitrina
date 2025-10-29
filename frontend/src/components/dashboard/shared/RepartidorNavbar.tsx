import React from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';

import './CompanyNavbar.css';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

interface RepartidorNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

const RepartidorNavbar: React.FC<RepartidorNavbarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { user } = useAuthOptimized();

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
    { id: 'vinculacion', label: 'Vinculación', icon: <BusinessOutlinedIcon fontSize="small" /> },
    { id: 'pedidos_disponibles', label: 'Pedidos Disponibles', icon: <ShoppingBagOutlinedIcon fontSize="small" /> },
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
    </div>
  );
};

export default RepartidorNavbar;
