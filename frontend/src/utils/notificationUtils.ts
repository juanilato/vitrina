/**
 * Utilidades compartidas para notificaciones
 */

export const getNotificationIcon = (tipo: string): string => {
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

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
};

export const getNotificationStyles = (tipo: string) => {
  const baseStyles = {
    icon: getNotificationIcon(tipo),
    color: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)'
  };

  switch (tipo) {
    case 'pedido_creado':
      return { ...baseStyles, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' };
    case 'pedido_actualizado':
      return { ...baseStyles, color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' };
    case 'general':
      return { ...baseStyles, color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' };
    default:
      return baseStyles;
  }
};
