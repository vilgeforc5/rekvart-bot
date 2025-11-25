import { Injectable } from '@nestjs/common';
import { TopicContent } from '../../prisma/generated/client';
import { PrismaService } from '../prisma.service';
import { UpsertTopicContentDto } from './topic-content.dto';

@Injectable()
export class TopicContentService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<TopicContent | null> {
    return this.prisma.topicContent.findUnique({
      where: { id: 1 },
    });
  }

  async upsert(data: UpsertTopicContentDto): Promise<TopicContent> {
    return this.prisma.topicContent.upsert({
      where: { id: 1 },
      update: {
        operatorConnectedMessage: data.operatorConnectedMessage,
        operatorDisconnectedMessage: data.operatorDisconnectedMessage,
      },
      create: {
        id: 1,
        operatorConnectedMessage: data.operatorConnectedMessage,
        operatorDisconnectedMessage: data.operatorDisconnectedMessage,
      },
    });
  }
}
