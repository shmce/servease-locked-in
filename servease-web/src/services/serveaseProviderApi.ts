import { resolvePublicGatewayBaseUrl } from '@/app/lib/gateway-base-url'

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface SupabaseAuthSession {
  accessToken: string
  refreshToken: string | null
  expiresIn: number | null
  tokenType: string
  user: {
    id: string
    email: string | null
  }
}

export interface CurrentUserProfile {
  user: {
    id: string
    email: string
    fullName: string | null
    contactNumber: string | null
    role: 'customer' | 'provider' | 'admin'
    status: 'active' | 'suspended' | 'inactive'
  }
  customerProfile: {
    id: string
    address: string | null
  } | null
  providerProfile: {
    id: string
    businessName: string | null
    bio?: string | null
    serviceDescription?: string | null
    serviceArea?: string | null
    yearsExperience?: number | null
    verificationStatus: 'pending' | 'approved' | 'rejected'
    averageRating: number
    reviewCount: number
  } | null
}

export interface CurrentUserSessionSummary {
  id: string
  email: string
  createdAt: string | null
  lastSignInAt: string | null
  isCurrent: boolean
}

export interface AvailabilityWindowInput {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  isActive?: boolean | null
}

export interface AvailabilityWindow {
  id: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  isActive: boolean
  sortOrder: number
}

export interface ProviderDayOff {
  id: string
  offDate: string
  reason: string | null
}

export interface ProviderAvailabilitySchedule {
  providerId: string
  windows: AvailabilityWindow[]
  daysOff: ProviderDayOff[]
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export type BookingPricingMode = 'flat' | 'hourly'
export type PricingFairnessStatus = 'below_range' | 'within_range' | 'above_range'
export type PricingConfidence = 'high' | 'medium' | 'low'

export type BookingTrackingPhase =
  | 'awaiting_confirmation'
  | 'scheduled'
  | 'on_the_way'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export type BookingTrackingTrafficLevel = 'light' | 'moderate' | 'heavy'

export interface BookingTrackingLocation {
  latitude: number
  longitude: number
}

export interface BookingTrackingSnapshot {
  bookingId: string
  bookingReference: string
  status: BookingStatus
  phase: BookingTrackingPhase
  etaMinutes: number | null
  distanceKm: number | null
  trafficLevel: BookingTrackingTrafficLevel | null
  destinationAddress: string | null
  destinationLocation: BookingTrackingLocation | null
  providerLocation: BookingTrackingLocation | null
  scheduledAt: string
  lastUpdatedAt: string
}

export interface GeoRouteLocation {
  latitude: number
  longitude: number
}

export interface GeoDirectionsStep {
  instruction: string
  distanceMeters: number
  durationSeconds: number
  name?: string
  type?: number
  wayPoints?: [number, number]
}

export interface GeoDirectionsRoute {
  provider: 'openrouteservice'
  distanceMeters: number
  durationSeconds: number
  geometry: GeoRouteLocation[]
  steps: GeoDirectionsStep[]
  bbox?: [number, number, number, number]
  raw?: unknown
}

export interface BookingSummary {
  id: string
  bookingReference: string
  customerId: string
  customerFullName?: string | null
  customerContactNumber?: string | null
  providerId: string
  serviceId: string | null
  serviceTitle: string | null
  serviceDescription?: string | null
  serviceAddress: string | null
  scheduledAt: string
  hoursRequired?: number | null
  serviceAmount?: number | null
  pricingMode?: BookingPricingMode | null
  customerNotes?: string | null
  status: BookingStatus
  totalAmount: number
  attachments?: BookingAttachmentSummary[]
}

export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'

export interface PaymentSummary {
  id: string
  bookingId: string
  customerId: string | null
  providerId: string | null
  amount: number
  platformFee: number
  providerPayout: number
  status: PaymentStatus
  paymentMethod: string | null
  paidAt: string | null
  createdAt: string | null
}

export interface ConversationSummary {
  id: string
  bookingId: string | null
  customerId: string | null
  providerId: string | null
  lastMessageAt: string | null
  createdAt: string | null
}

export interface ConversationMessage {
  id: string
  conversationId: string
  senderId: string
  senderRole: 'customer' | 'provider'
  content: string
  deliveryStatus: string | null
  createdAt: string | null
  attachment: ConversationMessageAttachment | null
}

export interface ConversationMessageAttachment {
  fileUrl: string
  fileName: string | null
  mimeType: string | null
  storagePath: string | null
  fileSize: number | null
}

export interface NotificationSummary {
  id: string
  userId: string
  type: string
  title: string | null
  body: string | null
  isRead: boolean
  metadata: Record<string, unknown> | null
  createdAt: string | null
}

export interface UserPreferenceSummary {
  userId: string
  pushNotificationsEnabled: boolean
  darkModeEnabled: boolean
  language: 'en' | 'fil'
  notificationPreferences: Record<string, unknown>
  updatedAt: string | null
}

export interface UpdateUserPreferencesRequest {
  pushNotificationsEnabled?: boolean | null
  darkModeEnabled?: boolean | null
  language?: 'en' | 'fil' | null
  notificationPreferences?: Record<string, unknown> | null
}

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface SupportTicketAttachmentSummary {
  id: string
  ticketId: string
  uploadedBy: string | null
  fileUrl: string
  fileName: string | null
  mimeType: string | null
  storagePath: string | null
  fileSize: number | null
  createdAt: string | null
}

export interface SupportTicketSummary {
  id: string
  userId: string
  subject: string
  message: string | null
  category: string | null
  status: SupportTicketStatus
  createdAt: string | null
  attachments?: SupportTicketAttachmentSummary[]
}

export interface SupportTicketReplySummary {
  id: string
  ticketId: string
  repliedBy: string
  message: string
  createdAt: string | null
}

export interface CreateSupportTicketRequest {
  subject: string
  message?: string | null
  category?: string | null
}

export interface CatalogCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
}

