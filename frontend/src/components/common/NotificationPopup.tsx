import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import './NotificationPopup.css';

const NotificationPopup: React.FC = () => {
  const { notifications } = useNotifications();
  const [showPopup, setShowPopup] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Solo mostrar popup si es una notificación nueva (menos de 5 segundos)
      const notificationTime = new Date(latestNotification.createdAt).getTime();
      const now = new Date().getTime();
      const timeDiff = now - notificationTime;
      
      if (timeDiff < 5000) { // 5 segundos
        setCurrentNotification(latestNotification);
        setShowPopup(true);
        
        // Auto-ocultar después de 5 segundos
        const timer = setTimeout(() => {
          setShowPopup(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'pedido_creado':
        return '🛒';
      case 'pedido_actualizado':
        return '📋';
      case 'general':
        return '🔔';
      default:
        return '📢';
    }
  };

  if (!showPopup || !currentNotification) return null;

  return (
    <div className="notification-popup-overlay">
      <div className="notification-popup">
        <div className="popup-header">
          <div className="popup-icon">
            {getNotificationIcon(currentNotification.tipo)}
          </div>
          <div className="popup-title">
            {currentNotification.titulo}
          </div>
          <button className="popup-close" onClick={handleClose}>
            ✕
          </button>
        </div>
        <div className="popup-content">
          <p className="popup-message">{currentNotification.mensaje}</p>
          <div className="popup-time">
            Ahora mismo
          </div>
        </div>
        <div className="popup-actions">
          <button className="popup-action-btn" onClick={handleClose}>
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
