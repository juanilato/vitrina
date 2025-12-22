/**
 * Status Colors - Colores suaves y profesionales para estados
 * Inspirados en el diseño minimalista de CategoryCard3D
 */

export const statusColors = {
  // Estados de pedido
  order: {
    pendiente_confirmacion: {
      color: '#F57C00',      // Naranja suave
      background: 'rgba(245, 124, 0, 0.1)',
      label: 'Por confirmar',
      icon: 'time-outline' as const,
    },
    confirmado: {
      color: '#2E7D32',      // Verde profesional
      background: 'rgba(46, 125, 50, 0.1)',
      label: 'Confirmado',
      icon: 'checkmark-circle' as const,
    },
    en_proceso: {
      color: '#1565C0',      // Azul medio
      background: 'rgba(21, 101, 192, 0.1)',
      label: 'Preparando',
      icon: 'flame-outline' as const,
    },
    esperando_delivery: {
      color: '#F57C00',      // Naranja suave
      background: 'rgba(245, 124, 0, 0.1)',
      label: 'Esperando',
      icon: 'bicycle-outline' as const,
    },
    en_camino: {
      color: '#0A2A43',      // Azul oscuro principal
      background: 'rgba(10, 42, 67, 0.1)',
      label: 'En camino',
      icon: 'bicycle' as const,
    },
    entregado: {
      color: '#2E7D32',      // Verde profesional
      background: 'rgba(46, 125, 50, 0.1)',
      label: 'Entregado',
      icon: 'checkmark-done' as const,
    },
    esperando_retiro: {
      color: '#2E7D32',      // Verde profesional
      background: 'rgba(46, 125, 50, 0.1)',
      label: 'Listo',
      icon: 'storefront' as const,
    },
    cancelado: {
      color: '#D32F2F',      // Rojo suave
      background: 'rgba(211, 47, 47, 0.1)',
      label: 'Cancelado',
      icon: 'close-circle' as const,
    },
  },

  // Estados de disponibilidad
  availability: {
    available: {
      color: '#2E7D32',
      background: 'rgba(46, 125, 50, 0.1)',
    },
    unavailable: {
      color: '#D32F2F',
      background: 'rgba(211, 47, 47, 0.1)',
    },
    limited: {
      color: '#F57C00',
      background: 'rgba(245, 124, 0, 0.1)',
    },
  },

  // Estados de pago
  payment: {
    paid: {
      color: '#2E7D32',
      background: 'rgba(46, 125, 50, 0.1)',
    },
    pending: {
      color: '#F57C00',
      background: 'rgba(245, 124, 0, 0.1)',
    },
    failed: {
      color: '#D32F2F',
      background: 'rgba(211, 47, 47, 0.1)',
    },
  },

  // Estados genéricos
  generic: {
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#D32F2F',
    info: '#1565C0',
    neutral: '#00695C',
  },
};

export type OrderStatus = keyof typeof statusColors.order;
export type OrderStatusConfig = typeof statusColors.order[OrderStatus];
