import { Injectable } from '@nestjs/common';
import { ReviewServiceClient } from './clients/review-service.client';
import { CreateReviewRequest, ReviewResponseSummary, ReviewSummary } from './review.types';

@Injectable()
export class ReviewGatewayService {
  constructor(private readonly reviewServiceClient: ReviewServiceClient) {}

  createReview(input: CreateReviewRequest): Promise<ReviewSummary> {
    return this.reviewServiceClient.createReview(input);
  }

  listProviderReviews(providerId: string): Promise<ReviewSummary[]> {
    return this.reviewServiceClient.listProviderReviews(providerId);
  }

  createReviewResponse(
    reviewId: string,
    providerId: string,
    responseText: string,
  ): Promise<ReviewResponseSummary> {
    return this.reviewServiceClient.createReviewResponse(reviewId, providerId, responseText);
  }

  flagReview(reviewId: string, reporterId: string, reason: string): Promise<ReviewSummary> {
    return this.reviewServiceClient.flagReview(reviewId, reporterId, reason);
  }
}
