import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BookingNotFoundError } from '../booking/booking.errors';
import { BookingGatewayService } from '../booking/booking.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
  ProfileDependencyUnavailableError,
} from '../current-user/current-user.errors';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import {
  InvalidReviewRequestError,
  ReviewDependencyUnavailableError,
} from './review.errors';
import { ReviewGatewayService } from './review.service';
import { ReviewResponseSummary, ReviewSummary } from './review.types';

@Controller('v1/reviews')
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name);

  constructor(
    private readonly reviewGatewayService: ReviewGatewayService,
    private readonly bookingGatewayService: BookingGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly catalogServiceClient: CatalogServiceClient,
    private readonly notificationServiceClient?: NotificationServiceClient,
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

      const review = await this.reviewGatewayService.createReview({
        bookingId: booking.id,
        providerId: booking.providerId,
        reviewerId: userId,
        rating: body.rating,
        reviewText: body.reviewText ?? null,
      });

      await this.notifyProviderReviewCreated(review);

      return {
        data: review,
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':reviewId/reply')
  async reply(
    @Param('reviewId') reviewId: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { responseText?: string },
  ): Promise<{ data: ReviewResponseSummary }> {
    try {
      if (!body.responseText?.trim()) {
        throw new InvalidReviewRequestError();
      }

      const userId = await this.authTokenService.authenticate(authorization);
      const providerProfile =
        await this.catalogServiceClient.findProviderProfileByUserId(userId);

      if (!providerProfile) {
        throw new InvalidReviewRequestError();
      }

      return {
        data: await this.reviewGatewayService.createReviewResponse(
          reviewId,
          providerProfile.id,
          body.responseText.trim(),
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':reviewId/flag')
  async flag(
    @Param('reviewId') reviewId: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { reason?: string },
  ): Promise<{ data: ReviewSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);

      return {
        data: await this.reviewGatewayService.flagReview(
          reviewId,
          userId,
          body.reason?.trim() ?? '',
        ),
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

    if (
      error instanceof ReviewDependencyUnavailableError ||
      error instanceof ProfileDependencyUnavailableError
    ) {
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

  private async notifyProviderReviewCreated(
    review: ReviewSummary,
  ): Promise<void> {
    if (!this.notificationServiceClient) {
      return;
    }

    try {
      const providerOwner =
        await this.catalogServiceClient.findProviderOwnerByProviderId(
          review.providerId,
        );

      await this.notificationServiceClient.createNotification({
        userId: providerOwner.userId,
        type: 'review_created',
        title: 'New customer review',
        body: `A customer left a ${review.rating}-star review.`,
        metadata: {
          bookingId: review.bookingId,
          providerId: review.providerId,
          reviewId: review.id,
          rating: String(review.rating),
        },
      });
    } catch (error) {
      this.logger.warn(
        `Review notification dispatch failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }
}
