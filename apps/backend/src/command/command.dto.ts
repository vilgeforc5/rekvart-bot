import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import type { Command as PrismaCommand } from '../../prisma/generated/client';

export type Command = PrismaCommand;

export class CreateCommandDto {
  @IsString()
  @IsNotEmpty()
  command: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsOptional()
  index?: number;
}

export class UpdateCommandDto {
  @IsString()
  @IsOptional()
  command?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  index?: number;
}
