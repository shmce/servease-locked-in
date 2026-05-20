import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function toProjectPath(path: string): string {
  return relative(process.cwd(), path).split(sep).join('/');
}

function featureViewFiles(): string[] {
  const root = join(process.cwd(), 'src/features');
  const files: string[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (toProjectPath(fullPath).includes('/views/') && fullPath.endsWith('.tsx')) {
        files.push(toProjectPath(fullPath));
      }
    }
  }

  walk(root);
  return files;
}

function featureViewModelFiles(): string[] {
  const root = join(process.cwd(), 'src/features');
  const files: string[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (
        toProjectPath(fullPath).includes('/viewModels/') &&
        /^use.*ViewModel\.ts$/.test(entry)
      ) {
        files.push(toProjectPath(fullPath));
      }
    }
  }

  walk(root);
  return files;
}

function sourceFiles(): string[] {
  const root = join(process.cwd(), 'src');
  const files: string[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (/\.(ts|tsx)$/.test(entry)) {
        files.push(toProjectPath(fullPath));
      }
    }
  }

  walk(root);
  return files;
}

test('mobile app exposes the MVVM entry and shared model structure', () => {
  assert.equal(existsSync(join(process.cwd(), 'src/main.tsx')), true);
  assert.equal(existsSync(join(process.cwd(), 'src/App.tsx')), true);
  assert.equal(existsSync(join(process.cwd(), 'src/index.css')), true);
  assert.equal(existsSync(join(process.cwd(), 'src/shared/models/types.ts')), true);
  assert.equal(existsSync(join(process.cwd(), 'src/shared/models/apiService.ts')), true);
  assert.equal(existsSync(join(process.cwd(), 'src/shared/hooks')), true);
  assert.equal(existsSync(join(process.cwd(), 'src/shared/utils')), true);
  assert.equal(existsSync(join(process.cwd(), 'src/shared/components')), true);

  const indexSource = readProjectFile('index.ts');
  const mainSource = readProjectFile('src/main.tsx');
  const appSource = readProjectFile('src/App.tsx');
  const modelTypesSource = readProjectFile('src/shared/models/types.ts');
  const modelApiSource = readProjectFile('src/shared/models/apiService.ts');

  assert.match(indexSource, /import '\.\/src\/main'/);
  assert.match(mainSource, /registerRootComponent\(App\)/);
  assert.doesNotMatch(appSource, /from '\.\/screens\//);
  assert.doesNotMatch(modelTypesSource, /from 'react'|react-native/);
  assert.doesNotMatch(modelApiSource, /from 'react'|react-native/);
});

test('feature views depend on shared model types instead of the API model barrel', () => {
  for (const viewPath of featureViewFiles()) {
    const source = readProjectFile(viewPath);

    assert.doesNotMatch(
      source,
      /shared\/models\/apiService/,
      `${viewPath} should import model types from shared/models/types`,
    );
  }
});

test('app source depends on shared models instead of service model barrels', () => {
  const allowedDirectServiceImports = new Set([
    'src/shared/models/apiService.ts',
    'src/shared/models/types.ts',
  ]);

  for (const sourcePath of sourceFiles()) {
    if (allowedDirectServiceImports.has(sourcePath)) {
      continue;
    }

    const source = readProjectFile(sourcePath);
    assert.doesNotMatch(
      source,
      /services\/(serveaseApi|gatewayConfig|supabaseAuth|pushRegistration)/,
      `${sourcePath} should import API functions/types through shared/models`,
    );
  }
});

test('feature view models expose the standard MVVM result shape', () => {
  for (const viewModelPath of featureViewModelFiles()) {
    const source = readProjectFile(viewModelPath);

    assert.match(source, /\bdata\b/, `${viewModelPath} should expose data`);
    assert.match(source, /\bisLoading\b/, `${viewModelPath} should expose isLoading`);
    assert.match(source, /\berror\b/, `${viewModelPath} should expose error`);
  }
});

test('feature view models import interfaces from shared model types', () => {
  const modelTypeNames = [
    'ApiOptions',
    'BookingStatus',
    'BookingSummary',
    'ConversationMessage',
    'ConversationSummary',
    'CurrentUserProfile',
    'CurrentUserSessionSummary',
    'GeoDirectionsRoute',
    'GeoDirectionsStep',
    'GeoRouteLocation',
    'ProviderAvailabilitySchedule',
    'ReferralSummary',
    'UserPreferenceSummary',
  ];

  for (const viewModelPath of featureViewModelFiles()) {
    const source = readProjectFile(viewModelPath);
    const apiImportMatches = source.matchAll(
      /import\s*\{([^}]*)\}\s*from ['"][^'"]*shared\/models\/apiService['"]/g,
    );

    for (const match of apiImportMatches) {
      const importedNames = match[1];
      for (const typeName of modelTypeNames) {
        assert.doesNotMatch(
          importedNames,
          new RegExp(`\\b${typeName}\\b`),
          `${viewModelPath} should import ${typeName} from shared/models/types`,
        );
      }
    }
  }
});

