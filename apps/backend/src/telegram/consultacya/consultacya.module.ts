import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FormSubmissionService } from '../form-submission.service';
import { ConsultacyaCommand } from './consultacya.command';
import { ConsultacyaController } from './consultacya.controller';
import { ConsultacyaService } from './consultacya.service';

@Module({
  controllers: [ConsultacyaController],
  providers: [
    ConsultacyaCommand,
    ConsultacyaService,
    PrismaService,
    FormSubmissionService,
  ],
  exports: [ConsultacyaService, ConsultacyaCommand],
})
export class ConsultacyaModule {}
