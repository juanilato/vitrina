import React from "react";
import "./AliasEditor.css";

interface AliasEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
}

const AliasEditor: React.FC<AliasEditorProps> = ({
  value,
  onChange,
  label = "Alias para transferencia",
  placeholder = "Ej: Tienda San Juan o @mipagina",
}) => {
  return (
    <div className="alias-editor">
      <label className="alias-label">{label}</label>
      <input
        type="text"
        className="alias-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default AliasEditor;
