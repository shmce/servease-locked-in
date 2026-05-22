import { NestFactory } from '@nestjs/core';
import { resolveServicePort } from '../../../libs/common/src';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = resolveServicePort({
    name: 'payment-service',
    defaultPort: 8507,
    portEnv: 'PAYMENT_SERVICE_PORT',
  });

  await app.listen(port);
}

void bootstrap();
