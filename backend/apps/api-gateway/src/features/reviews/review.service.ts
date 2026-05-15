import { Injectable } from '@nestjs/common';
import { ReviewServiceClient } from './clients/review-service.client';
import { CreateReviewRequest, ReviewSummary } from './review.types';

@Injectable()
export class ReviewGatewayService {
  constructor(private readonly reviewServiceClient: ReviewServiceClient) {}

  createReview(input: CreateReviewRequest): Promise<ReviewSummary> {
    return this.reviewServiceClient.createReview(input);
  }

  listProviderReviews(providerId: string): Promise<ReviewSummary[]> {
    return this.reviewServiceClient.listProviderReviews(providerId);
  }
}
