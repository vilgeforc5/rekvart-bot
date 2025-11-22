import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CommandController } from './command/command.controller';
import { BotCommandService } from './command/commands.service';
import { HealthModule } from './health/health.module';
import { StartContentController } from './start-content/start-content.controller';
import { StartContentService } from './start-content/start-content.service';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [TelegramModule, HealthModule],
  controllers: [CommandController, StartContentController],
  providers: [PrismaService, BotCommandService, StartContentService],
})
export class AppModule {}
