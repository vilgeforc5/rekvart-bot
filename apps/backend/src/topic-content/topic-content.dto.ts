import { IsNotEmpty, IsString } from 'class-validator';
import type { TopicContent as PrismaTopicContent } from '../../prisma/generated/client';

export type TopicContent = PrismaTopicContent;

export class UpsertTopicContentDto {
  @IsString()
  @IsNotEmpty()
  operatorConnectedMessage: string;

  @IsString()
  @IsNotEmpty()
  operatorDisconnectedMessage: string;
}
