import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { PrismaService } from '../prisma.service';
import { BotCommandService } from './bot-command.service';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramController } from './telegram.controller';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: process.env.TELEGRAM_BOT_TOKEN!,
      }),
      inject: [],
    }),
  ],
  providers: [
    TelegramController,
    BotCommandService,
    PrismaService,
    TelegramBotService,
  ],
  exports: [BotCommandService, TelegramBotService],
})
export class TelegramModule {}
