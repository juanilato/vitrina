import React, { useEffect, useState } from 'react';
import { CategoriesGrid } from './CategoriesGrid';
import axios from '../../../config/axios.config';
import './HomeView.css';

interface Category {
  id: string;
  nombre: string;
  icono?: string;
}

interface HomeViewProps {
  onCategoryClick: (categoryId: string, categoryName: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/categorias');
      setCategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="home-view">
        <div className="home-loading">
          <div className="loading-spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-view">
        <div className="home-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchCategories} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-view">
      {/* Header con búsqueda */}
      <div className="home-header">
        <div className="home-header-top">
          <div className="location-selector">
            <span className="location-icon">📍</span>
            <span className="location-text">Tu ubicación</span>
          </div>
        </div>

        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar categorías, empresas..."
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

      {/* Grid de categorías */}
      <div className="home-content">
        {filteredCategories.length > 0 ? (
          <>
            <h2 className="home-title">Categorías</h2>
            <CategoriesGrid
              categories={filteredCategories}
              onCategoryClick={onCategoryClick}
            />
          </>
        ) : (
          <div className="home-empty">
            <span className="empty-icon">🔍</span>
            <p>No se encontraron categorías</p>
          </div>
        )}
      </div>
    </div>
  );
};
