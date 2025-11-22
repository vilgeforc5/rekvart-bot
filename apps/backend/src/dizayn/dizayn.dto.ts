import { IsNotEmpty, IsString } from 'class-validator';
import type { DizaynContent as PrismaDizaynContent } from '../../prisma/generated/client';

export type DizaynContent = PrismaDizaynContent;

export class UpsertDizaynContentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  telegramUrl: string;

  @IsString()
  @IsNotEmpty()
  whatsappUrl: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
