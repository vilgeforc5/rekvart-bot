import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { Command as PrismaCommand } from '../../prisma/generated/client';

export type Command = PrismaCommand;

export class CreateCommandDto {
  @IsString()
  @IsNotEmpty()
  command: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class UpdateCommandDto {
  @IsString()
  @IsOptional()
  command?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
