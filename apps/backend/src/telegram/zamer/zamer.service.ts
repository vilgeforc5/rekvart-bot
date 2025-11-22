import { Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class ZamerService {
  async onZamerAction(ctx: Context) {
    await ctx.reply('Записаться на звонок');
  }
}
