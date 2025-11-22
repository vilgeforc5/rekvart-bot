import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface ConsultacyaQuestionWithVariants {
  id: number;
  text: string;
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
    return this.prisma.consultacyaQuestion.findMany({
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
    return this.prisma.consultacyaQuestion.findUnique({
      where: { order },
      include: {
        variants: {
          orderBy: { order: 'asc' },
        },
      },
    }) as unknown as ConsultacyaQuestionWithVariants | null;
  }

  async createQuestion(data: {
    text: string;
    order: number;
    variants?: { text: string; order: number; needsPhone?: boolean }[];
  }): Promise<ConsultacyaQuestionWithVariants> {
    return this.prisma.consultacyaQuestion.create({
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
    }) as unknown as ConsultacyaQuestionWithVariants;
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
  ): Promise<ConsultacyaQuestionWithVariants> {
    if (data.variants) {
      await this.prisma.consultacyaVariant.deleteMany({
        where: { questionId: id },
      });
    }

    return this.prisma.consultacyaQuestion.update({
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
    }) as unknown as ConsultacyaQuestionWithVariants;
  }

  async deleteQuestion(id: number): Promise<void> {
    const question = await this.prisma.consultacyaQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      return;
    }

    await this.prisma.consultacyaQuestion.delete({
      where: { id },
    });

    const questionsToUpdate = await this.prisma.consultacyaQuestion.findMany({
      where: {
        order: {
          gt: question.order,
        },
      },
    });

    for (const q of questionsToUpdate) {
      await this.prisma.consultacyaQuestion.update({
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
}
