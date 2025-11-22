import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Protected } from 'src/auth/protected.decorator';
import { TelegramBotService } from '../telegram/telegram-bot.service';
import { CreateCommandDto, UpdateCommandDto } from './command.dto';
import { BotCommandService } from './commands.service';

@Protected()
@Controller('command')
export class CommandController {
  constructor(
    private botCommandService: BotCommandService,
    private telegramBotService: TelegramBotService,
  ) {}

  @Get()
  async getAll() {
    return this.botCommandService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.botCommandService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreateCommandDto) {
    const result = await this.botCommandService.create(data);
    await this.telegramBotService.setBotCommands();
    return result;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCommandDto,
  ) {
    const result = await this.botCommandService.update(id, data);
    await this.telegramBotService.setBotCommands();
    return result;
  }

  @Post('upsert')
  async upsert(@Body() data: CreateCommandDto) {
    const result = await this.botCommandService.upsert(data);
    await this.telegramBotService.setBotCommands();
    return result;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.botCommandService.delete(id);
    await this.telegramBotService.setBotCommands();
    return result;
  }
}
