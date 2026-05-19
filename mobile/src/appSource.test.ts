import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('booking form verifies service addresses through the APICenter geo gateway', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');

  assert.match(source, /geocodeAddress/);
  assert.match(source, /verifyServiceAddress/);
  assert.match(source, /Verify address/);
});

test('Google auth callback exchanges the APICenter code before returning to password login', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');

  assert.match(source, /exchangeGoogleCode/);
  assert.match(source, /servease:\/\/auth\/google\/callback/);
  assert.match(source, /Google account verified through APICenter/);
});

test('Google auth opens APICenter authorization in the system browser, not WebView', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
  const oauthStart = source.indexOf('async function startGoogleSignIn');
  const oauthEnd = source.indexOf('async function requestPhoneOtp');
  assert.notEqual(oauthStart, -1);
  assert.notEqual(oauthEnd, -1);

  const oauthSource = source.slice(oauthStart, oauthEnd);

  assert.match(oauthSource, /getGoogleAuthorizationUrl/);
  assert.match(oauthSource, /Linking\.openURL\(authorization\.authorizationUrl\)/);
  assert.doesNotMatch(oauthSource, /WebView/);
});

test('mobile manifest registers the Google auth callback scheme', () => {
  const manifest = JSON.parse(
    readFileSync(join(process.cwd(), 'app.json'), 'utf8'),
  ) as { expo?: { scheme?: string } };

  assert.equal(manifest.expo?.scheme, 'servease');
});

test('provider navigation keeps directions inside the app through the geo gateway', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
  const navigationStart = source.indexOf('async function refreshProviderDirections');
  const navigationEnd = source.indexOf('function upsertBookingServiceUpdate');
  assert.notEqual(navigationStart, -1);
  assert.notEqual(navigationEnd, -1);

  const navigationSource = source.slice(navigationStart, navigationEnd);

  assert.match(navigationSource, /refreshProviderDirections/);
  assert.match(navigationSource, /getCurrentNavigationLocation/);
  assert.match(navigationSource, /getDirections/);
  assert.doesNotMatch(navigationSource, /Linking\.openURL/);
});

test('provider navigation publishes live location through the booking gateway', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
  const liveLocationSource = readFileSync(
    join(process.cwd(), 'src/tracking/useProviderLiveLocation.ts'),
    'utf8',
  );

  assert.match(source, /useProviderLiveLocation/);
  assert.match(source, /route\.screen === 'providerNavigationMode'/);
  assert.match(source, /providerLocation: liveLocation/);
  assert.match(liveLocationSource, /Location\.watchPositionAsync/);
  assert.match(liveLocationSource, /updateBookingLiveLocation/);
  assert.match(liveLocationSource, /MIN_SEND_INTERVAL_MS/);
  assert.doesNotMatch(liveLocationSource, /google/i);
});

test('tracking navigation uses compact collapsible sheet states', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');

  assert.match(source, /type NavigationSheetLevel = 'peek' \| 'half' \| 'expanded'/);
  assert.match(source, /useState<NavigationSheetLevel>\('peek'\)/);
  assert.match(source, /NavigationSheetHeader/);
  assert.match(source, /navBottomSheetPeek/);
  assert.match(source, /navBottomSheetHalf/);
  assert.match(source, /navBottomSheetExpanded/);
  assert.match(source, /navigationSheetStyle\(customerTrackingSheetLevel\)/);
  assert.match(source, /navigationSheetStyle\(providerNavigationSheetLevel\)/);
});

test('tracking map canvas remains absolutely filled behind the sheet', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
  const mapCanvasStart = source.indexOf('mapCanvas: {');
  const mapCloseStart = source.indexOf('mapCloseButton: {');
  assert.notEqual(mapCanvasStart, -1);
  assert.notEqual(mapCloseStart, -1);

  const mapCanvasSource = source.slice(mapCanvasStart, mapCloseStart);

  assert.match(mapCanvasSource, /StyleSheet\.absoluteFillObject/);
  assert.doesNotMatch(mapCanvasSource, /position: 'relative'/);
});

