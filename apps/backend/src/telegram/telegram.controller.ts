import { chunk } from 'es-toolkit';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { BotCommandService } from 'src/command/commands.service';
import { StartContentService } from 'src/start-content/start-content.service';
import { Context } from 'telegraf';

@Update()
export class TelegramController {
  constructor(
    private botCommandService: BotCommandService,
    private startContentService: StartContentService,
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

    await ctx.reply(startContent.content, {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    });
  }
}
