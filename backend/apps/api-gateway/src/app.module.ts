import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getBackendEnvFilePaths } from '../../../libs/common/src';
import { AdminAuditController } from './features/admin/admin-audit.controller';
import { AdminAuditGatewayService } from './features/admin/admin-audit.service';
import { AdminBookingController } from './features/admin/admin-booking.controller';
import { AdminBookingGatewayService } from './features/admin/admin-booking.service';
import { AdminCommissionController } from './features/admin/admin-commission.controller';
import { AdminServiceClient } from './features/admin/clients/admin-service.client';
import { AdminDisputeController } from './features/admin/admin-dispute.controller';
import { AdminDisputeGatewayService } from './features/admin/admin-dispute.service';
import { AdminPaymentController } from './features/admin/admin-payment.controller';
import { AdminPaymentGatewayService } from './features/admin/admin-payment.service';
import { AdminPricingController } from './features/admin/admin-pricing.controller';
import { AdminPricingGatewayService } from './features/admin/admin-pricing.service';
import { AdminProviderApplicationController } from './features/admin/admin-provider-application.controller';
import { AdminProviderApplicationGatewayService } from './features/admin/admin-provider-application.service';
import { AdminPromotionController } from './features/admin/admin-promotion.controller';
import { AdminReviewController } from './features/admin/admin-review.controller';
import { AdminBroadcastController } from './features/admin/admin-broadcast.controller';
import { AdminReportController } from './features/admin/admin-report.controller';
import { AdminIntegrationController } from './features/admin/admin-integration.controller';
import { AdminSettlementController } from './features/admin/admin-settlement.controller';
import { AdminRefundController } from './features/admin/admin-refund.controller';
import { AdminCatalogController } from './features/admin/admin-catalog.controller';
import { AdminCatalogGatewayService } from './features/admin/admin-catalog.service';
import { AdminProvidersController } from './features/admin/admin-providers.controller';
import { AdminSupportController } from './features/admin/admin-support.controller';
import { AdminSupportGatewayService } from './features/admin/admin-support.service';
import { AdminUsersController } from './features/admin/admin-users.controller';
import { AdminUsersGatewayService } from './features/admin/admin-users.service';
import { AvailabilityController } from './features/availability/availability.controller';
import { AvailabilityGatewayService } from './features/availability/availability.service';
import { AvailabilityServiceClient } from './features/availability/clients/availability-service.client';
import { BookingController } from './features/booking/booking.controller';
import { BookingGatewayService } from './features/booking/booking.service';
import { BookingServiceClient } from './features/booking/clients/booking-service.client';
import { CatalogServiceClient as CatalogBrowseServiceClient } from './features/catalog/clients/catalog-service.client';
import { CatalogController } from './features/catalog/catalog.controller';
import { CatalogGatewayService } from './features/catalog/catalog.service';
import { AuthTokenService } from './features/current-user/auth-token.service';
import { AuthServiceClient } from './features/current-user/clients/auth-service.client';
import { CatalogServiceClient } from './features/current-user/clients/catalog-service.client';
import { UserServiceClient } from './features/current-user/clients/user-service.client';
import { CurrentUserController } from './features/current-user/current-user.controller';
import { CurrentUserService } from './features/current-user/current-user.service';
import { GeoServiceClient } from './features/geo/clients/geo-service.client';
import { GeoController } from './features/geo/geo.controller';
import { GeoGatewayService } from './features/geo/geo.service';
import { HealthController } from './features/health/health.controller';
import { MessagingServiceClient } from './features/messaging/clients/messaging-service.client';
import { MessagingController } from './features/messaging/messaging.controller';
import { MessagingGatewayService } from './features/messaging/messaging.service';
import { NotificationServiceClient } from './features/notifications/clients/notification-service.client';
import { NotificationController } from './features/notifications/notification.controller';
import { NotificationGatewayService } from './features/notifications/notification.service';
import { PaymentServiceClient } from './features/payments/clients/payment-service.client';
import { PaymentController } from './features/payments/payment.controller';
import { PaymentGatewayService } from './features/payments/payment.service';
import { PricingServiceClient } from './features/pricing/clients/pricing-service.client';
import { ProviderPricingController } from './features/pricing/provider-pricing.controller';
import { PricingController } from './features/pricing/pricing.controller';
import { PricingGatewayService } from './features/pricing/pricing.service';
import { ProviderController } from './features/provider/provider.controller';
import { ProviderGatewayService } from './features/provider/provider.service';
import { ReviewServiceClient } from './features/reviews/clients/review-service.client';
import { ReviewController } from './features/reviews/review.controller';
import { ReviewGatewayService } from './features/reviews/review.service';
import { SupportServiceClient } from './features/support/clients/support-service.client';
import { SupportController } from './features/support/support.controller';
import { SupportGatewayService } from './features/support/support.service';
import { RateLimitMiddleware } from './features/rate-limit/rate-limit.middleware';
import { RegistrationController } from './features/registration/registration.controller';
import { RegistrationGatewayService } from './features/registration/registration.service';
import { ReferralController } from './features/referrals/referral.controller';
import { ReferralGatewayService } from './features/referrals/referral.service';
import { UserPreferenceController } from './features/preferences/preference.controller';
import { UserPreferenceGatewayService } from './features/preferences/preference.service';
import { UploadController } from './features/uploads/upload.controller';
import { UploadGatewayService } from './features/uploads/upload.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getBackendEnvFilePaths(),
    }),
  ],
  controllers: [
    HealthController,
    CurrentUserController,
    GeoController,
    CatalogController,
    BookingController,
    AvailabilityController,
    MessagingController,
    PaymentController,
    PricingController,
    ProviderPricingController,
    ProviderController,
    ReviewController,
    SupportController,
    NotificationController,
    AdminSupportController,
    AdminCatalogController,
    AdminProvidersController,
    AdminUsersController,
    AdminPaymentController,
    AdminPricingController,
    AdminRefundController,
    AdminPromotionController,
    AdminDisputeController,
    AdminAuditController,
    AdminBookingController,
    AdminCommissionController,
    AdminProviderApplicationController,
    AdminBroadcastController,
    AdminReportController,
    AdminIntegrationController,
    AdminSettlementController,
    AdminReviewController,
    RegistrationController,
    ReferralController,
    UserPreferenceController,
    UploadController,
  ],
  providers: [
    AdminServiceClient,
    AdminSupportGatewayService,
    AdminCatalogGatewayService,
    AdminUsersGatewayService,
    AdminPaymentGatewayService,
    AdminPricingGatewayService,
    AdminDisputeGatewayService,
    AdminAuditGatewayService,
    AdminBookingGatewayService,
    AdminProviderApplicationGatewayService,
    AvailabilityServiceClient,
    AvailabilityGatewayService,
    BookingServiceClient,
    BookingGatewayService,
    GeoServiceClient,
    GeoGatewayService,
    CatalogBrowseServiceClient,
    CatalogGatewayService,
    MessagingServiceClient,
    MessagingGatewayService,
    NotificationServiceClient,
    NotificationGatewayService,
    PaymentServiceClient,
    PaymentGatewayService,
    PricingServiceClient,
    PricingGatewayService,
    ProviderGatewayService,
    ReviewServiceClient,
    ReviewGatewayService,
    SupportServiceClient,
    SupportGatewayService,
    AuthServiceClient,
    UserServiceClient,
    CatalogServiceClient,
    CurrentUserService,
    RegistrationGatewayService,
    ReferralGatewayService,
    UserPreferenceGatewayService,
    UploadGatewayService,
    RateLimitMiddleware,
    {
      provide: AuthTokenService,
      useFactory: () => new AuthTokenService(),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
