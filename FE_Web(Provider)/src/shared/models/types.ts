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

export interface AddPortfolioMediaRequest {
  fileUrl: string
  fileName?: string | null
  mimeType?: string | null
  storagePath?: string | null
  fileSize?: number | null
  caption?: string | null
}

export type ReplacePortfolioMediaRequest = AddPortfolioMediaRequest;