export interface CatalogServiceItem {
  id: string
  categoryId: string | null
  name: string
  description: string | null
  price: number | null
  pricingMode: 'flat' | 'hourly'
}

export interface ProviderServiceListing {
  id: string
  providerId: string
  providerBusinessName: string | null
  serviceId: string | null
  title: string
  description: string | null
  price: number | null
  pricingMode: 'flat' | 'hourly'
  averageRating: number
  reviewCount: number
  verificationStatus: 'pending' | 'approved' | 'rejected'
}

export interface ProviderOwnedServiceInput {
  id?: string | null
  serviceId?: string | null
  title: string
  description?: string | null
  price?: number | null
  pricingMode?: 'flat' | 'hourly' | null
  isActive?: boolean | null
}

export interface ProviderOwnedServiceSummary extends ProviderServiceListing {
  isActive: boolean
}

export interface ProviderPricingGuidanceSummary {
  quoteId: string
  estimatedTotal: number
  fairRangeMin: number
  fairRangeMax: number
  fairnessStatus: PricingFairnessStatus
  confidence: PricingConfidence
  explanation: string
}

export interface ProviderPortfolioMediaSummary {
  id: string
  providerId: string
  uploadedBy: string | null
  fileUrl: string
  fileName: string | null
  mimeType: string | null
  storagePath: string | null
  fileSize: number | null
  caption: string | null
  sortOrder: number
  createdAt: string | null
}

export interface ProviderPortfolioOrderItem {
  id: string
  sortOrder: number
}

export interface UploadSummary {
  bucket: string
  path: string
  publicUrl: string
  kind: 'message_attachment' | 'provider_portfolio' | 'provider_progress'
  contentType: string
  size: number
}

export type BookingAttachmentKind = 'booking_reference' | 'provider_progress'

export interface BookingAttachmentInput {
  mediaKind: BookingAttachmentKind
  fileUrl: string
  fileName?: string | null
  mimeType?: string | null
  storagePath?: string | null
  fileSize?: number | null
  caption?: string | null
}

export interface BookingAttachmentSummary {
  id: string
  bookingId: string
  uploadedBy: string | null
  mediaKind: BookingAttachmentKind
  fileUrl: string
  fileName: string | null
  mimeType: string | null
  storagePath: string | null
  fileSize: number | null
  caption: string | null
  createdAt: string | null
}

