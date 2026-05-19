import { ServEaseApiError } from './errors.js';
import {
  AddProviderDayOffInput,
  ProviderAvailabilitySchedule,
  ReplaceAvailabilityWindowsInput,
} from './types/availability.js';
import {
  BookingSummary,
  CreateBookingInput,
  CreateBookingResult,
  ListBookingsParams,
  UpdateBookingStatusInput,
} from './types/booking.js';
import {
  CatalogCategory,
  CatalogProvider,
  CatalogService,
  ListCatalogProvidersParams,
  ListCatalogServicesParams,
} from './types/catalog.js';
import { ServEaseDataEnvelope, ServEaseErrorEnvelope, ServEaseRequestOptions } from './types/common.js';
import {
  CreatePricingQuoteRequest,
  PricingQuoteSummary,
  ProviderPricingGuidanceRequest,
  ProviderPricingGuidanceSummary,
} from './types/pricing.js';
import { ProviderApplicationStatus } from './types/provider-applications.js';
import {
  CreateCheckoutSessionRequest,
  CreatePaymentRequest,
  CustomerPaymentMethodSummary,
  PaymentCheckoutSessionSummary,
  PaymentSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutSummary,
  PromotionValidationSummary,
  RequestPayoutInput,
  UpsertCustomerPaymentMethodRequest,
  UpsertPayoutMethodRequest,
  ValidatePromotionRequest,
} from './types/payments.js';
import {
  ConversationMessage,
  ConversationSummary,
  CreateConversationMessageRequest,
  OpenConversationRequest,
} from './types/messaging.js';
import {
  CreateReviewReplyRequest,
  CreateReviewRequest,
  FlagReviewRequest,
  ReviewResponseSummary,
  ReviewSummary,
} from './types/reviews.js';
import {
  CreateSupportTicketReplyRequest,
  CreateSupportTicketRequest,
  SupportTicketReplySummary,
  SupportTicketSummary,
} from './types/support.js';
import {
  NotificationSummary,
  PushDeviceSummary,
  RegisterPushDeviceRequest,
} from './types/notifications.js';
import {
  CurrentUserProfile,
  UpdateCurrentUserProfileInput,
  UpdateUserPreferencesRequest,
  UserPreferenceSummary,
} from './types/profile.js';
import {
  GeoAddressResult,
  GeoDirectionsRequest,
  GeoDirectionsRoute,
  GeoGeocodeAddressRequest,
  GeoReverseGeocodeRequest,
} from './types/geo.js';
import { ReferralSummary } from './types/referrals.js';
import { CreateUploadRequest, UploadSummary } from './types/uploads.js';

export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface CreateServEaseClientOptions {
  baseUrl: string;
  accessToken?: string;
  fetch?: FetchLike;
}

