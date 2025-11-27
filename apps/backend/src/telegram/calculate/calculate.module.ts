import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TelegramUsersService } from '../../telegram-users/telegram-users.service';
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
    TelegramUsersService,
  ],
  exports: [CalculateService, CalculateCommand],
})
export class CalculateModule {}
