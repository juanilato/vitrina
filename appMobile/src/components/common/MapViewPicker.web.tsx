import React, { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyANk5MpfxAkPg0krpULl3xUR3e4wDigkOs";

interface Props {
  height?: number;
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onUseMyLocation?: (lat: number, lng: number) => void;
}

export function MapViewPickerWeb({
  height = 600,
  lat,
  lng,
  onChange,
  onUseMyLocation,
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Init map + marker
  useEffect(() => {
    if (!loaded || !divRef.current) return;

    const google = window.google;

    mapRef.current = new google.maps.Map(divRef.current, {
      center: { lat, lng },
      zoom: 16,
      streetViewControl: false,
      mapTypeControl: false,
    });

    markerRef.current = new google.maps.Marker({
      map: mapRef.current,
      position: { lat, lng },
      draggable: true,
    });

    markerRef.current.addListener("dragend", (e: any) => {
      onChange(e.latLng.lat(), e.latLng.lng());
    });

    mapRef.current.addListener("click", (e: any) => {
      onChange(e.latLng.lat(), e.latLng.lng());
    });
  }, [loaded]);

  // Update center only
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter({ lat, lng });
  }, [lat, lng]);

  // Update marker only
  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setPosition({ lat, lng });
  }, [lat, lng]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const newLat = pos.coords.latitude;
      const newLng = pos.coords.longitude;

      onUseMyLocation?.(newLat, newLng);
      onChange(newLat, newLng);

      // update map
      if (mapRef.current) {
        mapRef.current.setCenter({ lat: newLat, lng: newLng });
      }
      if (markerRef.current) {
        markerRef.current.setPosition({ lat: newLat, lng: newLng });
      }
    });
  };

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <div
        ref={divRef}
        style={{ width: "100%", height: "100%", borderRadius: 12 }}
      />

      {/* Botón MI UBICACIÓN */}
      <button
        onClick={handleUseMyLocation}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          padding: "12px 16px",
          background: "#2563EB",
          color: "#fff",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        📍 Mi ubicación
      </button>
    </div>
  );
}
