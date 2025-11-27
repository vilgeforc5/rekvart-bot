import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { ProektPriceContent } from './proekt-price.dto';
import { UpsertProektPriceContentDto } from './proekt-price.dto';

@Injectable()
export class ProektPriceService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<ProektPriceContent | null> {
    return this.prisma.proektPriceContent.findUnique({
      where: { id: 1 },
    });
  }

  async upsert(data: UpsertProektPriceContentDto): Promise<ProektPriceContent> {
    return this.prisma.proektPriceContent.upsert({
      where: { id: 1 },
      update: {
        message: data.message,
      },
      create: {
        id: 1,
        message: data.message,
      },
    });
  }
}
