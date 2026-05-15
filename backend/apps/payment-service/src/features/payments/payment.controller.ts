import { Body, Controller, Get, HttpException, Post, Query } from '@nestjs/common';
import {
  InvalidPaymentRequestError,
  PaymentNotFoundError,
} from './payment.errors';
import { PaymentService } from './payment.service';
import { PaymentSummary } from './payment.types';

@Controller('internal/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
