import React, { useEffect, useRef, useState } from 'react';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import NotificationsDropdown from '../../common/NotificationsDropdown';
import './CompanyNavbar.css';

interface CompanyNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void; // se mantiene por compatibilidad, aunque no se usa aquí
}

const CompanyNavbar: React.FC<CompanyNavbarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { user } = useAuthOptimized();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSection !== 'notificaciones') {
      setShowNotificationsDropdown(false);
    }
  }, [activeSection]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };
    if (showNotificationsDropdown) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotificationsDropdown]);

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'pedidos', label: 'Pedidos', icon: '🛒' },
    { id: 'estadisticas', label: 'Estadísticas', icon: '📈' },
  ];

  return (
    <div className="cnav-root">
      {/* Marca compacta (solo cuando el sidebar esté en modo “estrecho” hereda por CSS) */}


      {/* Navegación principal */}
      <nav className="cnav-list" aria-label="Navegación principal">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`cnav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="cnav-icon" aria-hidden>{item.icon}</span>
            <span className="cnav-label">{item.label}</span>
          </button>
        ))}

        {/* Notificaciones */}
        <div className="cnav-group" ref={notifRef}>
          <button
            className={`cnav-item ${showNotificationsDropdown ? 'active' : ''}`}
            onClick={() => setShowNotificationsDropdown((s) => !s)}
          >
            <span className="cnav-icon" aria-hidden>🔔</span>
            <span className="cnav-label">Notificaciones</span>
            <span className="cnav-pill" aria-label="Nuevas">•</span>
          </button>

          {showNotificationsDropdown && (
            <div className="cnav-dropdown">
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

      {/* Hint de usuario (sólo informativo en la barra lateral) */}
 
    </div>
  );
};

export default CompanyNavbar;
