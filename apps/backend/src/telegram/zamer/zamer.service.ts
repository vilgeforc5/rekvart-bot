import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface ZamerQuestionWithVariants {
  id: number;
  text: string;
  type: string;
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
    return this.prisma.zamerQuestion.findMany({
      include: {
        variants: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    }) as unknown as ZamerQuestionWithVariants[];
  }

  async getQuestion(order: number): Promise<ZamerQuestionWithVariants | null> {
    return this.prisma.zamerQuestion.findUnique({
      where: { order },
      include: {
        variants: {
          orderBy: { order: 'asc' },
        },
      },
    }) as unknown as ZamerQuestionWithVariants | null;
  }

  async createQuestion(data: {
    text: string;
    type: string;
    order: number;
    variants?: { text: string; order: number; needsPhone?: boolean }[];
  }): Promise<ZamerQuestionWithVariants> {
    return this.prisma.zamerQuestion.create({
      data: {
        text: data.text,
        type: data.type,
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
  }

  async updateQuestion(
    id: number,
    data: {
      text?: string;
      type?: string;
      order?: number;
      variants?: {
        id?: number;
        text: string;
        order: number;
        needsPhone?: boolean;
      }[];
    },
  ): Promise<ZamerQuestionWithVariants> {
    if (data.variants) {
      await this.prisma.zamerVariant.deleteMany({
        where: { questionId: id },
      });
    }

    return this.prisma.zamerQuestion.update({
      where: { id },
      data: {
        text: data.text,
        type: data.type,
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
  }

  async deleteQuestion(id: number): Promise<void> {
    const question = await this.prisma.zamerQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      return;
    }

    await this.prisma.zamerQuestion.delete({
      where: { id },
    });

    const questionsToUpdate = await this.prisma.zamerQuestion.findMany({
      where: {
        order: {
          gt: question.order,
        },
      },
    });

    for (const q of questionsToUpdate) {
      await this.prisma.zamerQuestion.update({
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