test('app shell imports model interfaces from shared model types', () => {
  const appSource = readProjectFile('src/App.tsx');
  const apiImportMatches = appSource.matchAll(
    /import\s*\{([^}]*)\}\s*from ['"]\.\/shared\/models\/apiService['"]/g,
  );
  const modelTypeNames = [
    'AuthSession',
    'BookingStatus',
    'BookingSummary',
    'CatalogCategory',
    'ConversationSummary',
    'CurrentUserProfile',
    'GeoAddressResult',
    'PaymentSummary',
    'ProviderAvailabilitySchedule',
    'ProviderOwnedServiceInput',
    'SharedPaymentMethod',
    'UploadSummary',
  ];

  assert.match(appSource, /from ['"]\.\/shared\/models\/types['"]/);

  for (const match of apiImportMatches) {
    const importedNames = match[1];
    for (const typeName of modelTypeNames) {
      assert.doesNotMatch(
        importedNames,
        new RegExp(`\\b${typeName}\\b`),
        `App.tsx should import ${typeName} from shared/models/types`,
      );
    }
  }
});

test('app shell lazy-loads feature page components', () => {
  const appSource = readProjectFile('src/App.tsx');
  const appShellSource = readProjectFile('src/app/AppShell.tsx');

  assert.match(appSource, /\blazy\(/);
  assert.match(appShellSource, /\bSuspense\b/);
  assert.doesNotMatch(
    appSource,
    /import\s*\{[^}]*Screen[^}]*\}\s*from ['"]\.\/features\/[^'"]*\/views\//,
  );
});

test('app shell delegates route framing to the app router', () => {
  const appSource = readProjectFile('src/App.tsx');
  const routerSource = readProjectFile('src/app/AppRouter.tsx');

  assert.match(appSource, /<AppRouter/);
  assert.match(appSource, /<AppShell/);
  assert.doesNotMatch(appSource, /BottomNavigation|PhoneFrame|StatusStrip/);
  assert.match(routerSource, /function CustomerRouteFrame/);
  assert.match(routerSource, /function ProviderRouteFrame/);
  assert.match(routerSource, /label: 'Calendar'/);
});

test('app shell delegates display notice formatting to domain helpers', () => {
  const appSource = readProjectFile('src/App.tsx');
  const bookingFlowSource = readProjectFile(
    'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
  );
  const domainSource = readProjectFile('src/domain/booking.ts');

  assert.doesNotMatch(appSource, /formatMoney/);
  assert.doesNotMatch(appSource, /\.toFixed\(4\)/);
  assert.match(bookingFlowSource, /promotionNotice/);
  assert.match(bookingFlowSource, /addressVerifiedNotice/);
  assert.match(appSource, /paymentNotice/);
  assert.match(domainSource, /function promotionNotice/);
  assert.match(domainSource, /function addressVerifiedNotice/);
  assert.match(domainSource, /function paymentNotice/);
});

test('app shell avoids simple lint-warning patterns', () => {
  const appSource = readProjectFile('src/App.tsx');

  assert.doesNotMatch(appSource, /setApiBaseUrl|setSupabaseUrl|setPublishableKey/);
  assert.doesNotMatch(appSource, /Array<\{ remove: \(\) => void \}>/);
});

test('app shell stabilizes effect callbacks instead of omitting hook dependencies', () => {
  const appSource = readProjectFile('src/App.tsx');
  const hookSource = readProjectFile('src/shared/hooks/useStableCallback.ts');
  const callbackNames = [
    'loadCatalog',
    'completeGoogleSignIn',
    'reconcilePendingCheckout',
    'routeFromNotificationPayload',
    'refreshBookingTracking',
    'refreshProviderDirections',
  ];

  assert.doesNotMatch(
    appSource,
    /eslint-disable-next-line react-hooks\/exhaustive-deps/,
  );
  assert.match(appSource, /useStableCallback/);

  for (const callbackName of callbackNames) {
    assert.match(
      appSource,
      new RegExp(`const ${callbackName} = useStableCallback`),
    );
    assert.doesNotMatch(
      appSource,
      new RegExp(`function ${callbackName}\\b`),
    );
  }

  assert.match(hookSource, /useRef/);
  assert.match(hookSource, /useEffect/);
  assert.match(hookSource, /useMemo/);

  const notificationsFlowSource = readProjectFile(
    'src/features/notifications/viewModels/useNotificationsFlowViewModel.ts',
  );
  assert.match(appSource, /useNotificationsFlowViewModel/);
  assert.match(notificationsFlowSource, /markNotificationRead/);
  assert.match(notificationsFlowSource, /useCallback/);
});

test('tracking map preview keeps webview update callbacks hook-safe', () => {
  const source = readProjectFile('src/tracking/TrackingMapPreview.tsx');

  assert.match(source, /useCallback/);
  assert.match(source, /const injectProviderUpdate = useCallback/);
  assert.match(source, /onLoadEnd=\{injectProviderUpdate\}/);
  assert.doesNotMatch(
    source,
    /eslint-disable-next-line react-hooks\/exhaustive-deps/,
  );
});

test('mobile quality gates enforce the required coverage threshold', () => {
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    scripts: Record<string, string>;
  };
  const workflowSource = readProjectFile('../.github/workflows/production-readiness.yml');
  const preflightSource = readProjectFile('../scripts/production-preflight.mjs');
  const coverageScriptPath = 'scripts/run-tests-with-coverage.mjs';
  const coverageRunnerSource = readProjectFile(coverageScriptPath);

  assert.equal(packageJson.scripts['test:cov'], `node ${coverageScriptPath}`);
  assert.match(coverageRunnerSource, /MINIMUM_COVERAGE_PERCENT = 80/);
  assert.match(coverageRunnerSource, /--experimental-test-coverage/);
  assert.match(coverageRunnerSource, /all files/);
  assert.match(
    workflowSource,
    /working-directory: mobile[\s\S]*npm run typecheck[\s\S]*npm run lint[\s\S]*npm run test:cov/,
  );
  assert.match(
    preflightSource,
    /name: 'mobile'[\s\S]*\['npm', \['run', 'test:cov'\]\]/,
  );
});

test('mobile promotion gates declare e2e performance and native artifact checks', () => {
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    scripts: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const readinessWorkflow = readProjectFile('../.github/workflows/production-readiness.yml');
  const releaseWorkflow = readProjectFile('../.github/workflows/production-release.yml');
  const easJson = JSON.parse(readProjectFile('eas.json')) as {
    build: Record<string, { android?: { buildType?: string }; ios?: { simulator?: boolean } }>;
  };

  assert.equal(packageJson.scripts['e2e:ios'], 'detox test --configuration ios.sim.debug');
  assert.equal(
    packageJson.scripts['e2e:android'],
    'detox test --configuration android.emu.debug',
  );
  assert.equal(packageJson.scripts['perf:k6'], 'k6 run tests/performance/mobile-smoke.js');
  assert.match(packageJson.devDependencies?.detox ?? '', /\d/);
  assert.equal(existsSync(join(process.cwd(), '.detoxrc.js')), true);
  assert.equal(existsSync(join(process.cwd(), 'e2e/servease.e2e.js')), true);
  assert.equal(existsSync(join(process.cwd(), 'tests/performance/mobile-smoke.js')), true);

  assert.match(readinessWorkflow, /branches: \[test, uat, main\]/);
  assert.match(readinessWorkflow, /mobile-promotion-gates:/);
  assert.match(readinessWorkflow, /grafana\/setup-k6-action/);
  assert.match(readinessWorkflow, /npm run perf:k6/);
  assert.match(readinessWorkflow, /npm run e2e:android/);
  assert.match(readinessWorkflow, /MOBILE_SINGLE_SYSTEMS_JSON/);
  assert.match(readinessWorkflow, /MOBILE_MULTI_SYSTEMS_JSON/);

  assert.match(releaseWorkflow, /Verify EAS production artifact expectations/);
  assert.equal(easJson.build['production-apk']?.android?.buildType, 'apk');
  assert.equal(easJson.build['production-ios-simulator']?.ios?.simulator, true);
  assert.match(
    releaseWorkflow,
    /eas-cli build --platform android --profile production-apk --non-interactive --wait/,
  );
  assert.match(
    releaseWorkflow,
    /eas-cli build --platform ios --profile production-ios-simulator --non-interactive --wait/,
  );
  assert.match(
    releaseWorkflow,
    /verify-eas-artifact-metadata\.mjs android-apk-artifact\.json android \.apk/,
  );
  assert.match(
    releaseWorkflow,
    /verify-eas-artifact-metadata\.mjs ios-app-artifact\.json ios \.app\.zip/,
  );
});

test('provider home follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-home/views/ProviderHome.tsx';
  const viewModelPath =
    'src/features/provider-home/viewModels/useProviderHomeViewModel.ts';
  const screenSource = readProjectFile('src/screens/ProviderHomeScreen.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(screenSource, /features\/provider-home\/views\/ProviderHome/);
  assert.match(viewSource, /useProviderHomeViewModel/);
  assert.match(viewSource, /ProviderApplicationBanner/);
  assert.doesNotMatch(screenSource, /renderProviderApplicationBanner/);
  assert.doesNotMatch(viewSource, /buildProviderHomeViewModel/);
  assert.doesNotMatch(viewSource, /formatMoney|toLocaleDateString|toFixed/);
  assert.doesNotMatch(viewSource, /providerDashboard\?\.summary\.overallRating/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /buildProviderHomeViewModel/);
  assert.match(viewModelSource, /useMemo/);
  assert.match(viewModelSource, /businessName/);
  assert.match(viewModelSource, /todayEarningsLabel/);
  assert.match(viewModelSource, /ratingLabel/);
});

test('provider application banner follows provider-home MVVM boundaries', () => {
  const appSource = readProjectFile('src/App.tsx');
  const viewPath = 'src/features/provider-home/views/ProviderApplicationBanner.tsx';
  const viewModelPath =
    'src/features/provider-home/viewModels/useProviderApplicationBannerViewModel.ts';
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.doesNotMatch(appSource, /renderProviderApplicationBanner/);
  assert.match(viewSource, /useProviderApplicationBannerViewModel/);
  assert.doesNotMatch(viewSource, /latestDecisionReason|verificationStatus/);
  assert.doesNotMatch(viewSource, /formatDateTime|services\/serveaseApi/);
  assert.match(viewModelSource, /applicationStatus/);
  assert.match(viewModelSource, /latestDecisionAtLabel/);
  assert.match(viewModelSource, /formatDateTime/);
});

test('provider bookings follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-bookings/views/ProviderBookings.tsx';
  const viewModelPath =
    'src/features/provider-bookings/viewModels/useProviderBookingsViewModel.ts';
  const screenSource = readProjectFile('src/screens/ProviderBookingsScreen.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(screenSource, /features\/provider-bookings\/views\/ProviderBookings/);
  assert.match(viewSource, /useProviderBookingsViewModel/);
  assert.doesNotMatch(viewSource, /filterProviderBookings/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /filterProviderBookings/);
  assert.match(viewModelSource, /useMemo/);
});

test('provider booking detail follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-booking-detail/views/ProviderBookingDetail.tsx';
  const viewModelPath =
    'src/features/provider-booking-detail/viewModels/useProviderBookingDetailViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderBookingDetailScreen/);
  assert.match(viewSource, /useProviderBookingDetailViewModel/);
  assert.doesNotMatch(viewSource, /formatDateTime|formatMoney|formatBookingDuration/);
  assert.doesNotMatch(viewSource, /bookingStatusChip|pricingModeLabel|timelineForStatus/);
  assert.doesNotMatch(viewSource, /selectedBooking\.status|services\/serveaseApi/);
  assert.match(viewModelSource, /formatDateTime/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /formatBookingDuration/);
  assert.match(viewModelSource, /bookingStatusChip/);
  assert.match(viewModelSource, /timelineForStatus/);
  assert.match(viewModelSource, /statusActions/);
  assert.match(viewModelSource, /estimatedEarningsLabel/);
});

