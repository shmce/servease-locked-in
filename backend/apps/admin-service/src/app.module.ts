import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminAuditController } from './features/audit/admin-audit.controller';
import { AdminAuditService } from './features/audit/admin-audit.service';
import { SupabaseAdminAuditRepository } from './features/audit/supabase-admin-audit.repository';
import { AdminBookingController } from './features/bookings/admin-booking.controller';
import { AdminBookingService } from './features/bookings/admin-booking.service';
import { BookingServiceClient as AdminBookingServiceClient } from './features/bookings/clients/booking-service.client';
import { AdminBroadcastController } from './features/broadcasts/admin-broadcast.controller';
import { AdminBroadcastService } from './features/broadcasts/admin-broadcast.service';
import { SupabaseAdminBroadcastRepository } from './features/broadcasts/supabase-admin-broadcast.repository';
import { AdminCatalogController } from './features/catalog/admin-catalog.controller';
import { AdminCatalogGatewayService } from './features/catalog/admin-catalog.service';
import { CatalogAdminServiceClient } from './features/catalog/clients/catalog-admin-service.client';
import { AdminDisputeController } from './features/disputes/admin-dispute.controller';
import { AdminDisputeService } from './features/disputes/admin-dispute.service';
import { BookingServiceClient } from './features/disputes/clients/booking-service.client';
import { AdminPaymentController } from './features/payments/admin-payment.controller';
import { AdminPaymentService } from './features/payments/admin-payment.service';
import { AdminPromotionController } from './features/payments/admin-promotion.controller';
import { PaymentServiceClient } from './features/payments/clients/payment-service.client';
import { AdminProviderApplicationController } from './features/provider-applications/admin-provider-application.controller';
import { AdminProviderApplicationService } from './features/provider-applications/admin-provider-application.service';
import { CatalogServiceClient } from './features/provider-applications/clients/catalog-service.client';
import { AdminSupportController } from './features/support/admin-support.controller';
import { AdminSupportService } from './features/support/admin-support.service';
import { SupportServiceClient } from './features/support/clients/support-service.client';
import { AdminUsersController } from './features/users/admin-users.controller';
import { AdminUsersGatewayService } from './features/users/admin-users.service';
import { AuthServiceClient } from './features/users/clients/auth-service.client';
import { UserServiceClient } from './features/users/clients/user-service.client';
import { AdminIntegrationController } from './features/integrations/admin-integration.controller';
import { AdminIntegrationService } from './features/integrations/admin-integration.service';
import { SupabaseAdminIntegrationRepository } from './features/integrations/supabase-admin-integration.repository';
import { HealthController } from './features/health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [
    HealthController,
    AdminCatalogController,
    AdminUsersController,
    AdminSupportController,
    AdminPaymentController,
    AdminPromotionController,
    AdminDisputeController,
    AdminAuditController,
    AdminBookingController,
    AdminBroadcastController,
    AdminProviderApplicationController,
    AdminIntegrationController,
  ],
  providers: [
    AdminCatalogGatewayService,
    CatalogAdminServiceClient,
    AdminUsersGatewayService,
    AuthServiceClient,
    UserServiceClient,
    AdminSupportService,
    SupportServiceClient,
    AdminPaymentService,
    PaymentServiceClient,
    AdminDisputeService,
    BookingServiceClient,
    AdminAuditService,
    SupabaseAdminAuditRepository,
    AdminBookingService,
    AdminBookingServiceClient,
    AdminBroadcastService,
    SupabaseAdminBroadcastRepository,
    AdminProviderApplicationService,
    CatalogServiceClient,
    AdminIntegrationService,
    SupabaseAdminIntegrationRepository,
  ],
})
export class AppModule {}
