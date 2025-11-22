import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Protected } from 'src/auth/protected.decorator';
import { StartContent, UpsertStartContentDto } from './start-content.dto';
import { StartContentService } from './start-content.service';

@Protected()
@Controller('api/start-content')
export class StartContentController {
  constructor(private readonly startContentService: StartContentService) {}

  @Get()
  get(): Promise<StartContent | null> {
    return this.startContentService.get();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(
    @Body() upsertStartContentDto: UpsertStartContentDto,
  ): Promise<StartContent> {
    return this.startContentService.upsert(upsertStartContentDto);
  }
}
