import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Security } from "./pages/Security";
import { ProviderApplications } from "./pages/ProviderApplications";
import { ProviderApplicationReview } from "./pages/ProviderApplicationReview";
import { ServiceProviders } from "./pages/ServiceProviders";
import { ServiceProviderDetails } from "./pages/ServiceProviderDetails";
import { AllBookings } from "./pages/AllBookings";
import { OngoingServices } from "./pages/OngoingServices";
import { DisputesResolutions } from "./pages/DisputesResolutions";
import { Transactions } from "./pages/Transactions";
import { ProviderEarnings } from "./pages/ProviderEarnings";
import { PayoutRequests } from "./pages/PayoutRequests";
import { RefundManagement } from "./pages/RefundManagement";
import { FailedPayments } from "./pages/FailedPayments";
import {
  AdminRoles,
  NotificationSettings,
  AuditTrail,
  Integrations,
} from "./pages/PlatformSettingsPages";
import { Customers, Support, Broadcasts } from "./pages/AdminGatewayPages";
import { Categories } from "./pages/Categories";
import { Services } from "./pages/Services";
import { ServiceAreas } from "./pages/ServiceAreas";
import { Promotions } from "./pages/Promotions";
import { CommissionRules } from "./pages/CommissionRules";
import { PricingEngine } from "./pages/PricingEngine";
import { Revenue } from "./pages/reports/Revenue";
import { BookingAnalytics } from "./pages/reports/BookingAnalytics";
import { AddNewAdmin } from "./pages/AddNewAdmin";
import { BusinessReports } from "./pages/reports/BusinessReports";
import { FinancialReports } from "./pages/reports/FinancialReports";
import { LookerStudioReport } from "./pages/reports/LookerStudioReport";
import { UserReports } from "./pages/reports/UserReports";
import { BackendSupportMatrix } from "./pages/BackendSupportMatrix";
import { Reviews } from "./pages/Reviews";

// Wrapper component for protected routes
function ProtectedRootLayout() {
  return (
    <ProtectedRoute>
      <RootLayout />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },

  // Protected routes
  {
    path: "/",
    Component: ProtectedRootLayout,
    children: [
      // Redirect root to dashboard
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },

      // Profile & Account
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
      { path: "security", Component: Security },

      // User Management
      { path: "customers", Component: Customers },
      { path: "service-providers", Component: ServiceProviders },
      { path: "service-providers/:id", Component: ServiceProviderDetails },
      { path: "provider-applications", Component: ProviderApplications },
      { path: "provider-applications/:applicationId", Component: ProviderApplicationReview },
      // Legacy route alias for old approval-queue URLs
      { path: "approval-queue", Component: ProviderApplications },
      { path: "approval-queue/:applicationId", Component: ProviderApplicationReview },

      // Operations
      { path: "bookings", Component: AllBookings },
      { path: "disputes", Component: DisputesResolutions },
      // Legacy route aliases
      { path: "disputes-resolutions", Component: DisputesResolutions },
      { path: "ongoing-services", Component: OngoingServices },
      { path: "support", Component: Support },
      { path: "reviews", Component: Reviews },

      // Finance
      { path: "transactions", Component: Transactions },
      { path: "payouts", Component: PayoutRequests },
      { path: "refunds", Component: RefundManagement },
      // Legacy route aliases
      { path: "payout-requests", Component: PayoutRequests },
      { path: "refund-management", Component: RefundManagement },
      { path: "provider-earnings", Component: ProviderEarnings },
      { path: "failed-payments", Component: FailedPayments },

      // Marketplace
      { path: "categories", Component: Categories },
      { path: "services", Component: Services },
      { path: "service-areas", Component: ServiceAreas },
      { path: "promotions", Component: Promotions },
      { path: "broadcasts", Component: Broadcasts },

      // Reports - Separate pages
      { path: "reports/revenue", Component: Revenue },
      { path: "reports/booking-analytics", Component: BookingAnalytics },
      { path: "reports/business", Component: BusinessReports },
      { path: "reports/financial", Component: FinancialReports },
      { path: "reports/user", Component: UserReports },
      { path: "reports/looker-studio", Component: LookerStudioReport },

      // Platform Settings
      { path: "commission-rules", Component: CommissionRules },
      { path: "pricing-engine", Component: PricingEngine },
      { path: "admin-roles", Component: AdminRoles },
      { path: "notification-settings", Component: NotificationSettings },
      { path: "audit-trail", Component: AuditTrail },
      { path: "integrations", Component: Integrations },
      { path: "backend-support", Component: BackendSupportMatrix },

      // Add New Admin
      { path: "add-new-admin", Component: AddNewAdmin },
    ],
  },
]);