test('provider calendar follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-calendar/views/ProviderCalendar.tsx';
  const viewModelPath =
    'src/features/provider-calendar/viewModels/useProviderCalendarViewModel.ts';
  const screenSource = readProjectFile('src/screens/ProviderCalendarScreen.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(screenSource, /features\/provider-calendar\/views\/ProviderCalendar/);
  assert.match(viewSource, /useProviderCalendarViewModel/);
  assert.doesNotMatch(viewSource, /getProviderAvailability/);
  assert.doesNotMatch(viewSource, /formatDateTime|booking\.status\.replace/);
  assert.doesNotMatch(viewSource, /booking\.serviceTitle|booking\.scheduledAt/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /getProviderAvailability/);
  assert.match(viewModelSource, /useEffect/);
  assert.match(viewModelSource, /calendarMarkers/);
  assert.match(viewModelSource, /upcomingRows/);
  assert.match(viewModelSource, /scheduledAtLabel/);
  assert.match(viewModelSource, /statusLabel/);
});

test('customer calendar follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-calendar/views/CustomerCalendar.tsx';
  const viewModelPath =
    'src/features/customer-calendar/viewModels/useCustomerCalendarViewModel.ts';
  const screenSource = readProjectFile('src/screens/CustomerCalendarScreen.tsx');
  const appSource = readProjectFile('src/App.tsx');
  const routeSource = readProjectFile('src/navigation/types.ts');
  const routeHelpersSource = readProjectFile('src/navigation/routeHelpers.ts');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(screenSource, /features\/customer-calendar\/views\/CustomerCalendar/);
  assert.match(appSource, /renderCustomerCalendar/);
  assert.match(routeSource, /CustomerTab = 'explore' \| 'bookings' \| 'calendar'/);
  assert.match(routeHelpersSource, /screen === 'calendar'/);
  assert.match(viewSource, /useCustomerCalendarViewModel/);
  assert.match(viewSource, /PrimaryButton/);
  assert.match(viewSource, /MonthCalendar/);
  assert.match(viewSource, /markers=\{calendar\.data\.calendarMarkers\}/);
  assert.match(viewSource, /calendar\.refreshBookings/);
  assert.doesNotMatch(viewSource, /BookingCard/);
  assert.doesNotMatch(viewSource, /getProviderAvailability|daysOff|timeOffWindows/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(appSource, /onRefresh=\{refreshWorkspace\}/);
  assert.match(viewModelSource, /activeBookingsByDate/);
  assert.match(viewModelSource, /calendarMarkers/);
  assert.match(viewModelSource, /refreshBookings/);
  assert.match(viewModelSource, /setIsLoading/);
  assert.match(viewModelSource, /selectedDateBookings/);
});

