import { Action, Command, Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ConsultacyaService } from './consultacya.service';

interface SessionData {
  step?: string;
  answers?: { [key: number]: string };
  currentQuestionOrder?: number;
}

interface MyContext extends Context {
  session: SessionData;
}

@Update()
export class ConsultacyaCommand {
  constructor(private readonly consultacyaService: ConsultacyaService) {}

  private async sendSummary(ctx: MyContext, includePhone: boolean = false) {
    const summaryMessage = await this.consultacyaService.getSummary();
    await ctx.reply(summaryMessage, {
      reply_markup: includePhone ? { remove_keyboard: true } : undefined,
    });

    console.log(ctx.session.answers);

    ctx.session = {};
  }

  @Command('consultacya')
  async onConsultacya(@Ctx() ctx: MyContext) {
    await this.start(ctx);
  }

  @Action('consultacya')
  async onConsultacyaAction(@Ctx() ctx: MyContext) {
    await this.start(ctx);
    await ctx.answerCbQuery();
  }

  private async start(ctx: MyContext) {
    ctx.session = {
      currentQuestionOrder: 1,
      answers: {},
    };
    await this.askQuestion(ctx, 1);
  }

  private async askQuestion(ctx: MyContext, order: number) {
    const question = await this.consultacyaService.getQuestion(order);

    if (!question) {
      await this.sendSummary(ctx);
      return;
    }

    ctx.session.currentQuestionOrder = order;

    if (question.variants.length > 0) {
      ctx.session.step = `waiting_select_${order}`;
      await ctx.reply(question.text, {
        reply_markup: {
          inline_keyboard: question.variants.map((variant) => [
            {
              text: variant.text,
              callback_data: `consultacya_answer:${order}:${variant.id}`,
            },
          ]),
        },
      });
    }
  }

  @Action(/consultacya_answer:(\d+):(\d+)/)
  async onAnswer(@Ctx() ctx: MyContext & { match: RegExpMatchArray }) {
    const questionOrder = parseInt(ctx.match[1]);
    const variantId = parseInt(ctx.match[2]);

    await ctx.answerCbQuery();

    const question = await this.consultacyaService.getQuestion(questionOrder);
    if (!question) return;

    const variant = question.variants.find((v) => v.id === variantId);
    if (!variant) return;

    if (!ctx.session.answers) ctx.session.answers = {};
    ctx.session.answers[questionOrder] = variant.text;

    if (variant.needsPhone) {
      ctx.session.step = 'waiting_for_phone';
      await ctx.reply(
        'Отправьте свой номер телефона и мы свяжемся с вами в ближайшее время',
        {
          reply_markup: {
            keyboard: [
              [
                {
                  text: '📱 Поделиться номером телефона',
                  request_contact: true,
                },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
      return;
    }

    const nextOrder = questionOrder + 1;
    await this.askQuestion(ctx, nextOrder);
  }

  @On('contact')
  async onContact(@Ctx() ctx: MyContext) {
    if (!ctx.message || !('contact' in ctx.message)) return;

    if (ctx.session.step === 'waiting_for_phone') {
      const contact = ctx.message.contact;
      const phone = contact.phone_number;

      if (!ctx.session.answers) ctx.session.answers = {};
      ctx.session.answers[-1] = phone;

      await this.sendSummary(ctx, true);
    }
  }
}
