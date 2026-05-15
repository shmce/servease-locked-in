import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './features/health/health.controller';
import { InternalUserController } from './features/internal-user/internal-user.controller';
import {
  InternalUserService,
  USER_REPOSITORY,
} from './features/internal-user/internal-user.service';
import { SupabaseUserRepository } from './features/internal-user/supabase-user.repository';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, InternalUserController],
  providers: [
    InternalUserService,
    {
      provide: USER_REPOSITORY,
      useFactory: () => new SupabaseUserRepository(),
    },
  ],
})
export class AppModule {}
