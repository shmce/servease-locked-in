# Provider Navigation Drive Mode Design

## Goal

Build a Waze-like provider navigation mode that guides the provider inside ServEase while preserving Expo Go support, WebView support, Android/iOS builds, and the existing APICenter geocoding and directions flow.

This applies to the provider navigation screen only. Customer tracking remains a customer-facing approach/status view.

## Current Context

- `mobile/src/tracking/TrackingMapPreview.tsx` renders MapLibre through `react-native-webview` on native platforms and an iframe on web.
- Provider navigation already fetches APICenter directions through `getDirections`.
- Provider live location is published through `useProviderLiveLocation`, using Expo Location and the booking gateway.
- Direction steps are available on `selectedBookingDirections.steps`, but they currently appear only in the expanded bottom sheet.
- The current map is route-preview oriented: it fits the whole route and does not act like active turn-by-turn guidance.

## Product Behavior

Provider navigation should feel like an in-app drive mode:

- The map fills the screen and follows the provider's current GPS location.
- The camera uses a first-person style: pitched perspective, route ahead of the provider, and heading-aware rotation when `headingDegrees` is available.
- The top banner shows the next maneuver, distance to that maneuver, and the street/instruction text.
- A secondary cue shows the following maneuver when available.
- The bottom control area stays compact by default and shows ETA, remaining distance, live location status, and primary actions.
- The provider can still call, message, refresh the route, end navigation, and mark arrival.
- If heading is missing or unreliable, the map should remain usable in a route-follow mode with north-up or route-bearing camera.
- If map tiles fail, the current SVG fallback remains available.

## Data Flow

1. Provider opens navigation for a booking.
2. App loads booking tracking through `getBookingTrackingSnapshot`.
3. App resolves provider origin from live GPS, tracking provider location, or current device location.
4. App requests APICenter directions through `getDirections`.
5. `useProviderLiveLocation` continues watching Expo GPS and publishing location to the booking gateway.
6. The map receives:
   - destination coordinates,
   - provider live coordinates,
   - optional heading/speed/accuracy,
   - APICenter route geometry,
   - APICenter route steps.
7. The WebView map renders the route, provider marker, destination marker, and camera state.
8. React Native overlays render the instruction banner and compact action sheet.

APICenter remains the source for geocoding and directions. The app should not introduce Google Maps keys or native map config.

## Components

### `TrackingMapPreview`

Extend the component with a mode prop:

- `mode="tracking"` keeps the current customer/provider preview behavior.
- `mode="navigation"` enables provider drive mode.

Navigation mode should pass route steps, live heading, and camera preferences into the WebView HTML.

### Provider Navigation Screen

Update `renderProviderNavigationMode` in `mobile/App.tsx`:

- Use `TrackingMapPreview` in navigation mode.
- Replace the generic top overlay with a navigation instruction banner.
- Keep the bottom sheet compact by default.
- Show expanded step list only when the provider asks for more detail.

### Navigation Instruction Helpers

Add focused helpers near existing tracking helpers or in a small tracking utility module:

- choose the next relevant step from APICenter directions,
- format maneuver distance,
- format ETA and remaining route distance,
- derive a fallback route bearing from route geometry when GPS heading is missing.

## Map Camera Rules

In navigation mode:

- If provider location exists, center the camera on provider location.
- Use `bearing = headingDegrees` when present.
- If heading is unavailable, use the bearing from the first forward route segment.
- Use a pitched camera around 55 to 65 degrees on native/WebView.
- Keep the provider marker in the lower third so the route ahead is visible.
- Use a reasonable zoom for city driving, with conservative fallback when the route is short or GPS accuracy is low.

In preview/tracking mode:

- Keep the existing route-fit behavior.

## Accuracy Boundaries

The app can provide in-app route guidance, but it should not claim Waze-level lane guidance, police reports, closures, or live traffic unless APICenter provides those fields.

Accuracy depends on:

- APICenter geocoding and route data,
- Expo Location GPS accuracy,
- device heading availability,
- route refresh timing.

If GPS accuracy is poor, show a subtle status such as "Improving GPS" instead of overconfident instructions.

## Error Handling

- Missing destination: show existing unavailable-address fallback.
- Directions unavailable: show provider location and destination with a clear "Directions unavailable" status.
- GPS permission denied: keep route preview visible and show "Location permission required for live guidance."
- Heading unavailable: use route-bearing or north-up camera.
- WebView/map tile failure: fall back to existing SVG route preview.

## Testing

Add source/unit tests for:

- provider navigation uses `mode="navigation"`,
- navigation mode keeps WebView and does not restore native MapLibre,
- instruction banner uses route steps,
- heading or route-bearing is passed into map HTML,
- APICenter geocoding/directions remain the route source,
- customer tracking keeps preview mode.

Run before handoff:

- `cd mobile && npm run typecheck`
- `cd mobile && npm run lint`
- `cd mobile && npm test -- src/appSource.test.ts services/serveaseApi.test.ts`
- `cd mobile && npx expo config --type public --json`

## Acceptance Criteria

- Provider navigation opens as a full-screen guided drive mode.
- The map follows the provider and uses first-person-style pitch/bearing when possible.
- The next turn instruction is visible without expanding the bottom sheet.
- ETA, remaining distance, and live location status are visible in compact mode.
- Customer tracking behavior is not changed into drive mode.
- No native MapLibre plugin or Google Maps native config is reintroduced.
- Expo Go, WebView, Android, iOS, and web remain supported.
