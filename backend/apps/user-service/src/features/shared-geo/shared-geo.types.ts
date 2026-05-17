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

export interface GeoFence {
  fenceId: string;
  name?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface GeoFenceCheckRequest {
  latitude: number;
  longitude: number;
  fenceId?: string;
  fences?: GeoFence[];
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

export interface GeoFenceDistanceDetail {
  fenceId: string;
  name?: string;
  inside: boolean;
  distanceMeters: number;
  radiusMeters: number;
}

export interface GeoFenceCheckResponse {
  inside: boolean;
  distanceDetails: GeoFenceDistanceDetail[];
  provider: 'local';
}

