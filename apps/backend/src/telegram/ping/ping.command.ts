import { Command, Ctx, Update } from 'nestjs-telegraf';
import { HealthService } from 'src/health/health.service';
import { Context } from 'telegraf';

@Update()
export class PingCommand {
  constructor(private healthService: HealthService) {}

  @Command('ping')
  async onPing(@Ctx() ctx: Context) {
    const healthCheck = await this.healthService.check();
    const statusEmoji = healthCheck.status === 'ok' ? '✅' : '❌';
    const dbEmoji = healthCheck.checks.database.status === 'ok' ? '✅' : '❌';
    const botEmoji = healthCheck.checks.bot.status === 'ok' ? '✅' : '❌';

    const dbStatus =
      healthCheck.checks.database.status === 'ok' ? 'ОК' : 'ОШИБКА';
    const botStatus = healthCheck.checks.bot.status === 'ok' ? 'ОК' : 'ОШИБКА';

    const message = `${dbEmoji} <b>База данных:</b> ${dbStatus}\n${healthCheck.checks.database.message}\n\n${botEmoji} <b>Telegram бот:</b> ${botStatus}\n${healthCheck.checks.bot.message}`;

    await ctx.reply(message, { parse_mode: 'HTML' });
  }
}
