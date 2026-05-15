export type AdminPaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'
export type AdminSupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

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
}

export interface AdminSupportTicketSummary {
  id: string
  userId: string
  subject: string
  message: string | null
  category: string | null
  status: AdminSupportTicketStatus
  createdAt: string | null
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

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getAdminApiBaseUrl(): string {
  return DEFAULT_API_BASE_URL.replace(/\/$/, '')
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

export function listAdminPayments(
  token: string,
  status?: AdminPaymentStatus | null,
): Promise<AdminPaymentSummary[]> {
  return request<AdminPaymentSummary[]>('/v1/admin/payments', {
    token,
    query: { status },
  })
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

export function listAdminSupportTickets(
  token: string,
  status?: AdminSupportTicketStatus | null,
): Promise<AdminSupportTicketSummary[]> {
  return request<AdminSupportTicketSummary[]>('/v1/admin/support/tickets', {
    token,
    query: { status },
  })
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
