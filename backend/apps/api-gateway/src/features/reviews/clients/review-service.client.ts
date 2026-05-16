import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReviewDependencyUnavailableError } from '../review.errors';
import { CreateReviewRequest, ReviewResponseSummary, ReviewSummary } from '../review.types';

@Injectable()
export class ReviewServiceClient {
  constructor(private readonly configService: ConfigService) {}

  createReview(input: CreateReviewRequest): Promise<ReviewSummary> {
    return this.request<ReviewSummary>('/internal/reviews', 'POST', input);
  }

  listProviderReviews(providerId: string): Promise<ReviewSummary[]> {
    return this.request<ReviewSummary[]>(
      `/internal/reviews?providerId=${encodeURIComponent(providerId)}`,
      'GET',
    );
  }

  createReviewResponse(
    reviewId: string,
    providerId: string,
    responseText: string,
  ): Promise<ReviewResponseSummary> {
    return this.request<ReviewResponseSummary>(
      `/internal/reviews/${encodeURIComponent(reviewId)}/reply`,
      'POST',
      { providerId, responseText },
    );
  }

  flagReview(
    reviewId: string,
    reporterId: string,
    reason: string,
  ): Promise<ReviewSummary> {
    return this.request<ReviewSummary>(
      `/internal/reviews/${encodeURIComponent(reviewId)}/flag`,
      'POST',
      { reporterId, reason },
    );
  }

  listForAdmin(filters: {
    providerId?: string | null;
    flaggedOnly?: boolean;
    limit?: number;
  }): Promise<ReviewSummary[]> {
    const params = new URLSearchParams();
    if (filters.providerId) params.set('providerId', filters.providerId);
    if (filters.flaggedOnly) params.set('flagged', 'true');
    if (filters.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return this.request<ReviewSummary[]>(
      `/internal/reviews/admin${qs ? `?${qs}` : ''}`,
      'GET',
    );
  }

  setReviewFlagged(
    reviewId: string,
    body: { isFlagged: boolean; reason?: string | null; adminId?: string | null },
  ): Promise<ReviewSummary> {
    return this.request<ReviewSummary>(
      `/internal/reviews/${encodeURIComponent(reviewId)}/flagged`,
      'PATCH',
      body,
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'REVIEW_SERVICE_URL',
      'http://localhost:8508',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new ReviewDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
