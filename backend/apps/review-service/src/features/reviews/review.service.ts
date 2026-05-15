import { Injectable } from '@nestjs/common';
import { InvalidReviewRequestError } from './review.errors';
import { CreateReviewInput, ReviewSummary } from './review.types';
import { SupabaseReviewRepository } from './supabase-review.repository';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: SupabaseReviewRepository) {}

  async createReview(input: CreateReviewInput): Promise<ReviewSummary> {
    if (
      !input.bookingId ||
      !input.providerId ||
      !input.reviewerId ||
      !Number.isInteger(input.rating) ||
      input.rating < 1 ||
      input.rating > 5
    ) {
      throw new InvalidReviewRequestError();
    }

    return this.reviewRepository.createReview({
      ...input,
      reviewText: input.reviewText?.trim() || null,
    });
  }

  async listProviderReviews(providerId: string): Promise<ReviewSummary[]> {
    if (!providerId) {
      throw new InvalidReviewRequestError();
    }

    return this.reviewRepository.listProviderReviews(providerId);
  }
}
