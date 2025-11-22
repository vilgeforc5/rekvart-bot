import { Module } from '@nestjs/common';
import { ZamerCommand } from './zamer.command';
import { ZamerService } from './zamer.service';

@Module({
  providers: [ZamerCommand, ZamerService],
})
export class ZamerModule {}
