import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getBackendEnvFilePaths } from '../../../libs/common/src';
import { HealthController } from './features/health/health.controller';
import { PaymentAdminController } from './features/payments/payment-admin.controller';
import { PaymentAdminService } from './features/payments/payment-admin.service';
import { PaymentController } from './features/payments/payment.controller';
import { PaymentService } from './features/payments/payment.service';
import { PricingEngineController } from './features/pricing-engine/pricing-engine.controller';
import { PricingEngineRepository } from './features/pricing-engine/pricing-engine.repository';
import { PricingEngineService } from './features/pricing-engine/pricing-engine.service';
import { SharedPaymentService } from './features/payments/shared-payment.service';
import { SupabasePaymentRepository } from './features/payments/supabase-payment.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getBackendEnvFilePaths(),
    }),
  ],
  controllers: [
    HealthController,
    PaymentController,
    PaymentAdminController,
    PricingEngineController,
  ],
  providers: [
    PaymentService,
    SharedPaymentService,
    PaymentAdminService,
    SupabasePaymentRepository,
    PricingEngineService,
    PricingEngineRepository,
  ],
})
export class AppModule {}
