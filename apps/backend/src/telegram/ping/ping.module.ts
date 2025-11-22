import { Module } from '@nestjs/common';
import { HealthModule } from 'src/health/health.module';
import { PingCommand } from './ping.command';

@Module({
  imports: [HealthModule],
  providers: [PingCommand],
})
export class PingModule {}
