export interface ReviewSummary {
  id: string;
  bookingId: string;
  providerId: string;
  reviewerId: string;
  rating: number;
  reviewText: string | null;
  isFlagged: boolean;
  createdAt: string | null;
}

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  reviewText?: string | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function createReview(
  accessToken: string,
  input: CreateReviewInput,
): Promise<ReviewSummary> {
  return fetchReviewApi<ReviewSummary>('/api/reviews', {
    accessToken,
    method: 'POST',
    body: input,
  });
}

async function fetchReviewApi<T>(
  path: string,
  options: {
    accessToken: string;
    method: 'POST';
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(path, {
    method: options.method,
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach reviews. Please try again.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Review request failed.');
  }

  return payload.data;
}
