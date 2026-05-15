import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './features/health/health.controller';
import { NotificationController } from './features/notifications/notification.controller';
import { NotificationService } from './features/notifications/notification.service';
import { SupabaseNotificationRepository } from './features/notifications/supabase-notification.repository';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, NotificationController],
  providers: [NotificationService, SupabaseNotificationRepository],
})
export class AppModule {}
