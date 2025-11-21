import { Controller, Get } from '@nestjs/common';
import { User } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }
}
