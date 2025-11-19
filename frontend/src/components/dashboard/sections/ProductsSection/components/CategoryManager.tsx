import React, { useState, useEffect, useMemo } from 'react';
import categoryService, { CategoriaProducto } from '../../../../../services/category.service';
import EmojiPickerModal from '../../../sections/IngredientsSection/components/EmojiPickerModal';
import './CategoryManager.css';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

interface CategoryManagerProps {
  empresaId: string;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ empresaId, onClose }) => {
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoriaProducto | null>(null);
  const [formData, setFormData] = useState({ nombre: '', icono: '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategories();
  }, [empresaId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getByEmpresa(empresaId);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    try {
      if (editing) {
        await categoryService.update(editing.id, formData);
      } else {
        await categoryService.create(formData);
      }
      setFormData({ nombre: '', icono: '' });
      setEditing(null);
      loadCategories();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error al guardar categoría');
    }
  };

  const handleEdit = (category: CategoriaProducto) => {
    setEditing(category);
    setFormData({ nombre: category.nombre, icono: category.icono || '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await categoryService.delete(id);
      loadCategories();
    } catch (error) {
      alert('Error al eliminar categoría');
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({ nombre: '', icono: '' });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Filtrar categorías por búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const search = searchTerm.toLowerCase();
    return categories.filter(cat =>
      cat.nombre.toLowerCase().includes(search)
    );
  }, [categories, searchTerm]);

  return (
    <>
      <div className="pm2-overlay" onClick={onClose}>
        <div className="category-manager-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header con gradiente */}
          <header className="cm-header">
            <div className="cm-header-title">
              <CategoryOutlinedIcon />
              Gestionar Categorías
            </div>
            <p className="cm-header-subtitle">
              Crea y organiza las categorías de tus productos
            </p>
            <button className="cm-close-btn" onClick={onClose}>×</button>
          </header>

          {/* Buscador */}
          <div className="cm-search-section">
            <div className="cm-search-wrapper">
              <SearchOutlinedIcon className="cm-search-icon" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                className="cm-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="cm-clear-btn" onClick={handleClearSearch}>
                  <CloseOutlinedIcon style={{ fontSize: 14 }} />
                </button>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="cm-form-section">
            <div className="cm-form-grid">
              <div className="cm-input-group">
                <label className="cm-label">Nombre de la categoría</label>
                <input
                  type="text"
                  placeholder="Ej: Bebidas, Postres, Principales..."
                  className="cm-input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div className="cm-icon-selector">
                <label className="cm-label">Icono</label>
                <div
                  className="cm-icon-display"
                  onClick={() => setShowEmojiPicker(true)}
                  title="Seleccionar icono"
                >
                  {formData.icono ? (
                    <span className="cm-emoji-large">{formData.icono}</span>
                  ) : (
                    <EmojiEmotionsOutlinedIcon style={{ fontSize: 36, color: '#D4D4D4' }} />
                  )}
                </div>
              </div>
            </div>

            <div className="cm-form-actions">
              <button className="cm-btn-primary" onClick={handleSave}>
                {editing ? '✓ Actualizar Categoría' : '+ Agregar Categoría'}
              </button>
              {editing && (
                <button className="cm-btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Grid de categorías */}
          <div className="cm-categories-container">
            {loading ? (
              <div className="cm-loading">Cargando categorías...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="cm-empty-state">
                <div className="cm-empty-icon">
                  {searchTerm ? '🔍' : '📦'}
                </div>
                <p className="cm-empty-text">
                  {searchTerm
                    ? `No se encontraron categorías con "${searchTerm}"`
                    : 'No hay categorías creadas. ¡Crea tu primera categoría!'}
                </p>
              </div>
            ) : (
              <div className="cm-categories-grid">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="cm-category-card">
                    <div className="cm-category-icon-wrapper">
                      {category.icono ? (
                        <span className="cm-category-icon">{category.icono}</span>
                      ) : (
                        <CategoryOutlinedIcon style={{ fontSize: 32, color: '#A3A3A3' }} />
                      )}
                    </div>

                    <div className="cm-category-content">
                      <div className="cm-category-name">{category.nombre}</div>
                      {category._count && (
                        <span className="cm-category-count">
                          {category._count.productos} {category._count.productos === 1 ? 'producto' : 'productos'}
                        </span>
                      )}
                    </div>

                    <div className="cm-category-actions">
                      <button
                        className="cm-action-btn"
                        onClick={() => handleEdit(category)}
                        title="Editar categoría"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </button>
                      <button
                        className="cm-action-btn danger"
                        onClick={() => handleDelete(category.id)}
                        title="Eliminar categoría"
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

      {/* Emoji Picker Modal */}
      <EmojiPickerModal
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelectEmoji={(emoji) => {
          setFormData({ ...formData, icono: emoji });
          setShowEmojiPicker(false);
        }}
        currentEmoji={formData.icono}
      />
    </>
  );
};

export default CategoryManager;
