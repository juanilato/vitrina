import React, { useState, useEffect } from 'react';
import { useAuthOptimized } from '../../../../hooks/useAuthOptimized';
import estadisticasService, { EstadisticasResponse } from '../../../../services/estadisticasService';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import './StatsSection.css';

const StatsSection: React.FC = () => {
  const { user } = useAuthOptimized();
  const [stats, setStats] = useState<EstadisticasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await estadisticasService.getEstadisticas(user.id);
      setStats(data);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUpOutlinedIcon fontSize="small" />;
    if (value < 0) return <TrendingDownOutlinedIcon fontSize="small" />;
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return '#10b981';
    if (value < 0) return '#ef4444';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div className="stats-section">
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-section">
        <div className="stats-error">
          <WarningAmberOutlinedIcon fontSize="large" />
          <p>Error al cargar estadísticas</p>
          <button className="btn-retry" onClick={loadStats}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-section">
      {/* Header */}
      <div className="stats-header">
        <div className="stats-header-content">
          <h1 className="stats-title">📊 Estadísticas de tu Negocio</h1>
          <p className="stats-subtitle">Métricas y análisis en tiempo real para tomar mejores decisiones</p>
        </div>
        <button className="btn-refresh" onClick={loadStats} title="Actualizar estadísticas">
          🔄 Actualizar
        </button>
      </div>

      {/* Métricas Principales - Fila de Cards */}
      <div className="stats-grid-main">
        {/* Ventas Totales */}
        <div className="stat-card stat-card-primary">
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <AttachMoneyOutlinedIcon />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Ventas Totales</div>
            <div className="stat-value">{formatCurrency(stats.ventas.totales)}</div>
            <div className="stat-meta">
              <span className="stat-badge stat-badge-success">
                {stats.pedidos.total} pedidos
              </span>
            </div>
          </div>
        </div>

        {/* Ventas Últimos 30 días */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <AttachMoneyOutlinedIcon />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Últimos 30 días</div>
            <div className="stat-value">{formatCurrency(stats.ventas.ultimos30Dias)}</div>
            <div className="stat-meta">
              <span
                className="stat-trend"
                style={{ color: getTrendColor(stats.tendencias.crecimientoVentas) }}
              >
                {getTrendIcon(stats.tendencias.crecimientoVentas)}
                {Math.abs(stats.tendencias.crecimientoVentas).toFixed(1)}%
              </span>
              <span className="stat-meta-text">vs período anterior</span>
            </div>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <ShoppingCartOutlinedIcon />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Ticket Promedio</div>
            <div className="stat-value">{formatCurrency(stats.ventas.ticketPromedio)}</div>
            <div className="stat-meta">
              <span className="stat-meta-text">Por pedido</span>
            </div>
          </div>
        </div>

        {/* Ventas Hoy */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <AttachMoneyOutlinedIcon />
          </div>
          <div className="stat-card-content">
            <div className="stat-label">Ventas Hoy</div>
            <div className="stat-value">{formatCurrency(stats.ventas.hoy)}</div>
            <div className="stat-meta">
              <span className="stat-badge stat-badge-info">
                {stats.pedidos.hoy} pedidos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila - Métricas de rendimiento */}
      <div className="stats-grid-secondary">
        {/* Pedidos */}
        <div className="stat-card-compact">
          <div className="stat-compact-header">
            <ShoppingCartOutlinedIcon fontSize="small" />
            <span>Pedidos</span>
          </div>
          <div className="stat-compact-grid">
            <div className="stat-compact-item">
              <div className="stat-compact-label">Hoy</div>
              <div className="stat-compact-value">{stats.pedidos.hoy}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">7 días</div>
              <div className="stat-compact-value">{stats.pedidos.ultimos7Dias}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">30 días</div>
              <div className="stat-compact-value">{stats.pedidos.ultimos30Dias}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">Total</div>
              <div className="stat-compact-value">{stats.pedidos.total}</div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="stat-card-compact">
          <div className="stat-compact-header">
            <Inventory2OutlinedIcon fontSize="small" />
            <span>Productos</span>
          </div>
          <div className="stat-compact-grid">
            <div className="stat-compact-item">
              <div className="stat-compact-label">Activos</div>
              <div className="stat-compact-value stat-success">{stats.productos.activos}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">Inactivos</div>
              <div className="stat-compact-value stat-muted">{stats.productos.inactivos}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">Stock Bajo</div>
              <div className="stat-compact-value stat-warning">{stats.productos.stockBajo}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">Sin Stock</div>
              <div className="stat-compact-value stat-danger">{stats.productos.sinStock}</div>
            </div>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="stat-card-compact">
          <div className="stat-compact-header">
            <RestaurantMenuOutlinedIcon fontSize="small" />
            <span>Ingredientes</span>
          </div>
          <div className="stat-compact-grid">
            <div className="stat-compact-item">
              <div className="stat-compact-label">Total</div>
              <div className="stat-compact-value">{stats.ingredientes.total}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">Stock Bajo</div>
              <div className="stat-compact-value stat-warning">{stats.ingredientes.stockBajo}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">Sin Stock</div>
              <div className="stat-compact-value stat-danger">{stats.ingredientes.sinStock}</div>
            </div>
            <div className="stat-compact-item">
              <div className="stat-compact-label">En Stock</div>
              <div className="stat-compact-value stat-success">
                {stats.ingredientes.total - stats.ingredientes.stockBajo - stats.ingredientes.sinStock}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tercera fila - Tasas y Estado de Pedidos */}
      <div className="stats-grid-tertiary">
        {/* Tasas de Conversión */}
        <div className="stat-card stat-card-info">
          <h3 className="stat-section-title">Tasas de Éxito (últimos 30 días)</h3>
          <div className="stat-rates-grid">
            <div className="stat-rate-item">
              <div className="stat-rate-icon stat-rate-success">
       
              </div>
              <div className="stat-rate-content">
                <div className="stat-rate-label">Tasa de Éxito</div>
                <div className="stat-rate-value">{stats.pedidos.tasaExito.toFixed(1)}%</div>
                <div className="stat-rate-meta">{stats.pedidos.porEstado.entregado} entregados</div>
              </div>
            </div>
            <div className="stat-rate-item">
              <div className="stat-rate-icon stat-rate-danger">
                <CancelOutlinedIcon />
              </div>
              <div className="stat-rate-content">
                <div className="stat-rate-label">Tasa de Rechazo</div>
                <div className="stat-rate-value">{stats.pedidos.tasaRechazo.toFixed(1)}%</div>
                <div className="stat-rate-meta">
                  {stats.pedidos.porEstado.no_confirmado + stats.pedidos.porEstado.cancelado} rechazados
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Pedidos */}
        <div className="stat-card">
          <h3 className="stat-section-title">Estado de Pedidos Actuales</h3>
          <div className="stat-status-list">
            <div className="stat-status-item">
              <div className="stat-status-dot stat-status-pending"></div>
              <div className="stat-status-label">Pendiente Confirmación</div>
              <div className="stat-status-value">{stats.pedidos.porEstado.pendiente_confirmacion}</div>
            </div>
            <div className="stat-status-item">
              <div className="stat-status-dot stat-status-confirmed"></div>
              <div className="stat-status-label">Confirmado</div>
              <div className="stat-status-value">{stats.pedidos.porEstado.confirmado}</div>
            </div>
            <div className="stat-status-item">
              <div className="stat-status-dot stat-status-process"></div>
              <div className="stat-status-label">En Proceso</div>
              <div className="stat-status-value">{stats.pedidos.porEstado.en_proceso}</div>
            </div>
            <div className="stat-status-item">
              <div className="stat-status-dot stat-status-delivery"></div>
              <div className="stat-status-label">En Camino</div>
              <div className="stat-status-value">{stats.pedidos.porEstado.en_camino}</div>
            </div>
            <div className="stat-status-item">
              <div className="stat-status-dot stat-status-pickup"></div>
              <div className="stat-status-label">Esperando Retiro</div>
              <div className="stat-status-value">{stats.pedidos.porEstado.esperando_retiro}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuarta fila - Productos más vendidos */}
      {stats.productosMasVendidos.length > 0 && (
        <div className="stats-section-full">
          <div className="stat-card">
            <h3 className="stat-section-title">🏆 Productos Más Vendidos (últimos 30 días)</h3>
            <div className="top-products-list">
              {stats.productosMasVendidos.map((item, index) => (
                <div key={item.producto.id} className="top-product-item">
                  <div className="top-product-rank">#{index + 1}</div>
                  {item.producto.imagenUrl ? (
                    <img
                      src={item.producto.imagenUrl}
                      alt={item.producto.nombre}
                      className="top-product-image"
                    />
                  ) : (
                    <div className="top-product-image top-product-image-placeholder">
                      📦
                    </div>
                  )}
                  <div className="top-product-info">
                    <div className="top-product-name">{item.producto.nombre}</div>
                    <div className="top-product-price">{formatCurrency(item.producto.precio)}</div>
                  </div>
                  <div className="top-product-stats">
                    <div className="top-product-stat">
                      <span className="top-product-stat-value">{item.cantidadVendida}</span>
                      <span className="top-product-stat-label">unidades</span>
                    </div>
                    <div className="top-product-stat">
                      <span className="top-product-stat-value">{item.numeroVentas}</span>
                      <span className="top-product-stat-label">ventas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer con Repartidores */}
      <div className="stats-footer">
        <div className="stat-card-compact stat-card-repartidores">
          <div className="stat-compact-header">
            <LocalShippingOutlinedIcon fontSize="small" />
            <span>Repartidores</span>
          </div>
          <div className="stat-repartidores-content">
            <div className="stat-repartidor-item">
              <div className="stat-repartidor-label">Activos</div>
              <div className="stat-repartidor-value stat-success">{stats.repartidores.activos}</div>
            </div>
            <div className="stat-repartidor-item">
              <div className="stat-repartidor-label">Total</div>
              <div className="stat-repartidor-value">{stats.repartidores.total}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
