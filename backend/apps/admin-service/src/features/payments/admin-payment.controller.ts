import { Body, Controller, Get, HttpException, Param, Patch, Query } from '@nestjs/common';
import { AdminPaymentService } from './admin-payment.service';
import { PaymentSummary } from './admin-payment.types';

@Controller('internal/admin/payments')
export class AdminPaymentController {
  constructor(private readonly adminPaymentService: AdminPaymentService) {}

  @Get()
  async list(@Query('status') status?: string): Promise<{ data: PaymentSummary[] }> {
    try {
      return {
        data: await this.adminPaymentService.listPayments(status ?? null),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payment workflow failed.',
        503,
      );
    }
  }

  @Patch(':paymentId/status')
  async updateStatus(
    @Param('paymentId') paymentId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.adminPaymentService.updatePaymentStatus(
          paymentId,
          body.status ?? '',
        ),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payment workflow failed.',
        503,
      );
    }
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
