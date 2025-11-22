import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PortfolioCommand } from './portfolio.command';
import { PortfolioTelegramService } from './portfolio.service';

@Module({
  providers: [PortfolioCommand, PortfolioTelegramService, PrismaService],
  exports: [PortfolioTelegramService],
})
export class PortfolioModule {}
