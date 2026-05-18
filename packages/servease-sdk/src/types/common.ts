export interface ServEaseDataEnvelope<T> {
  data: T;
}

export interface ServEasePageEnvelope<T> extends ServEaseDataEnvelope<T[]> {
  page: {
    cursor: string | null;
    hasMore: boolean;
  };
}

export interface ServEaseErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ServEaseRequestOptions {
  accessToken?: string;
  idempotencyKey?: string;
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;
