import React, { useState } from 'react';
import { useLocation } from '../../../contexts/LocationContext';
import SavedLocations from '../components/SavedLocations';
import LocationModal from '../components/LocationModal';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyLocations: React.FC = () => {
  const navigate = useNavigate();
  const { createLocation, updateLocation, loadLocations } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const handleCreateNew = () => {
    setEditingLocation(null);
    setShowLocationModal(true);
  };

  const handleSaveLocation = async (locationData: any) => {
    if (editingLocation) {
      await updateLocation((editingLocation as any).id, locationData);
    } else {
      await createLocation(locationData);
    }
    await loadLocations();
    setShowLocationModal(false);
    setEditingLocation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Ubicaciones</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tus direcciones de entrega
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SavedLocations
          onCreateNew={handleCreateNew}
          showActions={true}
        />
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => {
            setShowLocationModal(false);
            setEditingLocation(null);
          }}
          onSave={handleSaveLocation}
          editingLocation={editingLocation}
        />
      )}
    </div>
  );
};

export default MyLocations;
