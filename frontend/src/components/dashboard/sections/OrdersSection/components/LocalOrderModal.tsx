import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../../config/axios.config';
import pedidosService from '../../../../../services/pedidosService';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PaymentIcon from '@mui/icons-material/Payment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import './LocalOrderModal.css';

interface ProductoIngrediente {
  id: number;
  productoId: string;
  ingredienteId: string;
  cantidadRequerida: number;
  esExtraPermitido: boolean;
  precioExtra: number;
  minimoExtra: number;
  maximoExtra: number | null;
  ingrediente: {
    id: string;
    nombre: string;
    unidadMedida: string;
  };
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  activo: boolean;
  permiteExtras: boolean;
  ingredientes?: ProductoIngrediente[];
}

interface IngredienteExtra {
  productoIngredienteId: number;
  cantidad: number;
}

interface ItemCarrito {
  productoId: string;
  producto: Producto;
  cantidad: number;
  notas?: string;
  ingredientesExtras?: IngredienteExtra[];
}

interface LocalOrderModalProps {
  empresaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const LocalOrderModal: React.FC<LocalOrderModalProps> = ({ empresaId, onClose, onSuccess }) => {
  const [nombreCliente, setNombreCliente] = useState('');
  const [mesaNumero, setMesaNumero] = useState('');
  const [formaPago, setFormaPago] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Cargar productos de la empresa
  useEffect(() => {
    const loadProductos = async () => {
      try {
        setLoadingProductos(true);
        const response = await axiosInstance.get(`/productos/empresa/${empresaId}?includeIngredients=true`);
        // Filtrar solo productos activos y convertir precio a número
        const productosActivos = response.data
          .filter((p: any) => p.activo)
          .map((p: any) => ({
            ...p,
            precio: typeof p.precio === 'number' ? p.precio : parseFloat(p.precio),
            ingredientes: p.ingredientes?.map((ing: any) => ({
              ...ing,
              precioExtra: typeof ing.precioExtra === 'number' ? ing.precioExtra : parseFloat(ing.precioExtra || 0)
            }))
          }));
        setProductos(productosActivos);
      } catch (error) {
        console.error('Error cargando productos:', error);
        alert('Error al cargar los productos');
      } finally {
        setLoadingProductos(false);
      }
    };

    loadProductos();
  }, [empresaId]);

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar producto al carrito
  const agregarAlCarrito = (producto: Producto) => {
    const itemExistente = carrito.find(item => item.productoId === producto.id);

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        productoId: producto.id,
        producto,
        cantidad: 1,
        ingredientesExtras: []
      }]);
    }
  };

  // Agregar ingrediente extra a un item del carrito
  const agregarIngredienteExtra = (productoId: string, productoIngredienteId: number) => {
    setCarrito(carrito.map(item => {
      if (item.productoId === productoId) {
        const extras = item.ingredientesExtras || [];
        const existente = extras.find(e => e.productoIngredienteId === productoIngredienteId);

        if (existente) {
          return {
            ...item,
            ingredientesExtras: extras.map(e =>
              e.productoIngredienteId === productoIngredienteId
                ? { ...e, cantidad: e.cantidad + 1 }
                : e
            )
          };
        } else {
          return {
            ...item,
            ingredientesExtras: [...extras, { productoIngredienteId, cantidad: 1 }]
          };
        }
      }
      return item;
    }));
  };

  // Disminuir ingrediente extra
  const disminuirIngredienteExtra = (productoId: string, productoIngredienteId: number) => {
    setCarrito(carrito.map(item => {
      if (item.productoId === productoId) {
        const extras = item.ingredientesExtras || [];
        const existente = extras.find(e => e.productoIngredienteId === productoIngredienteId);

        if (existente && existente.cantidad > 1) {
          return {
            ...item,
            ingredientesExtras: extras.map(e =>
              e.productoIngredienteId === productoIngredienteId
                ? { ...e, cantidad: e.cantidad - 1 }
                : e
            )
          };
        } else {
          return {
            ...item,
            ingredientesExtras: extras.filter(e => e.productoIngredienteId !== productoIngredienteId)
          };
        }
      }
      return item;
    }));
  };

  // Disminuir cantidad
  const disminuirCantidad = (productoId: string) => {
    const item = carrito.find(i => i.productoId === productoId);
    if (item && item.cantidad > 1) {
      setCarrito(carrito.map(i =>
        i.productoId === productoId
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      ));
    } else {
      // Si es 1, eliminar del carrito
      setCarrito(carrito.filter(i => i.productoId !== productoId));
    }
  };

  // Aumentar cantidad
  const aumentarCantidad = (productoId: string) => {
    setCarrito(carrito.map(item =>
      item.productoId === productoId
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(carrito.filter(item => item.productoId !== productoId));
  };

  // Actualizar notas
  const actualizarNotas = (productoId: string, notas: string) => {
    setCarrito(carrito.map(item =>
      item.productoId === productoId
        ? { ...item, notas }
        : item
    ));
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      let itemTotal = item.producto.precio * item.cantidad;

      // Sumar precio de ingredientes extras
      if (item.ingredientesExtras && item.ingredientesExtras.length > 0) {
        const extrasTotal = item.ingredientesExtras.reduce((extrasSum, extra) => {
          const ingrediente = item.producto.ingredientes?.find(ing => ing.id === extra.productoIngredienteId);
          if (ingrediente) {
            return extrasSum + (ingrediente.precioExtra * extra.cantidad * item.cantidad);
          }
          return extrasSum;
        }, 0);
        itemTotal += extrasTotal;
      }

      return total + itemTotal;
    }, 0);
  };

  // Crear pedido
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (carrito.length === 0) {
      alert('Agrega al menos un producto al pedido');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        empresaId,
        nombreClienteLocal: nombreCliente.trim() || undefined,
        mesaNumero: mesaNumero.trim() || undefined,
        items: carrito.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: item.producto.precio,
          notas: item.notas || undefined,
          ingredientesExtras: item.ingredientesExtras && item.ingredientesExtras.length > 0
            ? item.ingredientesExtras
            : undefined
        })),
        formaPago
      };

      await pedidosService.createLocalOrder(orderData);

      alert('Pedido local creado exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creando pedido local:', error);
      alert(error.message || 'Error al crear el pedido local');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-modal-modern local-order-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="order-modal-header">
          <div className="order-modal-header-left">
            <ShoppingCartIcon style={{ fontSize: 28, color: '#10b981' }} />
            <div className="order-modal-header-info">
              <div className="order-modal-client-name">
                Nuevo Pedido Local
              </div>
              <div className="order-modal-date">
                Pedido tomado en el restaurante
              </div>
            </div>
          </div>
          <button className="modal-close-modern" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="order-modal-body">
          {/* Información del cliente */}
          <div className="order-modal-section">
            <h3 className="modal-section-title">Información del Cliente</h3>

            <div className="local-order-input-group">
              <div className="local-order-input-wrapper">
                <PersonOutlineIcon fontSize="small" style={{ color: '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Nombre del cliente (opcional)"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  className="local-order-input"
                />
              </div>

              <div className="local-order-input-wrapper">
                <TableRestaurantIcon fontSize="small" style={{ color: '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Número de mesa (opcional)"
                  value={mesaNumero}
                  onChange={(e) => setMesaNumero(e.target.value)}
                  className="local-order-input"
                />
              </div>
            </div>

            <div className="local-order-payment-section">
              <PaymentIcon fontSize="small" style={{ color: '#6b7280' }} />
              <span>Forma de pago:</span>
              <div className="local-order-payment-options">
                <button
                  type="button"
                  className={`local-order-payment-btn ${formaPago === 'efectivo' ? 'active' : ''}`}
                  onClick={() => setFormaPago('efectivo')}
                >
                  Efectivo
                </button>
                <button
                  type="button"
                  className={`local-order-payment-btn ${formaPago === 'transferencia' ? 'active' : ''}`}
                  onClick={() => setFormaPago('transferencia')}
                >
                  Transferencia
                </button>
              </div>
            </div>
          </div>

          {/* Selección de productos */}
          <div className="order-modal-section">
            <h3 className="modal-section-title">Seleccionar Productos</h3>

            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="local-order-search"
            />

            <div className="local-order-productos-list">
              {loadingProductos ? (
                <div className="local-order-loading">Cargando productos...</div>
              ) : productosFiltrados.length === 0 ? (
                <div className="local-order-empty">
                  {busqueda ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </div>
              ) : (
                productosFiltrados.map(producto => (
                  <div key={producto.id} className="local-order-producto-item">
                    <div className="local-order-producto-info">
                      <div className="local-order-producto-nombre">{producto.nombre}</div>
                      <div className="local-order-producto-precio">${producto.precio.toFixed(2)}</div>
                    </div>
                    <button
                      type="button"
                      className="local-order-add-btn"
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      Agregar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Carrito */}
          {carrito.length > 0 && (
            <div className="order-modal-section">
              <h3 className="modal-section-title">
                Carrito ({carrito.length} {carrito.length === 1 ? 'producto' : 'productos'})
              </h3>

              <div className="local-order-carrito-list">
                {carrito.map(item => (
                  <div key={item.productoId} className="local-order-carrito-item">
                    <div className="local-order-carrito-header">
                      <div className="local-order-carrito-info">
                        <div className="local-order-carrito-nombre">{item.producto.nombre}</div>
                        <div className="local-order-carrito-precio">${item.producto.precio.toFixed(2)} c/u</div>
                      </div>
                      <button
                        type="button"
                        className="local-order-delete-btn"
                        onClick={() => eliminarDelCarrito(item.productoId)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>

                    <div className="local-order-carrito-controls">
                      <div className="local-order-quantity-controls">
                        <button
                          type="button"
                          onClick={() => disminuirCantidad(item.productoId)}
                          className="local-order-qty-btn"
                        >
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </button>
                        <span className="local-order-quantity">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => aumentarCantidad(item.productoId)}
                          className="local-order-qty-btn"
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </button>
                        <span className="local-order-subtotal">
                          ${(item.producto.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Notas especiales (opcional)..."
                      value={item.notas || ''}
                      onChange={(e) => actualizarNotas(item.productoId, e.target.value)}
                      className="local-order-notes-input"
                    />

                    {/* Ingredientes extras */}
                    {item.producto.permiteExtras && item.producto.ingredientes && item.producto.ingredientes.length > 0 && (
                      <div className="local-order-extras-section">
                        <div className="local-order-extras-title">Agregar extras:</div>
                        <div className="local-order-extras-list">
                          {item.producto.ingredientes
                            .filter(ing => ing.esExtraPermitido)
                            .map(ingrediente => {
                              const extraActual = item.ingredientesExtras?.find(
                                e => e.productoIngredienteId === ingrediente.id
                              );
                              const cantidad = extraActual?.cantidad || 0;

                              return (
                                <div key={ingrediente.id} className="local-order-extra-item">
                                  <div className="local-order-extra-info">
                                    <span className="local-order-extra-nombre">{ingrediente.ingrediente.nombre}</span>
                                    <span className="local-order-extra-precio">+${ingrediente.precioExtra.toFixed(2)}</span>
                                  </div>
                                  <div className="local-order-extra-controls">
                                    {cantidad > 0 && (
                                      <>
                                        <button
                                          type="button"
                                          className="local-order-extra-btn"
                                          onClick={() => disminuirIngredienteExtra(item.productoId, ingrediente.id)}
                                        >
                                          <RemoveCircleOutlineIcon fontSize="small" />
                                        </button>
                                        <span className="local-order-extra-qty">{cantidad}</span>
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      className="local-order-extra-btn"
                                      onClick={() => agregarIngredienteExtra(item.productoId, ingrediente.id)}
                                    >
                                      <AddCircleOutlineIcon fontSize="small" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="local-order-total">
                <span>Total:</span>
                <span className="local-order-total-amount">${calcularTotal().toFixed(2)}</span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="order-modal-footer">
          <button
            type="button"
            className="order-modal-btn order-modal-btn-close"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="order-modal-btn order-modal-btn-primary"
            onClick={handleSubmit}
            disabled={loading || carrito.length === 0}
          >
            {loading ? 'Creando...' : 'Crear Pedido Local'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalOrderModal;
