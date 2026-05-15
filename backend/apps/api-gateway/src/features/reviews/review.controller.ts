import { Body, Controller, Get, Headers, HttpException, Post, Query } from '@nestjs/common';
import { BookingNotFoundError } from '../booking/booking.errors';
import { BookingGatewayService } from '../booking/booking.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  InvalidReviewRequestError,
  ReviewDependencyUnavailableError,
} from './review.errors';
import { ReviewGatewayService } from './review.service';
import { ReviewSummary } from './review.types';

@Controller('v1/reviews')
export class ReviewController {
  constructor(
    private readonly reviewGatewayService: ReviewGatewayService,
    private readonly bookingGatewayService: BookingGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  async list(@Query('providerId') providerId?: string): Promise<{ data: ReviewSummary[] }> {
    try {
      if (!providerId) {
        throw new InvalidReviewRequestError();
      }
      return {
        data: await this.reviewGatewayService.listProviderReviews(providerId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { bookingId?: string; rating?: number; reviewText?: string | null },
  ): Promise<{ data: ReviewSummary }> {
    try {
      if (!body.bookingId || body.rating === undefined) {
        throw new InvalidReviewRequestError();
      }

      const userId = await this.authTokenService.authenticate(authorization);
      const booking = await this.bookingGatewayService.findBooking(
        body.bookingId,
        userId,
        null,
      );

      if (booking.customerId !== userId || booking.status !== 'completed') {
        throw new InvalidReviewRequestError();
      }

      return {
        data: await this.reviewGatewayService.createReview({
          bookingId: booking.id,
          providerId: booking.providerId,
          reviewerId: userId,
          rating: body.rating,
          reviewText: body.reviewText ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof InvalidReviewRequestError) {
      return this.error('invalid_review_request', 'Review request is invalid.', 400);
    }

    if (error instanceof BookingNotFoundError) {
      return this.error('booking_not_found', 'Booking was not found.', 404);
    }

    if (error instanceof ReviewDependencyUnavailableError) {
      return this.error(
        'review_dependency_unavailable',
        'Review service is unavailable.',
        503,
      );
    }

    return this.error('review_dependency_unavailable', 'Review failed.', 503);
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
