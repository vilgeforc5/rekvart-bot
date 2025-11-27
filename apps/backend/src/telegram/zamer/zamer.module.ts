import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TelegramUsersService } from '../../telegram-users/telegram-users.service';
import { FormSubmissionService } from '../form-submission.service';
import { ZamerCommand } from './zamer.command';
import { ZamerController } from './zamer.controller';
import { ZamerService } from './zamer.service';

@Module({
  controllers: [ZamerController],
  providers: [
    ZamerCommand,
    ZamerService,
    PrismaService,
    FormSubmissionService,
    TelegramUsersService,
  ],
  exports: [ZamerService, ZamerCommand],
})
export class ZamerModule {}
