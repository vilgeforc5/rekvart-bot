import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DizaynController } from './dizayn.controller';
import { DizaynService } from './dizayn.service';

@Module({
  controllers: [DizaynController],
  providers: [DizaynService, PrismaService],
  exports: [DizaynService],
})
export class DizaynModule {}
