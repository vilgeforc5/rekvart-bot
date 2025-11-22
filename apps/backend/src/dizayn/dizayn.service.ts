import { Injectable } from '@nestjs/common';
import { DizaynContent } from '../../prisma/generated/client';
import { PrismaService } from '../prisma.service';
import { UpsertDizaynContentDto } from './dizayn.dto';

@Injectable()
export class DizaynService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<DizaynContent | null> {
    return this.prisma.dizaynContent.findUnique({
      where: { id: 1 },
    });
  }

  async upsert(data: UpsertDizaynContentDto): Promise<DizaynContent> {
    return this.prisma.dizaynContent.upsert({
      where: { id: 1 },
      update: {
        title: data.title,
        description: data.description,
        telegramUrl: data.telegramUrl,
        whatsappUrl: data.whatsappUrl,
        email: data.email,
      },
      create: {
        id: 1,
        title: data.title,
        description: data.description,
        telegramUrl: data.telegramUrl,
        whatsappUrl: data.whatsappUrl,
        email: data.email,
      },
    });
  }
}
