import { IsNotEmpty, IsString } from 'class-validator';
import type { StartContent as PrismaStartContent } from '../../prisma/generated/client';

export type StartContent = PrismaStartContent;

export class UpsertStartContentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
