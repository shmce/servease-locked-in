import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";
import { ProviderEarningsDashboard } from "./components/ProviderEarningsDashboard";
import { ProviderEarningsDetails } from "./components/ProviderEarningsDetails";
import { ProviderReviewsPage } from "./components/ProviderReviewsPage";
import { CalendarPage } from "./components/CalendarPage";
import { SetAvailabilityPage } from "./components/SetAvailabilityPage";
import { BlockTimePage } from "./components/BlockTimePage";
import { PayoutPage } from "./components/PayoutPage";
import { RequestPayoutPage } from "./components/RequestPayoutPage";
import { PayoutConfirmationPage } from "./components/PayoutConfirmationPage";
import { ProviderProfilePage } from "./components/ProviderProfilePage";
import { EditProfilePage } from "./components/EditProfilePage";
import { EditServicesPricingPage } from "./components/EditServicesPricingPage";
import { PortfolioManagementPage } from "./components/PortfolioManagementPage";
import { ProviderSettingsPage } from "./components/ProviderSettingsPage";
import { ProviderHelpCenterPage } from "./components/ProviderHelpCenterPage";
import { MessagesPage } from "./components/MessagesPage";
import { NotificationPreferencesPage } from "./components/NotificationPreferencesPage";
import { ProviderPerformanceInsightsPage } from "./components/ProviderPerformanceInsightsPage";
import { OnboardingPage } from "./components/OnboardingPage";
import { UnifiedBookingsPage } from "./components/UnifiedBookingsPage";
import { BookingDetailsPage } from "./components/BookingDetailsPage";
import { BookingRequestDetailsPage } from "./components/BookingRequestDetailsPage";
import { CancelBookingPage } from "./components/CancelBookingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "provider",
        Component: DashboardPage,
      },
      {
        path: "provider/dashboard",
        Component: DashboardPage,
      },
      {
        path: "provider/onboarding",
        Component: OnboardingPage,
      },
      {
        path: "provider/bookings",
        Component: UnifiedBookingsPage,
      },
      {
        path: "provider/booking-details/:id",
        Component: BookingDetailsPage,
      },
      {
        path: "provider/request-details/:id",
        Component: BookingRequestDetailsPage,
      },
      {
        path: "provider/cancel-booking/:id",
        Component: CancelBookingPage,
      },
      {
        path: "provider/earningsdashboard",
        Component: ProviderEarningsDashboard,
      },
      {
        path: "provider/earningsdetails",
        Component: ProviderEarningsDetails,
      },
      {
        path: "provider/reviews",
        Component: ProviderReviewsPage,
      },
      {
        path: "provider/performanceinsights",
        Component: ProviderPerformanceInsightsPage,
      },
      {
        path: "provider/calendar",
        Component: CalendarPage,
      },
      {
        path: "provider/availability",
        Component: SetAvailabilityPage,
      },
      {
        path: "provider/block-time",
        Component: BlockTimePage,
      },
      {
        path: "provider/payout",
        Component: PayoutPage,
      },
      {
        path: "provider/request-payout",
        Component: RequestPayoutPage,
      },
      {
        path: "provider/payout-confirmation",
        Component: PayoutConfirmationPage,
      },
      {
        path: "provider/profile",
        Component: ProviderProfilePage,
      },
      {
        path: "provider/edit-profile",
        Component: EditProfilePage,
      },
      {
        path: "provider/edit-services",
        Component: EditServicesPricingPage,
      },
      {
        path: "provider/portfolio",
        Component: PortfolioManagementPage,
      },
      {
        path: "provider/settings",
        Component: ProviderSettingsPage,
      },
      {
        path: "provider/help-center",
        Component: ProviderHelpCenterPage,
      },
      {
        path: "provider/messages",
        Component: MessagesPage,
      },
      {
        path: "provider/notification-preferences",
        Component: NotificationPreferencesPage,
      },
      {
        index: true,
        Component: DashboardPage, // Default to dashboard
      },
    ],
  },
  {
    path: "/provider/login",
    Component: LoginPage,
  },
]);
