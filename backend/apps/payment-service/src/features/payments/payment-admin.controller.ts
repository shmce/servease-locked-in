import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InvalidPaymentRequestError, PaymentNotFoundError } from './payment.errors';
import { PaymentAdminService } from './payment-admin.service';
import {
  CommissionRuleSummary,
  PaymentSummary,
  PayoutEventSummary,
  PromotionSummary,
  PayoutSummary,
  RefundSummary,
} from './payment.types';

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

  // Static prefix routes MUST be declared BEFORE paymentId routes.

  @Get('promotions')
  async listPromotions(
    @Query('status') status?: string,
  ): Promise<{ data: PromotionSummary[] }> {
    try {
      return {
        data: await this.paymentAdminService.listPromotions(status ?? null),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('promotions')
  async createPromotion(
    @Body()
    body: {
      code?: string;
      description?: string | null;
      discountType?: 'percent' | 'fixed';
      discountValue?: number;
      maxDiscountAmount?: number | null;
      minOrderAmount?: number | null;
      startsAt?: string | null;
      endsAt?: string | null;
      isActive?: boolean | null;
    },
  ): Promise<{ data: PromotionSummary }> {
    try {
      return {
        data: await this.paymentAdminService.upsertPromotion({
          code: body.code ?? '',
          description: body.description ?? null,
          discountType: body.discountType ?? 'percent',
          discountValue: Number(body.discountValue ?? 0),
          maxDiscountAmount:
            body.maxDiscountAmount === null || body.maxDiscountAmount === undefined
              ? null
              : Number(body.maxDiscountAmount),
          minOrderAmount:
            body.minOrderAmount === null || body.minOrderAmount === undefined
              ? 0
              : Number(body.minOrderAmount),
          startsAt: body.startsAt ?? null,
          endsAt: body.endsAt ?? null,
          isActive: body.isActive ?? true,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('promotions/:promotionId')
  async updatePromotion(
    @Param('promotionId') promotionId: string,
    @Body()
    body: {
      code?: string;
      description?: string | null;
      discountType?: 'percent' | 'fixed';
      discountValue?: number;
      maxDiscountAmount?: number | null;
      minOrderAmount?: number | null;
      startsAt?: string | null;
      endsAt?: string | null;
      isActive?: boolean | null;
    },
  ): Promise<{ data: PromotionSummary }> {
    try {
      return {
        data: await this.paymentAdminService.upsertPromotion({
          promotionId,
          code: body.code ?? '',
          description: body.description ?? null,
          discountType: body.discountType ?? 'percent',
          discountValue: Number(body.discountValue ?? 0),
          maxDiscountAmount:
            body.maxDiscountAmount === null || body.maxDiscountAmount === undefined
              ? null
              : Number(body.maxDiscountAmount),
          minOrderAmount:
            body.minOrderAmount === null || body.minOrderAmount === undefined
              ? 0
              : Number(body.minOrderAmount),
          startsAt: body.startsAt ?? null,
          endsAt: body.endsAt ?? null,
          isActive: body.isActive ?? true,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('promotions/:promotionId')
  async deletePromotion(
    @Param('promotionId') promotionId: string,
  ): Promise<{ data: PromotionSummary }> {
    try {
      return {
        data: await this.paymentAdminService.deletePromotion(promotionId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('payouts')
  async listPayouts(
    @Query('status') status?: string,
  ): Promise<{ data: PayoutSummary[] }> {
    try {
      return {
        data: await this.paymentAdminService.listPayouts(status ?? null),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('payouts/:payoutId/status')
  async updatePayoutStatus(
    @Param('payoutId') payoutId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: PayoutSummary }> {
    try {
      return {
        data: await this.paymentAdminService.updatePayoutStatus(
          payoutId,
          body.status ?? '',
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('payouts/:payoutId/events')
  async listPayoutEvents(
    @Param('payoutId') payoutId: string,
  ): Promise<{ data: PayoutEventSummary[] }> {
    try {
      return {
        data: await this.paymentAdminService.listPayoutEvents(payoutId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('payouts/:payoutId/events')
  async recordPayoutEvent(
    @Param('payoutId') payoutId: string,
    @Body()
    body: {
      eventType?: 'requested' | 'approved' | 'rejected' | 'status_updated' | 'bank_reference_reconciled';
      status?: 'requested' | 'processing' | 'paid' | 'cancelled';
      bankReference?: string | null;
      note?: string | null;
      adminUserId?: string | null;
    },
  ): Promise<{ data: PayoutEventSummary }> {
    try {
      return {
        data: await this.paymentAdminService.recordPayoutEvent({
          payoutId,
          eventType: body.eventType ?? 'status_updated',
          status: body.status ?? 'processing',
          bankReference: body.bankReference ?? null,
          note: body.note ?? null,
          adminUserId: body.adminUserId ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('refunds')
  async listRefunds(
    @Query('status') status?: string,
  ): Promise<{ data: RefundSummary[] }> {
    try {
      return {
        data: await this.paymentAdminService.listRefunds(status ?? null),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('refunds/:refundId/approve')
  async approveRefund(
    @Param('refundId') refundId: string,
    @Body() body: { adminUserId?: string; reason?: string | null },
  ): Promise<{ data: RefundSummary }> {
    try {
      return {
        data: await this.paymentAdminService.approveRefund(
          refundId,
          body.adminUserId ?? '',
          body.reason ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('refunds/:refundId/reject')
  async rejectRefund(
    @Param('refundId') refundId: string,
    @Body() body: { adminUserId?: string; reason?: string | null },
  ): Promise<{ data: RefundSummary }> {
    try {
      return {
        data: await this.paymentAdminService.rejectRefund(
          refundId,
          body.adminUserId ?? '',
          body.reason ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('commission-rules')
  async listCommissionRules(): Promise<{ data: CommissionRuleSummary[] }> {
    try {
      return {
        data: await this.paymentAdminService.listCommissionRules(),
      };
    } catch (error) {
      throw this.toHttpException(error);
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
        data: await this.paymentAdminService.updateCommissionRule({
          ruleId,
          currentRate: Number(body.currentRate ?? Number.NaN),
          status: body.status ?? 'active',
          adminUserId: body.adminUserId ?? '',
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  // :paymentId catch-all routes go LAST.

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
        data: await this.paymentAdminService.recordPaymentFailure(
          paymentId,
          body.failureReason ?? '',
          body.failureCode ?? null,
          body.disputeId ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':paymentId/retry')
  async retry(
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.paymentAdminService.retryPayment(paymentId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':paymentId/apicenter-sync')
  async syncWithApicenter(
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.paymentAdminService.syncPaymentWithApicenter(paymentId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':paymentId/release')
  async releasePaymentToProvider(
    @Param('paymentId') paymentId: string,
    @Body() body: { adminUserId?: string; note?: string | null },
  ): Promise<{ data: PayoutSummary }> {
    try {
      return {
        data: await this.paymentAdminService.releasePaymentToProvider({
          paymentId,
          adminUserId: body.adminUserId ?? '',
          note: body.note ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':paymentId')
  async get(
    @Param('paymentId') paymentId: string,
  ): Promise<{ data: PaymentSummary }> {
    try {
      return {
        data: await this.paymentAdminService.getPayment(paymentId),
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
