import React from 'react';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import MopedIcon from '@mui/icons-material/Moped';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';

export type TabId = 'profile' | 'categories' | 'locations' | 'delivery' | 'preferences' | 'subscription';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface AccountConfigSidebarProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const TABS: readonly Tab[] = [
  { id: 'profile', label: 'Perfil', icon: <PersonOutlineOutlinedIcon fontSize="small" /> },
  { id: 'categories', label: 'Categorías', icon: <CategoryOutlinedIcon fontSize="small" /> },
  { id: 'locations', label: 'Precios Envío', icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { id: 'delivery', label: 'Repartidores', icon: <MopedIcon fontSize="small" /> },
  { id: 'preferences', label: 'Preferencias Web', icon: <TuneOutlinedIcon fontSize="small" /> },
  { id: 'subscription', label: 'Suscripción', icon: <CreditCardOutlinedIcon fontSize="small" /> },
];

const AccountConfigSidebar: React.FC<AccountConfigSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <aside className="acs-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <span className="sidebar-icon">
            <SettingsOutlinedIcon />
          </span>
          Configuración
        </h2>
      </div>

      <nav className="sidebar-content">
        <div className="sidebar-section">
          <div className="cnav-list">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`cnav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
                aria-pressed={activeTab === tab.id}
              >
                <span className="cnav-icon">{tab.icon}</span>
                <span className="cnav-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default AccountConfigSidebar;
