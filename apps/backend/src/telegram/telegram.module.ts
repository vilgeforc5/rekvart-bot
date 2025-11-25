import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { HealthModule } from 'src/health/health.module';
import { TelegramUsersService } from 'src/telegram-users/telegram-users.service';
import { FormSubmissionService } from 'src/telegram/form-submission.service';
import { PingCommand } from 'src/telegram/ping/ping.command';
import { PingModule } from 'src/telegram/ping/ping.module';
import { PortfolioCommand } from 'src/telegram/portfolio/portfolio.command';
import { PortfolioTelegramService } from 'src/telegram/portfolio/portfolio.service';
import { TopicChatService } from 'src/telegram/topic-chat.service';
import { session } from 'telegraf';
import { BotCommandService } from '../command/commands.service';
import { PrismaService } from '../prisma.service';
import { StartContentService } from '../start-content/start-content.service';
import { TopicContentService } from '../topic-content/topic-content.service';
import { CalculateModule } from './calculate/calculate.module';
import { ConsultacyaModule } from './consultacya/consultacya.module';
import { DizaynModule } from './dizayn/dizayn.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramController } from './telegram.controller';
import { ZamerModule } from './zamer/zamer.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: process.env.TELEGRAM_BOT_TOKEN!,
        middlewares: [session()],
      }),
      inject: [],
    }),
    HealthModule,
    PingModule,
    PortfolioModule,
    ConsultacyaModule,
    ZamerModule,
    CalculateModule,
    DizaynModule,
  ],
  providers: [
    TelegramController,
    BotCommandService,
    StartContentService,
    TopicContentService,
    PrismaService,
    TelegramBotService,
    FormSubmissionService,
    TopicChatService,
    PortfolioCommand,
    PortfolioTelegramService,
    PingCommand,
    TelegramUsersService,
  ],
  exports: [BotCommandService, TelegramBotService],
})
export class TelegramModule {}
