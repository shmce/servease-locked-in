import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InvalidReviewRequestError, ReviewNotFoundError } from './review.errors';
import { ReviewService } from './review.service';
import { ReviewResponseSummary, ReviewSummary } from './review.types';

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

  @Get('admin')
  async listForAdmin(
    @Query('providerId') providerId?: string,
    @Query('flagged') flagged?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: ReviewSummary[] }> {
    try {
      const parsedLimit = limit ? Math.min(Math.max(Number(limit), 1), 500) : undefined;
      return {
        data: await this.reviewService.listForAdmin({
          providerId: providerId ?? null,
          flaggedOnly: flagged === 'true',
          limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':reviewId/reply')
  async reply(
    @Param('reviewId') reviewId: string,
    @Body() body: { providerId?: string; responseText?: string },
  ): Promise<{ data: ReviewResponseSummary }> {
    try {
      return {
        data: await this.reviewService.createReviewResponse({
          reviewId,
          providerId: body.providerId ?? '',
          responseText: body.responseText ?? '',
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':reviewId/flagged')
  async setFlagged(
    @Param('reviewId') reviewId: string,
    @Body() body: { isFlagged?: boolean; reason?: string; adminId?: string },
  ): Promise<{ data: ReviewSummary }> {
    try {
      return {
        data: await this.reviewService.setFlaggedStatus({
          reviewId,
          isFlagged: body.isFlagged ?? false,
          reason: body.reason ?? null,
          adminId: body.adminId ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':reviewId/flag')
  async flag(
    @Param('reviewId') reviewId: string,
    @Body() body: { reporterId?: string; reason?: string },
  ): Promise<{ data: ReviewSummary }> {
    try {
      return {
        data: await this.reviewService.flagReview({
          reviewId,
          reporterId: body.reporterId ?? '',
          reason: body.reason ?? '',
        }),
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
