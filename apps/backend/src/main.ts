import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { AppModule } from './app.module';

const findEnvFile = () => {
  const cwd = process.cwd();
  const paths = [
    join(cwd, '.env'),
    join(cwd, '..', '.env'),
    join(cwd, '../..', '.env'),
  ];

  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }
  return paths[0];
};

config({ path: findEnvFile() });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(3000);

  logger.log(`Application is running on: http://localhost:3000`, 'Bootstrap');
}
bootstrap();
