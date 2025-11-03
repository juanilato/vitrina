import React, { useState } from 'react';
import { useLocation } from '../../../contexts/LocationContext';
import { SavedLocation } from '../../../services/locationService';
import { MapPin, Star, Edit2, Trash2, Plus } from 'lucide-react';

interface SavedLocationsProps {
  onSelectLocation?: (location: SavedLocation) => void;
  onCreateNew?: () => void;
  showActions?: boolean;
}

const SavedLocations: React.FC<SavedLocationsProps> = ({
  onSelectLocation,
  onCreateNew,
  showActions = true
}) => {
  const {
    locations,
    selectedLocation,
    principalLocation,
    loading,
    setSelectedLocation,
    deleteLocation,
    setPrincipalLocation
  } = useLocation();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSelectLocation = (location: SavedLocation) => {
    setSelectedLocation(location);
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };

  const handleSetPrincipal = async (id: number) => {
    try {
      await setPrincipalLocation(id);
    } catch (error) {
      console.error('Error setting principal location:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta ubicación?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteLocation(id);
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Error al eliminar la ubicación');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && locations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mis ubicaciones</h3>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar ubicación
          </button>
        )}
      </div>

      {/* Lista de ubicaciones */}
      {locations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">No tienes ubicaciones guardadas</p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Agregar tu primera ubicación
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((location) => {
            const isSelected = selectedLocation?.id === location.id;
            const isPrincipal = principalLocation?.id === location.id;
            const isExpanded = expandedId === location.id;
            const isDeleting = deletingId === location.id;

            return (
              <div
                key={location.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Contenido principal */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => !showActions && handleSelectLocation(location)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {location.nombre}
                        </h4>
                        {isPrincipal && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {location.direccion}
                      </p>
                      {location.referencia && (
                        <p className="text-xs text-gray-500">
                          Ref: {location.referencia}
                        </p>
                      )}
                    </div>

                    {showActions && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(location.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Acciones expandibles */}
                {showActions && isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSelectLocation(location)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {isSelected ? 'Seleccionada' : 'Seleccionar'}
                      </button>

                      {!isPrincipal && (
                        <button
                          onClick={() => handleSetPrincipal(location.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm font-medium transition-colors"
                        >
                          <Star className="w-4 h-4" />
                          Establecer como principal
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(location.id)}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 rounded-lg border border-red-300 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedLocations;
