import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FormSubmissionService } from '../form-submission.service';
import { CalculateCommand } from './calculate.command';
import { CalculateController } from './calculate.controller';
import { CalculateService } from './calculate.service';

@Module({
  controllers: [CalculateController],
  providers: [
    CalculateCommand,
    CalculateService,
    PrismaService,
    FormSubmissionService,
  ],
  exports: [CalculateService, CalculateCommand],
})
export class CalculateModule {}
