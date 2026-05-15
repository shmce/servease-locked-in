import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminPaymentController } from './features/payments/admin-payment.controller';
import { AdminPaymentService } from './features/payments/admin-payment.service';
import { PaymentServiceClient } from './features/payments/clients/payment-service.client';
import { AdminSupportController } from './features/support/admin-support.controller';
import { AdminSupportService } from './features/support/admin-support.service';
import { SupportServiceClient } from './features/support/clients/support-service.client';
import { HealthController } from './features/health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, AdminSupportController, AdminPaymentController],
  providers: [
    AdminSupportService,
    SupportServiceClient,
    AdminPaymentService,
    PaymentServiceClient,
  ],
})
export class AppModule {}
