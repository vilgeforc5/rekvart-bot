import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
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
  providers: [TelegramController],
})
export class TelegramModule {}
