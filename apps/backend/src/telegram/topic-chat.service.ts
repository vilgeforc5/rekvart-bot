import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectBot } from 'nestjs-telegraf';
import { PrismaService } from 'src/prisma.service';
import { TopicContentService } from 'src/topic-content/topic-content.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class TopicChatService {
  private readonly NOTIFICATION_GROUP_CHAT_ID =
    process.env.TELEGRAM_NOTIFICATION_GROUP_ID;

  constructor(
    @InjectPinoLogger(TopicChatService.name)
    private readonly logger: PinoLogger,
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
      this.logger.debug(
        { userChatId, hasConnection: !!connection },
        'No active topic connection found for user message forwarding',
      );
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
      this.logger.debug(
        { userChatId, messageId, topicId: connection.topicId },
        'User message forwarded to topic',
      );
      return true;
    } catch (error) {
      this.logger.error(
        { error, userChatId, messageId, topicId: connection.topicId },
        'Failed to forward user message to topic',
      );
      return false;
    }
  }

  async forwardTopicMessageToUser(
    topicId: number,
    messageId: number,
    sourceChatId: string,
    messageText?: string,
  ) {
    const connection = await this.prisma.topicConnection.findFirst({
      where: { topicId, isActive: true },
    });

    if (!connection) {
      this.logger.debug(
        { topicId },
        'No active connection found for topic message forwarding',
      );
      return;
    }

    try {
      await this.bot.telegram.copyMessage(
        connection.userChatId,
        sourceChatId,
        messageId,
      );

      if (messageText) {
        await this.prisma.topicConnection.update({
          where: { id: connection.id },
          data: { lastAdminMessageText: messageText },
        });
        this.logger.debug(
          { topicId, messageText: messageText.substring(0, 50) },
          'Admin message text saved',
        );
      }

      this.logger.debug(
        { topicId, messageId, userChatId: connection.userChatId },
        'Topic message forwarded to user',
      );
    } catch (error) {
      this.logger.error(
        { error, topicId, messageId, userChatId: connection.userChatId },
        'Failed to forward topic message to user',
      );
    }
  }

  async startDialog(topicId: number) {
    const connection = await this.prisma.topicConnection.findUnique({
      where: { topicId },
    });

    if (!connection || !this.NOTIFICATION_GROUP_CHAT_ID) {
      this.logger.warn(
        { topicId },
        'Cannot start dialog: connection not found or group ID not configured',
      );
      return;
    }

    this.logger.info(
      { topicId, userChatId: connection.userChatId },
      'Starting dialog with user',
    );

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
        this.logger.debug(
          { topicId: topic.topicId },
          'Stopped other active topic for user',
        );
      } catch (error) {
        this.logger.error(
          { error, topicId: topic.topicId },
          'Failed to stop other dialog',
        );
      }
    }

    await this.prisma.topicConnection.update({
      where: { id: connection.id },
      data: { isActive: true, updatedAt: new Date() },
    });

    this.logger.info(
      { connectionId: connection.id, topicId },
      'Dialog connection activated in database',
    );

    try {
      await this.bot.telegram.editForumTopic(
        this.NOTIFICATION_GROUP_CHAT_ID,
        topicId,
        {
          name: `🟢 ${connection.topicName}`,
        },
      );
      this.logger.debug(
        { topicId },
        'Topic name updated with active indicator',
      );
    } catch (error) {
      this.logger.error({ error, topicId }, 'Failed to update topic name');
    }

    const topicContent = await this.topicContentService.get();
    const message =
      topicContent?.operatorConnectedMessage ||
      '👋 Здравствуйте! К вам подключился оператор. Сейчас я отвечу на все ваши вопросы.';

    try {
      await this.bot.telegram.sendMessage(connection.userChatId, message);
      this.logger.info(
        { userChatId: connection.userChatId, topicId },
        'Operator connected message sent to user',
      );
    } catch (error) {
      this.logger.error(
        { error, userChatId: connection.userChatId, topicId },
        'Failed to send start dialog message to user',
      );
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

    this.logger.debug(
      { connectionId: connection.id, topicId },
      'Dialog connection deactivated in database',
    );

    try {
      await this.bot.telegram.editForumTopic(
        this.NOTIFICATION_GROUP_CHAT_ID,
        topicId,
        {
          name: connection.topicName.replace('🟢 ', ''),
        },
      );
    } catch (error) {
      this.logger.error({ error, topicId }, 'Failed to update topic name');
    }
  }

  async stopDialog(topicId: number) {
    this.logger.info({ topicId }, 'Stopping dialog');

    await this.stopDialogInternal(topicId);

    const connection = await this.prisma.topicConnection.findUnique({
      where: { topicId },
    });

    if (!connection) {
      this.logger.warn(
        { topicId },
        'Connection not found when stopping dialog',
      );
      return;
    }

    const topicContent = await this.topicContentService.get();
    const message =
      topicContent?.operatorDisconnectedMessage ||
      '👋 Оператор отключился от диалога.';

    try {
      await this.bot.telegram.sendMessage(connection.userChatId, message);
      this.logger.info(
        { userChatId: connection.userChatId, topicId },
        'Operator disconnected message sent to user',
      );
    } catch (error) {
      this.logger.error(
        { error, userChatId: connection.userChatId, topicId },
        'Failed to send stop dialog message to user',
      );
    }
  }
}
