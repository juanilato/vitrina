import React, { useState, useEffect } from 'react';
import './LocationsDropdown.css';

interface Location {
  id: number;
  nombre: string;
  direccion: string;
  referencia?: string;
  esPrincipal?: boolean;
}

interface LocationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  onAddLocation: () => void;
  onEditLocation?: (locationId: number) => void;
  onDeleteLocation?: (locationId: number, locationName: string) => void;
  onSetMainLocation?: (locationId: number) => void;
}

export const LocationsDropdown: React.FC<LocationsDropdownProps> = ({
  isOpen,
  onClose,
  locations,
  selectedLocation,
  onSelectLocation,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  onSetMainLocation,
}) => {
  const [expandedLocationId, setExpandedLocationId] = useState<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.locations-dropdown') && !target.closest('.location-btn')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectLocation = (location: Location) => {
    onSelectLocation(location);
    onClose();
  };

  const toggleExpanded = (locationId: number) => {
    setExpandedLocationId(expandedLocationId === locationId ? null : locationId);
  };

  const handleDeleteLocation = (locationId: number, locationName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${locationName}"?`)) {
      onDeleteLocation?.(locationId, locationName);
      if (expandedLocationId === locationId) {
        setExpandedLocationId(null);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="locations-backdrop" onClick={onClose} />

      {/* Dropdown */}
      <div className="locations-dropdown">
        {/* Header */}
        <div className="locations-header">
          <div className="locations-header-content">
            <h3 className="locations-title">Mis Ubicaciones</h3>
            <p className="locations-subtitle">
              {locations.length} {locations.length === 1 ? 'ubicación' : 'ubicaciones'}
            </p>
          </div>
          <button className="locations-close-btn" onClick={onClose} aria-label="Cerrar">
            <svg
              className="close-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Locations List */}
        <div className="locations-list">
          {locations.length === 0 ? (
            <div className="locations-empty">
              <svg
                className="empty-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h4 className="empty-title">No tienes ubicaciones</h4>
              <p className="empty-subtitle">
                Agrega una ubicación para comenzar a recibir pedidos
              </p>
            </div>
          ) : (
            locations.map((location) => {
              const isSelected = selectedLocation?.id === location.id;
              const isExpanded = expandedLocationId === location.id;

              return (
                <div key={location.id} className="location-card">
                  {/* Main Location Item */}
                  <div
                    className={`location-item ${isSelected ? 'location-item-selected' : ''}`}
                    onClick={() => handleSelectLocation(location)}
                  >
                    <div className="location-item-left">
                      {/* Radio Button */}
                      <div className={`location-radio ${isSelected ? 'radio-selected' : ''}`}>
                        {isSelected && <div className="radio-dot" />}
                      </div>

                      {/* Location Info */}
                      <div className="location-info">
                        <div className="location-header-row">
                          <h4 className="location-name">{location.nombre}</h4>
                          {location.esPrincipal && (
                            <span className="location-badge">
                              <svg className="badge-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="location-address">{location.direccion}</p>
                        {location.referencia && (
                          <p className="location-reference">{location.referencia}</p>
                        )}
                      </div>
                    </div>

                    {/* Expand Button */}
                    <button
                      className="location-expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(location.id);
                      }}
                      aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      <svg
                        className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Actions */}
                  {isExpanded && (
                    <div className="location-actions">
                      {!location.esPrincipal && onSetMainLocation && (
                        <button
                          className="action-btn action-btn-primary"
                          onClick={() => onSetMainLocation(location.id)}
                        >
                          <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Establecer como principal
                        </button>
                      )}

                      {onEditLocation && (
                        <button
                          className="action-btn action-btn-secondary"
                          onClick={() => onEditLocation(location.id)}
                        >
                          <svg
                            className="action-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Editar
                        </button>
                      )}

                      {onDeleteLocation && (
                        <button
                          className="action-btn action-btn-danger"
                          onClick={() => handleDeleteLocation(location.id, location.nombre)}
                        >
                          <svg
                            className="action-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Location Button */}
        <div className="locations-footer">
          <button className="add-location-btn" onClick={onAddLocation}>
            <svg className="add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Agregar nueva ubicación
          </button>
        </div>
      </div>
    </>
  );
};
