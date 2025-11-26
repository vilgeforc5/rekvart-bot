import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { PrismaClient } from '../prisma/generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger: PinoLogger;

  constructor(@InjectPinoLogger(PrismaService.name) logger: PinoLogger) {
    const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    super({
      adapter: pool,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
    
    this.logger = logger;

    this.$on('query' as never, (e: any) => {
      this.logger.debug(
        { query: e.query, params: e.params, duration: `${e.duration}ms` },
        'Database query executed',
      );
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error({ error: e }, 'Database error');
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn({ warning: e }, 'Database warning');
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.info('Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info('Database disconnected');
  }
}
