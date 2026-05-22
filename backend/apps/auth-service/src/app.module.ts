import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getBackendEnvFilePaths } from '../../../libs/common/src';
import { HealthController } from './features/health/health.controller';
import { InternalUserController } from './features/internal-user/internal-user.controller';
import {
  InternalUserService,
  USER_REPOSITORY,
} from './features/internal-user/internal-user.service';
import { SupabaseUserRepository } from './features/internal-user/supabase-user.repository';
import { PasswordResetController } from './features/password-reset/password-reset.controller';
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetService,
} from './features/password-reset/password-reset.service';
import { SupabasePasswordResetRepository } from './features/password-reset/supabase-password-reset.repository';
import { PasswordChangeController } from './features/password-change/password-change.controller';
import {
  PASSWORD_CHANGE_REPOSITORY,
  PasswordChangeService,
} from './features/password-change/password-change.service';
import { SupabasePasswordChangeRepository } from './features/password-change/supabase-password-change.repository';
import { AdminUserController } from './features/admin-users/admin-user.controller';
import { RegistrationController } from './features/registration/registration.controller';
import {
  REGISTRATION_REPOSITORY,
  RegistrationService,
} from './features/registration/registration.service';
import { SupabaseRegistrationRepository } from './features/registration/supabase-registration.repository';
import { SharedAuthController } from './features/shared-auth/shared-auth.controller';
import { SharedAuthService } from './features/shared-auth/shared-auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getBackendEnvFilePaths(),
    }),
  ],
  controllers: [
    HealthController,
    InternalUserController,
    RegistrationController,
    AdminUserController,
    PasswordResetController,
    PasswordChangeController,
    SharedAuthController,
  ],
  providers: [
    InternalUserService,
    RegistrationService,
    PasswordResetService,
    PasswordChangeService,
    SharedAuthService,
    {
      provide: USER_REPOSITORY,
      useFactory: () => new SupabaseUserRepository(),
    },
    {
      provide: REGISTRATION_REPOSITORY,
      useFactory: () => new SupabaseRegistrationRepository(),
    },
    {
      provide: PASSWORD_RESET_REPOSITORY,
      useFactory: () => new SupabasePasswordResetRepository(),
    },
    {
      provide: PASSWORD_CHANGE_REPOSITORY,
      useFactory: () => new SupabasePasswordChangeRepository(),
    },
  ],
})
export class AppModule {}
