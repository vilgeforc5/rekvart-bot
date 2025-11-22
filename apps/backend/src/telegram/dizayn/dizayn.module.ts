import { Module } from '@nestjs/common';
import { DizaynService } from 'src/dizayn/dizayn.service';
import { PrismaService } from 'src/prisma.service';
import { DizaynCommand } from './dizayn.command';

@Module({
  providers: [DizaynCommand, DizaynService, PrismaService],
  exports: [DizaynCommand],
})
export class DizaynModule {}
