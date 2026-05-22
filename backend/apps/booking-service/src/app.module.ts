import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getBackendEnvFilePaths } from '../../../libs/common/src';
import { AdminBookingController } from './features/admin-bookings/admin-booking.controller';
import { AdminBookingService } from './features/admin-bookings/admin-booking.service';
import { SupabaseAdminBookingRepository } from './features/admin-bookings/supabase-admin-booking.repository';
import { AdminDisputeController } from './features/admin-disputes/admin-dispute.controller';
import { AdminDisputeService } from './features/admin-disputes/admin-dispute.service';
import { SupabaseAdminDisputeRepository } from './features/admin-disputes/supabase-admin-dispute.repository';
import { BookingAnalyticsPublisher } from './features/booking-lifecycle/booking-analytics.publisher';
import { BookingLifecycleController } from './features/booking-lifecycle/booking-lifecycle.controller';
import { BookingLifecycleService } from './features/booking-lifecycle/booking-lifecycle.service';
import { SupabaseBookingRepository } from './features/booking-lifecycle/supabase-booking.repository';
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
    BookingLifecycleController,
    AdminDisputeController,
    AdminBookingController,
  ],
  providers: [
    BookingLifecycleService,
    BookingAnalyticsPublisher,
    AdminDisputeService,
    AdminBookingService,
    {
      provide: SupabaseBookingRepository,
      useFactory: () => new SupabaseBookingRepository(),
    },
    {
      provide: SupabaseAdminDisputeRepository,
      useFactory: () => new SupabaseAdminDisputeRepository(),
    },
    {
      provide: SupabaseAdminBookingRepository,
      useFactory: () => new SupabaseAdminBookingRepository(),
    },
  ],
})
export class AppModule {}