test('provider set availability follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-set-availability/views/ProviderSetAvailability.tsx';
  const viewModelPath =
    'src/features/provider-set-availability/viewModels/useProviderSetAvailabilityViewModel.ts';
  const screenSource = readProjectFile('src/screens/ProviderSetAvailabilityScreen.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(
    screenSource,
    /features\/provider-set-availability\/views\/ProviderSetAvailability/,
  );
  assert.match(viewSource, /useProviderSetAvailabilityViewModel/);
  assert.doesNotMatch(viewSource, /addProviderDayOff/);
  assert.doesNotMatch(viewSource, /removeProviderTimeOffWindow/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /addProviderDayOff/);
  assert.match(viewModelSource, /removeProviderTimeOffWindow/);
  assert.match(viewModelSource, /mapAvailabilityError/);
});

test('customer booking schedule follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-booking/views/CustomerBookingSchedulePicker.tsx';
  const formViewPath = 'src/features/customer-booking/views/CustomerBookingForm.tsx';
  const viewModelPath =
    'src/features/customer-booking/viewModels/useCustomerBookingViewModel.ts';
  const formViewSource = readProjectFile(formViewPath);
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(formViewSource, /CustomerBookingSchedulePicker/);
  assert.match(viewSource, /useCustomerBookingViewModel/);
  assert.doesNotMatch(viewSource, /buildCustomerBookingAvailability/);
  assert.doesNotMatch(viewSource, /buildCustomerBookingCalendarState/);
  assert.match(viewModelSource, /buildCustomerBookingAvailability/);
  assert.match(viewModelSource, /buildCustomerBookingCalendarState/);
  assert.match(viewModelSource, /calendarMarkers/);
});

test('customer booking form follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-booking/views/CustomerBookingForm.tsx';
  const viewModelPath =
    'src/features/customer-booking/viewModels/useCustomerBookingFormViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerBookingFormScreen/);
  assert.match(viewSource, /useCustomerBookingFormViewModel/);
  assert.doesNotMatch(viewSource, /buildCustomerBookingViewModel|formatMoney/);
  assert.doesNotMatch(viewSource, /missingFields|selectedProvider\.price/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /buildCustomerBookingViewModel/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /missingFields/);
  assert.match(viewModelSource, /estimatedTotalLabel/);
});

test('customer booking review follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-booking/views/CustomerBookingReview.tsx';
  const viewModelPath =
    'src/features/customer-booking/viewModels/useCustomerBookingReviewViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerBookingReviewScreen/);
  assert.match(viewSource, /useCustomerBookingReviewViewModel/);
  assert.doesNotMatch(viewSource, /pricingQuote\?\.estimatedTotal|formatMoney|toManilaBookingIso/);
  assert.doesNotMatch(viewSource, /pricingFairnessLabel|pricingConfidenceLabel/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /pricingQuote\?\.estimatedTotal/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /toManilaBookingIso/);
  assert.match(viewModelSource, /priceBreakdownRows/);
});

test('customer more follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-more/views/CustomerMore.tsx';
  const viewModelPath =
    'src/features/customer-more/viewModels/useCustomerMoreViewModel.ts';
  const screenSource = readProjectFile('src/screens/CustomerMoreScreen.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(screenSource, /features\/customer-more\/views\/CustomerMore/);
  assert.match(viewSource, /useCustomerMoreViewModel/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /displayName/);
  assert.match(viewModelSource, /menuItems/);
});

test('customer explore follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-explore/views/CustomerExplore.tsx';
  const viewModelPath =
    'src/features/customer-explore/viewModels/useCustomerExploreViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerExploreScreen/);
  assert.doesNotMatch(appSource, /function renderExplore/);
  assert.doesNotMatch(appSource, /completedRebookOptions/);
  assert.match(viewSource, /useCustomerExploreViewModel/);
  assert.doesNotMatch(viewSource, /formatMoney|formatDateTime|completedRebookOptions/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /completedRebookOptions/);
  assert.match(viewModelSource, /guideSteps/);
  assert.match(viewModelSource, /bookAgainRows/);
  assert.match(viewModelSource, /serviceRows/);
  assert.match(viewModelSource, /providerRows/);
});

test('auth screens follow feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/auth/views/AuthScreens.tsx';
  const viewModelPath = 'src/features/auth/viewModels/useAuthViewModel.ts';
  const screenSource = readProjectFile('src/screens/AuthScreens.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(screenSource, /features\/auth\/views\/AuthScreens/);
  assert.match(viewSource, /useAuthViewModel/);
  assert.match(viewModelSource, /loginMethod/);
  assert.match(viewModelSource, /phoneOtpId/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
});

test('customer settings follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-settings/views/CustomerSettings.tsx';
  const viewModelPath =
    'src/features/customer-settings/viewModels/useCustomerSettingsViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);
  const sharedTwoFactorSource = readProjectFile(
    'src/shared/components/TwoFactorSettingsCard.tsx',
  );

  assert.match(appSource, /CustomerSettingsScreen/);
  assert.match(viewSource, /useCustomerSettingsViewModel/);
  assert.match(viewSource, /TwoFactorSettingsCard/);
  assert.doesNotMatch(viewSource, /function TwoFactorSettings/);
  assert.doesNotMatch(viewSource, /new Date|toLocaleString/);
  assert.doesNotMatch(viewSource, /getNotificationCategoryEnabled/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /getNotificationCategoryEnabled/);
  assert.match(viewModelSource, /notificationRows/);
  assert.match(viewModelSource, /activeSessionRows/);
  assert.match(viewModelSource, /lastSignInLabel/);
  assert.match(viewModelSource, /twoFactor/);
  assert.match(sharedTwoFactorSource, /twoFactorEnabled/);
  assert.match(sharedTwoFactorSource, /startTwoFactorSetup/);
});

test('customer service history follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/customer-service-history/views/CustomerServiceHistory.tsx';
  const viewModelPath =
    'src/features/customer-service-history/viewModels/useCustomerServiceHistoryViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerServiceHistoryScreen/);
  assert.match(viewSource, /useCustomerServiceHistoryViewModel/);
  assert.doesNotMatch(viewSource, /booking\.status === 'completed'/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /completedBookings/);
  assert.match(viewModelSource, /booking\.status === 'completed'/);
});

