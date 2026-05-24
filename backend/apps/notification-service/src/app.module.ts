import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getBackendEnvFilePaths } from '../../../libs/common/src';
import { HealthController } from './features/health/health.controller';
import { NotificationController } from './features/notifications/notification.controller';
import { NotificationService } from './features/notifications/notification.service';
import { PushDeliveryClient } from './features/notifications/push-delivery.client';
import { SupabaseNotificationRepository } from './features/notifications/supabase-notification.repository';
import { UserPreferenceClient } from './features/notifications/user-preference.client';
import { SharedMessagingController } from './features/shared-messaging/shared-messaging.controller';
import { SharedMessagingService } from './features/shared-messaging/shared-messaging.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getBackendEnvFilePaths(),
    }),
  ],
  controllers: [
    HealthController,
    NotificationController,
    SharedMessagingController,
  ],
  providers: [
    NotificationService,
    SupabaseNotificationRepository,
    PushDeliveryClient,
    UserPreferenceClient,
    SharedMessagingService,
  ],
})
export class AppModule {}
