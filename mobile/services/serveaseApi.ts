import { resolveGatewayBaseUrl } from './gatewayConfig';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface CatalogCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface CatalogServiceItem {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number | null;
  pricingMode: 'flat' | 'hourly';
}

export interface ProviderListing {
  id: string;
  providerId: string;
  providerBusinessName: string | null;
  serviceId: string | null;
  title: string;
  description: string | null;
  price: number | null;
  pricingMode: 'flat' | 'hourly';
  averageRating: number;
  reviewCount: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

export interface ProviderOwnedServiceInput {
  id?: string | null;
  serviceId?: string | null;
  title: string;
  description?: string | null;
  price?: number | null;
  pricingMode?: 'flat' | 'hourly' | null;
  isActive?: boolean | null;
}

export interface ProviderOwnedServiceSummary extends ProviderListing {
  isActive: boolean;
}

export interface ProviderDashboardBooking {
  id: string;
  scheduledAt: string;
  time: string;
  customerName: string | null;
  serviceTitle: string | null;
  location: string | null;
  status: BookingStatus;
}

export interface ProviderDashboardSummary {
  summary: {
    newRequests: number;
    todayBookings: number;
    todayCompleted: number;
    todayEarnings: number;
    totalEarnings: number;
    overallRating: number;
    reviewCount: number;
  };
  upcomingBookings: ProviderDashboardBooking[];
  performance: {
    acceptanceRate: number;
    completionRate: number;
    responseTimeMinutes: number | null;
  };
}

export interface ProviderProfileSnapshot {
  account: {
    id: string;
    email: string;
    fullName: string | null;
    contactNumber: string | null;
    role: UserRole;
    status: UserStatus;
  };
  provider: {
    id: string;
    businessName: string | null;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    averageRating: number;
    reviewCount: number;
  };
  services: ProviderListing[];
  portfolio: ProviderPortfolioMediaSummary[];
}

export type BookingPricingMode = 'flat' | 'hourly';

export interface BookingSummary {
  id: string;
  bookingReference: string;
  customerId: string;
  customerFullName?: string | null;
  customerContactNumber?: string | null;
  providerId: string;
  providerBusinessName?: string | null;
  serviceId: string | null;
  serviceTitle: string | null;
  serviceDescription?: string | null;
  serviceAddress: string | null;
  scheduledAt: string;
  hoursRequired?: number | null;
  serviceAmount?: number | null;
  pricingMode?: BookingPricingMode | null;
  customerNotes?: string | null;
  status: BookingStatus;
  totalAmount: number;
  attachments?: BookingAttachmentSummary[];
}

export type BookingTrackingPhase =
  | 'awaiting_confirmation'
  | 'scheduled'
  | 'on_the_way'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type BookingTrackingTrafficLevel = 'light' | 'moderate' | 'heavy';

export interface BookingTrackingLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  headingDegrees?: number | null;
  speedMps?: number | null;
  updatedAt?: string | null;
}

export interface BookingTrackingSnapshot {
  bookingId: string;
  bookingReference: string;
  status: BookingStatus;
  phase: BookingTrackingPhase;
  etaMinutes: number | null;
  distanceKm: number | null;
  trafficLevel: BookingTrackingTrafficLevel | null;
  destinationAddress: string | null;
  destinationLocation: BookingTrackingLocation | null;
  providerLocation: BookingTrackingLocation | null;
  scheduledAt: string;
  lastUpdatedAt: string;
}

export interface UpdateBookingLiveLocationRequest {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  headingDegrees?: number | null;
  speedMps?: number | null;
}

export interface ConversationSummary {
  id: string;
  bookingId: string | null;
  customerId: string | null;
  providerId: string | null;
  lastMessageAt: string | null;
  createdAt: string | null;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'provider';
  content: string;
  deliveryStatus: string | null;
  createdAt: string | null;
  attachment: ConversationMessageAttachment | null;
}

export interface ConversationMessageAttachment {
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
}

export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface PaymentSummary {
  id: string;
  bookingId: string;
  customerId: string | null;
  providerId: string | null;
  amount: number;
  platformFee: number;
  providerPayout: number;
  status: PaymentStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string | null;
  failureReason?: string | null;
  failureCode?: string | null;
  retryCount?: number;
  lastRetryAt?: string | null;
  disputeId?: string | null;
  apicenterCheckoutId?: string | null;
  apicenterCheckoutStatus?: string | null;
  apicenterProvider?: string | null;
  apicenterProviderMode?: string | null;
}

export interface CreatePaymentRequest {
  bookingId: string;
  paymentMethod: string;
  promoCode?: string | null;
}

export type SharedPaymentMethod =
  | 'qrph'
  | 'gcash'
  | 'grab_pay'
  | 'grabpay'
  | 'paymaya'
  | 'maya'
  | 'card'
  | 'visa'
  | 'mastercard'
  | 'dob'
  | 'brankas'
  | 'direct_online_banking'
  | 'online_banking';

export interface CreateCheckoutSessionRequest {
  bookingId: string;
  successUrl: string;
  cancelUrl: string;
  promoCode?: string | null;
  paymentMethods?: SharedPaymentMethod[];
}

export interface PaymentCheckoutSessionSummary {
  checkoutId: string;
  provider: 'paymongo' | 'mock';
  providerMode?: 'test' | 'live';
  status:
    | 'created'
    | 'pending'
    | 'paid'
    | 'failed'
    | 'cancelled'
    | 'expired'
    | 'refunded'
    | 'partially_refunded';
  referenceId: string;
  redirectUrl: string;
  expiresAt?: string;
  amount?: {
    value: number;
    currency: string;
  };
  currency?: string;
  paymentMethodsAllowed?: string[];
  metadata?: Record<string, string>;
  paymentId?: string;
  bookingId?: string;
  localPaymentStatus?: PaymentStatus;
  paidAt?: string | null;
}

