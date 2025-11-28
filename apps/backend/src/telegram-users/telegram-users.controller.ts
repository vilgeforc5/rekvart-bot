import { Controller, Get, Param, Query } from '@nestjs/common';
import { Protected } from 'src/auth/protected.decorator';
import { TelegramUsersService } from './telegram-users.service';

@Controller('telegram-users')
@Protected()
export class TelegramUsersController {
  constructor(private telegramUsersService: TelegramUsersService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('hasPhone') hasPhone?: string,
    @Query('hasFormSubmissions') hasFormSubmissions?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const hasPhoneBool =
      hasPhone !== undefined ? hasPhone === 'true' : undefined;
    const hasFormSubmissionsBool =
      hasFormSubmissions !== undefined
        ? hasFormSubmissions === 'true'
        : undefined;
    return this.telegramUsersService.findAll(
      pageNum,
      limitNum,
      search,
      hasPhoneBool,
      hasFormSubmissionsBool,
    );
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