export interface BookingDisputeSummary {
  id: string
  bookingId: string
  raisedBy: string
  category: string | null
  reason: string
  description: string | null
  status: 'open' | 'resolved' | 'closed'
  resolvedAt: string | null
  resolvedBy: string | null
  createdAt: string | null
}

export type BookingServiceUpdateType = 'checklist' | 'progress' | 'completion'

export interface BookingServiceChecklist {
  scopeConfirmed?: boolean
  toolsReady?: boolean
  instructionsReviewed?: boolean
}

export interface CreateBookingServiceUpdateRequest {
  updateType: BookingServiceUpdateType
  message?: string | null
  checklist?: BookingServiceChecklist | null
  attachmentId?: string | null
}

export interface BookingServiceUpdateSummary {
  id: string
  bookingId: string
  actorId: string
  updateType: BookingServiceUpdateType
  message: string | null
  checklist: BookingServiceChecklist | null
  attachmentId: string | null
  createdAt: string | null
}

export interface ProviderProfileSnapshot {
  account: CurrentUserProfile['user']
  provider: NonNullable<CurrentUserProfile['providerProfile']>
  services: ProviderServiceListing[]
  portfolio: ProviderPortfolioMediaSummary[]
}

export interface ProviderDashboardBooking {
  id: string
  scheduledAt: string
  time: string
  customerName: string | null
  serviceTitle: string | null
  location: string | null
  status: BookingStatus
}

export interface ProviderDashboardSummary {
  summary: {
    newRequests: number
    todayBookings: number
    todayCompleted: number
    todayEarnings: number
    totalEarnings: number
    overallRating: number
    reviewCount: number
  }
  upcomingBookings: ProviderDashboardBooking[]
  performance: {
    acceptanceRate: number
    completionRate: number
    cancellationRate: number
    responseTimeMinutes: number | null
  }
}

export type PayoutMethodType = 'bank' | 'gcash' | 'paymaya'

export interface PayoutMethodSummary {
  id: string
  providerId: string
  methodType: PayoutMethodType
  accountLabel: string
  accountName: string | null
  accountNumberLast4: string | null
  isDefault: boolean
  createdAt: string | null
}

export interface PayoutAccountSummary {
  availableBalance: number
  pendingBalance: number
  totalPaidOut: number
  nextPayoutDate: string | null
}

export interface PayoutSummary {
  id: string
  providerId: string
  amount: number
  processingFee: number
  netAmount: number
  status: 'requested' | 'processing' | 'paid' | 'cancelled'
  payoutMethodId: string | null
  methodType: string | null
  accountLabel: string | null
  reference: string | null
  periodStart: string | null
  periodEnd: string | null
  requestedAt: string | null
  paidAt: string | null
  createdAt: string | null
}

export interface ReviewSummary {
  id: string
  bookingId: string
  providerId: string
  reviewerId: string
  reviewerFullName: string | null
  rating: number
  reviewText: string | null
  isFlagged: boolean
  createdAt: string | null
}

export interface ReviewResponseSummary {
  id: string
  reviewId: string
  responderId: string
  responseText: string
  createdAt: string | null
}

export interface UpdateCurrentUserProfileRequest {
  fullName: string
  contactNumber?: string | null
  address?: string | null
  businessName?: string | null
  bio?: string | null
  serviceDescription?: string | null
  serviceArea?: string | null
  yearsExperience?: number | null
}

export interface UpdateCurrentUserPasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface TwoFactorProvisioningResponse {
  enabled: false
  secret: string
  otpauthUrl: string
  qrCodeDataUrl: string
}

export interface TwoFactorStatusResponse {
  enabled: boolean
  verifiedAt: string | null
}

export interface ReferralSummary {
  referralCode: string
  referralLinkPath: string
  completedReferrals: number
  pendingReferrals: number
  totalRewards: number
}

export interface ServiceAreaSummary {
  id: string
  name: string
  city: string
  region: string
  status: 'active' | 'inactive'
  providerCount: number
  latitude: number | null
  longitude: number | null
}

export interface AddPortfolioMediaRequest {
  fileUrl: string
  fileName?: string | null
  mimeType?: string | null
  storagePath?: string | null
  fileSize?: number | null
  caption?: string | null
}

