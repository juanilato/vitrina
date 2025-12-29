import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationsContext';
import { useAuthOptimized } from '../../../hooks/useAuthOptimized';
import './NotificationsSection.css';
import { NotificationsSectionSkeleton } from '../../skeletons';

const NotificationsSection: React.FC = () => {
  const { user } = useAuthOptimized();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.leida)
    : notifications;

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

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'pedido_creado':
        return '#28a745';
      case 'pedido_actualizado':
        return '#007bff';
      case 'general':
        return '#6c757d';
      default:
        return '#667eea';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="desktop-shell">
      <div className="app-window">
        {/* TITLEBAR */}
        <div className="titlebar" data-tauri-drag-region>
          <div className="titlebar-left">
            <img src="/vitrina-logo.png" alt="Vitrina" className="cnav-logo"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
            <span className="app-title">Vitrina • Notificaciones</span>
          </div>
          <div className="titlebar-right">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todas ({notifications.length})
              </button>
              <button
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                No leídas ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                className="toolbar-btn"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="app-body">
          <section className="workspace">
            <div className="workspace-content">
              <div className="notifications-content">
        {loading ? (
          <NotificationsSectionSkeleton />
        ) : filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <span className="no-notifications-icon">📭</span>
            <p>No hay notificaciones {filter === 'unread' ? 'no leídas' : ''}</p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.leida ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon" style={{ color: getNotificationColor(notification.tipo) }}>
                  {getNotificationIcon(notification.tipo)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.titulo}</h4>
                    <span className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  
                  <p className="notification-message">{notification.mensaje}</p>
                  
                  {notification.metadata && (
                    <div className="notification-metadata">
                      {notification.metadata.pedidoId && (
                        <span className="metadata-item">
                          Pedido: {notification.metadata.pedidoId.slice(-8)}
                        </span>
                      )}
                      {notification.metadata.totalAmount && (
                        <span className="metadata-item">
                          Total: ${notification.metadata.totalAmount.toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                  )}
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
                
                {!notification.leida && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal de detalles de notificación */}
      {selectedNotification && (
        <div className="notification-modal-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedNotification.titulo}</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedNotification(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <p>{selectedNotification.mensaje}</p>

              {selectedNotification.metadata && (
                <div className="modal-metadata">
                  <h4>Detalles:</h4>
                  <div className="metadata-grid">
                    {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                      <div key={key} className="metadata-item">
                        <span className="metadata-key">{key}:</span>
                        <span className="metadata-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn secondary"
                onClick={() => setSelectedNotification(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
