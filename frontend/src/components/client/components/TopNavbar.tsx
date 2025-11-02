import React, { useState } from 'react';
import './TopNavbar.css';

interface TopNavbarProps {
  onLocationClick?: () => void;
  selectedLocation?: string;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onLocationClick,
  selectedLocation,
  onSearchClick,
  onMenuClick,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    if (onSearchClick) {
      onSearchClick();
    }
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-container">
        {/* Left Side - Location Button */}
        <button
          className="navbar-icon-btn location-btn"
          onClick={onLocationClick}
          aria-label="Seleccionar ubicación"
        >
          <svg
            className="navbar-icon"
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
        </button>

        {/* Center - Logo and Location */}
        <div className="navbar-center">
          <h1 className="navbar-logo">Vitrina</h1>
          {selectedLocation && (
            <span className="navbar-location-text">{selectedLocation}</span>
          )}
        </div>

        {/* Right Side - Search and Menu */}
        <div className="navbar-right">
          <button
            className="navbar-icon-btn"
            onClick={handleSearchClick}
            aria-label="Buscar"
          >
            <svg
              className="navbar-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <button
            className="navbar-icon-btn"
            onClick={onMenuClick}
            aria-label="Menú"
          >
            <svg
              className="navbar-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {showSearch && (
        <div className="navbar-search-container">
          <div className="navbar-search-bar">
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Buscar categorías o empresas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
              >
                <svg
                  className="navbar-icon"
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
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