export interface PromotionValidationSummary {
  code: string;
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export type PayoutMethodType = 'bank' | 'gcash' | 'paymaya';
export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'cancelled';
export type CustomerPaymentMethodType =
  | 'cash_on_service'
  | 'card'
  | 'gcash'
  | 'paymaya';

export interface CustomerPaymentMethodSummary {
  id: string;
  customerId: string;
  methodType: CustomerPaymentMethodType;
  label: string;
  brand: string | null;
  last4: string | null;
  isDefault: boolean;
  createdAt: string | null;
}

export interface UpsertCustomerPaymentMethodRequest {
  methodId?: string | null;
  methodType: CustomerPaymentMethodType;
  label: string;
  brand?: string | null;
  last4?: string | null;
  isDefault?: boolean | null;
}

export interface PayoutMethodSummary {
  id: string;
  providerId: string;
  methodType: PayoutMethodType;
  accountLabel: string;
  accountName: string | null;
  accountNumberLast4: string | null;
  isDefault: boolean;
  createdAt: string | null;
}

export interface UpsertPayoutMethodRequest {
  methodId?: string | null;
  methodType: PayoutMethodType;
  accountLabel: string;
  accountName?: string | null;
  accountNumberLast4?: string | null;
  isDefault?: boolean | null;
}

export interface PayoutAccountSummary {
  availableBalance: number;
  pendingBalance: number;
  totalPaidOut: number;
  nextPayoutDate: string | null;
}

export interface PayoutSummary {
  id: string;
  paymentId: string | null;
  providerId: string;
  amount: number;
  processingFee: number;
  netAmount: number;
  status: PayoutStatus;
  payoutMethodId: string | null;
  methodType: string | null;
  accountLabel: string | null;
  reference: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  requestedAt: string | null;
  paidAt: string | null;
  createdAt: string | null;
}

export interface ReviewSummary {
  id: string;
  bookingId: string;
  providerId: string;
  reviewerId: string;
  reviewerFullName: string | null;
  rating: number;
  reviewText: string | null;
  isFlagged: boolean;
  createdAt: string | null;
}

export interface ReviewResponseSummary {
  id: string;
  reviewId: string;
  responderId: string;
  responseText: string;
  createdAt: string | null;
}

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  reviewText?: string | null;
}

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicketSummary {
  id: string;
  userId: string;
  subject: string;
  message: string | null;
  category: string | null;
  status: SupportTicketStatus;
  createdAt: string | null;
  attachments?: SupportTicketAttachmentSummary[];
}

export interface CreateSupportTicketRequest {
  subject: string;
  message?: string | null;
  category?: string | null;
  attachments?: MediaAttachmentInput[];
}

export interface SupportTicketReplySummary {
  id: string;
  ticketId: string;
  repliedBy: string;
  message: string;
  createdAt: string | null;
}

export interface NotificationSummary {
  id: string;
  userId: string;
  type: string;
  title: string | null;
  body: string | null;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string | null;
}

export type PushDevicePlatform = 'android' | 'ios' | 'web';

export interface RegisterPushDeviceRequest {
  token: string;
  platform: PushDevicePlatform;
  deviceId?: string | null;
}

export interface PushDeviceSummary {
  id: string;
  userId: string;
  token: string;
  platform: PushDevicePlatform;
  deviceId: string | null;
  isActive: boolean;
  lastRegisteredAt: string | null;
  createdAt: string | null;
}

export interface ReferralSummary {
  referralCode: string;
  referralLinkPath: string;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
}

export interface UserPreferenceSummary {
  userId: string;
  pushNotificationsEnabled: boolean;
  darkModeEnabled: boolean;
  language: 'en' | 'fil';
  notificationPreferences: Record<string, unknown>;
  updatedAt: string | null;
}

export interface UpdateUserPreferencesRequest {
  pushNotificationsEnabled?: boolean | null;
  darkModeEnabled?: boolean | null;
  language?: 'en' | 'fil' | null;
  notificationPreferences?: Record<string, unknown> | null;
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface AvailabilityWindowInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive?: boolean | null;
}

export interface AvailabilityWindow {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProviderDayOff {
  id: string;
  offDate: string;
  reason: string | null;
}

export interface ProviderTimeOffWindow {
  id: string;
  offDate: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export interface ProviderAvailabilitySchedule {
  providerId: string;
  windows: AvailabilityWindow[];
  daysOff: ProviderDayOff[];
  timeOffWindows: ProviderTimeOffWindow[];
}

export type UserRole = 'customer' | 'provider' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface CurrentUserProfile {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    contactNumber: string | null;
    role: UserRole;
    status: UserStatus;
  };
  customerProfile: {
    id: string;
    address: string | null;
  } | null;
  customerAddresses: CustomerAddressSummary[];
  providerProfile: {
    id: string;
    businessName: string | null;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    averageRating: number;
    reviewCount: number;
  } | null;
}

export interface CustomerAddressSummary {
  id: string;
  userId: string;
  label: string;
  address: string;
  barangay: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateCustomerAddressRequest {
  label?: string | null;
  address: string;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean | null;
}

export type UpdateCustomerAddressRequest = Partial<CreateCustomerAddressRequest>;

export interface RegisterAccountRequest {
  role: 'customer' | 'provider';
  email: string;
  password: string;
  fullName: string;
  contactNumber?: string | null;
  birthdate?: string | null;
  address?: string | null;
  businessName?: string | null;
  serviceId?: string | null;
  serviceDescription?: string | null;
  serviceArea?: string | null;
}

export interface RegisteredAccountResponse extends CurrentUserProfile {}

export interface PasswordResetRequest {
  email: string;
  redirectTo?: string | null;
}

export interface PasswordResetResponse {
  ok: true;
}

export interface OtpGenerateRequest {
  target: string;
  channel: 'sms' | 'email';
  length?: number;
  expiresInSeconds?: number;
}

export interface OtpGenerateResponse {
  otpId: string;
  expiresAt: string;
  channel: string;
  target: string;
  code?: string;
}

export interface OtpVerifyResponse {
  valid: boolean;
  target: string;
  channel: string;
}

export interface GoogleAuthorizationUrlRequest {
  redirectUri: string;
  state?: string;
  scopes?: string[];
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  accessType?: 'online' | 'offline';
  prompt?: string;
  loginHint?: string;
  includeGrantedScopes?: boolean;
}

export interface GoogleAuthorizationUrlResponse {
  authorizationUrl: string;
  state?: string;
  expiresAt?: string;
}

export interface GoogleTokenExchangeRequest {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}

export interface GoogleOAuthTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  refreshToken?: string | null;
}

export interface GeoAddressResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  types?: string[];
  provider: 'google-maps' | 'mock';
  raw?: unknown;
}

