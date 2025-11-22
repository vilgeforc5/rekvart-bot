import { Controller, Get, Param, Query } from '@nestjs/common';
import { Protected } from 'src/auth/protected.decorator';
import { TelegramUsersService } from './telegram-users.service';

@Controller('telegram-users')
@Protected()
export class TelegramUsersController {
  constructor(private telegramUsersService: TelegramUsersService) {}

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.telegramUsersService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.telegramUsersService.findOne(parseInt(id, 10));
  }

  @Get(':id/submissions')
  async findUserSubmissions(@Param('id') id: string) {
    return this.telegramUsersService.findUserSubmissions(parseInt(id, 10));
  }
}
