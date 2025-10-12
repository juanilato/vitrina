import React from 'react';
import './EnvioToggle.css';
interface Props {
  value: boolean;
  onChange: (val: boolean) => void;
}

const EnvioToggle: React.FC<Props> = ({ value, onChange }) => (
  <div className="preference-item">
    <div className="preference-info">
      <h4>Envio a domicilio</h4>
      <p>Permite que los clientes pidan envio</p>
    </div>
<label
  className="preference-control toggle-switch"
  role="switch"
  aria-checked={value}
>
  <input
    type="checkbox"
    checked={value}
    onChange={(e) => onChange(e.target.checked)}
  />
  <span className="toggle-slider" />
</label>
  </div>
);

export default EnvioToggle;
