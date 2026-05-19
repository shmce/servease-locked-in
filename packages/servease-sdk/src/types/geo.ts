export interface GeoRouteLocation {
  latitude: number;
  longitude: number;
}

export type GeoDirectionsProfile =
  | 'driving-car'
  | 'driving-hgv'
  | 'cycling-regular'
  | 'foot-walking';

export interface GeoDirectionsRequest {
  origin: GeoRouteLocation;
  destination: GeoRouteLocation;
  profile?: GeoDirectionsProfile;
  language?: string;
}

export interface GeoDirectionsStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  name?: string;
  type?: number;
  wayPoints?: [number, number];
}

export interface GeoDirectionsRoute {
  provider: 'openrouteservice';
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoRouteLocation[];
  steps: GeoDirectionsStep[];
  bbox?: [number, number, number, number];
  raw?: unknown;
}

export interface GeoGeocodeAddressRequest {
  address: string;
  language?: string;
  region?: string;
}

export interface GeoReverseGeocodeRequest {
  latitude: number;
  longitude: number;
  language?: string;
  resultType?: string;
  locationType?: string;
}

export interface GeoAddressResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  types?: string[];
  provider: 'google-maps' | 'mock';
  raw?: unknown;
}
