import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FormSubmissionService } from '../form-submission.service';
import { ZamerCommand } from './zamer.command';
import { ZamerController } from './zamer.controller';
import { ZamerService } from './zamer.service';

@Module({
  controllers: [ZamerController],
  providers: [ZamerCommand, ZamerService, PrismaService, FormSubmissionService],
  exports: [ZamerService, ZamerCommand],
})
export class ZamerModule {}
