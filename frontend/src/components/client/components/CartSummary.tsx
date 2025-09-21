import React, { useState } from 'react';
import { CartSummaryProps, CheckoutFormData, DeliveryLocation } from '../types';
import DeliveryLocationSelector from './DeliveryLocationSelector';
import './CartSummary.css';

const CartSummary: React.FC<CartSummaryProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  companyData
}) => {
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<CheckoutFormData>({
    tipoEntrega: 'delivery',
    formaPago: 'transferencia'
  });
  const [transferenciaFoto, setTransferenciaFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Calcular total incluyendo envío
  const calculateTotalWithShipping = () => {
    let total = cart.totalAmount;
    
    if (formData.tipoEntrega === 'delivery' && formData.shippingPrice?.price) {
      total += formData.shippingPrice.price;
    }
    
    return total;
  };

  const validateImage = (file: File): string | null => {
    // Validar tipo de archivo
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      return 'Solo se permiten archivos JPG y PNG';
    }
    
    // Validar tamaño (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 10MB';
    }
    
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      setFotoError(error);
      setTransferenciaFoto(null);
      setFotoPreview(null);
      return;
    }

    setFotoError(null);
    setTransferenciaFoto(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFoto = () => {
    setTransferenciaFoto(null);
    setFotoPreview(null);
    setFotoError(null);
    // Limpiar input
    const input = document.getElementById('transferencia-foto') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleLocationSelect = async (location: DeliveryLocation & { shippingPrice?: any }) => {
    setFormData(prev => ({
      ...prev,
      deliveryLocation: location
    }));
    setShowLocationSelector(false);

    // Si viene el precio de envío del selector, usarlo directamente
    if (location.shippingPrice) {
      console.log('🚚 [CART] Usando precio de envío del selector:', location.shippingPrice);
      setFormData(prev => ({
        ...prev,
        shippingPrice: location.shippingPrice
      }));
    } else if (companyData?.ubicaciones?.length) {
      // Si no viene precio, calcularlo (fallback)
      try {
        const { ShippingService } = await import('../../../services/shippingService');
        const closestLocation = ShippingService.findClosestLocation(location, companyData.ubicaciones);
        
        const response = await ShippingService.calculateShippingPrice(companyData.id, {
          clienteLat: location.lat,
          clienteLng: location.lng,
          ubicacionId: closestLocation.id
        });

        setFormData(prev => ({
          ...prev,
          shippingPrice: response
        }));
      } catch (error) {
        console.error('Error calculando precio de envío:', error);
        setFormData(prev => ({
          ...prev,
          shippingPrice: {
            price: null,
            isEstimated: false,
            message: `Estimado no disponible. ${companyData.name} confirmará precio de envío.`
          }
        }));
      }
    }
  };

  const handleDeliveryTypeChange = (tipoEntrega: 'delivery' | 'retiro') => {
    setFormData(prev => ({
      ...prev,
      tipoEntrega,
      // Limpiar datos de delivery si se cambia a retiro
      ...(tipoEntrega === 'retiro' ? {
        deliveryLocation: undefined,
        shippingPrice: undefined
      } : {})
    }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleCheckout = async (companyId: string) => {
    
    if (processingOrders.has(companyId)) {
      return;
    }
    
    
    // Validar foto de transferencia si es necesario
    if (formData.formaPago === 'transferencia' && !transferenciaFoto) {
      setFotoError('Debe adjuntar el comprobante de transferencia');
      return;
    }
    
    setProcessingOrders(prev => new Set(prev).add(companyId));
    try {
      // Convertir foto a Base64 si existe
      let fotoBase64 = null;
      if (transferenciaFoto) {
        fotoBase64 = await fileToBase64(transferenciaFoto);
      } else {
      }
      
      // Crear formData extendido con la foto
      const extendedFormData = {
        ...formData,
        transferenciaFoto: fotoBase64 || undefined
      };
      
      
      
      
      await onCheckout(companyId, extendedFormData);
      
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  };


  if (cart.items.length === 0) {
    return (
      <div className="cart-summary empty">
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h3 className="empty-title">Tu carrito está vacío</h3>
          <p className="empty-description">
            Explora y agrega productos a tu carrito
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-summary-fullscreen">
            {/* Delivery Options Card */}
            <div className="delivery-options-card">
        <div className="delivery-options-header">
          <span className="delivery-icon">🏍️</span>
          <span className="delivery-options-title">Opciones de entrega</span>
        </div>
        
        <div className="delivery-options-form">
          <div className="option-group">
            <label className="option-label">Tipo de entrega</label>
            <div className="option-buttons">
              <button 
                className={`option-btn ${formData.tipoEntrega === 'delivery' ? 'active' : ''}`}
                onClick={() => handleDeliveryTypeChange('delivery')}
              >
                <span className="option-icon">🏍️</span>
                <span className="option-text">Delivery</span>
              </button>
              <button 
                className={`option-btn ${formData.tipoEntrega === 'retiro' ? 'active' : ''}`}
                onClick={() => handleDeliveryTypeChange('retiro')}
              >
                <span className="option-icon">🏪</span>
                <span className="option-text">Retiro</span>
              </button>
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">Forma de pago</label>
            <div className="option-buttons">
              <button 
                className={`option-btn ${formData.formaPago === 'transferencia' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, formaPago: 'transferencia' }))}
              >
                <span className="option-icon">💳</span>
                <span className="option-text">Transferencia</span>
              </button>
              <button 
                className={`option-btn ${formData.formaPago === 'efectivo' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, formaPago: 'efectivo' }))}
              >
                <span className="option-icon">💵</span>
                <span className="option-text">Efectivo</span>
              </button>
            </div>
          </div>

          {/* Sección de ubicación de delivery */}
          {formData.tipoEntrega === 'delivery' && (
            <div className="delivery-location-section">
              <div className="option-group">
                <label className="option-label">Ubicación de entrega</label>
                {formData.deliveryLocation ? (
                  <div className="selected-location-display">
                    <div className="location-info">
                      <span className="location-icon">📍</span>
                      <div className="location-details">
                        <p className="location-address">{formData.deliveryLocation.direccion}</p>
                        {formData.shippingPrice && (
                          <div className="shipping-price-info">
                            {formData.shippingPrice.price ? (
                              <p className="shipping-price">
                                Envío: ${formData.shippingPrice.price.toFixed(2)}
                                {formData.shippingPrice.isEstimated && ' (estimado)'}
                              </p>
                            ) : (
                              <p className="shipping-message">{formData.shippingPrice.message}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="change-location-btn"
                      onClick={() => setShowLocationSelector(true)}
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="select-location-btn"
                    onClick={() => setShowLocationSelector(true)}
                    disabled={!companyData?.ubicaciones?.length}
                  >
                    <span className="btn-icon">📍</span>
                    Seleccionar ubicación
                  </button>
                )}
                {!companyData?.ubicaciones?.length && (
                  <p className="location-error">
                    ⚠️ Esta empresa no tiene ubicaciones configuradas para delivery
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Sección de foto de transferencia */}
        {formData.formaPago === 'transferencia' && (
          <div className="transferencia-foto-section">
            <div className="option-group">
              <label className="option-label">Comprobante de Transferencia *</label>
              <div className="foto-upload-area">
                {!fotoPreview ? (
                  <div className="foto-upload-placeholder">
                    <input
                      id="transferencia-foto"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="foto-input"
                    />
                    <label htmlFor="transferencia-foto" className="foto-upload-btn">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">Adjuntar Comprobante</span>
                    </label>
                    <p className="upload-hint">JPG o PNG, máximo 10MB</p>
                  </div>
                ) : (
                  <div className="foto-preview-container">
                    <img src={fotoPreview} alt="Comprobante" className="foto-preview" />
                    <button type="button" onClick={removeFoto} className="remove-foto-btn">
                      ✕
                    </button>
                  </div>
                )}
                {fotoError && (
                  <p className="foto-error">{fotoError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Product Summary Card */}
      <div className="product-summary-card">
        <div className="product-summary-header">
          <div className="product-summary-title">
            <span className="product-icon">🍽️</span>
            <span className="product-count">{cart.totalItems} Producto{cart.totalItems !== 1 ? 's' : ''}</span>
          </div>
          <button className="schedule-btn">Programar</button>
        </div>
        
        {/* Product List Header */}
        <div className="product-list-header">
          <span className="header-item">Item</span>
          <span className="header-qty">Cant.</span>
          <span className="header-price">Precio</span>
        </div>

        {/* Products List */}
        <div className="products-list-compact">
          {cart.items.map((item) => (
            <div key={item.id} className="product-item-compact">
              <div className="product-info-compact">
                <div className="product-image-compact">
                  {item.product.fotoUrl ? (
                    <img 
                      src={item.product.fotoUrl} 
                      alt={item.product.nombre}
                      className="product-img-compact"
                    />
                  ) : (
                    <div className="product-placeholder-compact">📦</div>
                  )}
                </div>
                <span className="product-name-compact">{item.product.nombre}</span>
              </div>
              
              <div className="quantity-controls-compact">
                <button 
                  className="qty-btn-compact"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="qty-display-compact">{item.quantity} u</span>
                <button 
                  className="qty-btn-compact"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= 99}
                >
                  +
                </button>
              </div>
              
              <div className="product-price-compact">
                {formatPrice(item.product.precio)}
              </div>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="subtotal-section">
          <span className="subtotal-label">Subtotal</span>
          <span className="subtotal-amount">{formatPrice(cart.totalAmount)}</span>
        </div>

        {/* Precio de envío */}
        {formData.tipoEntrega === 'delivery' && formData.shippingPrice && (
          <div className="shipping-section">
            <span className="shipping-label">Envío</span>
            <span className="shipping-amount">
              {formData.shippingPrice.price ? (
                formatPrice(formData.shippingPrice.price)
              ) : (
                <span className="shipping-unavailable">A confirmar</span>
              )}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="total-section">
          <span className="total-label">Total</span>
          <span className="total-amount">{formatPrice(calculateTotalWithShipping())}</span>
        </div>
      </div>



      {/* Checkout Button */}
      <div className="checkout-section">
        <button 
          className="checkout-btn-fullscreen"
          onClick={() => handleCheckout(cart.items[0]?.companyId || '')}
          disabled={processingOrders.has(cart.items[0]?.companyId || '')}
        >
          {processingOrders.has(cart.items[0]?.companyId || '') ? (
            <>
              <span className="btn-spinner"></span>
              Procesando pedido...
            </>
          ) : (
            <>
              Realizar Pedido
              <span className="checkout-total-fullscreen">
                {formatPrice(calculateTotalWithShipping())}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Delivery Location Selector Modal */}
      {showLocationSelector && companyData && (
        <DeliveryLocationSelector
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationSelector(false)}
          empresaId={companyData.id}
          empresaName={companyData.name}
          empresaLogo={companyData.logo}
          empresaUbicaciones={companyData.ubicaciones}
        />
      )}
    </div>
  );
};

export default CartSummary;
