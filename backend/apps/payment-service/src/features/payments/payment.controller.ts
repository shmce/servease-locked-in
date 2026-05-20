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
  Query,
} from '@nestjs/common';
import {
  InvalidPaymentRequestError,
  PaymentNotFoundError,
} from './payment.errors';
import { PaymentService } from './payment.service';
import { SharedPaymentService } from './shared-payment.service';
import {
  CreateCheckoutSessionInput,
  ApicenterCheckoutWebhookInput,
  CreatePaymentCustomerInput,
  CreatePaymentPriceInput,
  CreatePaymentProductInput,
  CreatePaymentRefundInput,
  CreatePaymentSubscriptionInput,
  PaymentCheckoutSessionSummary,
  PaymentCustomerSummary,
  PaymentInvoiceSummary,
  PaymentPriceSummary,
  PaymentProductSummary,
  PaymentRefundSummary,
  PaymentSummary,
  PaymentSubscriptionSummary,
  PromotionValidationSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutSummary,
  CustomerPaymentMethodSummary,
} from './payment.types';

@Controller('internal/payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly sharedPaymentService: SharedPaymentService,
  ) {}

  @Get()
  async list(
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: PaymentSummary[] }> {
    try {
      return {
        data: await this.paymentService.listPayments({
          customerId: customerId ?? null,
          providerId: providerId ?? null,
        }),
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
      customerId: string;
      providerId: string;
      amount: number;
      paymentMethod: string;
    },
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.paymentService.createPayment(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('bookings/:bookingId/cash-on-service/confirm')
  async confirmCashOnServicePayment(
    @Param('bookingId') bookingId: string,
    @Body() body: { providerId?: string | null },
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.paymentService.confirmCashOnServicePayment({
          bookingId,
          providerId: body.providerId ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('promotions/validate')
  async validatePromotion(
    @Body()
    body: {
      code?: string;
      amount?: number;
    },
  ): Promise<{ data: PromotionValidationSummary }> {
    try {
      return {
        data: await this.paymentService.validatePromotion(
          body.code ?? '',
          Number(body.amount ?? 0),
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('checkout-sessions')
  async createCheckoutSession(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: CreateCheckoutSessionInput,
  ): Promise<{ data: PaymentCheckoutSessionSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.createCheckoutSession({
          ...body,
          idempotencyKey: idempotencyKey ?? body.idempotencyKey ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('checkout-sessions/webhook')
  async checkoutWebhook(
    @Body() body: ApicenterCheckoutWebhookInput,
  ): Promise<{ data: PaymentCheckoutSessionSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.syncCheckoutWebhook(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('checkout-sessions/:checkoutId/status')
  async checkoutStatus(
    @Param('checkoutId') checkoutId: string,
  ): Promise<{ data: PaymentCheckoutSessionSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.getCheckoutStatus(checkoutId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('shared-refunds')
  async createSharedRefund(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: CreatePaymentRefundInput,
  ): Promise<{ data: PaymentRefundSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.createRefund({
          ...body,
          idempotencyKey: idempotencyKey ?? body.idempotencyKey ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('shared-customers')
  async createSharedCustomer(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: CreatePaymentCustomerInput,
  ): Promise<{ data: PaymentCustomerSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.createCustomer({
          ...body,
          idempotencyKey: idempotencyKey ?? body.idempotencyKey ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('shared-products')
  async createSharedProduct(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: CreatePaymentProductInput,
  ): Promise<{ data: PaymentProductSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.createProduct({
          ...body,
          idempotencyKey: idempotencyKey ?? body.idempotencyKey ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('shared-prices')
  async createSharedPrice(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: CreatePaymentPriceInput,
  ): Promise<{ data: PaymentPriceSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.createPrice({
          ...body,
          idempotencyKey: idempotencyKey ?? body.idempotencyKey ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('shared-subscriptions')
  async createSharedSubscription(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: CreatePaymentSubscriptionInput,
  ): Promise<{ data: PaymentSubscriptionSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.createSubscription({
          ...body,
          idempotencyKey: idempotencyKey ?? body.idempotencyKey ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('shared-subscriptions/:subscriptionId')
  async sharedSubscription(
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<{ data: PaymentSubscriptionSummary }> {
    try {
      return {
        data: await this.sharedPaymentService.getSubscription(subscriptionId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('shared-subscriptions/:subscriptionId/invoices')
  async sharedSubscriptionInvoices(
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<{ data: PaymentInvoiceSummary[] }> {
    try {
      return {
        data: await this.sharedPaymentService.listSubscriptionInvoices(subscriptionId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('payout-account')
  async payoutAccount(
    @Query('providerId') providerId?: string,
  ): Promise<{ data: PayoutAccountSummary }> {
    try {
      return {
        data: await this.paymentService.getPayoutAccount(providerId ?? ''),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('payout-methods')
  async payoutMethods(
    @Query('providerId') providerId?: string,
  ): Promise<{ data: PayoutMethodSummary[] }> {
    try {
      return {
        data: await this.paymentService.listPayoutMethods(providerId ?? ''),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('payout-methods')
  async upsertPayoutMethod(
    @Body()
    body: {
      providerId?: string;
      methodId?: string | null;
      methodType?: 'bank' | 'gcash' | 'paymaya';
      accountLabel?: string;
      accountName?: string | null;
      accountNumberLast4?: string | null;
      isDefault?: boolean | null;
    },
  ): Promise<{ data: PayoutMethodSummary }> {
    try {
      return {
        data: await this.paymentService.upsertPayoutMethod({
          providerId: body.providerId ?? '',
          methodId: body.methodId ?? null,
          methodType: body.methodType ?? 'bank',
          accountLabel: body.accountLabel ?? '',
          accountName: body.accountName ?? null,
          accountNumberLast4: body.accountNumberLast4 ?? null,
          isDefault: body.isDefault ?? false,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('customer-methods')
  async customerPaymentMethods(
    @Query('customerId') customerId?: string,
  ): Promise<{ data: CustomerPaymentMethodSummary[] }> {
    try {
      return {
        data: await this.paymentService.listCustomerPaymentMethods(
          customerId ?? '',
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('customer-methods')
  async upsertCustomerPaymentMethod(
    @Body()
    body: {
      customerId?: string;
      methodId?: string | null;
      methodType?: 'cash_on_service' | 'card' | 'gcash' | 'paymaya';
      label?: string;
      brand?: string | null;
      last4?: string | null;
      isDefault?: boolean | null;
    },
  ): Promise<{ data: CustomerPaymentMethodSummary }> {
    try {
      return {
        data: await this.paymentService.upsertCustomerPaymentMethod({
          customerId: body.customerId ?? '',
          methodId: body.methodId ?? null,
          methodType: body.methodType ?? 'cash_on_service',
          label: body.label ?? '',
          brand: body.brand ?? null,
          last4: body.last4 ?? null,
          isDefault: body.isDefault ?? false,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('customer-methods/:methodId')
  async deleteCustomerPaymentMethod(
    @Param('methodId') methodId: string,
    @Query('customerId') customerId?: string,
  ): Promise<{ data: CustomerPaymentMethodSummary }> {
    try {
      return {
        data: await this.paymentService.deleteCustomerPaymentMethod(
          customerId ?? '',
          methodId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('payouts')
  async payouts(
    @Query('providerId') providerId?: string,
  ): Promise<{ data: PayoutSummary[] }> {
    try {
      return {
        data: await this.paymentService.listPayouts(providerId ?? ''),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('payouts')
  async requestPayout(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body()
    body: {
      providerId?: string;
      userId?: string;
      amount?: number;
      payoutMethodId?: string;
    },
  ): Promise<{ data: PayoutSummary }> {
    try {
      return {
        data: await this.paymentService.createPayoutRequest({
          providerId: body.providerId ?? '',
          userId: body.userId ?? '',
          amount: Number(body.amount ?? 0),
          payoutMethodId: body.payoutMethodId ?? '',
          idempotencyKey: idempotencyKey ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidPaymentRequestError) {
      return this.error('invalid_payment_request', 'Payment request is invalid.', 400);
    }

    if (error instanceof PaymentNotFoundError) {
      return this.error('payment_not_found', 'Payment was not found.', 404);
    }

    return this.error('payment_dependency_unavailable', 'Payment service failed.', 503);
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
