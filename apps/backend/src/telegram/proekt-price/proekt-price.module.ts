import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProektPriceService } from 'src/proekt-price/proekt-price.service';
import { TelegramUsersService } from 'src/telegram-users/telegram-users.service';
import { FormSubmissionService } from 'src/telegram/form-submission.service';
import { ProektPriceCommand } from './proekt-price.command';

@Module({
  providers: [
    ProektPriceCommand,
    ProektPriceService,
    PrismaService,
    FormSubmissionService,
    TelegramUsersService,
  ],
  exports: [ProektPriceCommand],
})
export class ProektPriceModule {}
