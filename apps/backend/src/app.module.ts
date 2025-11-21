import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CommandController } from './command/command.controller';
import { HealthController } from './health/health.controller';
import { BotCommandService } from './telegram/bot-command.service';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [CommandController, HealthController],
  providers: [PrismaService, BotCommandService],
})
export class AppModule {}
