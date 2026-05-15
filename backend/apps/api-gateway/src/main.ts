import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { createGatewayCorsOptions, resolveServicePort } from '../../../libs/common/src';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors(createGatewayCorsOptions());
  const port = resolveServicePort({
    name: 'api-gateway',
    defaultPort: 5001,
  });

  await app.listen(port);
}

void bootstrap();
