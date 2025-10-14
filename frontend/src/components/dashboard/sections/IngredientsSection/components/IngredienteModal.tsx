// src/features/ingredientes/components/IngredienteModal.tsx (Nuevo Archivo)

import React, { useEffect, useRef, useState } from 'react';
import { IngredienteModalProps } from '../types';
// Reutilizamos los estilos del modal de producto (pm2-*)
import './IngredienteModal.css'; 

const IngredienteModal: React.FC<IngredienteModalProps> = ({ ingrediente, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: ingrediente?.nombre || '',
    stockDisponible: ingrediente?.stockDisponible ?? 0,
    unidadMedida: ingrediente?.unidadMedida || 'unidades', // Default
    icono: ingrediente?.icono || 'Grass',
  });

  const [stockStr, setStockStr] = useState(
    ingrediente?.stockDisponible !== undefined ? String(ingrediente.stockDisponible) : ''
  );
  
  const [saving, setSaving] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Permite solo números enteros positivos para el stock
  const isValidStockInput = (v: string) => /^\d*$/.test(v);
  const handleStockChange = (v: string) => { if (isValidStockInput(v)) setStockStr(v); };

  const setField = (k: string, v: any) => setFormData(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const stock = parseInt(stockStr || '0', 10);
      if (isNaN(stock) || stock < 0) throw new Error('El stock no es un número válido.');
      
      await onSave({ ...formData, stockDisponible: stock });
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Error al guardar ingrediente');
    } finally {
      setSaving(false);
    }
  };
  
  // Lista de unidades de medida comunes (se puede expandir)
  const unidadMedidaOptions = ['unidades', 'gramos', 'mililitros', 'litros', 'kilogramos'];

  return (
    <div className="pm2-overlay" onClick={onClose}>
      <section
        className="pm2-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={ingrediente ? 'Editar ingrediente' : 'Nuevo ingrediente'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="pm2-header">
          <div className="pm2-titles">
            <h2 className="pm2-title">{ingrediente ? 'Editar ingrediente' : 'Nuevo ingrediente'}</h2>
            <p className="pm2-subtitle">Define el nombre, stock y unidad de medida.</p>
          </div>
          <button className="pm2-close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        {/* Body (Simplificado a 1 columna para ingredientes) */}
        {/* NOTA: Adaptamos 'pm2-body' para 1 columna si no hay media/preview */}
        <div className="pm2-body" style={{ gridTemplateColumns: '1fr' }}> 
          {/* Form */}
          <form className="pm2-form" onSubmit={submit}>

            <div className="pm2-field">
              <label htmlFor="pm2-nombre">Nombre *</label>
              <input
                ref={firstInputRef}
                id="pm2-nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                placeholder="Ej. Medallón de carne 100gr"
                required
              />
            </div>

            <div className="pm2-row">
              {/* Campo Stock */}
              <div className="pm2-field">
                <label htmlFor="pm2-stock">Stock Disponible *</label>
                <input
                  id="pm2-stock"
                  type="text"
                  inputMode="numeric"
                  value={stockStr}
                  onChange={(e) => handleStockChange(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              {/* Campo Unidad de Medida (Dropdown/Select) */}
              <div className="pm2-field">
                <label htmlFor="pm2-unidad">Unidad de Medida *</label>
                <select
                  id="pm2-unidad"
                  value={formData.unidadMedida}
                  onChange={(e) => setField('unidadMedida', e.target.value)}
                  className="pm2-field-select" // Necesitarías añadir estilos para esto
                  required
                >
                  {unidadMedidaOptions.map(u => (
                    <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Campo Icono (Opcional, podrías usar un selector de iconos) */}
            <div className="pm2-field">
              <label htmlFor="pm2-icono">Ícono (Nombre MUI)</label>
              <input
                id="pm2-icono"
                type="text"
                value={formData.icono}
                onChange={(e) => setField('icono', e.target.value)}
                placeholder="Ej. Fastfood, Grass, Egg..."
              />
            </div>
            
            {/* Footer (sticky dentro del modal) */}
            <div className="pm2-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : (ingrediente ? 'Actualizar' : 'Agregar')}
              </button>
            </div>
          </form>
          
          {/* No hay sección de media/preview para ingredientes en este modal */}
        </div>
      </section>
    </div>
  );
};

export default IngredienteModal;