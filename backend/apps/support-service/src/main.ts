import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { resolveServicePort } from '../../../libs/common/src';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = resolveServicePort({
    name: 'support-service',
    defaultPort: 8510,
    portEnv: 'SUPPORT_SERVICE_PORT',
  });

  await app.listen(port);
}

void bootstrap();
