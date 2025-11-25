import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
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

@Module({
  imports: [AuthModule, TelegramModule, HealthModule],
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
