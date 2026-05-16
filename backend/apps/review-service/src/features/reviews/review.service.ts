import { Injectable } from '@nestjs/common';
import { InvalidReviewRequestError } from './review.errors';
import {
  CreateReviewInput,
  CreateReviewResponseInput,
  FlagReviewInput,
  ListAdminReviewsFilters,
  ReviewResponseSummary,
  ReviewSummary,
  SetReviewFlaggedInput,
} from './review.types';
import { SupabaseReviewRepository } from './supabase-review.repository';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: SupabaseReviewRepository) {}

  async createReviewResponse(
    input: CreateReviewResponseInput,
  ): Promise<ReviewResponseSummary> {
    if (!input.reviewId || !input.providerId || !input.responseText?.trim()) {
      throw new InvalidReviewRequestError();
    }

    return this.reviewRepository.createReviewResponse({
      ...input,
      responseText: input.responseText.trim(),
    });
  }

  async flagReview(input: FlagReviewInput): Promise<ReviewSummary> {
    if (!input.reviewId || !input.reporterId) {
      throw new InvalidReviewRequestError();
    }

    return this.reviewRepository.flagReview({
      ...input,
      reason: input.reason?.trim() || 'Reported by user',
    });
  }

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

  async listForAdmin(filters: ListAdminReviewsFilters): Promise<ReviewSummary[]> {
    return this.reviewRepository.listForAdmin({
      providerId: filters.providerId?.trim() || null,
      flaggedOnly: filters.flaggedOnly ?? false,
      limit: filters.limit,
    });
  }

  async setFlaggedStatus(input: SetReviewFlaggedInput): Promise<ReviewSummary> {
    if (!input.reviewId) {
      throw new InvalidReviewRequestError();
    }

    return this.reviewRepository.setFlagged({
      reviewId: input.reviewId,
      isFlagged: input.isFlagged,
      reason: input.reason?.trim() || null,
      adminId: input.adminId?.trim() || null,
    });
  }
}
