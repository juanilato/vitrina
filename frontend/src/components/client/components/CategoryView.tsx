import React, { useEffect, useState } from 'react';
import { SubcategoryCard } from './SubcategoryCard';
import axios from '../../../config/axios.config';
import './CategoryView.css';

interface Subcategory {
  id: string;
  nombre: string;
  icono?: string;
  empresasCount?: number;
}

interface CategoryViewProps {
  categoryId: string;
  categoryName: string;
  onSubcategoryClick: (subcategoryId: string, subcategoryName: string) => void;
  onBack: () => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  categoryId,
  categoryName,
  onSubcategoryClick,
  onBack,
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/categorias/${categoryId}/subcategorias`);
      setSubcategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar subcategorías');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubcategories = subcategories.filter(sub =>
    sub.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="category-view">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>
            ← Volver
          </button>
          <h1 className="category-title">{categoryName}</h1>
        </div>
        <div className="category-loading">
          <div className="loading-spinner"></div>
          <p>Cargando subcategorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-view">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>
            ← Volver
          </button>
          <h1 className="category-title">{categoryName}</h1>
        </div>
        <div className="category-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchSubcategories} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-view">
      {/* Header */}
      <div className="category-header">
        <button className="back-button" onClick={onBack}>
          ← Volver
        </button>
        <h1 className="category-title">{categoryName}</h1>
      </div>

      {/* Búsqueda */}
      <div className="category-search">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar subcategorías..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Lista de subcategorías */}
      <div className="category-content">
        {filteredSubcategories.length > 0 ? (
          <div className="subcategories-list">
            {filteredSubcategories.map((subcategory) => (
              <SubcategoryCard
                key={subcategory.id}
                id={subcategory.id}
                nombre={subcategory.nombre}
                icono={subcategory.icono}
                empresasCount={subcategory.empresasCount}
                onPress={onSubcategoryClick}
              />
            ))}
          </div>
        ) : (
          <div className="category-empty">
            <span className="empty-icon">🔍</span>
            <p>No se encontraron subcategorías</p>
          </div>
        )}
      </div>
    </div>
  );
};
