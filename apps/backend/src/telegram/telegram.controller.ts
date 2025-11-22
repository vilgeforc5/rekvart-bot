import { chunk } from 'es-toolkit';
import { Command, Ctx, On, Update } from 'nestjs-telegraf';
import { BotCommandService } from 'src/command/commands.service';
import { StartContentService } from 'src/start-content/start-content.service';
import { CalculateCommand } from 'src/telegram/calculate/calculate.command';
import { ConsultacyaCommand } from 'src/telegram/consultacya/consultacya.command';
import { ZamerCommand } from 'src/telegram/zamer/zamer.command';
import { Context } from 'telegraf';
import { CalculateService } from './calculate/calculate.service';
import { ConsultacyaService } from './consultacya/consultacya.service';
import { DizaynCommand } from './dizayn/dizayn.command';
import { PingCommand } from './ping/ping.command';
import { PortfolioCommand } from './portfolio/portfolio.command';
import { ZamerService } from './zamer/zamer.service';

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
export class TelegramController {
  constructor(
    private botCommandService: BotCommandService,
    private startContentService: StartContentService,
    private calculateCommand: CalculateCommand,
    private calculateService: CalculateService,
    private zamerCommand: ZamerCommand,
    private zamerService: ZamerService,
    private consultacyaCommand: ConsultacyaCommand,
    private consultacyaService: ConsultacyaService,
    private portfolioCommand: PortfolioCommand,
    private pingCommand: PingCommand,
    private dizaynCommand: DizaynCommand,
  ) {}

  @Command('start')
  async onStart(@Ctx() ctx: Context) {
    const startContent = await this.startContentService.get();

    if (!startContent) {
      return;
    }

    const commands = await this.botCommandService.findAll();

    const chunkedCommands = chunk(commands, 2);

    const keyboard = {
      inline_keyboard: chunkedCommands.map((chunk) =>
        chunk.map((cmd) => ({
          text: cmd.title,
          callback_data: cmd.command,
        })),
      ),
    };

    const message = await ctx.reply(startContent.content, {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    });

    try {
      await ctx.pinChatMessage(message.message_id, {
        disable_notification: true,
      });
    } catch (error) {
      console.error('Failed to pin message:', error);
    }
  }

  @On('text')
  async onText(@Ctx() ctx: MyContext) {
    if (!ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text;

    if (text.startsWith('/')) {
      ctx.session = {};

      const command = text.split(' ')[0].substring(1);

      switch (command) {
        case 'calculate':
          ctx.session = {
            currentQuestionOrder: 1,
            answers: {},
            activeForm: 'calculate',
          };
          await this.calculateCommand.askQuestion(ctx, 1);
          break;
        case 'zamer':
          ctx.session = {
            currentQuestionOrder: 1,
            answers: {},
            activeForm: 'zamer',
          };
          await this.zamerCommand.askQuestion(ctx, 1);
          break;
        case 'consultacya':
          ctx.session = {
            currentQuestionOrder: 1,
            answers: {},
            activeForm: 'consultacya',
          };
          await this.consultacyaCommand.askQuestion(ctx, 1);
          break;
        case 'portfolio':
          await this.portfolioCommand.onPortfolio(ctx as any);
          break;
        case 'ping':
          await this.pingCommand.onPing(ctx);
          break;
        case 'dizayn':
          await this.dizaynCommand.onDizayn(ctx);
          break;
      }
      return;
    }

    const activeForm = ctx.session.activeForm;

    if (!activeForm) {
      return;
    }

    switch (activeForm) {
      case 'calculate':
        await this.handleCalculateText(ctx, text);
        break;
      case 'zamer':
        await this.handleZamerText(ctx, text);
        break;
      case 'consultacya':
        await this.handleConsultacyaText(ctx, text);
        break;
    }
  }

  private async handleCalculateText(ctx: MyContext, text: string) {
    const currentOrder = ctx.session.currentQuestionOrder;

    if (!currentOrder || !ctx.session.step?.startsWith('waiting_text_')) {
      return;
    }

    const question = await this.calculateService.getQuestion(currentOrder);
    if (!question || question.type !== 'text') {
      return;
    }

    if (!ctx.session.answers) ctx.session.answers = {};
    ctx.session.answers[currentOrder] = text;

    const nextOrder = currentOrder + 1;
    await this.calculateCommand.askQuestion(ctx, nextOrder);
  }

  private async handleZamerText(ctx: MyContext, text: string) {
    if (ctx.session.step?.startsWith('waiting_text_')) {
      const currentOrder = ctx.session.currentQuestionOrder;

      if (!ctx.session.answers) ctx.session.answers = {};
      ctx.session.answers[currentOrder!] = text;

      const nextOrder = currentOrder! + 1;
      await this.zamerCommand.askQuestion(ctx, nextOrder);
    }
  }

  private async handleConsultacyaText(ctx: MyContext, text: string) {
    const currentOrder = ctx.session.currentQuestionOrder;

    if (!currentOrder || !ctx.session.step?.startsWith('waiting_text_')) {
      return;
    }

    const question = await this.consultacyaService.getQuestion(currentOrder);
    if (!question || question.type !== 'text') {
      return;
    }

    if (!ctx.session.answers) ctx.session.answers = {};
    ctx.session.answers[currentOrder] = text;

    const nextOrder = currentOrder + 1;
    await this.consultacyaCommand.askQuestion(ctx, nextOrder);
  }

  @On('contact')
  async onContact(@Ctx() ctx: MyContext) {
    const activeForm = ctx.session.activeForm;
    if (!activeForm) return;

    switch (activeForm) {
      case 'calculate':
        await this.calculateCommand.onContact(ctx);
        break;
      case 'zamer':
        await this.zamerCommand.onContact(ctx);
        break;
      case 'consultacya':
        await this.consultacyaCommand.onContact(ctx);
        break;
    }
  }
}
