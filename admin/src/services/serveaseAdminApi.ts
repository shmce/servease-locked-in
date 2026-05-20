import { resolveGatewayBaseUrl } from "./gatewayConfig"

export type AdminPaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'
export type AdminPayoutStatus = 'requested' | 'processing' | 'paid' | 'cancelled'
export type AdminRefundStatus = 'requested' | 'approved' | 'processed' | 'rejected'
export type AdminSupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type AdminDisputeStatus = 'open' | 'resolved' | 'closed'
export type AdminBookingStatus =
  | 'cancelled'
  | 'completed'
  | 'confirmed'
  | 'in_progress'
  | 'pending'
  | 'rejected'
export type AdminBookingEscalationPriority =
  | 'critical'
  | 'high'
  | 'low'
  | 'medium'
export type AdminPromotionDiscountType = 'percent' | 'fixed'
export type AdminPromotionStatus = 'active' | 'scheduled' | 'expired' | 'disabled'
export type AdminAuditActionType =
  | 'approve'
  | 'create'
  | 'delete'
  | 'export'
  | 'login'
  | 'other'
  | 'reject'
  | 'resolve'
  | 'update'
export type AdminProviderApplicationStatus = 'pending' | 'approved' | 'rejected'
export type AdminCommissionRuleStatus = 'active' | 'pending' | 'inactive'
export type AdminPricingMode = 'any' | 'flat' | 'hourly'
export type AdminPricingFairnessStatus = 'below_range' | 'within_range' | 'above_range'
export type AdminPricingConfidence = 'high' | 'medium' | 'low'
export type AdminBroadcastAudience = 'admins' | 'all' | 'customers' | 'providers'
export type AdminBroadcastRepeatRule = 'none' | 'daily' | 'weekly' | 'monthly'
export type AdminBroadcastStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled'
export type AdminBroadcastChannel = 'in_app' | 'email' | 'sms'
export type AdminPayoutEventType =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'status_updated'
  | 'bank_reference_reconciled'

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
    verificationStatus: 'pending' | 'approved' | 'rejected'
    averageRating: number
    reviewCount: number
  } | null
}

