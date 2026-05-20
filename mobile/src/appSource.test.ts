import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('booking form verifies service addresses through the APICenter geo gateway', () => {
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const bookingFormSource = readFileSync(
    join(process.cwd(), 'src/features/customer-booking/views/CustomerBookingForm.tsx'),
    'utf8',
  );
  const bookingFormViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFormViewModel.ts',
    ),
    'utf8',
  );

  assert.match(bookingFlowViewModel, /geocodeAddress/);
  assert.match(bookingFlowViewModel, /verifyServiceAddress/);
  assert.match(bookingFormSource, /verifyAddressLabel/);
  assert.match(bookingFormSource, /AddressVerificationPreview/);
  assert.match(bookingFormViewModel, /Verify address/);
});

test('Google auth callback exchanges the APICenter code before returning to password login', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');

  assert.match(source, /exchangeGoogleCode/);
  assert.match(source, /servease:\/\/auth\/google\/callback/);
  assert.match(source, /Google account verified through APICenter/);
});

test('Google auth opens APICenter authorization in the system browser, not WebView', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
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
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
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
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
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

test('tracking screens subscribe to HTTP live tracking before polling fallback', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');

  assert.match(source, /subscribeBookingTrackingSnapshots/);
  assert.match(source, /TRACKING_STREAM_FALLBACK_DELAY_MS/);
  assert.match(source, /TRACKING_FALLBACK_POLL_INTERVAL_MS = 3000/);
  assert.match(source, /subscription\.close\(\)/);
});

test('tracking navigation uses compact collapsible sheet states', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const customerTrackSource = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-track-provider/views/CustomerTrackProvider.tsx',
    ),
    'utf8',
  );
  const customerTrackViewModelSource = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-track-provider/viewModels/useCustomerTrackProviderViewModel.ts',
    ),
    'utf8',
  );
  const providerNavigationSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-navigation-mode/views/ProviderNavigationMode.tsx',
    ),
    'utf8',
  );
  const providerNavigationViewModelSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-navigation-mode/viewModels/useProviderNavigationModeViewModel.ts',
    ),
    'utf8',
  );

  assert.match(
    customerTrackViewModelSource,
    /type CustomerTrackingSheetLevel = 'peek' \| 'half' \| 'expanded'/,
  );
  assert.match(
    providerNavigationViewModelSource,
    /type ProviderNavigationSheetLevel = 'peek' \| 'half' \| 'expanded'/,
  );
  assert.match(source, /useState<CustomerTrackingSheetLevel>\('peek'\)/);
  assert.match(source, /useState<ProviderNavigationSheetLevel>\('peek'\)/);
  assert.match(customerTrackSource, /NavigationSheetHeader/);
  assert.match(customerTrackSource, /navBottomSheetPeek/);
  assert.match(customerTrackSource, /navBottomSheetHalf/);
  assert.match(customerTrackSource, /navBottomSheetExpanded/);
  assert.match(customerTrackSource, /sheetStyle\(sheetLevel\)/);
  assert.match(providerNavigationSource, /NavigationSheetHeader/);
  assert.match(providerNavigationSource, /navBottomSheetPeek/);
  assert.match(providerNavigationSource, /navBottomSheetHalf/);
  assert.match(providerNavigationSource, /navBottomSheetExpanded/);
  assert.match(providerNavigationSource, /navigationSheetStyle\(sheetLevel\)/);
});

