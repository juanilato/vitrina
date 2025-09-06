import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import './NotificationsDropdown.css';

const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
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

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
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

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

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
                      {getNotificationIcon(notification.tipo)}
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
