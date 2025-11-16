import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  CheckoutState,
  CreateSubscriptionPayload,
  MercadoPagoPreapprovalResponse,
  SubscriberData,
} from '../types/mercadopago.types';
import { getCallbackUrl } from '../../../../../config/mercadopago.config';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface UseSubscriptionCheckoutProps {
  planId: string;
  empresaId: string;
  subscriberData: SubscriberData;
}

/**
 * Hook personalizado para gestionar el proceso de checkout de suscripciones con MercadoPago
 *
 * @param planId - ID del plan a suscribirse
 * @param empresaId - ID de la empresa que se suscribe
 * @param subscriberData - Datos del suscriptor (email, nombre, etc.)
 */
export const useSubscriptionCheckout = ({
  planId,
  empresaId,
  subscriberData,
}: UseSubscriptionCheckoutProps) => {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
    success: false,
    preapprovalId: null,
    initPoint: null,
  });

  /**
   * Crea una preferencia de pago en MercadoPago y obtiene la URL de checkout
   */
  const createPreapproval = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Obtener información del plan desde tu backend
      const planResponse = await axios.get(`${API_URL}/subscriptions/plans/${planId}`);
      const plan = planResponse.data;

      // 2. Crear preferencia de pago en tu backend (que a su vez llama a MercadoPago)
      // Convertir el precio a número de forma segura
      const planPrice = parseFloat(plan.precio.toString());

      if (isNaN(planPrice) || planPrice <= 0) {
        throw new Error('El precio del plan no es válido');
      }

      const response = await axios.post<MercadoPagoPreapprovalResponse>(
        `${API_URL}/subscriptions/mercadopago/create-subscription`,
        {
          planId,
          planName: plan.nombre,
          planPrice: planPrice,
          empresaId,
          empresaEmail: subscriberData.email,
          empresaName: `${subscriberData.first_name} ${subscriberData.last_name}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { init_point, sandbox_init_point, id } = response.data;

      // Usar init_point (producción) siempre
      // MercadoPago automáticamente usa el modo correcto basado en las credenciales
      const checkoutUrl = init_point;

      setState({
        loading: false,
        error: null,
        success: true,
        preapprovalId: id,
        initPoint: checkoutUrl || null,
      });

      // Retornar la URL para redirigir al usuario
      return checkoutUrl;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al crear la preferencia de pago en MercadoPago';

      setState({
        loading: false,
        error: errorMessage,
        success: false,
        preapprovalId: null,
        initPoint: null,
      });

      throw new Error(errorMessage);
    }
  }, [planId, empresaId, subscriberData]);

  /**
   * Confirma la suscripción después de que el usuario completó el pago en MercadoPago
   * Esta función se llama desde la página de callback (success)
   */
  const confirmSubscription = useCallback(
    async (preapprovalId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Crear la suscripción en tu base de datos
        const payload: CreateSubscriptionPayload = {
          planId,
          empresaId,
          mercadoPagoData: {
            preapprovalId,
            payerId: 0, // Se obtendrá del webhook o consulta a MP
            payerEmail: subscriberData.email,
            externalReference: `${empresaId}-${planId}`,
          },
          metodoPagoData: {
            tipo: 'TARJETA_CREDITO',
            procesador: 'mercadopago',
            metadata: { preapprovalId },
          },
        };

        const response = await axios.post(`${API_URL}/subscriptions`, payload);

        setState({
          loading: false,
          error: null,
          success: true,
          preapprovalId,
          initPoint: null,
        });

        return response.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Error al confirmar la suscripción';

        setState({
          loading: false,
          error: errorMessage,
          success: false,
          preapprovalId: null,
          initPoint: null,
        });

        throw new Error(errorMessage);
      }
    },
    [planId, empresaId, subscriberData]
  );

  /**
   * Cancela una suscripción en MercadoPago y en tu sistema
   */
  const cancelSubscription = useCallback(
    async (subscriptionId: string, preapprovalId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await axios.patch(`${API_URL}/subscriptions/${subscriptionId}/cancel`, {
          preapprovalId,
        });

        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
        }));
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Error al cancelar la suscripción';

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        throw new Error(errorMessage);
      }
    },
    []
  );

  /**
   * Resetea el estado del checkout
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      preapprovalId: null,
      initPoint: null,
    });
  }, []);

  return {
    // Estado
    loading: state.loading,
    error: state.error,
    success: state.success,
    preapprovalId: state.preapprovalId,
    initPoint: state.initPoint,

    // Métodos
    createPreapproval,
    confirmSubscription,
    cancelSubscription,
    reset,
  };
};

export default useSubscriptionCheckout;
