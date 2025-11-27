import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateConsultacyaVariantDto {
  @IsString()
  text: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsBoolean()
  needsPhone?: boolean;
}

export class UpdateConsultacyaVariantDto {
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

export class CreateConsultacyaQuestionDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateConsultacyaVariantDto)
  variants?: CreateConsultacyaVariantDto[];
}

export class UpdateConsultacyaQuestionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateConsultacyaVariantDto)
  variants?: UpdateConsultacyaVariantDto[];
}

export class UpdateConsultacyaSummaryDto {
  @IsString()
  message: string;
}

export class ConsultacyaConfigDto {
  questions: {
    id: number;
    text: string;
    type?: string | null;
    name?: string | null;
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
