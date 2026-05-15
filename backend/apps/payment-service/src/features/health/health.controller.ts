import { Controller, Get } from '@nestjs/common';
import { createHealthResponse, HealthResponse } from '../../../../../libs/common/src';

const SERVICE_NAME = 'payment-service';

@Controller('health')
export class HealthController {
  @Get('live')
  live(): HealthResponse {
    return createHealthResponse(SERVICE_NAME);
  }

  @Get('ready')
  ready(): HealthResponse {
    return createHealthResponse(SERVICE_NAME);
  }
}
