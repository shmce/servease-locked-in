import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from '@/shared/components/Layout';

const Analytics = lazy(() => import('@/features/analytics/views/Analytics'));
const Availability = lazy(() => import('@/features/availability/views/Availability'));
const BlockTime = lazy(() => import('@/features/block-time/views/BlockTime'));
const BookingDetails = lazy(() => import('@/features/booking-details/views/BookingDetails'));
const BookingRequestDetails = lazy(() => import('@/features/booking-request-details/views/BookingRequestDetails'));
const Bookings = lazy(() => import('@/features/bookings/views/Bookings'));
const Calendar = lazy(() => import('@/features/calendar/views/Calendar'));
const CancelBooking = lazy(() => import('@/features/cancel-booking/views/CancelBooking'));
const Dashboard = lazy(() => import('@/features/dashboard/views/Dashboard'));
const EarningsDashboard = lazy(() => import('@/features/earnings-dashboard/views/EarningsDashboard'));
const EarningsDetails = lazy(() => import('@/features/earnings-details/views/EarningsDetails'));
const EditProfile = lazy(() => import('@/features/edit-profile/views/EditProfile'));
const EditServices = lazy(() => import('@/features/edit-services/views/EditServices'));
const HelpCenter = lazy(() => import('@/features/help-center/views/HelpCenter'));
const Login = lazy(() => import('@/features/login/views/Login'));
const Messages = lazy(() => import('@/features/messages/views/Messages'));
const NotificationPreferences = lazy(() => import('@/features/notification-preferences/views/NotificationPreferences'));
const Onboarding = lazy(() => import('@/features/onboarding/views/Onboarding'));
const Payout = lazy(() => import('@/features/payout/views/Payout'));
const PayoutConfirmation = lazy(() => import('@/features/payout-confirmation/views/PayoutConfirmation'));
const PerformanceInsights = lazy(() => import('@/features/performance-insights/views/PerformanceInsights'));
const Portfolio = lazy(() => import('@/features/portfolio/views/Portfolio'));
const Profile = lazy(() => import('@/features/profile/views/Profile'));
const RequestPayout = lazy(() => import('@/features/request-payout/views/RequestPayout'));
const Reviews = lazy(() => import('@/features/reviews/views/Reviews'));
const Settings = lazy(() => import('@/features/settings/views/Settings'));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "provider/dashboard",
        Component: Dashboard,
      },
      {
        path: "provider/onboarding",
        Component: Onboarding,
      },
      {
        path: "provider/bookings",
        Component: Bookings,
      },
      {
        path: "provider/booking-details/:id",
        Component: BookingDetails,
      },
      {
        path: "provider/request-details/:id",
        Component: BookingRequestDetails,
      },
      {
        path: "provider/cancel-booking/:id",
        Component: CancelBooking,
      },
      {
        path: "provider/earningsdashboard",
        Component: EarningsDashboard,
      },
      {
        path: "provider/earningsdetails",
        Component: EarningsDetails,
      },
      {
        path: "provider/reviews",
        Component: Reviews,
      },
      {
        path: "provider/performanceinsights",
        Component: PerformanceInsights,
      },
      {
        path: "provider/analytics",
        Component: Analytics,
      },
      {
        path: "provider/calendar",
        Component: Calendar,
      },
      {
        path: "provider/availability",
        Component: Availability,
      },
      {
        path: "provider/block-time",
        Component: BlockTime,
      },
      {
        path: "provider/payout",
        Component: Payout,
      },
      {
        path: "provider/request-payout",
        Component: RequestPayout,
      },
      {
        path: "provider/payout-confirmation",
        Component: PayoutConfirmation,
      },
      {
        path: "provider/profile",
        Component: Profile,
      },
      {
        path: "provider/edit-profile",
        Component: EditProfile,
      },
      {
        path: "provider/edit-services",
        Component: EditServices,
      },
      {
        path: "provider/portfolio",
        Component: Portfolio,
      },
      {
        path: "provider/settings",
        Component: Settings,
      },
      {
        path: "provider/help-center",
        Component: HelpCenter,
      },
      {
        path: "provider/messages",
        Component: Messages,
      },
      {
        path: "provider/notification-preferences",
        Component: NotificationPreferences,
      },
      {
        index: true,
        Component: Dashboard,
      },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
]);
