import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TelegramUsersService {
  constructor(private prisma: PrismaService) {}

  async upsertUser(data: {
    chatId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    return this.prisma.telegramUser.upsert({
      where: { chatId: data.chatId },
      update: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      },
      create: {
        chatId: data.chatId,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.telegramUser.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { formSubmissions: true },
          },
        },
      }),
      this.prisma.telegramUser.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.telegramUser.findUnique({
      where: { id },
    });
  }

  async findUserSubmissions(userId: number) {
    return this.prisma.formSubmission.findMany({
      where: { telegramUserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSubscription(chatId: string, isSubscribed: boolean) {
    return this.prisma.telegramUser.update({
      where: { chatId },
      data: { isSubscribedToAutomessage: isSubscribed },
    });
  }
}
