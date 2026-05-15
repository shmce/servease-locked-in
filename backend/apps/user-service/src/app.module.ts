import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomerProfileController } from './features/customer-profile/customer-profile.controller';
import {
  CUSTOMER_PROFILE_REPOSITORY,
  CustomerProfileService,
} from './features/customer-profile/customer-profile.service';
import { SupabaseCustomerProfileRepository } from './features/customer-profile/supabase-customer-profile.repository';
import { HealthController } from './features/health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, CustomerProfileController],
  providers: [
    CustomerProfileService,
    {
      provide: CUSTOMER_PROFILE_REPOSITORY,
      useFactory: () => new SupabaseCustomerProfileRepository(),
    },
  ],
})
export class AppModule {}
