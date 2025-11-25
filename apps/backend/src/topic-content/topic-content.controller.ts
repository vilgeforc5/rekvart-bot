import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Protected } from 'src/auth/protected.decorator';
import { TopicContent, UpsertTopicContentDto } from './topic-content.dto';
import { TopicContentService } from './topic-content.service';

@Protected()
@Controller('api/topic-content')
export class TopicContentController {
  constructor(private readonly topicContentService: TopicContentService) {}

  @Get()
  get(): Promise<TopicContent | null> {
    return this.topicContentService.get();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(
    @Body() upsertTopicContentDto: UpsertTopicContentDto,
  ): Promise<TopicContent> {
    return this.topicContentService.upsert(upsertTopicContentDto);
  }
}
