import { Module } from '@nestjs/common';
import { ZamerCommand } from './zamer.command';

@Module({
  providers: [ZamerCommand],
})
export class ZamerModule {}
