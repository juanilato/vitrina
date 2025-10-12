// components/common/NotificationPeek.tsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

export interface NotificationPeekProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  /** Contenido extra en el header (ej: filtros, "Marcar todo leído") */
  headerActions?: React.ReactNode;
  /** aria-describedby id si necesitás accesibilidad extra */
  describedById?: string;
}

const NotificationPeek: React.FC<NotificationPeekProps> = ({
  open,
  onClose,
  title = 'Notificaciones',
  children,
  headerActions,
  describedById,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar con ESC y (opcional) Ctrl/Cmd+W
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Opcional: cerrar con Ctrl/Cmd+W si querés comportamiento de "panel"
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'w')) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus inicial y bloqueo de scroll del documento
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prev; };
  }, [open]);

  if (typeof document === 'undefined' || !open) return null;

  return ReactDOM.createPortal(
    <div className="peek-overlay" role="presentation" onClick={onClose}>
      <aside
        className="peek-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={describedById}
        tabIndex={-1}
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="peek-header">
          <h3 className="peek-title">{title}</h3>
          <div className="peek-actions">
            {headerActions}
            <button className="peek-close" onClick={onClose} aria-label="Cerrar notificaciones">
              <CloseOutlinedIcon fontSize="small" />
            </button>
          </div>
        </header>

        {/* Muy importante: 'peek-mode' aplana cualquier dropdown/popover interno */}
        <div className="peek-content peek-mode">
          {children}
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default NotificationPeek;
