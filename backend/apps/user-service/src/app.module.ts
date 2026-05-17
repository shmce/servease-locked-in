import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminUserController } from './features/admin-users/admin-user.controller';
import { AdminUserService } from './features/admin-users/admin-user.service';
import { SupabaseAdminUserRepository } from './features/admin-users/supabase-admin-user.repository';
import { CustomerProfileController } from './features/customer-profile/customer-profile.controller';
import {
  CUSTOMER_PROFILE_REPOSITORY,
  CustomerProfileService,
} from './features/customer-profile/customer-profile.service';
import { SupabaseCustomerProfileRepository } from './features/customer-profile/supabase-customer-profile.repository';
import { HealthController } from './features/health/health.controller';
import { ReferralController } from './features/referrals/referral.controller';
import {
  REFERRAL_REPOSITORY,
  ReferralService,
} from './features/referrals/referral.service';
import { SupabaseReferralRepository } from './features/referrals/supabase-referral.repository';
import { UserPreferenceController } from './features/preferences/preference.controller';
import {
  USER_PREFERENCE_REPOSITORY,
  UserPreferenceService,
} from './features/preferences/preference.service';
import { SupabasePreferenceRepository } from './features/preferences/supabase-preference.repository';
import { SharedGeoController } from './features/shared-geo/shared-geo.controller';
import { SharedGeoService } from './features/shared-geo/shared-geo.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [
    HealthController,
    AdminUserController,
    CustomerProfileController,
    ReferralController,
    UserPreferenceController,
    SharedGeoController,
  ],
  providers: [
    AdminUserService,
    {
      provide: SupabaseAdminUserRepository,
      useFactory: () => new SupabaseAdminUserRepository(),
    },
    CustomerProfileService,
    ReferralService,
    UserPreferenceService,
    SharedGeoService,
    {
      provide: CUSTOMER_PROFILE_REPOSITORY,
      useFactory: () => new SupabaseCustomerProfileRepository(),
    },
    {
      provide: REFERRAL_REPOSITORY,
      useFactory: () => new SupabaseReferralRepository(),
    },
    {
      provide: USER_PREFERENCE_REPOSITORY,
      useFactory: () => new SupabasePreferenceRepository(),
    },
  ],
})
export class AppModule {}