test('customer terms follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-terms/views/CustomerTerms.tsx';
  const viewModelPath =
    'src/features/customer-terms/viewModels/useCustomerTermsViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerTermsScreen/);
  assert.match(viewSource, /useCustomerTermsViewModel/);
  assert.doesNotMatch(viewSource, /Terms of Service/);
  assert.doesNotMatch(viewSource, /Privacy Policy/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /termsSections/);
  assert.match(viewModelSource, /Terms of Service/);
  assert.match(viewModelSource, /Privacy Policy/);
});

test('customer referral follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-referral/views/CustomerReferral.tsx';
  const viewModelPath =
    'src/features/customer-referral/viewModels/useCustomerReferralViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerReferralScreen/);
  assert.match(viewSource, /useCustomerReferralViewModel/);
  assert.doesNotMatch(viewSource, /getReferralSummary/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /getReferralSummary/);
  assert.match(viewModelSource, /refreshReferralSummary/);
  assert.match(viewModelSource, /referralCode/);
});

test('notifications follow feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/notifications/views/Notifications.tsx';
  const viewModelPath =
    'src/features/notifications/viewModels/useNotificationsViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /NotificationsScreen/);
  assert.match(viewSource, /useNotificationsViewModel/);
  assert.doesNotMatch(viewSource, /isInternalTestNotification/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /isInternalTestNotification/);
  assert.match(viewModelSource, /visibleNotifications/);
  assert.match(viewModelSource, /unreadCount/);
});

test('customer payment methods follow feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/customer-payment-methods/views/CustomerPaymentMethods.tsx';
  const viewModelPath =
    'src/features/customer-payment-methods/viewModels/useCustomerPaymentMethodsViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerPaymentMethodsScreen/);
  assert.match(viewSource, /useCustomerPaymentMethodsViewModel/);
  assert.doesNotMatch(viewSource, /paymentMethodMeta/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /paymentMethodMeta/);
  assert.match(viewModelSource, /selectedMethodId/);
  assert.match(viewModelSource, /customer-payment-/);
});

test('customer reserve payment follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-reserve-payment/views/CustomerReservePayment.tsx';
  const viewModelPath =
    'src/features/customer-reserve-payment/viewModels/useCustomerReservePaymentViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerReservePaymentScreen/);
  assert.match(viewSource, /useCustomerReservePaymentViewModel/);
  assert.doesNotMatch(viewSource, /paymentMethodMeta/);
  assert.doesNotMatch(viewSource, /formatMoney/);
  assert.doesNotMatch(viewSource, /promotionValidation\.valid/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /paymentMethodMeta/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /promotionValidation\.valid/);
  assert.match(viewModelSource, /paymentMethods/);
});

test('customer manage booking follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-manage-booking/views/CustomerManageBooking.tsx';
  const viewModelPath =
    'src/features/customer-manage-booking/viewModels/useCustomerManageBookingViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerManageBookingScreen/);
  assert.match(viewSource, /useCustomerManageBookingViewModel/);
  assert.doesNotMatch(viewSource, /status ===|selectedBooking\?\.status/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /isCancellable/);
  assert.match(viewModelSource, /optionRows/);
  assert.match(viewModelSource, /Track Service Provider/);
});

test('customer cancel booking follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-cancel-booking/views/CustomerCancelBooking.tsx';
  const viewModelPath =
    'src/features/customer-cancel-booking/viewModels/useCustomerCancelBookingViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerCancelBookingScreen/);
  assert.match(viewSource, /useCustomerCancelBookingViewModel/);
  assert.doesNotMatch(viewSource, /customerCancelReasons/);
  assert.doesNotMatch(viewSource, /nextBookingStatuses/);
  assert.doesNotMatch(viewSource, /selectedBooking\?\.status/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /customerCancelReasons/);
  assert.match(viewModelSource, /nextBookingStatuses/);
  assert.match(viewModelSource, /canSubmit/);
  assert.match(viewModelSource, /reasonRows/);
});

test('customer report issue follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-report-issue/views/CustomerReportIssue.tsx';
  const viewModelPath =
    'src/features/customer-report-issue/viewModels/useCustomerReportIssueViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerReportIssueScreen/);
  assert.match(viewSource, /useCustomerReportIssueViewModel/);
  assert.doesNotMatch(viewSource, /customerIssueTypes/);
  assert.doesNotMatch(viewSource, /customerResolutionOptions/);
  assert.doesNotMatch(viewSource, /busyAction === 'dispute'/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /customerIssueTypes/);
  assert.match(viewModelSource, /customerResolutionOptions/);
  assert.match(viewModelSource, /canSubmit/);
  assert.match(viewModelSource, /issueTypeRows/);
  assert.match(viewModelSource, /resolutionRows/);
});

test('messages follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/messages/views/Messages.tsx';
  const viewModelPath = 'src/features/messages/viewModels/useMessagesViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /MessagesScreen/);
  assert.match(viewSource, /useMessagesViewModel/);
  assert.doesNotMatch(viewSource, /listConversationMessages/);
  assert.doesNotMatch(viewSource, /conversationTitle|messageSenderLabel|formatDateTime/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /listConversationMessages/);
  assert.match(viewModelSource, /conversationRows/);
  assert.match(viewModelSource, /messageRows/);
  assert.match(viewModelSource, /selectConversation/);
});

test('customer booking detail follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-booking-detail/views/CustomerBookingDetail.tsx';
  const viewModelPath =
    'src/features/customer-booking-detail/viewModels/useCustomerBookingDetailViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerBookingDetailScreen/);
  assert.doesNotMatch(appSource, /renderReviewPanel/);
  assert.match(viewSource, /useCustomerBookingDetailViewModel/);
  assert.match(viewSource, /CustomerBookingReviewPanel/);
  assert.doesNotMatch(viewSource, /formatDateTime|formatMoney|formatBookingDuration/);
  assert.doesNotMatch(viewSource, /bookingStatusChip|pricingModeLabel|timelineForStatus/);
  assert.doesNotMatch(viewSource, /selectedBooking\.status|services\/serveaseApi/);
  assert.match(viewModelSource, /formatDateTime/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /formatBookingDuration/);
  assert.match(viewModelSource, /bookingStatusChip/);
  assert.match(viewModelSource, /timelineForStatus/);
  assert.match(viewModelSource, /serviceDetailRows/);
});

