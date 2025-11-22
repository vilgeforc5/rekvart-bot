import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateCalculateVariantDto {
  @IsString()
  text: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsBoolean()
  needsPhone?: boolean;
}

export class UpdateCalculateVariantDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  text: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsBoolean()
  needsPhone?: boolean;
}

export class CreateCalculateQuestionDto {
  @IsString()
  text: string;

  @IsString()
  type: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCalculateVariantDto)
  variants?: CreateCalculateVariantDto[];
}

export class UpdateCalculateQuestionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCalculateVariantDto)
  variants?: UpdateCalculateVariantDto[];
}

export class UpdateCalculateSummaryDto {
  @IsString()
  message: string;
}

export class CalculateConfigDto {
  questions: {
    id: number;
    text: string;
    type: string;
    order: number;
    variants: {
      id: number;
      text: string;
      order: number;
      needsPhone: boolean;
    }[];
  }[];
  summary: string;
}
