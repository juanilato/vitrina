import React, { useEffect, useState } from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import axiosInstance from '../../../config/axios.config';
import { isProfileComplete } from '../../../utils/profileCompletionUtils';
import { EmpresaData } from '../sections/AccountConfigSection/types';

import './CompanyNavbar.css';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DinnerDiningIcon from '@mui/icons-material/Fastfood';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  // Verificar completación del perfil
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user?.id) return;

      try {
        const response = await axiosInstance.get<EmpresaData>(`/empresas/${user.id}`);
        const isComplete = isProfileComplete(response.data);
        setProfileIncomplete(!isComplete);
      } catch (error) {
        console.error('Error al verificar completación del perfil:', error);
      }
    };

    checkProfileCompletion();
  }, [user?.id]);

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
    { id: 'productos', label: 'Productos', icon: <Inventory2OutlinedIcon fontSize="small" /> },
    { id: 'ingredientes', label: 'Ingredientes', icon: <DinnerDiningIcon fontSize="small" /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
    { id: 'estadisticas', label: 'Estadísticas', icon: <InsightsOutlinedIcon fontSize="small" /> },
    { id: 'manual', label: 'Manual de Usuario', icon: <HelpOutlineIcon fontSize="small" /> },
    { id: 'config', label: 'Configuración', icon: <SettingsOutlinedIcon fontSize="small" />, showAlert: profileIncomplete },
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
            {item.showAlert && (
              <span className="cnav-badge-alert" title="Perfil incompleto">
                !
              </span>
            )}
          </button>
        ))}


      </nav>


    </div>
  );
};

export default CompanyNavbar;
