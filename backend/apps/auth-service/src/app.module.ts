import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './features/health/health.controller';
import { InternalUserController } from './features/internal-user/internal-user.controller';
import {
  InternalUserService,
  USER_REPOSITORY,
} from './features/internal-user/internal-user.service';
import { SupabaseUserRepository } from './features/internal-user/supabase-user.repository';
import { RegistrationController } from './features/registration/registration.controller';
import {
  REGISTRATION_REPOSITORY,
  RegistrationService,
} from './features/registration/registration.service';
import { SupabaseRegistrationRepository } from './features/registration/supabase-registration.repository';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, InternalUserController, RegistrationController],
  providers: [
    InternalUserService,
    RegistrationService,
    {
      provide: USER_REPOSITORY,
      useFactory: () => new SupabaseUserRepository(),
    },
    {
      provide: REGISTRATION_REPOSITORY,
      useFactory: () => new SupabaseRegistrationRepository(),
    },
  ],
})
export class AppModule {}
