import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AutoMessageController } from './auto-message.controller';
import { AutoMessageService } from './auto-message.service';

@Module({
  controllers: [AutoMessageController],
  providers: [AutoMessageService, PrismaService],
  exports: [AutoMessageService],
})
export class AutoMessageModule {}
