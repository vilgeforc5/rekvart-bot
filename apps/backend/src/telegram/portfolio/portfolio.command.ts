import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { PortfolioTelegramService } from './portfolio.service';

interface SessionData {
  currentPortfolioIndex?: number;
}

interface MyContext extends Context {
  session: SessionData;
}

@Update()
export class PortfolioCommand {
  constructor(private readonly portfolioService: PortfolioTelegramService) {}

  @Command('portfolio')
  async onPortfolio(@Ctx() ctx: MyContext) {
    const portfolioItems = await this.portfolioService.getAllPortfolioItems();

    if (!portfolioItems || portfolioItems.length === 0) {
      await ctx.reply('Портфолио пусто');
      return;
    }

    ctx.session.currentPortfolioIndex = 0;
    await this.showPortfolioItem(ctx, portfolioItems, 0, false);
  }

  @Action('portfolio')
  async onPortfolioAction(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();

    const portfolioItems = await this.portfolioService.getAllPortfolioItems();

    if (!portfolioItems || portfolioItems.length === 0) {
      await ctx.reply('Портфолио пусто');
      return;
    }

    ctx.session.currentPortfolioIndex = 0;
    await this.showPortfolioItem(ctx, portfolioItems, 0, false);
  }

  @Action(/portfolio_nav:(\d+)/)
  async onNavigate(@Ctx() ctx: MyContext & { match: RegExpMatchArray }) {
    const index = parseInt(ctx.match[1]);
    const portfolioItems = await this.portfolioService.getAllPortfolioItems();

    if (!portfolioItems || portfolioItems.length === 0) {
      await ctx.answerCbQuery('Портфолио пусто');
      return;
    }

    if (index < 0 || index >= portfolioItems.length) {
      await ctx.answerCbQuery();
      return;
    }

    ctx.session.currentPortfolioIndex = index;
    await this.showPortfolioItem(ctx, portfolioItems, index, true);
    await ctx.answerCbQuery();
  }

  private async showPortfolioItem(
    ctx: MyContext,
    portfolioItems: any[],
    index: number,
    shouldDeletePrevious: boolean = false,
  ) {
    const item = portfolioItems[index];
    const totalItems = portfolioItems.length;

    let caption = `${item.title}\n\n`;
    if (item.description) {
      caption += `${item.description}\n\n`;
    }

    const prevIndex = index > 0 ? index - 1 : totalItems - 1;
    const nextIndex = index < totalItems - 1 ? index + 1 : 0;

    const navigationButtons = [
      {
        text: '⬅️ Назад',
        callback_data: `portfolio_nav:${prevIndex}`,
      },
      {
        text: 'Вперёд ➡️',
        callback_data: `portfolio_nav:${nextIndex}`,
      },
    ];

    const keyboard = {
      inline_keyboard: [navigationButtons],
    };

    if (item.imgSrc && item.imgSrc.length > 0) {
      if (item.imgSrc.length === 1) {
        if (
          shouldDeletePrevious &&
          ctx.callbackQuery &&
          'message' in ctx.callbackQuery
        ) {
          try {
            await ctx.deleteMessage();
          } catch (e) {}
        }

        await ctx.replyWithPhoto(item.imgSrc[0], {
          caption,
          reply_markup: keyboard,
        });
      } else {
        const mediaGroup = item.imgSrc
          .slice(0, 10)
          .map((url: string, i: number) => ({
            type: 'photo' as const,
            media: url,
            caption: i === 0 ? caption : undefined,
          }));

        if (
          shouldDeletePrevious &&
          ctx.callbackQuery &&
          'message' in ctx.callbackQuery
        ) {
          try {
            await ctx.deleteMessage();
          } catch (e) {}
        }

        await ctx.replyWithMediaGroup(mediaGroup);

        await ctx.reply('Навигация:', { reply_markup: keyboard });
      }
    } else {
      if (ctx.callbackQuery && 'message' in ctx.callbackQuery) {
        try {
          await ctx.editMessageText(caption, { reply_markup: keyboard });
        } catch (e) {
          await ctx.reply(caption, { reply_markup: keyboard });
        }
      } else {
        await ctx.reply(caption, { reply_markup: keyboard });
      }
    }
  }
}
