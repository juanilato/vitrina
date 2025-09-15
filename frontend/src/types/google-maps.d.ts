declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
      removeListener(listener: MapsEventListener): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      streetViewControl?: boolean;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      styles?: MapTypeStyle[];
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class Size {
      constructor(width: number, height: number);
    }

    interface MapMouseEvent {
      latLng?: LatLng;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: Array<{ [key: string]: any }>;
    }

    class Circle {
      constructor(opts?: CircleOptions);
      setCenter(center: LatLng | LatLngLiteral): void;
      setRadius(radius: number): void;
      getCenter(): LatLng;
      getRadius(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
      setMap(map: Map | null): void;
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      radius?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng;
      addListener(eventName: string, handler: Function): MapsEventListener;
      setMap(map: Map | null): void;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
      anchor?: Point;
    }

    interface Symbol {
      path: string;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      scale?: number;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }

    enum MapTypeId {
      HYBRID = 'hybrid',
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      TERRAIN = 'terrain'
    }

    enum ControlPosition {
      BOTTOM_CENTER = 11,
      BOTTOM_LEFT = 10,
      BOTTOM_RIGHT = 12,
      LEFT_BOTTOM = 6,
      LEFT_CENTER = 4,
      LEFT_TOP = 5,
      RIGHT_BOTTOM = 9,
      RIGHT_CENTER = 8,
      RIGHT_TOP = 7,
      TOP_CENTER = 2,
      TOP_LEFT = 1,
      TOP_RIGHT = 3
    }
  }
}
