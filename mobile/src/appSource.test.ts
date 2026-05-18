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
  const trackingCardStart = source.indexOf('trackingMapCard: {');
  assert.notEqual(mapCanvasStart, -1);
  assert.notEqual(trackingCardStart, -1);

  const mapCanvasSource = source.slice(mapCanvasStart, trackingCardStart);

  assert.match(mapCanvasSource, /StyleSheet\.absoluteFillObject/);
  assert.doesNotMatch(mapCanvasSource, /position: 'relative'/);
});

test('tracking map uses MapLibre with OpenFreeMap on phones and keeps fallbacks', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
  const previewStart = source.indexOf('function TrackingMapPreview');
  const htmlStart = source.indexOf('function buildTrackingMapHtml');
  assert.notEqual(previewStart, -1);
  assert.notEqual(htmlStart, -1);

  const previewSource = source.slice(previewStart, htmlStart);

  assert.match(source, /OPENFREEMAP_STYLE_URL = 'https:\/\/tiles\.openfreemap\.org\/styles\/liberty'/);
  assert.match(source, /TurboModuleRegistry\.get\('MLRNCameraModule'\)/);
  assert.match(source, /TurboModuleRegistry\.get\('MLRNMapViewModule'\)/);
  assert.match(source, /require\('@maplibre\/maplibre-react-native'\)/);
  assert.match(previewSource, /TrackingMapNativeView/);
  assert.match(previewSource, /TrackingMapSvgPreview/);
  assert.match(previewSource, /Platform\.OS === 'web'/);
  assert.match(previewSource, /buildTrackingMapHtml\(actualProvider, destination, routeGeometry\)/);
  assert.doesNotMatch(previewSource, /<WebView/);
  assert.doesNotMatch(previewSource, /NativeTrackingMap/);
});

test('native tracking map renders APICenter coordinates without Google map config', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
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
  const nativeMapStart = source.indexOf('function TrackingMapNativeView');
  const svgStart = source.indexOf('function TrackingMapSvgPreview');
  assert.notEqual(nativeMapStart, -1);
  assert.notEqual(svgStart, -1);

  const nativeMapSource = source.slice(nativeMapStart, svgStart);

  assert.equal(packageJson.dependencies?.['@maplibre/maplibre-react-native'], '^11.2.1');
  assert.ok(manifest.expo?.plugins?.includes('@maplibre/maplibre-react-native'));
  assert.equal(manifest.expo?.android?.config?.googleMaps, undefined);
  assert.equal(manifest.expo?.ios?.config?.googleMapsApiKey, undefined);
  assert.match(nativeMapSource, /mapStyle=\{OPENFREEMAP_STYLE_URL\}/);
  assert.match(nativeMapSource, /routeGeometry/);
  assert.match(nativeMapSource, /GeoJSONSource/);
  assert.match(nativeMapSource, /Marker/);
  assert.match(nativeMapSource, /onDidFailLoadingMap=\{\(\) => setMapFailed\(true\)\}/);
  assert.doesNotMatch(nativeMapSource, /geocodeAddress/);
  assert.doesNotMatch(nativeMapSource, /reverseGeocode/);
  assert.doesNotMatch(nativeMapSource, /getDirections/);
  assert.doesNotMatch(nativeMapSource, /googleMapsApiKey|androidGoogleMapsApiKey|iosGoogleMapsApiKey|PROVIDER_GOOGLE/);
});
