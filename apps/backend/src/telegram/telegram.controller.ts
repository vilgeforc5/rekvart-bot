import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class TelegramController {
  @Command('ping')
  async onPing(@Ctx() ctx: Context) {
    await ctx.reply('pong');
  }
}
