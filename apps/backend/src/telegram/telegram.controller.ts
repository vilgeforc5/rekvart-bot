import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotCommandService } from './bot-command.service';

@Update()
export class TelegramController {
  constructor(private botCommandService: BotCommandService) {}

  @Command('ping')
  async onPing(@Ctx() ctx: Context) {
    await ctx.reply('pong');
  }
}