test('tracking map canvas remains absolutely filled behind the sheet', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
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
  assert.match(previewSource, /visibleProvider = actualProvider \?\? previewProvider/);
  assert.match(previewSource, /buildTrackingMapHtml\(visibleProvider, destination, routeGeometry, \{/);
  assert.match(previewSource, /provider=\{visibleProvider\}/);
  assert.doesNotMatch(source, /@maplibre\/maplibre-react-native/);
  assert.doesNotMatch(source, /TurboModuleRegistry|MLRNCameraModule|MLRNMapViewModule/);
  assert.doesNotMatch(previewSource, /NativeTrackingMap/);
});

test('provider navigation uses first-person WebView drive mode', () => {
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const providerNavigationSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-navigation-mode/views/ProviderNavigationMode.tsx',
    ),
    'utf8',
  );
  const providerNavigationViewModelSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-navigation-mode/viewModels/useProviderNavigationModeViewModel.ts',
    ),
    'utf8',
  );
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const appNavigationStart = appSource.indexOf('function renderProviderNavigationMode');
  const providerStartServiceStart = appSource.indexOf('function renderProviderStartService');
  const guidanceStart = providerNavigationSource.indexOf(
    'function ProviderNavigationGuidanceBanner',
  );
  const sheetStyleStart = providerNavigationSource.indexOf('function navigationSheetStyle');
  const htmlStart = mapSource.indexOf('function buildTrackingMapHtml');
  const previewStart = mapSource.indexOf('function derivePreviewProviderLocation');
  assert.notEqual(appNavigationStart, -1);
  assert.notEqual(providerStartServiceStart, -1);
  assert.notEqual(guidanceStart, -1);
  assert.notEqual(sheetStyleStart, -1);
  assert.notEqual(htmlStart, -1);
  assert.notEqual(previewStart, -1);

  const appNavigationSource = appSource.slice(
    appNavigationStart,
    providerStartServiceStart,
  );
  const guidanceSource = providerNavigationSource.slice(guidanceStart, sheetStyleStart);
  const htmlSource = mapSource.slice(htmlStart, previewStart);

  assert.match(appNavigationSource, /ProviderNavigationModeScreen/);
  assert.match(providerNavigationSource, /mode="navigation"/);
  assert.match(providerNavigationSource, /navigationOrigin=\{data\.navigationOrigin\}/);
  assert.match(providerNavigationSource, /ProviderNavigationGuidanceBanner/);
  assert.match(providerNavigationSource, /ProviderNavigationDriveStats/);
  assert.match(
    providerNavigationViewModelSource,
    /liveLocation\.location\s*\?\?\s*fallbackOrigin\s*\?\?\s*tracking\?\.providerLocation\s*\?\?\s*null/,
  );
  assert.match(providerNavigationViewModelSource, /providerNavigationGuidance/);
  assert.match(guidanceSource, /guidance\.maneuverSymbol/);
  assert.match(guidanceSource, /guidance\.distanceLabel/);
  assert.match(guidanceSource, /Then \{guidance\.nextInstruction\}/);
  assert.match(htmlSource, /isNavigationMode/);
  assert.match(htmlSource, /cameraBearing/);
  assert.match(htmlSource, /pitch: provider && isNavigationMode \? 62 : 0/);
  assert.match(htmlSource, /offset: \[0, 110\]/);
  assert.match(htmlSource, /deriveRouteBearing/);
  assert.doesNotMatch(appNavigationSource, /Linking\.openURL/);
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

test('provider navigation map allows manual rotation with orientation reset', () => {
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const htmlStart = mapSource.indexOf('function buildTrackingMapHtml');
  const previewStart = mapSource.indexOf('function derivePreviewProviderLocation');
  assert.notEqual(htmlStart, -1);
  assert.notEqual(previewStart, -1);

  const htmlSource = mapSource.slice(htmlStart, previewStart);

  assert.match(htmlSource, /id="orientation-control"/);
  assert.match(htmlSource, /map\.on\('rotatestart'/);
  assert.match(htmlSource, /resetOrientation/);
  assert.match(htmlSource, /orientationControl\.hidden = false/);
  assert.match(htmlSource, /touchZoomRotate\.enable/);
  assert.match(htmlSource, /bearing: cameraBearing/);
  assert.match(htmlSource, /pitch: 62/);
  assert.doesNotMatch(htmlSource, /touchZoomRotate\.disableRotation/);
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
  assert.match(nativeMapSource, /injectJavaScript/);
  assert.match(source, /pendingTrackingUpdate/);
  assert.match(source, /applyTrackingUpdate/);
  assert.match(source, /provider-marker::after/);
  assert.match(source, /id: 'provider-location-ring'/);
  assert.match(source, /id: 'provider-location-dot'/);
  assert.match(source, /id: 'provider-location-arrow'/);
  assert.match(source, /addOrUpdateProviderIndicator/);
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
