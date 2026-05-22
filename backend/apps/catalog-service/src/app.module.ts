import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getBackendEnvFilePaths } from '../../../libs/common/src';
import { AdminCatalogController } from './features/admin-catalog/admin-catalog.controller';
import { AdminCatalogService } from './features/admin-catalog/admin-catalog.service';
import { SupabaseAdminCatalogRepository } from './features/admin-catalog/supabase-admin-catalog.repository';
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
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getBackendEnvFilePaths(),
    }),
  ],
  controllers: [
    HealthController,
    AdminCatalogController,
    ProviderProfileController,
    CatalogBrowseController,
  ],
  providers: [
    AdminCatalogService,
    {
      provide: SupabaseAdminCatalogRepository,
      useFactory: () => new SupabaseAdminCatalogRepository(),
    },
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