export type ReplacePortfolioMediaRequest = AddPortfolioMediaRequest;

interface SupabaseTokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  user?: {
    id?: string
    email?: string | null
  }
  error?: string
  error_description?: string
  msg?: string
}

interface RequestOptions {
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  token?: string | null
  body?: unknown
  query?: Record<string, string | null | undefined>
  idempotencyKey?: string | null
}

let generatedIdempotencyCounter = 0

export function createProviderPayoutIdempotencyKey(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.()
  if (randomUuid) {
    return `provider-payout-${randomUuid}`
  }

  generatedIdempotencyCounter += 1
  return `provider-payout-${Date.now()}-${generatedIdempotencyCounter}`
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const PROVIDER_STORAGE_KEY = 'servease_provider'
export const PROVIDER_TOKEN_STORAGE_KEY = 'servease_provider_access_token'
export const PROVIDER_REFRESH_TOKEN_STORAGE_KEY = 'servease_provider_refresh_token'
export const PROVIDER_TOKEN_EXPIRES_AT_STORAGE_KEY =
  'servease_provider_access_token_expires_at'

export function getProviderApiBaseUrl(): string {
  return resolvePublicGatewayBaseUrl()
}

export function getStoredProviderAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(PROVIDER_TOKEN_STORAGE_KEY)
}

export function getStoredProviderRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(PROVIDER_REFRESH_TOKEN_STORAGE_KEY)
}

export function getStoredProviderTokenExpiresAt(): number | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = Number(localStorage.getItem(PROVIDER_TOKEN_EXPIRES_AT_STORAGE_KEY))
  return Number.isFinite(value) && value > 0 ? value : null
}

export function clearStoredProviderSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(PROVIDER_STORAGE_KEY)
  localStorage.removeItem(PROVIDER_TOKEN_STORAGE_KEY)
  localStorage.removeItem(PROVIDER_REFRESH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(PROVIDER_TOKEN_EXPIRES_AT_STORAGE_KEY)
}

export function storeProviderSession(
  token: string,
  profile: CurrentUserProfile,
  session?: Pick<SupabaseAuthSession, 'expiresIn' | 'refreshToken'>,
): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(profile))
  localStorage.setItem(PROVIDER_TOKEN_STORAGE_KEY, token)

  if (session?.refreshToken) {
    localStorage.setItem(PROVIDER_REFRESH_TOKEN_STORAGE_KEY, session.refreshToken)
  }

  if (session?.expiresIn) {
    localStorage.setItem(
      PROVIDER_TOKEN_EXPIRES_AT_STORAGE_KEY,
      String(Date.now() + session.expiresIn * 1000),
    )
  }
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SupabaseAuthSession> {
  return requestSupabaseToken('password', {
    email: email.trim(),
    password,
  })
}

export async function refreshSupabaseSession(
  refreshToken: string,
): Promise<SupabaseAuthSession> {
  if (!refreshToken.trim()) {
    throw new Error('Refresh token is required.')
  }

  return requestSupabaseToken('refresh_token', {
    refresh_token: refreshToken.trim(),
  })
}

