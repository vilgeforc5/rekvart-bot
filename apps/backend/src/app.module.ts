import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AppController } from './app.controller';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
