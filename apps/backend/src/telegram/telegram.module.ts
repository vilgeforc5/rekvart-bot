import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { PingModule } from 'src/telegram/ping/ping.module';
import { session } from 'telegraf';
import { BotCommandService } from '../command/commands.service';
import { PrismaService } from '../prisma.service';
import { StartContentService } from '../start-content/start-content.service';
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
    PingModule,
    ZamerModule,
  ],
  providers: [
    TelegramController,
    BotCommandService,
    StartContentService,
    PrismaService,
    TelegramBotService,
  ],
  exports: [BotCommandService, TelegramBotService],
})
export class TelegramModule {}
