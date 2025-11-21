import { Injectable } from '@nestjs/common';
import { Command } from '../../prisma/generated/client';
import { CreateCommandDto, UpdateCommandDto } from '../command/command.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BotCommandService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Command[]> {
    return this.prisma.command.findMany({
      orderBy: { command: 'asc' },
    });
  }

  async findEnabled(): Promise<Command[]> {
    return this.prisma.command.findMany({
      where: { enabled: true },
      orderBy: { command: 'asc' },
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
        description: data.description,
        enabled: data.enabled ?? true,
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
        description: data.description,
        enabled: data.enabled ?? true,
      },
      create: {
        command: data.command,
        description: data.description,
        enabled: data.enabled ?? true,
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
