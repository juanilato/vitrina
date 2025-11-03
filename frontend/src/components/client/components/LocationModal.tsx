import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { SavedLocation } from '../../../services/locationService';
import { useGoogleMaps } from '../../../hooks/useGoogleMaps';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: Omit<SavedLocation, 'id' | 'clienteId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingLocation?: SavedLocation | null;
}

declare global {
  interface Window {
    google: any;
  }
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    lat: -31.4201, // Córdoba, Argentina por defecto
    lng: -64.1888,
    referencia: '',
    esPrincipal: false
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { isLoaded, google } = useGoogleMaps({ libraries: ['places'] });

  // Cargar datos de la ubicación a editar
  useEffect(() => {
    if (editingLocation) {
      setFormData({
        nombre: editingLocation.nombre,
        direccion: editingLocation.direccion,
        lat: editingLocation.lat,
        lng: editingLocation.lng,
        referencia: editingLocation.referencia || '',
        esPrincipal: editingLocation.esPrincipal
      });
    } else {
      setFormData({
        nombre: '',
        direccion: '',
        lat: -31.4201,
        lng: -64.1888,
        referencia: '',
        esPrincipal: false
      });
    }
  }, [editingLocation, isOpen]);

  // Inicializar mapa
  useEffect(() => {
    if (isLoaded && mapRef.current && !map && isOpen) {
      const googleMap = new google.maps.Map(mapRef.current, {
        center: { lat: formData.lat, lng: formData.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const googleMarker = new google.maps.Marker({
        position: { lat: formData.lat, lng: formData.lng },
        map: googleMap,
        draggable: true,
        animation: google.maps.Animation.DROP
      });

      const googleGeocoder = new google.maps.Geocoder();

      // Listener para cuando se arrastra el marcador
      google.maps.event.addListener(googleMarker, 'dragend', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        reverseGeocode(lat, lng);
      });

      // Listener para cuando se hace clic en el mapa
      google.maps.event.addListener(googleMap, 'click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        googleMarker.setPosition({ lat, lng });
        googleMap.panTo({ lat, lng });
        reverseGeocode(lat, lng);
      });

      setMap(googleMap);
      setMarker(googleMarker);
      setGeocoder(googleGeocoder);
    }
  }, [isLoaded, google, isOpen]);

  // Actualizar posición del mapa cuando cambia formData
  useEffect(() => {
    if (map && marker) {
      const position = { lat: formData.lat, lng: formData.lng };
      marker.setPosition(position);
      map.panTo(position);
    }
  }, [formData.lat, formData.lng, map, marker]);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoder) return;

    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        setFormData(prev => ({
          ...prev,
          direccion: results[0].formatted_address,
          lat,
          lng
        }));
      }
    });
  }, [geocoder]);

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setFormData(prev => ({ ...prev, lat, lng }));
          reverseGeocode(lat, lng);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos.');
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
      setIsGettingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      alert('Por favor, ingresa un nombre para la ubicación');
      return;
    }

    if (!formData.direccion.trim()) {
      alert('Por favor, selecciona una ubicación en el mapa');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Error al guardar la ubicación');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingLocation ? 'Editar ubicación' : 'Nueva ubicación'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la ubicación *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Casa, Trabajo, Oficina"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Selecciona en el mapa o escribe aquí"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia (opcional)
                  </label>
                  <textarea
                    value={formData.referencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, referencia: e.target.value }))}
                    placeholder="Ej: Timbre 3B, Casa con portón verde"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="esPrincipal"
                    checked={formData.esPrincipal}
                    onChange={(e) => setFormData(prev => ({ ...prev, esPrincipal: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="esPrincipal" className="ml-2 text-sm text-gray-700">
                    Establecer como ubicación principal
                  </label>
                </div>

                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Navigation className="w-5 h-5" />
                  {isGettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                </button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p className="flex items-start gap-1">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Haz clic en el mapa o arrastra el marcador para seleccionar tu ubicación
                  </p>
                  <p>
                    <strong>Coordenadas:</strong> {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Mapa */}
              <div className="h-[400px] lg:h-full rounded-lg overflow-hidden border border-gray-300">
                <div ref={mapRef} className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar ubicación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