async function requestSupabaseToken(
  grantType: 'password' | 'refresh_token',
  body: Record<string, string>,
): Promise<SupabaseAuthSession> {
  const normalizedUrl = SUPABASE_URL?.replace(/\/$/, '')
  const normalizedKey = SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!normalizedUrl || !normalizedKey) {
    throw new Error(
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for provider login.',
    )
  }

  const response = await fetch(
    `${normalizedUrl}/auth/v1/token?grant_type=${grantType}`,
    {
      method: 'POST',
      headers: {
        apikey: normalizedKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
  const payload = (await response.json()) as SupabaseTokenResponse

  if (!response.ok) {
    throw new Error(
      payload.error_description ??
        payload.msg ??
        payload.error ??
        `Supabase sign-in failed with ${response.status}`,
    )
  }

  if (!payload.access_token || !payload.user?.id) {
    throw new Error('Supabase sign-in response did not include a session.')
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    expiresIn: payload.expires_in ?? null,
    tokenType: payload.token_type ?? 'bearer',
    user: {
      id: payload.user.id,
      email: payload.user.email ?? null,
    },
  }
}

export function getCurrentUser(token: string): Promise<CurrentUserProfile> {
  return request<CurrentUserProfile>('/v1/me', {
    token,
  })
}

export function getProviderProfile(
  token: string,
): Promise<ProviderProfileSnapshot> {
  return request<ProviderProfileSnapshot>('/v1/provider/profile', {
    token,
  })
}

export function getProviderDashboard(
  token: string,
): Promise<ProviderDashboardSummary> {
  return request<ProviderDashboardSummary>('/v1/provider/dashboard', {
    token,
  })
}

export function listCatalogServiceAreas(): Promise<ServiceAreaSummary[]> {
  return request<ServiceAreaSummary[]>('/v1/catalog/service-areas')
}

export function listCatalogCategories(): Promise<CatalogCategory[]> {
  return request<CatalogCategory[]>('/v1/catalog/categories')
}

export function listCatalogServices(categoryId?: string | null): Promise<CatalogServiceItem[]> {
  const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
  return request<CatalogServiceItem[]>(`/v1/catalog/services${qs}`)
}

export function listProviderOwnedServices(
  token: string,
): Promise<ProviderOwnedServiceSummary[]> {
  return request<ProviderOwnedServiceSummary[]>('/v1/provider/services', {
    token,
  })
}

export function replaceProviderOwnedServices(
  token: string,
  services: ProviderOwnedServiceInput[],
): Promise<ProviderOwnedServiceSummary[]> {
  return request<ProviderOwnedServiceSummary[]>('/v1/provider/services', {
    method: 'PUT',
    token,
    body: { services },
  })
}

export function getProviderPricingGuidance(
  token: string,
  input: {
    serviceId: string
    categoryId?: string | null
    categoryName?: string | null
    serviceTitle?: string | null
    proposedPrice: number
    pricingMode: BookingPricingMode
    estimatedHours?: number | null
  },
): Promise<ProviderPricingGuidanceSummary> {
  return request<ProviderPricingGuidanceSummary>('/v1/provider/pricing/guidance', {
    method: 'POST',
    token,
    body: input,
  })
}

export function getProviderAvailability(
  token: string,
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>('/v1/provider/availability', {
    token,
  })
}

export function replaceProviderAvailabilityWindows(
  token: string,
  windows: AvailabilityWindowInput[],
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>(
    '/v1/provider/availability/windows',
    {
      method: 'PUT',
      token,
      body: { windows },
    },
  )
}

export function addProviderDayOff(
  token: string,
  offDate: string,
  reason?: string | null,
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>(
    '/v1/provider/availability/days-off',
    {
      method: 'POST',
      token,
      body: { offDate, reason: reason || null },
    },
  )
}

export function removeProviderDayOff(
  token: string,
  offDate: string,
): Promise<ProviderAvailabilitySchedule> {
  return request<ProviderAvailabilitySchedule>(
    `/v1/provider/availability/days-off/${encodeURIComponent(offDate)}`,
    {
      method: 'DELETE',
      token,
    },
  )
}

export function listProviderBookings(token: string): Promise<BookingSummary[]> {
  return request<BookingSummary[]>('/v1/bookings', {
    token,
    query: { scope: 'provider' },
  })
}

export function getProviderBooking(
  token: string,
  bookingId: string,
): Promise<BookingSummary> {
  return request<BookingSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}`,
    {
      token,
    },
  )
}

export function getProviderBookingTrackingSnapshot(
  token: string,
  bookingId: string,
): Promise<BookingTrackingSnapshot> {
  return request<BookingTrackingSnapshot>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/tracking`,
    {
      token,
    },
  )
}

export function getProviderDirections(
  token: string,
  origin: GeoRouteLocation,
  destination: GeoRouteLocation,
): Promise<GeoDirectionsRoute> {
  return request<GeoDirectionsRoute>('/v1/geo/directions', {
    method: 'POST',
    token,
    body: {
      origin,
      destination,
      profile: 'driving-car',
      language: 'en',
    },
  })
}

