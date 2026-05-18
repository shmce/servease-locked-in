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
  };
}

interface InternalRequestOptions {
  method?: string;
  query?: object | undefined;
  body?: unknown;
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

  if (options.body !== undefined) {
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
