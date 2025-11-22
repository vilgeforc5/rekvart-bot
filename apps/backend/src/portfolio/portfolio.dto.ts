import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  imgSrc: string[];
}

export class UpdatePortfolioDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  imgSrc?: string[];
}

export class PortfolioDto {
  id: number;
  title: string;
  description: string | null;
  imgSrc: string[];
  createdAt: Date;
  updatedAt: Date;
}
