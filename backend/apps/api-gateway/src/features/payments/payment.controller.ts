import { Body, Controller, Get, Headers, HttpException, Post } from '@nestjs/common';
import {
  BookingDependencyUnavailableError,
  BookingNotFoundError,
} from '../booking/booking.errors';
import { BookingGatewayService } from '../booking/booking.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  InvalidPaymentRequestError,
  PaymentDependencyUnavailableError,
  PaymentNotFoundError,
} from './payment.errors';
import { PaymentGatewayService } from './payment.service';
import { PaymentSummary, PaymentVisibility } from './payment.types';

@Controller('v1/payments')
export class PaymentController {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly bookingGatewayService: BookingGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly catalogServiceClient: CatalogServiceClient,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: PaymentSummary[] }> {
    try {
      const participant = await this.resolveParticipant(authorization);
      return {
        data: await this.paymentGatewayService.listPayments(participant.visibility),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { bookingId?: string; paymentMethod?: string },
  ): Promise<{ data: PaymentSummary }> {
    try {
      if (!body.bookingId || !body.paymentMethod?.trim()) {
        throw new InvalidPaymentRequestError();
      }

      const participant = await this.resolveParticipant(authorization);
      const booking = await this.bookingGatewayService.findBooking(
        body.bookingId,
        participant.userId,
        participant.visibility.providerId,
      );

      if (!Number.isFinite(booking.totalAmount) || booking.totalAmount <= 0) {
        throw new InvalidPaymentRequestError();
      }

      return {
        data: await this.paymentGatewayService.createPayment({
          bookingId: booking.id,
          customerId: booking.customerId,
          providerId: booking.providerId,
          amount: booking.totalAmount,
          paymentMethod: body.paymentMethod,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async resolveParticipant(
    authorization: string | undefined,
  ): Promise<{
    userId: string;
    visibility: PaymentVisibility;
  }> {
    const userId = await this.authTokenService.authenticate(authorization);
    const providerProfile =
      await this.catalogServiceClient.findProviderProfileByUserId(userId);

    return {
      userId,
      visibility: {
        customerId: userId,
        providerId: providerProfile?.id ?? null,
      },
    };
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof InvalidPaymentRequestError) {
      return this.error('invalid_payment_request', 'Payment request is invalid.', 400);
    }

    if (error instanceof BookingNotFoundError) {
      return this.error('booking_not_found', 'Booking was not found.', 404);
    }

    if (error instanceof PaymentNotFoundError) {
      return this.error('payment_not_found', 'Payment was not found.', 404);
    }

    if (
      error instanceof PaymentDependencyUnavailableError ||
      error instanceof BookingDependencyUnavailableError
    ) {
      return this.error(
        'payment_dependency_unavailable',
        'Payment service is unavailable.',
        503,
      );
    }

    return this.error('payment_dependency_unavailable', 'Payment failed.', 503);
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
