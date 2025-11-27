import { Module } from '@nestjs/common';
import { TelegramUsersService } from 'src/telegram-users/telegram-users.service';
import { FormSubmissionService } from 'src/telegram/form-submission.service';
import { PrismaService } from '../../prisma.service';
import { PortfolioCommand } from './portfolio.command';
import { PortfolioTelegramService } from './portfolio.service';

@Module({
  providers: [
    PortfolioCommand,
    PortfolioTelegramService,
    PrismaService,
    FormSubmissionService,
    TelegramUsersService,
  ],
  exports: [PortfolioTelegramService],
})
export class PortfolioModule {}
