import React from 'react';
import { PreferencesState } from '../../../types/index';

interface Props {
  fotoUrl: string;
  onFileSelect: (file: File | null, preview: string | null) => void;
}
// Selector foto dashboard (recorte rectangular)
const DashboardFoto: React.FC<Props> = ({ fotoUrl, onFileSelect }) => {
  return (
    <div className="preference-item">
      <div className="preference-info">
        <h4>Foto Dashboard</h4>
        <p>Elige la imagen de fondo del dashboard</p>
        {fotoUrl && (
          <div className="dashboard-preview">
            <img src={fotoUrl} alt="Dashboard preview" />
          </div>
        )}
      </div>
      <div className="preference-control">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file) {
              const reader = new FileReader();
              reader.onload = () => onFileSelect(file, reader.result as string);
              reader.readAsDataURL(file);
            } else {
              onFileSelect(null, null);
            }
          }}
          title="Seleccionar imagen"
        />
      </div>
    </div>
  );
};

export default DashboardFoto;
