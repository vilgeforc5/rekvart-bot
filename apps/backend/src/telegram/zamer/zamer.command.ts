import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { ZamerService } from 'src/telegram/zamer/zamer.service';
import { Context } from 'telegraf';

@Update()
export class ZamerCommand {
  constructor(private zamerService: ZamerService) {}

  @Command('zamer')
  async onZamer(@Ctx() ctx: Context) {
    await this.zamerService.onZamerAction(ctx);
  }

  @Action('zamer')
  async onZamerAction(@Ctx() ctx: Context) {
    await this.zamerService.onZamerAction(ctx);
    await ctx.answerCbQuery();
  }
}
