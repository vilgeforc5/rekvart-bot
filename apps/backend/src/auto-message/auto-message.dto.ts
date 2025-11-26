import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateAutoMessageConfigDto {
  @IsInt()
  @Min(0)
  @Max(23)
  scheduleHour: number;

  @IsInt()
  @Min(0)
  @Max(59)
  scheduleMinute: number;

  @IsOptional()
  @IsString()
  notificationText?: string;

  @IsOptional()
  @IsString()
  unsubscribeButtonText?: string;

  @IsOptional()
  @IsString()
  unsubscribeSuccessText?: string;

  @IsOptional()
  @IsString()
  resubscribeSuccessText?: string;

  @IsOptional()
  @IsString()
  resubscribeButtonText?: string;

  @IsOptional()
  @IsString()
  unsubscribeToggleText?: string;

  @IsOptional()
  @IsString()
  errorText?: string;
}

export class AutoMessageConfigResponseDto {
  id: number;
  scheduleHour: number;
  scheduleMinute: number;
  lastSentAt: Date | null;
  notificationText: string;
  unsubscribeButtonText: string;
  unsubscribeSuccessText: string;
  resubscribeSuccessText: string;
  resubscribeButtonText: string;
  unsubscribeToggleText: string;
  errorText: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BroadcastResultDto {
  sent: number;
  failed: number;
  unsubscribeShown: number;
}
