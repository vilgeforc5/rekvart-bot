import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectBot } from 'nestjs-telegraf';
import { TelegramUser } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma.service';
import { Markup, Telegraf } from 'telegraf';

@Injectable()
export class FormSubmissionService {
  private readonly NOTIFICATION_GROUP_CHAT_ID =
    process.env.TELEGRAM_NOTIFICATION_GROUP_ID;

  constructor(
    @InjectPinoLogger(FormSubmissionService.name)
    private readonly logger: PinoLogger,
    private prisma: PrismaService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async handleSubmission(commandName: string, data: object, chatId?: string) {
    const entries = Object.entries(data);

    if (!chatId) {
      this.logger.warn(
        { commandName, data },
        'No chatId provided for form submission',
      );
      return;
    }

    if (entries.length === 0) {
      this.logger.warn({ commandName, data, chatId }, 'Empty form submitted');
      return;
    }

    this.logger.info(
      { commandName, chatId, dataKeys: Object.keys(data) },
      'Processing form submission',
    );

    try {
      const user = await this.prisma.telegramUser.findUnique({
        where: { chatId },
      });

      if (user) {
        const submission = await this.prisma.formSubmission.create({
          data: {
            commandName,
            data,
            telegramUserId: user.id,
          },
        });

        this.logger.info(
          { submissionId: submission.id, userId: user.id, commandName },
          'Form submission saved to database',
        );

        await this.createTopicAndNotify(commandName, data, chatId, user);
      } else {
        this.logger.warn(
          { chatId, commandName },
          'User not found for form submission',
        );
      }
    } catch (error) {
      this.logger.error(
        { error, commandName, chatId },
        'Failed to save form submission',
      );
    }
  }

  private async createTopicAndNotify(
    commandName: string,
    data: object,
    chatId: string,
    user: TelegramUser,
  ) {
    if (!this.NOTIFICATION_GROUP_CHAT_ID) {
      this.logger.warn('TELEGRAM_NOTIFICATION_GROUP_ID not configured');
      return;
    }

    try {
      const topicName = this.generateTopicName(user);

      this.logger.debug(
        { topicName, chatId, commandName },
        'Creating forum topic for notification',
      );

      const topic = await this.bot.telegram.createForumTopic(
        this.NOTIFICATION_GROUP_CHAT_ID,
        topicName,
      );

      const connection = await this.prisma.topicConnection.create({
        data: {
          topicName,
          userChatId: chatId,
          topicId: topic.message_thread_id,
          isActive: false,
          telegramUserId: user.id,
        },
      });

      this.logger.info(
        {
          connectionId: connection.id,
          topicId: topic.message_thread_id,
          chatId,
        },
        'Topic connection created in database',
      );

      const message = this.buildNotificationMessage(
        commandName,
        data,
        chatId,
        user,
      );

      await this.bot.telegram.sendMessage(
        this.NOTIFICATION_GROUP_CHAT_ID,
        message,
        {
          message_thread_id: topic.message_thread_id,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                Markup.button.callback(
                  '✅ Начать диалог',
                  `start_dialog:${topic.message_thread_id}`,
                ),
                // Markup.button.callback(
                //   '❌ Прервать диалог',
                //   `stop_dialog:${topic.message_thread_id}`,
                // ),
              ],
            ],
          },
        },
      );

      this.logger.info(
        { topicId: topic.message_thread_id, commandName },
        'Notification sent to forum topic',
      );
    } catch (error) {
      this.logger.error(
        { error, commandName, chatId },
        'Failed to create topic and send notification',
      );
    }
  }

  private generateTopicName(user: TelegramUser): string {
    const now = new Date();
    const moscowTime = now.toLocaleString('en-GB', {
      timeZone: 'Europe/Moscow',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const [datePart, timePart] = moscowTime.split(', ');
    const [day, month] = datePart.split(' ');
    const userName = user.firstName || 'User';

    return `${userName} - ${day} ${month} - ${timePart}`;
  }

  private buildNotificationMessage(
    commandName: string,
    data: object,
    chatId: string,
    user: TelegramUser,
  ): string {
    const entries = Object.entries(data);
    let message = `🔔 <b>Новая заявка: ${commandName.toUpperCase()}</b>\n\n`;

    message += `👤 <b>Информация о пользователе:</b>\n`;
    message += `  • Chat ID: <code>${chatId}</code>\n`;
    if (user.firstName) message += `  • Name: ${user.firstName}`;
    if (user.lastName) message += ` ${user.lastName}`;
    if (user.firstName || user.lastName) message += '\n';
    if (user.username) message += `  • Username: @${user.username}\n`;
    message += '\n';

    message += `📝 <b>Данные заявки:</b>\n`;
    if (entries.length > 0) {
      entries.forEach(([key, value]) => {
        const label = this.getFieldLabel(key);
        message += `  ${label}: ${value}\n`;
      });
    } else {
      message += '  (нет данных)\n';
    }

    return message;
  }

  private getFieldLabel(key: string): string {
    if (key === 'phone') return '📞 Телефон';
    if (key === '-1') return '📞 Телефон';
    const questionNum = parseInt(key);
    if (!isNaN(questionNum) && questionNum > 0) {
      return `❓ Вопрос ${questionNum}`;
    }
    return `🔹 ${key.charAt(0).toUpperCase() + key.slice(1)}`;
  }
}
