import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { BotCommandService } from '../command/commands.service';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly botCommandService: BotCommandService,
  ) {}

  async onModuleInit() {
    await this.setBotCommands();
  }

  async setBotCommands() {
    const commands = await this.botCommandService.findEnabled();
    const botCommands = commands
      .filter(
        (cmd) => cmd.description != null && cmd.description.trim().length > 0,
      )
      .map((cmd) => ({
        command: cmd.command,
        description: cmd.description!,
      }));

    await this.bot.telegram.setMyCommands(botCommands);
  }
}
