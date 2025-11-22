import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.portfolio.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.portfolio.findUnique({
      where: { id },
    });
  }

  async create(data: CreatePortfolioDto) {
    return this.prisma.portfolio.create({
      data: {
        title: data.title,
        description: data.description,
        imgSrc: data.imgSrc,
      },
    });
  }

  async update(id: number, data: UpdatePortfolioDto) {
    return this.prisma.portfolio.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.portfolio.delete({
      where: { id },
    });
  }
}
