import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReviewDependencyUnavailableError } from '../review.errors';
import { CreateReviewRequest, ReviewSummary } from '../review.types';

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

  private async request<T>(
    path: string,
    method: 'GET' | 'POST',
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
