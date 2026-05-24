import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getBackendEnvFilePaths } from '../../../libs/common/src';
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
import { AdminPricingController } from './features/payments/admin-pricing.controller';
import { AdminPricingService } from './features/payments/admin-pricing.service';
import { AdminPromotionController } from './features/payments/admin-promotion.controller';
import { PaymentServiceClient } from './features/payments/clients/payment-service.client';
import { AdminProviderApplicationController } from './features/provider-applications/admin-provider-application.controller';
import { AdminProviderApplicationService } from './features/provider-applications/admin-provider-application.service';
import { CatalogServiceClient } from './features/provider-applications/clients/catalog-service.client';
import { AdminReportController } from './features/reports/admin-report.controller';
import { AdminReportDeliveryService } from './features/reports/admin-report-delivery.service';
import { AdminReportService } from './features/reports/admin-report.service';
import { SupabaseAdminReportRepository } from './features/reports/supabase-admin-report.repository';
import { AdminSupportController } from './features/support/admin-support.controller';
import { AdminSupportService } from './features/support/admin-support.service';
import { SupportServiceClient } from './features/support/clients/support-service.client';
import { AdminUsersController } from './features/users/admin-users.controller';
import { AdminInvitationDeliveryService } from './features/users/admin-invitation-delivery.service';
import { AdminUsersGatewayService } from './features/users/admin-users.service';
import { AuthServiceClient } from './features/users/clients/auth-service.client';
import { UserServiceClient } from './features/users/clients/user-service.client';
import { SupabaseAdminUserAccessRepository } from './features/users/supabase-admin-user-access.repository';
import { AdminIntegrationController } from './features/integrations/admin-integration.controller';
import { AdminIntegrationService } from './features/integrations/admin-integration.service';
import { ApicenterIntegrationProbe } from './features/integrations/apicenter-integration-probe';
import { SupabaseAdminIntegrationRepository } from './features/integrations/supabase-admin-integration.repository';
import { HealthController } from './features/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getBackendEnvFilePaths(),
    }),
  ],
  controllers: [
    HealthController,
    AdminCatalogController,
    AdminUsersController,
    AdminSupportController,
    AdminPaymentController,
    AdminPricingController,
    AdminPromotionController,
    AdminDisputeController,
    AdminAuditController,
    AdminBookingController,
    AdminBroadcastController,
    AdminProviderApplicationController,
    AdminIntegrationController,
    AdminReportController,
  ],
  providers: [
    AdminCatalogGatewayService,
    CatalogAdminServiceClient,
    AdminUsersGatewayService,
    AdminInvitationDeliveryService,
    AuthServiceClient,
    UserServiceClient,
    SupabaseAdminUserAccessRepository,
    AdminSupportService,
    SupportServiceClient,
    AdminPaymentService,
    AdminPricingService,
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
    ApicenterIntegrationProbe,
    SupabaseAdminIntegrationRepository,
    AdminReportService,
    AdminReportDeliveryService,
    SupabaseAdminReportRepository,
  ],
})
export class AppModule {}
