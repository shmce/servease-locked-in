import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './features/health/health.controller';
import { PaymentAdminController } from './features/payments/payment-admin.controller';
import { PaymentAdminService } from './features/payments/payment-admin.service';
import { PaymentController } from './features/payments/payment.controller';
import { PaymentService } from './features/payments/payment.service';
import { SupabasePaymentRepository } from './features/payments/supabase-payment.repository';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, PaymentController, PaymentAdminController],
  providers: [PaymentService, PaymentAdminService, SupabasePaymentRepository],
})
export class AppModule {}
