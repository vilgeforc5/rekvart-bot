import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { PrismaService } from 'src/prisma.service';
import { TopicContentService } from 'src/topic-content/topic-content.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class TopicChatService {
  private readonly NOTIFICATION_GROUP_CHAT_ID =
    process.env.TELEGRAM_NOTIFICATION_GROUP_ID;

  constructor(
    private prisma: PrismaService,
    private topicContentService: TopicContentService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async forwardUserMessageToTopic(
    userChatId: string,
    messageId: number,
  ): Promise<boolean> {
    const connection = await this.prisma.topicConnection.findFirst({
      where: { userChatId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!connection || !this.NOTIFICATION_GROUP_CHAT_ID) {
      return false;
    }

    try {
      await this.bot.telegram.copyMessage(
        this.NOTIFICATION_GROUP_CHAT_ID,
        userChatId,
        messageId,
        {
          message_thread_id: connection.topicId,
        },
      );
      return true;
    } catch (error) {
      console.error('Failed to forward user message to topic:', error);
      return false;
    }
  }

  async forwardTopicMessageToUser(
    topicId: number,
    messageId: number,
    sourceChatId: string,
  ) {
    const connection = await this.prisma.topicConnection.findFirst({
      where: { topicId, isActive: true },
    });

    if (!connection) {
      return;
    }

    try {
      await this.bot.telegram.copyMessage(
        connection.userChatId,
        sourceChatId,
        messageId,
      );
    } catch (error) {
      console.error('Failed to forward topic message to user:', error);
    }
  }

  async startDialog(topicId: number) {
    const connection = await this.prisma.topicConnection.findUnique({
      where: { topicId },
    });

    if (!connection || !this.NOTIFICATION_GROUP_CHAT_ID) {
      return;
    }

    const otherActiveTopics = await this.prisma.topicConnection.findMany({
      where: {
        userChatId: connection.userChatId,
        topicId: { not: topicId },
        isActive: true,
      },
    });

    for (const topic of otherActiveTopics) {
      try {
        await this.stopDialogInternal(topic.topicId);
      } catch (error) {
        console.error('Failed to stop dialog:', error);
      }
    }

    await this.prisma.topicConnection.update({
      where: { id: connection.id },
      data: { isActive: true, updatedAt: new Date() },
    });

    try {
      await this.bot.telegram.editForumTopic(
        this.NOTIFICATION_GROUP_CHAT_ID,
        topicId,
        {
          name: `🟢 ${connection.topicName}`,
        },
      );
    } catch (error) {
      console.error('Failed to update topic name:', error);
    }

    const topicContent = await this.topicContentService.get();
    const message =
      topicContent?.operatorConnectedMessage ||
      '👋 Здравствуйте! К вам подключился оператор. Сейчас я отвечу на все ваши вопросы.';

    try {
      await this.bot.telegram.sendMessage(connection.userChatId, message);
    } catch (error) {
      console.error('Failed to send start dialog message to user:', error);
    }
  }

  private async stopDialogInternal(topicId: number) {
    const connection = await this.prisma.topicConnection.findUnique({
      where: { topicId },
    });

    if (!connection || !this.NOTIFICATION_GROUP_CHAT_ID) {
      return;
    }

    await this.prisma.topicConnection.update({
      where: { id: connection.id },
      data: { isActive: false, updatedAt: new Date() },
    });

    try {
      await this.bot.telegram.editForumTopic(
        this.NOTIFICATION_GROUP_CHAT_ID,
        topicId,
        {
          name: connection.topicName.replace('🟢 ', ''),
        },
      );
    } catch (error) {
      console.error('Failed to update topic name:', error);
    }
  }

  async stopDialog(topicId: number) {
    await this.stopDialogInternal(topicId);

    const connection = await this.prisma.topicConnection.findUnique({
      where: { topicId },
    });

    if (!connection) {
      return;
    }

    const topicContent = await this.topicContentService.get();
    const message =
      topicContent?.operatorDisconnectedMessage ||
      '👋 Оператор отключился от диалога.';

    try {
      await this.bot.telegram.sendMessage(connection.userChatId, message);
    } catch (error) {
      console.error('Failed to send stop dialog message to user:', error);
    }
  }
}
