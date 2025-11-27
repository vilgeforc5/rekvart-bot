import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Action, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotCommandService } from '../command/commands.service';
import { TopicChatService } from './topic-chat.service';

@Update()
@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor(
    @InjectPinoLogger(TelegramBotService.name)
    private readonly logger: PinoLogger,
    @InjectBot() private readonly bot: Telegraf,
    private readonly botCommandService: BotCommandService,
    private readonly topicChatService: TopicChatService,
  ) {}

  async onModuleInit() {
    await this.setBotCommands();
  }

  async setBotCommands() {
    const commands = await this.botCommandService.findAll();
    const botCommands = commands
      .filter(
        (cmd) => cmd.description != null && cmd.description.trim().length > 0,
      )
      .map((cmd) => ({
        command: cmd.command,
        description: cmd.description!,
      }));

    await this.bot.telegram.setMyCommands(botCommands);
    this.logger.info(
      { commandCount: botCommands.length },
      'Bot commands set successfully',
    );
  }

  @Action(/start_dialog:(.+)/)
  async onStartDialog(ctx: Context) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const topicId = parseInt(ctx.callbackQuery.data.split(':')[1]);

    this.logger.info(
      { topicId, userId: ctx.from?.id },
      'Operator starting dialog',
    );

    await this.topicChatService.startDialog(topicId);

    await ctx.answerCbQuery('✅ Диалог начат');
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: '❌ Прервать диалог',
            callback_data: `stop_dialog:${topicId}`,
          },
        ],
        [
          {
            text: '🔇 Прервать диалог (тихо)',
            callback_data: `stop_dialog_silent:${topicId}`,
          },
        ],
      ],
    });
  }

  @Action(/stop_dialog:(.+)/)
  async onStopDialog(ctx: Context) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const topicId = parseInt(ctx.callbackQuery.data.split(':')[1]);

    this.logger.info(
      { topicId, userId: ctx.from?.id },
      'Operator stopping dialog',
    );

    await this.topicChatService.stopDialog(topicId);

    await ctx.answerCbQuery('❌ Диалог прерван');
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: '✅ Начать диалог',
            callback_data: `start_dialog:${topicId}`,
          },
        ],
      ],
    });
  }

  @Action(/stop_dialog_silent:(.+)/)
  async onStopDialogSilent(ctx: Context) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const topicId = parseInt(ctx.callbackQuery.data.split(':')[1]);

    this.logger.info(
      { topicId, userId: ctx.from?.id },
      'Operator stopping dialog silently',
    );

    await this.topicChatService.stopDialogSilent(topicId);

    await ctx.answerCbQuery('🔇 Диалог прерван (без уведомления)');
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: '✅ Начать диалог',
            callback_data: `start_dialog:${topicId}`,
          },
        ],
      ],
    });
  }
}
