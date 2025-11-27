import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Protected } from 'src/auth/protected.decorator';
import type { ProektPriceContent } from './proekt-price.dto';
import { UpsertProektPriceContentDto } from './proekt-price.dto';
import { ProektPriceService } from './proekt-price.service';

@Protected()
@Controller('api/proekt-price')
export class ProektPriceController {
  constructor(private proektPriceService: ProektPriceService) {}

  @Get()
  get(): Promise<ProektPriceContent | null> {
    return this.proektPriceService.get();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(
    @Body() data: UpsertProektPriceContentDto,
  ): Promise<ProektPriceContent> {
    return this.proektPriceService.upsert(data);
  }
}
