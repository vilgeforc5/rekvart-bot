import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { TelegramUser } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma.service';
import { Markup, Telegraf } from 'telegraf';

@Injectable()
export class FormSubmissionService {
  private readonly NOTIFICATION_GROUP_CHAT_ID =
    process.env.TELEGRAM_NOTIFICATION_GROUP_ID;

  constructor(
    private prisma: PrismaService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async handleSubmission(commandName: string, data: object, chatId?: string) {
    const entries = Object.entries(data);

    if (!chatId) {
      console.warn('No chatId provided', { commandName, data });
      return;
    }

    if (entries.length === 0) {
      console.warn('Empty form submitted', { commandName, data, chatId });

      return;
    }

    try {
      const user = await this.prisma.telegramUser.findUnique({
        where: { chatId },
      });

      if (user) {
        await this.prisma.formSubmission.create({
          data: {
            commandName,
            data,
            telegramUserId: user.id,
          },
        });

        await this.createTopicAndNotify(commandName, data, chatId, user);
      }
    } catch (error) {
      console.error(' Failed to save form submission:', error);
    }
  }

  private async createTopicAndNotify(
    commandName: string,
    data: object,
    chatId: string,
    user: TelegramUser,
  ) {
    if (!this.NOTIFICATION_GROUP_CHAT_ID) {
      console.log('⚠️  TELEGRAM_NOTIFICATION_GROUP_ID not configured');
      return;
    }

    try {
      const topicName = this.generateTopicName(user);

      const topic = await this.bot.telegram.createForumTopic(
        this.NOTIFICATION_GROUP_CHAT_ID,
        topicName,
      );

      await this.prisma.topicConnection.create({
        data: {
          topicName,
          userChatId: chatId,
          topicId: topic.message_thread_id,
          isActive: false,
        },
      });

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
                Markup.button.callback(
                  '❌ Прервать диалог',
                  `stop_dialog:${topic.message_thread_id}`,
                ),
              ],
            ],
          },
        },
      );
    } catch (error) {
      console.error('Failed to create topic and send notification:', error);
    }
  }

  private generateTopicName(user: TelegramUser): string {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('en', { month: 'short' });
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const userName = user.firstName || 'User';
    return `${userName} - ${day} ${month} - ${hours}:${minutes}`;
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
    if (key === '-1') return '📞 Телефон';
    const questionNum = parseInt(key);
    if (!isNaN(questionNum) && questionNum > 0) {
      return `❓ Вопрос ${questionNum}`;
    }
    return `🔹 ${key}`;
  }
}
