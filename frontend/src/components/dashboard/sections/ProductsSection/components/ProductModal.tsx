import React, { useEffect, useRef, useState } from 'react';
import { ProductModalProps } from '../types';
import './ProductModal.css';

const ProductModal: React.FC<ProductModalProps> = ({ product, user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: product?.nombre || '',
    descripcion: product?.descripcion || '',
    precio: product?.precio ?? 0,
    activo: product?.activo ?? true,
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.fotoUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [precioStr, setPrecioStr] = useState(
    product?.precio !== undefined && product?.precio !== null ? String(product.precio) : ''
  );
  
  

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isValidMoneyInput = (v: string) => /^(\d+([.]\d{0,2})?)?$/.test(v.replace(',', '.'));
  const handlePrecioChange = (v: string) => { if (isValidMoneyInput(v)) setPrecioStr(v); };
  const toNumber2 = (v: string) => Math.round(Number(v.replace(',', '.')) * 100) / 100;

  const setField = (k: string, v: any) => setFormData(p => ({ ...p, [k]: v }));

  const onPickFile = (f: File | null) => {
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(product?.fotoUrl ?? null);
    }
  };

  const openPicker = () => document.getElementById('pm2-file')?.click();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const precio = toNumber2(precioStr);
      if (!isFinite(precio)) throw new Error('El precio no es válido.');
      if (precio < 0) throw new Error('El precio no puede ser negativo.');

      await onSave({
        ...formData,
        precio,
        file: file || undefined
      });
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="pm2-overlay" onClick={onClose}>
        <section
          className="pm2-dialog order-modal-modern"
          role="dialog"
          aria-modal="true"
          aria-label={product ? 'Editar producto' : 'Nuevo producto'}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="order-modal-header">
            <div className="order-modal-header-left">
              <div className="order-modal-header-info">
                <div className="order-modal-client-name">
                  {product ? 'Editar producto' : 'Nuevo producto'}
                </div>
                <div className="order-modal-date">
                  Completa los datos y previsualiza la imagen antes de guardar
                </div>
              </div>
            </div>
            <button className="modal-close-modern" onClick={onClose} aria-label="Cerrar">×</button>
          </header>

          {/* Body */}
          <div className="order-modal-body">
            {/* Chips informativos */}
            <div className="order-modal-chips-section">
              <div className="order-chip order-chip-delivery">
                {formData.activo ? '✅' : '⛔'}
                <span>{formData.activo ? 'Producto Activo' : 'Producto Inactivo'}</span>
              </div>
              {precioStr && parseFloat(precioStr) > 0 && (
                <div className="order-chip order-chip-payment">
                  💰
                  <span>Precio: ${parseFloat(precioStr).toFixed(2)}</span>
                </div>
              )}
              {preview && (
                <div className="order-chip order-chip-email">
                  📷
                  <span>Imagen agregada</span>
                </div>
              )}
            </div>

            {/* Form */}
            <form className="pm2-form" onSubmit={submit}>
              <input
                id="pm2-file"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />

              <div className="pm2-field pm2-field-enhanced">
                <label htmlFor="pm2-nombre">
                  <span className="pm2-label-icon">🏷️</span>
                  Nombre del Producto *
                </label>
                <div className="pm2-input-wrapper">
                  <input
                    ref={firstInputRef}
                    id="pm2-nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setField('nombre', e.target.value)}
                    placeholder="Ej: Hamburguesa Clásica"
                    className="pm2-input-modern"
                    required
                  />
                  <span className="pm2-input-hint">nombre visible en el catálogo</span>
                </div>
              </div>

              <div className="pm2-row">
                <div className="pm2-field pm2-field-enhanced">
                  <label htmlFor="pm2-precio">
                    <span className="pm2-label-icon">💰</span>
                    Precio de Venta *
                  </label>
                  <div className="pm2-input-wrapper">
                    <div className="pm2-input-adorn">
                      <span className="pm2-adorn">$</span>
                      <input
                        id="pm2-precio"
                        type="text"
                        inputMode="decimal"
                        value={precioStr}
                        onChange={(e) => handlePrecioChange(e.target.value)}
                        placeholder="0.00"
                        className="pm2-input-modern"
                        required
                      />
                    </div>
                    <span className="pm2-input-hint">precio final al cliente</span>
                  </div>
                </div>

                <div className="pm2-field pm2-field-enhanced">
                  <label>
                    <span className="pm2-label-icon">⚡</span>
                    Estado
                  </label>
                  <div className="pm2-segment pm2-segment-modern">
                    <button
                      type="button"
                      className={`pm2-seg-btn ${formData.activo ? 'is-active' : ''}`}
                      onClick={() => setField('activo', true)}
                      aria-pressed={formData.activo}
                    >
                      ✅ Activo
                    </button>
                    <button
                      type="button"
                      className={`pm2-seg-btn ${!formData.activo ? 'is-active' : ''}`}
                      onClick={() => setField('activo', false)}
                      aria-pressed={!formData.activo}
                    >
                      ⛔ Inactivo
                    </button>
                  </div>
                </div>
              </div>

              <div className="pm2-field pm2-field-enhanced">
                <label htmlFor="pm2-desc">
                  <span className="pm2-label-icon">📝</span>
                  Descripción
                </label>
                <div className="pm2-input-wrapper">
                  <textarea
                    id="pm2-desc"
                    rows={4}
                    value={formData.descripcion}
                    onChange={(e) => setField('descripcion', e.target.value)}
                    placeholder="Describe los ingredientes, características especiales, tamaño, etc."
                    className="pm2-input-modern pm2-textarea-modern"
                  />
                  <span className="pm2-input-hint">información adicional para el cliente</span>
                </div>
              </div>

            </form>

            {/* Preview / Media Section */}
            <div className="order-modal-section">
              <h3 className="modal-section-title">Vista Previa de Imagen</h3>
              <div className="pm2-media-box" onClick={preview ? () => setShowImagePreview(true) : undefined}>
                {preview ? (
                  <img src={preview} alt="Vista previa" />
                ) : (
                  <div className="pm2-drop" onClick={openPicker}>
                    <div className="pm2-drop-icon">📷</div>
                    <div className="pm2-drop-text">
                      <strong>Agregar imagen</strong>
                      <span>Click para seleccionar un archivo</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="order-modal-action-buttons">
                <button className="order-modal-btn order-modal-btn-map" onClick={openPicker}>
                  📷 Cambiar
                </button>
                {preview && (
                  <button className="order-modal-btn order-modal-btn-receipt" onClick={() => setShowImagePreview(true)}>
                    🔍 Ampliar
                  </button>
                )}
                {preview && (
                  <button className="pm2-soft danger" onClick={() => { setPreview(null); setFile(null); }}>
                    🗑️ Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="order-modal-footer">
            <div className="order-modal-footer-left">
              {/* Espacio para acciones adicionales */}
            </div>
            <div className="order-modal-footer-right">
              <button
                type="button"
                className="order-modal-btn order-modal-btn-close"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="order-modal-btn order-modal-btn-primary"
                onClick={submit}
                disabled={saving}
              >
                {saving ? (file ? 'Guardando con imagen…' : 'Guardando…') : (product ? 'Actualizar' : 'Agregar')}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Fullscreen image */}
      {showImagePreview && preview && (
        <div className="pm2-lightbox" role="dialog" aria-modal="true" aria-label="Vista previa de imagen">
          <div className="pm2-lightbar">
            <h3>Vista previa</h3>
            <button className="pm2-close" onClick={() => setShowImagePreview(false)} aria-label="Cerrar">×</button>
          </div>
          <div className="pm2-lightstage">
            <img src={preview} alt="Imagen del producto" />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductModal;
