import React, { useState } from 'react';
import useAccountConfig from '../hooks/useAccountConfig';
import GoogleMapsSelector from './GoogleMapsSelector';
import PreciosEnvioTab from './PreciosEnvioTab';

const LocationsTab: React.FC = () => {
  const {
    formData,
    saving,
    addLocation,
    updateLocation,
    removeLocation
  } = useAccountConfig();

  // Log para debuggear
  console.log('🏢 [LOCATIONS TAB] Datos actuales:', {
    ubicacionesCount: formData.ubicaciones?.length || 0,
    ubicaciones: formData.ubicaciones
  });
  
  // Log simple para verificar
  console.log('UBICACIONES EN TAB:', formData.ubicaciones);

  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    direccion: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [preciosEnvioLocationId, setPreciosEnvioLocationId] = useState<number | null>(null);

  const handleLocationSelect = (location: { direccion: string; lat: number; lng: number }) => {
    setSelectedLocation(location);
  };

  const handleAddLocation = async () => {
    if (!selectedLocation) {
      alert('Por favor selecciona una ubicación en el mapa');
      return;
    }

    console.log('🏢 [FRONTEND] Iniciando agregado de ubicación:', selectedLocation);

    try {
      await addLocation({
        direccion: selectedLocation.direccion,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      });
      
      setSelectedLocation(null);
      setIsAddingLocation(false);
    } catch (error) {
      console.error('❌ [FRONTEND] Error al agregar ubicación:', error);
    }
  };

  const handleUpdateLocation = async (locationId: number, data: { direccion: string; lat?: number; lng?: number }) => {
    try {
      await updateLocation(locationId, data);
      setEditingLocationId(null);
    } catch (error) {
      console.error('Error al actualizar ubicación:', error);
    }
  };

  const handleRemoveLocation = async (locationId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) {
      try {
        await removeLocation(locationId);
      } catch (error) {
        console.error('Error al eliminar ubicación:', error);
      }
    }
  };

  const startEditing = (location: any) => {
    setEditingLocationId(location.id);
  };

  const cancelEditing = () => {
    setEditingLocationId(null);
  };

  const handlePreciosEnvio = (locationId: number) => {
    setPreciosEnvioLocationId(locationId);
  };

  const closePreciosEnvio = () => {
    setPreciosEnvioLocationId(null);
  };

  // Si hay una ubicación seleccionada para precios de envío, mostrar esa vista
  if (preciosEnvioLocationId) {
    const ubicacion = formData.ubicaciones.find(loc => loc.id === preciosEnvioLocationId);
    if (ubicacion) {
      return (
        <PreciosEnvioTab
          ubicacionId={ubicacion.id}
          ubicacionDireccion={ubicacion.direccion || 'Sin dirección'}
          ubicacionCoords={ubicacion.lat && ubicacion.lng ? { lat: ubicacion.lat, lng: ubicacion.lng } : undefined}
          onClose={closePreciosEnvio}
        />
      );
    }
  }

  return (
    <div className="locations-tab">
      <div className="locations-header">
        <h2>Ubicaciones de la Empresa</h2>
        <p>Gestiona las ubicaciones donde opera tu empresa</p>
      </div>

      <div className="locations-content">
        {/* Add New Location */}
        <div className="add-location-section">
          <div className="section-header">
            <h3>Agregar Nueva Ubicación</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setIsAddingLocation(!isAddingLocation)}
            >
              {isAddingLocation ? 'Cancelar' : 'Agregar Ubicación'}
            </button>
          </div>

          {isAddingLocation && (
            <div className="add-location-form">
              <div className="maps-container">
                <GoogleMapsSelector
                  onLocationSelect={handleLocationSelect}
                  height="400px"
                />
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsAddingLocation(false);
                    setSelectedLocation(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddLocation}
                  disabled={saving || !selectedLocation}
                >
                  {saving ? 'Agregando...' : 'Agregar Ubicación'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Locations List */}
        <div className="locations-list-section">
          <h3>Ubicaciones Actuales</h3>
          
          {formData.ubicaciones.length === 0 ? (
            <div className="empty-locations">
              <span className="empty-icon">📍</span>
              <p>No hay ubicaciones registradas</p>
              <p className="empty-description">
                Agrega al menos una ubicación para que los clientes puedan encontrarte
              </p>
            </div>
          ) : (
            <div className="locations-list">
              {formData.ubicaciones.map((location) => (
                <div key={location.id} className="location-card">
                  {editingLocationId === location.id ? (
                    <LocationEditForm
                      location={location}
                      onSave={(data) => handleUpdateLocation(location.id, data)}
                      onCancel={cancelEditing}
                      saving={saving}
                    />
                  ) : (
                    <LocationDisplay
                      location={location}
                      onEdit={() => startEditing(location)}
                      onRemove={() => handleRemoveLocation(location.id)}
                      onPreciosEnvio={handlePreciosEnvio}
                      saving={saving}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar ubicación
const LocationDisplay: React.FC<{
  location: any;
  onEdit: () => void;
  onRemove: () => void;
  onPreciosEnvio: (locationId: number) => void;
  saving: boolean;
}> = ({ location, onEdit, onRemove, onPreciosEnvio, saving }) => (
  <div className="location-display">
    <div className="location-info">
      <div className="location-address">
        <span className="address-icon">📍</span>
        <span className="address-text">{location.direccion || 'Sin dirección'}</span>
      </div>
      
      {(location.lat && location.lng) && (
        <div className="location-coordinates">
          <span className="coords-text">
            Lat: {location.lat}, Lng: {location.lng}
          </span>
        </div>
      )}
    </div>

    <div className="location-actions">
      <button 
        className="btn btn-primary small"
        onClick={() => onPreciosEnvio(location.id)}
        disabled={saving}
      >
        🚚 Precios Envío
      </button>
      <button 
        className="btn btn-secondary small"
        onClick={onEdit}
        disabled={saving}
      >
        Editar
      </button>
      <button 
        className="btn btn-danger small"
        onClick={onRemove}
        disabled={saving}
      >
        Eliminar
      </button>
    </div>
  </div>
);

// Componente para editar ubicación
const LocationEditForm: React.FC<{
  location: any;
  onSave: (data: { direccion: string; lat?: number; lng?: number }) => void;
  onCancel: () => void;
  saving: boolean;
}> = ({ location, onSave, onCancel, saving }) => {
  const [editData, setEditData] = useState({
    direccion: location.direccion || '',
    lat: location.lat?.toString() || '',
    lng: location.lng?.toString() || ''
  });

  const handleSave = () => {
    onSave({
      direccion: editData.direccion,
      lat: editData.lat ? parseFloat(editData.lat) : undefined,
      lng: editData.lng ? parseFloat(editData.lng) : undefined
    });
  };

  return (
    <div className="location-edit-form">
      <div className="form-group">
        <label>Dirección *</label>
        <input
          type="text"
          value={editData.direccion}
          onChange={(e) => setEditData(prev => ({ ...prev, direccion: e.target.value }))}
          className="form-input"
          placeholder="Ingresa la dirección completa"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Latitud</label>
          <input
            type="number"
            step="any"
            value={editData.lat}
            onChange={(e) => setEditData(prev => ({ ...prev, lat: e.target.value }))}
            className="form-input"
            placeholder="Ej: -34.6037"
          />
        </div>

        <div className="form-group">
          <label>Longitud</label>
          <input
            type="number"
            step="any"
            value={editData.lng}
            onChange={(e) => setEditData(prev => ({ ...prev, lng: e.target.value }))}
            className="form-input"
            placeholder="Ej: -58.3816"
          />
        </div>
      </div>

      <div className="form-actions">
        <button 
          className="btn btn-secondary small"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>
        <button 
          className="btn btn-primary small"
          onClick={handleSave}
          disabled={saving || !editData.direccion.trim()}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

export default LocationsTab;
