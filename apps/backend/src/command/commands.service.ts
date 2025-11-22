import { Injectable } from '@nestjs/common';
import { Command } from '../../prisma/generated/client';
import { PrismaService } from '../prisma.service';
import { CreateCommandDto, UpdateCommandDto } from './command.dto';

@Injectable()
export class BotCommandService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Command[]> {
    return this.prisma.command.findMany({
      orderBy: { index: 'asc' },
    });
  }

  async findOne(id: number): Promise<Command | null> {
    return this.prisma.command.findUnique({
      where: { id },
    });
  }

  async findByCommand(command: string): Promise<Command | null> {
    return this.prisma.command.findUnique({
      where: { command },
    });
  }

  async create(data: CreateCommandDto): Promise<Command> {
    return this.prisma.command.create({
      data: {
        command: data.command,
        title: data.title,
        description: data.description,
        index: data.index ?? 0,
      },
    });
  }

  async update(id: number, data: UpdateCommandDto): Promise<Command> {
    return this.prisma.command.update({
      where: { id },
      data,
    });
  }

  async upsert(data: CreateCommandDto): Promise<Command> {
    return this.prisma.command.upsert({
      where: { command: data.command },
      update: {
        title: data.title,
        description: data.description,
        index: data.index ?? 0,
      },
      create: {
        command: data.command,
        title: data.title,
        description: data.description,
        index: data.index ?? 0,
      },
    });
  }

  async delete(id: number): Promise<Command> {
    return this.prisma.command.delete({
      where: { id },
    });
  }

  async deleteByCommand(command: string): Promise<Command> {
    return this.prisma.command.delete({
      where: { command },
    });
  }
}
