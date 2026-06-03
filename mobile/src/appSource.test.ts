import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('booking form chooses service pins through the APICenter geo gateway', () => {
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
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const addressPreviewStart = mapSource.indexOf('export function AddressVerificationPreview');
  const webViewStart = mapSource.indexOf('function TrackingMapWebView');
  assert.notEqual(addressPreviewStart, -1);
  assert.notEqual(webViewStart, -1);

  const addressPreviewSource = mapSource.slice(addressPreviewStart, webViewStart);

  assert.match(bookingFlowViewModel, /geocodeAddress/);
  assert.match(bookingFlowViewModel, /verifyServiceAddress/);
  assert.match(bookingFormSource, /verifyAddressLabel/);
  assert.match(bookingFormSource, /ServiceLocationPickerMap/);
  assert.match(bookingFormSource, /AddressVerificationPreview/);
  assert.match(bookingFormViewModel, /Choose on map/);
  assert.match(mapSource, /export function ServiceLocationPickerMap/);
  assert.match(mapSource, /postMessage\(payload\)/);
  assert.match(addressPreviewSource, /addressTrackingMapFrame/);
  assert.match(addressPreviewSource, /addressVerificationMapOverlay/);
  assert.match(addressPreviewSource, /Service pin verified/);
  assert.match(addressPreviewSource, /provider=\{null\}/);
  assert.match(addressPreviewSource, /routeGeometry=\{null\}/);
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
  const oauthEnd = source.indexOf('function signOut');
  assert.notEqual(oauthStart, -1);
  assert.notEqual(oauthEnd, -1);

  const oauthSource = source.slice(oauthStart, oauthEnd);

  assert.match(oauthSource, /getGoogleAuthorizationUrl/);
  assert.match(oauthSource, /Linking\.openURL\(authorization\.authorizationUrl\)/);
  assert.doesNotMatch(oauthSource, /WebView/);
});

test('Google auth registration returns to the registration form after APICenter verification', () => {
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const authSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/AuthRegistrationScreen.tsx'),
    'utf8',
  );

  assert.match(authSource, /startGoogleSignIn\(intendedRole, 'registration'\)/);
  assert.match(authSource, /Verify with Google/);
  assert.match(appSource, /type GoogleAuthFlow = 'login' \| 'registration'/);
  assert.match(appSource, /getGoogleAuthState\(intendedRole, flow\)/);
  assert.match(appSource, /customerRegistration/);
  assert.match(appSource, /providerRegistration/);
  assert.match(appSource, /Finish the registration form to create your ServEase account/);
});

