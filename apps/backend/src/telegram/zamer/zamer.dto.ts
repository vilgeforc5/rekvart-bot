import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateZamerVariantDto {
  @IsString()
  text: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsBoolean()
  needsPhone?: boolean;
}

export class UpdateZamerVariantDto {
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

export class CreateZamerQuestionDto {
  @IsString()
  text: string;

  @IsString()
  type: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateZamerVariantDto)
  variants?: CreateZamerVariantDto[];
}

export class UpdateZamerQuestionDto {
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
  @Type(() => UpdateZamerVariantDto)
  variants?: UpdateZamerVariantDto[];
}

export class UpdateZamerSummaryDto {
  @IsString()
  message: string;
}

export class ZamerConfigDto {
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
