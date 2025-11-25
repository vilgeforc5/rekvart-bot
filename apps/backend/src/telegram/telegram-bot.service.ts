import { Injectable, OnModuleInit } from '@nestjs/common';
import { Action, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotCommandService } from '../command/commands.service';
import { TopicChatService } from './topic-chat.service';

@Update()
@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor(
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
  }

  @Action(/start_dialog:(.+)/)
  async onStartDialog(ctx: Context) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const topicId = parseInt(ctx.callbackQuery.data.split(':')[1]);

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
      ],
    });
  }

  @Action(/stop_dialog:(.+)/)
  async onStopDialog(ctx: Context) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const topicId = parseInt(ctx.callbackQuery.data.split(':')[1]);

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
}