test('customer payment flow refreshes server payment state after booking and checkout creation', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const bookingCreatedStart = source.indexOf(
    'function handleBookingCreatedImpl(booking: BookingSummary) {',
  );
  const bookingCreatedEnd = source.indexOf(
    'function refreshProviderBookingTimelineEventsImpl',
    bookingCreatedStart,
  );
  const checkoutStart = source.indexOf('const checkout = await createCheckoutSession');
  const checkoutEnd = source.indexOf('await Linking.openURL(checkout.redirectUrl);', checkoutStart);
  const checkStatusStart = source.indexOf('async function checkSelectedPaymentStatus');
  const checkStatusEnd = source.indexOf('async function collectPayment', checkStatusStart);
  assert.notEqual(bookingCreatedStart, -1);
  assert.notEqual(bookingCreatedEnd, -1);
  assert.notEqual(checkoutStart, -1);
  assert.notEqual(checkoutEnd, -1);
  assert.notEqual(checkStatusStart, -1);
  assert.notEqual(checkStatusEnd, -1);

  const bookingCreatedSource = source.slice(bookingCreatedStart, bookingCreatedEnd);
  const checkoutSource = source.slice(checkoutStart, checkoutEnd);
  const checkStatusSource = source.slice(checkStatusStart, checkStatusEnd);

  assert.match(bookingCreatedSource, /refreshPayments\(\)/);
  assert.match(checkoutSource, /listPayments\(apiOptions\)/);
  assert.match(checkoutSource, /setPayments\(nextPayments\)/);
  assert.match(checkStatusSource, /nextPayment\?\.apicenterCheckoutId/);
  assert.match(checkStatusSource, /reconcilePendingCheckout\(checkout\)/);
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

test('app shell keeps ordinary busy actions local to screens', () => {
  const shellSource = readFileSync(
    join(process.cwd(), 'src/legacy-router/AppShell.tsx'),
    'utf8',
  );

  assert.match(shellSource, /RouteLoadingSurface/);
  assert.match(shellSource, /shouldShowGlobalBusyPill\(busyAction\)/);
  assert.doesNotMatch(shellSource, /styles\.busyPill/);
  assert.doesNotMatch(shellSource, /<ActivityIndicator color=\{palette\.white\}/);
});

test('mobile skeleton loading surfaces stay accessible without exposing decorative blocks', () => {
  const loadingSource = readFileSync(
    join(process.cwd(), 'src/shared/components/LoadingStates.tsx'),
    'utf8',
  );
  const designKitSource = readFileSync(
    join(process.cwd(), 'src/components/DesignKit.tsx'),
    'utf8',
  );

  assert.match(loadingSource, /accessibilityRole="progressbar"/);
  assert.match(loadingSource, /RouteLoadingSurface/);
  assert.match(designKitSource, /accessibilityElementsHidden/);
  assert.match(designKitSource, /importantForAccessibility="no-hide-descendants"/);
  assert.match(designKitSource, /AccessibilityInfo\.isReduceMotionEnabled/);
});

test('customer catalog bootstrap loads full services and provider listings for browsing', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const loadCatalogStart = source.indexOf('async function loadCatalogImpl');
  const loadServicesStart = source.indexOf('async function loadServices', loadCatalogStart);
  assert.notEqual(loadCatalogStart, -1);
  assert.notEqual(loadServicesStart, -1);

  const loadCatalogSource = source.slice(loadCatalogStart, loadServicesStart);

  assert.match(loadCatalogSource, /listCatalogServices\(null,\s*\{ baseUrl: apiBaseUrl \}\)/);
  assert.match(loadCatalogSource, /listProviderListings\(null,\s*\{ baseUrl: apiBaseUrl \}\)/);
});

