import React from "react";
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api";

const TestMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  });

  const center = { lat: -31.5375, lng: -68.5364 }; // San Juan aprox
  const radius = 5000; // 5km

  if (!isLoaded) return <div style={{height: 400}}>Cargando…</div>;

  return (
    <div style={{ height: 400 }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={12}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        <Marker position={center} label="Local" />
        <Circle
          center={center}
          radius={radius}
          options={{
            fillColor: "#FF6B35",
            fillOpacity: 0.15,
            strokeColor: "#FF6B35",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: false,
          }}
          visible={true}
        />
      </GoogleMap>
    </div>
  );
};


export default TestMap;
