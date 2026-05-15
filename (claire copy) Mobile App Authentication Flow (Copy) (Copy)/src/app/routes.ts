import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import Root from "./screens/Root";

const SplashScreen = lazy(() => import("./screens/SplashScreen"));
const LoadingScreen = lazy(() => import("./screens/LoadingScreen"));
const AuthGate = lazy(() => import("./screens/AuthGate"));
const SignupRoleSelection = lazy(() => import("./screens/SignupRoleSelection"));
const LoginRoleSelection = lazy(() => import("./screens/LoginRoleSelection"));
const ProviderSignupStep1 = lazy(() => import("./screens/ProviderSignupStep1"));
const ProviderInfoLanding = lazy(() => import("./screens/ProviderInfoLanding"));
const ProviderSignupStep2 = lazy(() => import("./screens/ProviderSignupStep2"));
const ProviderSignupStep3 = lazy(() => import("./screens/ProviderSignupStep3"));
const ProviderSignupStep4 = lazy(() => import("./screens/ProviderSignupStep4"));
const ProviderSignupStep5 = lazy(() => import("./screens/ProviderSignupStep5"));
const ProviderServiceConfig = lazy(() => import("./screens/ProviderServiceConfig"));
const ProviderAvailability = lazy(() => import("./screens/ProviderAvailability"));
const ProviderApplicationSubmitted = lazy(() => import("./screens/ProviderApplicationSubmitted"));
const ProviderAccountApproved = lazy(() => import("./screens/ProviderAccountApproved"));
const CustomerLogin = lazy(() => import("./screens/CustomerLogin"));
const ProviderLogin = lazy(() => import("./screens/ProviderLogin"));
const ForgotPassword = lazy(() => import("./screens/ForgotPassword"));
const CustomerRegistration = lazy(() => import("./screens/CustomerRegistration"));
const CustomerAddress = lazy(() => import("./screens/CustomerAddress"));
const CustomerRegistrationSuccess = lazy(() => import("./screens/CustomerRegistrationSuccess"));
const CustomerOnboardingComplete = lazy(() => import("./screens/CustomerOnboardingComplete"));
const CustomerHomePage = lazy(() => import("./screens/CustomerHomePage"));
const CustomerMessagesScreen = lazy(() => import("./screens/CustomerMessagesScreen"));
const CustomerConversation = lazy(() => import("./screens/CustomerConversation"));
const CustomerProviderSearch = lazy(() => import("./screens/CustomerProviderSearch"));
const CustomerForgotPassword = lazy(() => import("./screens/CustomerForgotPassword"));
const CustomerForgotPasswordCheckEmail = lazy(() => import("./screens/CustomerForgotPasswordCheckEmail"));
const CustomerAuthGoogle = lazy(() => import("./screens/CustomerAuthGoogle"));
const AuthPhone = lazy(() => import("./screens/AuthPhone"));
const AuthPhoneVerify = lazy(() => import("./screens/AuthPhoneVerify"));
const WelcomeScreen = lazy(() => import("./screens/WelcomeScreen"));
const CustomerMore = lazy(() => import("./screens/CustomerMore"));
const CustomerCategory = lazy(() => import("./screens/CustomerCategory"));
const CustomerServiceDetail = lazy(() => import("./screens/CustomerServiceDetail"));
const ProviderAuthGoogle = lazy(() => import("./screens/ProviderAuthGoogle"));
const ProviderHomePage = lazy(() => import("./screens/ProviderHomePage"));
const GoogleAccountSelection = lazy(() => import("./screens/GoogleAccountSelection"));
const GooglePasswordEntry = lazy(() => import("./screens/GooglePasswordEntry"));
const GoogleEmailEntry = lazy(() => import("./screens/GoogleEmailEntry"));
const TermsAndConditions = lazy(() => import("./screens/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./screens/PrivacyPolicy"));

