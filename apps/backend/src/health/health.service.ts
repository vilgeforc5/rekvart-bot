import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma.service';
import type { HealthCheckResult, HealthResponse } from './health.dto';

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async check(): Promise<HealthResponse> {
    const checks = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      checks: {
        database: await this.checkDatabase(),
        bot: await this.checkBot(),
      },
    };

    const allHealthy = Object.values(checks.checks).every(
      (check) => check.status === 'ok',
    );

    return {
      ...checks,
      status: allHealthy ? 'ok' : 'error',
    };
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok' as const,
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        status: 'error' as const,
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async checkBot(): Promise<HealthCheckResult> {
    try {
      await this.bot.telegram.getMe();
      return {
        status: 'ok' as const,
        message: 'Bot connection successful',
      };
    } catch (error) {
      return {
        status: 'error' as const,
        message: `Bot connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
