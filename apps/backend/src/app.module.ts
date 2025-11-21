import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