export interface GeoFenceCheckResponse {
  inside: boolean;
  distanceDetails: Array<{
    fenceId: string;
    name?: string;
    inside: boolean;
    distanceMeters: number;
    radiusMeters: number;
  }>;
  provider: 'local';
}

export interface GeoRouteLocation {
  latitude: number;
  longitude: number;
}

export interface GeoDirectionsStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  name?: string;
  type?: number;
  wayPoints?: [number, number];
}

export interface GeoDirectionsRoute {
  provider: 'openrouteservice';
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoRouteLocation[];
  steps: GeoDirectionsStep[];
  bbox?: [number, number, number, number];
  raw?: unknown;
}

export interface UpdateCurrentUserProfileRequest {
  fullName: string;
  contactNumber?: string | null;
  address?: string | null;
  businessName?: string | null;
}

export interface UpdateCurrentUserPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateCurrentUserPasswordResponse {
  ok: true;
}

export interface TwoFactorProvisioningResponse {
  enabled: false;
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  verifiedAt: string | null;
}

export interface CurrentUserSessionSummary {
  id: string;
  email: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  isCurrent: boolean;
}

export type UploadKind =
  | 'booking_reference'
  | 'support_evidence'
  | 'message_attachment'
  | 'provider_portfolio'
  | 'provider_progress'
  | 'provider_document';

export interface UploadSummary {
  bucket: string;
  path: string;
  publicUrl: string;
  kind: UploadKind;
  contentType: string;
  size: number;
}

export interface UploadMediaRequest {
  kind: UploadKind;
  uri: string;
  name?: string | null;
  contentType?: string | null;
  documentType?: string | null;
}

export interface MediaAttachmentInput {
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  storagePath?: string | null;
  fileSize?: number | null;
  caption?: string | null;
}

export type BookingAttachmentKind = 'booking_reference' | 'provider_progress';

export interface BookingAttachmentInput extends MediaAttachmentInput {
  mediaKind: BookingAttachmentKind;
}

export interface BookingAttachmentSummary {
  id: string;
  bookingId: string;
  uploadedBy: string | null;
  mediaKind: BookingAttachmentKind;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
  caption: string | null;
  createdAt: string | null;
}

export type BookingServiceUpdateType = 'checklist' | 'progress' | 'completion';

export interface BookingServiceChecklist {
  scopeConfirmed?: boolean;
  toolsReady?: boolean;
  instructionsReviewed?: boolean;
}

export interface CreateBookingServiceUpdateRequest {
  updateType: BookingServiceUpdateType;
  message?: string | null;
  checklist?: BookingServiceChecklist | null;
  attachmentId?: string | null;
}

export interface BookingServiceUpdateSummary {
  id: string;
  bookingId: string;
  actorId: string;
  updateType: BookingServiceUpdateType;
  message: string | null;
  checklist: BookingServiceChecklist | null;
  attachmentId: string | null;
  createdAt: string | null;
}

export interface BookingTimelineEventSummary {
  id: string;
  bookingId: string;
  eventType: string;
  label: string | null;
  icon: string | null;
  createdAt: string | null;
}

export interface SupportTicketAttachmentSummary {
  id: string;
  ticketId: string;
  uploadedBy: string | null;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
  createdAt: string | null;
}

export interface ProviderPortfolioMediaSummary {
  id: string;
  providerId: string;
  uploadedBy: string | null;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
  caption: string | null;
  sortOrder: number;
  createdAt: string | null;
}

export interface ProviderPortfolioOrderItem {
  id: string;
  sortOrder: number;
}

export type BookingDisputeStatus = 'open' | 'resolved' | 'closed';

export interface BookingDisputeSummary {
  id: string;
  bookingId: string;
  raisedBy: string;
  category: string | null;
  reason: string;
  description: string | null;
  status: BookingDisputeStatus;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string | null;
}

export interface RaiseBookingDisputeRequest {
  category: string;
  reason: string;
  description?: string | null;
}

export interface CreateBookingRequest {
  providerId: string;
  serviceId?: string | null;
  serviceTitle?: string | null;
  serviceName?: string | null;
  serviceDescription?: string | null;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  serviceAmount?: number | null;
  pricingMode?: 'flat' | 'hourly' | null;
  acceptedQuoteId?: string | null;
  paymentMethod?: string | null;
  customerNotes?: string | null;
  attachments?: BookingAttachmentInput[];
}

export type PricingUrgency = 'standard' | 'priority' | 'emergency';
export type PricingFairnessStatus = 'below_range' | 'within_range' | 'above_range';
export type PricingConfidence = 'high' | 'medium' | 'low';

export interface PricingRouteLocation {
  latitude: number;
  longitude: number;
}

export interface CreatePricingQuoteRequest {
  providerId: string;
  serviceId: string;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  bookingUrgency?: PricingUrgency | null;
  region?: string | null;
  origin?: PricingRouteLocation | null;
  destination?: PricingRouteLocation | null;
}

export interface PricingQuoteLineItem {
  code: 'labor' | 'travel_fuel' | 'urgency' | 'adjustment';
  label: string;
  amount: number;
}

export interface PricingQuoteSummary {
  quoteId: string;
  expiresAt: string;
  currency: 'PHP';
  estimatedTotal: number;
  fairRangeMin: number;
  fairRangeMax: number;
  fairnessStatus: PricingFairnessStatus;
  confidence: PricingConfidence;
  lineItems: PricingQuoteLineItem[];
  signals: {
    distanceKm: number | null;
    durationMinutes: number | null;
    fuelPricePerLiter: number;
    fuelIndexUpdatedAt: string | null;
    staleFuelIndex: boolean;
    fallbackUsed: boolean;
  };
  explanation: string;
}

export interface ApiOptions {
  baseUrl?: string;
  token?: string;
  fetcher?: (url: string, init?: RequestInit) => Promise<Response>;
  xhrFactory?: () => XMLHttpRequest;
}

export interface IdempotentApiOptions extends ApiOptions {
  idempotencyKey?: string | null;
}

export interface BookingTrackingStreamHandlers {
  onSnapshot: (snapshot: BookingTrackingSnapshot) => void;
  onError?: (error: Error) => void;
}

export interface BookingTrackingStreamSubscription {
  close: () => void;
}

let generatedIdempotencyCounter = 0;

export function createProviderPayoutIdempotencyKey(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return `mobile-provider-payout-${randomUuid}`;
  }

  generatedIdempotencyCounter += 1;
  return `mobile-provider-payout-${Date.now()}-${generatedIdempotencyCounter}`;
}