// Customer More screens
const CustomerHelp = lazy(() => import("./screens/CustomerHelp"));
const CustomerSettings = lazy(() => import("./screens/CustomerSettings"));
const CustomerProfile = lazy(() => import("./screens/CustomerProfile"));
const CustomerTerms = lazy(() => import("./screens/CustomerTerms"));
const CustomerMessages = lazy(() => import("./screens/CustomerMessages"));
const CustomerEditProfile = lazy(() => import("./screens/CustomerEditProfile"));
const CustomerServiceHistory = lazy(() => import("./screens/CustomerServiceHistory"));
const CustomerPaymentMethods = lazy(() => import("./screens/CustomerPaymentMethods"));
const CustomerReferral = lazy(() => import("./screens/CustomerReferral"));
const CustomerAddAddress = lazy(() => import("./screens/CustomerAddAddress"));
const CustomerAddPayment = lazy(() => import("./screens/CustomerAddPayment"));
const PaymentSuccess = lazy(() => import("./screens/PaymentSuccess"));
const CustomerAllServices = lazy(() => import("./screens/CustomerAllServices"));
const CustomerRecommendedServices = lazy(() => import("./screens/CustomerRecommendedServices"));
const CustomerTopProviders = lazy(() => import("./screens/CustomerTopProviders"));
const CustomerNotifications = lazy(() => import("./screens/CustomerNotifications"));
const CustomerSearchResults = lazy(() => import("./screens/CustomerSearchResults"));
const CustomerChangePassword = lazy(() => import("./screens/CustomerChangePassword"));
const CustomerLanguage = lazy(() => import("./screens/CustomerLanguage"));
const CustomerGettingStarted = lazy(() => import("./screens/CustomerGettingStarted"));
const CustomerBookingHelp = lazy(() => import("./screens/CustomerBookingHelp"));
const CustomerPaymentsHelp = lazy(() => import("./screens/CustomerPaymentsHelp"));
const CustomerSafetyHelp = lazy(() => import("./screens/CustomerSafetyHelp"));
const CustomerAccountHelp = lazy(() => import("./screens/CustomerAccountHelp"));

// Provider More screens
const ProviderHelpSupport = lazy(() => import("./screens/ProviderHelpSupport"));
const ProviderEarnings = lazy(() => import("./screens/ProviderEarnings"));
const ProviderSettings = lazy(() => import("./screens/ProviderSettings"));
const ProviderEditProfileAdvanced = lazy(() => import("./screens/ProviderEditProfileAdvanced"));
const ProviderEditProfile = lazy(() => import("./screens/ProviderEditProfile"));
const ProviderProfileView = lazy(() => import("./screens/ProviderProfileView"));
const ProviderEditServicesAndPricing = lazy(() => import("./screens/ProviderEditServicesAndPricing"));
const ProviderPortfolio = lazy(() => import("./screens/ProviderPortfolio"));
const ProviderPerformanceInsights = lazy(() => import("./screens/ProviderPerformanceInsights"));
const ProviderManageAddresses = lazy(() => import("./screens/ProviderManageAddresses"));
const ProviderAddPaymentMethod = lazy(() => import("./screens/ProviderAddPaymentMethod"));
const ProviderAddPayoutMethod = lazy(() => import("./screens/ProviderAddPaymentMethod"));
const ProviderNotificationSettings = lazy(() => import("./screens/ProviderNotificationSettings"));
const ProviderNotificationPreferences = lazy(() => import("./screens/ProviderNotificationPreferences"));
const ProviderPrivacySecurity = lazy(() => import("./screens/ProviderPrivacySecurity"));
const ProviderSupportTicket = lazy(() => import("./screens/ProviderSupportTicket"));
const ProviderServiceHistory = lazy(() => import("./screens/ProviderServiceHistory"));
const ProviderCounterOffer = lazy(() => import("./screens/ProviderCounterOffer"));
const ProviderMyBookings = lazy(() => import("./screens/ProviderMyBookings"));
const ProviderBookingDetails = lazy(() => import("./screens/ProviderBookingDetails"));
const ProviderNavigationMode = lazy(() => import("./screens/ProviderNavigationMode"));
const ProviderStartService = lazy(() => import("./screens/ProviderStartService"));
const ProviderServiceInProgress = lazy(() => import("./screens/ProviderServiceInProgress"));
const ProviderAdditionalCharges = lazy(() => import("./screens/ProviderAdditionalCharges"));
const ProviderCompleteService = lazy(() => import("./screens/ProviderCompleteService"));
const ProviderServiceCompleted = lazy(() => import("./screens/ProviderServiceCompleted"));
const ProviderRescheduleRequest = lazy(() => import("./screens/ProviderRescheduleRequest"));
const ProviderCancelBooking = lazy(() => import("./screens/ProviderCancelBooking"));
const ProviderMessages = lazy(() => import("./screens/ProviderMessages"));
const ProviderConversation = lazy(() => import("./screens/ProviderConversation"));
const ProviderReviews = lazy(() => import("./screens/ProviderReviews"));
const ProviderServiceReceipt = lazy(() => import("./screens/ProviderServiceReceipt"));
const ProviderProgressPhotoUpload = lazy(() => import("./screens/ProviderProgressPhotoUpload"));
const ProviderJobUpdateMessage = lazy(() => import("./screens/ProviderJobUpdateMessage"));
const ProviderRequestAdditionalPayment = lazy(() => import("./screens/ProviderRequestAdditionalPayment"));
const ProviderBreakStatus = lazy(() => import("./screens/ProviderBreakStatus"));
const ProviderReportIssue = lazy(() => import("./screens/ProviderReportIssue"));

