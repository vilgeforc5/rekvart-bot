import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from './health.dto';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    return this.healthService.check();
  }
}
