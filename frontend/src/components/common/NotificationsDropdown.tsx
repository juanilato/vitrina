import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { getNotificationIcon, formatTimeAgo } from '../../utils/notificationUtils';
import './NotificationsDropdown.css';

interface NotificationsDropdownProps {
  onViewAll?: () => void;
  showTrigger?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}
// Listado de notificaciones
const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ 
  onViewAll, 
  showTrigger = true, 
  isOpen: externalIsOpen, 
  onClose 
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Usar el estado externo si se proporciona, sino usar el interno
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose ? onClose : setInternalIsOpen;

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };


  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      {showTrigger && (
        <button
          className="notifications-trigger"
          onClick={() => setIsOpen(!isOpen)}
          title="Notificaciones"
        >
          <span className="notification-icon">🔔</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="notifications-panel">



          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <div className="loading-spinner"></div>
                <p>Cargando notificaciones...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notifications-icon">📭</span>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.leida ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-icon">
                      {getNotificationIcon(notification.tipo, notification.metadata)}
                    </div>
                    <div className="notification-text">
                      <h4 className="notification-title">{notification.titulo}</h4>
                      <p className="notification-message">{notification.mensaje}</p>
                      <span className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <div className="notification-actions">
                      <button
                        className="delete-notification-btn"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        title="Eliminar notificación"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {!notification.leida && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
