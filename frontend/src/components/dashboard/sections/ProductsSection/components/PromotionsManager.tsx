import React, { useState, useEffect } from 'react';
import promotionsService, { Promocion, CreatePromocionDto } from '../../../../../services/promotionsService';
import productosService, { Producto } from '../../../../../services/productosService';
import './PromotionsManager.css';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

// Utilidades para convertir horarios
const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
    const adjustedMinutes = minutes >= 1440 ? minutes - 1440 : minutes;
    const hours = Math.floor(adjustedMinutes / 60);
    const mins = adjustedMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

interface PromotionsManagerProps {
    empresaId: string;
    onClose: () => void;
}

const DAYS_OF_WEEK = [
    { id: 1, label: 'Lunes' },
    { id: 2, label: 'Martes' },
    { id: 3, label: 'Miércoles' },
    { id: 4, label: 'Jueves' },
    { id: 5, label: 'Viernes' },
    { id: 6, label: 'Sábado' },
    { id: 0, label: 'Domingo' },
];

// UI Types mapping
type UiPromotionType = 'CANTIDAD' | 'POR_PRODUCTO' | 'BXPY';
type AlcanceType = 'TODOS' | 'SELECCIONADOS';

const PromotionsManager: React.FC<PromotionsManagerProps> = ({ empresaId, onClose }) => {
    const [promotions, setPromotions] = useState<Promocion[]>([]);
    const [products, setProducts] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Promocion | null>(null);

    // Form State
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState<UiPromotionType>('CANTIDAD');
    const [cantidadCompra, setCantidadCompra] = useState<number>(2);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState<number>(10);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    // Schedule State (horarios)
    const [hasSchedule, setHasSchedule] = useState(false);
    const [horaInicio, setHoraInicio] = useState('20:00');
    const [horaFin, setHoraFin] = useState('23:59');
    const [crossesMidnight, setCrossesMidnight] = useState(false);

    // Scope State
    const [alcance, setAlcance] = useState<AlcanceType>('TODOS');
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    // BXPY State
    const [cantidadPaga, setCantidadPaga] = useState<number>(1);
    const [cantidadLleva, setCantidadLleva] = useState<number>(2);

    useEffect(() => {
        loadPromotions();
        loadProducts();
    }, [empresaId]);

    const loadPromotions = async () => {
        try {
            setLoading(true);
            const data = await promotionsService.getByEmpresa(empresaId);
            setPromotions(data);
        } catch (error) {
            console.error('Error loading promotions:', error);
            alert('Error al cargar promociones');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await productosService.getProductosByEmpresa(empresaId);
            setProducts(data.filter(p => p.activo)); // Only active products
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const handleSave = async () => {
        if (!nombre.trim()) {
            alert('El nombre es requerido');
            return;
        }

        if (alcance === 'SELECCIONADOS' && selectedProductIds.length === 0) {
            alert('Debes seleccionar al menos un producto');
            return;
        }

        const promoData: CreatePromocionDto = {
            nombre,
            tipo: tipo === 'POR_PRODUCTO' ? 'CANTIDAD' : tipo, // Map POR_PRODUCTO to CANTIDAD
            configuracion: {},
            alcance,
            activo: true,
            productosIds: alcance === 'SELECCIONADOS' ? selectedProductIds : undefined
        };

        // Common configuration for all types
        const commonConfig: any = {
            diasAplicables: selectedDays.length > 0 ? selectedDays : undefined
        };

        // Add schedule if configured
        if (hasSchedule) {
            const inicioMinutes = timeToMinutes(horaInicio);
            let finMinutes = timeToMinutes(horaFin);

            // Si cruza medianoche, agregar 1440 (24 horas) a la hora de fin
            if (crossesMidnight) {
                finMinutes += 1440;
            }

            commonConfig.horaInicio = inicioMinutes;
            commonConfig.horaFin = finMinutes;
        }

        if (tipo === 'CANTIDAD') {
            promoData.configuracion = {
                ...commonConfig,
                cantidadCompra,
                porcentajeDescuento
            };
        } else if (tipo === 'POR_PRODUCTO') {
            promoData.configuracion = {
                ...commonConfig,
                cantidadCompra: 1, // Always 1 for simple product discount
                porcentajeDescuento
            };
        } else if (tipo === 'BXPY') {
            promoData.configuracion = {
                ...commonConfig,
                cantidadPaga,
                cantidadLleva
            };
        }

        try {
            if (editing) {
                await promotionsService.update(editing.id, empresaId, promoData);
            } else {
                await promotionsService.create(empresaId, promoData);
            }

            resetForm();
            loadPromotions();
        } catch (error: any) {
            alert(error?.message || 'Error al guardar promoción');
        }
    };

    const handleEdit = (promo: Promocion) => {
        setEditing(promo);
        setNombre(promo.nombre);

        // Determine UI type from backend data
        if (promo.tipo === 'CANTIDAD') {
            if (promo.configuracion.cantidadCompra === 1) {
                setTipo('POR_PRODUCTO');
            } else {
                setTipo('CANTIDAD');
                setCantidadCompra(promo.configuracion.cantidadCompra || 2);
            }
            setPorcentajeDescuento(promo.configuracion.porcentajeDescuento || 10);
        } else if (promo.tipo === 'BXPY') {
            setTipo('BXPY');
            setCantidadPaga(promo.configuracion.cantidadPaga || 1);
            setCantidadLleva(promo.configuracion.cantidadLleva || 2);
        } else {
            // Fallback for old DIA type or others
            setTipo('CANTIDAD');
        }

        setSelectedDays(promo.configuracion.diasAplicables || []);

        // Set Schedule (horarios)
        if (promo.configuracion.horaInicio !== undefined && promo.configuracion.horaFin !== undefined) {
            setHasSchedule(true);
            setHoraInicio(minutesToTime(promo.configuracion.horaInicio));

            // Si horaFin >= 1440, significa que cruza medianoche
            if (promo.configuracion.horaFin >= 1440) {
                setCrossesMidnight(true);
                setHoraFin(minutesToTime(promo.configuracion.horaFin - 1440));
            } else {
                setCrossesMidnight(false);
                setHoraFin(minutesToTime(promo.configuracion.horaFin));
            }
        } else {
            setHasSchedule(false);
            setHoraInicio('20:00');
            setHoraFin('23:59');
            setCrossesMidnight(false);
        }

        // Set Scope
        setAlcance(promo.alcance);
        if (promo.alcance === 'SELECCIONADOS' && promo.productos) {
            setSelectedProductIds(promo.productos.map(p => p.producto.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta promoción?')) return;

        try {
            await promotionsService.delete(id, empresaId);
            loadPromotions();
        } catch (error) {
            alert('Error al eliminar promoción');
        }
    };

    const resetForm = () => {
        setEditing(null);
        setNombre('');
        setTipo('CANTIDAD');
        setCantidadCompra(2);
        setPorcentajeDescuento(10);
        setSelectedDays([]);
        setCantidadPaga(1);
        setCantidadLleva(2);
        setAlcance('TODOS');
        setSelectedProductIds([]);
        setHasSchedule(false);
        setHoraInicio('20:00');
        setHoraFin('23:59');
        setCrossesMidnight(false);
    };

    const toggleDay = (dayId: number) => {
        if (selectedDays.includes(dayId)) {
            setSelectedDays(selectedDays.filter(d => d !== dayId));
        } else {
            setSelectedDays([...selectedDays, dayId]);
        }
    };

    const toggleProduct = (productId: string) => {
        if (selectedProductIds.includes(productId)) {
            setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
        } else {
            setSelectedProductIds([...selectedProductIds, productId]);
        }
    };

    const toggleAllProducts = () => {
        if (selectedProductIds.length === products.length) {
            setSelectedProductIds([]);
        } else {
            setSelectedProductIds(products.map(p => p.id));
        }
    };

    const getPromoLabel = (promo: Promocion) => {
        if (promo.tipo === 'BXPY') return 'Lleva y Paga';
        if (promo.tipo === 'CANTIDAD') {
            return promo.configuracion.cantidadCompra === 1 ? 'Por Producto' : 'Por Cantidad';
        }
        return 'Promoción';
    };

    const getPromoIcon = (promo: Promocion) => {
        if (promo.tipo === 'BXPY') return <ConfirmationNumberOutlinedIcon style={{ fontSize: 16 }} />;
        if (promo.tipo === 'CANTIDAD') {
            return promo.configuracion.cantidadCompra === 1
                ? <PercentOutlinedIcon style={{ fontSize: 16 }} />
                : <ShoppingBasketOutlinedIcon style={{ fontSize: 16 }} />;
        }
        return <LocalOfferOutlinedIcon style={{ fontSize: 16 }} />;
    };

    return (
        <div className="pm-overlay" onClick={onClose}>
            <div className="promotions-manager-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className="pm-header">
                    <div className="pm-header-title">
                        <LocalOfferOutlinedIcon />
                        Gestionar Promociones
                    </div>
                    <p className="pm-header-subtitle">
                        Crea descuentos y ofertas especiales para tus clientes
                    </p>
                    <button className="pm-close-btn" onClick={onClose}>×</button>
                </header>

                <div className="pm-content">
                    {/* Form Section */}
                    <div className="pm-form-section">
                        <div className="pm-section-title">
                            {editing ? 'Editar Promoción' : 'Nueva Promoción'}
                        </div>

                        <div className="pm-scrollable-form">
                            <div className="pm-form-group">
                                <label className="pm-label">Nombre de la promoción</label>
                                <input
                                    type="text"
                                    className="pm-input"
                                    placeholder="Ej: Martes de Tacos, 2x1 en Bebidas"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </div>

                            <div className="pm-form-group">
                                <label className="pm-label">Tipo de promoción</label>
                                <select
                                    className="pm-select"
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value as UiPromotionType)}
                                >
                                    <option value="CANTIDAD">Por Cantidad (Ej: 2da unidad 50% off)</option>
                                    <option value="POR_PRODUCTO">Por Producto (Descuento directo)</option>
                                    <option value="BXPY">Lleva y Paga (Ej: 2x1, 3x2)</option>
                                </select>
                            </div>

                            {/* Fields for CANTIDAD */}
                            {tipo === 'CANTIDAD' && (
                                <>
                                    <div className="pm-form-group">
                                        <label className="pm-label">Cantidad a comprar</label>
                                        <input
                                            type="number"
                                            className="pm-input"
                                            min="2"
                                            value={cantidadCompra}
                                            onChange={(e) => setCantidadCompra(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-label">Porcentaje de Descuento (%)</label>
                                        <input
                                            type="number"
                                            className="pm-input"
                                            min="1"
                                            max="100"
                                            value={porcentajeDescuento}
                                            onChange={(e) => setPorcentajeDescuento(Number(e.target.value))}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Fields for POR_PRODUCTO */}
                            {tipo === 'POR_PRODUCTO' && (
                                <div className="pm-form-group">
                                    <label className="pm-label">Porcentaje de Descuento (%)</label>
                                    <input
                                        type="number"
                                        className="pm-input"
                                        min="1"
                                        max="100"
                                        value={porcentajeDescuento}
                                        onChange={(e) => setPorcentajeDescuento(Number(e.target.value))}
                                    />
                                </div>
                            )}

                            {/* Fields for BXPY */}
                            {tipo === 'BXPY' && (
                                <div className="pm-row-group">
                                    <div className="pm-form-group">
                                        <label className="pm-label">Lleva (Cantidad)</label>
                                        <input
                                            type="number"
                                            className="pm-input"
                                            min="2"
                                            value={cantidadLleva}
                                            onChange={(e) => setCantidadLleva(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-label">Paga (Cantidad)</label>
                                        <input
                                            type="number"
                                            className="pm-input"
                                            min="1"
                                            value={cantidadPaga}
                                            onChange={(e) => setCantidadPaga(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}
                            {tipo === 'BXPY' && (
                                <p className="pm-helper-text" style={{ marginTop: '-10px', marginBottom: '15px' }}>
                                    Ej: Para un 2x1, Lleva: 2, Paga: 1.
                                </p>
                            )}

                            {/* Scope Selection */}
                            <div className="pm-form-group">
                                <label className="pm-label">Alcance</label>
                                <div className="pm-scope-selector">
                                    <label className={`pm-scope-option ${alcance === 'TODOS' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="alcance"
                                            value="TODOS"
                                            checked={alcance === 'TODOS'}
                                            onChange={() => setAlcance('TODOS')}
                                        />
                                        Todos los productos
                                    </label>
                                    <label className={`pm-scope-option ${alcance === 'SELECCIONADOS' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="alcance"
                                            value="SELECCIONADOS"
                                            checked={alcance === 'SELECCIONADOS'}
                                            onChange={() => setAlcance('SELECCIONADOS')}
                                        />
                                        Productos seleccionados
                                    </label>
                                </div>
                            </div>

                            {/* Product Selection List */}
                            {alcance === 'SELECCIONADOS' && (
                                <div className="pm-form-group">
                                    <div className="pm-products-list-header">
                                        <label className="pm-label" style={{ marginBottom: 0 }}>Seleccionar Productos ({selectedProductIds.length})</label>
                                        <button className="pm-link-btn" onClick={toggleAllProducts}>
                                            {selectedProductIds.length === products.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                        </button>
                                    </div>
                                    <div className="pm-products-list">
                                        {products.length === 0 ? (
                                            <div className="pm-empty-products">No hay productos disponibles</div>
                                        ) : (
                                            products.map(product => (
                                                <div
                                                    key={product.id}
                                                    className={`pm-product-item ${selectedProductIds.includes(product.id) ? 'selected' : ''}`}
                                                    onClick={() => toggleProduct(product.id)}
                                                >
                                                    <div className="pm-checkbox">
                                                        {selectedProductIds.includes(product.id) ? (
                                                            <CheckBoxIcon fontSize="small" style={{ color: '#059669' }} />
                                                        ) : (
                                                            <CheckBoxOutlineBlankIcon fontSize="small" style={{ color: '#9CA3AF' }} />
                                                        )}
                                                    </div>
                                                    <span className="pm-product-name">{product.nombre}</span>
                                                    <span className="pm-product-price">${product.precio}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Global Day Selection */}
                            <div className="pm-form-group">
                                <label className="pm-label">Días aplicables (Opcional)</label>
                                <div className="pm-days-grid">
                                    {DAYS_OF_WEEK.map(day => (
                                        <div
                                            key={day.id}
                                            className={`pm-day-chip ${selectedDays.includes(day.id) ? 'selected' : ''}`}
                                            onClick={() => toggleDay(day.id)}
                                        >
                                            {day.label.substring(0, 3)}
                                        </div>
                                    ))}
                                </div>
                                <p className="pm-helper-text">
                                    Si no seleccionas ninguno, aplica todos los días.
                                </p>
                            </div>

                            {/* Schedule Section (Horarios) */}
                            <div className="pm-form-group">
                                <label className="pm-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AccessTimeOutlinedIcon style={{ fontSize: 18 }} />
                                    Horario específico (Opcional)
                                </label>
                                <div className="pm-scope-selector" style={{ marginBottom: '12px' }}>
                                    <label className={`pm-scope-option ${!hasSchedule ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="hasSchedule"
                                            checked={!hasSchedule}
                                            onChange={() => setHasSchedule(false)}
                                        />
                                        Todo el día
                                    </label>
                                    <label className={`pm-scope-option ${hasSchedule ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="hasSchedule"
                                            checked={hasSchedule}
                                            onChange={() => setHasSchedule(true)}
                                        />
                                        Horario específico
                                    </label>
                                </div>

                                {hasSchedule && (
                                    <>
                                        <div className="pm-row-group">
                                            <div className="pm-form-group" style={{ marginBottom: 0 }}>
                                                <label className="pm-label" style={{ fontSize: '12px' }}>Hora de inicio</label>
                                                <input
                                                    type="time"
                                                    className="pm-input"
                                                    value={horaInicio}
                                                    onChange={(e) => setHoraInicio(e.target.value)}
                                                />
                                            </div>
                                            <div className="pm-form-group" style={{ marginBottom: 0 }}>
                                                <label className="pm-label" style={{ fontSize: '12px' }}>Hora de fin</label>
                                                <input
                                                    type="time"
                                                    className="pm-input"
                                                    value={horaFin}
                                                    onChange={(e) => setHoraFin(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className={`pm-midnight-option ${crossesMidnight ? 'selected' : ''}`}
                                            onClick={() => setCrossesMidnight(!crossesMidnight)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 12px',
                                                backgroundColor: crossesMidnight ? '#059669' : '#f3f4f6',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                marginTop: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {crossesMidnight ? (
                                                <CheckBoxIcon fontSize="small" style={{ color: '#fff' }} />
                                            ) : (
                                                <CheckBoxOutlineBlankIcon fontSize="small" style={{ color: '#9CA3AF' }} />
                                            )}
                                            <span style={{ fontSize: '13px', color: crossesMidnight ? '#fff' : '#374151' }}>
                                                Cruza medianoche (ej: 20:00 a 04:00 del día siguiente)
                                            </span>
                                        </div>
                                        <p className="pm-helper-text" style={{ marginTop: '8px' }}>
                                            Ejemplo: Lunes de 20:00 a 04:00 = activa lunes 20:00 hasta martes 04:00
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pm-form-actions">
                            <button className="pm-btn-primary" onClick={handleSave}>
                                {editing ? 'Guardar Cambios' : 'Crear Promoción'}
                            </button>
                            {editing && (
                                <button className="pm-btn-secondary" onClick={resetForm}>
                                    Cancelar Edición
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="pm-list-section">
                        <div className="pm-section-title">
                            Promociones Activas
                        </div>

                        {loading ? (
                            <div className="pm-empty-state">Cargando...</div>
                        ) : promotions.length === 0 ? (
                            <div className="pm-empty-state">
                                <div className="pm-empty-icon">🏷️</div>
                                <p>No tienes promociones activas.</p>
                                <p style={{ fontSize: '14px' }}>Crea una nueva promoción desde el panel izquierdo.</p>
                            </div>
                        ) : (
                            <div className="pm-promotions-grid">
                                {promotions.map(promo => (
                                    <div key={promo.id} className="pm-promo-card">
                                        <div className="pm-promo-header">
                                            <span className={`pm-promo-type ${promo.tipo === 'BXPY' ? 'bxpy' :
                                                (promo.tipo === 'CANTIDAD' && promo.configuracion.cantidadCompra === 1) ? 'product' : 'quantity'
                                                }`}>
                                                {getPromoLabel(promo)}
                                            </span>
                                            {promo.activo ? (
                                                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Activa</span>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600 }}>Inactiva</span>
                                            )}
                                        </div>

                                        <div className="pm-promo-title">{promo.nombre}</div>

                                        <div className="pm-promo-details">
                                            {/* Scope Badge */}
                                            <div className="pm-scope-badge">
                                                {promo.alcance === 'TODOS' ? 'Todos los productos' :
                                                    `${promo.productos?.length || 0} productos seleccionados`}
                                            </div>

                                            {/* Discount Details */}
                                            {(promo.tipo === 'CANTIDAD') && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                                    {getPromoIcon(promo)}
                                                    <strong>{promo.configuracion.porcentajeDescuento}% OFF</strong>
                                                    {promo.configuracion.cantidadCompra && promo.configuracion.cantidadCompra > 1 && (
                                                        <span style={{ fontSize: '12px', color: '#666' }}>
                                                            (Llevando {promo.configuracion.cantidadCompra})
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {promo.tipo === 'BXPY' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                                    <ConfirmationNumberOutlinedIcon style={{ fontSize: 16 }} />
                                                    <strong>{promo.configuracion.cantidadLleva}x{promo.configuracion.cantidadPaga}</strong>
                                                </div>
                                            )}

                                            {/* Days Details */}
                                            {promo.configuracion.diasAplicables && promo.configuracion.diasAplicables.length > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                    <CalendarTodayOutlinedIcon style={{ fontSize: 16 }} />
                                                    <span style={{ fontSize: '12px' }}>
                                                        {promo.configuracion.diasAplicables.map(d =>
                                                            DAYS_OF_WEEK.find(day => day.id === d)?.label.substring(0, 3)
                                                        ).join(', ')}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Schedule Details */}
                                            {promo.configuracion.horaInicio !== undefined && promo.configuracion.horaFin !== undefined && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                    <AccessTimeOutlinedIcon style={{ fontSize: 16 }} />
                                                    <span style={{ fontSize: '12px' }}>
                                                        {minutesToTime(promo.configuracion.horaInicio)} - {minutesToTime(promo.configuracion.horaFin)}
                                                        {promo.configuracion.horaFin >= 1440 && (
                                                            <span style={{ color: '#059669', fontWeight: 600, marginLeft: '4px' }}>(+1 día)</span>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pm-promo-actions">
                                            <button
                                                className="pm-action-btn"
                                                onClick={() => handleEdit(promo)}
                                                title="Editar"
                                            >
                                                <EditOutlinedIcon fontSize="small" />
                                            </button>
                                            <button
                                                className="pm-action-btn delete"
                                                onClick={() => handleDelete(promo.id)}
                                                title="Eliminar"
                                            >
                                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionsManager;
