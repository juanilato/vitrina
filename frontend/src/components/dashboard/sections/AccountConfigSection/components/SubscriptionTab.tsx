import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import useAccountConfig from '../hooks/useAccountConfig';
import axiosInstance from '../../../../../config/axios.config';
import MercadoPagoCheckout from './MercadoPagoCheckout';

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: string;
  intervalo: string;
  limites: any;
  caracteristicas: string[];
  activo: boolean;
  esPopular: boolean;
  orden: number;
}

interface Suscripcion {
  id: string;
  planId: string;
  plan: Plan;
  estado: string;
  inicioAt: string;
  finalizaAt: string;
  canceladaAt?: string;
  renovacionAuto: boolean;
  metodoPago?: MetodoPago;
}

interface MetodoPago {
  id: string;
  tipo: string;
  ultimos4: string;
  marca: string;
  expiraMes: number;
  expiraAnio: number;
  esPredeterminado: boolean;
}

const SubscriptionTab: React.FC = () => {
  const { empresaData } = useAccountConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [suscripcionActual, setSuscripcionActual] = useState<Suscripcion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Estados para diálogos
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Funciones de carga de datos
  const fetchPlanes = async () => {
    try {
      const { data } = await axiosInstance.get('/subscriptions/plans');
      setPlanes(data);
    } catch (err) {
      console.error('Error al cargar planes:', err);
    }
  };

  const fetchSuscripcionActual = useCallback(async () => {
    try {
      if (!empresaData) return;
      const { data } = await axiosInstance.get(`/subscriptions/empresa/${empresaData.id}`);
      setSuscripcionActual(data);
    } catch (err: any) {
      // Si no hay suscripción activa, no es un error
      if (err?.response?.status !== 404) {
        console.error('Error al cargar suscripción:', err);
      }
    }
  }, [empresaData]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPlanes(),
        fetchSuscripcionActual(),
      ]);
    } catch (err) {
      console.error('Error cargando datos de suscripción:', err);
      setError('Error al cargar los datos de suscripción');
    } finally {
      setLoading(false);
    }
  }, [fetchSuscripcionActual]);

  const processSubscription = useCallback(
    async (
      preferenceId: string,
      collectionId: string | null,
      externalReference: string
    ) => {
      try {
        setLoading(true);

        // Extraer planId y empresaId de la referencia externa
        const [extractedEmpresaId, extractedPlanId] = externalReference.split('-');

        // Crear la suscripción en el backend
        await axiosInstance.post('/subscriptions', {
          empresaId: extractedEmpresaId,
          planId: extractedPlanId,
          mercadoPagoData: {
            preferenceId,
            paymentId: collectionId,
            externalReference,
          },
        });

        // Recargar la suscripción actual
        await fetchSuscripcionActual();
        setSuccess('¡Suscripción activada exitosamente!');
      } catch (err: any) {
        console.error('Error al procesar suscripción:', err);
        setError('Error al activar la suscripción. Contacta a soporte.');
      } finally {
        setLoading(false);
      }
    },
    [fetchSuscripcionActual]
  );

  // Manejar el retorno de MercadoPago
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const collectionId = searchParams.get('collection_id');
    const collectionStatus = searchParams.get('collection_status');
    const preferenceId = searchParams.get('preference_id');
    const externalReference = searchParams.get('external_reference');

    if (paymentStatus) {
      if (paymentStatus === 'success' && collectionStatus === 'approved') {
        setSuccess('¡Pago aprobado! Tu suscripción se activará en breve.');
        // Procesar la suscripción en el backend
        if (preferenceId && externalReference) {
          processSubscription(preferenceId, collectionId, externalReference);
        }
      } else if (paymentStatus === 'pending') {
        setSuccess('Pago pendiente. Recibirás una confirmación cuando se procese.');
      } else if (paymentStatus === 'failure') {
        setError('El pago no pudo ser procesado. Por favor, intenta nuevamente.');
      }

      // Limpiar los parámetros de la URL
      setTimeout(() => {
        setSearchParams({});
        setSuccess('');
        setError('');
      }, 8000);
    }
  }, [searchParams, setSearchParams, processSubscription]);

  useEffect(() => {
    if (empresaData?.id) {
      fetchData();
    }
  }, [empresaData, fetchData]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setOpenCheckoutDialog(true);
  };

  const handleCheckoutSuccess = async () => {
    setOpenCheckoutDialog(false);
    setSuccess('¡Suscripción procesada exitosamente! Recibirás una confirmación en tu email.');
    await fetchSuscripcionActual();
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleCheckoutCancel = () => {
    setOpenCheckoutDialog(false);
    setSelectedPlan(null);
  };

  const handleCancelSubscription = async () => {
    if (!suscripcionActual || !empresaData) return;

    if (!window.confirm('¿Estás seguro de que deseas cancelar tu suscripción?')) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.patch(`/subscriptions/${suscripcionActual.id}/cancel`);
      await fetchSuscripcionActual();
      setSuccess('Suscripción cancelada. Seguirás teniendo acceso hasta el final del período actual.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Error al cancelar la suscripción';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoChip = (estado: string) => {
    const estados: any = {
      ACTIVA: { label: 'Activa', color: 'success' },
      CANCELADA: { label: 'Cancelada', color: 'error' },
      SUSPENDIDA: { label: 'Suspendida', color: 'warning' },
      VENCIDA: { label: 'Vencida', color: 'error' },
      PENDIENTE_PAGO: { label: 'Pendiente de pago', color: 'warning' },
    };
    const config = estados[estado] || { label: estado, color: 'default' };
    return <Chip label={config.label} color={config.color as any} size="small" />;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && planes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="600">
        Suscripción
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Administra tu plan de suscripción y métodos de pago
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Suscripción Actual */}
      {suscripcionActual && (
        <Card sx={{ mb: 4, border: '2px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="600">
                Tu Suscripción Actual
              </Typography>
              {getEstadoChip(suscripcionActual.estado)}
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Plan
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {suscripcionActual.plan.nombre}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Precio
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {formatCurrency(Number(suscripcionActual.plan.precio), suscripcionActual.plan.moneda)} / {suscripcionActual.plan.intervalo}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha de inicio
                </Typography>
                <Typography variant="body1">
                  {formatDate(suscripcionActual.inicioAt)}
                </Typography>
              </Grid>

              {suscripcionActual.finalizaAt && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {suscripcionActual.renovacionAuto ? 'Próxima renovación' : 'Finaliza el'}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(suscripcionActual.finalizaAt)}
                  </Typography>
                </Grid>
              )}

              {suscripcionActual.metodoPago && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Método de pago
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <CreditCardIcon fontSize="small" />
                    <Typography variant="body1">
                      {suscripcionActual.metodoPago.marca} •••• {suscripcionActual.metodoPago.ultimos4}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>

          {suscripcionActual.estado === 'ACTIVA' && (
            <CardActions>
              <Button
                size="small"
                color="error"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                Cancelar Suscripción
              </Button>
            </CardActions>
          )}
        </Card>
      )}

      {/* Planes Disponibles */}
      <Typography variant="h6" gutterBottom fontWeight="600" mb={2}>
        {suscripcionActual ? 'Cambiar de Plan' : 'Planes Disponibles'}
      </Typography>

      <Grid container spacing={3}>
        {planes.map((plan) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.esPopular ? '2px solid' : '1px solid',
                borderColor: plan.esPopular ? 'primary.main' : 'divider',
              }}
            >
              {plan.esPopular && (
                <Chip
                  icon={<StarIcon />}
                  label="Popular"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  {plan.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {plan.descripcion}
                </Typography>

                <Box display="flex" alignItems="baseline" mb={2}>
                  <Typography variant="h4" fontWeight="700" color="primary.main">
                    {formatCurrency(Number(plan.precio), plan.moneda)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    / {plan.intervalo}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  {plan.caracteristicas.map((feature: string, index: number) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant={
                    suscripcionActual?.planId === plan.id
                      ? 'outlined'
                      : plan.esPopular
                      ? 'contained'
                      : 'outlined'
                  }
                  disabled={suscripcionActual?.planId === plan.id || loading}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {suscripcionActual?.planId === plan.id
                    ? 'Plan Actual'
                    : 'Seleccionar Plan'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para Checkout con MercadoPago */}
      <Dialog
        open={openCheckoutDialog}
        onClose={handleCheckoutCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Completar Suscripción</DialogTitle>
        <DialogContent>
          {selectedPlan && empresaData && (
            <MercadoPagoCheckout
              planId={selectedPlan.id}
              planName={selectedPlan.nombre}
              planPrice={Number(selectedPlan.precio)}
              empresaId={empresaData.id}
              empresaEmail={empresaData.email}
              empresaName={empresaData.name}
              onSuccess={handleCheckoutSuccess}
              onCancel={handleCheckoutCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubscriptionTab;
