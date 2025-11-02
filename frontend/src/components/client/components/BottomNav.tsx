import React from 'react';
import './BottomNav.css';

export type TabView = 'home' | 'cart' | 'orders' | 'notifications' | 'profile';

interface BottomNavProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  unreadNotifications?: number;
  cartItemsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadNotifications = 0,
  cartItemsCount = 0,
}) => {
  const tabs = [
    {
      id: 'home' as TabView,
      icon: '🏠',
      iconOutline: '🏠',
      label: 'Inicio',
    },
    {
      id: 'cart' as TabView,
      icon: '🛒',
      iconOutline: '🛒',
      label: 'Carrito',
      badge: cartItemsCount,
    },
    {
      id: 'orders' as TabView,
      icon: '📋',
      iconOutline: '📋',
      label: 'Pedidos',
    },
    {
      id: 'notifications' as TabView,
      icon: '🔔',
      iconOutline: '🔔',
      label: 'Notificaciones',
      badge: unreadNotifications,
    },
    {
      id: 'profile' as TabView,
      icon: '👤',
      iconOutline: '👤',
      label: 'Perfil',
    },
  ];

  return (
    <div className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <div className="bottom-nav-icon-container">
            <span className="bottom-nav-icon">
              {activeTab === tab.id ? tab.icon : tab.iconOutline}
            </span>
            {tab.badge && tab.badge > 0 ? (
              <span className="bottom-nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
            ) : null}
          </div>
          <span className="bottom-nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
