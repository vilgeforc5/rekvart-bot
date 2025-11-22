import { Action, Command, Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

const remont_variants = [
  'Квартира под ключ',
  'Загородный дом под ключ',
  'Танхаус под ключ',
  'Частичный ремонт (1-2 комнаты)',
  'Саунузел',
];

const location_variants = [
  'Внутри МКАД',
  'До 20 км',
  '20-40 км',
  'Дальше 40 км',
];

const contact_variants = ['Telegram', 'WhatsApp', 'Звонок по телефону'];

interface SessionData {
  step?: string;
  remontType?: string;
  location?: string;
  area?: string;
  contact?: string;
  phone?: string;
}

interface MyContext extends Context {
  session: SessionData;
}

@Update()
export class ZamerCommand {
  constructor() {}

  private async sendSummary(ctx: MyContext, includePhone: boolean = false) {
    await ctx.reply('✅ Спасибо! Мы свяжемся с вами в ближайшее время', {
      reply_markup: includePhone ? { remove_keyboard: true } : undefined,
    });

    ctx.session = {};
  }

  @Command('zamer')
  async onZamer(@Ctx() ctx: MyContext) {
    ctx.session.step = 'select_remont_type';
    await this.start(ctx);
  }

  @Action('zamer')
  async onZamerAction(@Ctx() ctx: MyContext) {
    ctx.session.step = 'select_remont_type';
    await this.start(ctx);
    await ctx.answerCbQuery();
  }

  private async start(ctx: Context) {
    await ctx.reply('Где планируется ремонт?', {
      reply_markup: {
        inline_keyboard: remont_variants.map((variant, index) => [
          {
            text: variant,
            callback_data: `zamer_step2:${index}`,
          },
        ]),
      },
    });
  }

  @Action(/zamer_step2:(.+)/)
  async onZamerStep2(@Ctx() ctx: MyContext & { match: RegExpMatchArray }) {
    const idx = parseInt(ctx.match[1]);
    ctx.session.remontType = remont_variants[idx];
    ctx.session.step = 'select_location';

    await ctx.answerCbQuery();
    await ctx.reply(`Где находится ваш объект?`, {
      reply_markup: {
        inline_keyboard: location_variants.map((variant, index) => [
          {
            text: variant,
            callback_data: `zamer_step3:${index}`,
          },
        ]),
      },
    });
  }

  @Action(/zamer_step3:(.+)/)
  async onZamerStep3(@Ctx() ctx: MyContext & { match: RegExpMatchArray }) {
    const idx = parseInt(ctx.match[1]);
    ctx.session.location = location_variants[idx];
    ctx.session.step = 'waiting_for_area';

    await ctx.answerCbQuery();
    await ctx.reply(`Метраж помещения (м2)?\n\nПожалуйста, введите число.`);
  }

  @On('text')
  async onText(@Ctx() ctx: MyContext) {
    if (!ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text;

    if (ctx.session.step === 'waiting_for_area') {
      const area = parseFloat(text.replace(',', '.'));

      if (isNaN(area) || area <= 0) {
        await ctx.reply(
          'Пожалуйста, введите корректное число.\n\nНапример: 50 или 75.5',
        );
        return;
      }

      ctx.session.area = area.toString();

      await ctx.reply('Выберите предпочитаемый способ связи', {
        reply_markup: {
          inline_keyboard: contact_variants.map((variant, index) => [
            {
              text: variant,
              callback_data: `zamer_step4:${index}`,
            },
          ]),
        },
      });
    }
  }

  @Action(/zamer_step4:(.+)/)
  async onZamerStep4(@Ctx() ctx: MyContext & { match: RegExpMatchArray }) {
    const idx = parseInt(ctx.match[1]);
    ctx.session.contact = contact_variants[idx];

    await ctx.answerCbQuery();

    if (
      ctx.session.contact === 'Звонок по телефону' ||
      ctx.session.contact === 'WhatsApp'
    ) {
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
    } else {
      await this.sendSummary(ctx);
    }
  }

  @On('contact')
  async onContact(@Ctx() ctx: MyContext) {
    if (!ctx.message || !('contact' in ctx.message)) return;

    if (ctx.session.step === 'waiting_for_phone') {
      const contact = ctx.message.contact;
      ctx.session.phone = contact.phone_number;

      await this.sendSummary(ctx, true);
    }
  }
}