test('customer auth recovers catalog data before settling on explore', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const signInStart = source.indexOf('async function signIn');
  const signUpStart = source.indexOf('async function signUp', signInStart);
  const passwordResetStart = source.indexOf('async function sendPasswordReset', signUpStart);
  const ensureCatalogStart = source.indexOf('async function ensureCustomerExploreCatalog');
  const loadServicesStart = source.indexOf('async function loadServices', ensureCatalogStart);
  assert.notEqual(signInStart, -1);
  assert.notEqual(signUpStart, -1);
  assert.notEqual(passwordResetStart, -1);
  assert.notEqual(ensureCatalogStart, -1);
  assert.notEqual(loadServicesStart, -1);

  const signInSource = source.slice(signInStart, signUpStart);
  const signUpSource = source.slice(signUpStart, passwordResetStart);
  const ensureCatalogSource = source.slice(ensureCatalogStart, loadServicesStart);

  assert.match(signInSource, /nextRole === 'customer'[\s\S]*ensureCustomerExploreCatalog\(\)/);
  assert.match(signUpSource, /nextRole === 'customer'[\s\S]*ensureCustomerExploreCatalog\(\)/);
  assert.match(ensureCatalogSource, /categories\.length/);
  assert.match(ensureCatalogSource, /services\.length/);
  assert.match(ensureCatalogSource, /loadCatalogImpl\(\)/);
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
  assert.match(customerTrackSource, /Animated\.View/);
  assert.match(customerTrackSource, /useWindowDimensions/);
  assert.match(customerTrackSource, /sheetHeight/);
  assert.match(customerTrackSource, /nearestSheetLevel/);
  assert.match(customerTrackSource, /PanResponder/);
  assert.match(customerTrackSource, /customerSheetPanResponder\.panHandlers/);
  assert.doesNotMatch(customerTrackSource, /sheetLevelControls/);
  assert.doesNotMatch(customerTrackSource, /sheetShortLabel/);
  assert.match(providerNavigationSource, /NavigationSheetHeader/);
  assert.match(providerNavigationSource, /navBottomSheetPeek/);
  assert.match(providerNavigationSource, /navBottomSheetHalf/);
  assert.match(providerNavigationSource, /navBottomSheetExpanded/);
  assert.match(providerNavigationSource, /Animated\.View/);
  assert.match(providerNavigationSource, /useWindowDimensions/);
  assert.match(providerNavigationSource, /navigationSheetHeight/);
  assert.match(providerNavigationSource, /nearestNavigationSheetLevel/);
  assert.match(providerNavigationSource, /PanResponder/);
  assert.match(providerNavigationSource, /providerSheetPanResponder\.panHandlers/);
  assert.match(providerNavigationSource, /ScrollView/);
  assert.match(providerNavigationSource, /providerSheetScrollContent/);
  assert.match(
    providerNavigationSource,
    /<View \{\.\.\.providerSheetPanResponder\.panHandlers\}>[\s\S]*<NavigationSheetHeader/,
  );
  assert.doesNotMatch(
    providerNavigationSource,
    /<Animated\.View[^>]*\{\.\.\.providerSheetPanResponder\.panHandlers\}/,
  );
  assert.doesNotMatch(providerNavigationSource, /sheetLevelControls/);
  assert.doesNotMatch(providerNavigationSource, /navigationSheetShortLabel/);
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
  assert.match(previewSource, /hasMapLocation = Boolean\(destination \|\| visibleProvider\)/);
  assert.match(previewSource, /buildTrackingMapHtml\(\s*visibleProvider,\s*destination,\s*routeGeometry,\s*\{/);
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
  assert.match(
    providerNavigationSource,
    /ProviderNavigationGuidanceBanner[\s\S]*onPress=\{\(\) => onSheetLevelChange\('expanded'\)\}/,
  );
  assert.match(providerNavigationSource, /ProviderNavigationDriveStats/);
  assert.match(
    providerNavigationViewModelSource,
    /liveLocation\.location\s*\?\?\s*fallbackOrigin\s*\?\?\s*tracking\?\.providerLocation\s*\?\?\s*null/,
  );
  assert.match(providerNavigationViewModelSource, /providerNavigationGuidance/);
  assert.match(providerNavigationViewModelSource, /directions\?\.steps \?\? \[\]/);
  assert.doesNotMatch(providerNavigationViewModelSource, /slice\(0, 3\)/);
  assert.match(guidanceSource, /guidance\.maneuverSymbol/);
  assert.match(guidanceSource, /guidance\.distanceLabel/);
  assert.match(guidanceSource, /Then \{guidance\.nextInstruction\}/);
  assert.match(guidanceSource, /Pressable/);
  assert.match(guidanceSource, /onPress=\{onPress\}/);
  assert.match(guidanceSource, /Show detailed turn-by-turn directions/);
  assert.match(htmlSource, /isNavigationMode/);
  assert.match(htmlSource, /cameraBearing/);
  assert.match(htmlSource, /pitch: provider && isNavigationMode \? 62 : 0/);
  assert.match(htmlSource, /offset: \[0, 110\]/);
  assert.match(htmlSource, /deriveRouteBearing/);
  assert.doesNotMatch(appNavigationSource, /Linking\.openURL/);
  assert.doesNotMatch(providerNavigationSource, /Linking\.openURL/);
});

test('customer tracking uses the provider navigation map mode with route geometry', () => {
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
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
  const customerTrackStart = appSource.indexOf('function renderCustomerTrackServiceProvider');
  const manageBookingStart = appSource.indexOf('function renderManageBooking');
  const customerRouteStart = appSource.indexOf('async function refreshCustomerTrackingRouteImpl');
  const providerRouteStart = appSource.indexOf('async function refreshProviderDirectionsImpl');
  assert.notEqual(customerTrackStart, -1);
  assert.notEqual(manageBookingStart, -1);
  assert.notEqual(customerRouteStart, -1);
  assert.notEqual(providerRouteStart, -1);

  const renderSource = appSource.slice(customerTrackStart, manageBookingStart);
  const routeSource = appSource.slice(customerRouteStart, providerRouteStart);

  assert.match(renderSource, /directions=\{selectedBookingDirections\}/);
  assert.match(renderSource, /navigationRouteLoading=\{navigationRouteLoading\}/);
  assert.match(customerTrackSource, /mode="navigation"/);
  assert.match(customerTrackSource, /directions=\{directions\}/);
  assert.match(customerTrackSource, /navigationOrigin=\{data\.navigationOrigin\}/);
  assert.match(customerTrackSource, /CustomerTrackingRouteStats/);
  assert.match(customerTrackViewModelSource, /customerDirectionsLabel/);
  assert.match(customerTrackViewModelSource, /navigationOrigin/);
  assert.match(routeSource, /tracking\.providerLocation/);
  assert.match(routeSource, /getDirections/);
  assert.doesNotMatch(routeSource, /getCurrentNavigationLocation/);
});

test('customer tracking map labels provider and destination markers', () => {
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
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const htmlStart = mapSource.indexOf('function buildTrackingMapHtml');
  const previewStart = mapSource.indexOf('function derivePreviewProviderLocation');
  const svgStart = mapSource.indexOf('function TrackingMapSvgPreview');
  const htmlSource = mapSource.slice(htmlStart, previewStart);
  const svgSource = mapSource.slice(svgStart, htmlStart);

  assert.match(customerTrackSource, /providerMarkerLabel="Provider"/);
  assert.match(customerTrackSource, /destinationMarkerLabel=\{data\.destinationMarkerLabel\}/);
  assert.match(customerTrackViewModelSource, /Confirmed service pin/);
  assert.match(customerTrackViewModelSource, /Service address/);
  assert.match(htmlSource, /provider-location-label/);
  assert.match(htmlSource, /destinationMarkerLabel/);
  assert.match(htmlSource, /data-label/);
  assert.match(svgSource, /SvgMarkerLabel/);
  assert.match(svgSource, /providerLabel/);
  assert.match(svgSource, /destinationLabel/);
});

test('provider navigation uses the same map-bound origin marker as customer tracking', () => {
  const providerNavigationSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-navigation-mode/views/ProviderNavigationMode.tsx',
    ),
    'utf8',
  );
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const previewStart = mapSource.indexOf('export function TrackingMapPreview');
  const addressStart = mapSource.indexOf('export function AddressVerificationPreview');
  assert.notEqual(previewStart, -1);
  assert.notEqual(addressStart, -1);

  const previewSource = mapSource.slice(previewStart, addressStart);

  assert.match(providerNavigationSource, /providerMarkerLabel="You"/);
  assert.match(previewSource, /mode === 'navigation'/);
  assert.match(previewSource, /trackingMapNavigationLegend/);
  assert.match(previewSource, /resolvedProviderMarkerLabel/);
  assert.match(previewSource, /destinationMarkerLabel/);
  assert.doesNotMatch(providerNavigationSource, /showNavigationOriginPuck/);
  assert.doesNotMatch(previewSource, /trackingMapNavigationOriginPuck/);
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
  assert.match(nativeMapSource, /destination: TrackingMapLocation \| null/);
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

test('tracking map can render provider location before destination coordinates exist', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );
  const previewStart = source.indexOf('export function TrackingMapPreview');
  const htmlStart = source.indexOf('function buildTrackingMapHtml');
  const providerUpdateStart = source.indexOf('function buildProviderLocationUpdateScript');
  assert.notEqual(previewStart, -1);
  assert.notEqual(htmlStart, -1);
  assert.notEqual(providerUpdateStart, -1);

  const previewSource = source.slice(previewStart, htmlStart);
  const htmlSource = source.slice(htmlStart, providerUpdateStart);

  assert.match(previewSource, /hasMapLocation \? \(/);
  assert.match(htmlSource, /destination: TrackingMapLocation \| null/);
  assert.match(htmlSource, /destinationCoordinate = destination/);
  assert.match(htmlSource, /center: provider && isNavigationMode \? provider : destination \|\| provider/);
  assert.match(htmlSource, /if \(destination\) \{/);
  assert.match(htmlSource, /provider && destination \? \[provider, destination\] : null/);
});

test('expo config cannot preserve stale native MapLibre plugins', () => {
  const configSource = readFileSync(join(process.cwd(), 'app.config.js'), 'utf8');

  assert.match(configSource, /plugins: expoConfig\.plugins \?\? \[\]/);
  assert.doesNotMatch(configSource, /@maplibre\/maplibre-react-native/);
});
