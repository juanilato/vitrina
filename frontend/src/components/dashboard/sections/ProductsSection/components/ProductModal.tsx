import React, { useEffect, useRef, useState } from 'react';
import { ProductModalProps, ProductoIngrediente } from '../types';
import { useIngredientes } from '../../../sections/IngredientsSection/hooks/useIngredientes';
import ProductIngredientSection from './ProductIngredientSection';
import './ProductModal.css';

const ProductModal: React.FC<ProductModalProps> = ({ product, user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: product?.nombre || '',
    descripcion: product?.descripcion || '',
    precio: product?.precio ?? 0,
    activo: product?.activo ?? true,
    tipoStock: product?.tipoStock || 'individual',
    stockIndividual: product?.stockIndividual ?? 0,
    permiteExtras: product?.permiteExtras ?? false,
  });

  const [ingredientesProducto, setIngredientesProducto] = useState<ProductoIngrediente[]>(
    product?.ingredientes || []
  );
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.fotoUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [precioStr, setPrecioStr] = useState(
    product?.precio !== undefined && product?.precio !== null ? String(product.precio) : ''
  );
  const [stockStr, setStockStr] = useState(
    product?.stockIndividual !== undefined ? String(product.stockIndividual) : '0'
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

  const isValidNumberInput = (v: string) => /^\d*$/.test(v);
  const handleStockChange = (v: string) => { if (isValidNumberInput(v)) setStockStr(v); };

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

  // Las funciones de manejo de ingredientes ahora están en el componente ProductIngredientSection

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const precio = toNumber2(precioStr);
      if (!isFinite(precio)) throw new Error('El precio no es válido.');
      if (precio < 0) throw new Error('El precio no puede ser negativo.');
      
      const stockIndividual = formData.tipoStock === 'individual' ? parseInt(stockStr, 10) : undefined;
      
      // Validar que si es stock compuesto tenga al menos un ingrediente
      if (formData.tipoStock === 'compuesto' && ingredientesProducto.length === 0) {
        throw new Error('Un producto con stock compuesto debe tener al menos un ingrediente.');
      }
      
      await onSave({ 
        ...formData, 
        precio, 
        stockIndividual,
        ingredientes: formData.tipoStock === 'compuesto' ? ingredientesProducto : undefined,
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
          className="pm2-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={product ? 'Editar producto' : 'Nuevo producto'}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="pm2-header">
            <div className="pm2-titles">
              <h2 className="pm2-title">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
              <p className="pm2-subtitle">Completa los datos y previsualiza la imagen antes de guardar.</p>
            </div>
            <button className="pm2-close" onClick={onClose} aria-label="Cerrar">×</button>
          </header>

          {/* Body */}
          <div className="pm2-body">
            {/* Form */}
            <form className="pm2-form" onSubmit={submit}>
              <input
                id="pm2-file"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />

              <div className="pm2-field">
                <label htmlFor="pm2-nombre">Nombre *</label>
                <input
                  ref={firstInputRef}
                  id="pm2-nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setField('nombre', e.target.value)}
                  placeholder=" "
                  required
                />
              </div>

              <div className="pm2-row">
                <div className="pm2-field">
                  <label htmlFor="pm2-precio">Precio *</label>
                  <div className="pm2-input-adorn">
                    <span className="pm2-adorn">$</span>
                    <input
                      id="pm2-precio"
                      type="text"
                      inputMode="decimal"
                      value={precioStr}
                      onChange={(e) => handlePrecioChange(e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <div className="pm2-field">
                  <label>Estado</label>
                  <div className="pm2-segment">
                    <button
                      type="button"
                      className={`pm2-seg-btn ${formData.activo ? 'is-active' : ''}`}
                      onClick={() => setField('activo', true)}
                      aria-pressed={formData.activo}
                    >
                      Activo
                    </button>
                    <button
                      type="button"
                      className={`pm2-seg-btn ${!formData.activo ? 'is-active' : ''}`}
                      onClick={() => setField('activo', false)}
                      aria-pressed={!formData.activo}
                    >
                      Inactivo
                    </button>
                  </div>
                </div>
              </div>

              <div className="pm2-field">
                <label htmlFor="pm2-desc">Descripción</label>
                <textarea
                  id="pm2-desc"
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) => setField('descripcion', e.target.value)}
                  placeholder="Características, materiales, medidas…"
                />
              </div>

              {/* Componente de Gestión de Stock */}
              <ProductIngredientSection
                tipoStock={formData.tipoStock as 'individual' | 'compuesto'}
                stockIndividual={parseInt(stockStr, 10) || 0}
                permiteExtras={formData.permiteExtras}
                ingredientesProducto={ingredientesProducto}
                onStockChange={handleStockChange}
                onTipoStockChange={(tipo) => setField('tipoStock', tipo)}
                onPermiteExtrasChange={(permite) => setField('permiteExtras', permite)}
                onIngredientesChange={setIngredientesProducto}
              />

              {/* Footer (sticky dentro del modal) */}
              <div className="pm2-actions">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? (file ? 'Guardando con imagen…' : 'Guardando…') : (product ? 'Actualizar' : 'Agregar')}
                </button>
              </div>
            </form>

            {/* Preview / Media */}
            <aside className="pm2-media">
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

              <div className="pm2-media-actions">
                <button className="pm2-soft" onClick={openPicker}>Cambiar</button>
                {preview && <button className="pm2-soft" onClick={() => setShowImagePreview(true)}>Ampliar</button>}
                {preview && <button className="pm2-soft danger" onClick={() => { setPreview(null); setFile(null); }}>Quitar</button>}
              </div>
            </aside>
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
