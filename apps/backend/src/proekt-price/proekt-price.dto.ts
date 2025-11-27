import { IsNotEmpty, IsString } from 'class-validator';
import type { ProektPriceContent as PrismaProektPriceContent } from '../../prisma/generated/client';

export type ProektPriceContent = PrismaProektPriceContent;

export class UpsertProektPriceContentDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