test('tracking map uses MapLibre with OpenFreeMap through WebView and keeps fallbacks', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const previewStart = source.indexOf('export function TrackingMapPreview');
  const htmlStart = source.indexOf('function buildTrackingMapHtml');
  assert.notEqual(previewStart, -1);
  assert.notEqual(htmlStart, -1);

  const previewSource = source.slice(previewStart, htmlStart);

  assert.match(source, /OPENFREEMAP_STYLE_URL = 'https:\/\/tiles\.openfreemap\.org\/styles\/liberty'/);
  assert.match(source, /import WebView from 'react-native-webview'/);
  assert.match(previewSource, /TrackingMapWebView/);
  assert.match(previewSource, /TrackingMapSvgPreview/);
  assert.match(previewSource, /Platform\.OS === 'web'/);
  assert.match(previewSource, /mode = 'tracking'/);
  assert.match(previewSource, /mode === 'tracking'/);
  assert.match(previewSource, /buildTrackingMapHtml\(actualProvider, destination, routeGeometry, \{/);
  assert.doesNotMatch(source, /@maplibre\/maplibre-react-native/);
  assert.doesNotMatch(source, /TurboModuleRegistry|MLRNCameraModule|MLRNMapViewModule/);
  assert.doesNotMatch(previewSource, /NativeTrackingMap/);
});

test('provider navigation uses first-person WebView drive mode', () => {
  const appSource = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const providerNavigationStart = appSource.indexOf('function renderProviderNavigationMode');
  const providerStartServiceStart = appSource.indexOf('function renderProviderStartService');
  const guidanceStart = appSource.indexOf('function ProviderNavigationGuidanceBanner');
  const sheetStyleStart = appSource.indexOf('function navigationSheetStyle');
  const htmlStart = mapSource.indexOf('function buildTrackingMapHtml');
  const previewStart = mapSource.indexOf('function derivePreviewProviderLocation');
  assert.notEqual(providerNavigationStart, -1);
  assert.notEqual(providerStartServiceStart, -1);
  assert.notEqual(guidanceStart, -1);
  assert.notEqual(sheetStyleStart, -1);
  assert.notEqual(htmlStart, -1);
  assert.notEqual(previewStart, -1);

  const providerNavigationSource = appSource.slice(
    providerNavigationStart,
    providerStartServiceStart,
  );
  const guidanceSource = appSource.slice(guidanceStart, sheetStyleStart);
  const htmlSource = mapSource.slice(htmlStart, previewStart);

  assert.match(providerNavigationSource, /mode="navigation"/);
  assert.match(providerNavigationSource, /providerLiveLocation\.location \?\?/);
  assert.match(providerNavigationSource, /ProviderNavigationGuidanceBanner/);
  assert.match(providerNavigationSource, /ProviderNavigationDriveStats/);
  assert.match(guidanceSource, /guidance\.maneuverSymbol/);
  assert.match(guidanceSource, /guidance\.distanceLabel/);
  assert.match(guidanceSource, /Then \{guidance\.nextInstruction\}/);
  assert.match(htmlSource, /isNavigationMode/);
  assert.match(htmlSource, /cameraBearing/);
  assert.match(htmlSource, /pitch: provider && isNavigationMode \? 62 : 0/);
  assert.match(htmlSource, /offset: \[0, 110\]/);
  assert.match(htmlSource, /deriveRouteBearing/);
  assert.doesNotMatch(providerNavigationSource, /Linking\.openURL/);
});

test('provider navigation map allows controlled route inspection', () => {
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const htmlStart = mapSource.indexOf('function buildTrackingMapHtml');
  const previewStart = mapSource.indexOf('function derivePreviewProviderLocation');
  assert.notEqual(htmlStart, -1);
  assert.notEqual(previewStart, -1);

  const htmlSource = mapSource.slice(htmlStart, previewStart);

  assert.match(htmlSource, /interactive: isNavigationMode/);
  assert.match(htmlSource, /id="recenter-control"/);
  assert.match(htmlSource, /id="overview-control"/);
  assert.match(htmlSource, /followProvider/);
  assert.match(htmlSource, /map\.on\('dragstart'/);
  assert.match(htmlSource, /map\.on\('zoomstart'/);
  assert.match(htmlSource, /fitRouteBounds/);
  assert.doesNotMatch(htmlSource, /interactive: true/);
});

test('native tracking map renders APICenter coordinates through Expo Go WebView without Google map config', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
  ) as { dependencies?: Record<string, string> };
  const manifest = JSON.parse(
    readFileSync(join(process.cwd(), 'app.json'), 'utf8'),
  ) as {
    expo?: {
      plugins?: unknown[];
      android?: { config?: Record<string, unknown> };
      ios?: { config?: Record<string, unknown> };
    };
  };
  const nativeMapStart = source.indexOf('function TrackingMapWebView');
  const svgStart = source.indexOf('function TrackingMapSvgPreview');
  assert.notEqual(nativeMapStart, -1);
  assert.notEqual(svgStart, -1);

  const nativeMapSource = source.slice(nativeMapStart, svgStart);

  assert.equal(packageJson.dependencies?.['react-native-webview'], '13.15.0');
  assert.equal(packageJson.dependencies?.['@maplibre/maplibre-react-native'], undefined);
  assert.ok(!manifest.expo?.plugins?.includes('@maplibre/maplibre-react-native'));
  assert.equal(manifest.expo?.android?.config?.googleMaps, undefined);
  assert.equal(manifest.expo?.ios?.config?.googleMapsApiKey, undefined);
  assert.match(nativeMapSource, /<WebView/);
  assert.match(nativeMapSource, /source=\{\{ html: mapHtml \}\}/);
  assert.match(nativeMapSource, /routeGeometry/);
  assert.match(nativeMapSource, /onError=\{\(\) => setMapFailed\(true\)\}/);
  assert.match(nativeMapSource, /onHttpError=\{\(\) => setMapFailed\(true\)\}/);
  assert.doesNotMatch(nativeMapSource, /geocodeAddress/);
  assert.doesNotMatch(nativeMapSource, /reverseGeocode/);
  assert.doesNotMatch(nativeMapSource, /getDirections/);
  assert.doesNotMatch(nativeMapSource, /googleMapsApiKey|androidGoogleMapsApiKey|iosGoogleMapsApiKey|PROVIDER_GOOGLE/);
});

test('expo config cannot preserve stale native MapLibre plugins', () => {
  const configSource = readFileSync(join(process.cwd(), 'app.config.js'), 'utf8');

  assert.match(configSource, /plugins: expoConfig\.plugins \?\? \[\]/);
  assert.doesNotMatch(configSource, /@maplibre\/maplibre-react-native/);
});
