import React, { useState, useEffect } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';
import { CategoriaData, SubcategoriaData } from '../types';
import './CategoriesTab.css';
import { SkeletonForm } from '../../../../skeletons';

  //Seleccionador de categorías y subcategorías correspondientes
const CategoriesTab: React.FC = () => {
  const {
    empresaData,
    saving,
    getCategorias,
    updateCategorias
  } = useAccountConfig();


  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>('');
  const [selectedSubcategoriaIds, setSelectedSubcategoriaIds] = useState<string[]>([]);
  const [availableSubcategorias, setAvailableSubcategorias] = useState<SubcategoriaData[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategorias = async () => {
      setLoading(true);
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategorias();
  }, [getCategorias]);

  // Inicializar con los valores actuales de la empresa
  useEffect(() => {
    if (empresaData) {
      setSelectedCategoriaId(empresaData.categoriaId || '');
      setSelectedSubcategoriaIds(empresaData.subcategorias?.map(sub => sub.id) || []);
    }
  }, [empresaData]);

  // Actualizar subcategorías disponibles cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategoriaId) {
      const categoria = categorias.find(cat => cat.id === selectedCategoriaId);
      setAvailableSubcategorias(categoria?.subcategorias || []);
      // Limpiar subcategorías seleccionadas si no pertenecen a la nueva categoría
      setSelectedSubcategoriaIds(prev =>
        prev.filter(id => categoria?.subcategorias?.some(sub => sub.id === id))
      );
    } else {
      setAvailableSubcategorias([]);
      setSelectedSubcategoriaIds([]);
    }
  }, [selectedCategoriaId, categorias]);

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoriaId(e.target.value);
  };

  const handleSubcategoriaToggle = (subcategoriaId: string) => {
    setSelectedSubcategoriaIds(prev => {
      if (prev.includes(subcategoriaId)) {
        return prev.filter(id => id !== subcategoriaId);
      } else {
        return [...prev, subcategoriaId];
      }
    });
  };

  const handleSave = async () => {
    try {
      await updateCategorias({
        categoriaId: selectedCategoriaId || undefined,
        subcategoriaIds: selectedSubcategoriaIds.length > 0 ? selectedSubcategoriaIds : undefined
      });
    } catch (error) {
      console.error('Error al guardar categorías:', error);
    }
  };

  const hasChanges = () => {
    const currentCategoriaId = empresaData?.categoriaId || '';
    const currentSubcategoriaIds = empresaData?.subcategorias?.map(sub => sub.id).sort() || [];
    const selectedSubcategoriaIdsSorted = [...selectedSubcategoriaIds].sort();

    return (
      selectedCategoriaId !== currentCategoriaId ||
      JSON.stringify(currentSubcategoriaIds) !== JSON.stringify(selectedSubcategoriaIdsSorted)
    );
  };

  if (loading) {
    return (
      <div className="categories-tab">
        <SkeletonForm fields={3} hasSelect hasImageUpload={false} />
      </div>
    );
  }

  return (
    <div className="categories-tab">
      <div className="categories-header">
        <h2>Categoría y Subcategorías</h2>
        <p>Selecciona la categoría principal de tu negocio y las subcategorías que apliquen</p>
      </div>

      <div className="categories-content">
        {/* Selección de Categoría */}
        <div className="category-section">
          <label htmlFor="categoria-select" className="section-label">
            Categoría Principal *
          </label>
          <select
            id="categoria-select"
            className="category-select"
            value={selectedCategoriaId}
            onChange={handleCategoriaChange}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.icono && `${categoria.icono} `}
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de Subcategorías */}
        {selectedCategoriaId && availableSubcategorias.length > 0 && (
          <div className="subcategories-section">
            <label className="section-label">
              Subcategorías (puedes seleccionar varias)
            </label>
            <div className="subcategories-grid">
              {availableSubcategorias.map(subcategoria => (
                <button
                  key={subcategoria.id}
                  className={`subcategory-card ${
                    selectedSubcategoriaIds.includes(subcategoria.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleSubcategoriaToggle(subcategoria.id)}
                  type="button"
                >
                  <div className="subcategory-icon">
                    {subcategoria.icono || '📦'}
                  </div>
                  <div className="subcategory-name">{subcategoria.nombre}</div>
                  {selectedSubcategoriaIds.includes(subcategoria.id) && (
                    <div className="check-mark">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resumen de Selección */}
        {(selectedCategoriaId || selectedSubcategoriaIds.length > 0) && (
          <div className="selection-summary">
            <h3>Selección Actual</h3>
            <div className="summary-content">
              {selectedCategoriaId && (
                <p>
                  <strong>Categoría:</strong>{' '}
                  {categorias.find(cat => cat.id === selectedCategoriaId)?.nombre}
                </p>
              )}
              {selectedSubcategoriaIds.length > 0 && (
                <div>
                  <strong>Subcategorías ({selectedSubcategoriaIds.length}):</strong>
                  <ul>
                    {selectedSubcategoriaIds.map(id => {
                      const subcategoria = availableSubcategorias.find(sub => sub.id === id);
                      return subcategoria ? (
                        <li key={id}>{subcategoria.nombre}</li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        {hasChanges() && (
          <div className="categories-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedCategoriaId(empresaData?.categoriaId || '');
                setSelectedSubcategoriaIds(empresaData?.subcategorias?.map(sub => sub.id) || []);
              }}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !selectedCategoriaId}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesTab;
