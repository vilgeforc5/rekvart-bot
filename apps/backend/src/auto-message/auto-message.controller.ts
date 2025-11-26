import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Protected } from 'src/auth/protected.decorator';
import {
  AutoMessageConfigResponseDto,
  BroadcastResultDto,
  UpdateAutoMessageConfigDto,
} from './auto-message.dto';
import { AutoMessageService } from './auto-message.service';

@Protected()
@Controller('api/auto-message')
export class AutoMessageController {
  constructor(
    @InjectPinoLogger(AutoMessageController.name)
    private readonly logger: PinoLogger,
    private readonly autoMessageService: AutoMessageService,
  ) {}

  @Get('config')
  async getConfig(): Promise<AutoMessageConfigResponseDto | null> {
    return this.autoMessageService.getConfig();
  }

  @Put('config')
  async updateConfig(
    @Body() dto: UpdateAutoMessageConfigDto,
  ): Promise<AutoMessageConfigResponseDto> {
    this.logger.info(
      { scheduleHour: dto.scheduleHour, scheduleMinute: dto.scheduleMinute },
      'Updating auto message config',
    );

    const texts = {
      notificationText: dto.notificationText,
      unsubscribeButtonText: dto.unsubscribeButtonText,
      unsubscribeSuccessText: dto.unsubscribeSuccessText,
      resubscribeSuccessText: dto.resubscribeSuccessText,
      resubscribeButtonText: dto.resubscribeButtonText,
      unsubscribeToggleText: dto.unsubscribeToggleText,
      errorText: dto.errorText,
    };

    const hasTexts = Object.values(texts).some((v) => v !== undefined);

    return this.autoMessageService.updateConfig(
      dto.scheduleHour,
      dto.scheduleMinute,
      hasTexts ? texts : undefined,
    );
  }

  @Post('broadcast')
  async testBroadcast(): Promise<BroadcastResultDto> {
    this.logger.info('Test broadcast triggered from dashboard');
    return this.autoMessageService.sendAutoMessages();
  }
}
