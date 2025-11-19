import React, { useState, useEffect } from 'react';
import categoryService, { CategoriaProducto } from '../../../../../services/category.service';
import EmojiPickerModal from '../../../sections/IngredientsSection/components/EmojiPickerModal';
import './CategoryManager.css';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';

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
        // No enviamos empresaId, se toma del usuario autenticado en el backend
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

  return (
    <>
      <div className="pm2-overlay" onClick={onClose}>
        <div className="category-manager-modal" onClick={(e) => e.stopPropagation()}>
          <header className="order-modal-header">
            <div className="order-modal-header-left">
              <div className="order-modal-header-info">
                <div className="order-modal-client-name">
                  <CategoryOutlinedIcon style={{ marginRight: 8 }} />
                  Gestionar Categorías
                </div>
                <div className="order-modal-date">
                  Crea y organiza las categorías de tus productos
                </div>
              </div>
            </div>
            <button className="modal-close-modern" onClick={onClose}>×</button>
          </header>

          <div className="order-modal-body">
            {/* Formulario de agregar/editar */}
            <div className="category-form">
              <input
                type="text"
                placeholder="Nombre de la categoría"
                className="form-input-modern"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
              <div className="icon-input-wrapper">
                <div className="icon-display" onClick={() => setShowEmojiPicker(true)}>
                  {formData.icono ? (
                    <span className="emoji-large">{formData.icono}</span>
                  ) : (
                    <EmojiEmotionsOutlinedIcon style={{ fontSize: 32, color: '#ccc' }} />
                  )}
                </div>
                <button
                  type="button"
                  className="btn-select-emoji"
                  onClick={() => setShowEmojiPicker(true)}
                >
                  {formData.icono ? 'Cambiar icono' : 'Seleccionar icono'}
                </button>
              </div>
              <div className="category-form-actions">
                <button className="btn-primary-modern" onClick={handleSave}>
                  {editing ? 'Actualizar' : 'Agregar'}
                </button>
                {editing && (
                  <button className="btn-secondary-modern" onClick={handleCancel}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Lista de categorías */}
            <div className="category-list">
              {loading ? (
                <div className="loading-text">Cargando...</div>
              ) : categories.length === 0 ? (
                <div className="empty-state">
                  <CategoryOutlinedIcon style={{ fontSize: 48, opacity: 0.3 }} />
                  <p>No hay categorías creadas</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="category-item">
                    <div className="category-info">
                      {category.icono && <span className="category-icon">{category.icono}</span>}
                      <span className="category-name">{category.nombre}</span>
                      {category._count && (
                        <span className="category-count">{category._count.productos} productos</span>
                      )}
                    </div>
                    <div className="category-actions">
                      <button
                        className="btn-icon-action"
                        onClick={() => handleEdit(category)}
                        title="Editar"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </button>
                      <button
                        className="btn-icon-action btn-icon-danger"
                        onClick={() => handleDelete(category.id)}
                        title="Eliminar"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker Modal - rendered outside overlay to prevent event propagation */}
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