export function listCatalogCategories(
  options: ApiOptions = {},
): Promise<CatalogCategory[]> {
  return request<CatalogCategory[]>('/v1/catalog/categories', {
    ...options,
    method: 'GET',
  });
}

export function listCatalogServices(
  categoryId: string | null,
  options: ApiOptions = {},
): Promise<CatalogServiceItem[]> {
  const path = categoryId
    ? `/v1/catalog/services?categoryId=${encodeURIComponent(categoryId)}`
    : '/v1/catalog/services';
  return request<CatalogServiceItem[]>(path, {
    ...options,
    method: 'GET',
  });
}

export function listProviderListings(
  serviceId: string | null,
  options: ApiOptions = {},
): Promise<ProviderListing[]> {
  const path = serviceId
    ? `/v1/catalog/providers?serviceId=${encodeURIComponent(serviceId)}`
    : '/v1/catalog/providers';
  return request<ProviderListing[]>(path, {
    ...options,
    method: 'GET',
  });
}

export function listProviderPortfolioMedia(
  providerId: string,
  options: ApiOptions = {},
): Promise<ProviderPortfolioMediaSummary[]> {
  return request<ProviderPortfolioMediaSummary[]>(
    `/v1/catalog/providers/${encodeURIComponent(providerId)}/portfolio`,
    {
      ...options,
      method: 'GET',
    },
  );
}

