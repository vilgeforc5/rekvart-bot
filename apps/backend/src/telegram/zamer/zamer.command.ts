import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { FormSubmissionService } from '../form-submission.service';
import { ZamerService } from './zamer.service';

interface SessionData {
  step?: string;
  answers?: { [key: number]: string };
  currentQuestionOrder?: number;
  activeForm?: 'calculate' | 'zamer' | 'consultacya';
}

interface MyContext extends Context {
  session: SessionData;
}

@Update()
export class ZamerCommand {
  constructor(
    private readonly zamerService: ZamerService,
    private readonly formSubmissionService: FormSubmissionService,
  ) {}

  private async sendSummary(ctx: MyContext, includePhone: boolean = false) {
    const summaryMessage = await this.zamerService.getSummary();
    await ctx.reply(summaryMessage, {
      reply_markup: includePhone ? { remove_keyboard: true } : undefined,
    });

    const transformedAnswers =
      await this.zamerService.transformAnswersToNamedKeys(
        ctx.session.answers || {},
      );

    await this.formSubmissionService.handleSubmission(
      'zamer',
      transformedAnswers,
      ctx.from?.id.toString(),
    );

    ctx.session = {};
  }

  @Action('zamer')
  async onZamerAction(@Ctx() ctx: MyContext) {
    ctx.session = {
      currentQuestionOrder: 1,
      answers: {},
      activeForm: 'zamer',
    };
    await this.askQuestion(ctx, 1);
    await ctx.answerCbQuery();
  }

  async askQuestion(ctx: MyContext, order: number) {
    const question = await this.zamerService.getQuestion(order);

    if (!question) {
      await this.sendSummary(ctx);
      return;
    }

    ctx.session.currentQuestionOrder = order;
    const questionType = question.type || 'select';
    if (questionType === 'select' && question.variants.length > 0) {
      ctx.session.step = `waiting_select_${order}`;
      await ctx.reply(question.text, {
        reply_markup: {
          inline_keyboard: question.variants.map((variant) => [
            {
              text: variant.text,
              callback_data: `zamer_answer:${order}:${variant.id}`,
            },
          ]),
        },
      });
    } else if (questionType === 'text') {
      ctx.session.step = `waiting_text_${order}`;
      await ctx.reply(question.text);
    } else if (questionType === 'phone') {
      ctx.session.step = `waiting_phone_${order}`;
      await ctx.reply(
        `${question.text}\n\nВы можете ввести номер текстом или поделиться контактом`,
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
    }
  }

  @Action(/zamer_answer:(\d+):(\d+)/)
  async onAnswer(@Ctx() ctx: MyContext & { match: RegExpMatchArray }) {
    const questionOrder = parseInt(ctx.match[1]);
    const variantId = parseInt(ctx.match[2]);

    await ctx.answerCbQuery();

    const question = await this.zamerService.getQuestion(questionOrder);
    if (!question) return;

    const variant = question.variants.find((v) => v.id === variantId);
    if (!variant) return;

    if (!ctx.session.answers) ctx.session.answers = {};
    ctx.session.answers[questionOrder] = variant.text;

    if (variant.needsPhone) {
      ctx.session.step = `waiting_for_phone_${questionOrder}`;
      await ctx.reply(
        'Отправьте свой номер телефона или поделитесь контактом, и мы свяжемся с вами в ближайшее время',
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

  async onContact(ctx: MyContext) {
    if (ctx.session.activeForm !== 'zamer') {
      return;
    }

    if (!ctx.message || !('contact' in ctx.message)) return;

    const contact = ctx.message.contact;
    const phone = contact.phone_number;

    if (ctx.session.step?.startsWith('waiting_for_phone_')) {
      if (!ctx.session.answers) ctx.session.answers = {};
      ctx.session.answers[-1] = phone;

      await this.sendSummary(ctx, true);
    } else if (ctx.session.step?.startsWith('waiting_phone_')) {
      const currentOrder = ctx.session.currentQuestionOrder;

      if (!ctx.session.answers) ctx.session.answers = {};
      ctx.session.answers[currentOrder!] = phone;

      const nextOrder = currentOrder! + 1;
      await this.askQuestion(ctx, nextOrder);
    }
  }

  async onText(ctx: MyContext) {
    if (ctx.session.activeForm !== 'zamer') {
      return;
    }

    if (!ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text;

    if (ctx.session.step?.startsWith('waiting_for_phone_')) {
      if (!ctx.session.answers) ctx.session.answers = {};
      ctx.session.answers[-1] = text;

      await this.sendSummary(ctx, true);
    } else if (ctx.session.step?.startsWith('waiting_phone_')) {
      const currentOrder = ctx.session.currentQuestionOrder;

      if (!ctx.session.answers) ctx.session.answers = {};
      ctx.session.answers[currentOrder!] = text;

      const nextOrder = currentOrder! + 1;
      await this.askQuestion(ctx, nextOrder);
    } else if (ctx.session.step?.startsWith('waiting_text_')) {
      const currentOrder = ctx.session.currentQuestionOrder;

      if (!ctx.session.answers) ctx.session.answers = {};
      ctx.session.answers[currentOrder!] = text;

      const nextOrder = currentOrder! + 1;
      await this.askQuestion(ctx, nextOrder);
    }
  }
}
