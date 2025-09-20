import React, { useState } from 'react';
import { ProductModalProps } from '../types';

const ProductModal: React.FC<ProductModalProps> = ({ product, user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: product?.nombre || '',
    descripcion: product?.descripcion || '',
    precio: product?.precio || 0,
    activo: product?.activo ?? true,
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.fotoUrl ?? null);
  const [guardando, setGuardando] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [precioStr, setPrecioStr] = useState(
    product?.precio !== undefined && product?.precio !== null
      ? String(product.precio)
      : ""
  );
  const isValidMoneyInput = (v: string) => {
    // admitir coma o punto como separador
    const x = v.replace(",", ".");
    // permite "", "123", "123.", "123.4", "123.45"
    return /^(\d+([.]\d{0,2})?)?$/.test(x);
  };
  const handlePrecioChange = (v: string) => {
    if (isValidMoneyInput(v)) {
      setPrecioStr(v);
    }
  };
  const toNumber2 = (v: string) => {
    const n = Number(v.replace(",", "."));
    // redondeo a 2 decimales para evitar 1.005 -> 1.00x por floating point
    return Math.round(n * 100) / 100;
  };
  // actualizar campos de texto/checkbox
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // manejar archivo + preview
  const handleFile = (f: File | null) => {
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
      // Mostrar automáticamente el preview cuando se selecciona una imagen
      setShowImagePreview(true);
    } else {
      // Si no hay archivo nuevo, mantener la imagen existente del producto
      setPreview(product?.fotoUrl ?? null);
    }
  };

  // manejar selector de archivos directo
  const handleCameraClick = () => {
    const fileInput = document.getElementById('hidden-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // manejar preview de imagen
  const handleImagePreview = () => {
    if (preview) {
      setShowImagePreview(true);
    }
  };

  // enviar form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // Pasar el archivo directamente al padre, que manejará la subida
      const precioNum = toNumber2(precioStr);
      if (!isFinite(precioNum) || isNaN(precioNum)) {
      throw new Error("El precio no es un número válido.");
    }
    if (precioNum < 0) {
      throw new Error("El precio no puede ser negativo.");
    }
    onSave({ ...formData, precio: precioNum, file: file || undefined });
    } catch (err: any) {
      alert(err?.message || 'Error al guardar producto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className={`modal-content ${showImagePreview ? 'modal-shifted' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{product ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
            <div className="modal-header-actions">
              <button 
                type="button" 
                className="btn-empty-state" 
                onClick={handleCameraClick}
                title="Seleccionar imagen"
              >
                Subir Imagen
              </button>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>
          </div>
        
          <form className="modal-form" onSubmit={handleSubmit}>
            {/* Input file oculto */}
            <input
              id="hidden-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
            
            <div className="form-group">
              <label htmlFor="nombre">Nombre del Producto </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ingrese el nombre del producto"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Descripción del producto (opcional)"
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="precio">Precio ($) *</label>
              <input
                type="text"
                id="precio"
                inputMode="decimal"
                value={precioStr}
                onChange={(e) => handlePrecioChange(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Imagen del producto</label>
              <div 
                className={`image-info-section ${preview ? 'clickable' : ''}`}
                onClick={preview ? handleImagePreview : undefined}
                title={preview ? 'Haz clic para ver la imagen completa' : ''}
              >
                {preview ? (
                  <div className="image-selected">
                    <div className="image-preview-small">
                      <img src={preview} alt="preview" />
                    </div>
                    <div className="image-details">
                      <p className="image-name">
                        {file ? file.name : 'Imagen actual del producto'}
                      </p>
                      <p className="image-status">
                        {file ? '✅ Nueva imagen seleccionada' : '📷 Imagen existente'}
                        {preview && <span className="click-hint"> • Haz clic para ampliar</span>}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="no-image">
                    <div className="no-image-icon">📷</div>
                    <p>Usa el icono de cámara para seleccionar una imagen</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => handleChange('activo', e.target.checked)}
                />
                <span className="checkbox-text">Producto activo</span>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={guardando}>
                Cancelar
              </button>
              <button type="submit" className="btn-empty-state" disabled={guardando}>
                {guardando ? (
                  <>
                    <span className="btn-icon">⏳</span>
                    {file ? 'Guardando con imagen...' : 'Guardando producto...'}
                  </>
                ) : (
                  <>
                    {product ? 'Actualizar' : 'Agregar'} Producto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de preview de imagen */}
      {showImagePreview && preview && (
        <div className={`image-preview-modal ${showImagePreview ? 'show' : ''}`}>
          <div className="image-preview-header">
            <h3>Vista Previa</h3>
            <button 
              className="image-preview-close" 
              onClick={() => setShowImagePreview(false)}
            >
              ×
            </button>
          </div>
          <div className="image-preview-content">
            <img 
              src={preview} 
              alt="Preview del producto" 
              className="image-preview-img"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductModal;
