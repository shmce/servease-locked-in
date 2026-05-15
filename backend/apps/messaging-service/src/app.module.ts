import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationController } from './features/conversations/conversation.controller';
import { ConversationService } from './features/conversations/conversation.service';
import { SupabaseConversationRepository } from './features/conversations/supabase-conversation.repository';
import { HealthController } from './features/health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] })],
  controllers: [HealthController, ConversationController],
  providers: [ConversationService, SupabaseConversationRepository],
})
export class AppModule {}
