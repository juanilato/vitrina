import React from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';

import './CompanyNavbar.css';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

interface CompanyNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

const CompanyNavbar: React.FC<CompanyNavbarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { user } = useAuthOptimized();

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
    { id: 'productos', label: 'Productos', icon: <Inventory2OutlinedIcon fontSize="small" /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
    { id: 'estadisticas', label: 'Estadísticas', icon: <InsightsOutlinedIcon fontSize="small" /> },
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

export default CompanyNavbar;