// Project/Booking screens (updated terminology)
const ProjectReview = lazy(() => import("./screens/ProjectReview"));
const ReservePayment = lazy(() => import("./screens/ReservePayment"));
const ProjectConfirmation = lazy(() => import("./screens/ProjectConfirmation"));
const MyProjects = lazy(() => import("./screens/MyProjects"));
const MyBookings = lazy(() => import("./screens/MyBookings"));
const ProjectDetails = lazy(() => import("./screens/ProjectDetails"));
const TrackServiceProvider = lazy(() => import("./screens/TrackServiceProvider"));
const ManageProject = lazy(() => import("./screens/ManageProject"));
const CancelProject = lazy(() => import("./screens/CancelProject"));
const ReportIssue = lazy(() => import("./screens/ReportIssue"));
const ChangeBookingDateTime = lazy(() => import("./screens/ChangeBookingDateTime"));

// New screens - Provider Profile and Booking Form
const ProviderProfile = lazy(() => import("./screens/ProviderProfile"));
const BookingForm = lazy(() => import("./screens/BookingForm"));
const ProviderPayoutManagement = lazy(() => import("./screens/ProviderPayoutManagement"));
const ProviderRequestPayout = lazy(() => import("./screens/ProviderRequestPayout"));
const ProviderSetAvailability = lazy(() => import("./screens/ProviderSetAvailability"));
const ProviderCalendar = lazy(() => import("./screens/ProviderCalendar"));
const ProviderServiceAreaSetup = lazy(() => import("./screens/ProviderServiceAreaSetup"));
const ProviderTutorialPage = lazy(() => import("./screens/ProviderTutorialPage"));
const ProviderCompletePage = lazy(() => import("./screens/ProviderCompletePage"));
const NotFound = lazy(() => import("./screens/NotFound"));
const CustomerSetupProfile = lazy(() => import("./screens/CustomerSetupProfile"));
const ProviderSetupProfile = lazy(() => import("./screens/ProviderSetupProfile"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: LoadingScreen,
      },
      {
        path: "loading",
        Component: LoadingScreen,
      },
      {
        path: "auth-gate",
        Component: AuthGate,
      },
      {
        path: "signup-role-selection",
        Component: SignupRoleSelection,
      },
      {
        path: "login-role-selection",
        Component: LoginRoleSelection,
      },
      {
        path: "customer/registration",
        Component: CustomerRegistration,
      },
      {
        path: "customer/setup-profile",
        Component: CustomerSetupProfile,
      },
      {
        path: "customer/address",
        Component: CustomerAddress,
      },
      {
        path: "customer/registration-success",
        Component: CustomerRegistrationSuccess,
      },
      {
        path: "customer/onboarding-complete",
        Component: CustomerOnboardingComplete,
      },
      {
        path: "customer/home",
        Component: CustomerHomePage,
      },
      {
        path: "customer/login",
        Component: CustomerLogin,
      },
      {
        path: "customer/forgot-password",
        Component: CustomerForgotPassword,
      },
      {
        path: "customer/forgot-password/check-email",
        Component: CustomerForgotPasswordCheckEmail,
      },
      {
        path: "customer/auth/google",
        Component: CustomerAuthGoogle,
      },
      {
        path: "customer/auth/phone",
        Component: AuthPhone,
      },
      {
        path: "customer/auth/phone/verify",
        Component: AuthPhoneVerify,
      },
      {
        path: "provider/signup/step1",
        Component: ProviderSignupStep1,
      },
      {
        path: "provider/info",
        Component: ProviderInfoLanding,
      },
      {
        path: "provider/signup/step2",
        Component: ProviderSignupStep2,
      },
      {
        path: "provider/signup/step3",
        Component: ProviderSignupStep3,
      },
      {
        path: "provider/signup/step4",
        Component: ProviderSignupStep4,
      },
      {
        path: "provider/signup/step5",
        Component: ProviderSignupStep5,
      },
      {
        path: "provider/service-config",
        Component: ProviderServiceConfig,
      },
      {
        path: "provider/availability",
        Component: ProviderAvailability,
      },
      {
        path: "provider/application-submitted",
        Component: ProviderApplicationSubmitted,
      },
      {
        path: "provider/login",
        Component: ProviderLogin,
      },
      {
        path: "provider/setup-profile",
        Component: ProviderSetupProfile,
      },
      {
        path: "provider/account-approved",
        Component: ProviderAccountApproved,
      },
      {
        path: "provider/auth/google",
        Component: ProviderAuthGoogle,
      },
      {
        path: "provider/home",
        Component: ProviderHomePage,
      },
      {
        path: "provider/home/earnings",
        Component: ProviderEarnings,
      },
      {
        path: "forgot-password",
        Component: ForgotPassword,
      },
      {
        path: "welcome",
        Component: WelcomeScreen,
      },
      {
        path: "customer/more",
        Component: CustomerMore,
      },
      {
        path: "customer/category/:slug",
        Component: CustomerCategory,
      },
      {
        path: "customer/service/:id",
        Component: CustomerServiceDetail,
      },
      {
        path: "auth/google/select-account",
        Component: GoogleAccountSelection,
      },
      {
        path: "auth/google/password",
        Component: GooglePasswordEntry,
      },
      {
        path: "auth/google/email",
        Component: GoogleEmailEntry,
      },
      {
        path: "auth/phone",
        Component: AuthPhone,
      },
      {
        path: "auth/phone/verify",
        Component: AuthPhoneVerify,
      },
      {
        path: "terms-and-conditions",
        Component: TermsAndConditions,
      },
      {
        path: "privacy-policy",
        Component: PrivacyPolicy,
      },
      {
        path: "customer/project-review/:id",
        Component: ProjectReview,
      },
      {
        path: "customer/payment/:bookingId",
        Component: ReservePayment,
      },
      {
        path: "customer/project-confirmation/:bookingId",
        Component: ProjectConfirmation,
      },
      {
        path: "customer/projects",
        Component: MyProjects,
      },
      {
        path: "customer/bookings",
        Component: MyBookings,
      },
      {
        path: "customer/project/:id",
        Component: ProjectDetails,
      },
      {
        path: "customer/project/:id/track",
        Component: TrackServiceProvider,
      },
      {
        path: "customer/project/:id/manage",
        Component: ManageProject,
      },
      {
        path: "customer/project/:id/cancel",
        Component: CancelProject,
      },
      {
        path: "customer/project/:id/report-issue",
        Component: ReportIssue,
      },
      {
        path: "customer/project/:id/change-datetime",
        Component: ChangeBookingDateTime,
      },
      {
        path: "customer/help",
        Component: CustomerHelp,
      },
      {
        path: "customer/settings",
        Component: CustomerSettings,
      },
      {
        path: "customer/profile",
        Component: CustomerProfile,
      },
      {
        path: "customer/terms",
        Component: CustomerTerms,
      },
      {
        path: "customer/messages",
        Component: CustomerMessagesScreen,
      },
      {
        path: "customer/conversation/:providerId",
        Component: CustomerConversation,
      },
      {
        path: "customer/search",
        Component: CustomerProviderSearch,
      },
      {
        path: "customer/messages/:id",
        Component: CustomerMessages,
      },
      {
        path: "customer/edit-profile",
        Component: CustomerEditProfile,
      },
      {
        path: "customer/service-history",
        Component: CustomerServiceHistory,
      },
      {
        path: "customer/payment-methods",
        Component: CustomerPaymentMethods,
      },
      {
        path: "customer/referral",
        Component: CustomerReferral,
      },
      {
        path: "customer/add-address",
        Component: CustomerAddAddress,
      },
      {
        path: "customer/add-payment-method",
        Component: CustomerAddPayment,
      },
      {
        path: "customer/payment-success",
        Component: PaymentSuccess,
      },
      {
        path: "customer/all-services",
        Component: CustomerAllServices,
      },
      {
        path: "customer/recommended-services",
        Component: CustomerRecommendedServices,
      },
      {
        path: "customer/top-providers",
        Component: CustomerTopProviders,
      },
      {
        path: "customer/notifications",
        Component: CustomerNotifications,
      },
      {
        path: "customer/search-results",
        Component: CustomerSearchResults,
      },
      {
        path: "customer/change-password",
        Component: CustomerChangePassword,
      },
      {
        path: "customer/language",
        Component: CustomerLanguage,
      },
      {
        path: "customer/getting-started",
        Component: CustomerGettingStarted,
      },
      {
        path: "customer/booking-help",
        Component: CustomerBookingHelp,
      },
      {
        path: "customer/payments-help",
        Component: CustomerPaymentsHelp,
      },
      {
        path: "customer/safety-help",
        Component: CustomerSafetyHelp,
      },
      {
        path: "customer/account-help",
        Component: CustomerAccountHelp,
      },
      {
        path: "provider/profile/:id",
        Component: ProviderProfile,
      },
      {
        path: "booking-form/:providerId",
        Component: BookingForm,
      },
      {
        path: "provider/help-support",
        Component: ProviderHelpSupport,
      },
      {
        path: "provider/earnings",
        Component: ProviderEarnings,
      },
      {
        path: "provider/settings",
        Component: ProviderSettings,
      },
      {
        path: "provider/edit-profile",
        Component: ProviderEditProfile,
      },
      {
        path: "provider/edit-profile/advanced",
        Component: ProviderEditProfileAdvanced,
      },
      {
        path: "provider/profile/view",
        Component: ProviderProfileView,
      },
      {
        path: "provider/edit-services-and-pricing",
        Component: ProviderEditServicesAndPricing,
      },
      {
        path: "provider/portfolio",
        Component: ProviderPortfolio,
      },
      {
        path: "provider/performance-insights",
        Component: ProviderPerformanceInsights,
      },
      {
        path: "provider/manage-addresses",
        Component: ProviderManageAddresses,
      },
      {
        path: "provider/add-payment-method",
        Component: ProviderAddPaymentMethod,
      },
      {
        path: "provider/add-payout-method",
        Component: ProviderAddPayoutMethod,
      },
      {
        path: "provider/notification-settings",
        Component: ProviderNotificationSettings,
      },
      {
        path: "provider/notification-preferences",
        Component: ProviderNotificationPreferences,
      },
      {
        path: "provider/privacy-security",
        Component: ProviderPrivacySecurity,
      },
      {
        path: "provider/support-ticket",
        Component: ProviderSupportTicket,
      },
      {
        path: "provider/service-history",
        Component: ProviderServiceHistory,
      },
      {
        path: "provider/counter-offer",
        Component: ProviderCounterOffer,
      },
      {
        path: "provider/my-bookings",
        Component: ProviderMyBookings,
      },
      {
        path: "provider/booking-details/:id",
        Component: ProviderBookingDetails,
      },
      {
        path: "provider/navigation-mode/:id",
        Component: ProviderNavigationMode,
      },
      {
        path: "provider/start-service/:id",
        Component: ProviderStartService,
      },
      {
        path: "provider/service-in-progress/:id",
        Component: ProviderServiceInProgress,
      },
      {
        path: "provider/additional-charges/:id",
        Component: ProviderAdditionalCharges,
      },
      {
        path: "provider/complete-service/:id",
        Component: ProviderCompleteService,
      },
      {
        path: "provider/service-completed/:id",
        Component: ProviderServiceCompleted,
      },
      {
        path: "provider/reschedule/:id",
        Component: ProviderRescheduleRequest,
      },
      {
        path: "provider/cancel-booking/:id",
        Component: ProviderCancelBooking,
      },
      {
        path: "provider/messages/:id",
        Component: ProviderMessages,
      },
      {
        path: "provider/conversation/:customerId",
        Component: ProviderConversation,
      },
      {
        path: "provider/reviews",
        Component: ProviderReviews,
      },
      {
        path: "provider/calendar",
        Component: ProviderCalendar,
      },
      {
        path: "provider/set-availability",
        Component: ProviderSetAvailability,
      },
      {
        path: "provider/service-area-setup",
        Component: ProviderServiceAreaSetup,
      },
      {
        path: "provider/tutorial",
        Component: ProviderTutorialPage,
      },
      {
        path: "provider/payout-management",
        Component: ProviderPayoutManagement,
      },
      {
        path: "provider/request-payout",
        Component: ProviderRequestPayout,
      },
      {
        path: "provider/service-receipt/:id",
        Component: ProviderServiceReceipt,
      },
      {
        path: "provider/progress-photo-upload/:id",
        Component: ProviderProgressPhotoUpload,
      },
      {
        path: "provider/job-update/:id",
        Component: ProviderJobUpdateMessage,
      },
      {
        path: "provider/request-additional-payment/:id",
        Component: ProviderRequestAdditionalPayment,
      },
      {
        path: "provider/break-status/:id",
        Component: ProviderBreakStatus,
      },
      {
        path: "provider/booking/:id/report-issue",
        Component: ProviderReportIssue,
      },
      {
        path: "provider/complete",
        Component: ProviderCompletePage,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);