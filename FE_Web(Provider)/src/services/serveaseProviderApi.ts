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

export interface BookingSummary {
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
  status: BookingStatus
  totalAmount: number
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

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const PROVIDER_STORAGE_KEY = 'servease_provider'
export const PROVIDER_TOKEN_STORAGE_KEY = 'servease_provider_access_token'

export function getProviderApiBaseUrl(): string {
  return DEFAULT_API_BASE_URL.replace(/\/$/, '')
}

export function getStoredProviderAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(PROVIDER_TOKEN_STORAGE_KEY)
}

export function clearStoredProviderSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(PROVIDER_STORAGE_KEY)
  localStorage.removeItem(PROVIDER_TOKEN_STORAGE_KEY)
}

export function storeProviderSession(
  token: string,
  profile: CurrentUserProfile,
): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(profile))
  localStorage.setItem(PROVIDER_TOKEN_STORAGE_KEY, token)
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SupabaseAuthSession> {
  const normalizedUrl = SUPABASE_URL?.replace(/\/$/, '')
  const normalizedKey = SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!normalizedUrl || !normalizedKey) {
    throw new Error(
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for provider login.',
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

export function updateProviderBookingStatus(
  token: string,
  bookingId: string,
  currentStatus: BookingStatus,
  nextStatus: BookingStatus,
  reason?: string | null,
): Promise<BookingSummary> {
  return request<BookingSummary>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/status`,
    {
      method: 'PATCH',
      token,
      body: {
        currentStatus,
        nextStatus,
        reason: reason || null,
      },
    },
  )
}

export function listProviderPayments(token: string): Promise<PaymentSummary[]> {
  return request<PaymentSummary[]>('/v1/payments', {
    token,
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
): Promise<ConversationMessage> {
  return request<ConversationMessage>(
    `/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: 'POST',
      token,
      body: { content },
    },
  )
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

async function request<T>(
  path: string,
  { method = 'GET', token, body, query }: RequestOptions = {},
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
    },
    body: body === undefined ? undefined : JSON.stringify(body),
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
