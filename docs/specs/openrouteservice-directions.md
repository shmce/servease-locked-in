# OpenRouteService Directions

## Goal

ServEase will keep APICenter as the geocoding provider and use OpenRouteService only for provider navigation routes. The mobile app must not receive the OpenRouteService API key.

## Contract

- `POST /v1/geo/directions`
- Auth required.
- Request:
  - `origin.latitude`, `origin.longitude`
  - `destination.latitude`, `destination.longitude`
  - optional `profile`, default `driving-car`
  - optional `language`, default `en`
- Response:
  - `provider: "openrouteservice"`
  - `distanceMeters`
  - `durationSeconds`
  - `geometry`: ordered latitude/longitude points for the route polyline
  - `steps`: turn instructions with distance and duration

## Flow

1. Mobile asks for provider device location when the provider opens navigation mode.
2. Mobile uses the enriched booking tracking destination coordinates.
3. Mobile sends origin and destination coordinates to the gateway.
4. Gateway forwards the request to user-service over HTTP.
5. User-service calls OpenRouteService with `OPENROUTESERVICE_API_KEY`.
6. Mobile renders the route polyline in the existing WebView map renderer.

## Failure Handling

- Invalid or missing coordinates return `invalid_geo_request`.
- Missing OpenRouteService key returns the existing geo dependency unavailable response.
- OpenRouteService non-2xx, malformed payloads, or network failures return geo dependency unavailable.
- Mobile falls back to the existing route preview map and shows a retry path when directions cannot load.

## Acceptance Criteria

- The API key is stored only in backend environment files.
- `POST /v1/geo/directions` is covered by backend unit tests.
- The mobile API client is covered by service tests.
- Provider navigation displays route distance, ETA, and turn instructions when origin and destination are available.
