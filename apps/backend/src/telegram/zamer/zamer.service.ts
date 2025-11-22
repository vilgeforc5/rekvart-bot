import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface ZamerQuestionWithVariants {
  id: number;
  text: string;
  type?: string | null;
  order: number;
  variants: {
    id: number;
    text: string;
    order: number;
    needsPhone: boolean;
  }[];
}

@Injectable()
export class ZamerService {
  constructor(private prisma: PrismaService) {}

  async getAllQuestions(): Promise<ZamerQuestionWithVariants[]> {
    return this.prisma.question.findMany({
      where: { formType: 'ZAMER' },
      include: {
        variants: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    }) as unknown as ZamerQuestionWithVariants[];
  }

  async getQuestion(order: number): Promise<ZamerQuestionWithVariants | null> {
    return this.prisma.question.findUnique({
      where: {
        formType_order: {
          formType: 'ZAMER',
          order: order,
        },
      },
      include: {
        variants: {
          orderBy: { order: 'asc' },
        },
      },
    }) as unknown as ZamerQuestionWithVariants | null;
  }

  async createQuestion(data: {
    text: string;
    order: number;
    variants?: { text: string; order: number; needsPhone?: boolean }[];
  }): Promise<ZamerQuestionWithVariants> {
    return this.prisma.question.create({
      data: {
        text: data.text,
        order: data.order,
        formType: 'ZAMER',
        variants: data.variants
          ? {
              create: data.variants,
            }
          : undefined,
      },
      include: {
        variants: {
          orderBy: { order: 'asc' },
        },
      },
    }) as unknown as ZamerQuestionWithVariants;
  }

  async updateQuestion(
    id: number,
    data: {
      text?: string;
      order?: number;
      variants?: {
        id?: number;
        text: string;
        order: number;
        needsPhone?: boolean;
      }[];
    },
  ): Promise<ZamerQuestionWithVariants> {
    const currentQuestion = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!currentQuestion || currentQuestion.formType !== 'ZAMER') {
      throw new Error('Question not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      if (data.order !== undefined && data.order !== currentQuestion.order) {
        const oldOrder = currentQuestion.order;
        const newOrder = data.order;

        await tx.question.update({
          where: { id },
          data: { order: -1 },
        });

        if (newOrder < oldOrder) {
          await tx.question.updateMany({
            where: {
              formType: 'ZAMER',
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });
        } else {
          await tx.question.updateMany({
            where: {
              formType: 'ZAMER',
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            data: {
              order: {
                decrement: 1,
              },
            },
          });
        }
      }

      if (data.variants) {
        await tx.questionVariant.deleteMany({
          where: { questionId: id },
        });
      }

      return tx.question.update({
        where: { id },
        data: {
          text: data.text,
          order: data.order,
          variants: data.variants
            ? {
                create: data.variants,
              }
            : undefined,
        },
        include: {
          variants: {
            orderBy: { order: 'asc' },
          },
        },
      }) as unknown as ZamerQuestionWithVariants;
    });
  }

  async deleteQuestion(id: number): Promise<void> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question || question.formType !== 'ZAMER') {
      return;
    }

    await this.prisma.question.delete({
      where: { id },
    });

    const questionsToUpdate = await this.prisma.question.findMany({
      where: {
        formType: 'ZAMER',
        order: {
          gt: question.order,
        },
      },
    });

    for (const q of questionsToUpdate) {
      await this.prisma.question.update({
        where: { id: q.id },
        data: { order: q.order - 1 },
      });
    }
  }

  async getSummary(): Promise<string> {
    const summary = await this.prisma.zamerSummary.findUnique({
      where: { id: 1 },
    });
    return (
      summary?.message || '✅ Спасибо! Мы свяжемся с вами в ближайшее время'
    );
  }

  async updateSummary(message: string): Promise<void> {
    await this.prisma.zamerSummary.upsert({
      where: { id: 1 },
      create: { message },
      update: { message },
    });
  }
}
