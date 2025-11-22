import { Injectable } from '@nestjs/common';
import { StartContent } from '../../prisma/generated/client';
import { PrismaService } from '../prisma.service';
import { UpsertStartContentDto } from './start-content.dto';

@Injectable()
export class StartContentService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<StartContent | null> {
    return this.prisma.startContent.findUnique({
      where: { id: 1 },
    });
  }

  async upsert(data: UpsertStartContentDto): Promise<StartContent> {
    return this.prisma.startContent.upsert({
      where: { id: 1 },
      update: {
        content: data.content,
      },
      create: {
        id: 1,
        content: data.content,
      },
    });
  }
}
