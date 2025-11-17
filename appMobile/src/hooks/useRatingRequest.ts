/**
 * Hook para manejar la solicitud automática de valoración
 * después de que un pedido es entregado
 */

import { useState, useEffect, useRef } from 'react';
import { RATING_REQUEST_DELAY } from '../utils/constants';
import ratingService from '../services/rating.service';
import { PedidoWithDetails } from '../types/order';

interface Order {
  id: string;
  estado: string;
  entregadoAt?: string;
  empresa?: {
    name: string;
  };
  tipoEntrega: 'delivery' | 'retiro';
  ItemPedido?: Array<{
    id: string;
    producto: {
      id: string;
      nombre: string;
    };
  }>;
}

interface UseRatingRequestResult {
  shouldShowRatingModal: boolean;
  orderToRate: Order | null;
  dismissRatingRequest: () => void;
  markAsRated: () => void;
}

export const useRatingRequest = (orders: PedidoWithDetails[]): UseRatingRequestResult => {
  const [shouldShowRatingModal, setShouldShowRatingModal] = useState(false);
  const [orderToRate, setOrderToRate] = useState<Order | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const checkedOrdersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    checkForRatingRequests();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [orders]);

  const checkForRatingRequests = async () => {
    // Buscar pedidos entregados que necesiten valoración
    const deliveredOrders = orders.filter(
      (order) =>
        order.estado === 'entregado' &&
        order.entregadoAt &&
        !checkedOrdersRef.current.has(order.id)
    );

    if (deliveredOrders.length === 0) return;

    // Ordenar por fecha de entrega (más reciente primero)
    const sortedOrders = deliveredOrders.sort((a, b) => {
      const dateA = new Date(a.entregadoAt!).getTime();
      const dateB = new Date(b.entregadoAt!).getTime();
      return dateB - dateA;
    });

    // Verificar el pedido más reciente
    for (const order of sortedOrders) {
      const entregadoAt = new Date(order.entregadoAt!).getTime();
      const now = Date.now();
      const timeSinceDelivery = now - entregadoAt;

      // Si ya pasó el tiempo de espera, verificar si puede ser valorado
      if (timeSinceDelivery >= RATING_REQUEST_DELAY) {
        try {
          const canRate = await ratingService.canRateOrder(order.id);

          if (canRate.canRate) {
            // Mostrar modal de valoración
            setOrderToRate(order);
            setShouldShowRatingModal(true);
            checkedOrdersRef.current.add(order.id);
            return;
          } else {
            // Ya fue valorado o no puede ser valorado
            checkedOrdersRef.current.add(order.id);
          }
        } catch (error) {
          console.error('Error verificando si puede valorar:', error);
          checkedOrdersRef.current.add(order.id);
        }
      } else {
        // Programar timer para cuando se cumpla el tiempo
        const remainingTime = RATING_REQUEST_DELAY - timeSinceDelivery;

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          checkForRatingRequests();
        }, remainingTime);

        return;
      }
    }
  };

  const dismissRatingRequest = () => {
    setShouldShowRatingModal(false);
    if (orderToRate) {
      checkedOrdersRef.current.add(orderToRate.id);
    }
    setOrderToRate(null);
  };

  const markAsRated = () => {
    setShouldShowRatingModal(false);
    if (orderToRate) {
      checkedOrdersRef.current.add(orderToRate.id);
    }
    setOrderToRate(null);
  };

  return {
    shouldShowRatingModal,
    orderToRate,
    dismissRatingRequest,
    markAsRated,
  };
};
