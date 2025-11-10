import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import useAccountConfig from '../hooks/useAccountConfig';
import axiosInstance from '../../../../../config/axios.config';
import { useWebSocket } from '../../../../../hooks/useWebSocket';
// Tab para agregar repartidores a usuario 
const RepartidoresTab: React.FC = () => {
  const { empresaData } = useAccountConfig();
  const [repartidores, setRepartidores] = useState<any[]>([]);
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [notification, setNotification] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { on, off, isConnected } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
    if (empresaData?.id) fetchRepartidores();
  }, [empresaData]);

  useEffect(() => {
    if (!isConnected) return;

    // Escuchar actualizaciones de vinculaciones
    const handleVinculacionActualizada = (data: any) => {
      console.log('[RepartidoresTab] Vinculación actualizada:', data);
      setNotification(`${data.repartidorName} ${data.estado === 'ACEPTADO' ? 'aceptó' : 'rechazó'} la vinculación`);
      fetchRepartidores();

      // Quitar notificación después de 5 segundos
      setTimeout(() => setNotification(''), 5000);
    };

    on('vinculacion_actualizada', handleVinculacionActualizada);

    return () => {
      off('vinculacion_actualizada', handleVinculacionActualizada);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]); // Solo depende de isConnected. on/off son estables

  const fetchRepartidores = async () => {
    try {
      setLoading(true);
      if(!empresaData) return;
      const { data } = await axiosInstance.get(`/empresas/${empresaData.id}/repartidores`);
      setRepartidores(data);
    } catch (err) {
      console.error('Error cargando repartidores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarRepartidor = async () => {
    if (!codigo.trim()) {
      setError('Por favor ingresá un código de vinculación');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      setAgregando(true);
      setError('');
      setSuccess('');

      if(!empresaData) return;

      const response = await axiosInstance.post(`/empresas/${empresaData.id}/vincular-repartidor`, { codigo });

      setCodigo('');
      setSuccess(response.data.message || 'Solicitud de vinculación enviada exitosamente');
      setTimeout(() => setSuccess(''), 5000);

      await fetchRepartidores();
    } catch (err: any) {
      console.error('Error al vincular repartidor:', err);
      const errorMessage = err?.response?.data?.message || 'Error al vincular repartidor. Verificá el código e intentá de nuevo.';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setAgregando(false);
    }
  };

  const handleEliminar = async (repartidorId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta vinculación?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      if(!empresaData) return;

      await axiosInstance.delete(`/empresas/${empresaData.id}/repartidor/${repartidorId}`);
      setRepartidores(repartidores.filter(r => r.id !== repartidorId));

      setSuccess('Vinculación eliminada exitosamente');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Error eliminando repartidor:', err);
      const errorMessage = err?.response?.data?.message || 'Error al eliminar la vinculación';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const renderEstadoChip = (estado: string) => {
    switch (estado) {
      case 'ACEPTADO':
        return <Chip color="success" icon={<CheckCircleOutlineOutlinedIcon />} label="Activo" />;
      case 'PENDIENTE':
        return <Chip color="warning" icon={<ScheduleOutlinedIcon />} label="Pendiente" />;
      case 'RECHAZADO':
        return <Chip color="error" icon={<HighlightOffOutlinedIcon />} label="Rechazado" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Flota de Repartidores
        </Typography>
        {isConnected && (
          <Chip
            label="● En vivo"
            color="success"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        )}
        {!isConnected && (
          <Chip
            label="○ Sin conexión"
            color="error"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        )}
      </Box>

      {notification && (
        <Alert
          icon={<NotificationsActiveIcon />}
          severity="info"
          sx={{ mb: 2 }}
          onClose={() => setNotification('')}
        >
          {notification}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* 🔹 Campo para agregar repartidor */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          label="Código de vínculo"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          size="small"
          sx={{ width: 250 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAgregarRepartidor}
          disabled={agregando}
        >
          {agregando ? 'Agregando...' : 'Agregar'}
        </Button>
      </Box>

      {/* 🔹 Listado */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
        </Box>
      ) : repartidores.length === 0 ? (
        <Typography color="text.secondary">No hay repartidores vinculados todavía.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {repartidores.map((r) => (
            <Box
              key={r.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={r.fotoUrl || ''}
                  alt={r.name}
                  sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}
                >
                  {r.name?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{r.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.email}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                {renderEstadoChip(r.estado)}
                <Tooltip title="Eliminar vínculo">
                  <IconButton color="error" onClick={() => handleEliminar(r.id)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RepartidoresTab;
