import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getBackendEnvFilePaths } from '../../../libs/common/src';
import { HealthController } from './features/health/health.controller';
import { SupabaseSupportTicketRepository } from './features/tickets/supabase-ticket.repository';
import { SupportTicketAdminController } from './features/tickets/ticket-admin.controller';
import { SupportTicketAdminService } from './features/tickets/ticket-admin.service';
import { SupportTicketController } from './features/tickets/ticket.controller';
import { SupportTicketService } from './features/tickets/ticket.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getBackendEnvFilePaths(),
    }),
  ],
  controllers: [
    HealthController,
    SupportTicketController,
    SupportTicketAdminController,
  ],
  providers: [
    SupportTicketService,
    SupportTicketAdminService,
    SupabaseSupportTicketRepository,
  ],
})
export class AppModule {}
