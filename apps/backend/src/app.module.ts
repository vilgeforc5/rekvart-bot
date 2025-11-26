import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AutoMessageModule } from './auto-message/auto-message.module';
import { CommandController } from './command/command.controller';
import { BotCommandService } from './command/commands.service';
import { DizaynController } from './dizayn/dizayn.controller';
import { DizaynService } from './dizayn/dizayn.service';
import { HealthModule } from './health/health.module';
import { PortfolioController } from './portfolio/portfolio.controller';
import { PortfolioService } from './portfolio/portfolio.service';
import { StartContentController } from './start-content/start-content.controller';
import { StartContentService } from './start-content/start-content.service';
import { TelegramUsersController } from './telegram-users/telegram-users.controller';
import { TelegramUsersService } from './telegram-users/telegram-users.service';
import { TelegramModule } from './telegram/telegram.module';
import { TopicContentController } from './topic-content/topic-content.controller';
import { TopicContentService } from './topic-content/topic-content.service';

const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || 'info';
const enableFileLogging = process.env.LOG_TO_FILE === 'true';

const getTransportConfig = () => {
  if (isDevelopment) {
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    };
  }

  if (enableFileLogging) {
    return {
      target: 'pino-roll',
      options: {
        file: join(process.cwd(), 'logs', 'app.log'),
        frequency: 'daily',
        mkdir: true,
      },
    };
  }

  return undefined;
};

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: logLevel,
        transport: getTransportConfig(),
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            '*.password',
            '*.token',
          ],
          remove: true,
        },
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            params: req.params,
            query: req.query,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
        autoLogging: {
          ignore: (req) => req.url === '/health',
        },
      },
    }),
    AuthModule,
    TelegramModule,
    HealthModule,
    AutoMessageModule,
  ],
  controllers: [
    CommandController,
    StartContentController,
    TopicContentController,
    PortfolioController,
    DizaynController,
    TelegramUsersController,
  ],
  providers: [
    PrismaService,
    BotCommandService,
    StartContentService,
    TopicContentService,
    PortfolioService,
    DizaynService,
    TelegramUsersService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [TelegramUsersService],
})
export class AppModule {}
