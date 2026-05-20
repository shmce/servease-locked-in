import { Body, Controller, Get, HttpException, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminPaymentService } from './admin-payment.service';
import { PaymentServiceRequestError } from './clients/payment-service.client';
import {
  CommissionRuleSummary,
  PaymentSummary,
  PayoutEventSummary,
  PayoutSummary,
  RecordPayoutEventRequest,
  RefundSummary,
} from './admin-payment.types';

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

  // Static prefix routes BEFORE :paymentId, otherwise the wildcard captures
  // them. See feedback-route-order.

  @Get('payouts')
  async listPayouts(
    @Query('status') status?: string,
  ): Promise<{ data: PayoutSummary[] }> {
    try {
      return {
        data: await this.adminPaymentService.listPayouts(status ?? null),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payout workflow failed.',
        503,
      );
    }
  }

  @Patch('payouts/:payoutId/status')
  async updatePayoutStatus(
    @Param('payoutId') payoutId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: PayoutSummary }> {
    try {
      return {
        data: await this.adminPaymentService.updatePayoutStatus(
          payoutId,
          body.status ?? '',
        ),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payout workflow failed.',
        503,
      );
    }
  }

  @Get('payouts/:payoutId/events')
  async listPayoutEvents(
    @Param('payoutId') payoutId: string,
  ): Promise<{ data: PayoutEventSummary[] }> {
    try {
      return {
        data: await this.adminPaymentService.listPayoutEvents(payoutId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payout workflow failed.',
        503,
      );
    }
  }

  @Post('payouts/:payoutId/events')
  async recordPayoutEvent(
    @Param('payoutId') payoutId: string,
    @Body() body: RecordPayoutEventRequest,
  ): Promise<{ data: PayoutEventSummary }> {
    try {
      return {
        data: await this.adminPaymentService.recordPayoutEvent(payoutId, body),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payout workflow failed.',
        503,
      );
    }
  }

  @Get('refunds')
  async listRefunds(
    @Query('status') status?: string,
  ): Promise<{ data: RefundSummary[] }> {
    try {
      return {
        data: await this.adminPaymentService.listRefunds(status ?? null),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin refund workflow failed.',
        503,
      );
    }
  }

  @Post('refunds/:refundId/approve')
  async approveRefund(
    @Param('refundId') refundId: string,
    @Body() body: { adminUserId?: string; reason?: string | null },
  ): Promise<{ data: RefundSummary }> {
    try {
      return {
        data: await this.adminPaymentService.approveRefund(
          refundId,
          body.adminUserId ?? '',
          body.reason ?? null,
        ),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin refund workflow failed.',
        503,
      );
    }
  }

  @Post('refunds/:refundId/reject')
  async rejectRefund(
    @Param('refundId') refundId: string,
    @Body() body: { adminUserId?: string; reason?: string | null },
  ): Promise<{ data: RefundSummary }> {
    try {
      return {
        data: await this.adminPaymentService.rejectRefund(
          refundId,
          body.adminUserId ?? '',
          body.reason ?? '',
        ),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin refund workflow failed.',
        503,
      );
    }
  }

  @Get('commission-rules')
  async listCommissionRules(): Promise<{ data: CommissionRuleSummary[] }> {
    try {
      return {
        data: await this.adminPaymentService.listCommissionRules(),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin commission workflow failed.',
        503,
      );
    }
  }

  @Patch('commission-rules/:ruleId')
  async updateCommissionRule(
    @Param('ruleId') ruleId: string,
    @Body()
    body: {
      currentRate?: number;
      status?: 'active' | 'pending' | 'inactive' | null;
      adminUserId?: string;
    },
  ): Promise<{ data: CommissionRuleSummary }> {
    try {
      return {
        data: await this.adminPaymentService.updateCommissionRule(ruleId, {
          currentRate: Number(body.currentRate ?? Number.NaN),
          status: body.status ?? 'active',
          adminUserId: body.adminUserId ?? '',
        }),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin commission workflow failed.',
        503,
      );
    }
  }

  // :paymentId catch-alls LAST.

  @Post(':paymentId/failure')
  async recordFailure(
    @Param('paymentId') paymentId: string,
    @Body()
    body: {
      failureReason?: string;
      failureCode?: string | null;
      disputeId?: string | null;
    },
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.adminPaymentService.recordPaymentFailure(
          paymentId,
          body.failureReason ?? '',
          body.failureCode ?? null,
          body.disputeId ?? null,
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

  @Post(':paymentId/retry')
  async retry(
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.adminPaymentService.retryPayment(paymentId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payment workflow failed.',
        503,
      );
    }
  }

  @Post(':paymentId/apicenter-sync')
  async syncWithApicenter(
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.adminPaymentService.syncPaymentWithApicenter(paymentId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payment workflow failed.',
        503,
      );
    }
  }

  @Post(':paymentId/release')
  async releasePaymentToProvider(
    @Param('paymentId') paymentId: string,
    @Body() body: { adminUserId?: string; note?: string | null },
  ): Promise<{ data: PayoutSummary }> {
    try {
      return {
        data: await this.adminPaymentService.releasePaymentToProvider(
          paymentId,
          body.adminUserId ?? '',
          body.note ?? null,
        ),
      };
    } catch (error) {
      if (error instanceof PaymentServiceRequestError) {
        throw this.error(error.code, error.message, error.status);
      }
      throw this.error(
        'admin_dependency_unavailable',
        'Admin payment workflow failed.',
        503,
      );
    }
  }

  @Get(':paymentId')
  async get(
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.adminPaymentService.getPayment(paymentId),
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
