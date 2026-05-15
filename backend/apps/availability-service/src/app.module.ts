import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './features/health/health.controller';
import { ProviderAvailabilityController } from './features/provider-availability/provider-availability.controller';
import {
  PROVIDER_AVAILABILITY_REPOSITORY,
  ProviderAvailabilityService,
} from './features/provider-availability/provider-availability.service';
import { SupabaseProviderAvailabilityRepository } from './features/provider-availability/supabase-provider-availability.repository';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, ProviderAvailabilityController],
  providers: [
    ProviderAvailabilityService,
    {
      provide: PROVIDER_AVAILABILITY_REPOSITORY,
      useClass: SupabaseProviderAvailabilityRepository,
    },
  ],
})
export class AppModule {}
