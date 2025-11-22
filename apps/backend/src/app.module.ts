import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CommandController } from './command/command.controller';
import { BotCommandService } from './command/commands.service';
import { HealthModule } from './health/health.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [TelegramModule, HealthModule],
  controllers: [CommandController],
  providers: [PrismaService, BotCommandService],
})
export class AppModule {}
