import { NestFactory } from '@nestjs/core';
import { resolveServicePort } from '../../../libs/common/src';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = resolveServicePort({
    name: 'availability-service',
    defaultPort: 8505,
    portEnv: 'AVAILABILITY_SERVICE_PORT',
  });

  await app.listen(port);
}

void bootstrap();
