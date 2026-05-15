import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingLifecycleController } from './features/booking-lifecycle/booking-lifecycle.controller';
import { BookingLifecycleService } from './features/booking-lifecycle/booking-lifecycle.service';
import { SupabaseBookingRepository } from './features/booking-lifecycle/supabase-booking.repository';
import { HealthController } from './features/health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, BookingLifecycleController],
  providers: [
    BookingLifecycleService,
    {
      provide: SupabaseBookingRepository,
      useFactory: () => new SupabaseBookingRepository(),
    },
  ],
})
export class AppModule {}