test('customer booking detail review panel follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/customer-booking-detail/views/CustomerBookingReviewPanel.tsx';
  const viewModelPath =
    'src/features/customer-booking-detail/viewModels/useCustomerBookingReviewPanelViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.doesNotMatch(appSource, /function renderReviewPanel/);
  assert.match(viewSource, /useCustomerBookingReviewPanelViewModel/);
  assert.doesNotMatch(viewSource, /selectedReview\.rating|selectedReview\.reviewText/);
  assert.doesNotMatch(viewSource, /busyAction === 'review'|services\/serveaseApi/);
  assert.match(viewModelSource, /selectedReview\?\.rating/);
  assert.match(viewModelSource, /selectedReview\?\.reviewText/);
  assert.match(viewModelSource, /isSubmitDisabled/);
});

test('customer track provider follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-track-provider/views/CustomerTrackProvider.tsx';
  const viewModelPath =
    'src/features/customer-track-provider/viewModels/useCustomerTrackProviderViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerTrackProviderScreen/);
  assert.doesNotMatch(appSource, /function trackingPhaseTitle|function trackingRouteLabel/);
  assert.match(viewSource, /useCustomerTrackProviderViewModel/);
  assert.doesNotMatch(viewSource, /formatDateTime|trackingPhaseTitle|trackingRouteLabel/);
  assert.doesNotMatch(viewSource, /selectedBookingTracking|services\/serveaseApi/);
  assert.match(viewModelSource, /formatDateTime/);
  assert.match(viewModelSource, /trackingPhaseTitle/);
  assert.match(viewModelSource, /trackingRouteLabel/);
  assert.match(viewModelSource, /isHalfSheet/);
});

test('customer profile follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-profile/views/CustomerProfile.tsx';
  const viewModelPath =
    'src/features/customer-profile/viewModels/useCustomerProfileViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerProfileScreen/);
  assert.match(viewSource, /useCustomerProfileViewModel/);
  assert.doesNotMatch(viewSource, /profile\\?\\.user\\.fullName/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /avatarInitial/);
  assert.match(viewModelSource, /isSaving/);
  assert.match(viewModelSource, /emailLabel/);
});

test('help center follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/help-center/views/HelpCenter.tsx';
  const viewModelPath = 'src/features/help-center/viewModels/useHelpCenterViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /HelpCenterScreen/);
  assert.match(viewSource, /useHelpCenterViewModel/);
  assert.doesNotMatch(viewSource, /customerHelpFaqs|providerHelpFaqs/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /customerHelpFaqs/);
  assert.match(viewModelSource, /providerHelpFaqs/);
  assert.match(viewModelSource, /filteredFaq/);
});

test('provider insights follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-insights/views/ProviderInsights.tsx';
  const viewModelPath =
    'src/features/provider-insights/viewModels/useProviderInsightsViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderInsightsScreen/);
  assert.match(viewSource, /useProviderInsightsViewModel/);
  assert.doesNotMatch(viewSource, /new Set|booking\.customerId/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /repeatCustomers/);
  assert.match(viewModelSource, /acceptanceRateLabel/);
  assert.match(viewModelSource, /growthTips/);
});

test('provider cancel booking follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-cancel-booking/views/ProviderCancelBooking.tsx';
  const viewModelPath =
    'src/features/provider-cancel-booking/viewModels/useProviderCancelBookingViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderCancelBookingScreen/);
  assert.match(viewSource, /useProviderCancelBookingViewModel/);
  assert.doesNotMatch(viewSource, /providerCancelReasons/);
  assert.doesNotMatch(viewSource, /busyAction === 'booking-cancelled'/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /providerCancelReasons/);
  assert.match(viewModelSource, /reasonRows/);
  assert.match(viewModelSource, /canSubmit/);
});

test('provider report issue follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-report-issue/views/ProviderReportIssue.tsx';
  const viewModelPath =
    'src/features/provider-report-issue/viewModels/useProviderReportIssueViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderReportIssueScreen/);
  assert.match(viewSource, /useProviderReportIssueViewModel/);
  assert.doesNotMatch(viewSource, /providerReportReason\.trim/);
  assert.doesNotMatch(viewSource, /providerReportDetails\.trim/);
  assert.doesNotMatch(viewSource, /busyAction === 'support'/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /canSubmit/);
  assert.match(viewModelSource, /evidenceLabel/);
});

test('provider service completed follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-service-completed/views/ProviderServiceCompleted.tsx';
  const viewModelPath =
    'src/features/provider-service-completed/viewModels/useProviderServiceCompletedViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderServiceCompletedScreen/);
  assert.match(viewSource, /useProviderServiceCompletedViewModel/);
  assert.doesNotMatch(viewSource, /formatMoney/);
  assert.doesNotMatch(viewSource, /selectedBooking|selectedPayment|services\/serveaseApi/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /earningsLabel/);
  assert.match(viewModelSource, /serviceTitle/);
});

test('provider service receipt follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-service-receipt/views/ProviderServiceReceipt.tsx';
  const viewModelPath =
    'src/features/provider-service-receipt/viewModels/useProviderServiceReceiptViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderServiceReceiptScreen/);
  assert.match(viewSource, /useProviderServiceReceiptViewModel/);
  assert.doesNotMatch(viewSource, /formatDateTime|formatMoney|statusLabel/);
  assert.doesNotMatch(viewSource, /selectedPayment|selectedBooking|services\/serveaseApi/);
  assert.match(viewModelSource, /formatDateTime/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /statusLabel/);
  assert.match(viewModelSource, /receiptRows/);
  assert.match(viewModelSource, /providerPayoutLabel/);
});

test('provider start service follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-start-service/views/ProviderStartService.tsx';
  const viewModelPath =
    'src/features/provider-start-service/viewModels/useProviderStartServiceViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderStartServiceScreen/);
  assert.match(viewSource, /useProviderStartServiceViewModel/);
  assert.doesNotMatch(viewSource, /formatDateTime|Object\.values/);
  assert.doesNotMatch(viewSource, /providerChecklist|providerBeforePhotoUrl|services\/serveaseApi/);
  assert.match(viewModelSource, /formatDateTime/);
  assert.match(viewModelSource, /checklistRows/);
  assert.match(viewModelSource, /canStart/);
  assert.match(viewModelSource, /beforePhotoActionLabel/);
  assert.match(viewModelSource, /startingConditionUploaded/);
});