export interface ServEaseClient {
  catalog: {
    listCategories(options?: ServEaseRequestOptions): Promise<CatalogCategory[]>;
    listServices(
      params?: ListCatalogServicesParams,
      options?: ServEaseRequestOptions,
    ): Promise<CatalogService[]>;
    listProviders(
      params?: ListCatalogProvidersParams,
      options?: ServEaseRequestOptions,
    ): Promise<CatalogProvider[]>;
  };
  bookings: {
    create(
      input: CreateBookingInput,
      options?: ServEaseRequestOptions,
    ): Promise<CreateBookingResult>;
    list(
      params?: ListBookingsParams,
      options?: ServEaseRequestOptions,
    ): Promise<BookingSummary[]>;
    get(bookingId: string, options?: ServEaseRequestOptions): Promise<BookingSummary>;
    updateStatus(
      bookingId: string,
      input: UpdateBookingStatusInput,
      options?: ServEaseRequestOptions,
    ): Promise<BookingSummary>;
  };
  availability: {
    getProviderAvailability(
      providerId?: string,
      options?: ServEaseRequestOptions,
    ): Promise<ProviderAvailabilitySchedule>;
    replaceWindows(
      input: ReplaceAvailabilityWindowsInput,
      options?: ServEaseRequestOptions,
    ): Promise<ProviderAvailabilitySchedule>;
    addDayOff(
      input: AddProviderDayOffInput,
      options?: ServEaseRequestOptions,
    ): Promise<ProviderAvailabilitySchedule>;
    removeDayOff(
      offDate: string,
      options?: ServEaseRequestOptions,
    ): Promise<ProviderAvailabilitySchedule>;
  };
  pricing: {
    createQuote(
      input: CreatePricingQuoteRequest,
      options?: ServEaseRequestOptions,
    ): Promise<PricingQuoteSummary>;
    getProviderGuidance(
      input: ProviderPricingGuidanceRequest,
      options?: ServEaseRequestOptions,
    ): Promise<ProviderPricingGuidanceSummary>;
  };
  providerApplications: {
    getMine(options?: ServEaseRequestOptions): Promise<ProviderApplicationStatus>;
  };
  payments: {
    list(options?: ServEaseRequestOptions): Promise<PaymentSummary[]>;
    create(
      input: CreatePaymentRequest,
      options?: ServEaseRequestOptions,
    ): Promise<PaymentSummary>;
    createCheckoutSession(
      input: CreateCheckoutSessionRequest,
      options?: ServEaseRequestOptions,
    ): Promise<PaymentCheckoutSessionSummary>;
    getCheckoutStatus(
      checkoutId: string,
      options?: ServEaseRequestOptions,
    ): Promise<PaymentCheckoutSessionSummary>;
    validatePromotion(
      input: ValidatePromotionRequest,
      options?: ServEaseRequestOptions,
    ): Promise<PromotionValidationSummary>;
    listCustomerMethods(
      options?: ServEaseRequestOptions,
    ): Promise<CustomerPaymentMethodSummary[]>;
    upsertCustomerMethod(
      input: UpsertCustomerPaymentMethodRequest,
      options?: ServEaseRequestOptions,
    ): Promise<CustomerPaymentMethodSummary>;
    deleteCustomerMethod(
      methodId: string,
      options?: ServEaseRequestOptions,
    ): Promise<CustomerPaymentMethodSummary>;
    getPayoutAccount(options?: ServEaseRequestOptions): Promise<PayoutAccountSummary>;
    listPayoutMethods(options?: ServEaseRequestOptions): Promise<PayoutMethodSummary[]>;
    upsertPayoutMethod(
      input: UpsertPayoutMethodRequest,
      options?: ServEaseRequestOptions,
    ): Promise<PayoutMethodSummary>;
    listPayouts(options?: ServEaseRequestOptions): Promise<PayoutSummary[]>;
    requestPayout(
      input: RequestPayoutInput,
      options?: ServEaseRequestOptions,
    ): Promise<PayoutSummary>;
  };
  messaging: {
    list(options?: ServEaseRequestOptions): Promise<ConversationSummary[]>;
    open(
      input: OpenConversationRequest,
      options?: ServEaseRequestOptions,
    ): Promise<ConversationSummary>;
    listMessages(
      conversationId: string,
      options?: ServEaseRequestOptions,
    ): Promise<ConversationMessage[]>;
    sendMessage(
      conversationId: string,
      input: CreateConversationMessageRequest,
      options?: ServEaseRequestOptions,
    ): Promise<ConversationMessage>;
  };
  reviews: {
    listProviderReviews(
      providerId: string,
      options?: ServEaseRequestOptions,
    ): Promise<ReviewSummary[]>;
    create(
      input: CreateReviewRequest,
      options?: ServEaseRequestOptions,
    ): Promise<ReviewSummary>;
    reply(
      reviewId: string,
      input: CreateReviewReplyRequest,
      options?: ServEaseRequestOptions,
    ): Promise<ReviewResponseSummary>;
    flag(
      reviewId: string,
      input?: FlagReviewRequest,
      options?: ServEaseRequestOptions,
    ): Promise<ReviewSummary>;
  };
  support: {
    listTickets(options?: ServEaseRequestOptions): Promise<SupportTicketSummary[]>;
    createTicket(
      input: CreateSupportTicketRequest,
      options?: ServEaseRequestOptions,
    ): Promise<SupportTicketSummary>;
    getTicket(
      ticketId: string,
      options?: ServEaseRequestOptions,
    ): Promise<SupportTicketSummary>;
    listReplies(
      ticketId: string,
      options?: ServEaseRequestOptions,
    ): Promise<SupportTicketReplySummary[]>;
    reply(
      ticketId: string,
      input: CreateSupportTicketReplyRequest,
      options?: ServEaseRequestOptions,
    ): Promise<SupportTicketReplySummary>;
  };
  notifications: {
    list(options?: ServEaseRequestOptions): Promise<NotificationSummary[]>;
    markRead(
      notificationId: string,
      options?: ServEaseRequestOptions,
    ): Promise<NotificationSummary>;
    registerDevice(
      input: RegisterPushDeviceRequest,
      options?: ServEaseRequestOptions,
    ): Promise<PushDeviceSummary>;
    unregisterDevice(
      token: string,
      options?: ServEaseRequestOptions,
    ): Promise<{ ok: boolean }>;
  };
  profile: {
    getCurrent(options?: ServEaseRequestOptions): Promise<CurrentUserProfile>;
    update(
      input: UpdateCurrentUserProfileInput,
      options?: ServEaseRequestOptions,
    ): Promise<CurrentUserProfile>;
    getPreferences(options?: ServEaseRequestOptions): Promise<UserPreferenceSummary>;
    updatePreferences(
      input: UpdateUserPreferencesRequest,
      options?: ServEaseRequestOptions,
    ): Promise<UserPreferenceSummary>;
  };
  geo: {
    geocode(
      input: GeoGeocodeAddressRequest,
      options?: ServEaseRequestOptions,
    ): Promise<GeoAddressResult>;
    reverseGeocode(
      input: GeoReverseGeocodeRequest,
      options?: ServEaseRequestOptions,
    ): Promise<GeoAddressResult>;
    directions(
      input: GeoDirectionsRequest,
      options?: ServEaseRequestOptions,
    ): Promise<GeoDirectionsRoute>;
  };
  referrals: {
    getSummary(options?: ServEaseRequestOptions): Promise<ReferralSummary>;
  };
  uploads: {
    create(
      input: CreateUploadRequest,
      options?: ServEaseRequestOptions,
    ): Promise<UploadSummary>;
  };
}

