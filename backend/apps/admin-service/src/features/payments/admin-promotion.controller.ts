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
import { AdminPaymentService } from './admin-payment.service';
import {
  PromotionSummary,
  UpsertPromotionRequest,
} from './admin-payment.types';

@Controller('internal/admin/promotions')
export class AdminPromotionController {
  constructor(private readonly adminPaymentService: AdminPaymentService) {}

  @Get()
  async list(
    @Query('status') status?: string,
  ): Promise<{ data: PromotionSummary[] }> {
    try {
      return {
        data: await this.adminPaymentService.listPromotions(status ?? null),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin promotion workflow failed.',
        503,
      );
    }
  }

  @Post()
  async create(
    @Body() body: UpsertPromotionRequest,
  ): Promise<{ data: PromotionSummary }> {
    try {
      return {
        data: await this.adminPaymentService.createPromotion(body),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin promotion workflow failed.',
        503,
      );
    }
  }

  @Patch(':promotionId')
  async update(
    @Param('promotionId') promotionId: string,
    @Body() body: UpsertPromotionRequest,
  ): Promise<{ data: PromotionSummary }> {
    try {
      return {
        data: await this.adminPaymentService.updatePromotion(promotionId, body),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin promotion workflow failed.',
        503,
      );
    }
  }

  @Delete(':promotionId')
  async delete(
    @Param('promotionId') promotionId: string,
  ): Promise<{ data: PromotionSummary }> {
    try {
      return {
        data: await this.adminPaymentService.deletePromotion(promotionId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin promotion workflow failed.',
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
