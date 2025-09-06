import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io } from 'socket.io-client';
import { useAuthOptimized } from '../hooks/useAuthOptimized';

interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  socket: any;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user } = useAuthOptimized();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Obtener token del localStorage
  const token = localStorage.getItem('token');

  // Conectar WebSocket cuando el usuario esté autenticado
  useEffect(() => {
    if (user && token) {
      console.log('🔌 Conectando WebSocket con token:', token ? 'Presente' : 'No encontrado');
      
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
        auth: {
          token: token,
        },
        query: {
          token: token,
        },
        extraHeaders: {
          'Authorization': `Bearer ${token}`,
        },
      });

      newSocket.on('connect', () => {
        console.log('✅ Conectado al WebSocket');
        newSocket.emit('join-notifications');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
      });

      newSocket.on('new-notification', (notification: Notification) => {
        console.log('Nueva notificación recibida:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      newSocket.on('notification-count-update', (data: { count: number }) => {
        console.log('Contador de notificaciones actualizado:', data.count);
        setUnreadCount(data.count);
      });

      newSocket.on('notification-marked-read', (data: { notificationId: string }) => {
        console.log('Notificación marcada como leída:', data.notificationId);
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === data.notificationId
              ? { ...notif, leida: true }
              : notif
          )
        );
      });

      newSocket.on('disconnect', () => {
        console.log('Desconectado del WebSocket');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);

  // Obtener notificaciones del servidor
  const fetchNotifications = async () => {
    if (!user || !token) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener contador de notificaciones no leídas
  const fetchUnreadCount = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data);
      }
    } catch (error) {
      console.error('Error obteniendo contador de notificaciones:', error);
    }
  };

  // Cargar notificaciones cuando el usuario cambie
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, token]);

  // Marcar notificación como leída
  const markAsRead = async (id: string) => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id
              ? { ...notif, leida: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Enviar por WebSocket también
        if (socket) {
          socket.emit('mark-notification-read', { notificationId: id });
        }
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, leida: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (id: string) => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const deletedNotification = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        
        if (deletedNotification && !deletedNotification.leida) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    socket,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    loading,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
