import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminServiceClient } from './features/admin/clients/admin-service.client';
import { AdminPaymentController } from './features/admin/admin-payment.controller';
import { AdminPaymentGatewayService } from './features/admin/admin-payment.service';
import { AdminSupportController } from './features/admin/admin-support.controller';
import { AdminSupportGatewayService } from './features/admin/admin-support.service';
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
import { ReviewServiceClient } from './features/reviews/clients/review-service.client';
import { ReviewController } from './features/reviews/review.controller';
import { ReviewGatewayService } from './features/reviews/review.service';
import { SupportServiceClient } from './features/support/clients/support-service.client';
import { SupportController } from './features/support/support.controller';
import { SupportGatewayService } from './features/support/support.service';
import { RateLimitMiddleware } from './features/rate-limit/rate-limit.middleware';
import { RegistrationController } from './features/registration/registration.controller';
import { RegistrationGatewayService } from './features/registration/registration.service';
import { UploadController } from './features/uploads/upload.controller';
import { UploadGatewayService } from './features/uploads/upload.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [
    HealthController,
    CurrentUserController,
    CatalogController,
    BookingController,
    AvailabilityController,
    MessagingController,
    PaymentController,
    ReviewController,
    SupportController,
    NotificationController,
    AdminSupportController,
    AdminPaymentController,
    RegistrationController,
    UploadController,
  ],
  providers: [
    AdminServiceClient,
    AdminSupportGatewayService,
    AdminPaymentGatewayService,
    AvailabilityServiceClient,
    AvailabilityGatewayService,
    BookingServiceClient,
    BookingGatewayService,
    CatalogBrowseServiceClient,
    CatalogGatewayService,
    MessagingServiceClient,
    MessagingGatewayService,
    NotificationServiceClient,
    NotificationGatewayService,
    PaymentServiceClient,
    PaymentGatewayService,
    ReviewServiceClient,
    ReviewGatewayService,
    SupportServiceClient,
    SupportGatewayService,
    AuthServiceClient,
    UserServiceClient,
    CatalogServiceClient,
    CurrentUserService,
    RegistrationGatewayService,
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
