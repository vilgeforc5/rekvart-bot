import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { ProektPriceService } from 'src/proekt-price/proekt-price.service';
import { FormSubmissionService } from 'src/telegram/form-submission.service';
import { Context } from 'telegraf';

@Update()
export class ProektPriceCommand {
  constructor(
    private readonly proektPriceService: ProektPriceService,
    private readonly formSubmissionService: FormSubmissionService,
  ) {}

  @Command('proekt_price')
  async onProektPrice(@Ctx() ctx: Context) {
    await this.sendMessage(ctx);
  }

  @Action('proekt_price')
  async onProektPriceAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await this.sendMessage(ctx);
  }

  private async sendMessage(ctx: Context) {
    const content = await this.proektPriceService.get();

    if (!content) {
      await ctx.reply('Информация временно недоступна');
      return;
    }

    await ctx.reply(content.message, {
      parse_mode: 'HTML',
    });

    await this.formSubmissionService.handleSubmission(
      'proekt_price',
      {},
      ctx.from?.id.toString(),
    );
  }
}
