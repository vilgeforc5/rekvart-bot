import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { transformAnswersToNamedKeys } from '../utils/form.utils';

export interface ConsultacyaQuestionWithVariants {
  id: number;
  text: string;
  type?: string | null;
  name: string | null;
  order: number;
  variants: {
    id: number;
    text: string;
    order: number;
    needsPhone: boolean;
  }[];
}

@Injectable()
export class ConsultacyaService {
  constructor(private prisma: PrismaService) {}

  async getAllQuestions(): Promise<ConsultacyaQuestionWithVariants[]> {
    return this.prisma.question.findMany({
      where: { formType: 'CONSULTACYA' },
      include: {
        variants: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    }) as unknown as ConsultacyaQuestionWithVariants[];
  }

  async getQuestion(
    order: number,
  ): Promise<ConsultacyaQuestionWithVariants | null> {
    return this.prisma.question.findUnique({
      where: {
        formType_order: {
          formType: 'CONSULTACYA',
          order: order,
        },
      },
      include: {
        variants: {
          orderBy: { order: 'asc' },
        },
      },
    }) as unknown as ConsultacyaQuestionWithVariants | null;
  }

  async createQuestion(data: {
    text: string;
    name?: string;
    order: number;
    variants?: { text: string; order: number; needsPhone?: boolean }[];
  }): Promise<ConsultacyaQuestionWithVariants> {
    return this.prisma.question.create({
      data: {
        text: data.text,
        name: data.name,
        order: data.order,
        formType: 'CONSULTACYA',
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
    }) as unknown as ConsultacyaQuestionWithVariants;
  }

  async updateQuestion(
    id: number,
    data: {
      text?: string;
      name?: string;
      order?: number;
      variants?: {
        id?: number;
        text: string;
        order: number;
        needsPhone?: boolean;
      }[];
    },
  ): Promise<ConsultacyaQuestionWithVariants> {
    const currentQuestion = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!currentQuestion || currentQuestion.formType !== 'CONSULTACYA') {
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
              formType: 'CONSULTACYA',
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
              formType: 'CONSULTACYA',
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
          name: data.name,
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
      }) as unknown as ConsultacyaQuestionWithVariants;
    });
  }

  async deleteQuestion(id: number): Promise<void> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question || question.formType !== 'CONSULTACYA') {
      return;
    }

    await this.prisma.question.delete({
      where: { id },
    });

    const questionsToUpdate = await this.prisma.question.findMany({
      where: {
        formType: 'CONSULTACYA',
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
    const summary = await this.prisma.consultacyaSummary.findUnique({
      where: { id: 1 },
    });
    return (
      summary?.message || '✅ Спасибо! Мы свяжемся с вами в ближайшее время'
    );
  }

  async updateSummary(message: string): Promise<void> {
    await this.prisma.consultacyaSummary.upsert({
      where: { id: 1 },
      create: { message },
      update: { message },
    });
  }

  async transformAnswersToNamedKeys(answers: {
    [key: number]: string;
  }): Promise<{ [key: string]: string }> {
    const questions = await this.getAllQuestions();
    return transformAnswersToNamedKeys(answers, questions);
  }
}
