import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ConsultacyaCommand } from './consultacya.command';
import { ConsultacyaController } from './consultacya.controller';
import { ConsultacyaService } from './consultacya.service';

@Module({
  controllers: [ConsultacyaController],
  providers: [ConsultacyaCommand, ConsultacyaService, PrismaService],
  exports: [ConsultacyaService],
})
export class ConsultacyaModule {}
