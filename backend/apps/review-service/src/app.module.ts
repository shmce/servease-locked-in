import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './features/health/health.controller';
import { ReviewController } from './features/reviews/review.controller';
import { ReviewService } from './features/reviews/review.service';
import { SupabaseReviewRepository } from './features/reviews/supabase-review.repository';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, ReviewController],
  providers: [ReviewService, SupabaseReviewRepository],
})
export class AppModule {}
