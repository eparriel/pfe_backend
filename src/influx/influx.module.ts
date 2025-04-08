import { Module } from '@nestjs/common';
import { InfluxService } from './influx.service';
import { InfluxController } from './influx.controller';
import { InfluxClientService } from './influx-client.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [InfluxController],
  providers: [InfluxService, InfluxClientService],
  exports: [InfluxService, InfluxClientService],
})
export class InfluxModule {} 