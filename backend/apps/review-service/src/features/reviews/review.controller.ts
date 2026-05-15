import { Body, Controller, Get, HttpException, Post, Query } from '@nestjs/common';
import { InvalidReviewRequestError, ReviewNotFoundError } from './review.errors';
import { ReviewService } from './review.service';
import { ReviewSummary } from './review.types';

@Controller('internal/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async list(@Query('providerId') providerId?: string): Promise<{ data: ReviewSummary[] }> {
    try {
      return {
        data: await this.reviewService.listProviderReviews(providerId ?? ''),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      bookingId: string;
      providerId: string;
      reviewerId: string;
      rating: number;
      reviewText?: string | null;
    },
  ): Promise<{ data: ReviewSummary }> {
    try {
      return {
        data: await this.reviewService.createReview(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidReviewRequestError) {
      return this.error('invalid_review_request', 'Review request is invalid.', 400);
    }

    if (error instanceof ReviewNotFoundError) {
      return this.error('review_not_found', 'Review was not found.', 404);
    }

    return this.error('review_dependency_unavailable', 'Review service failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      {
        error: {
          code,
          message,
          details: {},
        },
      },
      status,
    );
  }
}