export function createServEaseClient(
  options: CreateServEaseClientOptions,
): ServEaseClient {
  const fetcher = options.fetch ?? globalThis.fetch?.bind(globalThis);

  if (!fetcher) {
    throw new Error('A fetch implementation is required.');
  }

  const request = <T>(
    path: string,
    requestOptions: InternalRequestOptions = {},
  ): Promise<T> =>
    requestData<T>({
      baseUrl: options.baseUrl,
      defaultAccessToken: options.accessToken,
      fetcher,
      path,
      ...requestOptions,
    });

  return {
    catalog: {
      listCategories: (requestOptions) =>
        request<CatalogCategory[]>('/v1/catalog/categories', {
          auth: requestOptions,
        }),
      listServices: (params, requestOptions) =>
        request<CatalogService[]>('/v1/catalog/services', {
          query: params,
          auth: requestOptions,
        }),
      listProviders: (params, requestOptions) =>
        request<CatalogProvider[]>('/v1/catalog/providers', {
          query: params,
          auth: requestOptions,
        }),
    },
    bookings: {
      create: (input, requestOptions) =>
        request<CreateBookingResult>('/v1/bookings', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      list: (params, requestOptions) =>
        request<BookingSummary[]>('/v1/bookings', {
          query: params,
          auth: requestOptions,
        }),
      get: (bookingId, requestOptions) =>
        request<BookingSummary>(`/v1/bookings/${encodeURIComponent(bookingId)}`, {
          auth: requestOptions,
        }),
      updateStatus: (bookingId, input, requestOptions) =>
        request<BookingSummary>(
          `/v1/bookings/${encodeURIComponent(bookingId)}/status`,
          {
            method: 'PATCH',
            body: input,
            auth: requestOptions,
          },
        ),
    },
    availability: {
      getProviderAvailability: (providerId, requestOptions) =>
        request<ProviderAvailabilitySchedule>(
          providerId
            ? `/v1/provider/availability/${encodeURIComponent(providerId)}`
            : '/v1/provider/availability',
          { auth: requestOptions },
        ),
      replaceWindows: (input, requestOptions) =>
        request<ProviderAvailabilitySchedule>('/v1/provider/availability/windows', {
          method: 'PUT',
          body: input,
          auth: requestOptions,
        }),
      addDayOff: (input, requestOptions) =>
        request<ProviderAvailabilitySchedule>('/v1/provider/availability/days-off', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      removeDayOff: (offDate, requestOptions) =>
        request<ProviderAvailabilitySchedule>(
          `/v1/provider/availability/days-off/${encodeURIComponent(offDate)}`,
          {
            method: 'DELETE',
            auth: requestOptions,
          },
        ),
    },
    pricing: {
      createQuote: (input, requestOptions) =>
        request<PricingQuoteSummary>('/v1/pricing/quotes', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      getProviderGuidance: (input, requestOptions) =>
        request<ProviderPricingGuidanceSummary>('/v1/provider/pricing/guidance', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
    },
    providerApplications: {
      getMine: (requestOptions) =>
        request<ProviderApplicationStatus>('/v1/auth/provider-application/me', {
          auth: requestOptions,
        }),
    },
    payments: {
      list: (requestOptions) =>
        request<PaymentSummary[]>('/v1/payments', { auth: requestOptions }),
      create: (input, requestOptions) =>
        request<PaymentSummary>('/v1/payments', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      createCheckoutSession: (input, requestOptions) =>
        request<PaymentCheckoutSessionSummary>('/v1/payments/checkout-sessions', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      getCheckoutStatus: (checkoutId, requestOptions) =>
        request<PaymentCheckoutSessionSummary>(
          `/v1/payments/checkout-sessions/${encodeURIComponent(checkoutId)}/status`,
          { auth: requestOptions },
        ),
      validatePromotion: (input, requestOptions) =>
        request<PromotionValidationSummary>('/v1/payments/promotions/validate', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      listCustomerMethods: (requestOptions) =>
        request<CustomerPaymentMethodSummary[]>('/v1/payments/methods', {
          auth: requestOptions,
        }),
      upsertCustomerMethod: (input, requestOptions) =>
        request<CustomerPaymentMethodSummary>('/v1/payments/methods', {
          method: 'PUT',
          body: input,
          auth: requestOptions,
        }),
      deleteCustomerMethod: (methodId, requestOptions) =>
        request<CustomerPaymentMethodSummary>(
          `/v1/payments/methods/${encodeURIComponent(methodId)}`,
          { method: 'DELETE', auth: requestOptions },
        ),
      getPayoutAccount: (requestOptions) =>
        request<PayoutAccountSummary>('/v1/payments/payout-account', {
          auth: requestOptions,
        }),
      listPayoutMethods: (requestOptions) =>
        request<PayoutMethodSummary[]>('/v1/payments/payout-methods', {
          auth: requestOptions,
        }),
      upsertPayoutMethod: (input, requestOptions) =>
        request<PayoutMethodSummary>('/v1/payments/payout-methods', {
          method: 'PUT',
          body: input,
          auth: requestOptions,
        }),
      listPayouts: (requestOptions) =>
        request<PayoutSummary[]>('/v1/payments/payouts', { auth: requestOptions }),
      requestPayout: (input, requestOptions) =>
        request<PayoutSummary>('/v1/payments/payouts', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
    },
    messaging: {
      list: (requestOptions) =>
        request<ConversationSummary[]>('/v1/conversations', {
          auth: requestOptions,
        }),
      open: (input, requestOptions) =>
        request<ConversationSummary>('/v1/conversations', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      listMessages: (conversationId, requestOptions) =>
        request<ConversationMessage[]>(
          `/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
          { auth: requestOptions },
        ),
      sendMessage: (conversationId, input, requestOptions) =>
        request<ConversationMessage>(
          `/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
          {
            method: 'POST',
            body: input,
            auth: requestOptions,
          },
        ),
    },
    reviews: {
      listProviderReviews: (providerId, requestOptions) =>
        request<ReviewSummary[]>('/v1/reviews', {
          query: { providerId },
          auth: requestOptions,
        }),
      create: (input, requestOptions) =>
        request<ReviewSummary>('/v1/reviews', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      reply: (reviewId, input, requestOptions) =>
        request<ReviewResponseSummary>(
          `/v1/reviews/${encodeURIComponent(reviewId)}/reply`,
          { method: 'POST', body: input, auth: requestOptions },
        ),
      flag: (reviewId, input = {}, requestOptions) =>
        request<ReviewSummary>(`/v1/reviews/${encodeURIComponent(reviewId)}/flag`, {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
    },
    support: {
      listTickets: (requestOptions) =>
        request<SupportTicketSummary[]>('/v1/support/tickets', {
          auth: requestOptions,
        }),
      createTicket: (input, requestOptions) =>
        request<SupportTicketSummary>('/v1/support/tickets', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      getTicket: (ticketId, requestOptions) =>
        request<SupportTicketSummary>(
          `/v1/support/tickets/${encodeURIComponent(ticketId)}`,
          { auth: requestOptions },
        ),
      listReplies: (ticketId, requestOptions) =>
        request<SupportTicketReplySummary[]>(
          `/v1/support/tickets/${encodeURIComponent(ticketId)}/replies`,
          { auth: requestOptions },
        ),
      reply: (ticketId, input, requestOptions) =>
        request<SupportTicketReplySummary>(
          `/v1/support/tickets/${encodeURIComponent(ticketId)}/replies`,
          { method: 'POST', body: input, auth: requestOptions },
        ),
    },
    notifications: {
      list: (requestOptions) =>
        request<NotificationSummary[]>('/v1/notifications', {
          auth: requestOptions,
        }),
      markRead: (notificationId, requestOptions) =>
        request<NotificationSummary>(
          `/v1/notifications/${encodeURIComponent(notificationId)}/read`,
          { method: 'PATCH', auth: requestOptions },
        ),
      registerDevice: (input, requestOptions) =>
        request<PushDeviceSummary>('/v1/notifications/devices', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      unregisterDevice: (token, requestOptions) =>
        request<{ ok: boolean }>(
          `/v1/notifications/devices/${encodeURIComponent(token)}`,
          { method: 'DELETE', auth: requestOptions },
        ),
    },
    profile: {
      getCurrent: (requestOptions) =>
        request<CurrentUserProfile>('/v1/me', { auth: requestOptions }),
      update: (input, requestOptions) =>
        request<CurrentUserProfile>('/v1/me', {
          method: 'PATCH',
          body: input,
          auth: requestOptions,
        }),
      getPreferences: (requestOptions) =>
        request<UserPreferenceSummary>('/v1/me/preferences', {
          auth: requestOptions,
        }),
      updatePreferences: (input, requestOptions) =>
        request<UserPreferenceSummary>('/v1/me/preferences', {
          method: 'PUT',
          body: input,
          auth: requestOptions,
        }),
    },
    geo: {
      geocode: (input, requestOptions) =>
        request<GeoAddressResult>('/v1/geo/geocode', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      reverseGeocode: (input, requestOptions) =>
        request<GeoAddressResult>('/v1/geo/reverse-geocode', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
      directions: (input, requestOptions) =>
        request<GeoDirectionsRoute>('/v1/geo/directions', {
          method: 'POST',
          body: input,
          auth: requestOptions,
        }),
    },
    referrals: {
      getSummary: (requestOptions) =>
        request<ReferralSummary>('/v1/referrals', { auth: requestOptions }),
    },
    uploads: {
      create: (input, requestOptions) => {
        const formData = new FormData();
        formData.set('kind', input.kind);
        formData.set('file', input.file, input.fileName);
        if (input.documentType) {
          formData.set('documentType', input.documentType);
        }
        return request<UploadSummary>('/v1/uploads', {
          method: 'POST',
          formData,
          auth: requestOptions,
        });
      },
    },
  };
}

interface InternalRequestOptions {
  method?: string;
  query?: object | undefined;
  body?: unknown;
  formData?: FormData | undefined;
  auth?: ServEaseRequestOptions | undefined;
}

interface RequestDataOptions extends InternalRequestOptions {
  baseUrl: string;
  defaultAccessToken: string | undefined;
  fetcher: FetchLike;
  path: string;
}

async function requestData<T>(options: RequestDataOptions): Promise<T> {
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers: buildHeaders(options),
  };

  if (options.formData) {
    init.body = options.formData;
  } else if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  const response = await options.fetcher(buildUrl(options.baseUrl, options.path, options.query), init);

  const payload = await parseJson(response);

  if (!response.ok) {
    const error = parseErrorEnvelope(payload);
    throw new ServEaseApiError({
      status: response.status,
      code: error.code,
      message: error.message,
      details: error.details,
      response,
    });
  }

  return (payload as ServEaseDataEnvelope<T>).data;
}

function buildUrl(baseUrl: string, path: string, query?: object): string {
  const url = new URL(path, normalizeBaseUrl(baseUrl));

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function buildHeaders(options: RequestDataOptions): Headers {
  const headers = new Headers();
  const token = options.auth?.accessToken ?? options.defaultAccessToken;

  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }

  if (options.auth?.idempotencyKey) {
    headers.set('idempotency-key', options.auth.idempotencyKey);
  }

  if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
  }

  return headers;
}

async function parseJson(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return { data: undefined };
  }

  const text = await response.text();
  return text ? JSON.parse(text) : { data: undefined };
}

function parseErrorEnvelope(payload: unknown): ServEaseErrorEnvelope['error'] {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'object' &&
    payload.error !== null
  ) {
    const error = payload.error as ServEaseErrorEnvelope['error'];
    return {
      code: error.code ?? 'servease_request_failed',
      message: error.message ?? 'ServEase request failed.',
      details: error.details,
    };
  }

  return {
    code: 'servease_request_failed',
    message: 'ServEase request failed.',
  };
}
