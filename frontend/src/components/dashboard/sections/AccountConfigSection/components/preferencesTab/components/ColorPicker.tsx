import React, { useMemo, useRef } from 'react';
import './ColorPicker.css';
interface ColorPickerProps {
  label: string;
  description?: string;
  value: string;
  onChange: (val: string) => void;
  presets?: string[];
}

const DEFAULTS = ['#4F7CFF','#22C55E','#EF4444','#F59E0B','#06B6D4','#8B5CF6','#14B8A6','#111827','#FFFFFF'];

const isValidHex = (s: string) => /^#([0-9A-Fa-f]{6})$/.test(s);

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  description,
  value,
  onChange,
  presets = DEFAULTS
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const textColor = useMemo(() => {
    // contraste para la capsulita preview
    try {
      const r = parseInt(value.slice(1,3),16);
      const g = parseInt(value.slice(3,5),16);
      const b = parseInt(value.slice(5,7),16);
      const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
      return luminance > 0.6 ? '#111827' : '#ffffff';
    } catch { return '#ffffff'; }
  }, [value]);

  return (
    <div className="preference-item colorpicker-card">
      <div className="preference-info">
        <h4>{label}</h4>
        {description && <p>{description}</p>}
        <div className="colorpicker-preview-row">
          <button
            type="button"
            className="colorpill"
            style={{ background: value, color: textColor }}
            onClick={() => inputRef.current?.click()}
            title="Elegir color"
          >
            {value.toUpperCase()}
          </button>

          <input
            className="hex-input"
            value={value.toUpperCase()}
            onChange={(e) => {
              const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
              if (v.length <= 7) onChange(v);
            }}
            onBlur={(e) => {
              const v = e.target.value.toUpperCase();
              if (isValidHex(v)) onChange(v);
            }}
            maxLength={7}
            placeholder="#000000"
          />

          <input
            ref={inputRef}
            type="color"
            value={isValidHex(value) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="native-color-input"
            aria-hidden
            tabIndex={-1}
          />
        </div>

        <div className="swatches">
          {presets.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch ${c.toLowerCase() === value.toLowerCase() ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => onChange(c.toUpperCase())}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="preference-control" />
    </div>
  );
};

export default ColorPicker;
