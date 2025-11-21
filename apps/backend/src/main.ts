import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { existsSync } from 'fs';
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
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