export interface UpdateCurrentUserProfileRequest {
  fullName: string
  contactNumber?: string | null
  address?: string | null
  businessName?: string | null
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

export interface UserPreferenceSummary {
  userId: string
  pushNotificationsEnabled: boolean
  darkModeEnabled: boolean
  language: string
  notificationPreferences: Record<string, unknown>
  updatedAt: string | null
}

export interface UpdateUserPreferencesRequest {
  pushNotificationsEnabled?: boolean | null
  darkModeEnabled?: boolean | null
  language?: string | null
  notificationPreferences?: Record<string, unknown> | null
}

export interface AdminPaymentSummary {
  id: string
  bookingId: string
  customerId: string | null
  providerId: string | null
  amount: number
  platformFee: number
  providerPayout: number
  status: AdminPaymentStatus
  paymentMethod: string | null
  paidAt: string | null
  createdAt: string | null
  failureReason: string | null
  failureCode: string | null
  retryCount: number
  lastRetryAt: string | null
  disputeId: string | null
  apicenterCheckoutId: string | null
  apicenterCheckoutStatus: string | null
  apicenterProvider: string | null
  apicenterProviderMode: string | null
}

export interface RecordPaymentFailureRequest {
  failureReason: string
  failureCode?: string | null
  disputeId?: string | null
}

export interface AdminPayoutSummary {
  id: string
  providerId: string
  amount: number
  processingFee: number
  netAmount: number
  status: AdminPayoutStatus
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

export interface AdminPayoutEventSummary {
  id: string
  payoutId: string
  eventType: AdminPayoutEventType
  status: AdminPayoutStatus
  bankReference: string | null
  note: string | null
  adminUserId: string | null
  createdAt: string | null
}

export interface AdminRefundSummary {
  id: string
  paymentId: string
  bookingId: string
  customerId: string | null
  providerId: string | null
  amount: number
  reason: string
  status: AdminRefundStatus
  requestedAt: string | null
  decidedBy: string | null
  decisionReason: string | null
  decidedAt: string | null
  processedAt: string | null
  createdAt: string | null
}

export interface AdminCommissionRuleSummary {
  id: string
  categoryKey: string
  categoryLabel: string
  currentRate: number
  previousRate: number
  status: AdminCommissionRuleStatus
  monthlyRevenue: number
  monthlyCommission: number
  updatedBy: string | null
  updatedAt: string | null
  createdAt: string | null
}

export interface AdminPricingCategoryRuleSummary {
  id: string
  categoryId: string | null
  categoryName: string
  pricingMode: AdminPricingMode
  baselineMin: number
  baselineMax: number
  fairBandPercent: number
  travelFeeMin: number
  travelFeeMax: number
  travelMultiplier: number
  travelTimeFeePerMinute: number
  urgencyPriorityMultiplier: number
  urgencyEmergencyMultiplier: number
  outlierWarnPercent: number
  isActive: boolean
  updatedAt: string | null
}

export interface AdminPricingFuelIndexSummary {
  id: string
  region: string
  fuelPricePerLiter: number
  source: string | null
  effectiveAt: string
  createdBy: string | null
  createdAt: string | null
}

export interface AdminPricingQuoteAuditSummary {
  quoteId: string
  customerId: string
  providerId: string
  serviceId: string
  categoryId: string | null
  estimatedTotal: number
  fairRangeMin: number
  fairRangeMax: number
  fairnessStatus: AdminPricingFairnessStatus
  confidence: AdminPricingConfidence
  expiresAt: string
  createdAt: string | null
}

export interface AdminReviewSummary {
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

export interface SendAdminBroadcastRequest {
  audience: AdminBroadcastAudience
  audienceCohort?: string | null
  channels?: AdminBroadcastChannel[]
  title: string
  message: string
  scheduledAt?: string | null
  repeatRule?: AdminBroadcastRepeatRule | null
}

export interface AdminBroadcastSummary {
  id: string
  adminUserId: string
  audience: AdminBroadcastAudience
  audienceCohort: string | null
  title: string
  message: string
  status: AdminBroadcastStatus
  scheduledAt: string | null
  repeatRule: AdminBroadcastRepeatRule
  deliveredCount: number
  failedCount: number
  sentAt: string | null
  createdAt: string | null
}

export interface AdminPromotionSummary {
  id: string
  code: string
  description: string | null
  discountType: AdminPromotionDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minOrderAmount: number
  startsAt: string | null
  endsAt: string | null
  isActive: boolean
  status: AdminPromotionStatus
  createdAt: string | null
}

export interface UpsertAdminPromotionRequest {
  code: string
  description?: string | null
  discountType: AdminPromotionDiscountType
  discountValue: number
  maxDiscountAmount?: number | null
  minOrderAmount?: number | null
  startsAt?: string | null
  endsAt?: string | null
  isActive?: boolean | null
}

export type AdminUserRole = 'customer' | 'provider' | 'admin'
export type AdminUserStatus = 'active' | 'suspended' | 'inactive'
export type AdminAccessRoleId =
  | 'super-admin'
  | 'finance-manager'
  | 'operations-manager'
  | 'customer-support'
  | 'content-moderator'
export type AdminProviderStatus = 'active' | 'suspended' | 'verified' | 'unverified' | 'rejected'
export type AdminCatalogPricingMode = 'flat' | 'hourly'

export interface AdminUserSummary {
  id: string
  email: string
  fullName: string | null
  contactNumber: string | null
  role: AdminUserRole
  accessRole?: AdminAccessRoleId | null
  accessRoleLabel?: string | null
  permissions?: string[]
  requireTwoFactor?: boolean
  invitationSent?: boolean
  status: AdminUserStatus
  createdAt: string | null
}

export interface CreateAdminUserRequest {
  email: string
  password: string
  fullName: string
  contactNumber?: string | null
  accessRole?: AdminAccessRoleId | null
  sendInvitation?: boolean | null
  requireTwoFactor?: boolean | null
}

export interface UpdateAdminUserAccessRequest {
  accessRole: AdminAccessRoleId
  requireTwoFactor?: boolean | null
}

export interface AdminUsersSummaryStats {
  totalCount: number
  byRole: { customer: number; provider: number; admin: number }
  byStatus: { active: number; suspended: number; inactive: number }
  recentCount: number
  newThisMonth: number
}

export interface AdminCategoryItem {
  id: string
  name: string
  description: string | null
  icon: string | null
  isActive: boolean
  sortOrder: number
}

export interface AdminServiceItem {
  id: string
  categoryId: string | null
  name: string
  description: string | null
  price: number | null
  pricingMode: AdminCatalogPricingMode
  isActive: boolean
}

export interface AdminProviderSummary {
  id: string
  userId: string
  businessName: string | null
  bio: string | null
  serviceDescription: string | null
  serviceArea: string | null
  yearsExperience: number | null
  verificationStatus: string
  averageRating: number
  reviewCount: number
  totalBookings: number | null
  completionRate: number | null
  isActive: boolean
  createdAt: string | null
  approvedByUserId?: string | null
  approvedByName?: string | null
  userEmail: string | null
  userFullName: string | null
  userContactNumber?: string | null
  userStatus: string | null
}

export interface UpsertAdminCategoryRequest {
  name: string
  description?: string | null
  icon?: string | null
  isActive?: boolean
  sortOrder?: number
}

export interface UpsertAdminServiceRequest {
  categoryId?: string | null
  name: string
  description?: string | null
  price?: number | null
  pricingMode?: AdminCatalogPricingMode
  isActive?: boolean
}

export interface AdminSupportTicketSummary {
  id: string
  userId: string
  subject: string
  message: string | null
  category: string | null
  status: AdminSupportTicketStatus
  assigneeId?: string | null
  createdAt: string | null
  attachments?: unknown[]
}

export interface AdminSupportTicketReplySummary {
  id: string
  ticketId: string
  repliedBy: string
  message: string
  createdAt: string | null
}

export interface AdminDisputeSummary {
  id: string
  bookingId: string | null
  bookingReference: string | null
  customerId: string | null
  providerId: string | null
  raisedBy: string
  reason: string | null
  status: AdminDisputeStatus
  amount: number
  createdAt: string | null
}

export interface AdminBookingSummary {
  id: string
  bookingReference: string
  customerId: string
  customerFullName?: string | null
  customerContactNumber?: string | null
  providerId: string
  serviceId: string | null
  serviceTitle: string | null
  serviceAddress: string | null
  scheduledAt: string
  status: AdminBookingStatus
  totalAmount: number
  cancelReason: string | null
  cancelExplanation: string | null
  cancelledAt: string | null
  createdAt: string | null
  updatedAt: string | null
  escalationCount: number
  latestEscalationPriority: AdminBookingEscalationPriority | null
  latestEscalationReason: string | null
  latestEscalatedAt: string | null
  attachments: unknown[]
}

export interface AdminBookingFilter {
  status?: AdminBookingStatus | null
  query?: string | null
  limit?: number | null
}

export interface AdminBookingsByStatus {
  pending: number
  confirmed: number
  in_progress: number
  completed: number
  cancelled: number
  rejected: number
}

export interface AdminBookingsSummaryStats {
  totalCount: number
  byStatus: AdminBookingsByStatus
  totalRevenue: number
  recentCount: number
}

export interface AdminProviderMessageResult {
  bookingId: string
  providerUserId: string
  notificationId: string
  messageId: string | null
}

export type AdminBookingMessageRole = 'admin' | 'provider' | 'customer'

export interface AdminBookingMessage {
  id: string
  bookingId: string
  senderUserId: string
  senderRole: AdminBookingMessageRole
  body: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface AdminOperationsAlerts {
  pendingBookings: number
  overdueBookings: number
  openSupportTickets: number
  openDisputes: number
  pendingProviderApplications: number
  flaggedReviews: number
}

export interface AdminAuditLogSummary {
  id: string
  adminUserId: string
  adminEmail: string | null
  adminName: string | null
  action: string
  actionType: AdminAuditActionType
  entityType: string
  entityId: string | null
  details: string | null
  ipAddress: string | null
  metadata: Record<string, unknown>
  createdAt: string | null
}

export interface AdminAuditLogFilter {
  adminUserId?: string | null
  actionType?: AdminAuditActionType | null
  entityType?: string | null
  query?: string | null
  from?: string | null
  to?: string | null
  limit?: number | null
}

export interface AdminProviderApplicationSummary {
  id: string
  applicationReference: string
  userId: string
  businessName: string | null
  serviceArea: string | null
  serviceDescription: string | null
  yearsExperience: number | null
  verificationStatus: AdminProviderApplicationStatus
  isActive: boolean
  averageRating: number
  reviewCount: number
  serviceCount: number
  documentCount: number
  pendingDocumentCount: number
  approvedDocumentCount: number
  rejectedDocumentCount: number
  latestDecisionReason: string | null
  latestDecisionAt: string | null
  latestDecidedBy: string | null
  createdAt: string | null
  updatedAt: string | null
  documents: AdminProviderApplicationDocumentSummary[]
}

export interface AdminProviderApplicationDocumentSummary {
  id: string
  applicationId: string
  userId: string
  documentType: string
  fileUrl: string | null
  storagePath: string | null
  status: AdminProviderApplicationStatus
  createdAt: string | null
  previewUrl: string | null
  downloadUrl: string | null
}

export interface AdminProviderApplicationChecklistItem {
  id: string
  label: string
  subtitle?: string | null
  checked: boolean
}

export interface AdminProviderApplicationVerificationRecord {
  id: string
  label: string
  status: 'pending' | 'verified' | 'failed' | 'not_applicable'
  reference: string | null
  checkedAt: string | null
  details: string | null
}

export interface AdminProviderApplicationReviewNote {
  id: string
  adminUserId: string
  adminName?: string | null
  note: string
  createdAt: string | null
}

export interface AdminProviderApplicationReviewOcrData {
  governmentIdType?: string | null
  governmentIdNumber?: string | null
  tinNumber?: string | null
  nbiNumber?: string | null
  prcNumber?: string | null
}

export interface AdminProviderApplicationReview {
  applicationId: string
  kycChecklist: AdminProviderApplicationChecklistItem[]
  businessChecklist: AdminProviderApplicationChecklistItem[]
  verificationRecords: AdminProviderApplicationVerificationRecord[]
  ocrData: AdminProviderApplicationReviewOcrData
  notes: AdminProviderApplicationReviewNote[]
  isComplete: boolean
  updatedBy: string | null
  updatedAt: string | null
}

export interface UpdateAdminProviderApplicationReviewInput {
  kycChecklist: AdminProviderApplicationChecklistItem[]
  businessChecklist: AdminProviderApplicationChecklistItem[]
  verificationRecords: AdminProviderApplicationVerificationRecord[]
  ocrData: AdminProviderApplicationReviewOcrData
}

export interface AdminProviderApplicationInfoRequestResult {
  applicationId: string
  providerUserId: string
  notificationId: string
}

export interface AdminProviderApplicationFilter {
  status?: AdminProviderApplicationStatus | null
  query?: string | null
  limit?: number | null
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
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getAdminApiBaseUrl(): string {
  return resolveGatewayBaseUrl()
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SupabaseAuthSession> {
  const normalizedUrl = SUPABASE_URL?.replace(/\/$/, '')
  const normalizedKey = SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!normalizedUrl || !normalizedKey) {
    throw new Error(
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for admin login.',
    )
  }

  const response = await fetch(
    `${normalizedUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: normalizedKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
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

export function updateCurrentUserProfile(
  token: string,
  body: UpdateCurrentUserProfileRequest,
): Promise<CurrentUserProfile> {
  return request<CurrentUserProfile>('/v1/me', {
    method: 'PATCH',
    token,
    body,
  })
}

export function updateCurrentUserPassword(
  token: string,
  body: UpdateCurrentUserPasswordRequest,
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/v1/me/password', {
    method: 'PATCH',
    token,
    body,
  })
}

export interface CurrentUserSessionSummary {
  id: string
  email: string
  createdAt: string | null
  lastSignInAt: string | null
  isCurrent: boolean
}

export function listCurrentUserSessions(
  token: string,
): Promise<CurrentUserSessionSummary[]> {
  return request<CurrentUserSessionSummary[]>('/v1/me/sessions', { token })
}

export function enableCurrentUserTwoFactor(
  token: string,
): Promise<TwoFactorProvisioningResponse> {
  return request<TwoFactorProvisioningResponse>('/v1/me/two-factor/enable', {
    method: 'POST',
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

export function getUserPreferences(token: string): Promise<UserPreferenceSummary> {
  return request<UserPreferenceSummary>('/v1/me/preferences', {
    token,
  })
}

export function updateUserPreferences(
  token: string,
  body: UpdateUserPreferencesRequest,
): Promise<UserPreferenceSummary> {
  return request<UserPreferenceSummary>('/v1/me/preferences', {
    method: 'PUT',
    token,
    body,
  })
}

export function listAdminPayments(
  token: string,
  status?: AdminPaymentStatus | null,
): Promise<AdminPaymentSummary[]> {
  return request<AdminPaymentSummary[]>('/v1/admin/payments', {
    token,
    query: { status },
  })
}

export function listAdminPaymentFailures(
  token: string,
): Promise<AdminPaymentSummary[]> {
  return request<AdminPaymentSummary[]>('/v1/admin/payments/failures', {
    token,
  })
}

export function getAdminPayment(
  token: string,
  paymentId: string,
): Promise<AdminPaymentSummary> {
  return request<AdminPaymentSummary>(
    `/v1/admin/payments/${encodeURIComponent(paymentId)}`,
    { token },
  )
}

export function updateAdminPaymentStatus(
  token: string,
  paymentId: string,
  status: AdminPaymentStatus,
): Promise<AdminPaymentSummary> {
  return request<AdminPaymentSummary>(
    `/v1/admin/payments/${encodeURIComponent(paymentId)}/status`,
    {
      method: 'PATCH',
      token,
      body: { status },
    },
  )
}

export function recordAdminPaymentFailure(
  token: string,
  paymentId: string,
  body: RecordPaymentFailureRequest,
): Promise<AdminPaymentSummary> {
  return request<AdminPaymentSummary>(
    `/v1/admin/payments/${encodeURIComponent(paymentId)}/failure`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function retryAdminPayment(
  token: string,
  paymentId: string,
): Promise<AdminPaymentSummary> {
  return request<AdminPaymentSummary>(
    `/v1/admin/payments/${encodeURIComponent(paymentId)}/retry`,
    {
      method: 'POST',
      token,
    },
  )
}

export function syncAdminPaymentWithApicenter(
  token: string,
  paymentId: string,
): Promise<AdminPaymentSummary> {
  return request<AdminPaymentSummary>(
    `/v1/admin/payments/${encodeURIComponent(paymentId)}/apicenter-sync`,
    {
      method: 'POST',
      token,
    },
  )
}

export function listAdminPayouts(
  token: string,
  status?: AdminPayoutStatus | null,
): Promise<AdminPayoutSummary[]> {
  return request<AdminPayoutSummary[]>('/v1/admin/payments/payouts', {
    token,
    query: { status },
  })
}

export function updateAdminPayoutStatus(
  token: string,
  payoutId: string,
  status: AdminPayoutStatus,
): Promise<AdminPayoutSummary> {
  return request<AdminPayoutSummary>(
    `/v1/admin/payments/payouts/${encodeURIComponent(payoutId)}/status`,
    {
      method: 'PATCH',
      token,
      body: { status },
    },
  )
}

export function listAdminSettlements(
  token: string,
  status?: AdminPayoutStatus | null,
): Promise<AdminPayoutSummary[]> {
  return request<AdminPayoutSummary[]>('/v1/admin/settlements', {
    token,
    query: {
      status: status ?? undefined,
    },
  })
}

export function approveAdminSettlement(
  token: string,
  settlementId: string,
): Promise<AdminPayoutSummary> {
  return request<AdminPayoutSummary>(
    `/v1/admin/settlements/${encodeURIComponent(settlementId)}/approve`,
    {
      method: 'POST',
      token,
    },
  )
}

export function rejectAdminSettlement(
  token: string,
  settlementId: string,
): Promise<AdminPayoutSummary> {
  return request<AdminPayoutSummary>(
    `/v1/admin/settlements/${encodeURIComponent(settlementId)}/reject`,
    {
      method: 'POST',
      token,
    },
  )
}

export function listAdminSettlementHistory(
  token: string,
  settlementId: string,
): Promise<AdminPayoutEventSummary[]> {
  return request<AdminPayoutEventSummary[]>(
    `/v1/admin/settlements/${encodeURIComponent(settlementId)}/history`,
    {
      token,
    },
  )
}

export function reconcileAdminSettlement(
  token: string,
  settlementId: string,
  body: { bankReference: string; note?: string | null },
): Promise<AdminPayoutSummary> {
  return request<AdminPayoutSummary>(
    `/v1/admin/settlements/${encodeURIComponent(settlementId)}/reconcile`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function listAdminRefunds(
  token: string,
  status?: AdminRefundStatus | null,
): Promise<AdminRefundSummary[]> {
  return request<AdminRefundSummary[]>('/v1/admin/refunds', {
    token,
    query: { status },
  })
}

export function approveAdminRefund(
  token: string,
  refundId: string,
  reason?: string | null,
): Promise<AdminRefundSummary> {
  return request<AdminRefundSummary>(
    `/v1/admin/refunds/${encodeURIComponent(refundId)}/approve`,
    {
      method: 'POST',
      token,
      body: { reason: reason ?? null },
    },
  )
}

export function rejectAdminRefund(
  token: string,
  refundId: string,
  reason: string,
): Promise<AdminRefundSummary> {
  return request<AdminRefundSummary>(
    `/v1/admin/refunds/${encodeURIComponent(refundId)}/reject`,
    {
      method: 'POST',
      token,
      body: { reason },
    },
  )
}

export function listAdminReviews(
  token: string,
  options: {
    providerId?: string | null
    flaggedOnly?: boolean | null
    limit?: number | null
  } = {},
): Promise<AdminReviewSummary[]> {
  return request<AdminReviewSummary[]>('/v1/admin/reviews', {
    token,
    query: {
      providerId: options.providerId ?? undefined,
      flagged: options.flaggedOnly ? 'true' : undefined,
      limit: options.limit ? String(options.limit) : undefined,
    },
  })
}

export function setAdminReviewFlagged(
  token: string,
  reviewId: string,
  isFlagged: boolean,
  reason?: string | null,
): Promise<AdminReviewSummary> {
  return request<AdminReviewSummary>(
    `/v1/admin/reviews/${encodeURIComponent(reviewId)}/flag`,
    {
      method: 'PATCH',
      token,
      body: { isFlagged, reason: reason ?? null },
    },
  )
}

export function sendAdminBroadcast(
  token: string,
  body: SendAdminBroadcastRequest,
): Promise<AdminBroadcastSummary> {
  return request<AdminBroadcastSummary>('/v1/admin/broadcasts', {
    method: 'POST',
    token,
    body,
  })
}

export function listAdminBroadcasts(
  token: string,
  limit = 100,
): Promise<AdminBroadcastSummary[]> {
  return request<AdminBroadcastSummary[]>('/v1/admin/broadcasts', {
    token,
    query: { limit: String(limit) },
  })
}

export function listAdminCommissionRules(
  token: string,
): Promise<AdminCommissionRuleSummary[]> {
  return request<AdminCommissionRuleSummary[]>('/v1/admin/commission-rules', {
    token,
  })
}

export function updateAdminCommissionRule(
  token: string,
  ruleId: string,
  body: {
    currentRate: number
    status?: AdminCommissionRuleStatus | null
  },
): Promise<AdminCommissionRuleSummary> {
  return request<AdminCommissionRuleSummary>(
    `/v1/admin/commission-rules/${encodeURIComponent(ruleId)}`,
    {
      method: 'PATCH',
      token,
      body,
    },
  )
}

export function listAdminPromotions(
  token: string,
  status?: AdminPromotionStatus | null,
): Promise<AdminPromotionSummary[]> {
  return request<AdminPromotionSummary[]>('/v1/admin/promotions', {
    token,
    query: { status },
  })
}

export function createAdminPromotion(
  token: string,
  body: UpsertAdminPromotionRequest,
): Promise<AdminPromotionSummary> {
  return request<AdminPromotionSummary>('/v1/admin/promotions', {
    method: 'POST',
    token,
    body,
  })
}

export function updateAdminPromotion(
  token: string,
  promotionId: string,
  body: UpsertAdminPromotionRequest,
): Promise<AdminPromotionSummary> {
  return request<AdminPromotionSummary>(
    `/v1/admin/promotions/${encodeURIComponent(promotionId)}`,
    {
      method: 'PATCH',
      token,
      body,
    },
  )
}

export function deleteAdminPromotion(
  token: string,
  promotionId: string,
): Promise<AdminPromotionSummary> {
  return request<AdminPromotionSummary>(
    `/v1/admin/promotions/${encodeURIComponent(promotionId)}`,
    {
      method: 'DELETE',
      token,
    },
  )
}

export function listAdminSupportTickets(
  token: string,
  status?: AdminSupportTicketStatus | null,
): Promise<AdminSupportTicketSummary[]> {
  return request<AdminSupportTicketSummary[]>('/v1/admin/support/tickets', {
    token,
    query: { status },
  })
}

export function getAdminSupportTicket(
  token: string,
  ticketId: string,
): Promise<AdminSupportTicketSummary> {
  return request<AdminSupportTicketSummary>(
    `/v1/admin/support/tickets/${encodeURIComponent(ticketId)}`,
    { token },
  )
}

export function updateAdminSupportTicketStatus(
  token: string,
  ticketId: string,
  status: AdminSupportTicketStatus,
): Promise<AdminSupportTicketSummary> {
  return request<AdminSupportTicketSummary>(
    `/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/status`,
    {
      method: 'PATCH',
      token,
      body: { status },
    },
  )
}

export function listAdminDisputes(
  token: string,
  status?: AdminDisputeStatus | null,
): Promise<AdminDisputeSummary[]> {
  return request<AdminDisputeSummary[]>('/v1/admin/disputes', {
    token,
    query: { status },
  })
}

export function getAdminDispute(
  token: string,
  disputeId: string,
): Promise<AdminDisputeSummary> {
  return request<AdminDisputeSummary>(
    `/v1/admin/disputes/${encodeURIComponent(disputeId)}`,
    {
      token,
    },
  )
}

export function resolveAdminDispute(
  token: string,
  disputeId: string,
): Promise<AdminDisputeSummary> {
  return request<AdminDisputeSummary>(
    `/v1/admin/disputes/${encodeURIComponent(disputeId)}/resolve`,
    {
      method: 'POST',
      token,
    },
  )
}

export function getAdminOperationsAlerts(token: string): Promise<AdminOperationsAlerts> {
  return request<AdminOperationsAlerts>('/v1/admin/bookings/operations/alerts', { token })
}

export function getAdminBookingsSummary(token: string): Promise<AdminBookingsSummaryStats> {
  return request<AdminBookingsSummaryStats>('/v1/admin/bookings/summary', { token })
}

export function listAdminBookings(
  token: string,
  filter: AdminBookingFilter = {},
): Promise<AdminBookingSummary[]> {
  return request<AdminBookingSummary[]>('/v1/admin/bookings', {
    token,
    query: {
      status: filter.status,
      query: filter.query,
      limit: filter.limit ? String(filter.limit) : null,
    },
  })
}

export function getAdminBooking(
  token: string,
  bookingId: string,
): Promise<AdminBookingSummary> {
  return request<AdminBookingSummary>(
    `/v1/admin/bookings/${encodeURIComponent(bookingId)}`,
    {
      token,
    },
  )
}

export function cancelAdminBooking(
  token: string,
  bookingId: string,
  body: { reason: string; explanation?: string | null },
): Promise<AdminBookingSummary> {
  return request<AdminBookingSummary>(
    `/v1/admin/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function escalateAdminBooking(
  token: string,
  bookingId: string,
  body: {
    reason: string
    priority?: AdminBookingEscalationPriority | null
  },
): Promise<AdminBookingSummary> {
  return request<AdminBookingSummary>(
    `/v1/admin/bookings/${encodeURIComponent(bookingId)}/escalate`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function sendAdminProviderMessage(
  token: string,
  bookingId: string,
  message: string,
): Promise<AdminProviderMessageResult> {
  return request<AdminProviderMessageResult>(
    `/v1/admin/bookings/${encodeURIComponent(bookingId)}/provider-messages`,
    {
      method: 'POST',
      token,
      body: { message },
    },
  )
}

export function listAdminBookingMessages(
  token: string,
  bookingId: string,
): Promise<AdminBookingMessage[]> {
  return request<AdminBookingMessage[]>(
    `/v1/admin/bookings/${encodeURIComponent(bookingId)}/messages`,
    { token },
  )
}

export function appendAdminBookingMessage(
  token: string,
  bookingId: string,
  body: {
    message: string
    senderRole?: AdminBookingMessageRole
    metadata?: Record<string, unknown> | null
  },
): Promise<AdminBookingMessage> {
  return request<AdminBookingMessage>(
    `/v1/admin/bookings/${encodeURIComponent(bookingId)}/messages`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function listAdminAuditLogs(
  token: string,
  filter: AdminAuditLogFilter = {},
): Promise<AdminAuditLogSummary[]> {
  return request<AdminAuditLogSummary[]>('/v1/admin/audit-logs', {
    token,
    query: {
      adminUserId: filter.adminUserId,
      actionType: filter.actionType,
      entityType: filter.entityType,
      query: filter.query,
      from: filter.from,
      to: filter.to,
      limit: filter.limit ? String(filter.limit) : null,
    },
  })
}

export function listAdminProviderApplications(
  token: string,
  filter: AdminProviderApplicationFilter = {},
): Promise<AdminProviderApplicationSummary[]> {
  return request<AdminProviderApplicationSummary[]>(
    '/v1/admin/provider-applications',
    {
      token,
      query: {
        status: filter.status,
        query: filter.query,
        limit: filter.limit ? String(filter.limit) : null,
      },
    },
  )
}

export function getAdminProviderApplication(
  token: string,
  applicationId: string,
): Promise<AdminProviderApplicationSummary> {
  return request<AdminProviderApplicationSummary>(
    `/v1/admin/provider-applications/${encodeURIComponent(applicationId)}`,
    {
      token,
    },
  )
}

export function getAdminProviderApplicationDocument(
  token: string,
  applicationId: string,
  documentId: string,
): Promise<AdminProviderApplicationDocumentSummary> {
  return request<AdminProviderApplicationDocumentSummary>(
    `/v1/admin/provider-applications/${encodeURIComponent(applicationId)}/documents/${encodeURIComponent(documentId)}`,
    {
      token,
    },
  )
}

export function getAdminProviderApplicationReview(
  token: string,
  applicationId: string,
): Promise<AdminProviderApplicationReview> {
  return request<AdminProviderApplicationReview>(
    `/v1/admin/provider-applications/${encodeURIComponent(applicationId)}/review`,
    {
      token,
    },
  )
}

export function updateAdminProviderApplicationReview(
  token: string,
  applicationId: string,
  input: UpdateAdminProviderApplicationReviewInput,
): Promise<AdminProviderApplicationReview> {
  return request<AdminProviderApplicationReview>(
    `/v1/admin/provider-applications/${encodeURIComponent(applicationId)}/review`,
    {
      method: 'PUT',
      token,
      body: input,
    },
  )
}

export function addAdminProviderApplicationReviewNote(
  token: string,
  applicationId: string,
  note: string,
): Promise<AdminProviderApplicationReview> {
  return request<AdminProviderApplicationReview>(
    `/v1/admin/provider-applications/${encodeURIComponent(applicationId)}/review/notes`,
    {
      method: 'POST',
      token,
      body: { note },
    },
  )
}

export function requestAdminProviderApplicationInfo(
  token: string,
  applicationId: string,
  message: string,
): Promise<AdminProviderApplicationInfoRequestResult> {
  return request<AdminProviderApplicationInfoRequestResult>(
    `/v1/admin/provider-applications/${encodeURIComponent(applicationId)}/request-info`,
    {
      method: 'POST',
      token,
      body: { message },
    },
  )
}

export function approveAdminProviderApplication(
  token: string,
  applicationId: string,
  reason?: string | null,
): Promise<AdminProviderApplicationSummary> {
  return request<AdminProviderApplicationSummary>(
    `/v1/admin/provider-applications/${encodeURIComponent(applicationId)}/approve`,
    {
      method: 'POST',
      token,
      body: { reason },
    },
  )
}

export function rejectAdminProviderApplication(
  token: string,
  applicationId: string,
  reason: string,
): Promise<AdminProviderApplicationSummary> {
  return request<AdminProviderApplicationSummary>(
    `/v1/admin/provider-applications/${encodeURIComponent(applicationId)}/reject`,
    {
      method: 'POST',
      token,
      body: { reason },
    },
  )
}

export async function exportAdminAuditLogsCsv(
  token: string,
  filter: AdminAuditLogFilter = {},
): Promise<string> {
  const url = new URL(`${getAdminApiBaseUrl()}/v1/admin/audit-logs/export`)
  const query: Record<string, string | null | undefined> = {
    adminUserId: filter.adminUserId,
    actionType: filter.actionType,
    entityType: filter.entityType,
    query: filter.query,
    from: filter.from,
    to: filter.to,
    limit: filter.limit ? String(filter.limit) : null,
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url.toString(), {
    headers: {
      accept: 'text/csv',
      authorization: `Bearer ${token.trim()}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Gateway request failed with ${response.status}`)
  }

  return response.text()
}

export interface AdminIntegrationSummary {
  provider: string
  displayName: string
  category: string
  isEnabled: boolean
  status: 'active' | 'inactive' | 'error'
  webhookUrl: string | null
  apiKeyPreview: string | null
  lastTestedAt: string | null
  lastError: string | null
  updatedBy: string | null
  updatedAt: string | null
  createdAt: string | null
}

export function listAdminIntegrations(
  token: string,
): Promise<AdminIntegrationSummary[]> {
  return request<AdminIntegrationSummary[]>('/v1/admin/integrations', { token })
}

export function updateAdminIntegrationCredentials(
  token: string,
  provider: string,
  input: {
    isEnabled?: boolean | null
    webhookUrl?: string | null
    apiKeyPreview?: string | null
  },
): Promise<AdminIntegrationSummary> {
  return request<AdminIntegrationSummary>(
    `/v1/admin/integrations/${encodeURIComponent(provider)}/credentials`,
    {
      token,
      method: 'PATCH',
      body: input,
    },
  )
}

export function testAdminIntegration(
  token: string,
  provider: string,
  input: { success?: boolean; errorMessage?: string | null } = {},
): Promise<AdminIntegrationSummary> {
  return request<AdminIntegrationSummary>(
    `/v1/admin/integrations/${encodeURIComponent(provider)}/test`,
    {
      token,
      method: 'POST',
      body: input,
    },
  )
}

export async function exportAdminBookingsCsv(token: string): Promise<string> {
  return exportAdminReportCsv(token, 'bookings')
}

export async function exportAdminRevenueCsv(token: string): Promise<string> {
  return exportAdminReportCsv(token, 'revenue')
}

export async function exportAdminUsersCsv(token: string): Promise<string> {
  return exportAdminReportCsv(token, 'users')
}

export async function exportAdminFinancialCsv(token: string): Promise<string> {
  return exportAdminReportCsv(token, 'financial')
}

export type AdminReportCsvKind =
  | 'bookings'
  | 'revenue'
  | 'users'
  | 'financial'

export type AdminReportKind = AdminReportCsvKind
export type AdminReportFormat = 'csv' | 'pdf'
export type AdminReportFrequency = 'daily' | 'weekly' | 'monthly'

export interface GeneratedAdminReport {
  id: string
  type: AdminReportKind
  format: AdminReportFormat
  status: 'ready'
  generatedAt: string
  fileName: string
  downloadPath: string
  rowCount: number
  dateRange: string | null
}

export interface ScheduledAdminReport {
  id: string
  type: AdminReportKind
  format: AdminReportFormat
  status: 'scheduled'
  name: string
  frequency: AdminReportFrequency
  recipients: string[]
  nextRunAt: string
  createdAt: string
  downloadPath: string
  lastDeliveredAt: string | null
  lastDeliveryError: string | null
  deliveryCount: number
}

export interface GenerateAdminReportRequest {
  format?: AdminReportFormat
  dateRange?: string | null
}

export interface ScheduleAdminReportRequest {
  name: string
  frequency: AdminReportFrequency
  recipients: string[]
  format?: AdminReportFormat
}

export async function exportAdminReportCsv(
  token: string,
  kind: AdminReportCsvKind,
): Promise<string> {
  const response = await fetch(
    `${getAdminApiBaseUrl()}/v1/admin/reports/${kind}.csv`,
    {
      headers: {
        accept: 'text/csv',
        authorization: `Bearer ${token.trim()}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Gateway request failed with ${response.status}`)
  }

  return response.text()
}

export async function exportAdminReportPdf(
  token: string,
  kind: AdminReportKind,
): Promise<Blob> {
  const response = await fetch(
    `${getAdminApiBaseUrl()}/v1/admin/reports/${kind}.pdf`,
    {
      headers: {
        accept: 'application/pdf',
        authorization: `Bearer ${token.trim()}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Gateway request failed with ${response.status}`)
  }

  return response.blob()
}

export function generateAdminReport(
  token: string,
  kind: AdminReportKind,
  body: GenerateAdminReportRequest,
): Promise<GeneratedAdminReport> {
  return request<GeneratedAdminReport>(`/v1/admin/reports/${kind}`, {
    method: 'POST',
    token,
    body,
  })
}

export function scheduleAdminReport(
  token: string,
  kind: AdminReportKind,
  body: ScheduleAdminReportRequest,
): Promise<ScheduledAdminReport> {
  return request<ScheduledAdminReport>(
    `/v1/admin/reports/${kind}/schedules`,
    {
      method: 'POST',
      token,
      body,
    },
  )
}

export function listAdminReportSchedules(
  token: string,
  kind: AdminReportKind,
): Promise<ScheduledAdminReport[]> {
  return request<ScheduledAdminReport[]>(
    `/v1/admin/reports/${kind}/schedules`,
    {
      token,
    },
  )
}

export function getAdminUsersSummary(token: string): Promise<AdminUsersSummaryStats> {
  return request<AdminUsersSummaryStats>('/v1/admin/users/summary', { token })
}

export function listAdminUsers(
  token: string,
  filters: { role?: AdminUserRole | null; status?: AdminUserStatus | null; query?: string | null } = {},
): Promise<AdminUserSummary[]> {
  return request<AdminUserSummary[]>('/v1/admin/users', {
    token,
    query: { role: filters.role, status: filters.status, query: filters.query },
  })
}

export function updateAdminUserStatus(
  token: string,
  userId: string,
  status: AdminUserStatus,
): Promise<AdminUserSummary> {
  return request<AdminUserSummary>(
    `/v1/admin/users/${encodeURIComponent(userId)}/status`,
    { method: 'PATCH', token, body: { status } },
  )
}

export function updateAdminUserAccess(
  token: string,
  userId: string,
  body: UpdateAdminUserAccessRequest,
): Promise<AdminUserSummary> {
  return request<AdminUserSummary>(
    `/v1/admin/users/${encodeURIComponent(userId)}/access`,
    { method: 'PATCH', token, body },
  )
}

export function deleteAdminUser(
  token: string,
  userId: string,
): Promise<AdminUserSummary> {
  return request<AdminUserSummary>(
    `/v1/admin/users/${encodeURIComponent(userId)}`,
    { method: 'DELETE', token },
  )
}

export function createAdminUser(
  token: string,
  body: CreateAdminUserRequest,
): Promise<AdminUserSummary> {
  return request<AdminUserSummary>('/v1/admin/users', {
    method: 'POST',
    token,
    body,
  })
}

export function listAdminCategories(token: string): Promise<AdminCategoryItem[]> {
  return request<AdminCategoryItem[]>('/v1/admin/catalog/categories', { token })
}

export function createAdminCategory(
  token: string,
  body: UpsertAdminCategoryRequest,
): Promise<AdminCategoryItem> {
  return request<AdminCategoryItem>('/v1/admin/catalog/categories', {
    method: 'POST',
    token,
    body,
  })
}

export function updateAdminCategory(
  token: string,
  categoryId: string,
  body: UpsertAdminCategoryRequest,
): Promise<AdminCategoryItem> {
  return request<AdminCategoryItem>(
    `/v1/admin/catalog/categories/${encodeURIComponent(categoryId)}`,
    { method: 'PATCH', token, body },
  )
}

export async function deleteAdminCategory(
  token: string,
  categoryId: string,
): Promise<void> {
  const url = new URL(`${getAdminApiBaseUrl()}/v1/admin/catalog/categories/${encodeURIComponent(categoryId)}`)
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${token.trim()}`,
    },
  })
  if (!response.ok && response.status !== 204) {
    throw new Error(`Delete category failed with ${response.status}`)
  }
}

export function listAdminServices(
  token: string,
  categoryId?: string | null,
): Promise<AdminServiceItem[]> {
  return request<AdminServiceItem[]>('/v1/admin/catalog/services', {
    token,
    query: { categoryId },
  })
}

export function createAdminService(
  token: string,
  body: UpsertAdminServiceRequest,
): Promise<AdminServiceItem> {
  return request<AdminServiceItem>('/v1/admin/catalog/services', {
    method: 'POST',
    token,
    body,
  })
}

export function updateAdminService(
  token: string,
  serviceId: string,
  body: UpsertAdminServiceRequest,
): Promise<AdminServiceItem> {
  return request<AdminServiceItem>(
    `/v1/admin/catalog/services/${encodeURIComponent(serviceId)}`,
    { method: 'PATCH', token, body },
  )
}

export async function deleteAdminService(
  token: string,
  serviceId: string,
): Promise<void> {
  const url = new URL(`${getAdminApiBaseUrl()}/v1/admin/catalog/services/${encodeURIComponent(serviceId)}`)
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${token.trim()}`,
    },
  })
  if (!response.ok && response.status !== 204) {
    throw new Error(`Delete service failed with ${response.status}`)
  }
}

export function listAdminManagedProviders(
  token: string,
  filters: { status?: AdminProviderStatus | null; query?: string | null } = {},
): Promise<AdminProviderSummary[]> {
  return request<AdminProviderSummary[]>('/v1/admin/providers', {
    token,
    query: { status: filters.status, query: filters.query },
  })
}

export function getAdminManagedProvider(
  token: string,
  providerId: string,
): Promise<AdminProviderSummary> {
  return request<AdminProviderSummary>(
    `/v1/admin/providers/${encodeURIComponent(providerId)}`,
    { token },
  )
}

export function updateAdminManagedProviderStatus(
  token: string,
  providerId: string,
  status: AdminProviderStatus,
  reason?: string | null,
): Promise<AdminProviderSummary> {
  return request<AdminProviderSummary>(
    `/v1/admin/providers/${encodeURIComponent(providerId)}/status`,
    { method: 'PATCH', token, body: { status, reason: reason ?? null } },
  )
}

export interface AdminProviderPortfolioMediaSummary {
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

export function listAdminProviderPortfolio(
  token: string,
  providerId: string,
): Promise<AdminProviderPortfolioMediaSummary[]> {
  return request<AdminProviderPortfolioMediaSummary[]>(
    `/v1/admin/providers/${encodeURIComponent(providerId)}/portfolio`,
    { token },
  )
}

export function deleteAdminProviderPortfolioMedia(
  token: string,
  providerId: string,
  mediaId: string,
): Promise<void> {
  return request<void>(
    `/v1/admin/providers/${encodeURIComponent(providerId)}/portfolio/${encodeURIComponent(mediaId)}`,
    { method: 'DELETE', token },
  )
}

export type AdminAvailabilityDayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface AdminAvailabilityWindow {
  id: string
  dayOfWeek: AdminAvailabilityDayOfWeek
  startTime: string
  endTime: string
  isActive: boolean
  sortOrder: number
}

export interface AdminAvailabilityDayOff {
  id: string
  offDate: string
  reason: string | null
}

export interface AdminAvailabilitySchedule {
  providerId: string
  windows: AdminAvailabilityWindow[]
  daysOff: AdminAvailabilityDayOff[]
}

export function getAdminProviderAvailability(
  token: string,
  providerId: string,
): Promise<AdminAvailabilitySchedule> {
  return request<AdminAvailabilitySchedule>(
    `/v1/provider/availability/${encodeURIComponent(providerId)}`,
    { token },
  )
}

export function listAdminSupportTicketReplies(
  token: string,
  ticketId: string,
): Promise<AdminSupportTicketReplySummary[]> {
  return request<AdminSupportTicketReplySummary[]>(
    `/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/replies`,
    { token },
  )
}

export function addAdminSupportTicketReply(
  token: string,
  ticketId: string,
  body: { repliedBy: string; message: string },
): Promise<AdminSupportTicketReplySummary> {
  return request<AdminSupportTicketReplySummary>(
    `/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/replies`,
    { method: 'POST', token, body },
  )
}

export function assignAdminSupportTicket(
  token: string,
  ticketId: string,
  assigneeId: string | null,
): Promise<AdminSupportTicketSummary> {
  return request<AdminSupportTicketSummary>(
    `/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/assignee`,
    { method: 'PATCH', token, body: { assigneeId } },
  )
}

export function listCatalogCategories(): Promise<CatalogCategory[]> {
  return request<CatalogCategory[]>('/v1/catalog/categories')
}

export function listCatalogServices(
  categoryId?: string | null,
): Promise<CatalogServiceItem[]> {
  return request<CatalogServiceItem[]>('/v1/catalog/services', {
    query: { categoryId },
  })
}

export function listProviderListings(
  serviceId?: string | null,
): Promise<ProviderServiceListing[]> {
  return request<ProviderServiceListing[]>('/v1/catalog/providers', {
    query: { serviceId },
  })
}

export function listAdminPricingRules(
  token: string,
): Promise<AdminPricingCategoryRuleSummary[]> {
  return request<AdminPricingCategoryRuleSummary[]>('/v1/admin/pricing/rules', {
    token,
  })
}

export function saveAdminPricingRule(
  token: string,
  body: {
    ruleId?: string | null
    categoryId?: string | null
    categoryName: string
    pricingMode?: AdminPricingMode | null
    baselineMin: number
    baselineMax: number
    fairBandPercent?: number | null
    travelFeeMin?: number | null
    travelFeeMax?: number | null
    travelMultiplier?: number | null
    travelTimeFeePerMinute?: number | null
    urgencyPriorityMultiplier?: number | null
    urgencyEmergencyMultiplier?: number | null
    outlierWarnPercent?: number | null
    isActive?: boolean | null
  },
): Promise<AdminPricingCategoryRuleSummary> {
  return request<AdminPricingCategoryRuleSummary>('/v1/admin/pricing/rules', {
    method: 'PUT',
    token,
    body,
  })
}

export function listAdminPricingFuelIndex(
  token: string,
): Promise<AdminPricingFuelIndexSummary[]> {
  return request<AdminPricingFuelIndexSummary[]>('/v1/admin/pricing/fuel-index', {
    token,
  })
}

export function createAdminPricingFuelIndex(
  token: string,
  body: {
    region: string
    fuelPricePerLiter: number
    source?: string | null
  },
): Promise<AdminPricingFuelIndexSummary> {
  return request<AdminPricingFuelIndexSummary>('/v1/admin/pricing/fuel-index', {
    method: 'POST',
    token,
    body,
  })
}

export function listAdminPricingQuoteAudits(
  token: string,
): Promise<AdminPricingQuoteAuditSummary[]> {
  return request<AdminPricingQuoteAuditSummary[]>('/v1/admin/pricing/quote-audits', {
    token,
  })
}

async function request<T>(
  path: string,
  { method = 'GET', token, body, query }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${getAdminApiBaseUrl()}${path}`)

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
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`Gateway request failed with ${response.status}`)
    }
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