test('provider complete service follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-complete-service/views/ProviderCompleteService.tsx';
  const viewModelPath =
    'src/features/provider-complete-service/viewModels/useProviderCompleteServiceViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderCompleteServiceScreen/);
  assert.match(viewSource, /useProviderCompleteServiceViewModel/);
  assert.doesNotMatch(viewSource, /formatMoney/);
  assert.doesNotMatch(viewSource, /selectedBooking|selectedPayment|providerCompletionPhotoUrl|services\/serveaseApi/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /summaryRows/);
  assert.match(viewModelSource, /completionPhotoActionLabel/);
  assert.match(viewModelSource, /completionPhotoUploaded/);
  assert.match(viewModelSource, /submitDisabled/);
});

test('provider service in progress follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-service-in-progress/views/ProviderServiceInProgress.tsx';
  const viewModelPath =
    'src/features/provider-service-in-progress/viewModels/useProviderServiceInProgressViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderServiceInProgressScreen/);
  assert.match(viewSource, /useProviderServiceInProgressViewModel/);
  assert.doesNotMatch(viewSource, /formatDateTime|formatElapsedTime|serviceStartedAt/);
  assert.doesNotMatch(viewSource, /providerProgressMessage\.trim|providerProgressPhotoUrl/);
  assert.doesNotMatch(viewSource, /selectedBooking|services\/serveaseApi/);
  assert.match(viewModelSource, /formatDateTime/);
  assert.match(viewModelSource, /formatElapsedTime/);
  assert.match(viewModelSource, /serviceStartedAt/);
  assert.match(viewModelSource, /timerLabel/);
  assert.match(viewModelSource, /progressPhotoActionLabel/);
  assert.match(viewModelSource, /canSendProgressUpdate/);
});

test('provider navigation mode follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-navigation-mode/views/ProviderNavigationMode.tsx';
  const viewModelPath =
    'src/features/provider-navigation-mode/viewModels/useProviderNavigationModeViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderNavigationModeScreen/);
  assert.doesNotMatch(appSource, /function NavigationSheetHeader/);
  assert.doesNotMatch(appSource, /function providerDirectionsLabel/);
  assert.doesNotMatch(appSource, /function providerNavigationGuidance/);
  assert.doesNotMatch(appSource, /function providerLiveLocationStatusLabel/);
  assert.match(viewSource, /useProviderNavigationModeViewModel/);
  assert.doesNotMatch(viewSource, /providerDirectionsLabel|providerNavigationGuidance/);
  assert.doesNotMatch(viewSource, /providerLiveLocationStatusLabel|selectedBookingDirections/);
  assert.doesNotMatch(viewSource, /selectedBookingTracking|services\/serveaseApi/);
  assert.match(viewModelSource, /providerDirectionsLabel/);
  assert.match(viewModelSource, /providerNavigationGuidance/);
  assert.match(viewModelSource, /providerLiveLocationStatusLabel/);
  assert.match(viewModelSource, /routeInstructionRows/);
  assert.match(viewModelSource, /navigationOrigin/);
});

test('provider more follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-more/views/ProviderMore.tsx';
  const viewModelPath =
    'src/features/provider-more/viewModels/useProviderMoreViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderMoreScreen/);
  assert.match(viewSource, /useProviderMoreViewModel/);
  assert.doesNotMatch(viewSource, /providerPayoutManagement/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /providerPayoutManagement/);
  assert.match(viewModelSource, /actionRows/);
});

test('provider security follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-security/views/ProviderSecurity.tsx';
  const viewModelPath =
    'src/features/provider-security/viewModels/useProviderSecurityViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderSecurityScreen/);
  assert.doesNotMatch(appSource, /function renderTwoFactorSettings/);
  assert.match(viewSource, /useProviderSecurityViewModel/);
  assert.match(viewSource, /TwoFactorSettingsCard/);
  assert.doesNotMatch(viewSource, /twoFactorSettings: ReactNode/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /pageTitle/);
  assert.match(viewModelSource, /sectionTitle/);
});

test('provider settings follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-settings/views/ProviderSettings.tsx';
  const viewModelPath =
    'src/features/provider-settings/viewModels/useProviderSettingsViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderSettingsScreen/);
  assert.match(viewSource, /useProviderSettingsViewModel/);
  assert.doesNotMatch(viewSource, /profile\\?\\.providerProfile/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /accountLabel/);
  assert.match(viewModelSource, /deleteButtonLabel/);
  assert.match(viewModelSource, /canConfirmAccountDeletion/);
});

test('provider profile view follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-profile-view/views/ProviderProfileView.tsx';
  const viewModelPath =
    'src/features/provider-profile-view/viewModels/useProviderProfileViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderProfileViewScreen/);
  assert.match(viewSource, /useProviderProfileViewModel/);
  assert.doesNotMatch(viewSource, /profile\\?\\.providerProfile/);
  assert.doesNotMatch(viewSource, /providerPortfolioMedia\.slice/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /businessDisplayName/);
  assert.match(viewModelSource, /portfolioPreview/);
  assert.match(viewModelSource, /reviewCards/);
});

test('provider payout management follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/provider-payout-management/views/ProviderPayoutManagement.tsx';
  const viewModelPath =
    'src/features/provider-payout-management/viewModels/useProviderPayoutManagementViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderPayoutManagementScreen/);
  assert.match(viewSource, /useProviderPayoutManagementViewModel/);
  assert.doesNotMatch(viewSource, /summarizeMonthlyEarnings|formatMoney|formatDateTime/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /summarizeMonthlyEarnings/);
  assert.match(viewModelSource, /nextPayoutDate/);
  assert.match(viewModelSource, /payoutRequests/);
});

test('provider request payout follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-request-payout/views/ProviderRequestPayout.tsx';
  const viewModelPath =
    'src/features/provider-request-payout/viewModels/useProviderRequestPayoutViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderRequestPayoutScreen/);
  assert.match(viewSource, /useProviderRequestPayoutViewModel/);
  assert.doesNotMatch(viewSource, /Number\(requestPayoutAmount\)|formatMoney/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /selectedMethod/);
  assert.match(viewModelSource, /processingFeeLabel/);
  assert.match(viewModelSource, /canSubmit/);
});

test('provider edit profile follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-edit-profile/views/ProviderEditProfile.tsx';
  const viewModelPath =
    'src/features/provider-edit-profile/viewModels/useProviderEditProfileViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderEditProfileScreen/);
  assert.match(viewSource, /useProviderEditProfileViewModel/);
  assert.doesNotMatch(viewSource, /busyAction === 'profile-update'|!profile/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /saveButtonLabel/);
  assert.match(viewModelSource, /canSave/);
});

