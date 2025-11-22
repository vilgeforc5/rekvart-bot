import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PortfolioTelegramService {
  constructor(private prisma: PrismaService) {}

  async getAllPortfolioItems() {
    return this.prisma.portfolio.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPortfolioItem(id: number) {
    return this.prisma.portfolio.findUnique({
      where: { id },
    });
  }
}
