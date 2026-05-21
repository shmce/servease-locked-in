import { ReactNode } from 'react';
import {
  Calendar,
  Clock,
  FolderKanban,
  Home,
  Menu,
  MessageCircle,
  Search,
} from 'lucide-react-native';
import {
  BottomNavigation,
  PhoneFrame,
  StatusStrip,
} from '../components/DesignKit';
import { ScreenTransition } from '../components/Motion';
import { hiddenProviderBottomNavScreens } from '../constants/appContent';
import {
  getCustomerTab,
  getProviderTab,
} from '../navigation/routeHelpers';
import { AppRole, AppScreen, RouteState } from '../navigation/types';
import type { AuthSession } from '../shared/models/types';
import { palette } from '../theme/serveaseDesign';
import { RouteSuspense } from './AppShell';

type CustomerRendererName =
  | 'bookingConfirmation'
  | 'bookingDetail'
  | 'bookingForm'
  | 'bookingReview'
  | 'bookings'
  | 'calendar'
  | 'cancelBooking'
  | 'category'
  | 'customerAllServices'
  | 'customerExplore'
  | 'customerProviderProfile'
  | 'customerTopProviders'
  | 'help'
  | 'manageBooking'
  | 'messages'
  | 'more'
  | 'notifications'
  | 'paymentMethods'
  | 'profile'
  | 'referral'
  | 'reportIssue'
  | 'reservePayment'
  | 'security'
  | 'serviceHistory'
  | 'settings'
  | 'terms'
  | 'trackServiceProvider';

type ProviderRendererName =
  | 'bookingDetail'
  | 'bookings'
  | 'calendar'
  | 'cancelBooking'
  | 'completeService'
  | 'editProfile'
  | 'help'
  | 'home'
  | 'insights'
  | 'messages'
  | 'more'
  | 'navigationMode'
  | 'notifications'
  | 'payoutManagement'
  | 'portfolio'
  | 'profileView'
  | 'reportIssue'
  | 'requestPayout'
  | 'security'
  | 'serviceCompleted'
  | 'serviceInProgress'
  | 'serviceReceipt'
  | 'services'
  | 'setAvailability'
  | 'settings'
  | 'startService';

export type AppRouterRenderers = {
  auth: () => ReactNode;
  customer: Record<CustomerRendererName, () => ReactNode>;
  customerAllServices: (title: string) => ReactNode;
  provider: Record<ProviderRendererName, () => ReactNode>;
};

type AppRouterProps = {
  appRole: AppRole;
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
  renderers: AppRouterRenderers;
  route: RouteState;
  session: AuthSession | null;
  unreadCount: number;
};

const authScreens = new Set<AppScreen>([
  'authGate',
  'loginRole',
  'customerLogin',
  'providerLogin',
  'signupRole',
  'customerRegistration',
  'providerRegistration',
]);

export function AppRouter({
  appRole,
  navigate,
  renderers,
  route,
  session,
  unreadCount,
}: AppRouterProps) {
  if (authScreens.has(route.screen)) {
    return <RouteSuspense>{renderers.auth()}</RouteSuspense>;
  }

  if (route.role === 'provider' || (session && appRole === 'provider')) {
    return (
      <ProviderRouteFrame
        navigate={navigate}
        renderers={renderers}
        route={route}
        unreadCount={unreadCount}
      />
    );
  }

  return (
    <CustomerRouteFrame
      navigate={navigate}
      renderers={renderers}
      route={route}
      unreadCount={unreadCount}
    />
  );
}

