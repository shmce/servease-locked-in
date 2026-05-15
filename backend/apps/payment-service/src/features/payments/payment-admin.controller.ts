import { Body, Controller, Get, HttpException, Param, Patch, Query } from '@nestjs/common';
import { InvalidPaymentRequestError, PaymentNotFoundError } from './payment.errors';
import { PaymentAdminService } from './payment-admin.service';
import { PaymentSummary } from './payment.types';

@Controller('internal/admin/payments')
export class PaymentAdminController {
  constructor(private readonly paymentAdminService: PaymentAdminService) {}

  @Get()
  async list(@Query('status') status?: string): Promise<{ data: PaymentSummary[] }> {
    try {
      return {
        data: await this.paymentAdminService.listPayments(status ?? null),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':paymentId/status')
  async updateStatus(
    @Param('paymentId') paymentId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.paymentAdminService.updatePaymentStatus(
          paymentId,
          body.status ?? '',
        ),
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
