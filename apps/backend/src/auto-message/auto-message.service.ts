import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectBot } from 'nestjs-telegraf';
import { PrismaService } from 'src/prisma.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class AutoMessageService implements OnModuleInit {
  constructor(
    @InjectPinoLogger(AutoMessageService.name)
    private readonly logger: PinoLogger,
    private prisma: PrismaService,
    @InjectBot() private readonly bot: Telegraf,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    await this.initializeCronJob();
  }

  private async initializeCronJob() {
    const config = await this.prisma.autoMessageConfig.findUnique({
      where: { id: 1 },
    });

    if (!config) {
      this.logger.warn(
        'No auto message config found, skipping cron job initialization',
      );
      return;
    }

    this.updateCronJob(config.scheduleHour, config.scheduleMinute);
  }

  private updateCronJob(hour: number, minute: number) {
    const jobName = 'auto-message';

    try {
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        this.schedulerRegistry.deleteCronJob(jobName);
        this.logger.info('Deleted existing auto-message cron job');
      }
    } catch (error) {
      this.logger.debug('No existing cron job to delete');
    }

    const cronExpression = `${minute} ${hour} * * *`;

    const job = new CronJob(
      cronExpression,
      () => {
        this.sendAutoMessages().catch((error) => {
          this.logger.error({ error }, 'Failed to send auto messages');
        });
      },
      null,
      true,
      'Europe/Moscow',
    );

    this.schedulerRegistry.addCronJob(jobName, job);
    this.logger.info(
      { hour, minute, cronExpression },
      'Auto-message cron job scheduled',
    );
  }

  async sendAutoMessages() {
    this.logger.info('Starting auto message broadcast');

    const config = await this.prisma.autoMessageConfig.findUnique({
      where: { id: 1 },
    });

    if (!config) {
      this.logger.warn('No auto message config found');
      return { sent: 0, failed: 0, unsubscribeShown: 0 };
    }

    const connections = await this.prisma.topicConnection.findMany({
      where: {
        isActive: true,
        lastAdminMessageText: { not: null },
        telegramUser: {
          isSubscribedToAutomessage: true,
        },
      },
      include: {
        telegramUser: true,
      },
    });

    if (connections.length === 0) {
      this.logger.info('No active connections with saved messages found');
      return { sent: 0, failed: 0, unsubscribeShown: 0 };
    }

    let sent = 0;
    let failed = 0;
    let unsubscribeShown = 0;

    for (const connection of connections) {
      if (!connection.lastAdminMessageText) continue;

      try {
        await this.bot.telegram.sendMessage(
          connection.userChatId,
          connection.lastAdminMessageText,
        );

        let user = connection.telegramUser;

        if (!user) {
          user = await this.prisma.telegramUser.findUnique({
            where: { chatId: connection.userChatId },
          });

          if (user && !connection.telegramUserId) {
            await this.prisma.topicConnection.update({
              where: { id: connection.id },
              data: { telegramUserId: user.id },
            });
          }
        }

        if (user) {
          const newCount = user.autoMessageCount + 1;

          await this.prisma.telegramUser.update({
            where: { id: user.id },
            data: { autoMessageCount: newCount },
          });

          if (newCount > 0 && newCount % 5 === 0) {
            await this.bot.telegram.sendMessage(
              connection.userChatId,
              config.notificationText,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: config.unsubscribeButtonText,
                        callback_data: 'unsubscribe_automessage',
                      },
                    ],
                  ],
                },
              },
            );
            unsubscribeShown++;
          }
        }

        sent++;
        this.logger.debug(
          { userChatId: connection.userChatId },
          'Auto message sent',
        );
      } catch (error) {
        failed++;
        this.logger.error(
          { error, userChatId: connection.userChatId },
          'Failed to send auto message',
        );
      }
    }

    await this.prisma.autoMessageConfig.update({
      where: { id: 1 },
      data: { lastSentAt: new Date() },
    });

    this.logger.info(
      { sent, failed, unsubscribeShown, total: connections.length },
      'Auto message broadcast completed',
    );

    return { sent, failed, unsubscribeShown };
  }

  async getConfig() {
    return this.prisma.autoMessageConfig.findUnique({
      where: { id: 1 },
    });
  }

  async updateConfig(
    scheduleHour: number,
    scheduleMinute: number,
    texts?: {
      notificationText?: string;
      unsubscribeButtonText?: string;
      unsubscribeSuccessText?: string;
      resubscribeSuccessText?: string;
      resubscribeButtonText?: string;
      unsubscribeToggleText?: string;
      errorText?: string;
    },
  ) {
    const updateData: any = {
      scheduleHour,
      scheduleMinute,
    };

    if (texts) {
      Object.assign(updateData, texts);
    }

    const config = await this.prisma.autoMessageConfig.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        ...updateData,
      },
      update: updateData,
    });

    this.updateCronJob(scheduleHour, scheduleMinute);

    this.logger.info(
      { scheduleHour, scheduleMinute, texts },
      'Auto message config updated',
    );

    return config;
  }
}