function CustomerRouteFrame({
  navigate,
  renderers,
  route,
  unreadCount,
}: {
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
  renderers: AppRouterRenderers;
  route: RouteState;
  unreadCount: number;
}) {
  const activeTab = getCustomerTab(route.screen);
  const routeKey = `${route.role ?? 'customer'}-${route.screen}`;

  return (
    <PhoneFrame>
      <StatusStrip />
      <ScreenTransition routeKey={routeKey}>
        <RouteSuspense>{renderCustomerRoute(route.screen, activeTab, renderers)}</RouteSuspense>
      </ScreenTransition>
      <BottomNavigation
        tabs={[
          {
            key: 'explore',
            label: 'Explore',
            icon: <Search color={activeTab === 'explore' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
          },
          {
            key: 'bookings',
            label: 'Bookings',
            icon: <FolderKanban color={activeTab === 'bookings' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
          },
          {
            key: 'calendar',
            label: 'Calendar',
            icon: <Calendar color={activeTab === 'calendar' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
          },
          {
            key: 'messages',
            label: 'Messages',
            icon: <MessageCircle color={activeTab === 'messages' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
          },
          {
            key: 'more',
            label: 'More',
            icon: <Menu color={activeTab === 'more' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
          },
        ]}
        active={activeTab}
        unreadCount={unreadCount}
        onChange={(tab) => navigate(tab, 'customer')}
      />
    </PhoneFrame>
  );
}

function ProviderRouteFrame({
  navigate,
  renderers,
  route,
  unreadCount,
}: {
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
  renderers: AppRouterRenderers;
  route: RouteState;
  unreadCount: number;
}) {
  const activeTab = getProviderTab(route.screen);
  const hideBottomNav = hiddenProviderBottomNavScreens.includes(route.screen);
  const routeKey = `${route.role ?? 'provider'}-${route.screen}`;

  return (
    <PhoneFrame>
      <StatusStrip />
      <ScreenTransition routeKey={routeKey}>
        <RouteSuspense>{renderProviderRoute(route.screen, activeTab, renderers)}</RouteSuspense>
      </ScreenTransition>
      {hideBottomNav ? null : (
        <BottomNavigation
          tabs={[
            {
              key: 'home',
              label: 'Home',
              icon: <Home color={activeTab === 'home' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'bookings',
              label: 'Bookings',
              icon: <Calendar color={activeTab === 'bookings' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'calendar',
              label: 'Calendar',
              icon: <Clock color={activeTab === 'calendar' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'messages',
              label: 'Messages',
              icon: <MessageCircle color={activeTab === 'messages' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'more',
              label: 'More',
              icon: <Menu color={activeTab === 'more' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
          ]}
          active={activeTab}
          unreadCount={unreadCount}
          onChange={(tab) => navigate(tab, 'provider')}
        />
      )}
    </PhoneFrame>
  );
}

function renderCustomerRoute(
  screen: AppScreen,
  activeTab: string,
  renderers: AppRouterRenderers,
) {
  switch (screen) {
    case 'customerBookingDetail':
      return renderers.customer.bookingDetail();
    case 'customerBookingReview':
      return renderers.customer.bookingReview();
    case 'customerReservePayment':
      return renderers.customer.reservePayment();
    case 'customerBookingConfirmation':
      return renderers.customer.bookingConfirmation();
    case 'customerBookingManage':
      return renderers.customer.manageBooking();
    case 'customerBookingCancel':
      return renderers.customer.cancelBooking();
    case 'customerBookingReport':
      return renderers.customer.reportIssue();
    case 'customerTrackServiceProvider':
      return renderers.customer.trackServiceProvider();
    case 'customerCategory':
      return renderers.customer.category();
    case 'customerAllServices':
      return renderers.customerAllServices('All Services');
    case 'customerRecommendedServices':
      return renderers.customerAllServices('Recommended Services');
    case 'customerTopProviders':
      return renderers.customer.customerTopProviders();
    case 'customerProviderProfile':
      return renderers.customer.customerProviderProfile();
    case 'customerBookingForm':
      return renderers.customer.bookingForm();
    case 'customerSearchResults':
      return renderers.customerAllServices('Search Results');
    case 'customerProfile':
      return renderers.customer.profile();
    case 'customerSettings':
      return renderers.customer.settings();
    case 'customerSecurity':
      return renderers.customer.security();
    case 'customerPaymentMethods':
      return renderers.customer.paymentMethods();
    case 'customerHelp':
      return renderers.customer.help();
    case 'customerServiceHistory':
      return renderers.customer.serviceHistory();
    case 'customerNotifications':
      return renderers.customer.notifications();
    case 'customerReferral':
      return renderers.customer.referral();
    case 'customerTerms':
      return renderers.customer.terms();
    case 'explore':
      return activeTab === 'explore' ? renderers.customer.customerExplore() : null;
    case 'bookings':
      return activeTab === 'bookings' ? renderers.customer.bookings() : null;
    case 'calendar':
      return activeTab === 'calendar' ? renderers.customer.calendar() : null;
    case 'messages':
      return activeTab === 'messages' ? renderers.customer.messages() : null;
    case 'more':
      return activeTab === 'more' ? renderers.customer.more() : null;
    default:
      return null;
  }
}

function renderProviderRoute(
  screen: AppScreen,
  activeTab: string,
  renderers: AppRouterRenderers,
) {
  switch (screen) {
    case 'providerBookingDetail':
      return renderers.provider.bookingDetail();
    case 'providerNavigationMode':
      return renderers.provider.navigationMode();
    case 'providerStartService':
      return renderers.provider.startService();
    case 'providerServiceInProgress':
      return renderers.provider.serviceInProgress();
    case 'providerCompleteService':
      return renderers.provider.completeService();
    case 'providerServiceCompleted':
      return renderers.provider.serviceCompleted();
    case 'providerCancelBooking':
      return renderers.provider.cancelBooking();
    case 'providerReportIssue':
      return renderers.provider.reportIssue();
    case 'providerServiceReceipt':
      return renderers.provider.serviceReceipt();
    case 'providerProfileView':
      return renderers.provider.profileView();
    case 'providerEditProfile':
      return renderers.provider.editProfile();
    case 'providerPortfolio':
      return renderers.provider.portfolio();
    case 'providerPayoutManagement':
      return renderers.provider.payoutManagement();
    case 'providerRequestPayout':
      return renderers.provider.requestPayout();
    case 'providerNotifications':
      return renderers.provider.notifications();
    case 'providerInsights':
    case 'providerEarnings':
      return renderers.provider.insights();
    case 'providerHelp':
      return renderers.provider.help();
    case 'providerServices':
      return renderers.provider.services();
    case 'providerSecurity':
      return renderers.provider.security();
    case 'providerSettings':
      return renderers.provider.settings();
    case 'providerSetAvailability':
      return renderers.provider.setAvailability();
    case 'home':
      return activeTab === 'home' ? renderers.provider.home() : null;
    case 'bookings':
      return activeTab === 'bookings' ? renderers.provider.bookings() : null;
    case 'calendar':
      return activeTab === 'calendar' ? renderers.provider.calendar() : null;
    case 'messages':
      return activeTab === 'messages' ? renderers.provider.messages() : null;
    case 'more':
      return activeTab === 'more' ? renderers.provider.more() : null;
    default:
      return null;
  }
}