export function updateProviderBookingStatus(
  token: string,
  bookingId: string,
  currentStatus: BookingStatus,
  nextStatus: BookingStatus,
  reason?: string | null,
  explanation?: string | null,
): Promise<BookingSummary> {
  const normalizedReason = reason?.trim() || null
  const normalizedExplanation = explanation?.trim() || null

  return request<BookingSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/status`,
    {
      method: 'PATCH',
      token,
      body: {
        currentStatus,
        nextStatus,
        reason: normalizedReason,
        explanation: normalizedExplanation,
      },
    },
  )
}

export function createProviderBookingAttachment(
  token: string,
  bookingId: string,
  body: BookingAttachmentInput,
): Promise<BookingAttachmentSummary> {
  return request<BookingAttachmentSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/attachments`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function deleteProviderBookingAttachment(
  token: string,
  bookingId: string,
  attachmentId: string,
): Promise<BookingAttachmentSummary> {
  return request<BookingAttachmentSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/attachments/${encodeURIComponent(attachmentId)}`,
    {
      method: 'DELETE',
      token,
    },
  )
}

export function createProviderBookingDispute(
  token: string,
  bookingId: string,
  body: {
    category: string
    reason: string
    description?: string | null
  },
): Promise<BookingDisputeSummary> {
  return request<BookingDisputeSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/disputes`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function listProviderBookingServiceUpdates(
  token: string,
  bookingId: string,
): Promise<BookingServiceUpdateSummary[]> {
  return request<BookingServiceUpdateSummary[]>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/service-updates`,
    {
      token,
    },
  )
}

export function createProviderBookingServiceUpdate(
  token: string,
  bookingId: string,
  body: CreateBookingServiceUpdateRequest,
): Promise<BookingServiceUpdateSummary> {
  return request<BookingServiceUpdateSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/service-updates`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function listProviderPayments(token: string): Promise<PaymentSummary[]> {
  return request<PaymentSummary[]>('/v1/payments', {
    token,
  })
}

export function getProviderPayoutAccount(
  token: string,
): Promise<PayoutAccountSummary> {
  return request<PayoutAccountSummary>('/v1/payments/payout-account', {
    token,
  })
}

export function listProviderPayoutMethods(
  token: string,
): Promise<PayoutMethodSummary[]> {
  return request<PayoutMethodSummary[]>('/v1/payments/payout-methods', {
    token,
  })
}

export function upsertProviderPayoutMethod(
  token: string,
  input: {
    methodId?: string | null
    methodType: PayoutMethodType
    accountLabel: string
    accountName?: string | null
    accountNumberLast4?: string | null
    isDefault?: boolean | null
  },
): Promise<PayoutMethodSummary> {
  return request<PayoutMethodSummary>('/v1/payments/payout-methods', {
    method: 'PUT',
    token,
    body: input,
  })
}

export function listProviderPayouts(token: string): Promise<PayoutSummary[]> {
  return request<PayoutSummary[]>('/v1/payments/payouts', {
    token,
  })
}

export function requestProviderPayout(
  token: string,
  input: {
    amount: number
    payoutMethodId: string
  },
  options: {
    idempotencyKey?: string | null
  } = {},
): Promise<PayoutSummary> {
  return request<PayoutSummary>('/v1/payments/payouts', {
    method: 'POST',
    token,
    body: input,
    idempotencyKey:
      options.idempotencyKey ?? createProviderPayoutIdempotencyKey(),
  })
}

export function listProviderConversations(
  token: string,
): Promise<ConversationSummary[]> {
  return request<ConversationSummary[]>('/v1/conversations', {
    token,
  })
}

export function listProviderConversationMessages(
  token: string,
  conversationId: string,
): Promise<ConversationMessage[]> {
  return request<ConversationMessage[]>(
    `/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      token,
    },
  )
}

export function sendProviderConversationMessage(
  token: string,
  conversationId: string,
  content: string,
  attachment?: ConversationMessageAttachment | null,
): Promise<ConversationMessage> {
  return request<ConversationMessage>(
    `/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: 'POST',
      token,
      body: { content, attachment: attachment ?? null },
    },
  )
}

export async function uploadProviderMessageAttachment(
  token: string,
  file: File,
): Promise<UploadSummary> {
  const formData = new FormData()
  formData.set('kind', 'message_attachment')
  formData.set('file', file)

  return requestFormData<UploadSummary>('/v1/uploads', token, formData)
}

export async function uploadProviderPortfolioMedia(
  token: string,
  file: File,
): Promise<UploadSummary> {
  const formData = new FormData()
  formData.set('kind', 'provider_portfolio')
  formData.set('file', file)

  return requestFormData<UploadSummary>('/v1/uploads', token, formData)
}

export async function uploadProviderProgressPhoto(
  token: string,
  file: File,
): Promise<UploadSummary> {
  const formData = new FormData()
  formData.set('kind', 'provider_progress')
  formData.set('file', file)

  return requestFormData<UploadSummary>('/v1/uploads', token, formData)
}

export function listProviderNotifications(
  token: string,
): Promise<NotificationSummary[]> {
  return request<NotificationSummary[]>('/v1/notifications', {
    token,
  })
}

export function markProviderNotificationRead(
  token: string,
  notificationId: string,
): Promise<NotificationSummary> {
  return request<NotificationSummary>(
    `/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: 'PATCH',
      token,
    },
  )
}

export function getUserPreferences(token: string): Promise<UserPreferenceSummary> {
  return request<UserPreferenceSummary>('/v1/me/preferences', {
    token,
  })
}

export function listCurrentUserSessions(
  token: string,
): Promise<CurrentUserSessionSummary[]> {
  return request<CurrentUserSessionSummary[]>('/v1/me/sessions', {
    token,
  })
}

export function updateUserPreferences(
  token: string,
  input: UpdateUserPreferencesRequest,
): Promise<UserPreferenceSummary> {
  return request<UserPreferenceSummary>('/v1/me/preferences', {
    method: 'PUT',
    token,
    body: input,
  })
}

export function listProviderReviews(token: string, providerId: string): Promise<ReviewSummary[]> {
  return request<ReviewSummary[]>(`/v1/reviews?providerId=${encodeURIComponent(providerId)}`, {
    method: 'GET',
    token,
  })
}

export function replyToReview(
  token: string,
  reviewId: string,
  responseText: string,
): Promise<ReviewResponseSummary> {
  return request<ReviewResponseSummary>(`/v1/reviews/${encodeURIComponent(reviewId)}/reply`, {
    method: 'POST',
    token,
    body: { responseText },
  })
}

export function flagReview(token: string, reviewId: string, reason: string): Promise<void> {
  return request<void>(`/v1/reviews/${encodeURIComponent(reviewId)}/flag`, {
    method: 'POST',
    token,
    body: { reason },
  })
}

export function updateCurrentUserProfile(
  token: string,
  body: UpdateCurrentUserProfileRequest,
): Promise<CurrentUserProfile> {
  return request<CurrentUserProfile>('/v1/me', { method: 'PATCH', token, body })
}

export function updateCurrentUserPassword(
  token: string,
  body: UpdateCurrentUserPasswordRequest,
): Promise<{ ok: true }> {
  return request<{ ok: true }>('/v1/me/password', { method: 'PATCH', token, body })
}

export function deleteCurrentUserAccount(token: string): Promise<{ ok: true }> {
  return request<{ ok: true }>('/v1/me', { method: 'DELETE', token })
}

export function enableCurrentUserTwoFactor(
  token: string,
): Promise<TwoFactorProvisioningResponse> {
  return request<TwoFactorProvisioningResponse>('/v1/me/two-factor/enable', {
    method: 'POST',
    token,
  })
}

export function getCurrentUserTwoFactorStatus(
  token: string,
): Promise<TwoFactorStatusResponse> {
  return request<TwoFactorStatusResponse>('/v1/me/two-factor', {
    token,
  })
}

export function verifyCurrentUserTwoFactor(
  token: string,
  code: string,
): Promise<TwoFactorStatusResponse> {
  return request<TwoFactorStatusResponse>('/v1/me/two-factor/verify', {
    method: 'POST',
    token,
    body: { code },
  })
}

export function disableCurrentUserTwoFactor(
  token: string,
  code?: string | null,
): Promise<TwoFactorStatusResponse> {
  return request<TwoFactorStatusResponse>('/v1/me/two-factor/disable', {
    method: 'POST',
    token,
    body: { code: code ?? null },
  })
}

export function addProviderPortfolioMedia(
  token: string,
  body: AddPortfolioMediaRequest,
): Promise<ProviderPortfolioMediaSummary> {
  return request<ProviderPortfolioMediaSummary>('/v1/catalog/provider/portfolio', {
    method: 'POST',
    token,
    body,
  })
}

export async function listCurrentProviderPortfolioMedia(
  token: string,
): Promise<ProviderPortfolioMediaSummary[]> {
  const snapshot = await getProviderProfile(token)

  return [...snapshot.portfolio].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder ||
      (left.createdAt ?? '').localeCompare(right.createdAt ?? ''),
  )
}

export function deleteProviderPortfolioMedia(token: string, mediaId: string): Promise<void> {
  return request<void>(`/v1/catalog/provider/portfolio/${encodeURIComponent(mediaId)}`, {
    method: 'DELETE',
    token,
  })
}

export function replaceProviderPortfolioMedia(
  token: string,
  mediaId: string,
  body: ReplacePortfolioMediaRequest,
): Promise<ProviderPortfolioMediaSummary> {
  return request<ProviderPortfolioMediaSummary>(
    `/v1/catalog/provider/portfolio/${encodeURIComponent(mediaId)}`,
    {
      method: 'PUT',
      token,
      body,
    },
  )
}

export function reorderProviderPortfolioMedia(
  token: string,
  items: ProviderPortfolioOrderItem[],
): Promise<ProviderPortfolioMediaSummary[]> {
  return request<ProviderPortfolioMediaSummary[]>('/v1/catalog/provider/portfolio/order', {
    method: 'PUT',
    token,
    body: { items },
  })
}

export function openProviderConversation(
  token: string,
  bookingId: string,
): Promise<ConversationSummary> {
  return request<ConversationSummary>('/v1/conversations', {
    method: 'POST',
    token,
    body: { bookingId },
  })
}

export function getReferralSummary(token: string): Promise<ReferralSummary> {
  return request<ReferralSummary>('/v1/referrals', { token })
}

export function listSupportTickets(token: string): Promise<SupportTicketSummary[]> {
  return request<SupportTicketSummary[]>('/v1/support/tickets', { token })
}

export function getSupportTicket(token: string, ticketId: string): Promise<SupportTicketSummary> {
  return request<SupportTicketSummary>(`/v1/support/tickets/${encodeURIComponent(ticketId)}`, { token })
}

export function createSupportTicket(
  token: string,
  body: CreateSupportTicketRequest,
): Promise<SupportTicketSummary> {
  return request<SupportTicketSummary>('/v1/support/tickets', { method: 'POST', token, body })
}

export function listSupportTicketReplies(
  token: string,
  ticketId: string,
): Promise<SupportTicketReplySummary[]> {
  return request<SupportTicketReplySummary[]>(
    `/v1/support/tickets/${encodeURIComponent(ticketId)}/replies`,
    { token },
  )
}

export function createSupportTicketReply(
  token: string,
  ticketId: string,
  message: string,
): Promise<SupportTicketReplySummary> {
  return request<SupportTicketReplySummary>(
    `/v1/support/tickets/${encodeURIComponent(ticketId)}/replies`,
    {
      method: 'POST',
      token,
      body: { message },
    },
  )
}

async function request<T>(
  path: string,
  { method = 'GET', token, body, query, idempotencyKey }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${getProviderApiBaseUrl()}${path}`)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url.toString(), {
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
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T
    error?: {
      code?: string
      message?: string
    }
  }

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        payload.error?.code ??
        `Gateway request failed with ${response.status}`,
    )
  }

  if (!('data' in payload)) {
    throw new Error('Gateway response did not include data.')
  }

  return payload.data as T
}

async function requestFormData<T>(
  path: string,
  token: string,
  body: FormData,
): Promise<T> {
  const response = await fetch(`${getProviderApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token.trim()}`,
    },
    body,
  })

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T
    error?: {
      code?: string
      message?: string
    }
  }

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        payload.error?.code ??
        `Gateway request failed with ${response.status}`,
    )
  }

  if (!('data' in payload)) {
    throw new Error('Gateway response did not include data.')
  }

  return payload.data as T
}
