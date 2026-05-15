import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogBrowseController } from './features/catalog-browse/catalog-browse.controller';
import { CatalogBrowseService } from './features/catalog-browse/catalog-browse.service';
import { SupabaseCatalogBrowseRepository } from './features/catalog-browse/supabase-catalog-browse.repository';
import { HealthController } from './features/health/health.controller';
import { ProviderProfileController } from './features/provider-profile/provider-profile.controller';
import {
  PROVIDER_PROFILE_REPOSITORY,
  ProviderProfileService,
} from './features/provider-profile/provider-profile.service';
import { SupabaseProviderProfileRepository } from './features/provider-profile/supabase-provider-profile.repository';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, ProviderProfileController, CatalogBrowseController],
  providers: [
    CatalogBrowseService,
    {
      provide: SupabaseCatalogBrowseRepository,
      useFactory: () => new SupabaseCatalogBrowseRepository(),
    },
    ProviderProfileService,
    {
      provide: PROVIDER_PROFILE_REPOSITORY,
      useFactory: () => new SupabaseProviderProfileRepository(),
    },
  ],
})
export class AppModule {}
