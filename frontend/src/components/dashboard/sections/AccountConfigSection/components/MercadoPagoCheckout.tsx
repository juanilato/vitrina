import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
  Alert,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { initMercadoPago } from '@mercadopago/sdk-react';
import MERCADOPAGO_CONFIG, { isMercadoPagoConfigured } from '../../../../../config/mercadopago.config';
import { useSubscriptionCheckout } from '../hooks/useSubscriptionCheckout';
import { SubscriberData } from '../types/mercadopago.types';

interface MercadoPagoCheckoutProps {
  planId: string;
  planName: string;
  planPrice: number;
  empresaId: string;
  empresaEmail: string;
  empresaName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Componente de Checkout con MercadoPago para Suscripciones
 *
 * Este componente permite a las empresas suscribirse a un plan usando MercadoPago.
 * Genera una preferencia de suscripción y redirige al checkout de MercadoPago.
 */
export const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  planId,
  planName,
  planPrice,
  empresaId,
  empresaEmail,
  empresaName,
  onSuccess,
  onCancel,
}) => {
  // Estado del formulario de datos del suscriptor
  const [subscriberData, setSubscriberData] = useState<SubscriberData>({
    email: empresaEmail,
    first_name: empresaName.split(' ')[0] || '',
    last_name: empresaName.split(' ').slice(1).join(' ') || '',
    identification: {
      type: 'CUIT',
      number: '',
    },
  });

  const [isConfigValid, setIsConfigValid] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Hook personalizado para gestionar el checkout
  const { loading, error, initPoint, createPreapproval, reset } = useSubscriptionCheckout({
    planId,
    empresaId,
    subscriberData,
  });

  // Inicializar MercadoPago SDK
  useEffect(() => {
    try {
      if (!isMercadoPagoConfigured()) {
        setInitError(
          'MercadoPago no está configurado correctamente. Por favor, configura tu Public Key.'
        );
        return;
      }

      initMercadoPago(MERCADOPAGO_CONFIG.publicKey, {
        locale: MERCADOPAGO_CONFIG.locale,
      });

      setIsConfigValid(true);
      setInitError(null);
    } catch (err) {
      console.error('Error al inicializar MercadoPago:', err);
      setInitError('Error al inicializar MercadoPago. Verifica tu configuración.');
    }
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof SubscriberData, value: any) => {
    setSubscriberData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar cambio en identificación
  const handleIdentificationChange = (field: 'type' | 'number', value: string) => {
    setSubscriberData((prev) => ({
      ...prev,
      identification: {
        ...prev.identification!,
        [field]: value,
      },
    }));
  };

  // Procesar el checkout
  const handleCheckout = async () => {
    try {
      const checkoutUrl = await createPreapproval();

      if (checkoutUrl) {
        // Redirigir al checkout de MercadoPago
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error('Error al crear el checkout:', err);
    }
  };

  // Si hay un error de configuración
  if (initError) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {initError}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Para configurar MercadoPago:
          </Typography>
          <ol style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>Ve a https://www.mercadopago.com.ar/developers/panel</li>
            <li>Obtén tu Public Key (TEST o PROD)</li>
            <li>Agrégala a tu archivo .env como REACT_APP_MERCADOPAGO_PUBLIC_KEY</li>
          </ol>
          {onCancel && (
            <Button onClick={onCancel} sx={{ mt: 2 }}>
              Volver
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Suscribirse a {planName}
        </Typography>

        <Box sx={{ bgcolor: 'primary.50', p: 3, borderRadius: 2, mb: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Plan {planName}
          </Typography>
          <Typography variant="h3" color="primary" fontWeight="700">
            ${planPrice.toLocaleString('es-AR')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ARS / mes
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="500" gutterBottom>
            Métodos de pago disponibles:
          </Typography>
          <Typography variant="body2" component="div">
            • Tarjetas de crédito y débito
          </Typography>
          <Typography variant="body2" component="div">
            • Transferencia bancaria
          </Typography>
          <Typography variant="body2" component="div">
            • Código QR (Mercado Pago)
          </Typography>
          <Typography variant="body2" component="div">
            • Efectivo (Rapipago, Pago Fácil)
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={handleCheckout}
            disabled={loading || !isConfigValid}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Generando pago...' : 'Pagar con Mercado Pago'}
          </Button>

          {onCancel && (
            <Button variant="outlined" size="large" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            🔒 Pago 100% seguro con Mercado Pago
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Serás redirigido a Mercado Pago donde podrás elegir tu método de pago preferido:
            tarjeta, QR, transferencia o efectivo. El pago es totalmente seguro y encriptado.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MercadoPagoCheckout;
