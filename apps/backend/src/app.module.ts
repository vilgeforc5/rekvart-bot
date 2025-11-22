import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CommandController } from './command/command.controller';
import { BotCommandService } from './command/commands.service';
import { DizaynController } from './dizayn/dizayn.controller';
import { DizaynService } from './dizayn/dizayn.service';
import { HealthModule } from './health/health.module';
import { PortfolioController } from './portfolio/portfolio.controller';
import { PortfolioService } from './portfolio/portfolio.service';
import { StartContentController } from './start-content/start-content.controller';
import { StartContentService } from './start-content/start-content.service';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [TelegramModule, HealthModule],
  controllers: [
    CommandController,
    StartContentController,
    PortfolioController,
    DizaynController,
  ],
  providers: [
    PrismaService,
    BotCommandService,
    StartContentService,
    PortfolioService,
    DizaynService,
  ],
})
export class AppModule {}
