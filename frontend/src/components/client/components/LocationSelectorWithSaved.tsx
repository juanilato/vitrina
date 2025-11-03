import React, { useState, useEffect } from 'react';
import { X, MapPin, Plus } from 'lucide-react';
import { useLocation } from '../../../contexts/LocationContext';
import SavedLocations from './SavedLocations';
import LocationModal from './LocationModal';
import DeliveryLocationSelector from './DeliveryLocationSelector';
import { DeliveryLocation, ShippingPriceResponse } from '../types';

interface LocationSelectorWithSavedProps {
  onLocationSelect: (location: {
    direccion: string;
    lat: number;
    lng: number;
    shippingPrice?: ShippingPriceResponse | null;
  }) => void;
  onClose: () => void;
  empresaId: string;
  empresaName: string;
  empresaLogo?: string;
  empresaUbicaciones: Array<{
    id: number;
    direccion: string;
    lat: number;
    lng: number;
  }>;
}

type ViewMode = 'saved' | 'new';

const LocationSelectorWithSaved: React.FC<LocationSelectorWithSavedProps> = ({
  onLocationSelect,
  onClose,
  empresaId,
  empresaName,
  empresaLogo,
  empresaUbicaciones
}) => {
  const { locations, selectedLocation, createLocation, loadLocations } = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('saved');
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Si hay ubicaciones guardadas, mostrar "saved", sino ir directo al mapa
  useEffect(() => {
    if (locations.length === 0) {
      setShowMapSelector(true);
    }
  }, [locations]);

  const handleSelectSavedLocation = async (location: { direccion: string; lat: number; lng: number }) => {
    // Calcular precio de envío
    try {
      const { ShippingService } = await import('../../../services/shippingService');
      const closestLocation = ShippingService.findClosestLocation(location, empresaUbicaciones);

      const response = await ShippingService.calculateShippingPrice(empresaId, {
        clienteLat: location.lat,
        clienteLng: location.lng,
        ubicacionId: closestLocation.id
      });

      onLocationSelect({
        direccion: location.direccion,
        lat: location.lat,
        lng: location.lng,
        shippingPrice: response
      });
    } catch (error) {
      console.error('Error calculando precio de envío:', error);
      onLocationSelect({
        direccion: location.direccion,
        lat: location.lat,
        lng: location.lng,
        shippingPrice: {
          price: null,
          isEstimated: false,
          message: `Estimado no disponible. ${empresaName} confirmará precio de envío.`
        }
      });
    }
  };

  const handleCreateNewLocation = () => {
    setShowLocationModal(true);
  };

  const handleSaveNewLocation = async (locationData: any) => {
    await createLocation(locationData);
    await loadLocations();
    setShowLocationModal(false);
    setViewMode('saved');
  };

  if (showMapSelector) {
    return (
      <DeliveryLocationSelector
        onLocationSelect={onLocationSelect}
        onClose={onClose}
        empresaId={empresaId}
        empresaName={empresaName}
        empresaLogo={empresaLogo}
        empresaUbicaciones={empresaUbicaciones}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Seleccionar ubicación de entrega
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {empresaName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setViewMode('saved')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'saved'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mis ubicaciones
                </button>
                <button
                  onClick={() => setShowMapSelector(true)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Seleccionar en mapa
                </button>
              </div>

              {/* Saved Locations View */}
              {viewMode === 'saved' && (
                <SavedLocations
                  onSelectLocation={handleSelectSavedLocation}
                  onCreateNew={handleCreateNewLocation}
                  showActions={false}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={handleCreateNewLocation}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar nueva ubicación
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSave={handleSaveNewLocation}
        />
      )}
    </>
  );
};

export default LocationSelectorWithSaved;
