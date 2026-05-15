import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { resolveServicePort } from '../../../libs/common/src';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = resolveServicePort({
    name: 'user-service',
    defaultPort: 8502,
    portEnv: 'USER_SERVICE_PORT',
  });

  await app.listen(port);
}

void bootstrap();