export function addProviderPortfolioMedia(
  body: MediaAttachmentInput,
  options: ApiOptions = {},
): Promise<ProviderPortfolioMediaSummary> {
  return request<ProviderPortfolioMediaSummary>('/v1/catalog/provider/portfolio', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function deleteProviderPortfolioMedia(
  mediaId: string,
  options: ApiOptions = {},
): Promise<void> {
  return request<void>(
    `/v1/catalog/provider/portfolio/${encodeURIComponent(mediaId)}`,
    {
      ...options,
      method: 'DELETE',
      requiresAuth: true,
    },
  );
}

export function updateProviderPortfolioMedia(
  mediaId: string,
  body: MediaAttachmentInput,
  options: ApiOptions = {},
): Promise<ProviderPortfolioMediaSummary> {
  return request<ProviderPortfolioMediaSummary>(
    `/v1/catalog/provider/portfolio/${encodeURIComponent(mediaId)}`,
    {
      ...options,
      method: 'PUT',
      body,
      requiresAuth: true,
    },
  );
}

export function reorderProviderPortfolio(
  items: ProviderPortfolioOrderItem[],
  options: ApiOptions = {},
): Promise<ProviderPortfolioMediaSummary[]> {
  return request<ProviderPortfolioMediaSummary[]>('/v1/catalog/provider/portfolio/order', {
    ...options,
    method: 'PUT',
    body: { items },
    requiresAuth: true,
  });
}

export function getCurrentUser(
  options: ApiOptions = {},
): Promise<CurrentUserProfile> {
  return request<CurrentUserProfile>('/v1/me', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function listCustomerAddresses(
  options: ApiOptions = {},
): Promise<CustomerAddressSummary[]> {
  return request<CustomerAddressSummary[]>('/v1/me/addresses', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function createCustomerAddress(
  body: CreateCustomerAddressRequest,
  options: ApiOptions = {},
): Promise<CustomerAddressSummary> {
  return request<CustomerAddressSummary>('/v1/me/addresses', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function updateCustomerAddress(
  addressId: string,
  body: UpdateCustomerAddressRequest,
  options: ApiOptions = {},
): Promise<CustomerAddressSummary> {
  return request<CustomerAddressSummary>(
    `/v1/me/addresses/${encodeURIComponent(addressId)}`,
    {
      ...options,
      method: 'PATCH',
      body,
      requiresAuth: true,
    },
  );
}

export function setDefaultCustomerAddress(
  addressId: string,
  options: ApiOptions = {},
): Promise<CustomerAddressSummary> {
  return request<CustomerAddressSummary>(
    `/v1/me/addresses/${encodeURIComponent(addressId)}/default`,
    {
      ...options,
      method: 'POST',
      requiresAuth: true,
    },
  );
}

export function deleteCustomerAddress(
  addressId: string,
  options: ApiOptions = {},
): Promise<{ ok: true }> {
  return request<{ ok: true }>(
    `/v1/me/addresses/${encodeURIComponent(addressId)}`,
    {
      ...options,
      method: 'DELETE',
      requiresAuth: true,
    },
  );
}

export function registerAccount(
  body: RegisterAccountRequest,
  options: ApiOptions = {},
): Promise<RegisteredAccountResponse> {
  return request<RegisteredAccountResponse>('/v1/auth/register', {
    ...options,
    method: 'POST',
    body,
  });
}

export function requestPasswordReset(
  body: PasswordResetRequest,
  options: ApiOptions = {},
): Promise<PasswordResetResponse> {
  return request<PasswordResetResponse>('/v1/auth/password-reset', {
    ...options,
    method: 'POST',
    body,
  });
}

export function generateOtp(
  body: OtpGenerateRequest,
  options: ApiOptions = {},
): Promise<OtpGenerateResponse> {
  return request<OtpGenerateResponse>('/v1/auth/otp/generate', {
    ...options,
    method: 'POST',
    body,
  });
}

export function verifyOtp(
  otpId: string,
  code: string,
  options: ApiOptions = {},
): Promise<OtpVerifyResponse> {
  return request<OtpVerifyResponse>('/v1/auth/otp/verify', {
    ...options,
    method: 'POST',
    body: { otpId, code },
  });
}

export function getGoogleAuthorizationUrl(
  body: GoogleAuthorizationUrlRequest,
  options: ApiOptions = {},
): Promise<GoogleAuthorizationUrlResponse> {
  return request<GoogleAuthorizationUrlResponse>('/v1/auth/google/authorize', {
    ...options,
    method: 'POST',
    body,
  });
}

export function exchangeGoogleCode(
  body: GoogleTokenExchangeRequest,
  options: ApiOptions = {},
): Promise<GoogleOAuthTokenResponse> {
  return request<GoogleOAuthTokenResponse>('/v1/auth/google/token', {
    ...options,
    method: 'POST',
    body,
  });
}

export type ProviderApplicationVerificationStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export interface ProviderApplicationStatus {
  id: string;
  applicationReference: string;
  businessName: string | null;
  serviceArea: string | null;
  serviceDescription: string | null;
  verificationStatus: ProviderApplicationVerificationStatus;
  latestDecisionReason: string | null;
  latestDecisionAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function getMyProviderApplication(
  options: ApiOptions = {},
): Promise<ProviderApplicationStatus> {
  return request<ProviderApplicationStatus>('/v1/auth/provider-application/me', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function updateCurrentUserProfile(
  body: UpdateCurrentUserProfileRequest,
  options: ApiOptions = {},
): Promise<CurrentUserProfile> {
  return request<CurrentUserProfile>('/v1/me', {
    ...options,
    method: 'PATCH',
    body,
    requiresAuth: true,
  });
}

export function updateCurrentUserPassword(
  body: UpdateCurrentUserPasswordRequest,
  options: ApiOptions = {},
): Promise<UpdateCurrentUserPasswordResponse> {
  return request<UpdateCurrentUserPasswordResponse>('/v1/me/password', {
    ...options,
    method: 'PATCH',
    body,
    requiresAuth: true,
  });
}

export function deleteCurrentUserAccount(
  options: ApiOptions = {},
): Promise<{ ok: true }> {
  return request<{ ok: true }>('/v1/me', {
    ...options,
    method: 'DELETE',
    requiresAuth: true,
  });
}

export function listCurrentUserSessions(
  options: ApiOptions = {},
): Promise<CurrentUserSessionSummary[]> {
  return request<CurrentUserSessionSummary[]>('/v1/me/sessions', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function enableCurrentUserTwoFactor(
  options: ApiOptions = {},
): Promise<TwoFactorProvisioningResponse> {
  return request<TwoFactorProvisioningResponse>('/v1/me/two-factor/enable', {
    ...options,
    method: 'POST',
    requiresAuth: true,
  });
}

export function verifyCurrentUserTwoFactor(
  code: string,
  options: ApiOptions = {},
): Promise<TwoFactorStatusResponse> {
  return request<TwoFactorStatusResponse>('/v1/me/two-factor/verify', {
    ...options,
    method: 'POST',
    body: { code },
    requiresAuth: true,
  });
}

export function disableCurrentUserTwoFactor(
  code?: string | null,
  options: ApiOptions = {},
): Promise<TwoFactorStatusResponse> {
  return request<TwoFactorStatusResponse>('/v1/me/two-factor/disable', {
    ...options,
    method: 'POST',
    body: { code: code ?? null },
    requiresAuth: true,
  });
}

export function createBooking(
  body: CreateBookingRequest,
  options: ApiOptions = {},
): Promise<BookingSummary> {
  return request<BookingSummary>('/v1/bookings', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function createPricingQuote(
  body: CreatePricingQuoteRequest,
  options: ApiOptions = {},
): Promise<PricingQuoteSummary> {
  return request<PricingQuoteSummary>('/v1/pricing/quotes', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function createBookingAttachment(
  bookingId: string,
  body: BookingAttachmentInput,
  options: ApiOptions = {},
): Promise<BookingAttachmentSummary> {
  return request<BookingAttachmentSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/attachments`,
    {
      ...options,
      method: 'POST',
      body,
      requiresAuth: true,
    },
  );
}

export function deleteBookingAttachment(
  bookingId: string,
  attachmentId: string,
  options: ApiOptions = {},
): Promise<BookingAttachmentSummary> {
  return request<BookingAttachmentSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/attachments/${encodeURIComponent(attachmentId)}`,
    {
      ...options,
      method: 'DELETE',
      requiresAuth: true,
    },
  );
}

export function raiseBookingDispute(
  bookingId: string,
  body: RaiseBookingDisputeRequest,
  options: ApiOptions = {},
): Promise<BookingDisputeSummary> {
  return request<BookingDisputeSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/disputes`,
    {
      ...options,
      method: 'POST',
      body,
      requiresAuth: true,
    },
  );
}

export function listBookingServiceUpdates(
  bookingId: string,
  options: ApiOptions = {},
): Promise<BookingServiceUpdateSummary[]> {
  return request<BookingServiceUpdateSummary[]>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/service-updates`,
    {
      ...options,
      method: 'GET',
      requiresAuth: true,
    },
  );
}

export function listBookingTimelineEvents(
  bookingId: string,
  options: ApiOptions = {},
): Promise<BookingTimelineEventSummary[]> {
  return request<BookingTimelineEventSummary[]>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/timeline`,
    {
      ...options,
      method: 'GET',
      requiresAuth: true,
    },
  );
}

export function getBookingTrackingSnapshot(
  bookingId: string,
  options: ApiOptions = {},
): Promise<BookingTrackingSnapshot> {
  return request<BookingTrackingSnapshot>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/tracking`,
    {
      ...options,
      method: 'GET',
      requiresAuth: true,
    },
  );
}

export function subscribeBookingTrackingSnapshots(
  bookingId: string,
  options: ApiOptions,
  handlers: BookingTrackingStreamHandlers,
): BookingTrackingStreamSubscription {
  if (!options.token?.trim()) {
    throw new Error('Paste an access token before using booking routes.');
  }

  const resolvedBaseUrl =
    options.baseUrl?.replace(/\/$/, '') ?? resolveGatewayBaseUrl();
  const streamUrl = `${resolvedBaseUrl}/v1/bookings/${encodeURIComponent(
    bookingId,
  )}/tracking/stream`;
  const xhrFactory =
    options.xhrFactory ?? (() => new globalThis.XMLHttpRequest());
  const reconnectDelayMs = 2500;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let xhr: XMLHttpRequest | null = null;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (closed || reconnectTimer) {
      return;
    }
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectDelayMs);
  };

  const reportError = (message: string) => {
    handlers.onError?.(new Error(message));
  };

  const connect = () => {
    if (closed) {
      return;
    }

    let readOffset = 0;
    let pending = '';
    const request = xhrFactory();
    xhr = request;
    request.open('GET', streamUrl, true);
    request.setRequestHeader('accept', 'text/event-stream');
    request.setRequestHeader('authorization', `Bearer ${options.token!.trim()}`);

    const drainEvents = () => {
      const nextChunk = request.responseText.slice(readOffset);
      readOffset = request.responseText.length;
      pending += nextChunk.replace(/\r\n/g, '\n');

      const events = pending.split('\n\n');
      pending = events.pop() ?? '';
      events.forEach((rawEvent) => readTrackingStreamEvent(rawEvent, handlers));
    };

    request.onprogress = drainEvents;
    request.onload = () => {
      if (closed) {
        return;
      }
      drainEvents();
      if (request.status >= 400 && request.status < 500) {
        reportError(`Tracking stream failed with ${request.status}.`);
        return;
      }
      scheduleReconnect();
    };
    request.onerror = () => {
      if (!closed) {
        reportError('Tracking stream disconnected.');
        scheduleReconnect();
      }
    };
    request.send();
  };

  connect();

  return {
    close: () => {
      closed = true;
      clearReconnectTimer();
      xhr?.abort();
    },
  };
}

export function updateBookingLiveLocation(
  bookingId: string,
  body: UpdateBookingLiveLocationRequest,
  options: ApiOptions = {},
): Promise<BookingTrackingLocation> {
  return request<BookingTrackingLocation>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/tracking/location`,
    {
      ...options,
      method: 'PATCH',
      body,
      requiresAuth: true,
    },
  );
}

export function createBookingServiceUpdate(
  bookingId: string,
  body: CreateBookingServiceUpdateRequest,
  options: ApiOptions = {},
): Promise<BookingServiceUpdateSummary> {
  return request<BookingServiceUpdateSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/service-updates`,
    {
      ...options,
      method: 'POST',
      body,
      requiresAuth: true,
    },
  );
}

export function listCustomerBookings(
  options: ApiOptions = {},
): Promise<BookingSummary[]> {
  return request<BookingSummary[]>('/v1/bookings', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function listProviderBookings(
  options: ApiOptions = {},
): Promise<BookingSummary[]> {
  return request<BookingSummary[]>('/v1/bookings?scope=provider', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function getBooking(
  bookingId: string,
  options: ApiOptions = {},
): Promise<BookingSummary> {
  return request<BookingSummary>(`/v1/bookings/${encodeURIComponent(bookingId)}`, {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function transitionBookingStatus(
  bookingId: string,
  body: {
    currentStatus: BookingStatus;
    nextStatus: BookingStatus;
    reason?: string | null;
    explanation?: string | null;
  },
  options: ApiOptions = {},
): Promise<BookingSummary> {
  return request<BookingSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/status`,
    {
      ...options,
      method: 'PATCH',
      body,
      requiresAuth: true,
    },
  );
}

export function listConversations(
  options: ApiOptions = {},
): Promise<ConversationSummary[]> {
  return request<ConversationSummary[]>('/v1/conversations', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function openConversation(
  bookingId: string,
  options: ApiOptions = {},
): Promise<ConversationSummary> {
  return request<ConversationSummary>('/v1/conversations', {
    ...options,
    method: 'POST',
    body: { bookingId },
    requiresAuth: true,
  });
}

export function listConversationMessages(
  conversationId: string,
  options: ApiOptions = {},
): Promise<ConversationMessage[]> {
  return request<ConversationMessage[]>(
    `/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      ...options,
      method: 'GET',
      requiresAuth: true,
    },
  );
}

export function createConversationMessage(
  conversationId: string,
  content: string,
  attachmentOrOptions: ConversationMessageAttachment | ApiOptions | null = null,
  maybeOptions: ApiOptions = {},
): Promise<ConversationMessage> {
  const hasAttachment =
    attachmentOrOptions !== null &&
    typeof attachmentOrOptions === 'object' &&
    'fileUrl' in attachmentOrOptions;
  const attachment = hasAttachment
    ? (attachmentOrOptions as ConversationMessageAttachment)
    : null;
  const options = hasAttachment
    ? maybeOptions
    : ((attachmentOrOptions as ApiOptions | null) ?? maybeOptions);

  return request<ConversationMessage>(
    `/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      ...options,
      method: 'POST',
      body: { content, attachment },
      requiresAuth: true,
    },
  );
}

export function listPayments(options: ApiOptions = {}): Promise<PaymentSummary[]> {
  return request<PaymentSummary[]>('/v1/payments', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function createPayment(
  body: CreatePaymentRequest,
  options: ApiOptions = {},
): Promise<PaymentSummary> {
  return request<PaymentSummary>('/v1/payments', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function createCheckoutSession(
  body: CreateCheckoutSessionRequest,
  options: ApiOptions = {},
): Promise<PaymentCheckoutSessionSummary> {
  return request<PaymentCheckoutSessionSummary>('/v1/payments/checkout-sessions', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function getCheckoutStatus(
  checkoutId: string,
  options: ApiOptions = {},
): Promise<PaymentCheckoutSessionSummary> {
  return request<PaymentCheckoutSessionSummary>(
    `/v1/payments/checkout-sessions/${encodeURIComponent(checkoutId)}/status`,
    {
      ...options,
      method: 'GET',
      requiresAuth: true,
    },
  );
}

export function geocodeAddress(
  address: string,
  options: ApiOptions & { language?: string; region?: string } = {},
): Promise<GeoAddressResult> {
  const { language, region, ...apiOptions } = options;
  return request<GeoAddressResult>('/v1/geo/geocode', {
    ...apiOptions,
    method: 'POST',
    body: { address, language, region },
    requiresAuth: true,
  });
}

export function reverseGeocode(
  latitude: number,
  longitude: number,
  options: ApiOptions & { language?: string } = {},
): Promise<GeoAddressResult> {
  const { language, ...apiOptions } = options;
  return request<GeoAddressResult>('/v1/geo/reverse-geocode', {
    ...apiOptions,
    method: 'POST',
    body: { latitude, longitude, language },
    requiresAuth: true,
  });
}

export function checkGeoFence(
  body: {
    latitude: number;
    longitude: number;
    fenceId?: string;
  },
  options: ApiOptions = {},
): Promise<GeoFenceCheckResponse> {
  return request<GeoFenceCheckResponse>('/v1/geo/geofence/check', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function getDirections(
  body: {
    origin: GeoRouteLocation;
    destination: GeoRouteLocation;
    profile?: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking';
    language?: string;
  },
  options: ApiOptions = {},
): Promise<GeoDirectionsRoute> {
  return request<GeoDirectionsRoute>('/v1/geo/directions', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function validatePromotion(
  bookingId: string,
  code: string,
  options: ApiOptions = {},
): Promise<PromotionValidationSummary> {
  return request<PromotionValidationSummary>('/v1/payments/promotions/validate', {
    ...options,
    method: 'POST',
    body: {
      bookingId,
      code,
    },
    requiresAuth: true,
  });
}

export function listCustomerPaymentMethods(
  options: ApiOptions = {},
): Promise<CustomerPaymentMethodSummary[]> {
  return request<CustomerPaymentMethodSummary[]>('/v1/payments/methods', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function upsertCustomerPaymentMethod(
  body: UpsertCustomerPaymentMethodRequest,
  options: ApiOptions = {},
): Promise<CustomerPaymentMethodSummary> {
  return request<CustomerPaymentMethodSummary>('/v1/payments/methods', {
    ...options,
    method: 'PUT',
    body,
    requiresAuth: true,
  });
}

export function deleteCustomerPaymentMethod(
  methodId: string,
  options: ApiOptions = {},
): Promise<CustomerPaymentMethodSummary> {
  return request<CustomerPaymentMethodSummary>(
    `/v1/payments/methods/${encodeURIComponent(methodId)}`,
    {
      ...options,
      method: 'DELETE',
      requiresAuth: true,
    },
  );
}

export function getProviderPayoutAccount(
  options: ApiOptions = {},
): Promise<PayoutAccountSummary> {
  return request<PayoutAccountSummary>('/v1/payments/payout-account', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function listProviderPayoutMethods(
  options: ApiOptions = {},
): Promise<PayoutMethodSummary[]> {
  return request<PayoutMethodSummary[]>('/v1/payments/payout-methods', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function upsertProviderPayoutMethod(
  body: UpsertPayoutMethodRequest,
  options: ApiOptions = {},
): Promise<PayoutMethodSummary> {
  return request<PayoutMethodSummary>('/v1/payments/payout-methods', {
    ...options,
    method: 'PUT',
    body,
    requiresAuth: true,
  });
}

export function listProviderPayouts(
  options: ApiOptions = {},
): Promise<PayoutSummary[]> {
  return request<PayoutSummary[]>('/v1/payments/payouts', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function requestProviderPayout(
  body: { amount: number; payoutMethodId: string },
  options: IdempotentApiOptions = {},
): Promise<PayoutSummary> {
  const { idempotencyKey, ...requestOptions } = options;
  return request<PayoutSummary>('/v1/payments/payouts', {
    ...requestOptions,
    method: 'POST',
    body,
    requiresAuth: true,
    idempotencyKey: idempotencyKey ?? createProviderPayoutIdempotencyKey(),
  });
}

export function listProviderReviews(
  providerId: string,
  options: ApiOptions = {},
): Promise<ReviewSummary[]> {
  return request<ReviewSummary[]>(
    `/v1/reviews?providerId=${encodeURIComponent(providerId)}`,
    {
      ...options,
      method: 'GET',
    },
  );
}

export function createReview(
  body: CreateReviewRequest,
  options: ApiOptions = {},
): Promise<ReviewSummary> {
  return request<ReviewSummary>('/v1/reviews', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function replyToReview(
  reviewId: string,
  responseText: string,
  options: ApiOptions = {},
): Promise<ReviewResponseSummary> {
  return request<ReviewResponseSummary>(`/v1/reviews/${encodeURIComponent(reviewId)}/reply`, {
    ...options,
    method: 'POST',
    body: { responseText },
    requiresAuth: true,
  });
}

export function flagReview(
  reviewId: string,
  reason: string,
  options: ApiOptions = {},
): Promise<ReviewSummary> {
  return request<ReviewSummary>(`/v1/reviews/${encodeURIComponent(reviewId)}/flag`, {
    ...options,
    method: 'POST',
    body: { reason },
    requiresAuth: true,
  });
}

export function listSupportTickets(
  options: ApiOptions = {},
): Promise<SupportTicketSummary[]> {
  return request<SupportTicketSummary[]>('/v1/support/tickets', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function createSupportTicket(
  body: CreateSupportTicketRequest,
  options: ApiOptions = {},
): Promise<SupportTicketSummary> {
  return request<SupportTicketSummary>('/v1/support/tickets', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function getSupportTicket(
  ticketId: string,
  options: ApiOptions = {},
): Promise<SupportTicketSummary> {
  return request<SupportTicketSummary>(`/v1/support/tickets/${encodeURIComponent(ticketId)}`, {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function listSupportTicketReplies(
  ticketId: string,
  options: ApiOptions = {},
): Promise<SupportTicketReplySummary[]> {
  return request<SupportTicketReplySummary[]>(
    `/v1/support/tickets/${encodeURIComponent(ticketId)}/replies`,
    {
      ...options,
      method: 'GET',
      requiresAuth: true,
    },
  );
}

export function createSupportTicketReply(
  ticketId: string,
  message: string,
  options: ApiOptions = {},
): Promise<SupportTicketReplySummary> {
  return request<SupportTicketReplySummary>(
    `/v1/support/tickets/${encodeURIComponent(ticketId)}/replies`,
    {
      ...options,
      method: 'POST',
      body: { message },
      requiresAuth: true,
    },
  );
}

export function listNotifications(
  options: ApiOptions = {},
): Promise<NotificationSummary[]> {
  return request<NotificationSummary[]>('/v1/notifications', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function getReferralSummary(
  options: ApiOptions = {},
): Promise<ReferralSummary> {
  return request<ReferralSummary>('/v1/referrals', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function getUserPreferences(
  options: ApiOptions = {},
): Promise<UserPreferenceSummary> {
  return request<UserPreferenceSummary>('/v1/me/preferences', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function updateUserPreferences(
  body: UpdateUserPreferencesRequest,
  options: ApiOptions = {},
): Promise<UserPreferenceSummary> {
  return request<UserPreferenceSummary>('/v1/me/preferences', {
    ...options,
    method: 'PUT',
    body,
    requiresAuth: true,
  });
}

export function markNotificationRead(
  notificationId: string,
  options: ApiOptions = {},
): Promise<NotificationSummary> {
  return request<NotificationSummary>(
    `/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      ...options,
      method: 'PATCH',
      requiresAuth: true,
    },
  );
}

export function registerPushDevice(
  body: RegisterPushDeviceRequest,
  options: ApiOptions = {},
): Promise<PushDeviceSummary> {
  return request<PushDeviceSummary>('/v1/notifications/devices', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function unregisterPushDevice(
  token: string,
  options: ApiOptions = {},
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(
    `/v1/notifications/devices/${encodeURIComponent(token)}`,
    {
      ...options,
      method: 'DELETE',
      requiresAuth: true,
    },
  );
}

export function getProviderProfile(
  options: ApiOptions = {},
): Promise<ProviderProfileSnapshot> {
  return request<ProviderProfileSnapshot>('/v1/provider/profile', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function getProviderDashboard(
  options: ApiOptions = {},
): Promise<ProviderDashboardSummary> {
  return request<ProviderDashboardSummary>('/v1/provider/dashboard', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function listProviderOwnedServices(
  options: ApiOptions = {},
): Promise<ProviderOwnedServiceSummary[]> {
  return request<ProviderOwnedServiceSummary[]>('/v1/provider/services', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function replaceProviderServices(
  services: ProviderOwnedServiceInput[],
  options: ApiOptions = {},
): Promise<ProviderOwnedServiceSummary[]> {
  return request<ProviderOwnedServiceSummary[]>('/v1/provider/services', {
    ...options,
    method: 'PUT',
    body: { services },
    requiresAuth: true,
  });
}

export function getProviderAvailability(
  options: ApiOptions = {},
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>('/v1/provider/availability', {
    ...options,
    method: 'GET',
    requiresAuth: true,
  });
}

export function getPublicProviderAvailability(
  providerId: string,
  options: ApiOptions = {},
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>(
    `/v1/provider/availability/${encodeURIComponent(providerId)}`,
    {
      ...options,
      method: 'GET',
    },
  );
}

export function replaceProviderAvailabilityWindows(
  windows: AvailabilityWindowInput[],
  options: ApiOptions = {},
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>('/v1/provider/availability/windows', {
    ...options,
    method: 'PUT',
    body: { windows },
    requiresAuth: true,
  });
}

export function addProviderDayOff(
  body: { offDate: string; reason?: string | null },
  options: ApiOptions = {},
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>('/v1/provider/availability/days-off', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function removeProviderDayOff(
  offDate: string,
  options: ApiOptions = {},
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>(
    `/v1/provider/availability/days-off/${encodeURIComponent(offDate)}`,
    {
      ...options,
      method: 'DELETE',
      requiresAuth: true,
    },
  );
}

export function addProviderTimeOffWindow(
  body: {
    offDate: string;
    startTime: string;
    endTime: string;
    reason?: string | null;
  },
  options: ApiOptions = {},
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>('/v1/provider/availability/time-off', {
    ...options,
    method: 'POST',
    body,
    requiresAuth: true,
  });
}

export function removeProviderTimeOffWindow(
  id: string,
  options: ApiOptions = {},
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>(
    `/v1/provider/availability/time-off/${encodeURIComponent(id)}`,
    {
      ...options,
      method: 'DELETE',
      requiresAuth: true,
    },
  );
}

export async function uploadMedia(
  body: UploadMediaRequest,
  {
    baseUrl,
    token,
    fetcher = fetch,
  }: ApiOptions = {},
): Promise<UploadSummary> {
  if (!token?.trim()) {
    throw new Error('Paste an access token before uploading files.');
  }

  const formData = new FormData();
  formData.append('kind', body.kind);
  if (body.documentType?.trim()) {
    formData.append('documentType', body.documentType.trim());
  }
  formData.append(
    'file',
    {
      uri: body.uri,
      name: body.name?.trim() || `servease-${body.kind}.jpg`,
      type: body.contentType?.trim() || 'image/jpeg',
    } as unknown as Blob,
  );

  const resolvedBaseUrl = baseUrl?.replace(/\/$/, '') ?? resolveGatewayBaseUrl();
  const response = await fetcher(`${resolvedBaseUrl}/v1/uploads`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token.trim()}`,
    },
    body: formData,
  });

  return readGatewayResponse<UploadSummary>(response);
}

interface RequestOptions extends ApiOptions {
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  body?: unknown;
  requiresAuth?: boolean;
  idempotencyKey?: string | null;
}

async function request<T>(
  path: string,
  {
    baseUrl,
    token,
    fetcher = fetch,
    method,
    body,
    requiresAuth = false,
    idempotencyKey,
  }: RequestOptions,
): Promise<T> {
  if (requiresAuth && !token?.trim()) {
    throw new Error('Paste an access token before using booking routes.');
  }

  const resolvedBaseUrl = baseUrl?.replace(/\/$/, '') ?? resolveGatewayBaseUrl();
  const response = await fetcher(`${resolvedBaseUrl}${path}`, {
    method,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      ...(token?.trim() ? { authorization: `Bearer ${token.trim()}` } : {}),
      ...(idempotencyKey?.trim()
        ? { 'idempotency-key': idempotencyKey.trim() }
        : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) {
    return undefined as T;
  }
  const payload = await readGatewayPayload<T>(response);

  if (!response.ok) {
    const message =
      payload.error?.message ??
      payload.error?.code ??
      `Gateway request failed with ${response.status}`;
    throw new Error(message);
  }

  if (!('data' in payload)) {
    throw new Error('Gateway response did not include data.');
  }

  return payload.data as T;
}

function readTrackingStreamEvent(
  rawEvent: string,
  handlers: BookingTrackingStreamHandlers,
): void {
  const lines = rawEvent.split('\n');
  let eventType = 'message';
  const dataLines: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith('event:')) {
      eventType = line.slice('event:'.length).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
    }
  });

  if (eventType !== 'tracking' || !dataLines.length) {
    return;
  }

  try {
    handlers.onSnapshot(JSON.parse(dataLines.join('\n')) as BookingTrackingSnapshot);
  } catch {
    handlers.onError?.(new Error('Tracking stream sent invalid data.'));
  }
}

async function readGatewayResponse<T>(response: Response): Promise<T> {
  const payload = await readGatewayPayload<T>(response);

  if (!response.ok) {
    const message =
      payload.error?.message ??
      payload.error?.code ??
      `Gateway request failed with ${response.status}`;
    throw new Error(message);
  }

  if (!('data' in payload)) {
    throw new Error('Gateway response did not include data.');
  }

  return payload.data as T;
}

async function readGatewayPayload<T>(response: Response): Promise<{
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
}> {
  return (await response.json()) as {
    data?: T;
    error?: {
      code?: string;
      message?: string;
    };
  };
}
