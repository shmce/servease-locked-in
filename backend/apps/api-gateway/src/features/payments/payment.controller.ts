import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
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
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { PaymentGatewayService } from './payment.service';
import {
  PaymentSummary,
  PaymentVisibility,
  PromotionValidationSummary,
  PayoutAccountSummary,
  CustomerPaymentMethodSummary,
  PayoutMethodSummary,
  PayoutSummary,
  UpsertCustomerPaymentMethodRequest,
  UpsertPayoutMethodRequest,
} from './payment.types';

@Controller('v1/payments')
export class PaymentController {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly bookingGatewayService: BookingGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly catalogServiceClient: CatalogServiceClient,
    private readonly notificationServiceClient?: NotificationServiceClient,
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
    @Body()
    body: { bookingId?: string; paymentMethod?: string; promoCode?: string | null },
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

      this.assertPaymentActorIsCustomer(participant.userId, booking.customerId);

      if (!Number.isFinite(booking.totalAmount) || booking.totalAmount <= 0) {
        throw new InvalidPaymentRequestError();
      }

      const promoCode = body.promoCode?.trim();
      let amount = booking.totalAmount;

      if (promoCode) {
        const promotion = await this.paymentGatewayService.validatePromotion(
          promoCode,
          booking.totalAmount,
        );

        if (!promotion.valid || promotion.finalAmount <= 0) {
          throw new InvalidPaymentRequestError();
        }

        amount = promotion.finalAmount;
      }

      const payment = await this.paymentGatewayService.createPayment({
        bookingId: booking.id,
        customerId: booking.customerId,
        providerId: booking.providerId,
        amount,
        paymentMethod: body.paymentMethod,
      });

      await this.notifyProviderPaymentCreated(payment, booking.serviceTitle);

      return {
        data: payment,
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('promotions/validate')
  async validatePromotion(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { bookingId?: string; code?: string },
  ): Promise<{ data: PromotionValidationSummary }> {
    try {
      if (!body.bookingId || !body.code?.trim()) {
        throw new InvalidPaymentRequestError();
      }

      const participant = await this.resolveParticipant(authorization);
      const booking = await this.bookingGatewayService.findBooking(
        body.bookingId,
        participant.userId,
        participant.visibility.providerId,
      );

      this.assertPaymentActorIsCustomer(participant.userId, booking.customerId);

      if (!Number.isFinite(booking.totalAmount) || booking.totalAmount <= 0) {
        throw new InvalidPaymentRequestError();
      }

      return {
        data: await this.paymentGatewayService.validatePromotion(
          body.code,
          booking.totalAmount,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('payout-account')
  async payoutAccount(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: PayoutAccountSummary }> {
    try {
      const participant = await this.resolveRequiredProviderParticipant(authorization);
      return {
        data: await this.paymentGatewayService.getPayoutAccount(
          participant.providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('payout-methods')
  async payoutMethods(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: PayoutMethodSummary[] }> {
    try {
      const participant = await this.resolveRequiredProviderParticipant(authorization);
      return {
        data: await this.paymentGatewayService.listPayoutMethods(
          participant.providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('payout-methods')
  async upsertPayoutMethod(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpsertPayoutMethodRequest,
  ): Promise<{ data: PayoutMethodSummary }> {
    try {
      if (!body.accountLabel?.trim() || !body.methodType) {
        throw new InvalidPaymentRequestError();
      }
      const participant = await this.resolveRequiredProviderParticipant(authorization);
      return {
        data: await this.paymentGatewayService.upsertPayoutMethod(
          participant.providerId,
          body,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('methods')
  async customerPaymentMethods(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: CustomerPaymentMethodSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.paymentGatewayService.listCustomerPaymentMethods(userId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('methods')
  async upsertCustomerPaymentMethod(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpsertCustomerPaymentMethodRequest,
  ): Promise<{ data: CustomerPaymentMethodSummary }> {
    try {
      if (!body.label?.trim() || !body.methodType) {
        throw new InvalidPaymentRequestError();
      }
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.paymentGatewayService.upsertCustomerPaymentMethod(
          userId,
          body,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('methods/:methodId')
  async deleteCustomerPaymentMethod(
    @Headers('authorization') authorization: string | undefined,
    @Param('methodId') methodId: string,
  ): Promise<{ data: CustomerPaymentMethodSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.paymentGatewayService.deleteCustomerPaymentMethod(
          userId,
          methodId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('payouts')
  async payouts(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: PayoutSummary[] }> {
    try {
      const participant = await this.resolveRequiredProviderParticipant(authorization);
      return {
        data: await this.paymentGatewayService.listPayouts(participant.providerId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('payouts')
  async requestPayout(
    @Headers('authorization') authorization: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: { amount?: number; payoutMethodId?: string },
  ): Promise<{ data: PayoutSummary }> {
    try {
      if (
        !body.payoutMethodId?.trim() ||
        !Number.isFinite(Number(body.amount)) ||
        Number(body.amount) <= 0
      ) {
        throw new InvalidPaymentRequestError();
      }
      const participant = await this.resolveRequiredProviderParticipant(authorization);
      return {
        data: await this.paymentGatewayService.createPayoutRequest(
          participant.userId,
          participant.providerId,
          {
            amount: Number(body.amount),
            payoutMethodId: body.payoutMethodId,
          },
          idempotencyKey ?? null,
        ),
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

  private async resolveRequiredProviderParticipant(
    authorization: string | undefined,
  ): Promise<{
    userId: string;
    providerId: string;
  }> {
    const participant = await this.resolveParticipant(authorization);
    if (!participant.visibility.providerId) {
      throw new InvalidPaymentRequestError();
    }

    return {
      userId: participant.userId,
      providerId: participant.visibility.providerId,
    };
  }

  private assertPaymentActorIsCustomer(
    userId: string,
    customerId: string | null | undefined,
  ): void {
    if (userId !== customerId) {
      throw new InvalidPaymentRequestError();
    }
  }

  private async notifyProviderPaymentCreated(
    payment: PaymentSummary,
    serviceTitle?: string | null,
  ): Promise<void> {
    if (!this.notificationServiceClient || !payment.providerId) {
      return;
    }

    const providerOwner =
      await this.catalogServiceClient.findProviderOwnerByProviderId(
        payment.providerId,
      );

    await this.notificationServiceClient.createNotification({
      userId: providerOwner.userId,
      type: 'payment_reserved',
      title: 'Payment reserved',
      body: `A customer reserved payment for ${
        serviceTitle ?? 'a service booking'
      }.`,
      metadata: {
        bookingId: payment.bookingId,
        paymentId: payment.id,
        status: payment.status,
      },
    });
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
