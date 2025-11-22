import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { PingModule } from 'src/telegram/ping/ping.module';
import { BotCommandService } from '../command/commands.service';
import { PrismaService } from '../prisma.service';
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
    PingModule,
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
