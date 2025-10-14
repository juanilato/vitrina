import React, { useMemo, useState } from 'react';
import { DynamicMuiIcon } from './DynamicMuiIcon';
import { iconCategories, IconName } from './IconoModal';
import './IconoPickerModal.css';

type IconPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (iconName: IconName) => void;
};

const IconPickerModal: React.FC<IconPickerModalProps> = ({ open, onClose, onSelect }) => {
  const [activeCat, setActiveCat] = useState(iconCategories[0].key);
  const [search, setSearch] = useState('');

  const items = useMemo(() => {
    const current = iconCategories.find(c => c.key === activeCat) || iconCategories[0];
    const list = current.items;
    if (!search) return list;
    const s = search.toLowerCase().trim();
    return list.filter(n => n.toLowerCase().includes(s));
  }, [activeCat, search]);

  if (!open) return null;

  return (
    <div className="pm2-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Elegir ícono">
      <section className="pm2-dialog pm2-dialog--icons" onClick={(e) => e.stopPropagation()}>
        <header className="pm2-header">
          <div className="pm2-titles">
            <h2 className="pm2-title">Elegir ícono</h2>
            <p className="pm2-subtitle">Busca por nombre o filtra por categoría.</p>
          </div>
          <button className="pm2-close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        <div className="ip-toolbar">
          <div className="ip-tabs" role="tablist" aria-label="Categorías">
            {iconCategories.map(cat => (
              <button
                key={cat.key}
                role="tab"
                aria-selected={activeCat === cat.key}
                className={`ip-tab ${activeCat === cat.key ? 'active' : ''}`}
                onClick={() => setActiveCat(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="ip-search">
            <input
              type="text"
              placeholder="Buscar: ej. Fastfood, Grass, OilBarrel…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ip-grid">
          {items.map((name) => (
            <button
              key={name}
              className="ip-cell"
              title={name}
              onClick={() => onSelect(name)}
            >
              <DynamicMuiIcon name={name} fontSize="large" />
              <span className="ip-name">{name}</span>
            </button>
          ))}

          {items.length === 0 && (
            <div className="ip-empty">
              <span>😕 Sin coincidencias. Cambiá la búsqueda o categoría.</span>
            </div>
          )}
        </div>

        <footer className="pm2-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        </footer>
      </section>
    </div>
  );
};

export default IconPickerModal;