test('provider services follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-services/views/ProviderServices.tsx';
  const viewModelPath =
    'src/features/provider-services/viewModels/useProviderServicesViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderServicesScreen/);
  assert.match(viewSource, /useProviderServicesViewModel/);
  assert.doesNotMatch(viewSource, /formatMoney|svc\.price|busyAction === `service-toggle/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /serviceRows/);
  assert.match(viewModelSource, /pricingModeOptions/);
});

test('provider portfolio follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/provider-portfolio/views/ProviderPortfolio.tsx';
  const viewModelPath =
    'src/features/provider-portfolio/viewModels/useProviderPortfolioViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /ProviderPortfolioScreen/);
  assert.match(viewSource, /useProviderPortfolioViewModel/);
  assert.doesNotMatch(viewSource, /providerPortfolioMedia\.map|providerPortfolioPhotoUrl/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /uploadLabel/);
  assert.match(viewModelSource, /portfolioItems/);
  assert.match(viewModelSource, /captionSaveDisabled/);
});

test('customer top providers follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-top-providers/views/CustomerTopProviders.tsx';
  const viewModelPath =
    'src/features/customer-top-providers/viewModels/useCustomerTopProvidersViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerTopProvidersScreen/);
  assert.match(viewSource, /useCustomerTopProvidersViewModel/);
  assert.doesNotMatch(viewSource, /providers\.filter|marketplaceSearchQuery\.trim/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /visibleProviders/);
  assert.match(viewModelSource, /providerBusinessName/);
});

test('customer all services follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-all-services/views/CustomerAllServices.tsx';
  const viewModelPath =
    'src/features/customer-all-services/viewModels/useCustomerAllServicesViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerAllServicesScreen/);
  assert.match(viewSource, /useCustomerAllServicesViewModel/);
  assert.doesNotMatch(viewSource, /services\.filter|marketplaceSearchQuery\.trim|formatMoney/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /visibleServices/);
  assert.match(viewModelSource, /formatMoney/);
});

test('customer category follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/customer-category/views/CustomerCategory.tsx';
  const viewModelPath =
    'src/features/customer-category/viewModels/useCustomerCategoryViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerCategoryScreen/);
  assert.match(viewSource, /useCustomerCategoryViewModel/);
  assert.doesNotMatch(viewSource, /categories\.find|services\.length/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /categoryName/);
  assert.match(viewModelSource, /serviceCountLabel/);
});

test('customer provider profile follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/customer-provider-profile/views/CustomerProviderProfile.tsx';
  const viewModelPath =
    'src/features/customer-provider-profile/viewModels/useCustomerProviderProfileViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerProviderProfileScreen/);
  assert.match(viewSource, /useCustomerProviderProfileViewModel/);
  assert.doesNotMatch(viewSource, /selectedProviderPortfolioMedia\.map|selectedProviderAvailability/);
  assert.doesNotMatch(viewSource, /formatMoney|dayLabels/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /dayLabels/);
  assert.match(viewModelSource, /activeAvailabilityWindows/);
});

test('customer booking confirmation follows feature-level MVVM boundaries', () => {
  const viewPath =
    'src/features/customer-booking-confirmation/views/CustomerBookingConfirmation.tsx';
  const viewModelPath =
    'src/features/customer-booking-confirmation/viewModels/useCustomerBookingConfirmationViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /CustomerBookingConfirmationScreen/);
  assert.match(viewSource, /useCustomerBookingConfirmationViewModel/);
  assert.doesNotMatch(viewSource, /formatDateTime|formatMoney|timelineForStatus/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /formatDateTime/);
  assert.match(viewModelSource, /formatMoney/);
  assert.match(viewModelSource, /timelineForStatus/);
});

test('bookings list follows feature-level MVVM boundaries', () => {
  const viewPath = 'src/features/bookings/views/Bookings.tsx';
  const viewModelPath = 'src/features/bookings/viewModels/useBookingsViewModel.ts';
  const appSource = readProjectFile('src/App.tsx');
  const viewSource = readProjectFile(viewPath);
  const viewModelSource = readProjectFile(viewModelPath);

  assert.match(appSource, /BookingsScreen/);
  assert.match(viewSource, /useBookingsViewModel/);
  assert.doesNotMatch(viewSource, /booking\.status !== 'completed'/);
  assert.doesNotMatch(viewSource, /services\/serveaseApi/);
  assert.match(viewModelSource, /visibleBookings/);
  assert.match(viewModelSource, /booking\.status !== 'completed'/);
});

test('shared booking detail sections are outside the app shell', () => {
  const appSource = readProjectFile('src/App.tsx');
  const sharedSource = readProjectFile('src/shared/components/BookingDetailSections.tsx');
  const sharedIndexSource = readProjectFile('src/shared/components/index.ts');

  assert.doesNotMatch(appSource, /function renderBookingMedia/);
  assert.doesNotMatch(appSource, /function renderBookingServiceUpdates/);
  assert.doesNotMatch(appSource, /function renderBookingTimelineEvents/);
  assert.match(appSource, /BookingMediaSection/);
  assert.match(appSource, /BookingServiceUpdatesSection/);
  assert.match(appSource, /BookingTimelineEventsSection/);
  assert.match(sharedSource, /BookingMediaSection/);
  assert.match(sharedSource, /BookingServiceUpdatesSection/);
  assert.match(sharedSource, /BookingTimelineEventsSection/);
  assert.match(sharedSource, /timelineEventLabel/);
  assert.match(sharedIndexSource, /BookingDetailSections/);
});

test('shared support panel is outside the app shell', () => {
  const appSource = readProjectFile('src/App.tsx');
  const sharedSource = readProjectFile('src/shared/components/SupportPanel.tsx');
  const sharedHookSource = readProjectFile('src/shared/hooks/useSupportPanelViewModel.ts');
  const sharedIndexSource = readProjectFile('src/shared/components/index.ts');

  assert.doesNotMatch(appSource, /function renderSupportPanel/);
  assert.match(appSource, /<SupportPanel/);
  assert.match(sharedSource, /useSupportPanelViewModel/);
  assert.doesNotMatch(sharedSource, /formatDateTime|services\/serveaseApi/);
  assert.match(sharedHookSource, /formatDateTime/);
  assert.match(sharedHookSource, /ticketRows/);
  assert.match(sharedIndexSource, /SupportPanel/);
});
