import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { DizaynService } from 'src/dizayn/dizayn.service';
import { Context } from 'telegraf';

@Update()
export class DizaynCommand {
  constructor(private readonly dizaynService: DizaynService) {}

  @Command('dizayn')
  async onDizayn(@Ctx() ctx: Context) {
    await this.showDizaynInfo(ctx);
  }

  @Action('dizayn')
  async onDizaynAction(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await this.showDizaynInfo(ctx);
  }

  @Action('dizayn_email')
  async onEmailAction(@Ctx() ctx: Context) {
    const content = await this.dizaynService.get();
    await ctx.answerCbQuery();
    await ctx.reply(`📧 Наш email: ${content?.email || 'design@recvart.com'}`);
  }

  private async showDizaynInfo(ctx: Context) {
    const content = await this.dizaynService.get();

    if (!content) {
      await ctx.reply('Информация временно недоступна');
      return;
    }

    const message = `${content.title}

${content.description}`;

    await ctx.reply(message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Telegram',
              url: content.telegramUrl,
            },
            {
              text: '💬 WhatsApp',
              url: content.whatsappUrl,
            },
          ],
          [
            {
              text: '📧 Email',
              callback_data: 'dizayn_email',
            },
          ],
        ],
      },
    });
  }
}
