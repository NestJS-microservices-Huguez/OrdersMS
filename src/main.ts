import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger("Orders")
  const app = await NestFactory.create(AppModule);
  await app.listen( env.PORT );
  logger.log(`Microservices running on port: ${ env.PORT }`);
}
bootstrap();
