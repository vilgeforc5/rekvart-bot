import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { DizaynContent, UpsertDizaynContentDto } from './dizayn.dto';
import { DizaynService } from './dizayn.service';

@Controller('api/dizayn')
export class DizaynController {
  constructor(private readonly dizaynService: DizaynService) {}

  @Get()
  get(): Promise<DizaynContent | null> {
    return this.dizaynService.get();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(
    @Body() upsertDizaynContentDto: UpsertDizaynContentDto,
  ): Promise<DizaynContent> {
    return this.dizaynService.upsert(upsertDizaynContentDto);
  }
}
